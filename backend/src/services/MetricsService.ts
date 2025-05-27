import { ImsNode } from '../types';

interface TimeSeriesData {
  timestamp: string;
  value: number;
}

interface NodeMetrics {
  nodeId: string;
  nodeName: string;
  cpu: TimeSeriesData[];
  memory: TimeSeriesData[];
  network: TimeSeriesData[];
}

interface SystemMetrics {
  totalNodes: number;
  onlineNodes: number;
  averageCpu: number;
  averageMemory: number;
  averageNetwork: number;
  timestamp: string;
}

class MetricsService {
  private nodeMetrics: Map<string, NodeMetrics> = new Map();
  private systemMetrics: SystemMetrics[] = [];
  private readonly maxDataPoints = 1000;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeTestData();
    this.startPeriodicUpdates();
  }

  private initializeTestData() {
    const now = new Date();
    for (let i = 0; i < 60; i++) {
      const timestamp = new Date(now.getTime() - (60 - i) * 1000).toISOString();
      const systemMetric: SystemMetrics = {
        totalNodes: 4,
        onlineNodes: 3,
        averageCpu: 30 + Math.random() * 20,
        averageMemory: 40 + Math.random() * 30,
        averageNetwork: 25 + Math.random() * 15,
        timestamp,
      };
      this.systemMetrics.push(systemMetric);
    }
  }

  private startPeriodicUpdates() {
    this.updateInterval = setInterval(() => {
      const systemMetric: SystemMetrics = {
        totalNodes: 4,
        onlineNodes: 3,
        averageCpu: 30 + Math.random() * 20,
        averageMemory: 40 + Math.random() * 30,
        averageNetwork: 25 + Math.random() * 15,
        timestamp: new Date().toISOString(),
      };
      this.systemMetrics.push(systemMetric);

      if (this.systemMetrics.length > this.maxDataPoints) {
        this.systemMetrics = this.systemMetrics.slice(-this.maxDataPoints);
      }
    }, 1000);
  }

  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  updateNodeMetrics(node: ImsNode): void {
    const timestamp = new Date().toISOString();
    const nodeId = node.ip;

    let metrics = this.nodeMetrics.get(nodeId);
    if (!metrics) {
      metrics = {
        nodeId,
        nodeName: node.name,
        cpu: [],
        memory: [],
        network: [],
      };
      this.nodeMetrics.set(nodeId, metrics);
    }

    metrics.cpu.push({ timestamp, value: node.load.cpu });
    metrics.memory.push({ timestamp, value: node.load.memory });
    metrics.network.push({ timestamp, value: node.load.network });

    if (metrics.cpu.length > this.maxDataPoints) {
      metrics.cpu = metrics.cpu.slice(-this.maxDataPoints);
      metrics.memory = metrics.memory.slice(-this.maxDataPoints);
      metrics.network = metrics.network.slice(-this.maxDataPoints);
    }

    this.updateSystemMetrics();
  }

  private updateSystemMetrics(): void {
    const timestamp = new Date().toISOString();
    const nodes = Array.from(this.nodeMetrics.values());
    const totalNodes = nodes.length;
    const onlineNodes = nodes.length;

    const averages = nodes.reduce(
      (acc, node) => {
        const latestCpu = node.cpu[node.cpu.length - 1]?.value ?? 0;
        const latestMemory = node.memory[node.memory.length - 1]?.value ?? 0;
        const latestNetwork = node.network[node.network.length - 1]?.value ?? 0;

        return {
          cpu: acc.cpu + latestCpu,
          memory: acc.memory + latestMemory,
          network: acc.network + latestNetwork,
        };
      },
      { cpu: 0, memory: 0, network: 0 }
    );

    const systemMetric: SystemMetrics = {
      totalNodes,
      onlineNodes,
      averageCpu: totalNodes > 0 ? averages.cpu / totalNodes : 0,
      averageMemory: totalNodes > 0 ? averages.memory / totalNodes : 0,
      averageNetwork: totalNodes > 0 ? averages.network / totalNodes : 0,
      timestamp,
    };

    this.systemMetrics.push(systemMetric);

    if (this.systemMetrics.length > this.maxDataPoints) {
      this.systemMetrics = this.systemMetrics.slice(-this.maxDataPoints);
    }
  }

  getMetrics(timeRange: string): {
    nodeMetrics: NodeMetrics[];
    systemMetrics: SystemMetrics[];
  } {
    const now = new Date();
    let since: Date;

    switch (timeRange) {
      case '1h':
        since = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(now.getTime() - 60 * 60 * 1000);
    }

    const sinceStr = since.toISOString();

    const filteredSystemMetrics = this.systemMetrics.filter(
      (metric) => metric.timestamp >= sinceStr
    );

    const filteredNodeMetrics = Array.from(this.nodeMetrics.values()).map((node) => ({
      ...node,
      cpu: node.cpu.filter((metric) => metric.timestamp >= sinceStr),
      memory: node.memory.filter((metric) => metric.timestamp >= sinceStr),
      network: node.network.filter((metric) => metric.timestamp >= sinceStr),
    }));

    return {
      nodeMetrics: filteredNodeMetrics,
      systemMetrics: filteredSystemMetrics,
    };
  }
}

export const metricsService = new MetricsService(); 