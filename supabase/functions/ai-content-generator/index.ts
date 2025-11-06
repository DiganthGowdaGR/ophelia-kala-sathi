// AI Content Generator Function
// Real implementation using Gemini 2.5 Flash API

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const { productName, productType, tone, contentType, artisanId } = await req.json();

    if (!productName || !contentType) {
      throw new Error('Missing required parameters: productName and contentType');
    }

    // Generate content using real Gemini API
    const content = await generateContent(geminiApiKey, productName, productType, tone, contentType);
    
    const result = {
      content,
      productName,
      productType,
      tone,
      contentType,
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
    console.error('AI Content Generation Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'CONTENT_GENERATION_ERROR',
          message: error.message || 'Failed to generate content'
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateContent(apiKey: string, productName: string, productType: string, tone: string, contentType: string): Promise<string> {
  const prompt = createContentPrompt(productName, productType, tone, contentType);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate content';
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