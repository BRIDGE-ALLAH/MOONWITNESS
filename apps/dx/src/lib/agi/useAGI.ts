/** React hooks for AGI integration */

import { useState, useEffect, useCallback } from 'react';
import {
  Task,
  TaskCreate,
  TaskUpdate,
  InferenceRequest,
  InferenceResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  VectorSearchRequest,
  VectorSearchResponse,
  HealthResponse,
  WebSocketMessage,
  agiClient,
} from './client';


export function useAGIHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const result = await agiClient.health();
      setHealth(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { health, loading, error, refresh: checkHealth };
}


export function useAGITasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await agiClient.listTasks();
      setTasks(result);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: TaskCreate) => {
    const newTask = await agiClient.createTask(task);
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  const executeTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'running' as const } : t
    ));

    try {
      const result = await agiClient.executeTask(taskId);
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'completed' as const, result, progress: 1 } : t
      ));
      return result;
    } catch (e) {
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'failed' as const, error: (e as Error).message } : t
      ));
      throw e;
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, update: TaskUpdate) => {
    const updated = await agiClient.updateTask(taskId, update);
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, fetchTasks, createTask, executeTask, updateTask };
}


export function useAGIInference() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(async (request: InferenceRequest): Promise<InferenceResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await agiClient.inference(request);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const streamGenerate = useCallback(async function* (request: InferenceRequest) {
    setLoading(true);
    setError(null);
    try {
      for await (const chunk of agiClient.streamInference(request)) {
        yield chunk;
      }
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, streamGenerate, loading, error };
}


export function useAGIEmbeddings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const embed = useCallback(async (request: EmbeddingRequest): Promise<EmbeddingResponse> => {
    setLoading(true);
    setError(null);
    try {
      return await agiClient.embed(request);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { embed, loading, error };
}


export function useAGIVectorSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<VectorSearchResponse | null>(null);

  const search = useCallback(async (request: VectorSearchRequest): Promise<VectorSearchResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await agiClient.vectorSearch(request);
      setResults(result);
      return result;
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, results, loading, error };
}


export function useAGIWebSocket() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    try {
      await agiClient.connectWebSocket();
      setConnected(true);
      setError(null);

      // Set up default handlers
      agiClient.onMessage('task_created', (payload) => {
        setMessages(prev => [...prev, { type: 'task_created', payload, timestamp: new Date().toISOString() }]);
      });
      agiClient.onMessage('task_result', (payload) => {
        setMessages(prev => [...prev, { type: 'task_result', payload, timestamp: new Date().toISOString() }]);
      });
      agiClient.onMessage('inference_result', (payload) => {
        setMessages(prev => [...prev, { type: 'inference_result', payload, timestamp: new Date().toISOString() }]);
      });
    } catch (e) {
      setError(e as Error);
      setConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    agiClient.disconnectWebSocket();
    setConnected(false);
  }, []);

  const sendMessage = useCallback(async (type: string, payload: Record<string, any>) => {
    return agiClient.sendMessage(type, payload);
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { connected, messages, error, connect, disconnect, sendMessage };
}


// Combined hook for easy access
export function useAGI() {
  const health = useAGIHealth();
  const tasks = useAGITasks();
  const inference = useAGIInference();
  const embeddings = useAGIEmbeddings();
  const vectorSearch = useAGIVectorSearch();
  const ws = useAGIWebSocket();

  return {
    health,
    tasks,
    inference,
    embeddings,
    vectorSearch,
    ws,
  };
}
