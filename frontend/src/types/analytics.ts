export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface NodeMetrics {
  nodeId: string;
  nodeName: string;
  cpu: TimeSeriesData[];
  memory: TimeSeriesData[];
  network: TimeSeriesData[];
}

export interface SystemMetrics {
  totalNodes: number;
  onlineNodes: number;
  averageCpu: number;
  averageMemory: number;
  averageNetwork: number;
  timestamp: string;
}

export interface AnalyticsData {
  nodeMetrics: NodeMetrics[];
  systemMetrics: SystemMetrics[];
  timeRange: string; // '1h' | '24h' | '7d' | '30d'
} 