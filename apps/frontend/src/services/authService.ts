/**
 * Authentication API Service
 *
 * Handles all authentication-related API calls.
 */

import axios from "axios";
import {
  POSTGREST_BASE_URL,
  POSTGREST_RPC_AUTH_ENDPOINT,
  POSTGREST_AUTH_PARAM,
} from "../config/constants";

/**
 * Authenticate user via PostgREST
 */
export async function authenticateUser(username: string): Promise<number> {
  const response = await axios.post(
    `${POSTGREST_BASE_URL}${POSTGREST_RPC_AUTH_ENDPOINT}`,
    { [POSTGREST_AUTH_PARAM]: username }
  );
  return typeof response.data === "number" ? response.data : response.data[0];
}
