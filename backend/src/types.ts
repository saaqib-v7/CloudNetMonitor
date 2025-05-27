export interface ImsNode {
  id: string;
  name: string;
  status: 'online' | 'offline';
  lastUpdated: string;
  type: 'voice' | 'data';
  ip: string;
  load: {
    cpu: number;
    memory: number;
    network: number;
  };
  tags?: string[];
  config?: NodeConfig;
}

export interface NodeConfig {
  maxCpu: number;
  maxMemory: number;
  maxNetwork: number;
  autoRestart: boolean;
  maintainanceWindow?: {
    start: string;
    end: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  preferences: {
    theme: 'light' | 'dark';
    defaultTimeRange: string;
    alertNotifications: boolean;
    emailNotifications: boolean;
  };
  lastLogin: string;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultTimeRange: string;
  alertNotifications: boolean;
  emailNotifications: boolean;
}

export interface Alert {
  id: string;
  nodeId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  type: 'cpu' | 'memory' | 'network' | 'status';
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface NodeGroup {
  id: string;
  name: string;
  description: string;
  nodeIds: string[];
  tags: string[];
  createdBy: string;
  createdAt: string;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  timestamp: string;
}

export interface SystemStatus {
  totalNodes: number;
  onlineNodes: number;
  averageCpu: number;
  averageMemory: number;
  averageNetwork: number;
  timestamp: string;
}

// WebSocket message types
export type NodeUpdate = {
  type: 'NODE_UPDATE';
  payload: ImsNode;
};

export type SystemStatusUpdate = {
  type: 'SYSTEM_STATUS';
  payload: SystemStatus;
};

export type AlertUpdate = {
  type: 'ALERT_UPDATE';
  payload: Alert;
};

export type HealthUpdate = {
  type: 'HEALTH_UPDATE';
  payload: SystemHealth;
};

export type WebSocketMessageType = 
  | 'NODE_UPDATE'
  | 'SYSTEM_STATUS'
  | 'ALERTS_UPDATE'
  | 'ALERT_RULE_UPDATE'
  | 'HEALTH_UPDATE';

export type WebSocketMessage =
  | { type: 'NODE_UPDATE'; payload: ImsNode }
  | { type: 'SYSTEM_STATUS'; payload: SystemStatus }
  | { type: 'ALERTS_UPDATE'; payload: Alert[] }
  | { type: 'ALERT_RULE_UPDATE'; payload: AlertRule }
  | { type: 'HEALTH_UPDATE'; payload: SystemHealth }
  | { type: 'USERS_UPDATE'; payload: User[] }; 