// Creative Studio - Imagen Image Generation Function
// Uses Gemini API for AI-powered image content generation

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Parse request body
    const { prompt, imageType, style, artisanId } = await req.json();

    if (!prompt || !imageType) {
      throw new Error('Missing required parameters: prompt and imageType');
    }

    // Enhanced prompt for image generation based on type and style
    const enhancedPrompt = createEnhancedPrompt(prompt, imageType, style);

    // Call Gemini API for image generation using Imagen 3.0
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        aspect_ratio: getImageAspectRatio(imageType),
        safety_filter_level: "block_some"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Return generated image data
    const result = {
      image: {
        bytesBase64Encoded: data.generatedImages?.[0]?.bytesBase64Encoded || '',
        dimensions: getImageDimensions(imageType),
        format: 'PNG',
        type: imageType
      },
      enhancedPrompt,
      imageType,
      style,
      artisanId,
      createdAt: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Imagen Image Generation Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'IMAGE_GENERATION_ERROR',
          message: error.message || 'Failed to generate image'
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function createEnhancedPrompt(basePrompt: string, imageType: string, style: string): string {
  const styleModifiers = {
    realistic: ', photorealistic, high quality, professional photography',
    artistic: ', artistic style, creative composition, vibrant colors',
    minimalist: ', minimalist design, clean composition, simple elegant',
    vintage: ', vintage style, classic aesthetic, timeless appeal'
  };

  const typeModifiers = {
    product_poster: ', product photography, clean background, studio lighting',
    social_ad: ', social media optimized, engaging composition, modern design',
    hero_banner: ', wide format, impactful composition, premium quality',
    lifestyle_shot: ', lifestyle photography, natural environment, storytelling'
  };

  const baseStyle = styleModifiers[style as keyof typeof styleModifiers] || styleModifiers.realistic;
  const typeStyle = typeModifiers[imageType as keyof typeof typeModifiers] || typeModifiers.product_poster;

  return `${basePrompt}${baseStyle}${typeStyle}, detailed craftsmanship, high resolution, professional quality`;
}

function getImageAspectRatio(imageType: string): string {
  const ratios = {
    'product_poster': '1:1',
    'social_ad': '1:1',
    'hero_banner': '16:9',
    'lifestyle_shot': '4:3'
  };
  return ratios[imageType as keyof typeof ratios] || '1:1';
}

function getImageDimensions(imageType: string) {
  const dimensions = {
    'product_poster': { width: 1024, height: 1024 },
    'social_ad': { width: 1024, height: 1024 },
    'hero_banner': { width: 1920, height: 1080 },
    'lifestyle_shot': { width: 1024, height: 768 }
  };
  return dimensions[imageType as keyof typeof dimensions] || { width: 1024, height: 1024 };
}