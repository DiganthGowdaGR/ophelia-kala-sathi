// Test Supabase Functions for Creative Studio
const SUPABASE_URL = 'https://aexkbjcoskoqrzpqplyv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleGtiamNvc2tvcXJ6cHFwbHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTY3NDMsImV4cCI6MjA3NjI3Mjc0M30.8Z7URsZb9rWkHh9HFOZ331qF12DpGNdOYIbzw3AVB2Q';

async function testSupabaseFunction(functionName: string, payload: any) {
  console.log(`🔬 Testing Supabase Function: ${functionName}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log(`📡 Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ ${functionName} Error:`, response.status, errorText);
      return false;
    }

    const data = await response.json();
    console.log(`✅ ${functionName} Success:`, data);
    return true;
    
  } catch (error) {
    console.error(`❌ ${functionName} Network Error:`, error);
    return false;
  }
}

async function testAllSupabaseFunctions() {
  console.log('🚀 Testing All Creative Studio Supabase Functions...\n');
  
  const results = {
    veo: await testSupabaseFunction('creative-studio-veo', {
      prompt: 'A handcrafted pottery bowl with rustic textures',
      videoType: 'product_reel',
      productInfo: { name: 'Test Product' },
      artisanId: 'test-user'
    }),
    
    imagen: await testSupabaseFunction('creative-studio-imagen', {
      prompt: 'A handcrafted pottery bowl with rustic textures',
      imageType: 'product_poster',
      style: 'realistic',
      artisanId: 'test-user'
    }),
    
    content: await testSupabaseFunction('ai-content-generator', {
      productName: 'Handwoven Silk Scarf',
      productType: 'fashion',
      tone: 'professional',
      contentType: 'description',
      artisanId: 'test-user'
    })
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('VEO Video Generation:', results.veo ? '✅ PASS' : '❌ FAIL');
  console.log('Imagen Image Generation:', results.imagen ? '✅ PASS' : '❌ FAIL');
  console.log('AI Content Generation:', results.content ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall Status:', allPassed ? '✅ ALL FUNCTIONS WORKING' : '❌ SOME FUNCTIONS FAILED');
  
  return allPassed;
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testAllSupabaseFunctions().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testSupabaseFunction, testAllSupabaseFunctions };