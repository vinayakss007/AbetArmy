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

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock the target row to prevent concurrent counter drift
      const table = targetType === 'issue' ? 'issues' : 'solutions';
      await client.query(
        `SELECT id FROM ${table} WHERE id = $1 FOR UPDATE`,
        [targetId]
      );

      // Check if user already voted on this target
      const existing = await client.query(
        'SELECT * FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
        [userId, targetType, targetId]
      );

      let result: { vote: Vote | null; removed: boolean };

      if (existing.rows.length > 0) {
        const existingVote = existing.rows[0];

        if (existingVote.value === value) {
          // Same vote - remove it (toggle off)
          await client.query('DELETE FROM votes WHERE id = $1', [existingVote.id]);
          await this.updateTargetVoteCountWithClient(client, targetType, targetId, value, -1);
          result = { vote: null, removed: true };
        } else {
          // Different vote - update it
          const updateResult = await client.query(
            'UPDATE votes SET value = $1 WHERE id = $2 RETURNING *',
            [value, existingVote.id]
          );
          // Remove old vote count and add new
          await this.updateTargetVoteCountWithClient(client, targetType, targetId, existingVote.value, -1);
          await this.updateTargetVoteCountWithClient(client, targetType, targetId, value, 1);
          result = { vote: updateResult.rows[0], removed: false };
        }
      } else {
        // New vote
        const id = uuidv4();
        const insertResult = await client.query(
          'INSERT INTO votes (id, user_id, target_type, target_id, value) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [id, userId, targetType, targetId, value]
        );
        await this.updateTargetVoteCountWithClient(client, targetType, targetId, value, 1);
        result = { vote: insertResult.rows[0], removed: false };
      }

      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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

  private async updateTargetVoteCountWithClient(
    client: { query: typeof pool.query },
    targetType: string,
    targetId: string,
    value: number,
    direction: number
  ): Promise<void> {
    const table = targetType === 'issue' ? 'issues' : 'solutions';
    const column = value === 1 ? 'upvotes' : 'downvotes';

    await client.query(
      `UPDATE ${table} SET ${column} = ${column} + $1 WHERE id = $2`,
      [direction, targetId]
    );
  }
}

export default new VoteService();
