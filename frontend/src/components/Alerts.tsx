import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAlerts } from '../contexts/AlertContext';
import { Alert } from '../../../backend/src/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`alerts-tabpanel-${index}`}
      aria-labelledby={`alerts-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Alerts: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { alerts, activeAlerts, acknowledgeAlert } = useAlerts();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const renderAlertIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return null;
    }
  };

  const renderAlertList = (alertList: Alert[]) => {
    if (alertList.length === 0) {
      return (
        <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
          No alerts to display
        </Typography>
      );
    }

    return (
      <List>
        {alertList.map((alert) => (
          <ListItem
            key={alert.id}
            sx={{
              mb: 1,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
            secondaryAction={
              !alert.acknowledged && (
                <Tooltip title="Acknowledge">
                  <IconButton
                    edge="end"
                    aria-label="acknowledge"
                    onClick={() => handleAcknowledge(alert.id)}
                  >
                    <CheckIcon />
                  </IconButton>
                </Tooltip>
              )
            }
          >
            <Box sx={{ mr: 2 }}>{renderAlertIcon(alert.severity)}</Box>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{alert.message}</Typography>
                  <Chip
                    size="small"
                    label={alert.type}
                    color={
                      alert.severity === 'critical'
                        ? 'error'
                        : alert.severity === 'warning'
                        ? 'warning'
                        : 'info'
                    }
                  />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="textSecondary">
                  {new Date(alert.timestamp).toLocaleString()}
                  {alert.acknowledged &&
                    ` • Acknowledged by ${alert.acknowledgedBy} at ${new Date(
                      alert.acknowledgedAt!
                    ).toLocaleString()}`}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Active Alerts</Typography>
                {activeAlerts.length > 0 && (
                  <Chip
                    size="small"
                    color="error"
                    label={activeAlerts.length}
                  />
                )}
              </Box>
            }
          />
          <Tab label={<Typography>All Alerts</Typography>} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        {renderAlertList(activeAlerts)}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {renderAlertList(alerts)}
      </TabPanel>
    </Paper>
  );
};

export default Alerts; 