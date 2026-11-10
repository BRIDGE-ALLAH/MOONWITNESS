/** AGI Types - Shared interfaces for HTTP and WebSocket clients */

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