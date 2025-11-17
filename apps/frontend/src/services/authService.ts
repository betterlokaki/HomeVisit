/**
 * Authentication API Service
 *
 * Handles all authentication-related API calls.
 */

import axios from "axios";
import { API_BASE_URL, BACKEND_AUTH_ENDPOINT } from "../config/constants";

/**
 * Authenticate user via backend
 */
export async function authenticateUser(username: string): Promise<number> {
  const response = await axios.post(`${API_BASE_URL}${BACKEND_AUTH_ENDPOINT}`, {
    username,
  });
  return response.data.data.user_id;
}
