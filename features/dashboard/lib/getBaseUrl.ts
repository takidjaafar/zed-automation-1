/**
 * Get the base URL for the application dynamically
 * Works both server-side and client-side without requiring external network hops
 */
export async function getBaseUrl(): Promise<string> {
  // Client-side: use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: loop back directly to the local server port to avoid reverse proxy / auth hops
  const port = process.env.PORT || 3000;
  return `http://127.0.0.1:${port}`;
}

/**
 * Get the GraphQL endpoint URL
 */
export async function getGraphQLEndpoint(): Promise<string> {
  const baseUrl = await getBaseUrl();
  return `${baseUrl}/api/graphql`;
}