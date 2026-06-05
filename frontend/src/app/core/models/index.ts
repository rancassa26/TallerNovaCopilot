/**
 * Role enum - Defines available roles in the system
 */
export enum Role {
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

/**
 * User model - Represents authenticated user
 */
export interface User {
  id: string;
  email: string;
  roles: Role[];
}

/**
 * BaseResponseDTO - Generic wrapper for all API responses
 */
export interface BaseResponseDTO<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  errorCode?: string;
  correlationId: string;
  timestamp: string;
}

/**
 * LoginRequest - Request model for login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * LoginResponse - Response model for login
 */
export interface LoginResponse {
  token: string;
  user: User;
}

export interface DashboardResult {
  totalReconciliations: number;
  totalAccounts: number;
  totalIncidents: number;
  totalDifference: number;
}

export interface AccountIncident {
  id: string;
  accountId: string;
  type: string;
  description: string;
  amount: number;
}

export interface Account {
  id: string;
  name: string;
  ledgerBalance: number;
  systemBalance: number;
  difference: number;
  incidents: AccountIncident[];
}

export interface ExportResult {
  filename: string;
  format: 'json' | 'csv';
  content: string;
}

export interface IncidentResult {
  reconciliationId: string;
  accountId: string;
  accountName: string;
  incidentId: string;
  type: string;
  description: string;
  amount: number;
}
