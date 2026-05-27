import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';
import { Comment } from '../types';
import { createError } from '../middleware/errorHandler';

export class CommentService {
  async create(
    parentType: string,
    parentId: string,
    authorId: string,
    content: string
  ): Promise<Comment> {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO comments (id, parent_type, parent_id, author_id, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, parentType, parentId, authorId, content]
    );
    return result.rows[0];
  }

  async getByParent(parentType: string, parentId: string): Promise<Comment[]> {
    const result = await pool.query(
      'SELECT * FROM comments WHERE parent_type = $1 AND parent_id = $2 ORDER BY created_at ASC',
      [parentType, parentId]
    );
    return result.rows;
  }

  async getById(id: string): Promise<Comment> {
    const result = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw createError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }
    return result.rows[0];
  }

  async update(id: string, content: string): Promise<Comment> {
    const result = await pool.query(
      'UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [content, id]
    );
    if (result.rows.length === 0) {
      throw createError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      throw createError('Comment not found', 404, 'COMMENT_NOT_FOUND');
    }
  }
}

export default new CommentService();
