import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { Vote } from '../types';
import { createError } from '../middleware/errorHandler';

export class VoteService {
  async vote(
    userId: string,
    targetType: string,
    targetId: string,
    value: number
  ): Promise<{ vote: Vote | null; removed: boolean }> {
    if (value !== 1 && value !== -1) {
      throw createError('Vote value must be 1 or -1', 400, 'INVALID_VOTE_VALUE');
    }

    // Check if user already voted on this target
    const existing = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
      [userId, targetType, targetId]
    );

    if (existing.rows.length > 0) {
      const existingVote = existing.rows[0];

      if (existingVote.value === value) {
        // Same vote - remove it (toggle off)
        await pool.query('DELETE FROM votes WHERE id = $1', [existingVote.id]);
        await this.updateTargetVoteCount(targetType, targetId, value, -1);
        return { vote: null, removed: true };
      } else {
        // Different vote - update it
        const result = await pool.query(
          'UPDATE votes SET value = $1 WHERE id = $2 RETURNING *',
          [value, existingVote.id]
        );
        // Remove old vote and add new
        await this.updateTargetVoteCount(targetType, targetId, existingVote.value, -1);
        await this.updateTargetVoteCount(targetType, targetId, value, 1);
        return { vote: result.rows[0], removed: false };
      }
    }

    // New vote
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO votes (id, user_id, target_type, target_id, value) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, userId, targetType, targetId, value]
    );

    await this.updateTargetVoteCount(targetType, targetId, value, 1);

    return { vote: result.rows[0], removed: false };
  }

  async getVotes(
    targetType: string,
    targetId: string
  ): Promise<{ upvotes: number; downvotes: number; total: number }> {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) as upvotes,
         COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0) as downvotes
       FROM votes WHERE target_type = $1 AND target_id = $2`,
      [targetType, targetId]
    );

    const { upvotes, downvotes } = result.rows[0];
    return {
      upvotes: parseInt(upvotes, 10),
      downvotes: parseInt(downvotes, 10),
      total: parseInt(upvotes, 10) - parseInt(downvotes, 10),
    };
  }

  async getUserVote(
    userId: string,
    targetType: string,
    targetId: string
  ): Promise<Vote | null> {
    const result = await pool.query(
      'SELECT * FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
      [userId, targetType, targetId]
    );
    return result.rows[0] || null;
  }

  private async updateTargetVoteCount(
    targetType: string,
    targetId: string,
    value: number,
    direction: number
  ): Promise<void> {
    const table = targetType === 'issue' ? 'issues' : 'solutions';
    const column = value === 1 ? 'upvotes' : 'downvotes';

    await pool.query(
      `UPDATE ${table} SET ${column} = ${column} + $1 WHERE id = $2`,
      [direction, targetId]
    );
  }
}

export default new VoteService();
