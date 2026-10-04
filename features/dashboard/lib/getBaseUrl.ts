import { headers } from "next/headers";

/**
 * Get the base URL for the application dynamically
 * Works both server-side and client-side without requiring environment variables
 */

export async function getBaseUrl(): Promise<string> {
  // Client-side: use window.location
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: connect directly to localhost to prevent requests from looping through
  // external ingress proxies that require interactive browser cookies
  const port = process.env.PORT || '3000';
  return `http://127.0.0.1:${port}`;
}

/**
 * Get the GraphQL endpoint URL
 */
export async function getGraphQLEndpoint(): Promise<string> {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/api/graphql`;
}