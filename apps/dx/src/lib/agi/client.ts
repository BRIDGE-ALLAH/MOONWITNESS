/** AGI Client - Facade composing HTTP and WebSocket clients */

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
} from './types';
import { AGIHttpClient } from './http-client';
import { AGIWSClient } from './ws-client';

// Re-export all types for backwards compatibility
export type {
  Task,
  TaskCreate,
  TaskUpdate,
  InferenceRequest,
  InferenceResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  VectorSearchRequest,
  VectorSearchResult,
  VectorSearchResponse,
  HealthResponse,
  WebSocketMessage,
} from './types';

// Re-export individual clients for tree-shaking
export { AGIHttpClient } from './http-client';
export { AGIWSClient } from './ws-client';

export class AGIClient {
  private httpClient: AGIHttpClient;
  private wsClient: AGIWSClient;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.httpClient = new AGIHttpClient(baseUrl);
    this.wsClient = new AGIWSClient(baseUrl);
  }

  // Delegate to HTTP client
  async health(): Promise<HealthResponse> {
    return this.httpClient.health();
  }

  async createTask(task: TaskCreate): Promise<Task> {
    return this.httpClient.createTask(task);
  }

  async listTasks(): Promise<Task[]> {
    return this.httpClient.listTasks();
  }

  async getTask(id: string): Promise<Task> {
    return this.httpClient.getTask(id);
  }

  async updateTask(id: string, update: TaskUpdate): Promise<Task> {
    return this.httpClient.updateTask(id, update);
  }

  async executeTask(id: string): Promise<Record<string, any>> {
    return this.httpClient.executeTask(id);
  }

  async inference(request: InferenceRequest): Promise<InferenceResponse> {
    return this.httpClient.inference(request);
  }

  async *streamInference(request: InferenceRequest): AsyncGenerator<string, void, unknown> {
    yield* this.httpClient.streamInference(request);
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    return this.httpClient.embed(request);
  }

  async vectorSearch(request: VectorSearchRequest): Promise<VectorSearchResponse> {
    return this.httpClient.vectorSearch(request);
  }

  // Delegate to WebSocket client
  connectWebSocket(): Promise<void> {
    return this.wsClient.connectWebSocket();
  }

  disconnectWebSocket(): void {
    this.wsClient.disconnectWebSocket();
  }

  onMessage(type: string, handler: (payload: any) => void): void {
    this.wsClient.onMessage(type, handler);
  }

  offMessage(type: string): void {
    this.wsClient.offMessage(type);
  }

  async sendMessage(type: string, payload: Record<string, any>): Promise<any> {
    return this.wsClient.sendMessage(type, payload);
  }

  async createTaskWS(task: TaskCreate): Promise<Task> {
    return this.wsClient.createTaskWS(task);
  }

  async executeTaskWS(taskId: string): Promise<Record<string, any>> {
    return this.wsClient.executeTaskWS(taskId);
  }

  async inferenceWS(request: InferenceRequest): Promise<InferenceResponse> {
    return this.wsClient.inferenceWS(request);
  }
}

// Singleton instance
export const agiClient = new AGIClient(
  process.env.NEXT_PUBLIC_AGI_ENDPOINT || 'http://localhost:8000'
);