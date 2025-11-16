/**
 * Shared type definitions for User entity
 */

export interface User {
  user_id: number;
  username: string;
  email?: string;
  group_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  username: string;
  email?: string;
}

export interface AuthPayload {
  user_id: number;
  username: string;
  group_id: number;
}
