/**
 * Shared type definitions for User entity
 */

export interface User {
  user_id: number;
  group_id: number;
}

export interface AuthPayload {
  user_id: number;
  group_id: number;
}
