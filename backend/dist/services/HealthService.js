"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = void 0;
class HealthService {
    constructor() {
        this.lastCheck = new Date().toISOString();
    }
    initialize() {
        console.log('Initializing HealthService...');
        this.lastCheck = new Date().toISOString();
    }
    checkSystemHealth(nodes) {
        const issues = [];
        let status = 'healthy';
        // Check node status
        const offlineNodes = nodes.filter(node => node.status === 'offline').length;
        if (offlineNodes > 0) {
            issues.push(`${offlineNodes} node(s) are offline`);
            status = offlineNodes === nodes.length ? 'critical' : 'warning';
        }
        // Check CPU usage
        const highCpuNodes = nodes.filter(node => node.load.cpu > 80).length;
        if (highCpuNodes > 0) {
            issues.push(`${highCpuNodes} node(s) have high CPU usage (>80%)`);
            status = highCpuNodes > nodes.length / 2 ? 'critical' : 'warning';
        }
        // Check memory usage
        const highMemoryNodes = nodes.filter(node => node.load.memory > 85).length;
        if (highMemoryNodes > 0) {
            issues.push(`${highMemoryNodes} node(s) have high memory usage (>85%)`);
            status = highMemoryNodes > nodes.length / 2 ? 'critical' : 'warning';
        }
        // Check network usage
        const highNetworkNodes = nodes.filter(node => node.load.network > 90).length;
        if (highNetworkNodes > 0) {
            issues.push(`${highNetworkNodes} node(s) have high network usage (>90%)`);
            status = highNetworkNodes > nodes.length / 2 ? 'critical' : 'warning';
        }
        // If no issues found
        if (issues.length === 0) {
            issues.push('All systems operating normally');
        }
        this.lastCheck = new Date().toISOString();
        return {
            status,
            issues,
            timestamp: this.lastCheck
        };
    }
}
exports.healthService = new HealthService();
