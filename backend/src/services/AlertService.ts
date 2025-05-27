import { Alert, AlertRule, ImsNode, WebSocketMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import WebSocketService from './WebSocketService';

class AlertService {
  private alerts: Map<string, Alert> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private wsService: WebSocketService | null = null;

  constructor() {
    // Add default alert rules
    this.addDefaultRules();
  }

  initialize(wsService: WebSocketService): void {
    console.log('Initializing AlertService...');
    this.wsService = wsService;
  }

  private addDefaultRules() {
    const defaultRules: AlertRule[] = [
      {
        id: uuidv4(),
        name: 'High CPU Usage',
        type: 'cpu',
        condition: 'gt',
        threshold: 80,
        severity: 'high',
        enabled: true
      },
      {
        id: uuidv4(),
        name: 'High Memory Usage',
        type: 'memory',
        condition: 'gt',
        threshold: 85,
        severity: 'high',
        enabled: true
      },
      {
        id: uuidv4(),
        name: 'Network Saturation',
        type: 'network',
        condition: 'gt',
        threshold: 90,
        severity: 'critical',
        enabled: true
      },
      {
        id: uuidv4(),
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

  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  checkNodeAlerts(node: ImsNode): Alert[] {
    const newAlerts: Alert[] = [];

    this.rules.forEach(rule => {
      if (!rule.enabled) return;

      let value: number;
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
        const alert: Alert = {
          id: uuidv4(),
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

  getActiveAlerts(): Alert[] {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => {
        if (a.severity === 'critical' && b.severity !== 'critical') return -1;
        if (a.severity !== 'critical' && b.severity === 'critical') return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    
    console.log(`Retrieved ${activeAlerts.length} active alerts`);
    return activeAlerts;
  }

  acknowledgeAlert(alertId: string, userId: string = 'admin'): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date().toISOString();
    this.alerts.set(alertId, alert);
    return true;
  }

  clearAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  clearAllAlerts(): void {
    this.alerts.clear();
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    const updatedRule = { ...rule, ...updates };
    this.rules.set(ruleId, updatedRule);

    // Broadcast rule update via WebSocket
    if (this.wsService) {
      const message: WebSocketMessage = {
        type: 'ALERT_RULE_UPDATE',
        payload: updatedRule
      };
      this.wsService.broadcast(message);
    }

    return true;
  }

  deleteRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }
}

export const alertService = new AlertService(); 