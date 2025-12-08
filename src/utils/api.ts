import { API_BASE_URL } from '../config/constant';
import type { RobotPosition } from '../types/robot';

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;

export interface RobotsResponse {
  robots: RobotPosition[];
}

export interface MoveRequest {
  meters: number;
}

export interface ResetRequest {
  count: number;
}

export interface StartAutoRequest {
  meters: number;
  intervalMs: number;
}

interface FetchOptions {
  maxRetries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  config: FetchOptions = {}
): Promise<ApiResult<T>> {
  const { maxRetries = 2, retryDelay = 1000, signal } = config;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, { ...options, signal });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if request was aborted
      if (lastError.name === 'AbortError') {
        return {
          success: false,
          error: 'Request cancelled',
        };
      }

      if (attempt < maxRetries) {
        await sleep(retryDelay * Math.pow(2, attempt));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Unknown error occurred',
  };
}

export const robotApi = {
  async getRobots(signal?: AbortSignal): Promise<ApiResult<RobotsResponse>> {
    return fetchWithRetry<RobotsResponse>(
      `${API_BASE_URL}/robots`,
      { method: 'GET' },
      { maxRetries: 1, retryDelay: 500, signal }
    );
  },

  async move(request: MoveRequest): Promise<ApiResult<RobotsResponse>> {
    return fetchWithRetry<RobotsResponse>(`${API_BASE_URL}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async reset(request: ResetRequest): Promise<ApiResult<RobotsResponse>> {
    return fetchWithRetry<RobotsResponse>(`${API_BASE_URL}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async startAuto(request: StartAutoRequest): Promise<ApiResult<void>> {
    return fetchWithRetry<void>(`${API_BASE_URL}/start-auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async stopAuto(): Promise<ApiResult<void>> {
    return fetchWithRetry<void>(`${API_BASE_URL}/stop-auto`, { method: 'POST' });
  },
};
