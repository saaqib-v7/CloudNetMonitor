import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, AlertRule } from '../../../backend/src/types';
import { useAuth } from './AuthContext';
import { useWebSocket } from './WebSocketContext';

interface AlertContextType {
  alerts: Alert[];
  activeAlerts: Alert[];
  rules: AlertRule[];
  acknowledgeAlert: (alertId: string) => Promise<void>;
  addRule: (rule: Omit<AlertRule, 'id'>) => Promise<void>;
  updateRule: (id: string, rule: Partial<AlertRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const { token } = useAuth();
  const { socket } = useWebSocket();

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, [token]);

  const fetchRules = useCallback(async () => {
    try {
      const response = await fetch('/api/alerts/rules', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    fetchAlerts();
    fetchRules();

    if (socket) {
      const handleWebSocketMessage = (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (message.type === 'ALERTS_UPDATE') {
          setAlerts(message.payload);
        } else if (message.type === 'ALERT_RULE_UPDATE') {
          setRules(prev => prev.map(rule => 
            rule.id === message.payload.id ? message.payload : rule
          ));
        }
      };

      socket.addEventListener('message', handleWebSocketMessage);
      return () => {
        socket.removeEventListener('message', handleWebSocketMessage);
      };
    }
  }, [token, socket, fetchAlerts, fetchRules]);

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const acknowledgedAlert = await response.json();
        setAlerts(prev =>
          prev.map(alert =>
            alert.id === alertId ? acknowledgedAlert : alert
          )
        );
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      throw error;
    }
  };

  const addRule = async (rule: Omit<AlertRule, 'id'>) => {
    try {
      const response = await fetch('/api/alerts/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(rule),
      });

      if (response.ok) {
        const newRule = await response.json();
        setRules(prev => [...prev, newRule]);
      }
    } catch (error) {
      console.error('Error adding alert rule:', error);
      throw error;
    }
  };

  const updateRule = async (id: string, rule: Partial<AlertRule>) => {
    try {
      const response = await fetch(`/api/alerts/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(rule),
      });

      if (response.ok) {
        const updatedRule = await response.json();
        setRules(prev =>
          prev.map(r => (r.id === id ? updatedRule : r))
        );
      }
    } catch (error) {
      console.error('Error updating alert rule:', error);
      throw error;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/alerts/rules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setRules(prev => prev.filter(rule => rule.id !== id));
      }
    } catch (error) {
      console.error('Error deleting alert rule:', error);
      throw error;
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        activeAlerts,
        rules,
        acknowledgeAlert,
        addRule,
        updateRule,
        deleteRule,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}; 