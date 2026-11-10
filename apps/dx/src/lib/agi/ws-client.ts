/** AGI WebSocket Client - Real-time client for AGI Core Intelligence Layer */

import { WebSocketMessage, TaskCreate, Task, InferenceRequest, InferenceResponse } from './types';

export class AGIWSClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (payload: any) => void> = new Map();
  private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }> = new Map();
  private requestId = 0;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

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