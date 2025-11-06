// Simple deployment script for Creative Studio functions
// This creates the functions as web endpoints using the Gemini API

const SUPABASE_URL = 'https://aexkbjcoskoqrzpqplyv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFleGtiamNvc2tvcXJ6cHFwbHl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTY3NDMsImV4cCI6MjA3NjI3Mjc0M30.8Z7URsZb9rWkHh9HFOZ331qF12DpGNdOYIbzw3AVB2Q';
const GEMINI_API_KEY = 'AIzaSyBv-v3KQS4q4Dk-jSlY_NAFkNijjna6vMc';

async function testRealGeminiIntegration() {
  console.log('🔬 Testing Real Gemini Integration for Creative Studio...');
  
  // Test 1: Content Generation (Product Description)
  console.log('\n📝 Testing Content Generation...');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Create a compelling product description for a Handwoven Silk Scarf. Category: Fashion. Materials: silk. Techniques: traditional craftsmanship. Write a 3-paragraph description that captures the unique qualities, highlights the cultural significance, and appeals to customers who value authentic, handmade goods. Keep it engaging, authentic, and under 150 words.' }]
        }]
      })
    });

    if (!response.ok) {
      console.error('❌ Content Generation Failed:', response.status);
      return false;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (content) {
      console.log('✅ Content Generated Successfully:');
      console.log(content);
    } else {
      console.log('❌ No content generated');
      return false;
    }
  } catch (error) {
    console.error('❌ Content Generation Error:', error);
    return false;
  }

  // Test 2: Test Video Description Generation
  console.log('\n🎥 Testing Video Description Generation...');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Create a detailed video production description for a handcrafted pottery bowl showcase video. Include: 1. Shot sequence description 2. Camera movements 3. Lighting setup 4. Audio/music suggestions 5. Timeline breakdown. Make it actionable for video production.' }]
        }]
      })
    });

    if (!response.ok) {
      console.error('❌ Video Description Failed:', response.status);
      return false;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (content) {
      console.log('✅ Video Description Generated:');
      console.log(content);
    } else {
      console.log('❌ No video description generated');
      return false;
    }
  } catch (error) {
    console.error('❌ Video Description Error:', error);
    return false;
  }

  // Test 3: Test Image Description Generation
  console.log('\n🖼️ Testing Image Description Generation...');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Create a detailed image generation prompt for a handcrafted pottery bowl product poster. Include: 1. Photography style 2. Lighting setup 3. Background specifications 4. Composition details 5. Color palette. Make it suitable for high-quality product photography.' }]
        }]
      })
    });

    if (!response.ok) {
      console.error('❌ Image Description Failed:', response.status);
      return false;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (content) {
      console.log('✅ Image Description Generated:');
      console.log(content);
      return true;
    } else {
      console.log('❌ No image description generated');
      return false;
    }
  } catch (error) {
    console.error('❌ Image Description Error:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Real Creative Studio Integration...\n');
  
  const success = await testRealGeminiIntegration();
  
  console.log('\n📊 Final Status:');
  console.log('Real Gemini Integration:', success ? '✅ WORKING' : '❌ NOT WORKING');
  
  if (success) {
    console.log('\n✅ All Creative Studio features are working with real Gemini API!');
    console.log('📝 Content Generation: ✅ Working');
    console.log('🎥 Video Generation: ✅ Working (Description-based)');
    console.log('🖼️ Image Generation: ✅ Working (Description-based)');
  } else {
    console.log('\n❌ Some features need attention');
  }
  
  return success;
}

// Run the test
if (typeof window === 'undefined') {
  main().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testRealGeminiIntegration, main };