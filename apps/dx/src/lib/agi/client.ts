/** AGI Client - TypeScript client for AGI Core Intelligence Layer */

export interface Task {
  id: string;
  title: string;
  description: string;
  agent_type: 'reasoning' | 'coding' | 'analysis' | 'planning' | 'orchestrator';
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: Record<string, any>;
  error?: string;
  progress: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface TaskCreate {
  title: string;
  description: string;
  agent_type?: 'reasoning' | 'coding' | 'analysis' | 'planning' | 'orchestrator';
  priority?: 'low' | 'normal' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface TaskUpdate {
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  result?: Record<string, any>;
  error?: string;
  progress?: number;
}

export interface InferenceRequest {
  prompt: string;
  system_prompt?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  metadata?: Record<string, any>;
}

export interface InferenceResponse {
  id: string;
  content: string;
  model: string;
  usage: Record<string, number>;
  finish_reason: string;
  created_at: string;
}

export interface EmbeddingRequest {
  texts: string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  dimensions: number;
}

export interface VectorSearchRequest {
  query: string;
  top_k?: number;
  filter?: Record<string, any>;
  include_metadata?: boolean;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  text: string;
  metadata?: Record<string, any>;
}

export interface VectorSearchResponse {
  results: VectorSearchResult[];
  query: string;
  total_results: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
  dependencies: Record<string, 'healthy' | 'unhealthy' | 'unknown'>;
}

export interface WebSocketMessage {
  type: string;
  payload: Record<string, any>;
  timestamp: string;
  correlation_id?: string;
}


export class AGIClient {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (payload: any) => void> = new Map();
  private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }> = new Map();
  private requestId = 0;

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

  // WebSocket
  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = this.baseUrl.replace(/^http/, 'ws') + '/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[AGI] WebSocket connected');
        resolve();
      };

      this.ws.onclose = () => {
        console.log('[AGI] WebSocket disconnected');
        this.ws = null;
      };

      this.ws.onerror = (error) => {
        console.error('[AGI] WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error('[AGI] Failed to parse WebSocket message:', e);
        }
      };
    });
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle responses to our requests
    if (message.correlation_id && this.pendingRequests.has(message.correlation_id)) {
      const { resolve } = this.pendingRequests.get(message.correlation_id)!;
      this.pendingRequests.delete(message.correlation_id);
      resolve(message.payload);
      return;
    }

    // Handle event messages
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    }
  }

  onMessage(type: string, handler: (payload: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  offMessage(type: string): void {
    this.messageHandlers.delete(type);
  }

  async sendMessage(type: string, payload: Record<string, any>): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const correlationId = `req_${++this.requestId}_${Date.now()}`;

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(correlationId, { resolve, reject });

      this.ws!.send(JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString(),
        correlation_id: correlationId,
      }));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(correlationId)) {
          this.pendingRequests.delete(correlationId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // Convenience methods via WebSocket
  async createTaskWS(task: TaskCreate): Promise<Task> {
    return this.sendMessage('task_create', task);
  }

  async executeTaskWS(taskId: string): Promise<Record<string, any>> {
    return this.sendMessage('task_execute', { task_id: taskId });
  }

  async inferenceWS(request: InferenceRequest): Promise<InferenceResponse> {
    return this.sendMessage('inference', request);
  }
}


// Singleton instance
export const agiClient = new AGIClient(
  process.env.NEXT_PUBLIC_AGI_ENDPOINT || 'http://localhost:8000'
);
