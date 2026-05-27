import { registerSchema, loginSchema } from '../src/routes/auth.routes';
import { createIssueSchema } from '../src/routes/issue.routes';
import { createSolutionSchema } from '../src/routes/solution.routes';
import { voteSchema } from '../src/routes/vote.routes';
import { createCommentSchema } from '../src/routes/comment.routes';

describe('Auth validation schemas', () => {
  describe('register schema', () => {
    it('should reject missing email', () => {
      const result = registerSchema.safeParse({
        body: { password: 'password123', name: 'Test' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        body: { email: 'not-an-email', password: 'password123', name: 'Test' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        body: { email: 'test@example.com', password: '1234567', name: 'Test' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const result = registerSchema.safeParse({
        body: { email: 'test@example.com', password: 'password123', name: '' },
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid input', () => {
      const result = registerSchema.safeParse({
        body: { email: 'test@example.com', password: 'password123', name: 'Test User' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('login schema', () => {
    it('should reject missing email', () => {
      const result = loginSchema.safeParse({
        body: { password: 'password123' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        body: { email: 'test@example.com', password: '' },
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid input', () => {
      const result = loginSchema.safeParse({
        body: { email: 'test@example.com', password: 'password123' },
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('Issue validation schemas', () => {
  it('should reject empty title', () => {
    const result = createIssueSchema.safeParse({
      body: { title: '', description: 'Some description' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty description', () => {
    const result = createIssueSchema.safeParse({
      body: { title: 'Valid Title', description: '' },
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid input', () => {
    const result = createIssueSchema.safeParse({
      body: { title: 'Valid Title', description: 'Some description' },
    });
    expect(result.success).toBe(true);
  });
});

describe('Solution validation schemas', () => {
  it('should reject empty content', () => {
    const result = createSolutionSchema.safeParse({
      body: { content: '' },
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid content', () => {
    const result = createSolutionSchema.safeParse({
      body: { content: 'This is a valid solution' },
    });
    expect(result.success).toBe(true);
  });

  it('should accept content with images', () => {
    const result = createSolutionSchema.safeParse({
      body: { content: 'Solution content', images: ['http://img.com/1.png'] },
    });
    expect(result.success).toBe(true);
  });
});

describe('Vote validation schemas', () => {
  it('should reject invalid targetType', () => {
    const result = voteSchema.safeParse({
      body: { targetType: 'invalid', targetId: '550e8400-e29b-41d4-a716-446655440000', value: 1 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-uuid targetId', () => {
    const result = voteSchema.safeParse({
      body: { targetType: 'issue', targetId: 'not-a-uuid', value: 1 },
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid vote value', () => {
    const result = voteSchema.safeParse({
      body: { targetType: 'issue', targetId: '550e8400-e29b-41d4-a716-446655440000', value: 2 },
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid upvote', () => {
    const result = voteSchema.safeParse({
      body: { targetType: 'issue', targetId: '550e8400-e29b-41d4-a716-446655440000', value: 1 },
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid downvote', () => {
    const result = voteSchema.safeParse({
      body: { targetType: 'solution', targetId: '550e8400-e29b-41d4-a716-446655440000', value: -1 },
    });
    expect(result.success).toBe(true);
  });
});

describe('Comment validation schemas', () => {
  it('should reject empty content', () => {
    const result = createCommentSchema.safeParse({
      body: { parentType: 'issue', parentId: '550e8400-e29b-41d4-a716-446655440000', content: '' },
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid parentType', () => {
    const result = createCommentSchema.safeParse({
      body: { parentType: 'invalid', parentId: '550e8400-e29b-41d4-a716-446655440000', content: 'test' },
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid comment', () => {
    const result = createCommentSchema.safeParse({
      body: { parentType: 'issue', parentId: '550e8400-e29b-41d4-a716-446655440000', content: 'Great issue!' },
    });
    expect(result.success).toBe(true);
  });
});
