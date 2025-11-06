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

    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      throw new Error('Missing or invalid message parameter');
    }

    const response = await generateChatResponse(geminiApiKey, message, conversationHistory);

    return new Response(
      JSON.stringify({ 
        message: response,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Chatbot Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'CHATBOT_ERROR',
          message: error.message || 'Failed to process chatbot request'
        },
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateChatResponse(apiKey: string, message: string, conversationHistory: Array<{role: string, content: string}>): Promise<string> {
  const systemPrompt = `You are an expert AI business advisor specifically designed to help artisans and craftspeople grow their handmade businesses. You provide practical, actionable advice on:
- Pricing strategies and business models
- Marketing and social media tactics
- Product development and quality
- Customer service and reviews management
- Platform features and how to use them effectively
- Scaling and growth strategies
- Sustainability and ethical practices

Be friendly, encouraging, and practical. Ask clarifying questions when needed. Keep responses concise but helpful (2-3 paragraphs max).`;

  const messages = [
    {
      role: 'user',
      content: systemPrompt
    },
    ...conversationHistory,
    {
      role: 'user',
      content: message
    }
  ];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I could not generate a response. Please try again.';
}
