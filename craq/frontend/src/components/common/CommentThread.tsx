'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2 } from 'lucide-react';
import { Comment } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface CommentThreadProps {
  parentType: string;
  parentId: string;
}

export default function CommentThread({ parentType, parentId }: CommentThreadProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [parentType, parentId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/${parentType}/${parentId}`);
      setComments(response.data);
    } catch {
      // silent fail on comment load
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/comments', {
        parentType,
        parentId,
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, response.data]);
      setNewComment('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;
    try {
      await api.put(`/comments/${id}`, { content: editContent.trim() });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, content: editContent.trim() } : c))
      );
      setEditingId(null);
    } catch {
      toast.error('Failed to edit comment');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </h3>

      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {comment.author?.name || 'User'}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>

              {editingId === comment.id ? (
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input-field text-sm flex-1"
                  />
                  <button onClick={() => handleEdit(comment.id)} className="btn-primary text-xs px-2 py-1">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="btn-ghost text-xs px-2 py-1">
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{comment.content}</p>
              )}

              {user?.id === comment.author_id && editingId !== comment.id && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isAuthenticated ? 'Add a comment...' : 'Sign in to comment'}
          disabled={!isAuthenticated}
          className="input-field text-sm flex-1"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isLoading || !isAuthenticated}
          className="btn-primary px-3"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
