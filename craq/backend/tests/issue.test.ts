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
import { IssueService } from '../src/services/issue.service';

const mockPool = pool as jest.Mocked<typeof pool>;

describe('IssueService', () => {
  let issueService: IssueService;

  beforeEach(() => {
    issueService = new IssueService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an issue successfully', async () => {
      const mockIssue = {
        id: 'issue-uuid',
        author_id: 'user-uuid',
        title: 'Test Issue',
        description: 'Test description',
        images: [],
        category: 'technical',
        tags: ['startup'],
        status: 'open',
        industry: null,
        stage: null,
        type: null,
        upvotes: 0,
        downvotes: 0,
        accepted_solution_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockIssue] });

      const result = await issueService.create('user-uuid', {
        title: 'Test Issue',
        description: 'Test description',
        category: 'technical',
        tags: ['startup'],
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Issue');
      expect(result.author_id).toBe('user-uuid');
    });
  });

  describe('getById', () => {
    it('should return an issue by id', async () => {
      const mockIssue = {
        id: 'issue-uuid',
        author_id: 'user-uuid',
        title: 'Test Issue',
        description: 'Test description',
        status: 'open',
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockIssue] });

      const result = await issueService.getById('issue-uuid');
      expect(result.id).toBe('issue-uuid');
    });

    it('should throw if issue not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(issueService.getById('nonexistent')).rejects.toThrow(
        'Issue not found'
      );
    });
  });

  describe('list', () => {
    it('should return paginated issues', async () => {
      const mockIssues = [
        { id: '1', title: 'Issue 1' },
        { id: '2', title: 'Issue 2' },
      ];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '2' }] })
        .mockResolvedValueOnce({ rows: mockIssues });

      const result = await issueService.list({}, { page: 1, limit: 20 });

      expect(result.issues).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should apply filters', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await issueService.list(
        { category: 'technical', industry: 'fintech' },
        { page: 1, limit: 20 }
      );

      expect(result.issues).toHaveLength(0);
      expect((mockPool.query as jest.Mock).mock.calls[0][1]).toContain('technical');
    });
  });

  describe('delete', () => {
    it('should delete an issue', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'issue-uuid' }],
      });

      await expect(
        issueService.delete('issue-uuid')
      ).resolves.toBeUndefined();
    });

    it('should throw if issue not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(issueService.delete('nonexistent')).rejects.toThrow(
        'Issue not found'
      );
    });
  });

  describe('markSolved', () => {
    it('should mark an issue as solved', async () => {
      const mockIssue = {
        id: 'issue-uuid',
        status: 'solved',
        accepted_solution_id: 'solution-uuid',
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockIssue] });

      const result = await issueService.markSolved('issue-uuid', 'solution-uuid');
      expect(result.status).toBe('solved');
      expect(result.accepted_solution_id).toBe('solution-uuid');
    });
  });
});
