export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  industry: string | null;
  stage: string | null;
  role: string;
  skills: string[];
  reputation_score: number;
  google_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Issue {
  id: string;
  author_id: string;
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
  created_at: Date;
  updated_at: Date;
}

export interface Solution {
  id: string;
  issue_id: string;
  author_id: string;
  content: string;
  images: string[];
  upvotes: number;
  downvotes: number;
  is_accepted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: string;
  parent_type: string;
  parent_id: string;
  author_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface Vote {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  value: number;
  created_at: Date;
}

export interface Tool {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  category: string | null;
  linked_issue_types: string[];
  created_at: Date;
  updated_at: Date;
}

export interface ToolReview {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  content: string | null;
  created_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  type: string | null;
  created_at: Date;
}

export interface IssueTag {
  issue_id: string;
  tag_id: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
