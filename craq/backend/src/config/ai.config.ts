export interface AIProvider {
  name: string;
  type: 'openai' | 'anthropic' | 'groq' | 'ollama' | 'openai-compatible';
  apiKey: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
}

export interface AIConfig {
  providers: AIProvider[];
  fallbackOrder: string[];
  maxRetries: number;
  timeout: number;
}

function getProviders(): AIProvider[] {
  const providers: AIProvider[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai',
      type: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      enabled: true,
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: 'anthropic',
      type: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      enabled: true,
    });
  }

  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: 'groq',
      type: 'groq',
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
      enabled: true,
    });
  }

  if (process.env.OLLAMA_BASE_URL) {
    providers.push({
      name: 'ollama',
      type: 'ollama',
      apiKey: '',
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3',
      enabled: true,
    });
  }

  // Support generic OpenAI-compatible providers
  if (process.env.AI_COMPATIBLE_API_KEY) {
    providers.push({
      name: process.env.AI_COMPATIBLE_NAME || 'custom',
      type: 'openai-compatible',
      apiKey: process.env.AI_COMPATIBLE_API_KEY,
      baseUrl: process.env.AI_COMPATIBLE_BASE_URL || '',
      model: process.env.AI_COMPATIBLE_MODEL || 'default',
      enabled: true,
    });
  }

  return providers;
}

function getFallbackOrder(): string[] {
  if (process.env.AI_FALLBACK_ORDER) {
    return process.env.AI_FALLBACK_ORDER.split(',').map((s) => s.trim());
  }
  return ['openai', 'anthropic', 'groq', 'ollama', 'custom'];
}

export const aiConfig: AIConfig = {
  providers: getProviders(),
  fallbackOrder: getFallbackOrder(),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2', 10),
  timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
};

export default aiConfig;
