const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(() => Promise.resolve(mockClient)),
  __esModule: true,
  default: {
    query: jest.fn(),
    connect: jest.fn(() => Promise.resolve(mockClient)),
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
    // Reset connect to return mockClient
    (mockPool.connect as jest.Mock).mockResolvedValue(mockClient);
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

      // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // SELECT FOR UPDATE (lock target row)
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'issue-uuid' }] });
      // Check existing vote
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // Insert new vote
      mockClient.query.mockResolvedValueOnce({ rows: [mockVote] });
      // Update target count
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // COMMIT
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await voteService.vote('user-uuid', 'issue', 'issue-uuid', 1);

      expect(result.vote).toBeDefined();
      expect(result.removed).toBe(false);
      expect(result.vote!.value).toBe(1);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should toggle off an existing same vote', async () => {
      const existingVote = {
        id: 'vote-uuid',
        user_id: 'user-uuid',
        target_type: 'issue',
        target_id: 'issue-uuid',
        value: 1,
      };

      // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // SELECT FOR UPDATE
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'issue-uuid' }] });
      // Check existing vote (same value)
      mockClient.query.mockResolvedValueOnce({ rows: [existingVote] });
      // Delete vote
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // Update target count
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // COMMIT
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await voteService.vote('user-uuid', 'issue', 'issue-uuid', 1);

      expect(result.vote).toBeNull();
      expect(result.removed).toBe(true);
      expect(mockClient.release).toHaveBeenCalled();
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

      // BEGIN
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // SELECT FOR UPDATE
      mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'issue-uuid' }] });
      // Check existing vote (different value)
      mockClient.query.mockResolvedValueOnce({ rows: [existingVote] });
      // Update vote
      mockClient.query.mockResolvedValueOnce({ rows: [updatedVote] });
      // Remove old count
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // Add new count
      mockClient.query.mockResolvedValueOnce({ rows: [] });
      // COMMIT
      mockClient.query.mockResolvedValueOnce({ rows: [] });

      const result = await voteService.vote('user-uuid', 'issue', 'issue-uuid', -1);

      expect(result.vote).toBeDefined();
      expect(result.vote!.value).toBe(-1);
      expect(result.removed).toBe(false);
      expect(mockClient.release).toHaveBeenCalled();
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
