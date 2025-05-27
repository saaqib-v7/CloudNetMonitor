"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NodeSimulator {
    constructor() {
        this.nodes = new Map();
        ['Node 1', 'Node 2', 'Node 3', 'Node 4'].forEach((name, index) => {
            const node = {
                id: `node-${index + 1}`,
                name: `IMS ${name}`,
                status: 'online',
                lastUpdated: new Date().toISOString(),
                type: index % 2 === 0 ? 'voice' : 'data',
                ip: `192.168.1.${index + 10}`,
                load: {
                    cpu: Math.random() * 100,
                    memory: Math.random() * 100,
                    network: Math.random() * 100
                }
            };
            this.nodes.set(node.id, node);
        });
    }
    getNodes() {
        return Array.from(this.nodes.values());
    }
    updateNodes() {
        this.nodes.forEach(node => {
            if (Math.random() < 0.1) {
                node.status = node.status === 'online' ? 'offline' : 'online';
            }
            node.load = {
                cpu: Math.min(100, Math.max(0, node.load.cpu + (Math.random() - 0.5) * 10)),
                memory: Math.min(100, Math.max(0, node.load.memory + (Math.random() - 0.5) * 5)),
                network: Math.min(100, Math.max(0, node.load.network + (Math.random() - 0.5) * 15))
            };
            node.lastUpdated = new Date().toISOString();
        });
        return this.getNodes();
    }
}
exports.default = NodeSimulator;
