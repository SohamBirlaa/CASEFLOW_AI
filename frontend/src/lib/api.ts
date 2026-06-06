const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface HealthResponse {
  status: string;
  app: string;
}

/**
 * Custom fetch client for CaseFlow AI backend services
 */
export async function fetchFromBackend<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    cache: "no-store", // Prevents staleness in operational status tracking
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Backend communication error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}