// Type declarations for environment variables
// This file tells TypeScript about the @env module

declare module '@env' {
  // LLM API Keys
  export const GEMINI_API_KEY: string;
  export const GROQ_API_KEY: string;
  export const HUGGINGFACE_API_KEY: string;

  // Supabase (Optional)
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}
