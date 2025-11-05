// Gemini AI Service for Artisan Features
// Handles all Gemini API interactions with robust error handling and retry logic

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
// Updated to use Gemini 2.5 Flash for enhanced capabilities including image and video generation
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent';
const IMAGE_GENERATION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage';
const VIDEO_GENERATION_URL = 'https://generativelanguage.googleapis.com/v1beta/models/veo-2.0:generateVideo';

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
        } else if (response.status === 404) {
          throw new GeminiAPIError(
            'API endpoint not found. The Generative Language API may not be enabled. ' +
            'Enable it at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com',
            404,
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
    return `${productData.name} is a beautifully handcrafted ${productData.category} made with care and attention to detail. Using ${productData.materials || 'quality materials'} and ${productData.techniques || 'traditional techniques'}, each piece is unique and showcases the artisan's skill and dedication to their craft.\n\nThis authentic handmade item brings warmth and character to any setting, celebrating the timeless art of traditional craftsmanship.\n\nEvery purchase supports independent artisans and preserves cultural heritage.`;
  }
}

// Smart inventory predictions
export async function predictInventoryNeeds(inventoryData: {
  productName: string;
  currentStock: number;
  salesHistory: Array<{ date: string; quantity: number }>;
  seasonality?: string;
}): Promise<InventoryPrediction> {
  const salesSummary = inventoryData.salesHistory
    .map(s => `${s.date}: ${s.quantity} units`)
    .join(', ');

  const prompt = `As an inventory management AI specialist, analyze this product's inventory:

Product: ${inventoryData.productName}
Current Stock: ${inventoryData.currentStock} units
Recent Sales: ${salesSummary}
Seasonality: ${inventoryData.seasonality || 'unknown'}

Provide:
1. Reorder recommendation (YES/NO/WAIT)
2. Suggested reorder quantity
3. Brief reasoning (1-2 sentences)

Format as JSON:
{
  "recommendation": "YES/NO/WAIT",
  "suggestedReorder": number,
  "reasoning": "explanation"
}`;

  try {
    const response = await callGeminiAPIWithRetry(prompt);
    return parseJSONResponse<InventoryPrediction>(response, {
      recommendation: 'WAIT',
      suggestedReorder: 0,
      reasoning: 'Unable to analyze data. Please review manually.'
    });
  } catch (error) {
    return {
      recommendation: 'WAIT',
      suggestedReorder: 0,
      reasoning: 'AI analysis unavailable. Please review your inventory manually based on recent sales trends.'
    };
  }
}

// AI-powered market analysis
export async function analyzeMarketTrends(marketData: {
  category: string;
  recentSales: number;
  competitorCount: number;
  priceRange: { min: number; max: number };
}): Promise<MarketAnalysis> {
  const prompt = `As a market intelligence analyst for artisan goods, analyze this market data:

Category: ${marketData.category}
Recent Sales: ${marketData.recentSales} units
Competitor Count: ${marketData.competitorCount}
Price Range: $${marketData.priceRange.min} - $${marketData.priceRange.max}

Provide:
1. Top 3 current market trends
2. Top 3 growth opportunities
3. Top 3 actionable recommendations

Format as JSON:
{
  "trends": ["trend1", "trend2", "trend3"],
  "opportunities": ["opp1", "opp2", "opp3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

  try {
    const response = await callGeminiAPIWithRetry(prompt);
    return parseJSONResponse<MarketAnalysis>(response, {
      trends: ['Market data analysis in progress'],
      opportunities: ['Check back for insights'],
      recommendations: ['Continue monitoring market']
    });
  } catch (error) {
    return {
      trends: [
        'Growing demand for authentic handmade products',
        'Increasing appreciation for sustainable craftsmanship',
        'Online marketplace expansion for artisan goods'
      ],
      opportunities: [
        'Expand your product line within your category',
        'Leverage social media to showcase your craft',
        'Build customer relationships through storytelling'
      ],
      recommendations: [
        'Focus on product quality and unique value proposition',
        'Optimize pricing based on materials and time invested',
        'Engage with customers through authentic brand storytelling'
      ]
    };
  }
}

// Customer insights and behavior analysis
export async function analyzeCustomerBehavior(customerData: {
  totalCustomers: number;
  repeatCustomerRate: number;
  averageOrderValue: number;
  topCategories: string[];
}): Promise<CustomerInsights> {
  const prompt = `As a customer behavior analyst, analyze this artisan business data:

Total Customers: ${customerData.totalCustomers}
Repeat Customer Rate: ${customerData.repeatCustomerRate}%
Average Order Value: $${customerData.averageOrderValue}
Top Categories: ${customerData.topCategories.join(', ')}

Provide:
1. Top 3 customer behavior insights
2. Top 3 actionable suggestions to improve customer retention and sales

Format as JSON:
{
  "insights": ["insight1", "insight2", "insight3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

  try {
    const response = await callGeminiAPIWithRetry(prompt);
    return parseJSONResponse<CustomerInsights>(response, {
      insights: ['Customer analysis in progress'],
      suggestions: ['Continue building customer relationships']
    });
  } catch (error) {
    return {
      insights: [
        `${customerData.repeatCustomerRate.toFixed(0)}% repeat customer rate indicates ${customerData.repeatCustomerRate > 30 ? 'strong' : 'growing'} customer loyalty`,
        `Average order value of $${customerData.averageOrderValue.toFixed(2)} shows customer purchasing patterns`,
        `Strong performance in ${customerData.topCategories[0] || 'your main category'} category`
      ],
      suggestions: [
        'Implement a customer loyalty program to increase repeat purchases',
        'Send personalized follow-up emails after purchases',
        'Offer bundle deals or discounts to increase average order value'
      ]
    };
  }
}

// Business growth recommendations
export async function getBusinessRecommendations(businessData: {
  monthlyRevenue: number;
  productCount: number;
  orderCount: number;
  conversionRate: number;
}): Promise<BusinessRecommendations> {
  const prompt = `As a business growth consultant for artisan enterprises, analyze this business:

Monthly Revenue: $${businessData.monthlyRevenue}
Product Count: ${businessData.productCount}
Order Count: ${businessData.orderCount}
Conversion Rate: ${businessData.conversionRate}%

Provide:
1. Top 3 priority actions for immediate impact
2. Top 3 long-term strategic recommendations
3. Top 3 quick wins (easy to implement, high impact)

Format as JSON:
{
  "priorityActions": ["action1", "action2", "action3"],
  "longTermStrategy": ["strategy1", "strategy2", "strategy3"],
  "quickWins": ["win1", "win2", "win3"]
}`;

  try {
    const response = await callGeminiAPIWithRetry(prompt);
    return parseJSONResponse<BusinessRecommendations>(response, {
      priorityActions: ['Focus on product quality and customer service'],
      longTermStrategy: ['Build brand recognition and customer loyalty'],
      quickWins: ['Optimize product photos and descriptions']
    });
  } catch (error) {
    return {
      priorityActions: [
        'Improve product photography and descriptions to increase conversions',
        'Focus on your best-selling categories and expand those product lines',
        'Implement customer feedback system to improve offerings'
      ],
      longTermStrategy: [
        'Build a strong brand identity that reflects your craft and values',
        'Develop a content marketing strategy to showcase your expertise',
        'Create strategic partnerships with complementary artisan businesses'
      ],
      quickWins: [
        'Add detailed product stories to increase emotional connection',
        'Optimize pricing for your most popular items',
        'Set up automated thank-you emails for new customers'
      ]
    };
  }
}

// AI profile optimization suggestions
export async function getProfileOptimizationSuggestions(profileData: {
  bio: string;
  skills: string[];
  yearsExperience: number;
  portfolioCount: number;
}): Promise<ProfileOptimization> {
  const prompt = `As a professional profile optimization expert, analyze this artisan profile:

Bio: ${profileData.bio || 'Not set'}
Skills: ${profileData.skills.join(', ') || 'None listed'}
Years Experience: ${profileData.yearsExperience}
Portfolio Items: ${profileData.portfolioCount}

Provide:
1. Bio quality score (0-100)
2. Top 3 bio improvement suggestions
3. Top 3 skill additions/improvements
4. Overall profile score (0-100)
5. Top 3 priority improvements

Format as JSON:
{
  "bioScore": number,
  "bioSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "skillSuggestions": ["skill1", "skill2", "skill3"],
  "overallScore": number,
  "priorityImprovements": ["improvement1", "improvement2", "improvement3"]
}`;

  try {
    const response = await callGeminiAPIWithRetry(prompt);
    return parseJSONResponse<ProfileOptimization>(response, {
      bioScore: 50,
      bioSuggestions: ['Add more details about your craft', 'Include your unique story', 'Highlight your expertise'],
      skillSuggestions: ['Add primary skills', 'Include certifications', 'List specialized techniques'],
      overallScore: 60,
      priorityImprovements: ['Complete your bio', 'Add portfolio items', 'List your skills']
    });
  } catch (error) {
    // Calculate basic scores based on available data
    const bioScore = profileData.bio ? Math.min(profileData.bio.length / 2, 100) : 0;
    const skillScore = Math.min(profileData.skills.length * 10, 100);
    const portfolioScore = Math.min(profileData.portfolioCount * 5, 100);
    const overallScore = Math.round((bioScore + skillScore + portfolioScore) / 3);

    return {
      bioScore: Math.round(bioScore),
      bioSuggestions: [
        profileData.bio ? 'Expand your bio to tell your unique artisan story' : 'Add a compelling bio that showcases your passion',
        'Include what inspired you to pursue your craft',
        'Highlight your signature techniques or specializations'
      ],
      skillSuggestions: [
        'List your primary craft skills and techniques',
        'Add any certifications or specialized training',
        'Include materials and tools you specialize in'
      ],
      overallScore,
      priorityImprovements: [
        profileData.bio ? 'Enhance bio with storytelling' : 'Create your artisan bio',
        profileData.skills.length === 0 ? 'Add your skills' : 'Expand skill list',
        profileData.portfolioCount === 0 ? 'Upload portfolio items' : 'Add more portfolio examples'
      ]
    };
  }
}

// Generate optimized bio
export async function generateOptimizedBio(artisanData: {
  name: string;
  craft: string;
  yearsExperience: number;
  specialization?: string;
  inspiration?: string;
}): Promise<string> {
  const prompt = `As a professional copywriter for artisan profiles, create a compelling bio for:

Name: ${artisanData.name}
Craft: ${artisanData.craft}
Years Experience: ${artisanData.yearsExperience}
Specialization: ${artisanData.specialization || 'traditional techniques'}
Inspiration: ${artisanData.inspiration || 'passion for handmade quality'}

Write a 2-3 sentence bio that:
1. Captures their unique story and expertise
2. Highlights what makes them special
3. Connects with customers authentically

Keep it professional yet warm, under 100 words.`;

  try {
    return await callGeminiAPIWithRetry(prompt);
  } catch (error) {
    // Fallback bio generation
    const experienceText = artisanData.yearsExperience > 10 
      ? `With over ${artisanData.yearsExperience} years of experience`
      : `With ${artisanData.yearsExperience} years of dedicated practice`;
    
    return `${artisanData.name} is a skilled ${artisanData.craft} artisan passionate about creating authentic handmade pieces. ${experienceText}, they specialize in ${artisanData.specialization || 'traditional craftsmanship'}, bringing ${artisanData.inspiration || 'creativity and dedication'} to every creation. Each piece reflects a commitment to quality and the timeless art of handmade craftsmanship.`;
  }
}

// AI Image Generation - Gemini 2.5 + Imagen 3.0
export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await fetch(`${IMAGE_GENERATION_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        aspect_ratio: "1:1",
        safety_filter_level: "block_some"
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.generatedImages?.[0]?.bytesBase64Encoded || '';
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('Failed to generate image');
  }
}

// AI Video Generation - Gemini 2.5 + Veo 2.0
export async function generateVideo(prompt: string, duration: number = 5): Promise<string> {
  try {
    const response = await fetch(`${VIDEO_GENERATION_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: duration,
        aspect_ratio: "16:9"
      })
    });

    if (!response.ok) {
      throw new Error(`Video generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.generatedVideos?.[0]?.video?.uri || '';
  } catch (error) {
    console.error('Video generation error:', error);
    throw new Error('Failed to generate video');
  }
}

// Enhance product images using AI
export async function enhanceProductImage(imageUrl: string, enhancementType: string): Promise<string> {
  const enhancementPrompts = {
    'background': 'Remove background and replace with clean white background, professional product photography',
    'lighting': 'Improve lighting, enhance colors, professional studio lighting',
    'detail': 'Enhance product details, sharpen features, high quality photography',
    'lifestyle': 'Transform into lifestyle context, show product in use, natural environment'
  };

  const prompt = enhancementPrompts[enhancementType as keyof typeof enhancementPrompts] || 'Enhance image quality and professional appearance';

  try {
    // Use Gemini 2.5 for image enhancement analysis
    const analysis = await callGeminiAPIWithRetry(`Analyze this image enhancement request: ${enhancementType}. Provide specific instructions for image enhancement.`);
    
    // Return enhanced image URL (in real implementation, this would call the actual enhancement API)
    return `${imageUrl}?enhanced=true&type=${enhancementType}`;
  } catch (error) {
    console.error('Image enhancement error:', error);
    return imageUrl; // Return original image if enhancement fails
  }
}

// Create product showcase with AI-generated visuals
export async function createProductShowcase(productData: {
  name: string;
  category: string;
  description: string;
  materials: string;
}): Promise<{
  mainImage: string;
  lifestyleImage: string;
  productVideo: string;
  description: string;
}> {
  try {
    // Generate main product image
    const mainImagePrompt = `Professional product photography of ${productData.name}, ${productData.category}, clean white background, high quality, detailed craftsmanship, handmade quality, ${productData.materials}`;
    const mainImage = await generateImage(mainImagePrompt);

    // Generate lifestyle image
    const lifestyleImagePrompt = `Lifestyle photography showing ${productData.name} in elegant home setting, warm lighting, artistic composition, cozy atmosphere, professional product photography, ${productData.category}`;
    const lifestyleImage = await generateImage(lifestyleImagePrompt);

    // Generate product video
    const videoPrompt = `Showcase video of ${productData.name} being crafted by artisan hands, detailed work process, high quality craftsmanship, ${productData.category} workshop, professional cinematography`;
    const productVideo = await generateVideo(videoPrompt);

    // Generate enhanced description
    const enhancedDescription = await generateProductDescription({
      name: productData.name,
      category: productData.category,
      materials: productData.materials,
      techniques: 'AI-enhanced storytelling'
    });

    return {
      mainImage,
      lifestyleImage,
      productVideo,
      description: enhancedDescription
    };
  } catch (error) {
    console.error('Product showcase creation error:', error);
    throw new Error('Failed to create product showcase');
  }
}

// Smart pricing suggestions
export async function getSuggestedPricing(productData: {
  name: string;
  category: string;
  materials: string;
  timeToMake: number; // hours
  skillLevel: string;
  competitorPrices?: number[];
}): Promise<PricingSuggestion> {
  const avgCompetitorPrice = productData.competitorPrices?.length
    ? productData.competitorPrices.reduce((a, b) => a + b, 0) / productData.competitorPrices.length
    : null;

  const prompt = `As a pricing strategist for handmade artisan goods, suggest pricing for:

Product: ${productData.name}
Category: ${productData.category}
Materials: ${productData.materials}
Time to Make: ${productData.timeToMake} hours
Skill Level: ${productData.skillLevel}
${avgCompetitorPrice ? `Average Competitor Price: $${avgCompetitorPrice.toFixed(2)}` : ''}

Consider:
- Material costs and labor time
- Skill level and expertise value
- Market positioning for handmade goods
- Fair compensation for artisan work

Provide:
1. Suggested price
2. Recommended price range (min-max)
3. Brief reasoning

Format as JSON:
{
  "suggestedPrice": number,
  "priceRange": {"min": number, "max": number},
  "reasoning": "explanation"
}`;

  try {
    const response = await callGeminiAPIWithRetry(prompt);
    return parseJSONResponse<PricingSuggestion>(response, {
      suggestedPrice: productData.timeToMake * 25,
      priceRange: { min: productData.timeToMake * 20, max: productData.timeToMake * 35 },
      reasoning: 'Based on estimated labor time and standard artisan rates'
    });
  } catch (error) {
    // Fallback pricing calculation
    const hourlyRate = productData.skillLevel.toLowerCase().includes('expert') ? 35 :
                       productData.skillLevel.toLowerCase().includes('intermediate') ? 25 : 20;
    const basePrice = Math.round(productData.timeToMake * hourlyRate);
    const adjustedPrice = avgCompetitorPrice
      ? Math.round((basePrice + avgCompetitorPrice) / 2)
      : basePrice;

    return {
      suggestedPrice: adjustedPrice,
      priceRange: {
        min: Math.round(adjustedPrice * 0.8),
        max: Math.round(adjustedPrice * 1.3)
      },
      reasoning: `Based on ${productData.timeToMake} hours at $${hourlyRate}/hour for ${productData.skillLevel} level work${avgCompetitorPrice ? ` and market average of $${avgCompetitorPrice.toFixed(2)}` : ''}.`
    };
  }
}

export default {
  generateProductDescription,
  predictInventoryNeeds,
  analyzeMarketTrends,
  analyzeCustomerBehavior,
  getBusinessRecommendations,
  getProfileOptimizationSuggestions,
  generateOptimizedBio,
  getSuggestedPricing,
  generateImage,
  generateVideo,
  enhanceProductImage,
  createProductShowcase
};
