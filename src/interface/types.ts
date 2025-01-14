// Core types for GitHub Agent interface

export type OperationType = 'code' | 'repo' | 'branch' | 'pr' | 'issue';
export type OperationPriority = 'high' | 'normal' | 'low';
export type OperationStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export interface GeneralAgentCommand {
  commandType: 'github_operation';
  operation: {
    type: OperationType;
    action: string;
    parameters: Record<string, unknown>;
    priority: OperationPriority;
  };
  metadata: {
    requestId: string;
    timestamp: number;
    source: 'general_agent';
  };
}

export interface OperationResponse {
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    actionable: boolean;
    suggestedActions?: string[];
  };
  operationState: {
    id: string;
    status: OperationStatus;
    completionPercentage?: number;
  };
}

export interface ErrorReport {
  errorType: string;
  severity: 'critical' | 'warning' | 'info';
  context: {
    operation: string;
    failurePoint: string;
    affectedResources: string[];
  };
  recovery: {
    isRecoverable: boolean;
    suggestedActions: string[];
    automaticRetry?: {
      attempts: number;
      nextRetry: number;
    };
  };
}