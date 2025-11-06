// Test Real Image and Video Generation using Gemini APIs with CORRECT model names
const GEMINI_API_KEY = 'AIzaSyBv-v3KQS4q4Dk-jSlY_NAFkNijjna6vMc';

async function testRealImageGeneration() {
  console.log('🖼️ Testing Real Image Generation with Gemini 2.5 Flash Image...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateImage?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A handcrafted pottery bowl with rustic textures, professional product photography, clean background, dramatic lighting, marketing-ready composition, 4K resolution',
        aspect_ratio: '1:1',
        safety_filter_level: 'block_some'
      })
    });

    console.log('📡 Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Image Generation Error:', response.status, errorData.error?.message || response.statusText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Image Generation Response:', data);
    
    if (data.generatedImages && data.generatedImages.length > 0) {
      console.log('✅ REAL IMAGE GENERATED SUCCESSFULLY!');
      console.log('Image Data:', {
        bytesBase64Encoded: data.generatedImages[0].bytesBase64Encoded ? 'Available' : 'Not available',
        mimeType: data.generatedImages[0].mimeType || 'Not specified'
      });
      return true;
    } else {
      console.log('❌ No image generated');
      return false;
    }
  } catch (error) {
    console.error('❌ Image Generation Network Error:', error);
    return false;
  }
}

async function testImagen4Generation() {
  console.log('\n🖼️ Testing Imagen 4.0 Generation...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:generateImage?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A handcrafted pottery bowl with rustic textures, professional product photography, clean background, dramatic lighting, marketing-ready composition, 4K resolution',
        aspect_ratio: '1:1',
        safety_filter_level: 'block_some'
      })
    });

    console.log('📡 Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Imagen 4.0 Error:', response.status, errorData.error?.message || response.statusText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Imagen 4.0 Response:', data);
    
    if (data.generatedImages && data.generatedImages.length > 0) {
      console.log('✅ REAL IMAGE GENERATED WITH IMAGEN 4.0!');
      console.log('Image Data:', {
        bytesBase64Encoded: data.generatedImages[0].bytesBase64Encoded ? 'Available' : 'Not available',
        mimeType: data.generatedImages[0].mimeType || 'Not specified'
      });
      return true;
    } else {
      console.log('❌ No image generated');
      return false;
    }
  } catch (error) {
    console.error('❌ Imagen 4.0 Network Error:', error);
    return false;
  }
}

async function testGeminiFlashImageGeneration() {
  console.log('\n🖼️ Testing Gemini 2.5 Flash Image Generation...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateImage?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A handcrafted pottery bowl with rustic textures, professional product photography, clean background, dramatic lighting, marketing-ready composition, 4K resolution',
        aspect_ratio: '1:1',
        safety_filter_level: 'block_some'
      })
    });

    console.log('📡 Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Gemini Flash Image Error:', response.status, errorData.error?.message || response.statusText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Gemini Flash Image Response:', data);
    
    if (data.generatedImages && data.generatedImages.length > 0) {
      console.log('✅ REAL IMAGE GENERATED WITH GEMINI FLASH!');
      console.log('Image Data:', {
        bytesBase64Encoded: data.generatedImages[0].bytesBase64Encoded ? 'Available' : 'Not available',
        mimeType: data.generatedImages[0].mimeType || 'Not specified'
      });
      return true;
    } else {
      console.log('❌ No image generated');
      return false;
    }
  } catch (error) {
    console.error('❌ Gemini Flash Image Network Error:', error);
    return false;
  }
}

async function testVideoGeneration() {
  console.log('\n🎥 Testing Video Generation (checking for any available models)...');
  
  // Since no video models were found, let's try some common video model names
  const videoModels = [
    'veo-2.0',
    'veo-1.5', 
    'video-generation',
    'gemini-video'
  ];
  
  for (const model of videoModels) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateVideo?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A professional showcase video of a handcrafted pottery bowl being made, artisan hands working with clay, warm studio lighting, cinematic quality',
          duration: 5,
          aspect_ratio: '16:9'
        })
      });

      console.log(`📡 ${model} Response Status:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${model} SUCCESS!`, data);
        
        if (data.generatedVideos && data.generatedVideos.length > 0) {
          console.log('✅ REAL VIDEO GENERATED SUCCESSFULLY!');
          return true;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`❌ ${model} Error:`, response.status, errorData.error?.message || response.statusText);
      }
    } catch (error) {
      console.log(`❌ ${model} Network Error:`, error.message);
    }
  }
  
  return false;
}

async function main() {
  console.log('🚀 Testing REAL Image and Video Generation with Correct Gemini APIs...\n');
  
  // Test different image generation models
  const flashImageSuccess = await testGeminiFlashImageGeneration();
  const imagen4Success = await testImagen4Generation();
  
  // Test video generation
  const videoSuccess = await testVideoGeneration();
  
  console.log('\n📊 Final Results:');
  console.log('Gemini 2.5 Flash Image Generation:', flashImageSuccess ? '✅ WORKING' : '❌ NOT WORKING');
  console.log('Imagen 4.0 Generation:', imagen4Success ? '✅ WORKING' : '❌ NOT WORKING');
  console.log('Real Video Generation:', videoSuccess ? '✅ WORKING' : '❌ NOT WORKING');
  
  const imageSuccess = flashImageSuccess || imagen4Success;
  const overallSuccess = imageSuccess && videoSuccess;
  
  console.log('\nOverall Status:', overallSuccess ? '✅ ALL REAL GENERATION WORKING' : '❌ SOME FEATURES NEED ATTENTION');
  
  if (imageSuccess) {
    console.log('✅ REAL IMAGES are being generated with actual image data!');
  } else {
    console.log('❌ Image generation needs proper implementation');
  }
  
  if (videoSuccess) {
    console.log('✅ REAL VIDEOS are being generated with actual video data!');
  } else {
    console.log('❌ Video generation - no models available or needs different approach');
  }
  
  return overallSuccess;
}

// Run the test
if (typeof window === 'undefined') {
  main().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testRealImageGeneration, testVideoGeneration, main };