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
import { SolutionService } from '../src/services/solution.service';

const mockPool = pool as jest.Mocked<typeof pool>;

describe('SolutionService', () => {
  let solutionService: SolutionService;

  beforeEach(() => {
    solutionService = new SolutionService();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a solution', async () => {
      const mockSolution = {
        id: 'sol-uuid',
        issue_id: 'issue-uuid',
        author_id: 'user-uuid',
        content: 'My solution',
        images: [],
        upvotes: 0,
        downvotes: 0,
        is_accepted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSolution] });

      const result = await solutionService.create('issue-uuid', 'user-uuid', {
        content: 'My solution',
      });

      expect(result.content).toBe('My solution');
      expect(result.issue_id).toBe('issue-uuid');
    });
  });

  describe('getByIssue', () => {
    it('should return solutions for an issue', async () => {
      const mockSolutions = [
        { id: '1', content: 'Solution 1', is_accepted: true },
        { id: '2', content: 'Solution 2', is_accepted: false },
      ];

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: mockSolutions });

      const result = await solutionService.getByIssue('issue-uuid');
      expect(result).toHaveLength(2);
    });
  });

  describe('accept', () => {
    it('should accept a solution and update issue', async () => {
      const mockSolution = {
        id: 'sol-uuid',
        issue_id: 'issue-uuid',
        is_accepted: true,
      };

      // Unaccept previous
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      // Accept new
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSolution] });
      // Update issue
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await solutionService.accept('sol-uuid', 'issue-uuid');
      expect(result.is_accepted).toBe(true);
    });

    it('should throw if solution not found', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(
        solutionService.accept('nonexistent', 'issue-uuid')
      ).rejects.toThrow('Solution not found');
    });
  });

  describe('delete', () => {
    it('should delete a solution', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 'sol-uuid' }],
      });

      await expect(solutionService.delete('sol-uuid')).resolves.toBeUndefined();
    });
  });
});
