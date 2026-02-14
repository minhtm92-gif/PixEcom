const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('pixecom-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
}

function getWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('pixecom-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.workspace?.id || null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('pixecom-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.refreshToken || null;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) return null;

    const data = await response.json();
    const newAccessToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;

    // Update stored tokens
    if (typeof window !== 'undefined' && newAccessToken) {
      const stored = localStorage.getItem('pixecom-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.state.accessToken = newAccessToken;
        if (newRefreshToken) {
          parsed.state.refreshToken = newRefreshToken;
        }
        localStorage.setItem('pixecom-auth', JSON.stringify(parsed));
      }
    }

    return newAccessToken;
  } catch {
    return null;
  }
}

export class ApiClientError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const workspaceId = getWorkspaceId();
    if (workspaceId) {
      requestHeaders['X-Workspace-Id'] = workspaceId;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let response = await fetch(url, {
    method,
    headers: requestHeaders,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle 401 by attempting token refresh
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      requestHeaders['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      // Refresh failed - clear auth state and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pixecom-auth');
        window.location.href = '/login';
      }
      throw new ApiClientError('Session expired. Please log in again.', 401);
    }
  }

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: `Request failed with status ${response.status}`,
        statusCode: response.status,
      };
    }
    throw new ApiClientError(
      errorData.message || 'An unexpected error occurred',
      errorData.statusCode || response.status,
      errorData.errors
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const data: ApiResponse<T> = await response.json();
  return data.data;
}

export const apiClient = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'POST', body });
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'PUT', body });
  },

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
