/**
 * Shared type definitions for User entity
 */

export interface User {
  user_id: number;
  group_id: number;
  username?: string;
  display_name?: string;
}

export interface AuthPayload {
  user_id: number;
  group_id: number;
}
