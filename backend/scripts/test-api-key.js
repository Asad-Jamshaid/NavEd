// Quick test script to verify Gemini API key
// IMPORTANT: Set GEMINI_API_KEY environment variable before running
// Example: $env:GEMINI_API_KEY="your-key-here"; node backend/scripts/test-api-key.js
const API_KEY = process.env.GEMINI_API_KEY || '';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

if (!API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is not set!');
  console.error('Please set it before running this script:');
  console.error('  Windows: $env:GEMINI_API_KEY="your-key-here"; node backend/scripts/test-api-key.js');
  console.error('  Linux/Mac: GEMINI_API_KEY="your-key-here" node backend/scripts/test-api-key.js');
  process.exit(1);
}

async function listAvailableModels() {
  console.log('Checking available models for this API key...\n');

  try {
    const response = await fetch(`${BASE_URL}/models?key=${API_KEY}`);
    const data = await response.json();

    if (data.error) {
      console.error('❌ API Error:', data.error.message);
      console.error('Status:', data.error.status);
      return null;
    }

    if (data.models) {
      console.log('Available models:');
      const generateContentModels = data.models.filter(m =>
        m.supportedGenerationMethods?.includes('generateContent')
      );

      generateContentModels.forEach(model => {
        console.log(`  - ${model.name}`);
      });

      return generateContentModels[0]?.name || null;
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to list models:', error.message);
    return null;
  }
}

async function testGeminiAPI() {
  console.log('Testing Gemini API key...\n');

  // First, get available models
  await listAvailableModels();

  // Test with Gemini 2.5 Flash (the one configured in the app)
  const modelName = 'models/gemini-2.5-flash';
  console.log(`\nTesting with Gemini 2.5 Flash (configured model)...\n`);

  try {
    const response = await fetch(
      `${BASE_URL}/${modelName}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: 'Say "Hello! API key is working!" in a friendly way.' }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error('❌ API Error:', data.error.message);
      console.error('Status:', data.error.status);
      console.error('\nThe API key may be invalid or has restrictions.');
      process.exit(1);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      console.log('✅ API Key is working!\n');
      console.log('Response from Gemini:');
      console.log('─'.repeat(50));
      console.log(text);
      console.log('─'.repeat(50));
      console.log('\n✅ Test completed successfully!');
    } else {
      console.error('❌ Unexpected response format:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGeminiAPI();
