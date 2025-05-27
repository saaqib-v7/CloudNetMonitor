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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const WebSocketService_1 = __importDefault(require("./services/WebSocketService"));
const UserService_1 = require("./services/UserService");
const HealthService_1 = require("./services/HealthService");
const AlertService_1 = require("./services/AlertService");
const MetricsService_1 = require("./services/MetricsService");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
let wsService;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Auth middleware
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    if (!UserService_1.userService.verifyToken(token)) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    next();
});
// Initialize services and start server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Initialize health service
            HealthService_1.healthService.initialize();
            // Initialize alert service
            AlertService_1.alertService.initialize();
            // Create HTTP server
            const server = http_1.default.createServer(app);
            // Initialize WebSocket service
            wsService = new WebSocketService_1.default(server);
            // Start server
            server.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
            // Routes
            app.get('/api/nodes', authMiddleware, (req, res) => {
                const nodes = wsService.getNodes();
                res.json(nodes);
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    });
}
// Public endpoints
app.get('/api/metrics/public', (req, res) => {
    const metrics = MetricsService_1.metricsService.getMetrics('1h');
    res.json(metrics.systemMetrics);
});
// Routes
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const result = yield UserService_1.userService.authenticate(username, password);
        if (result) {
            res.json(result);
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.get('/api/health', authMiddleware, (req, res) => {
    try {
        const nodes = wsService.getNodes();
        const health = HealthService_1.healthService.checkSystemHealth(nodes);
        res.json(health);
    }
    catch (error) {
        console.error('Error fetching health data:', error);
        res.status(500).json({ message: 'Failed to fetch health data' });
    }
});
app.get('/api/alerts', authMiddleware, (req, res) => {
    try {
        const alerts = AlertService_1.alertService.getAlerts();
        res.json(alerts);
    }
    catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ message: 'Failed to fetch alerts' });
    }
});
app.get('/api/alerts/rules', authMiddleware, (req, res) => {
    try {
        const rules = AlertService_1.alertService.getRules();
        res.json(rules);
    }
    catch (error) {
        console.error('Error fetching alert rules:', error);
        res.status(500).json({ message: 'Failed to fetch alert rules' });
    }
});
app.post('/api/alerts/:alertId/acknowledge', authMiddleware, (req, res) => {
    var _a;
    const { alertId } = req.params;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const userId = UserService_1.userService.getUserIdFromToken(token);
    const success = AlertService_1.alertService.acknowledgeAlert(alertId, userId);
    if (success) {
        const alert = AlertService_1.alertService.getAlerts().find(a => a.id === alertId);
        res.json(alert);
    }
    else {
        res.status(404).json({ message: 'Alert not found' });
    }
});
app.put('/api/users/:userId/preferences', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const preferences = req.body;
    const updatedUser = UserService_1.userService.updateUserPreferences(userId, preferences);
    if (updatedUser) {
        res.json(updatedUser);
    }
    else {
        res.status(404).json({ message: 'User not found' });
    }
}));
// Start the server
startServer();
