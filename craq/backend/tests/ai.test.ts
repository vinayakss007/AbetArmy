import { AIService } from '../src/services/ai.service';

// Mock the ai config
jest.mock('../src/config/ai.config', () => ({
  __esModule: true,
  default: {
    providers: [
      {
        name: 'openai',
        type: 'openai',
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        enabled: true,
      },
    ],
    fallbackOrder: ['openai'],
    maxRetries: 1,
    timeout: 5000,
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    jest.clearAllMocks();
  });

  describe('categorizeIssue', () => {
    it('should categorize an issue using AI', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  category: 'technical',
                  tags: ['api', 'backend'],
                }),
              },
            },
          ],
        }),
      });

      const result = await aiService.categorizeIssue(
        'API rate limiting',
        'Need help implementing rate limiting for our API'
      );

      expect(result.category).toBe('technical');
      expect(result.tags).toContain('api');
      expect(result.provider).toBe('openai');
    });

    it('should return default category on parse failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'invalid json response',
              },
            },
          ],
        }),
      });

      const result = await aiService.categorizeIssue('Test', 'Test description');

      expect(result.category).toBe('general');
      expect(result.tags).toEqual([]);
    });
  });

  describe('suggestSimilarIssues', () => {
    it('should suggest similar issues', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  suggestions: ['rate limiting patterns', 'API throttling'],
                }),
              },
            },
          ],
        }),
      });

      const result = await aiService.suggestSimilarIssues(
        'Rate limiting',
        'How to implement rate limiting'
      );

      expect(result.suggestions).toHaveLength(2);
      expect(result.provider).toBe('openai');
    });
  });

  describe('generateSolutionDraft', () => {
    it('should generate a solution draft', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Here is a solution draft for rate limiting...',
              },
            },
          ],
        }),
      });

      const result = await aiService.generateSolutionDraft({
        title: 'Rate limiting',
        description: 'Need rate limiting for API',
        category: 'technical',
      });

      expect(result.draft).toContain('rate limiting');
      expect(result.provider).toBe('openai');
    });
  });

  describe('summarizeThread', () => {
    it('should summarize a thread', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'The discussion concluded that...',
              },
            },
          ],
        }),
      });

      const result = await aiService.summarizeThread([
        'Comment 1: We should use Redis',
        'Comment 2: I agree with Redis',
      ]);

      expect(result.summary).toContain('discussion');
      expect(result.provider).toBe('openai');
    });
  });

  describe('fallback behavior', () => {
    it('should throw when all providers fail', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        aiService.categorizeIssue('Test', 'Test')
      ).rejects.toThrow('All AI providers failed');
    });
  });
});
