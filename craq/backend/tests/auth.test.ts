import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock the database pool
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

import pool from '../src/config/database';
import { AuthService } from '../src/services/auth.service';

const mockPool = pool as jest.Mocked<typeof pool>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'test-uuid',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: null,
        bio: null,
        industry: null,
        stage: null,
        role: 'user',
        skills: [],
        reputation_score: 0,
        google_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // First query: check if email exists
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      // Second query: insert user
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.register(
        'test@example.com',
        'password123',
        'Test User'
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'existing-id' }],
      });

      await expect(
        authService.register('existing@example.com', 'password123', 'Test')
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 12);
      const mockUser = {
        id: 'test-uuid',
        email: 'test@example.com',
        password_hash: passwordHash,
        name: 'Test User',
        avatar_url: null,
        bio: null,
        industry: null,
        stage: null,
        role: 'user',
        skills: [],
        reputation_score: 0,
        google_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect((result.user as any).password_hash).toBeUndefined();
    });

    it('should throw error for invalid email', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(
        authService.login('wrong@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      const passwordHash = await bcrypt.hash('correctpassword', 12);
      const mockUser = {
        id: 'test-uuid',
        email: 'test@example.com',
        password_hash: passwordHash,
        name: 'Test User',
        role: 'user',
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('generateToken', () => {
    it('should generate valid access and refresh tokens', () => {
      const tokens = authService.generateToken(
        'user-id',
        'test@example.com',
        'user'
      );

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      const decoded = jwt.verify(
        tokens.accessToken,
        process.env.JWT_SECRET || 'dev-secret-key'
      ) as any;
      expect(decoded.userId).toBe('user-id');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('user');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const tokens = authService.generateToken(
        'user-id',
        'test@example.com',
        'user'
      );
      const payload = authService.verifyToken(tokens.accessToken);

      expect(payload.userId).toBe('user-id');
      expect(payload.email).toBe('test@example.com');
    });

    it('should throw error for invalid token', () => {
      expect(() => authService.verifyToken('invalid-token')).toThrow(
        'Invalid or expired token'
      );
    });
  });
});
