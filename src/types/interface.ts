export interface GitHubCommand {
  type: 'code' | 'repo' | 'branch' | 'issue' | 'pr';
  action: string;
  params: Record<string, any>;
  priority?: number;
  timestamp: number;
}

export interface GitHubResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  status: 'completed' | 'failed' | 'pending' | 'processing';
  commandId: string;
  timestamp: number;
}

export interface OperationStatus {
  commandId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  timestamp: number;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  commandId: string;
}