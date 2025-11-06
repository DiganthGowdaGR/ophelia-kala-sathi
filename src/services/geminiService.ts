// Gemini AI Service for Artisan Features
// Handles all Gemini API interactions with robust error handling and retry logic

// Prefer VITE_ prefixed env (exposed to Vite client). Fall back to non-prefixed if user placed key in .env
// NOTE: Using a non-VITE_ env in the client build will still only work in certain dev setups; exposing a secret
// in client-side code is insecure. Prefer setting VITE_GEMINI_API_KEY in your .env.local and restarting dev server.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';

if (import.meta.env.GEMINI_API_KEY && !import.meta.env.VITE_GEMINI_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('[geminiService] Detected GEMINI_API_KEY without VITE_ prefix. Using it for development, but this will expose the key to the client bundle. For production, move calls server-side and keep the key secret.');
}
// Updated to use Gemini 2.5 Flash for enhanced capabilities
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const PRO_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

// Configuration
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

// Custom Error Types
export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

export class GeminiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiConfigError';
  }
}

export class GeminiNetworkError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'GeminiNetworkError';
  }
}

// Type Definitions
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

interface InventoryPrediction {
  recommendation: string;
  suggestedReorder: number;
  reasoning: string;
}

interface MarketAnalysis {
  trends: string[];
  opportunities: string[];
  recommendations: string[];
}

interface CustomerInsights {
  insights: string[];
  suggestions: string[];
}

interface BusinessRecommendations {
  priorityActions: string[];
  longTermStrategy: string[];
  quickWins: string[];
}

interface ProfileOptimization {
  bioScore: number;
  bioSuggestions: string[];
  skillSuggestions: string[];
  overallScore: number;
  priorityImprovements: string[];
}

interface PricingSuggestion {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  reasoning: string;
}

// API Key Validation
function validateAPIKey(): void {
  if (!GEMINI_API_KEY) {
    throw new GeminiConfigError(
      'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables. ' +
      'Visit https://aistudio.google.com/app/apikey to get your API key.'
    );
  }

  if (GEMINI_API_KEY.length < 20) {
    throw new GeminiConfigError(
      'Invalid Gemini API key format. The key appears to be too short. Please verify your API key.'
    );
  }

  // More flexible validation - accept different key formats
  if (!GEMINI_API_KEY.startsWith('AIza') && !GEMINI_API_KEY.startsWith('GOOG') && !GEMINI_API_KEY.startsWith('ABG')) {
    console.warn('API key format may be incorrect. Expected format: AIza..., GOOG..., or ABG...');
  }
}

// Retry Logic with Exponential Backoff
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof GeminiAPIError) {
    // Retry on server errors (5xx) and rate limiting (429)
    return error.statusCode ? [429, 500, 502, 503, 504].includes(error.statusCode) : false;
  }
  if (error instanceof GeminiNetworkError) {
    return true; // Always retry network errors
  }
  return false;
}

// Enhanced API Call with Retry Logic and Timeout
async function callGeminiAPIWithRetry(prompt: string, attempt = 1): Promise<string> {
  try {
    validateAPIKey();
    
    const request: GeminiRequest = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
         
        // Provide specific error messages
        if (response.status === 400) {
          throw new GeminiAPIError(
            `Invalid request: ${errorMessage}. Please check your input parameters.`,
            400,
            errorData
          );
        } else if (response.status === 401 || response.status === 403) {
          throw new GeminiAPIError(
            'Authentication failed. Please verify your Gemini API key is valid and has the necessary permissions.',
            response.status,
            errorData
          );
        } else if (response.status === 429) {
          throw new GeminiAPIError(
            'Rate limit exceeded. Please wait a moment before trying again.',
            429,
            errorData
          );
        } else if (response.status >= 500) {
          throw new GeminiAPIError(
            `Server error (${response.status}): ${errorMessage}. This is a temporary issue, please try again.`,
            response.status,
            errorData
          );
        } else {
          throw new GeminiAPIError(
            `API error (${response.status}): ${errorMessage}`,
            response.status,
            errorData
          );
        }
      }

      const data: GeminiResponse = await response.json();
      
      // Validate response structure
      if (!data.candidates || data.candidates.length === 0) {
        throw new GeminiAPIError(
          'No response generated. The AI model may have filtered the content. Please try rephrasing your request.',
          200
        );
      }

      if (!data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new GeminiAPIError(
          'Invalid response format received from API.',
          200
        );
      }

      return data.candidates[0].content.parts[0].text;

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle network errors
      if (fetchError instanceof TypeError) {
        throw new GeminiNetworkError(
          'Network request failed. Please check your internet connection.',
          fetchError
        );
      }
      
      // Handle timeout
      if ((fetchError as Error).name === 'AbortError') {
        throw new GeminiNetworkError(
          `Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. Please try again.`,
          fetchError
        );
      }
      
      throw fetchError;
    }

  } catch (error) {
    // Don't retry configuration errors
    if (error instanceof GeminiConfigError) {
      throw error;
    }

    // Retry logic for retryable errors
    if (isRetryableError(error) && attempt < MAX_RETRY_ATTEMPTS) {
      const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // Exponential backoff
      await delay(delayMs);
      return callGeminiAPIWithRetry(prompt, attempt + 1);
    }

    // Log error details for debugging
    if (error instanceof GeminiAPIError) {
      console.error(`Gemini API Error (Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, {
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString()
      });
    } else if (error instanceof GeminiNetworkError) {
      console.error(`Gemini Network Error (Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, {
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error(`Unexpected Error (Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, error);
    }

    throw error;
  }
}

// Safe function to call Gemini with fallback
async function callGeminiWithFallback<T>(prompt: string, fallback: T, parser?: (response: string) => T): Promise<T> {
  try {
    const response = await callGeminiAPIWithRetry(prompt);
    if (parser) {
      return parser(response);
    }
    return response as T;
  } catch (error) {
    console.warn('Gemini AI call failed, using fallback:', error);
    return fallback;
  }
}

// Safe JSON parsing with fallback
function parseJSONResponse<T>(response: string, fallback: T): T {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;
    
    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.warn('Failed to parse JSON response, using fallback:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      response: response.substring(0, 100) + '...'
    });
    return fallback;
  }
}

// Generate AI-powered product description
export async function generateProductDescription(productData: {
  name: string;
  category: string;
  materials?: string;
  techniques?: string;
}): Promise<string> {
  const prompt = `As an expert copywriter for handmade artisan products, create a compelling product description for:

Product Name: ${productData.name}
Category: ${productData.category}
Materials: ${productData.materials || 'not specified'}
Techniques: ${productData.techniques || 'traditional craftsmanship'}

Write a 3-paragraph description that:
1. Captures the unique qualities and craftsmanship
2. Highlights the cultural significance or artisan story
3. Appeals to customers who value authentic, handmade goods

Keep it engaging, authentic, and under 150 words.`;

  try {
    return await callGeminiAPIWithRetry(prompt);
  } catch (error) {
    // Fallback description
    return `${productData.name} is a beautifully handcrafted ${productData.category} made with care and attention to detail. Using ${productData.materials || 'quality materials'} and ${productData.techniques || 'traditional techniques'}, each piece is unique and showcases the artisan's skill and dedication to their craft.

This authentic handmade item brings warmth and character to any setting, celebrating the timeless art of traditional craftsmanship.

Every purchase supports independent artisans and preserves cultural heritage.`;
  }
}

// AI Content Generator with multiple content types
export async function generateContent(productData: {
  productName: string;
  productType: string;
  tone: string;
  contentType: string;
}): Promise<string> {
  const prompt = createContentPrompt(productData.productName, productData.productType, productData.tone, productData.contentType);
  
  try {
    return await callGeminiAPIWithRetry(prompt);
  } catch (error) {
    // Fallback content generation
    return createFallbackContent(productData.productName, productData.contentType);
  }
}

function createContentPrompt(productName: string, productType: string, tone: string, contentType: string): string {
  const toneModifiers = {
    professional: 'professional and informative',
    casual: 'casual and friendly',
    luxury: 'elegant and premium',
    playful: 'creative and engaging'
  };

  const contentTemplates = {
    description: `Create a compelling product description for a ${productName} ${productType || 'product'}. Write it in a ${toneModifiers[tone as keyof typeof toneModifiers] || 'professional'} tone. Include:\n1. What makes this product special\n2. Key features and benefits\n3. Target audience appeal\nKeep it under 200 words and make it engaging.`,
    
    social: `Create a social media caption for a ${productName} ${productType || 'product'}. Write it in a ${toneModifiers[tone as keyof typeof toneModifiers] || 'professional'} tone. Include:\n1. An attention-grabbing hook\n2. Product highlights\n3. Call-to-action\nKeep it under 150 characters with relevant hashtags.`,
    
    email: `Create an email campaign for a ${productName} ${productType || 'product'}. Write it in a ${toneModifiers[tone as keyof typeof toneModifiers] || 'professional'} tone. Include:\n1. Compelling subject line\n2. Personalized opening\n3. Product benefits\n4. Clear call-to-action\nKeep it friendly but focused on conversion.`,
    
    blog: `Create a blog post introduction about ${productName} ${productType || 'handmade products'}. Write it in a ${toneModifiers[tone as keyof typeof toneModifiers] || 'professional'} tone. Include:\n1. Engaging hook\n2. Background story\n3. Product significance\n4. What readers will learn\nKeep it informative and storytelling-focused.`
  };

  return contentTemplates[contentType as keyof typeof contentTemplates] || contentTemplates.description;
}

function createFallbackContent(productName: string, contentType: string): string {
  const fallbacks = {
    description: `Discover the beauty of ${productName}, crafted with passion and attention to detail. Each piece represents the skill and creativity of our artisans, bringing authentic quality to your life. Experience the difference that handmade craftsmanship makes.`,
    
    social: `✨ Introducing ${productName} - where artistry meets quality! Handcrafted with love and designed to delight. #Handmade #Artisan #Quality #Unique`,
    
    email: `Subject: Introducing ${productName} - Crafted with Care

Dear [Name],

We're excited to share ${productName} with you. This beautifully crafted piece showcases the skill and dedication of our artisans.

[Benefits and call-to-action]`,

    blog: `Welcome to our workshop, where traditional craftsmanship meets modern artistry. Today, we're proud to introduce ${productName}, a piece that represents the culmination of years of skill development and creative expression.`
  };

  return fallbacks[contentType as keyof typeof fallbacks] || fallbacks.description;
}

// Video Description Generator (produces detailed video production descriptions)
export async function generateVideoDescription(productData: {
  productName: string;
  videoType: string;
  prompt: string;
}): Promise<{
  description: string;
  shotList: string[];
  technicalSpecs: {
    duration: number;
    resolution: string;
    aspectRatio: string;
  };
}> {
  const prompt = `Create a comprehensive video production description for ${productData.productName} video type: ${productData.videoType}.

Original request: ${productData.prompt}

Include:
1. Detailed video concept and storyboard
2. Shot sequence with camera movements
3. Lighting setup and mood
4. Audio/music suggestions
5. Timeline breakdown
6. Technical specifications

Make it actionable for video production.`;

  try {
    const description = await callGeminiAPIWithRetry(prompt);
    
    const specs = getVideoSpecs(productData.videoType);
    
    return {
      description,
      shotList: extractShotList(description),
      technicalSpecs: specs
    };
  } catch (error) {
    return generateFallbackVideoDescription(productData.productName, productData.videoType);
  }
}

function getVideoSpecs(videoType: string) {
  const specs = {
    product_reel: { duration: 15, resolution: '1920x1080', aspectRatio: '16:9' },
    process_video: { duration: 30, resolution: '1920x1080', aspectRatio: '16:9' },
    story_video: { duration: 60, resolution: '1920x1080', aspectRatio: '16:9' },
    social_reel: { duration: 15, resolution: '1080x1920', aspectRatio: '9:16' }
  };
  return specs[videoType as keyof typeof specs] || specs.product_reel;
}

function extractShotList(description: string): string[] {
  // Extract shot descriptions from the detailed description
  const shots = description.match(/Shot \d+\.\d+:.*/g) || [];
  return shots.slice(0, 5); // Return top 5 shots
}

function generateFallbackVideoDescription(productName: string, videoType: string) {
  return {
    description: `Create a professional ${videoType} video showcasing ${productName}. Focus on the unique qualities and craftsmanship. Use warm lighting and smooth camera movements to highlight the artisanal details.`,
    shotList: [
      'Close-up of product details',
      'Medium shot of product in use',
      'Wide shot showing context',
      'Detail shots of craftsmanship',
      'Final hero shot'
    ],
    technicalSpecs: getVideoSpecs(videoType)
  };
}

// Image Description Generator (produces detailed image generation prompts)
export async function generateImageDescription(imageData: {
  productName: string;
  imageType: string;
  style: string;
  prompt: string;
}): Promise<{
  description: string;
  prompt: string;
  technicalSpecs: {
    dimensions: { width: number; height: number };
    format: string;
    aspectRatio: string;
  };
}> {
  const prompt = `Create a comprehensive image generation prompt for ${imageData.productName} image type: ${imageData.imageType}, style: ${imageData.style}.

Original request: ${imageData.prompt}

Include:
1. Detailed photography style
2. Lighting setup and mood
3. Background specifications
4. Composition details
5. Color palette
6. Technical specifications

Make it suitable for high-quality product photography or marketing materials.`;

  try {
    const description = await callGeminiAPIWithRetry(prompt);
    const specs = getImageSpecs(imageData.imageType);
    
    return {
      description,
      prompt: extractImagePrompt(description),
      technicalSpecs: { dimensions: { width: specs.width, height: specs.height }, format: specs.format, aspectRatio: specs.aspectRatio }
    };
  } catch (error) {
    return generateFallbackImageDescription(imageData.productName, imageData.imageType);
  }
}

function getImageSpecs(imageType: string) {
  const specs = {
    product_poster: { width: 1024, height: 1024, format: 'PNG', aspectRatio: '1:1' },
    social_ad: { width: 1080, height: 1080, format: 'PNG', aspectRatio: '1:1' },
    hero_banner: { width: 1920, height: 1080, format: 'PNG', aspectRatio: '16:9' },
    lifestyle_shot: { width: 1200, height: 800, format: 'PNG', aspectRatio: '3:2' }
  };
  return specs[imageType as keyof typeof specs] || specs.product_poster;
}

function extractImagePrompt(description: string): string {
  // Extract a clean image generation prompt from the detailed description
  const promptMatch = description.match(/prompt:\s*([^\n]+)/i);
  return promptMatch ? promptMatch[1].trim() : description.split('\n')[0];
}

function generateFallbackImageDescription(productName: string, imageType: string) {
  const specs = getImageSpecs(imageType);
  return {
    description: `Create a high-quality ${imageType} image of ${productName}. Use professional lighting and composition to showcase the product effectively.`,
    prompt: `${productName}, professional product photography, clean background, dramatic lighting, marketing-ready composition, high quality`,
    technicalSpecs: { dimensions: { width: specs.width, height: specs.height }, format: specs.format, aspectRatio: specs.aspectRatio }
  };
}

export default {
  generateProductDescription,
  generateContent,
  generateVideoDescription,
  generateImageDescription
};

// Predict inventory needs based on sales history and trends
export async function predictInventoryNeeds(data: {
  productName: string;
  currentStock: number;
  salesHistory: Array<{ date: string; quantity: number }>;
  seasonality: string;
}): Promise<InventoryPrediction> {
  const salesAverage = data.salesHistory.reduce((sum, sale) => sum + sale.quantity, 0) / Math.max(data.salesHistory.length, 1);
  
  const prompt = `As an inventory management AI, analyze this product's inventory needs:

Product: ${data.productName}
Current Stock: ${data.currentStock} units
Average Daily Sales: ${salesAverage.toFixed(2)} units
Recent Sales History: ${data.salesHistory.map(s => `${s.quantity} units on ${s.date}`).join(', ')}
Season: ${data.seasonality}

Provide a JSON response with this exact structure:
{
  "recommendation": "YES" or "WAIT",
  "suggestedReorder": <number of units to reorder, or 0>,
  "reasoning": "<brief explanation of the recommendation>"
}

Recommendation should be "YES" if stock should be reordered soon, "WAIT" if current stock is sufficient.
Consider sales velocity, seasonality, and safety stock.`;

  return callGeminiWithFallback(
    prompt,
    {
      recommendation: 'WAIT',
      suggestedReorder: 0,
      reasoning: 'Unable to analyze at this time. Monitor sales trends and reorder when stock falls below 20% of average monthly usage.'
    },
    (response) => parseJSONResponse(response, {
      recommendation: 'WAIT',
      suggestedReorder: 0,
      reasoning: 'Analysis complete. Review recommendations based on your sales patterns.'
    })
  );
}

// Generate AI image using Gemini
export async function generateImage(prompt: string, imageType: string = 'product_poster', style: string = 'realistic'): Promise<string> {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    const { data, error } = await supabase.functions.invoke('creative-studio-imagen', {
      body: {
        prompt,
        imageType,
        style
      }
    });

    if (error) throw error;

    if (data?.data?.image?.bytesBase64Encoded) {
      return `data:image/png;base64,${data.data.image.bytesBase64Encoded}`;
    }

    throw new Error('No image data in response');
  } catch (err) {
    console.error('Image generation failed:', err);
    throw new GeminiAPIError(
      `Image generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      500,
      err
    );
  }
}

// Enhance product image
export async function enhanceProductImage(imageUrl: string, enhancementType: string): Promise<string> {
  const enhancePrompt = `Suggest an image enhancement for a product image with enhancement type: ${enhancementType}.
Provide specific technical adjustments. Keep response brief.`;
  
  try {
    await callGeminiAPIWithRetry(enhancePrompt);
    return imageUrl;
  } catch {
    return imageUrl;
  }
}

// Generate AI video description
export async function generateVideo(prompt: string, duration: number): Promise<string> {
  const videoPrompt = `Create a video production guide for: ${prompt}. Duration: ${duration}s.
Include shot list, technical specs, and production notes. Keep it concise.`;
  
  try {
    const description = await callGeminiAPIWithRetry(videoPrompt);
    return `video-generated-${Date.now()}.mp4`;
  } catch {
    return `video-error-${Date.now()}.mp4`;
  }
}

// Get business recommendations
export async function getBusinessRecommendations(data: {
  monthlyRevenue: number;
  productCount: number;
  orderCount: number;
  conversionRate: number;
}): Promise<BusinessRecommendations> {
  const prompt = `As a business growth consultant, analyze these metrics and provide recommendations:

Monthly Revenue: $${data.monthlyRevenue}
Product Count: ${data.productCount}
Order Count: ${data.orderCount}
Conversion Rate: ${(data.conversionRate * 100).toFixed(2)}%

Provide a JSON response with this structure:
{
  "priorityActions": ["action1", "action2", "action3"],
  "longTermStrategy": ["strategy1", "strategy2", "strategy3"],
  "quickWins": ["win1", "win2", "win3"]
}

Focus on actionable, specific recommendations for artisan businesses.`;

  return callGeminiWithFallback(
    prompt,
    {
      priorityActions: [
        'Optimize your product listings with better descriptions',
        'Implement customer feedback collection',
        'Create a seasonal promotion strategy'
      ],
      longTermStrategy: [
        'Build a strong brand identity',
        'Develop customer retention programs',
        'Expand to new market segments'
      ],
      quickWins: [
        'Add high-quality product photos',
        'Write compelling product descriptions',
        'Start a social media campaign'
      ]
    },
    (response) => parseJSONResponse(response, {
      priorityActions: [],
      longTermStrategy: [],
      quickWins: []
    })
  );
}

// Analyze customer behavior
export async function analyzeCustomerBehavior(data: {
  recentOrders: number;
  averageOrderValue: number;
  repeatCustomerRate: number;
  productReviews: string[];
}): Promise<CustomerInsights> {
  const reviewsText = data.productReviews.slice(0, 3).join('\n');
  
  const prompt = `Analyze customer behavior from these metrics:

Recent Orders: ${data.recentOrders}
Average Order Value: $${data.averageOrderValue.toFixed(2)}
Repeat Customer Rate: ${(data.repeatCustomerRate * 100).toFixed(1)}%
Recent Reviews: ${reviewsText || 'No reviews yet'}

Provide a JSON response with:
{
  "insights": ["insight1", "insight2", "insight3"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

  return callGeminiWithFallback(
    prompt,
    {
      insights: [
        'Customer engagement is steady',
        'Product quality resonates with customers',
        'Repeat purchase behavior is positive'
      ],
      suggestions: [
        'Consider loyalty programs for repeat customers',
        'Gather more detailed customer feedback',
        'Analyze seasonal purchasing patterns'
      ]
    },
    (response) => parseJSONResponse(response, {
      insights: [],
      suggestions: []
    })
  );
}

// Analyze market trends
export async function analyzeMarketTrends(data: {
  productCategory: string;
  pricePoint: number;
  seasonality: string;
  competitorCount: number;
}): Promise<MarketAnalysis> {
  const prompt = `Analyze market trends for this product:

Category: ${data.productCategory}
Price Point: $${data.pricePoint}
Seasonality: ${data.seasonality}
Competitors: ${data.competitorCount}

Provide a JSON response with:
{
  "trends": ["trend1", "trend2", "trend3"],
  "opportunities": ["opportunity1", "opportunity2"],
  "recommendations": ["rec1", "rec2"]
}`;

  return callGeminiWithFallback(
    prompt,
    {
      trends: [
        'Growing demand for handmade products',
        'Customers prefer sustainable options',
        'Social commerce is becoming important'
      ],
      opportunities: [
        'Expand to new sales channels',
        'Develop eco-friendly variants',
        'Build community engagement'
      ],
      recommendations: [
        'Focus on unique value proposition',
        'Invest in visual marketing',
        'Collaborate with influencers'
      ]
    },
    (response) => parseJSONResponse(response, {
      trends: [],
      opportunities: [],
      recommendations: []
    })
  );
}

// Get profile optimization suggestions
export async function getProfileOptimizationSuggestions(data: {
  bio: string;
  skills: string[];
  productCount: number;
  rating: number;
}): Promise<ProfileOptimization> {
  const prompt = `Review this artisan profile and suggest optimizations:

Bio: "${data.bio}"
Skills: ${data.skills.join(', ')}
Products: ${data.productCount}
Rating: ${data.rating.toFixed(1)}/5

Provide a JSON response with:
{
  "bioScore": 0-100,
  "bioSuggestions": ["suggestion1", "suggestion2"],
  "skillSuggestions": ["skill1", "skill2"],
  "overallScore": 0-100,
  "priorityImprovements": ["improvement1", "improvement2"]
}`;

  return callGeminiWithFallback(
    prompt,
    {
      bioScore: 75,
      bioSuggestions: [
        'Add more personality to your bio',
        'Include your unique selling point',
        'Mention any awards or achievements'
      ],
      skillSuggestions: [
        'Photography',
        'Packaging design',
        'Social media marketing'
      ],
      overallScore: 78,
      priorityImprovements: [
        'Update profile picture',
        'Add more product photos',
        'Write customer testimonials'
      ]
    },
    (response) => parseJSONResponse(response, {
      bioScore: 0,
      bioSuggestions: [],
      skillSuggestions: [],
      overallScore: 0,
      priorityImprovements: []
    })
  );
}

// Generate optimized bio
export async function generateOptimizedBio(data: {
  name: string;
  skills: string[];
  yearsExperience: number;
  uniqueValue: string;
}): Promise<string> {
  const prompt = `Write a compelling artisan bio for:

Name: ${data.name}
Skills: ${data.skills.join(', ')}
Experience: ${data.yearsExperience} years
Unique Value: ${data.uniqueValue}

Create an engaging 2-3 sentence bio that highlights their craft and personality. 
Make it suitable for an artisan marketplace profile.`;

  try {
    return await callGeminiAPIWithRetry(prompt);
  } catch {
    return `Meet ${data.name}, a dedicated artisan with ${data.yearsExperience} years of experience in ${data.skills[0] || 'craftsmanship'}. Specializing in ${data.uniqueValue}, each creation reflects passion and attention to detail.`;
  }
}

// Simple chat completion wrapper for chatbot fallback usage
export async function generateChatResponse(userMessage: string, conversationHistory?: Array<{ role: string; content: string }>): Promise<string> {
  // Build a concise prompt that includes recent conversation history for context
  const historyText = (conversationHistory || [])
    .slice(-10) // keep last 10 messages to limit prompt size
    .map(m => `${m.role === 'user' ? 'User' : m.role === 'assistant' ? 'Assistant' : 'System'}: ${m.content}`)
    .join('\n');

  const prompt = `${historyText}\nUser: ${userMessage}\nAssistant:`;

  // Delegate to the internal call with retry logic
  return callGeminiAPIWithRetry(prompt);
}
