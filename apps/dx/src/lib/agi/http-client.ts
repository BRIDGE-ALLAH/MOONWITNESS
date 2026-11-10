/** AGI HTTP Client - REST API client for AGI Core Intelligence Layer */

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
} from './types';

export class AGIHttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health
  async health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Tasks
  async createTask(task: TaskCreate): Promise<Task> {
    return this.request<Task>('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async listTasks(): Promise<Task[]> {
    return this.request<Task[]>('/api/v1/tasks');
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/api/v1/tasks/${id}`);
  }

  async updateTask(id: string, update: TaskUpdate): Promise<Task> {
    return this.request<Task>(`/api/v1/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    });
  }

  async executeTask(id: string): Promise<Record<string, any>> {
    return this.request<Record<string, any>>(`/api/v1/tasks/${id}/execute`, {
      method: 'POST',
    });
  }

  // Inference
  async inference(request: InferenceRequest): Promise<InferenceResponse> {
    return this.request<InferenceResponse>('/api/v1/inference', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async *streamInference(request: InferenceRequest): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseUrl}/api/v1/inference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Embeddings
  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    return this.request<EmbeddingResponse>('/api/v1/embeddings', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Vector Search
  async vectorSearch(request: VectorSearchRequest): Promise<VectorSearchResponse> {
    return this.request<VectorSearchResponse>('/api/v1/vectors/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}