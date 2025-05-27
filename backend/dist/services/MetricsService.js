"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsService = void 0;
class MetricsService {
    constructor() {
        this.nodeMetrics = new Map();
        this.systemMetrics = [];
        this.maxDataPoints = 1000;
    }
    updateNodeMetrics(node) {
        const timestamp = new Date().toISOString();
        const nodeId = node.ip;
        // Get or create node metrics
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
        // Add new data points
        metrics.cpu.push({ timestamp, value: node.load.cpu });
        metrics.memory.push({ timestamp, value: node.load.memory });
        metrics.network.push({ timestamp, value: node.load.network });
        // Trim old data points
        if (metrics.cpu.length > this.maxDataPoints) {
            metrics.cpu = metrics.cpu.slice(-this.maxDataPoints);
            metrics.memory = metrics.memory.slice(-this.maxDataPoints);
            metrics.network = metrics.network.slice(-this.maxDataPoints);
        }
        this.updateSystemMetrics();
    }
    updateSystemMetrics() {
        const timestamp = new Date().toISOString();
        const nodes = Array.from(this.nodeMetrics.values());
        const totalNodes = nodes.length;
        const onlineNodes = nodes.length; // In this example, all nodes are considered online
        // Calculate averages from the latest metrics
        const averages = nodes.reduce((acc, node) => {
            var _a, _b, _c, _d, _e, _f;
            const latestCpu = (_b = (_a = node.cpu[node.cpu.length - 1]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0;
            const latestMemory = (_d = (_c = node.memory[node.memory.length - 1]) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : 0;
            const latestNetwork = (_f = (_e = node.network[node.network.length - 1]) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : 0;
            return {
                cpu: acc.cpu + latestCpu,
                memory: acc.memory + latestMemory,
                network: acc.network + latestNetwork,
            };
        }, { cpu: 0, memory: 0, network: 0 });
        const systemMetric = {
            totalNodes,
            onlineNodes,
            averageCpu: totalNodes > 0 ? averages.cpu / totalNodes : 0,
            averageMemory: totalNodes > 0 ? averages.memory / totalNodes : 0,
            averageNetwork: totalNodes > 0 ? averages.network / totalNodes : 0,
            timestamp,
        };
        this.systemMetrics.push(systemMetric);
        // Keep only last 1000 system metrics
        if (this.systemMetrics.length > this.maxDataPoints) {
            this.systemMetrics = this.systemMetrics.slice(-this.maxDataPoints);
        }
    }
    getMetrics(timeRange) {
        const now = new Date();
        let since;
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
                since = new Date(now.getTime() - 60 * 60 * 1000); // Default to 1h
        }
        const sinceStr = since.toISOString();
        // Filter metrics by time range
        const filteredSystemMetrics = this.systemMetrics.filter((metric) => metric.timestamp >= sinceStr);
        const filteredNodeMetrics = Array.from(this.nodeMetrics.values()).map((node) => (Object.assign(Object.assign({}, node), { cpu: node.cpu.filter((metric) => metric.timestamp >= sinceStr), memory: node.memory.filter((metric) => metric.timestamp >= sinceStr), network: node.network.filter((metric) => metric.timestamp >= sinceStr) })));
        return {
            nodeMetrics: filteredNodeMetrics,
            systemMetrics: filteredSystemMetrics,
        };
    }
}
exports.metricsService = new MetricsService();
