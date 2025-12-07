/**
 * Interface for PostgREST Client
 *
 * Defines the contract for HTTP communication with PostgREST API.
 * Enables dependency injection and testing.
 */

export interface IPostgRESTClient {
  get<T>(query: string): Promise<{ data: T[] }>;
  post<T>(path: string, data: any): Promise<{ data: T }>;
  patch<T>(path: string, data: T): Promise<void>;
}
