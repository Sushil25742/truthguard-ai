export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const data = await response.json();
      message = data.detail || data.message || message;
    } catch {
      message = await response.text() || response.statusText;
    }
    throw new ApiError(message, response.status);
  }

  // If response is 204 No Content, don't try to parse JSON
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
