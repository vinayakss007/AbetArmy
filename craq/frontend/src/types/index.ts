export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  industry: string | null;
  stage: string | null;
  role: string;
  skills: string[];
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  author_id: string;
  author?: User;
  title: string;
  description: string;
  images: string[];
  category: string | null;
  tags: string[];
  status: string;
  industry: string | null;
  stage: string | null;
  type: string | null;
  upvotes: number;
  downvotes: number;
  accepted_solution_id: string | null;
  solution_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Solution {
  id: string;
  issue_id: string;
  author_id: string;
  author?: User;
  content: string;
  images: string[];
  upvotes: number;
  downvotes: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  parent_type: string;
  parent_id: string;
  author_id: string;
  author?: User;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  value: number;
  created_at: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  category: string | null;
  linked_issue_types: string[];
  average_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ToolReview {
  id: string;
  tool_id: string;
  user_id: string;
  user?: User;
  rating: number;
  content: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  type: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  data?: Record<string, string>;
  created_at: string;
}

export interface SearchResult {
  type: 'issue' | 'solution' | 'user' | 'tool';
  item: Issue | Solution | User | Tool;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}
