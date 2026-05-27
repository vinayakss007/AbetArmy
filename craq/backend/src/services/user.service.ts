import pool from '../config/database';
import { User } from '../types';
import { createError } from '../middleware/errorHandler';

export class UserService {
  async getProfile(id: string): Promise<Omit<User, 'password_hash'>> {
    const result = await pool.query(
      `SELECT id, email, name, avatar_url, bio, industry, stage, role, skills, reputation_score, google_id, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }
    return result.rows[0];
  }

  async updateProfile(
    id: string,
    data: Partial<{
      name: string;
      bio: string;
      industry: string;
      stage: string;
      avatar_url: string;
      skills: string[];
    }>
  ): Promise<Omit<User, 'password_hash'>> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      params.push(data.bio);
    }
    if (data.industry !== undefined) {
      fields.push(`industry = $${paramIndex++}`);
      params.push(data.industry);
    }
    if (data.stage !== undefined) {
      fields.push(`stage = $${paramIndex++}`);
      params.push(data.stage);
    }
    if (data.avatar_url !== undefined) {
      fields.push(`avatar_url = $${paramIndex++}`);
      params.push(data.avatar_url);
    }
    if (data.skills !== undefined) {
      fields.push(`skills = $${paramIndex++}`);
      params.push(JSON.stringify(data.skills));
    }

    if (fields.length === 0) {
      return this.getProfile(id);
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, name, avatar_url, bio, industry, stage, role, skills, reputation_score, google_id, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404, 'USER_NOT_FOUND');
    }

    return result.rows[0];
  }

  async getReputation(id: string): Promise<{
    score: number;
    accepted_solutions: number;
    total_upvotes: number;
  }> {
    // Count accepted solutions by this user
    const solutionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM solutions WHERE author_id = $1 AND is_accepted = true',
      [id]
    );

    // Count total upvotes on user's content
    const upvotesResult = await pool.query(
      `SELECT COALESCE(SUM(upvotes), 0) as total FROM (
         SELECT upvotes FROM issues WHERE author_id = $1
         UNION ALL
         SELECT upvotes FROM solutions WHERE author_id = $1
       ) as combined`,
      [id]
    );

    const acceptedSolutions = parseInt(solutionsResult.rows[0].count, 10);
    const totalUpvotes = parseInt(upvotesResult.rows[0].total, 10);
    const score = acceptedSolutions * 10 + totalUpvotes;

    return {
      score,
      accepted_solutions: acceptedSolutions,
      total_upvotes: totalUpvotes,
    };
  }

  async getActivity(id: string): Promise<{
    issues: number;
    solutions: number;
    comments: number;
  }> {
    const issuesResult = await pool.query(
      'SELECT COUNT(*) as count FROM issues WHERE author_id = $1',
      [id]
    );
    const solutionsResult = await pool.query(
      'SELECT COUNT(*) as count FROM solutions WHERE author_id = $1',
      [id]
    );
    const commentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE author_id = $1',
      [id]
    );

    return {
      issues: parseInt(issuesResult.rows[0].count, 10),
      solutions: parseInt(solutionsResult.rows[0].count, 10),
      comments: parseInt(commentsResult.rows[0].count, 10),
    };
  }

  async searchUsers(query: string): Promise<Omit<User, 'password_hash'>[]> {
    const result = await pool.query(
      `SELECT id, email, name, avatar_url, bio, industry, stage, role, skills, reputation_score, google_id, created_at, updated_at
       FROM users WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY reputation_score DESC LIMIT 50`,
      [`%${query}%`]
    );
    return result.rows;
  }
}

export default new UserService();
