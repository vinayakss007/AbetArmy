import aiConfig, { AIProvider } from '../config/ai.config';
import { createError } from '../middleware/errorHandler';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

export class AIService {
  private getOrderedProviders(): AIProvider[] {
    const ordered: AIProvider[] = [];
    for (const name of aiConfig.fallbackOrder) {
      const provider = aiConfig.providers.find(
        (p) => p.name === name && p.enabled
      );
      if (provider) {
        ordered.push(provider);
      }
    }
    // Add any enabled providers not in fallback order
    for (const provider of aiConfig.providers) {
      if (provider.enabled && !ordered.includes(provider)) {
        ordered.push(provider);
      }
    }
    return ordered;
  }

  private async callProvider(
    provider: AIProvider,
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<AIResponse> {
    const { temperature = 0.7, maxTokens = 1024 } = options;

    if (provider.type === 'anthropic') {
      return this.callAnthropic(provider, messages, temperature, maxTokens);
    }

    // OpenAI, Groq, Ollama, and OpenAI-compatible all use the same format
    return this.callOpenAICompatible(provider, messages, temperature, maxTokens);
  }

  private async callOpenAICompatible(
    provider: AIProvider,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    const url = `${provider.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(aiConfig.timeout),
    });

    if (!response.ok) {
      throw new Error(
        `Provider ${provider.name} returned ${response.status}: ${await response.text()}`
      );
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    return {
      content: data.choices[0].message.content,
      provider: provider.name,
      model: provider.model,
    };
  }

  private async callAnthropic(
    provider: AIProvider,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): Promise<AIResponse> {
    const url = `${provider.baseUrl}/v1/messages`;

    // Extract system message
    const systemMsg = messages.find((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: maxTokens,
        temperature,
        system: systemMsg?.content || '',
        messages: userMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
      signal: AbortSignal.timeout(aiConfig.timeout),
    });

    if (!response.ok) {
      throw new Error(
        `Provider ${provider.name} returned ${response.status}: ${await response.text()}`
      );
    }

    const data = (await response.json()) as { content: Array<{ text: string }> };
    return {
      content: data.content[0].text,
      provider: provider.name,
      model: provider.model,
    };
  }

  private async callWithFallback(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<AIResponse> {
    const providers = this.getOrderedProviders();

    if (providers.length === 0) {
      throw createError(
        'No AI providers configured',
        503,
        'NO_AI_PROVIDERS'
      );
    }

    const errors: string[] = [];
    for (const provider of providers) {
      for (let attempt = 0; attempt <= aiConfig.maxRetries; attempt++) {
        try {
          return await this.callProvider(provider, messages, options);
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          errors.push(`${provider.name} (attempt ${attempt + 1}): ${msg}`);
        }
      }
    }

    throw createError(
      `All AI providers failed: ${errors.join('; ')}`,
      503,
      'AI_PROVIDERS_FAILED'
    );
  }

  async categorizeIssue(
    title: string,
    description: string
  ): Promise<{ category: string; tags: string[]; provider: string }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a categorization assistant for an entrepreneur platform. Given an issue title and description, return a JSON object with "category" (one of: technical, business, legal, marketing, finance, operations, hr, product) and "tags" (array of relevant tags). Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Title: ${title}\nDescription: ${description}`,
      },
    ];

    const response = await this.callWithFallback(messages, {
      temperature: 0.3,
    });

    try {
      const parsed = JSON.parse(response.content);
      return { ...parsed, provider: response.provider };
    } catch {
      return {
        category: 'general',
        tags: [],
        provider: response.provider,
      };
    }
  }

  async suggestSimilarIssues(
    title: string,
    description: string
  ): Promise<{ suggestions: string[]; provider: string }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a search assistant. Given an issue title and description, suggest 3-5 related topics or search queries that could help find similar issues. Return a JSON object with "suggestions" (array of strings). Return only valid JSON.',
      },
      {
        role: 'user',
        content: `Title: ${title}\nDescription: ${description}`,
      },
    ];

    const response = await this.callWithFallback(messages, {
      temperature: 0.5,
    });

    try {
      const parsed = JSON.parse(response.content);
      return { suggestions: parsed.suggestions, provider: response.provider };
    } catch {
      return { suggestions: [], provider: response.provider };
    }
  }

  async generateSolutionDraft(issue: {
    title: string;
    description: string;
    category?: string;
  }): Promise<{ draft: string; provider: string }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a helpful assistant for entrepreneurs. Given an issue, provide a concise solution draft that addresses the problem. Be practical and actionable.',
      },
      {
        role: 'user',
        content: `Issue: ${issue.title}\nDescription: ${issue.description}${issue.category ? `\nCategory: ${issue.category}` : ''}`,
      },
    ];

    const response = await this.callWithFallback(messages, {
      temperature: 0.7,
      maxTokens: 2048,
    });

    return { draft: response.content, provider: response.provider };
  }

  async summarizeThread(
    comments: string[]
  ): Promise<{ summary: string; provider: string }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'You are a summarization assistant. Summarize the following discussion thread concisely, highlighting key points and any consensus reached.',
      },
      {
        role: 'user',
        content: comments.join('\n---\n'),
      },
    ];

    const response = await this.callWithFallback(messages, {
      temperature: 0.3,
      maxTokens: 512,
    });

    return { summary: response.content, provider: response.provider };
  }

  async chat(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number; stream?: boolean } = {}
  ): Promise<AIResponse> {
    if (options.stream) {
      // For streaming, we return the provider info and the caller handles SSE
      return this.callWithFallback(messages, options);
    }
    return this.callWithFallback(messages, options);
  }

  async *chatStream(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): AsyncGenerator<string> {
    const providers = this.getOrderedProviders();
    if (providers.length === 0) {
      throw createError('No AI providers configured', 503, 'NO_AI_PROVIDERS');
    }

    const provider = providers[0];
    const { temperature = 0.7, maxTokens = 1024 } = options;

    if (provider.type === 'anthropic') {
      yield* this.streamAnthropic(provider, messages, temperature, maxTokens);
    } else {
      yield* this.streamOpenAICompatible(
        provider,
        messages,
        temperature,
        maxTokens
      );
    }
  }

  private async *streamOpenAICompatible(
    provider: AIProvider,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const url = `${provider.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: AbortSignal.timeout(aiConfig.timeout),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Provider ${provider.name} streaming failed`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  private async *streamAnthropic(
    provider: AIProvider,
    messages: ChatMessage[],
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string> {
    const url = `${provider.baseUrl}/v1/messages`;
    const systemMsg = messages.find((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: maxTokens,
        temperature,
        stream: true,
        system: systemMsg?.content || '',
        messages: userMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
      signal: AbortSignal.timeout(aiConfig.timeout),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Anthropic streaming failed`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (
              parsed.type === 'content_block_delta' &&
              parsed.delta?.text
            ) {
              yield parsed.delta.text;
            }
          } catch {
            // Skip malformed
          }
        }
      }
    }
  }
}

export default new AIService();
