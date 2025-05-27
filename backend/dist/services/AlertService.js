"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertService = void 0;
const uuid_1 = require("uuid");
class AlertService {
    constructor() {
        this.alerts = new Map();
        this.rules = new Map();
        // Add default alert rules
        this.addDefaultRules();
    }
    initialize() {
        console.log('Initializing AlertService...');
        // Any additional initialization can be added here
    }
    addDefaultRules() {
        const defaultRules = [
            {
                id: (0, uuid_1.v4)(),
                name: 'High CPU Usage',
                type: 'cpu',
                condition: 'gt',
                threshold: 80,
                severity: 'high',
                enabled: true
            },
            {
                id: (0, uuid_1.v4)(),
                name: 'High Memory Usage',
                type: 'memory',
                condition: 'gt',
                threshold: 85,
                severity: 'high',
                enabled: true
            },
            {
                id: (0, uuid_1.v4)(),
                name: 'Network Saturation',
                type: 'network',
                condition: 'gt',
                threshold: 90,
                severity: 'critical',
                enabled: true
            },
            {
                id: (0, uuid_1.v4)(),
                name: 'Node Offline',
                type: 'status',
                condition: 'eq',
                threshold: 0,
                severity: 'critical',
                enabled: true
            }
        ];
        defaultRules.forEach(rule => {
            this.rules.set(rule.id, rule);
        });
    }
    getAlerts() {
        return Array.from(this.alerts.values());
    }
    getRules() {
        return Array.from(this.rules.values());
    }
    checkNodeAlerts(node) {
        const newAlerts = [];
        this.rules.forEach(rule => {
            if (!rule.enabled)
                return;
            let value;
            switch (rule.type) {
                case 'cpu':
                    value = node.load.cpu;
                    break;
                case 'memory':
                    value = node.load.memory;
                    break;
                case 'network':
                    value = node.load.network;
                    break;
                case 'status':
                    value = node.status === 'online' ? 1 : 0;
                    break;
                default:
                    return;
            }
            let condition = false;
            switch (rule.condition) {
                case 'gt':
                    condition = value > rule.threshold;
                    break;
                case 'lt':
                    condition = value < rule.threshold;
                    break;
                case 'eq':
                    condition = value === rule.threshold;
                    break;
            }
            if (condition) {
                console.log(`Alert triggered for node ${node.name}: ${rule.name} (${value})`);
                const alert = {
                    id: (0, uuid_1.v4)(),
                    nodeId: node.id,
                    type: rule.type,
                    severity: rule.severity,
                    message: `${rule.name}: ${value}% on node ${node.name}`,
                    timestamp: new Date().toISOString(),
                    acknowledged: false
                };
                this.alerts.set(alert.id, alert);
                newAlerts.push(alert);
            }
        });
        if (newAlerts.length > 0) {
            console.log(`Generated ${newAlerts.length} new alerts for node ${node.name}`);
        }
        return newAlerts;
    }
    getActiveAlerts() {
        const activeAlerts = Array.from(this.alerts.values())
            .filter(alert => !alert.acknowledged)
            .sort((a, b) => {
            if (a.severity === 'critical' && b.severity !== 'critical')
                return -1;
            if (a.severity !== 'critical' && b.severity === 'critical')
                return 1;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        console.log(`Retrieved ${activeAlerts.length} active alerts`);
        return activeAlerts;
    }
    acknowledgeAlert(alertId, userId = 'admin') {
        const alert = this.alerts.get(alertId);
        if (!alert)
            return false;
        alert.acknowledged = true;
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date().toISOString();
        this.alerts.set(alertId, alert);
        return true;
    }
    clearAlert(alertId) {
        return this.alerts.delete(alertId);
    }
    clearAllAlerts() {
        this.alerts.clear();
    }
    addRule(rule) {
        this.rules.set(rule.id, rule);
    }
    updateRule(ruleId, updates) {
        const rule = this.rules.get(ruleId);
        if (!rule)
            return false;
        this.rules.set(ruleId, Object.assign(Object.assign({}, rule), updates));
        return true;
    }
    deleteRule(ruleId) {
        return this.rules.delete(ruleId);
    }
}
exports.alertService = new AlertService();
