import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { User, AuthPayload, TokenPair } from '../types';
import { createError } from '../middleware/errorHandler';

const KNOWN_UNSAFE_SECRETS = [
  'dev-secret-key',
  'dev-refresh-secret-key',
  'change-me-in-production',
];

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Validate secrets at startup in production
if (process.env.NODE_ENV === 'production') {
  if (KNOWN_UNSAFE_SECRETS.includes(JWT_SECRET)) {
    console.error('FATAL: JWT_SECRET is set to a known default value. Set a secure secret before running in production.');
    process.exit(1);
  }
  if (KNOWN_UNSAFE_SECRETS.includes(JWT_REFRESH_SECRET)) {
    console.error('FATAL: JWT_REFRESH_SECRET is set to a known default value. Set a secure secret before running in production.');
    process.exit(1);
  }
}

// Parse duration string to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // default 1h
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 3600;
  }
}

export class AuthService {
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: Omit<User, 'password_hash'>; tokens: TokenPair }> {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw createError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = uuidv4();

    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, avatar_url, bio, industry, stage, role, skills, reputation_score, google_id, created_at, updated_at`,
      [id, email, passwordHash, name]
    );

    const user = result.rows[0];
    const tokens = this.generateToken(user.id, user.email, user.role);

    return { user, tokens };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'password_hash'>; tokens: TokenPair }> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      throw createError(
        'This account uses Google sign-in',
        401,
        'GOOGLE_ACCOUNT'
      );
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const tokens = this.generateToken(user.id, user.email, user.role);

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async googleAuth(googleProfile: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
  }): Promise<{ user: Omit<User, 'password_hash'>; tokens: TokenPair }> {
    let result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleProfile.id]
    );

    if (result.rows.length === 0) {
      // Check if email exists
      result = await pool.query('SELECT * FROM users WHERE email = $1', [
        googleProfile.email,
      ]);

      if (result.rows.length > 0) {
        // Link Google account to existing user
        await pool.query(
          'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE email = $3',
          [googleProfile.id, googleProfile.avatar_url, googleProfile.email]
        );
        result = await pool.query('SELECT * FROM users WHERE email = $1', [
          googleProfile.email,
        ]);
      } else {
        // Create new user
        const id = uuidv4();
        result = await pool.query(
          `INSERT INTO users (id, email, name, avatar_url, google_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [id, googleProfile.email, googleProfile.name, googleProfile.avatar_url, googleProfile.id]
        );
      }
    }

    const user = result.rows[0];
    const tokens = this.generateToken(user.id, user.email, user.role);

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  generateToken(userId: string, email: string, role: string): TokenPair {
    const payload: AuthPayload = { userId, email, role };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: parseDuration(JWT_EXPIRES_IN),
    });

    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
      expiresIn: parseDuration(JWT_REFRESH_EXPIRES_IN),
    });

    return { accessToken, refreshToken };
  }

  verifyToken(token: string): AuthPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch {
      throw createError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }
  }

  async refreshToken(token: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };

      const result = await pool.query('SELECT * FROM users WHERE id = $1', [
        decoded.userId,
      ]);

      if (result.rows.length === 0) {
        throw createError('User not found', 404, 'USER_NOT_FOUND');
      }

      const user = result.rows[0];
      return this.generateToken(user.id, user.email, user.role);
    } catch (error) {
      if ((error as any).statusCode) {
        throw error;
      }
      throw createError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const result = await pool.query(
      `SELECT id, email, name, avatar_url, bio, industry, stage, role, skills, reputation_score, google_id, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  }
}

export default new AuthService();
