import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { Tool, ToolReview } from '../types';
import { createError } from '../middleware/errorHandler';

export class ToolService {
  async create(data: {
    name: string;
    description?: string;
    url?: string;
    category?: string;
    linked_issue_types?: string[];
  }): Promise<Tool> {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO tools (id, name, description, url, category, linked_issue_types)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id,
        data.name,
        data.description || null,
        data.url || null,
        data.category || null,
        JSON.stringify(data.linked_issue_types || []),
      ]
    );
    return result.rows[0];
  }

  async list(
    category?: string,
    filters: { search?: string } = {}
  ): Promise<Tool[]> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }
    if (filters.search) {
      conditions.push(
        `(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      );
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT * FROM tools ${whereClause} ORDER BY name ASC`,
      params
    );
    return result.rows;
  }

  async getById(id: string): Promise<Tool> {
    const result = await pool.query('SELECT * FROM tools WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw createError('Tool not found', 404, 'TOOL_NOT_FOUND');
    }
    return result.rows[0];
  }

  async addReview(
    toolId: string,
    userId: string,
    rating: number,
    content: string | null
  ): Promise<ToolReview> {
    // Verify tool exists
    await this.getById(toolId);

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO tool_reviews (id, tool_id, user_id, rating, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, toolId, userId, rating, content]
    );
    return result.rows[0];
  }

  async getReviews(toolId: string): Promise<ToolReview[]> {
    const result = await pool.query(
      'SELECT * FROM tool_reviews WHERE tool_id = $1 ORDER BY created_at DESC',
      [toolId]
    );
    return result.rows;
  }
}

export default new ToolService();
