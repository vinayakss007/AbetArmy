import pool from '../config/database';

export interface SearchFilters {
  type?: string;
  industry?: string;
  tags?: string[];
  status?: string;
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: Date;
}

export class SearchService {
  async search(
    query: string,
    filters: SearchFilters = {}
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    if (!filters.type || filters.type === 'issue') {
      const issueResults = await this.searchIssues(query, filters);
      results.push(...issueResults);
    }

    if (!filters.type || filters.type === 'solution') {
      const solutionResults = await this.searchSolutions(query);
      results.push(...solutionResults);
    }

    if (!filters.type || filters.type === 'user') {
      const userResults = await this.searchUsers(query);
      results.push(...userResults);
    }

    if (!filters.type || filters.type === 'tool') {
      const toolResults = await this.searchTools(query);
      results.push(...toolResults);
    }

    // Sort by relevance (created_at as proxy)
    results.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return results.slice(0, 50);
  }

  private async searchIssues(
    query: string,
    filters: SearchFilters
  ): Promise<SearchResult[]> {
    const conditions: string[] = [
      `to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', $1)`,
    ];
    const params: unknown[] = [query];
    let paramIndex = 2;

    if (filters.industry) {
      conditions.push(`industry = $${paramIndex++}`);
      params.push(filters.industry);
    }
    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }

    const result = await pool.query(
      `SELECT id, title, description, created_at FROM issues
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC LIMIT 20`,
      params
    );

    return result.rows.map((row) => ({
      ...row,
      type: 'issue',
    }));
  }

  private async searchSolutions(query: string): Promise<SearchResult[]> {
    const result = await pool.query(
      `SELECT id, content as description, created_at FROM solutions
       WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
       ORDER BY created_at DESC LIMIT 20`,
      [query]
    );

    return result.rows.map((row) => ({
      ...row,
      type: 'solution',
      title: row.description.substring(0, 100),
    }));
  }

  private async searchUsers(query: string): Promise<SearchResult[]> {
    const result = await pool.query(
      `SELECT id, name as title, COALESCE(bio, '') as description, created_at FROM users
       WHERE name ILIKE $1 OR bio ILIKE $1
       ORDER BY reputation_score DESC LIMIT 20`,
      [`%${query}%`]
    );

    return result.rows.map((row) => ({
      ...row,
      type: 'user',
    }));
  }

  private async searchTools(query: string): Promise<SearchResult[]> {
    const result = await pool.query(
      `SELECT id, name as title, COALESCE(description, '') as description, created_at FROM tools
       WHERE name ILIKE $1 OR description ILIKE $1
       ORDER BY name ASC LIMIT 20`,
      [`%${query}%`]
    );

    return result.rows.map((row) => ({
      ...row,
      type: 'tool',
    }));
  }
}

export default new SearchService();
