"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketService = void 0;
const ws_1 = __importDefault(require("ws"));
const nodeSimulator_1 = __importDefault(require("../nodeSimulator"));
const MetricsService_1 = require("./MetricsService");
class WebSocketService {
    constructor() {
        this.wss = null;
        this.updateInterval = null;
        this.metricsInterval = null;
        this.nodeSimulator = new nodeSimulator_1.default();
    }
    initialize(server) {
        this.wss = new ws_1.default.Server({ server });
        this.wss.on('connection', (ws) => {
            console.log('Client connected');
            // Send initial data
            this.sendNodeUpdates(ws);
            this.sendMetrics(ws, '1h');
            // Handle messages from client
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    if (data.type === 'GET_METRICS') {
                        this.sendMetrics(ws, data.payload.timeRange);
                    }
                }
                catch (error) {
                    console.error('Error processing message:', error);
                }
            });
            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });
        // Start periodic updates
        this.startUpdates();
    }
    startUpdates() {
        // Update nodes every 5 seconds
        this.updateInterval = setInterval(() => {
            this.nodeSimulator.updateNodes();
            this.broadcastNodeUpdates();
            this.updateMetrics(); // Update metrics after node updates
        }, 5000);
    }
    updateMetrics() {
        // Update metrics for each node
        this.nodeSimulator.getNodes().forEach((node) => {
            MetricsService_1.metricsService.updateNodeMetrics(node);
        });
        // Broadcast metrics to all clients
        this.broadcastMetrics();
    }
    sendNodeUpdates(ws) {
        const nodes = this.nodeSimulator.getNodes();
        nodes.forEach((node) => {
            const message = {
                type: 'NODE_UPDATE',
                payload: node
            };
            ws.send(JSON.stringify(message));
        });
    }
    broadcastNodeUpdates() {
        if (!this.wss)
            return;
        const nodes = this.nodeSimulator.getNodes();
        nodes.forEach((node) => {
            const message = {
                type: 'NODE_UPDATE',
                payload: node
            };
            this.broadcast(message);
        });
    }
    sendMetrics(ws, timeRange) {
        const metrics = MetricsService_1.metricsService.getMetrics(timeRange);
        console.log('Sending metrics:', metrics); // Debug log
        const message = {
            type: 'METRICS_UPDATE',
            payload: metrics
        };
        ws.send(JSON.stringify(message));
    }
    broadcastMetrics() {
        if (!this.wss)
            return;
        this.wss.clients.forEach(client => {
            if (client.readyState === ws_1.default.OPEN) {
                // Send last hour by default
                this.sendMetrics(client, '1h');
            }
        });
    }
    broadcast(message) {
        if (!this.wss)
            return;
        this.wss.clients.forEach(client => {
            if (client.readyState === ws_1.default.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        if (this.wss) {
            this.wss.close();
        }
    }
}
exports.websocketService = new WebSocketService();
