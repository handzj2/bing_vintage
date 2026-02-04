import { useState, useCallback } from 'react';
import { api } from '../client';
import { AxiosRequestConfig } from 'axios';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showLoading?: boolean;
}

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const request = useCallback(async (
    config: AxiosRequestConfig,
    options: UseApiOptions<T> = {}
  ): Promise<T> => {
    const { onSuccess, onError, showLoading = true } = options;
    
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const response = await api.request<T>(config);
      setData(response.data);
      onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    request,
    reset,
    setData,
    setError,
  };
}

// Specialized hook for GET requests
export function useGet<T = any>(url: string, config?: AxiosRequestConfig) {
  const apiHook = useApi<T>();
  
  const fetch = useCallback(async () => {
    return apiHook.request({
      method: 'GET',
      url,
      ...config,
    });
  }, [apiHook, url, config]);

  return {
    ...apiHook,
    fetch,
  };
}

// Specialized hook for POST requests
export function usePost<T = any>() {
  const apiHook = useApi<T>();
  
  const post = useCallback(async (url: string, data?: any, config?: AxiosRequestConfig) => {
    return apiHook.request({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }, [apiHook]);

  return {
    ...apiHook,
    post,
  };
}