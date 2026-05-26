import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { Solution } from '../types';
import { createError } from '../middleware/errorHandler';

export class SolutionService {
  async create(
    issueId: string,
    authorId: string,
    data: { content: string; images?: string[] }
  ): Promise<Solution> {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO solutions (id, issue_id, author_id, content, images)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, issueId, authorId, data.content, JSON.stringify(data.images || [])]
    );
    return result.rows[0];
  }

  async getByIssue(issueId: string): Promise<Solution[]> {
    const result = await pool.query(
      'SELECT * FROM solutions WHERE issue_id = $1 ORDER BY is_accepted DESC, upvotes DESC, created_at DESC',
      [issueId]
    );
    return result.rows;
  }

  async getById(id: string): Promise<Solution> {
    const result = await pool.query('SELECT * FROM solutions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw createError('Solution not found', 404, 'SOLUTION_NOT_FOUND');
    }
    return result.rows[0];
  }

  async update(
    id: string,
    data: Partial<{ content: string; images: string[] }>
  ): Promise<Solution> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      params.push(data.content);
    }
    if (data.images !== undefined) {
      fields.push(`images = $${paramIndex++}`);
      params.push(JSON.stringify(data.images));
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE solutions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw createError('Solution not found', 404, 'SOLUTION_NOT_FOUND');
    }

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM solutions WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      throw createError('Solution not found', 404, 'SOLUTION_NOT_FOUND');
    }
  }

  async accept(id: string, issueId: string): Promise<Solution> {
    // Unaccept any previously accepted solution for this issue
    await pool.query(
      'UPDATE solutions SET is_accepted = false WHERE issue_id = $1 AND is_accepted = true',
      [issueId]
    );

    // Accept the new solution
    const result = await pool.query(
      `UPDATE solutions SET is_accepted = true, updated_at = NOW() WHERE id = $1 AND issue_id = $2 RETURNING *`,
      [id, issueId]
    );

    if (result.rows.length === 0) {
      throw createError('Solution not found', 404, 'SOLUTION_NOT_FOUND');
    }

    // Mark issue as solved
    await pool.query(
      `UPDATE issues SET status = 'solved', accepted_solution_id = $1, updated_at = NOW() WHERE id = $2`,
      [id, issueId]
    );

    return result.rows[0];
  }
}

export default new SolutionService();
