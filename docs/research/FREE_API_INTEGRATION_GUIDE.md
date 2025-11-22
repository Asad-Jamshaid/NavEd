# Free API Integration Guide for NavEd

## Complete Code Examples and Integration Patterns

**Last Updated:** November 2025
**Research Sources:** Official Documentation + Community Best Practices

---

## Table of Contents

1. [Google Gemini API Integration](#1-google-gemini-api-integration)
2. [Groq API Integration](#2-groq-api-integration)
3. [HuggingFace Inference API](#3-huggingface-inference-api)
4. [OSRM Routing API](#4-osrm-routing-api)
5. [OpenStreetMap Integration](#5-openstreetmap-integration)
6. [Multi-Provider LLM Fallback System](#6-multi-provider-llm-fallback-system)

---

## 1. Google Gemini API Integration

### Free Tier Limits
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per minute**

### Getting Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and store securely

### Complete Integration Code

```typescript
// src/services/geminiService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-1.5-flash';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

interface GeminiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * Call Google Gemini API
 * @param prompt - The prompt to send
 * @param apiKey - Your Gemini API key
 * @param model - Model to use (default: gemini-1.5-flash)
 * @returns Generated text response
 */
export const callGemini = async (
  prompt: string,
  apiKey: string,
  model: string = DEFAULT_MODEL
): Promise<string> => {
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData: GeminiError = await response.json();

      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Generate a study plan using Gemini
 */
export const generateStudyPlanWithGemini = async (
  documentContent: string,
  apiKey: string
): Promise<string> => {
  const prompt = `You are an expert study coach. Analyze the following document content and create a comprehensive study plan.

Document Content:
${documentContent.substring(0, 4000)}

Please create a study plan that includes:
1. Learning Objectives (3-5 clear goals)
2. Study Sessions (break into 25-minute Pomodoro sessions)
3. Key Topics to Focus On
4. Suggested Review Schedule
5. Practice Questions or Exercises

Format the response in a clear, structured way.`;

  return callGemini(prompt, apiKey);
};

/**
 * Generate quiz questions using Gemini
 */
export const generateQuizWithGemini = async (
  documentContent: string,
  numQuestions: number,
  apiKey: string
): Promise<string> => {
  const prompt = `Based on the following content, generate ${numQuestions} multiple-choice quiz questions.

Content:
${documentContent.substring(0, 4000)}

For each question, provide:
1. The question
2. Four options (A, B, C, D)
3. The correct answer
4. A brief explanation of why that answer is correct

Format as JSON array:
[
  {
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A",
    "explanation": "..."
  }
]`;

  return callGemini(prompt, apiKey);
};

/**
 * Chat with document context using Gemini
 */
export const chatWithDocumentGemini = async (
  userMessage: string,
  documentContext: string,
  chatHistory: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<string> => {
  const historyContext = chatHistory
    .slice(-5) // Last 5 messages for context
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  const prompt = `You are a helpful study assistant. Use the following document context to answer the user's question.

Document Context:
${documentContext.substring(0, 3000)}

Previous Conversation:
${historyContext}

User's Question: ${userMessage}

Provide a helpful, accurate response based on the document content. If the answer isn't in the document, say so clearly.`;

  return callGemini(prompt, apiKey);
};
```

### Sources
- [Gemini API Quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [Google AI Studio](https://makersuite.google.com/)
- [Build AI Chatbot with Gemini and React Native Expo](https://www.toolify.ai/ai-news/build-an-ai-chatbot-with-google-gemini-and-react-native-expo-2046510)

---

## 2. Groq API Integration

### Free Tier Limits
- **100+ requests per minute** (very generous)
- **14,400 requests per day**
- Models: llama-3.3-70b-versatile, mixtral-8x7b-32768

### Getting Your API Key
1. Go to [Groq Console](https://console.groq.com)
2. Create an account
3. Navigate to API Keys
4. Create new key

### Complete Integration Code

```typescript
// src/services/groqService.ts

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call Groq API - OpenAI Compatible
 * @param messages - Array of messages
 * @param apiKey - Your Groq API key
 * @param model - Model to use
 * @returns Generated text response
 */
export const callGroq = async (
  messages: GroqMessage[],
  apiKey: string,
  model: string = 'llama-3.1-8b-instant'
): Promise<string> => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      const errorText = await response.text();
      throw new Error(`Groq API error: ${errorText}`);
    }

    const data: GroqResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
};

/**
 * Simple prompt call to Groq
 */
export const callGroqSimple = async (
  prompt: string,
  apiKey: string,
  systemPrompt?: string
): Promise<string> => {
  const messages: GroqMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  return callGroq(messages, apiKey);
};

/**
 * Summarize document with Groq (very fast!)
 */
export const summarizeWithGroq = async (
  content: string,
  apiKey: string
): Promise<string> => {
  const systemPrompt = 'You are a helpful assistant that creates clear, concise summaries.';

  const prompt = `Please summarize the following content in a clear and structured way:

${content.substring(0, 6000)}

Provide:
1. A brief overview (2-3 sentences)
2. Key points (bullet points)
3. Main takeaways`;

  return callGroqSimple(prompt, apiKey, systemPrompt);
};

/**
 * Available Groq Models
 */
export const GROQ_MODELS = {
  // Fast and efficient
  LLAMA_8B: 'llama-3.1-8b-instant',
  // More capable
  LLAMA_70B: 'llama-3.3-70b-versatile',
  // Mixtral
  MIXTRAL: 'mixtral-8x7b-32768',
  // Gemma
  GEMMA_7B: 'gemma-7b-it',
};
```

### Sources
- [Groq Documentation](https://console.groq.com/docs)
- [Groq Quickstart](https://console.groq.com/docs/quickstart)
- [LangChain Groq Integration](https://js.langchain.com/docs/integrations/chat/groq/)

---

## 3. HuggingFace Inference API

### Free Tier
- Variable rate limits (generous for most models)
- Free access to thousands of models
- No credit card required

### Getting Your Token
1. Go to [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Create an account
3. Create new token with "read" access

### Complete Integration Code

```typescript
// src/services/huggingfaceService.ts

const HF_INFERENCE_URL = 'https://api-inference.huggingface.co/models';

interface HFTextGenerationResponse {
  generated_text: string;
}

interface HFSummarizationResponse {
  summary_text: string;
}

/**
 * Text generation with HuggingFace
 */
export const generateTextHF = async (
  prompt: string,
  token: string,
  model: string = 'mistralai/Mistral-7B-Instruct-v0.2'
): Promise<string> => {
  const url = `${HF_INFERENCE_URL}/${model}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 503) {
        // Model loading
        throw new Error('MODEL_LOADING');
      }
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return (data[0] as HFTextGenerationResponse).generated_text;
    }

    return data.generated_text || JSON.stringify(data);
  } catch (error) {
    console.error('HuggingFace API Error:', error);
    throw error;
  }
};

/**
 * Summarization with HuggingFace
 */
export const summarizeHF = async (
  text: string,
  token: string,
  model: string = 'facebook/bart-large-cnn'
): Promise<string> => {
  const url = `${HF_INFERENCE_URL}/${model}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: text.substring(0, 4000),
        parameters: {
          max_length: 500,
          min_length: 100,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return (data[0] as HFSummarizationResponse).summary_text;
    }

    return data.summary_text;
  } catch (error) {
    console.error('HuggingFace Summarization Error:', error);
    throw error;
  }
};

/**
 * Question Answering with HuggingFace
 */
export const answerQuestionHF = async (
  question: string,
  context: string,
  token: string,
  model: string = 'deepset/roberta-base-squad2'
): Promise<string> => {
  const url = `${HF_INFERENCE_URL}/${model}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        inputs: {
          question,
          context: context.substring(0, 4000),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const data = await response.json();
    return data.answer || 'Unable to find answer in the context.';
  } catch (error) {
    console.error('HuggingFace QA Error:', error);
    throw error;
  }
};

/**
 * Recommended Free HuggingFace Models
 */
export const HF_MODELS = {
  // Text Generation
  MISTRAL_7B: 'mistralai/Mistral-7B-Instruct-v0.2',
  LLAMA_7B: 'meta-llama/Llama-2-7b-chat-hf',

  // Summarization
  BART_SUMMARIZER: 'facebook/bart-large-cnn',
  T5_SUMMARIZER: 'google/flan-t5-base',

  // Question Answering
  ROBERTA_QA: 'deepset/roberta-base-squad2',

  // Translation
  TRANSLATION: 'Helsinki-NLP/opus-mt-en-es',
};
```

### Sources
- [HuggingFace JS Libraries](https://huggingface.co/docs/huggingface.js/en/index)
- [HuggingFace Inference API](https://huggingface.co/docs/huggingface.js/en/inference/README)
- [NPM Package](https://www.npmjs.com/package/@huggingface/inference)

---

## 4. OSRM Routing API

### Free Public API
- ~10,000 requests/month on public demo server
- Unlimited if self-hosted
- No API key required for public server

### Complete Integration Code

```typescript
// src/services/osrmService.ts

const OSRM_PUBLIC_URL = 'https://router.project-osrm.org';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  name: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

interface OSRMRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: Array<[number, number]>;
    type: string;
  };
  legs: Array<{
    steps: RouteStep[];
    distance: number;
    duration: number;
  }>;
}

interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: Array<{
    name: string;
    location: [number, number];
  }>;
}

/**
 * Get walking route between two points
 */
export const getWalkingRoute = async (
  origin: Coordinate,
  destination: Coordinate
): Promise<OSRMRoute | null> => {
  // OSRM uses lon,lat format (not lat,lon!)
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;

  const url = `${OSRM_PUBLIC_URL}/route/v1/foot/${coordinates}?` +
    'overview=full&' +
    'geometries=geojson&' +
    'steps=true&' +
    'annotations=true';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data: OSRMResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('No route found');
      return null;
    }

    return data.routes[0];
  } catch (error) {
    console.error('OSRM Routing Error:', error);
    throw error;
  }
};

/**
 * Get driving route between two points
 */
export const getDrivingRoute = async (
  origin: Coordinate,
  destination: Coordinate
): Promise<OSRMRoute | null> => {
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;

  const url = `${OSRM_PUBLIC_URL}/route/v1/driving/${coordinates}?` +
    'overview=full&' +
    'geometries=geojson&' +
    'steps=true';

  try {
    const response = await fetch(url);
    const data: OSRMResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }

    return data.routes[0];
  } catch (error) {
    console.error('OSRM Routing Error:', error);
    throw error;
  }
};

/**
 * Get route with multiple waypoints
 */
export const getRouteWithWaypoints = async (
  waypoints: Coordinate[],
  profile: 'foot' | 'driving' | 'bike' = 'foot'
): Promise<OSRMRoute | null> => {
  if (waypoints.length < 2) {
    throw new Error('At least 2 waypoints required');
  }

  const coordinates = waypoints
    .map(wp => `${wp.longitude},${wp.latitude}`)
    .join(';');

  const url = `${OSRM_PUBLIC_URL}/route/v1/${profile}/${coordinates}?` +
    'overview=full&' +
    'geometries=geojson&' +
    'steps=true';

  try {
    const response = await fetch(url);
    const data: OSRMResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return null;
    }

    return data.routes[0];
  } catch (error) {
    console.error('OSRM Routing Error:', error);
    throw error;
  }
};

/**
 * Convert OSRM step to human-readable instruction
 */
export const formatInstruction = (step: RouteStep): string => {
  const { maneuver, name, distance } = step;
  const distanceText = distance < 1000
    ? `${Math.round(distance)}m`
    : `${(distance / 1000).toFixed(1)}km`;

  const typeMap: Record<string, string> = {
    'turn': 'Turn',
    'new name': 'Continue onto',
    'depart': 'Start on',
    'arrive': 'Arrive at',
    'merge': 'Merge onto',
    'on ramp': 'Take ramp to',
    'off ramp': 'Exit onto',
    'fork': 'Keep',
    'end of road': 'At end of road, turn',
    'continue': 'Continue',
    'roundabout': 'At roundabout, take',
    'rotary': 'At rotary, take',
    'roundabout turn': 'At roundabout, turn',
    'notification': '',
    'exit roundabout': 'Exit roundabout onto',
    'exit rotary': 'Exit rotary onto',
  };

  const modifierMap: Record<string, string> = {
    'uturn': 'U-turn',
    'sharp right': 'sharp right',
    'right': 'right',
    'slight right': 'slight right',
    'straight': 'straight',
    'slight left': 'slight left',
    'left': 'left',
    'sharp left': 'sharp left',
  };

  const action = typeMap[maneuver.type] || maneuver.type;
  const direction = maneuver.modifier ? modifierMap[maneuver.modifier] || maneuver.modifier : '';
  const streetName = name || 'the road';

  if (maneuver.type === 'arrive') {
    return `Arrive at your destination`;
  }

  if (maneuver.type === 'depart') {
    return `Head ${direction} on ${streetName} for ${distanceText}`;
  }

  return `${action} ${direction} onto ${streetName} (${distanceText})`.trim();
};

/**
 * Convert OSRM route to polyline coordinates for react-native-maps
 */
export const routeToPolyline = (route: OSRMRoute): Coordinate[] => {
  return route.geometry.coordinates.map(coord => ({
    latitude: coord[1],
    longitude: coord[0],
  }));
};

/**
 * Format duration to human-readable string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format distance to human-readable string
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};
```

### Sources
- [OSRM Project](http://project-osrm.org/)
- [OSRM API Documentation](http://project-osrm.org/docs/v5.5.1/api/)
- [OSRM Route API Tutorial](https://blog.afi.io/blog/osrm-route-api-free-directions-api-with-turn-by-turn-directions-and-polylines/)

---

## 5. OpenStreetMap Integration

### Using with react-native-maps

```typescript
// src/components/OSMMapView.tsx

import React from 'react';
import MapView, { UrlTile, Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Props {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: Array<{
    id: string;
    coordinate: Coordinate;
    title: string;
    description?: string;
  }>;
  routeCoordinates?: Coordinate[];
  onMarkerPress?: (id: string) => void;
}

const OSMMapView: React.FC<Props> = ({
  initialRegion,
  markers = [],
  routeCoordinates,
  onMarkerPress,
}) => {
  // OpenStreetMap tile URL template
  const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Alternative tile servers for different styles:
  // const CARTO_LIGHT = 'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
  // const CARTO_DARK = 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
  // const STAMEN_TERRAIN = 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png';

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        mapType="none" // Hide default map tiles
      >
        {/* OpenStreetMap Tiles */}
        <UrlTile
          urlTemplate={OSM_TILE_URL}
          maximumZ={19}
          flipY={false}
        />

        {/* Markers */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            onPress={() => onMarkerPress?.(marker.id)}
          />
        ))}

        {/* Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#1E88E5"
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default OSMMapView;
```

### Sources
- [OpenStreetMap Wiki - Routing](https://wiki.openstreetmap.org/wiki/Routing)
- [react-native-maps Documentation](https://github.com/react-native-maps/react-native-maps)

---

## 6. Multi-Provider LLM Fallback System

### Complete Implementation

```typescript
// src/services/llmService.ts

import { callGemini } from './geminiService';
import { callGroqSimple } from './groqService';
import { generateTextHF } from './huggingfaceService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LLMProvider = 'gemini' | 'groq' | 'huggingface';

interface APIKeys {
  gemini?: string;
  groq?: string;
  huggingface?: string;
}

const STORAGE_KEY = '@naved_api_keys';

/**
 * Load API keys from storage
 */
export const loadAPIKeys = async (): Promise<APIKeys> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Save API keys to storage
 */
export const saveAPIKeys = async (keys: APIKeys): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};

/**
 * Call LLM with automatic fallback between providers
 */
export const callLLMWithFallback = async (
  prompt: string,
  preferredProvider?: LLMProvider
): Promise<{ response: string; provider: LLMProvider }> => {
  const keys = await loadAPIKeys();

  // Order providers by preference
  const providers: LLMProvider[] = preferredProvider
    ? [preferredProvider, ...(['gemini', 'groq', 'huggingface'] as LLMProvider[]).filter(p => p !== preferredProvider)]
    : ['gemini', 'groq', 'huggingface'];

  const errors: string[] = [];

  for (const provider of providers) {
    const key = keys[provider];

    if (!key) {
      errors.push(`${provider}: No API key configured`);
      continue;
    }

    try {
      let response: string;

      switch (provider) {
        case 'gemini':
          response = await callGemini(prompt, key);
          break;
        case 'groq':
          response = await callGroqSimple(prompt, key);
          break;
        case 'huggingface':
          response = await generateTextHF(prompt, key);
          break;
      }

      return { response, provider };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      errors.push(`${provider}: ${errorMessage}`);

      // If rate limited, try next provider
      if (errorMessage === 'RATE_LIMIT_EXCEEDED') {
        console.log(`${provider} rate limited, trying next provider...`);
        continue;
      }

      // If model loading (HuggingFace), wait and retry once
      if (errorMessage === 'MODEL_LOADING') {
        console.log(`${provider} model loading, waiting 20s...`);
        await new Promise(resolve => setTimeout(resolve, 20000));
        try {
          const response = await generateTextHF(prompt, key);
          return { response, provider };
        } catch {
          continue;
        }
      }

      continue;
    }
  }

  throw new Error(`All LLM providers failed:\n${errors.join('\n')}`);
};

/**
 * Smart provider selection based on task type
 */
export const callLLMSmart = async (
  prompt: string,
  taskType: 'chat' | 'summarize' | 'quiz' | 'studyplan'
): Promise<string> => {
  // Provider preferences by task type
  const preferences: Record<string, LLMProvider> = {
    chat: 'groq',        // Fastest for interactive chat
    summarize: 'gemini', // Good at summarization
    quiz: 'gemini',      // Good at structured output
    studyplan: 'gemini', // Good at detailed planning
  };

  const preferred = preferences[taskType] || 'gemini';
  const { response } = await callLLMWithFallback(prompt, preferred);
  return response;
};

/**
 * Check which providers are configured
 */
export const getConfiguredProviders = async (): Promise<LLMProvider[]> => {
  const keys = await loadAPIKeys();
  const providers: LLMProvider[] = [];

  if (keys.gemini) providers.push('gemini');
  if (keys.groq) providers.push('groq');
  if (keys.huggingface) providers.push('huggingface');

  return providers;
};
```

---

## Quick Reference

| Provider | Free Limit | Best For | Speed |
|----------|------------|----------|-------|
| Gemini | 60 req/min | Complex tasks, JSON output | Fast |
| Groq | 100+ req/min | Chat, quick responses | Very Fast |
| HuggingFace | Variable | Specialized tasks | Variable |
| OSRM | ~10k/month | Routing | Fast |
| OSM | Unlimited | Map tiles | Fast |

---

**Document Version:** 1.0
**Last Updated:** November 2025
