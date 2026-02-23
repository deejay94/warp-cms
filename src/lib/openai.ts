import OpenAI from 'openai';

let openai: OpenAI | null = null;

export function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export function isOpenAIConfigured() {
  return !!process.env.OPENAI_API_KEY;
}
