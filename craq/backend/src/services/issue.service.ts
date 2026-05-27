import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { Issue } from '../types';
import { createError } from '../middleware/errorHandler';

export interface IssueFilters {
  category?: string;
  industry?: string;
  stage?: string;
  type?: string;
  status?: string;
  tags?: string[];
  trending?: boolean;
  recent?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
}

export class IssueService {
  async create(
    authorId: string,
    data: {
      title: string;
      description: string;
      images?: string[];
      category?: string;
      tags?: string[];
      industry?: string;
      stage?: string;
      type?: string;
    }
  ): Promise<Issue> {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO issues (id, author_id, title, description, images, category, tags, industry, stage, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
        authorId,
        data.title,
        data.description,
        JSON.stringify(data.images || []),
        data.category || null,
        JSON.stringify(data.tags || []),
        data.industry || null,
        data.stage || null,
        data.type || null,
      ]
    );
    return result.rows[0];
  }

  async getById(id: string): Promise<Issue> {
    const result = await pool.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw createError('Issue not found', 404, 'ISSUE_NOT_FOUND');
    }
    return result.rows[0];
  }

  async list(
    filters: IssueFilters = {},
    pagination: Pagination = { page: 1, limit: 20 }
  ): Promise<{ issues: Issue[]; total: number }> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(filters.category);
    }
    if (filters.industry) {
      conditions.push(`industry = $${paramIndex++}`);
      params.push(filters.industry);
    }
    if (filters.stage) {
      conditions.push(`stage = $${paramIndex++}`);
      params.push(filters.stage);
    }
    if (filters.type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(filters.type);
    }
    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`tags && $${paramIndex++}`);
      params.push(JSON.stringify(filters.tags));
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY created_at DESC';
    if (filters.trending) {
      orderClause = 'ORDER BY (upvotes - downvotes) DESC, created_at DESC';
    } else if (filters.recent) {
      orderClause = 'ORDER BY created_at DESC';
    }

    const offset = (pagination.page - 1) * pagination.limit;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM issues ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM issues ${whereClause} ${orderClause} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, pagination.limit, offset]
    );

    return {
      issues: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      images: string[];
      category: string;
      tags: string[];
      industry: string;
      stage: string;
      type: string;
      status: string;
    }>
  ): Promise<Issue> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      params.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      params.push(data.description);
    }
    if (data.images !== undefined) {
      fields.push(`images = $${paramIndex++}`);
      params.push(JSON.stringify(data.images));
    }
    if (data.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      params.push(data.category);
    }
    if (data.tags !== undefined) {
      fields.push(`tags = $${paramIndex++}`);
      params.push(JSON.stringify(data.tags));
    }
    if (data.industry !== undefined) {
      fields.push(`industry = $${paramIndex++}`);
      params.push(data.industry);
    }
    if (data.stage !== undefined) {
      fields.push(`stage = $${paramIndex++}`);
      params.push(data.stage);
    }
    if (data.type !== undefined) {
      fields.push(`type = $${paramIndex++}`);
      params.push(data.type);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      params.push(data.status);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE issues SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw createError('Issue not found', 404, 'ISSUE_NOT_FOUND');
    }

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM issues WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      throw createError('Issue not found', 404, 'ISSUE_NOT_FOUND');
    }
  }

  async markSolved(id: string, solutionId: string): Promise<Issue> {
    const result = await pool.query(
      `UPDATE issues SET status = 'solved', accepted_solution_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [solutionId, id]
    );
    if (result.rows.length === 0) {
      throw createError('Issue not found', 404, 'ISSUE_NOT_FOUND');
    }
    return result.rows[0];
  }

  async search(
    query: string,
    filters: IssueFilters = {}
  ): Promise<Issue[]> {
    const conditions: string[] = [
      `(to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', $1))`,
    ];
    const params: unknown[] = [query];
    let paramIndex = 2;

    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(filters.category);
    }
    if (filters.industry) {
      conditions.push(`industry = $${paramIndex++}`);
      params.push(filters.industry);
    }
    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }

    const result = await pool.query(
      `SELECT * FROM issues WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT 50`,
      params
    );

    return result.rows;
  }
}

export default new IssueService();
