"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const AlertService_1 = require("./AlertService");
const HealthService_1 = require("./HealthService");
const UserService_1 = require("./UserService");
const url_1 = require("url");
class WebSocketService {
    constructor(server) {
        this.clients = new Map();
        this.nodes = new Map();
        this.updateInterval = null;
        this.pingInterval = null;
        this.PING_INTERVAL = 10000; // 10 seconds
        this.PING_TIMEOUT = 5000; // 5 seconds
        this.MAX_RETRIES = 3;
        this.wss = new ws_1.default.Server({
            server,
            clientTracking: true,
        });
        this.setupWebSocket();
        this.startUpdateLoop();
        this.startPingLoop();
        // Initialize some test nodes
        this.initializeTestNodes();
    }
    initializeTestNodes() {
        // Add some test nodes
        const testNodes = [
            {
                id: '1',
                name: 'Node-1',
                ip: '192.168.1.101',
                status: 'online',
                type: 'voice',
                lastUpdated: new Date().toISOString(),
                load: {
                    cpu: 85, // High CPU to trigger alert
                    memory: 45,
                    network: 30
                }
            },
            {
                id: '2',
                name: 'Node-2',
                ip: '192.168.1.102',
                status: 'online',
                type: 'data',
                lastUpdated: new Date().toISOString(),
                load: {
                    cpu: 25,
                    memory: 90, // High memory to trigger alert
                    network: 40
                }
            },
            {
                id: '3',
                name: 'Node-3',
                ip: '192.168.1.103',
                status: 'offline', // Offline to trigger alert
                type: 'voice',
                lastUpdated: new Date().toISOString(),
                load: {
                    cpu: 45,
                    memory: 55,
                    network: 20
                }
            },
            {
                id: '4',
                name: 'Node-4',
                ip: '192.168.1.104',
                status: 'online',
                type: 'data',
                lastUpdated: new Date().toISOString(),
                load: {
                    cpu: 30,
                    memory: 40,
                    network: 95 // High network to trigger alert
                }
            }
        ];
        testNodes.forEach(node => {
            this.nodes.set(node.id, node);
            // Check for alerts when adding each node
            AlertService_1.alertService.checkNodeAlerts(node);
        });
    }
    getNodes() {
        return Array.from(this.nodes.values());
    }
    setupWebSocket() {
        this.wss.on('connection', (ws, request) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Parse the URL to get the token
                const { query } = (0, url_1.parse)(request.url || '', true);
                const token = query.token;
                // Verify token
                const tokenVerification = UserService_1.userService.verifyToken(token);
                if (!token || !tokenVerification.valid) {
                    console.log(`Client connection rejected - ${tokenVerification.error || 'Invalid token'}`);
                    ws.close(1008, tokenVerification.error || 'Invalid token');
                    return;
                }
                // Check if client is already connected with this token
                const userId = UserService_1.userService.getUserIdFromToken(token);
                for (const [existingWs, client] of this.clients.entries()) {
                    if (client.userId === userId && existingWs.readyState === ws_1.default.OPEN) {
                        console.log(`Closing existing connection for user ${userId}`);
                        existingWs.close(1000, 'New connection established');
                        this.clients.delete(existingWs);
                        break;
                    }
                }
                // Initialize client tracking
                this.clients.set(ws, {
                    isAlive: true,
                    lastPing: Date.now(),
                    userId
                });
                console.log(`New client connected - User: ${userId}`);
                try {
                    // Send initial data
                    yield this.sendInitialData(ws);
                }
                catch (error) {
                    console.error('Error sending initial data:', error);
                    ws.close(1011, 'Error sending initial data');
                    this.clients.delete(ws);
                    return;
                }
                // Handle pong messages
                ws.on('pong', () => {
                    const client = this.clients.get(ws);
                    if (client) {
                        client.isAlive = true;
                        client.lastPing = Date.now();
                    }
                });
                // Handle close
                ws.on('close', (code, reason) => {
                    console.log(`Client disconnected - User: ${userId}, Code: ${code}, Reason: ${reason}`);
                    this.clients.delete(ws);
                });
                // Handle errors
                ws.on('error', (error) => {
                    console.error(`WebSocket error for user ${userId}:`, error);
                    this.clients.delete(ws);
                    try {
                        ws.close(1011, 'Internal WebSocket error');
                    }
                    catch (closeError) {
                        console.error('Error closing socket:', closeError);
                    }
                });
            }
            catch (error) {
                console.error('Error in connection handler:', error);
                ws.close(1011, 'Internal server error');
                this.clients.delete(ws);
            }
        }));
        // Handle server errors
        this.wss.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    }
    sendInitialData(ws) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ws.readyState !== ws_1.default.OPEN) {
                throw new Error('WebSocket is not open');
            }
            try {
                // Send nodes data
                const nodes = Array.from(this.nodes.values());
                for (const node of nodes) {
                    const nodeMessage = {
                        type: 'NODE_UPDATE',
                        payload: node
                    };
                    yield this.sendMessage(ws, nodeMessage);
                }
                // Send system status
                const systemStatus = {
                    type: 'SYSTEM_STATUS',
                    payload: {
                        totalNodes: this.nodes.size,
                        onlineNodes: Array.from(this.nodes.values()).filter(node => node.status === 'online').length,
                        averageCpu: this.calculateAverage('cpu'),
                        averageMemory: this.calculateAverage('memory'),
                        averageNetwork: this.calculateAverage('network'),
                        timestamp: new Date().toISOString()
                    }
                };
                yield this.sendMessage(ws, systemStatus);
                // Send health data
                const healthData = {
                    type: 'HEALTH_UPDATE',
                    payload: HealthService_1.healthService.checkSystemHealth(Array.from(this.nodes.values()))
                };
                yield this.sendMessage(ws, healthData);
                // Send initial alerts data
                const activeAlerts = AlertService_1.alertService.getActiveAlerts();
                if (activeAlerts.length > 0) {
                    for (const alert of activeAlerts) {
                        const alertMessage = {
                            type: 'ALERT_UPDATE',
                            payload: alert
                        };
                        yield this.sendMessage(ws, alertMessage);
                    }
                }
                // Send users data
                const users = yield UserService_1.userService.getUsers();
                const usersMessage = {
                    type: 'USERS_UPDATE',
                    payload: users
                };
                yield this.sendMessage(ws, usersMessage);
            }
            catch (error) {
                console.error('Error sending initial data:', error);
                throw error;
            }
        });
    }
    sendMessage(ws, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (ws.readyState !== ws_1.default.OPEN) {
                    reject(new Error('WebSocket is not open'));
                    return;
                }
                ws.send(JSON.stringify(message), (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    calculateAverage(metric) {
        const nodes = Array.from(this.nodes.values());
        if (nodes.length === 0)
            return 0;
        const sum = nodes.reduce((acc, node) => acc + node.load[metric], 0);
        return Math.round((sum / nodes.length) * 100) / 100;
    }
    startUpdateLoop() {
        this.updateInterval = setInterval(() => {
            // Update nodes
            Array.from(this.nodes.values()).forEach(node => {
                // Simulate load changes
                const newLoad = {
                    cpu: Math.max(0, Math.min(100, node.load.cpu + (Math.random() * 20 - 10))),
                    memory: Math.max(0, Math.min(100, node.load.memory + (Math.random() * 15 - 7.5))),
                    network: Math.max(0, Math.min(100, node.load.network + (Math.random() * 25 - 12.5)))
                };
                const updatedNode = Object.assign(Object.assign({}, node), { load: newLoad, lastUpdated: new Date().toISOString() });
                this.nodes.set(node.id, updatedNode);
                // Check for alerts
                const newAlerts = AlertService_1.alertService.checkNodeAlerts(updatedNode);
                if (newAlerts.length > 0) {
                    // Broadcast new alerts one by one
                    const alertMessage = {
                        type: 'ALERT_UPDATE',
                        payload: newAlerts[0]
                    };
                    newAlerts.forEach(alert => {
                        alertMessage.payload = alert;
                        this.broadcast(alertMessage);
                    });
                }
                // Broadcast node update
                const message = {
                    type: 'NODE_UPDATE',
                    payload: updatedNode
                };
                this.broadcast(message);
            });
            // Send system status update
            const systemStatus = {
                type: 'SYSTEM_STATUS',
                payload: {
                    totalNodes: this.nodes.size,
                    onlineNodes: Array.from(this.nodes.values()).filter(node => node.status === 'online').length,
                    averageCpu: this.calculateAverage('cpu'),
                    averageMemory: this.calculateAverage('memory'),
                    averageNetwork: this.calculateAverage('network'),
                    timestamp: new Date().toISOString()
                }
            };
            this.broadcast(systemStatus);
            // Send health update
            const healthData = {
                type: 'HEALTH_UPDATE',
                payload: HealthService_1.healthService.checkSystemHealth(Array.from(this.nodes.values()))
            };
            this.broadcast(healthData);
        }, 5000); // Update every 5 seconds
    }
    startPingLoop() {
        this.pingInterval = setInterval(() => {
            this.clients.forEach((client, ws) => {
                if (!client.isAlive && Date.now() - client.lastPing > this.PING_TIMEOUT) {
                    console.log('Terminating inactive client');
                    this.clients.delete(ws);
                    return ws.terminate();
                }
                client.isAlive = false;
                try {
                    ws.ping();
                }
                catch (error) {
                    console.error('Error sending ping:', error);
                    this.clients.delete(ws);
                    try {
                        ws.terminate();
                    }
                    catch (terminateError) {
                        console.error('Error terminating socket:', terminateError);
                    }
                }
            });
        }, this.PING_INTERVAL);
    }
    broadcast(message) {
        this.clients.forEach((client, ws) => {
            if (ws.readyState === ws_1.default.OPEN) {
                try {
                    ws.send(JSON.stringify(message));
                }
                catch (error) {
                    console.error('Error broadcasting message:', error);
                    this.clients.delete(ws);
                    try {
                        ws.terminate();
                    }
                    catch (terminateError) {
                        console.error('Error terminating socket:', terminateError);
                    }
                }
            }
        });
    }
    addNode(node) {
        this.nodes.set(node.id, node);
        const message = {
            type: 'NODE_UPDATE',
            payload: node
        };
        this.broadcast(message);
    }
    updateNode(nodeId, updates) {
        const node = this.nodes.get(nodeId);
        if (node) {
            const updatedNode = Object.assign(Object.assign({}, node), updates);
            this.nodes.set(nodeId, updatedNode);
            const message = {
                type: 'NODE_UPDATE',
                payload: updatedNode
            };
            this.broadcast(message);
        }
    }
    removeNode(nodeId) {
        this.nodes.delete(nodeId);
        // Send updated system status after node removal
        const systemStatus = {
            type: 'SYSTEM_STATUS',
            payload: {
                totalNodes: this.nodes.size,
                onlineNodes: Array.from(this.nodes.values()).filter(node => node.status === 'online').length,
                averageCpu: this.calculateAverage('cpu'),
                averageMemory: this.calculateAverage('memory'),
                averageNetwork: this.calculateAverage('network'),
                timestamp: new Date().toISOString()
            }
        };
        this.broadcast(systemStatus);
    }
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }
        // Close all client connections
        this.clients.forEach((client, ws) => {
            try {
                ws.close();
            }
            catch (error) {
                console.error('Error closing client connection:', error);
            }
        });
        this.clients.clear();
        this.wss.close(() => {
            console.log('WebSocket server closed');
        });
    }
}
exports.default = WebSocketService;
