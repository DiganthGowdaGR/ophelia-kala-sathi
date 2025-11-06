// Creative Studio - VEO Video Generation Function
// Uses Gemini API for AI-powered video content generation

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
    const { prompt, videoType, productInfo, artisanId } = await req.json();

    if (!prompt || !videoType) {
      throw new Error('Missing required parameters: prompt and videoType');
    }

    // Enhanced prompt for video generation
    const enhancedPrompt = `Create a professional ${videoType} video for ${productInfo?.name || 'artisan product'}: ${prompt}. Style: High-quality, cinematic, professional product showcase with smooth transitions and elegant presentation suitable for marketing and social media.`;

    // Call Gemini API for video generation using the correct model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-2.0:generateVideo?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        duration: getVideoDuration(videoType),
        aspect_ratio: "16:9",
        safety_filter_level: "block_some"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Check if VEO API is available and working
    const videoUri = data.generatedVideos?.[0]?.video?.uri;
    if (videoUri) {
      // Return real generated video data
      const result = {
        video: {
          videoUrl: videoUri,
          duration: getVideoDuration(videoType),
          resolution: '1920x1080',
          format: 'MP4'
        },
        prompt: enhancedPrompt,
        videoType,
        productInfo,
        artisanId,
        createdAt: new Date().toISOString()
      };

      return new Response(
        JSON.stringify({ data: result }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Fallback: Use Gemini 2.5 Flash to generate video description/content instead
      const fallbackResponse = await generateVideoDescription(geminiApiKey, enhancedPrompt);
      
      const result = {
        video: {
          videoUrl: null,
          description: fallbackResponse,
          duration: getVideoDuration(videoType),
          resolution: '1920x1080',
          format: 'Text Description',
          note: 'VEO video generation not available, generated detailed video description instead'
        },
        prompt: enhancedPrompt,
        videoType,
        productInfo,
        artisanId,
        createdAt: new Date().toISOString()
      };

      return new Response(
        JSON.stringify({ data: result }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('VEO Video Generation Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'VIDEO_GENERATION_ERROR',
          message: error.message || 'Failed to generate video'
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateVideoDescription(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `Create a detailed video production description for this artisan video: ${prompt}. Include: 1. Shot sequence description 2. Camera movements 3. Lighting setup 4. Audio/music suggestions 5. Timeline breakdown. Make it actionable for video production.` }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate video description');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Video description unavailable';
}

function getVideoDuration(videoType: string): number {
  const durations = {
    'product_reel': 15,
    'process_video': 30,
    'story_video': 60,
    'social_reel': 15
  };
  return durations[videoType as keyof typeof durations] || 15;
}