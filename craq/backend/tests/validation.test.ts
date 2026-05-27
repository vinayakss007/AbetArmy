import { z } from 'zod';

// Auth schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(255),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

// Issue schema
const createIssueSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(500),
    description: z.string().min(1),
    images: z.array(z.string()).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    industry: z.string().optional(),
    stage: z.string().optional(),
    type: z.string().optional(),
  }),
});

// Solution schemas
const createSolutionSchema = z.object({
  body: z.object({
    content: z.string().min(1),
    images: z.array(z.string()).optional(),
  }),
});

// Vote schema
const voteSchema = z.object({
  body: z.object({
    targetType: z.enum(['issue', 'solution']),
    targetId: z.string().uuid(),
    value: z.number().refine((v) => v === 1 || v === -1),
  }),
});

// Comment schema
const createCommentSchema = z.object({
  body: z.object({
    parentType: z.enum(['issue', 'solution', 'comment']),
    parentId: z.string().uuid(),
    content: z.string().min(1),
  }),
});

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
