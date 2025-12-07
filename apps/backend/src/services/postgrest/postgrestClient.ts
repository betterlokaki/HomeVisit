import axios from "axios";
import { config } from "../../config/env.ts";
import { logger } from "../../middleware/logger.ts";
import type { IPostgRESTClient } from "./interfaces/IPostgRESTClient.ts";

/**
 * Abstraction for PostgREST HTTP client
 * Single Responsibility: HTTP communication with PostgREST API
 */
export class PostgRESTClient implements IPostgRESTClient {
  private client = axios.create({
    baseURL: config.POSTGREST_URL || "http://localhost:3000",
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });

  async get<T>(query: string): Promise<{ data: T[] }> {
    try {
      const response = await this.client.get(query);
      return { data: response.data };
    } catch (error) {
      logger.error("PostgREST GET failed", { query, error });
      throw error;
    }
  }

  async post<T>(path: string, data: any): Promise<{ data: T }> {
    try {
      const response = await this.client.post(path, data);
      return { data: response.data };
    } catch (error) {
      logger.error("PostgREST POST failed", { path, error });
      throw error;
    }
  }

  async patch<T>(path: string, data: T): Promise<void> {
    try {
      await this.client.patch(path, data);
    } catch (error) {
      logger.error("PostgREST PATCH failed", { path, error });
      throw error;
    }
  }
}
