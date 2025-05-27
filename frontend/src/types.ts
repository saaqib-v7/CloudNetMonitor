import { User } from '../../backend/src/types';

export interface ImsNode {
  id: string;
  name: string;
  status: 'online' | 'offline';
  type: string;
  ip: string;
  load: {
    cpu: number;
    memory: number;
    network: number;
  };
  lastUpdated: string;
}

export interface SystemStatus {
  totalNodes: number;
  onlineNodes: number;
  averageCpu: number;
  averageMemory: number;
  averageNetwork: number;
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  timestamp: string;
}

export interface Alert {
  id: string;
  nodeId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export type WebSocketMessage =
  | { type: 'NODE_UPDATE'; payload: ImsNode }
  | { type: 'SYSTEM_STATUS'; payload: SystemStatus }
  | { type: 'HEALTH_UPDATE'; payload: SystemHealth }
  | { type: 'ALERT_UPDATE'; payload: Alert }
  | { type: 'USERS_UPDATE'; payload: User[] };

export type { User }; 