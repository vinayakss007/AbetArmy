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
import { VoteService } from '../src/services/vote.service';

const mockPool = pool as jest.Mocked<typeof pool>;

describe('VoteService', () => {
  let voteService: VoteService;

  beforeEach(() => {
    voteService = new VoteService();
    jest.clearAllMocks();
  });

  describe('vote', () => {
    it('should create a new upvote', async () => {
      const mockVote = {
        id: 'vote-uuid',
        user_id: 'user-uuid',
        target_type: 'issue',
        target_id: 'issue-uuid',
        value: 1,
        created_at: new Date(),
      };

      // Check existing vote
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      // Insert new vote
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockVote] });
      // Update target count
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await voteService.vote('user-uuid', 'issue', 'issue-uuid', 1);

      expect(result.vote).toBeDefined();
      expect(result.removed).toBe(false);
      expect(result.vote!.value).toBe(1);
    });

    it('should toggle off an existing same vote', async () => {
      const existingVote = {
        id: 'vote-uuid',
        user_id: 'user-uuid',
        target_type: 'issue',
        target_id: 'issue-uuid',
        value: 1,
      };

      // Check existing vote (same value)
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [existingVote] });
      // Delete vote
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      // Update target count
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await voteService.vote('user-uuid', 'issue', 'issue-uuid', 1);

      expect(result.vote).toBeNull();
      expect(result.removed).toBe(true);
    });

    it('should switch from upvote to downvote', async () => {
      const existingVote = {
        id: 'vote-uuid',
        user_id: 'user-uuid',
        target_type: 'issue',
        target_id: 'issue-uuid',
        value: 1,
      };

      const updatedVote = { ...existingVote, value: -1 };

      // Check existing vote (different value)
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [existingVote] });
      // Update vote
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedVote] });
      // Remove old count
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      // Add new count
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await voteService.vote('user-uuid', 'issue', 'issue-uuid', -1);

      expect(result.vote).toBeDefined();
      expect(result.vote!.value).toBe(-1);
      expect(result.removed).toBe(false);
    });

    it('should reject invalid vote value', async () => {
      await expect(
        voteService.vote('user-uuid', 'issue', 'issue-uuid', 2)
      ).rejects.toThrow('Vote value must be 1 or -1');
    });
  });

  describe('getVotes', () => {
    it('should return vote counts', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ upvotes: '5', downvotes: '2' }],
      });

      const result = await voteService.getVotes('issue', 'issue-uuid');

      expect(result.upvotes).toBe(5);
      expect(result.downvotes).toBe(2);
      expect(result.total).toBe(3);
    });
  });

  describe('getUserVote', () => {
    it('should return user vote if exists', async () => {
      const mockVote = {
        id: 'vote-uuid',
        user_id: 'user-uuid',
        target_type: 'issue',
        target_id: 'issue-uuid',
        value: 1,
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockVote] });

      const result = await voteService.getUserVote('user-uuid', 'issue', 'issue-uuid');
      expect(result).toBeDefined();
      expect(result!.value).toBe(1);
    });

    it('should return null if no vote', async () => {
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await voteService.getUserVote('user-uuid', 'issue', 'issue-uuid');
      expect(result).toBeNull();
    });
  });
});
