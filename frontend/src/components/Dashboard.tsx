import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useWebSocket } from '../contexts/WebSocketContext';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`metrics-tabpanel-${index}`}
      aria-labelledby={`metrics-tab-${index}`}
      {...other}
      style={{ height: '400px', width: '100%' }}
    >
      {value === index && children}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const theme = useTheme();
  const { isConnected, systemStatus } = useWebSocket();
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);

  useEffect(() => {
    if (systemStatus) {
      console.log('Updating metrics history with:', systemStatus);
      setMetricsHistory(prev => {
        const newHistory = [...prev, {
          timestamp: new Date(systemStatus.timestamp),
          cpu: systemStatus.averageCpu,
          memory: systemStatus.averageMemory,
          network: systemStatus.averageNetwork,
          totalNodes: systemStatus.totalNodes,
          onlineNodes: systemStatus.onlineNodes,
        }];
        
        // Keep last 50 data points
        if (newHistory.length > 50) {
          return newHistory.slice(-50);
        }
        return newHistory;
      });
    }
  }, [systemStatus]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const formatXAxis = (tickItem: any) => {
    if (tickItem instanceof Date) {
      return format(tickItem, 'HH:mm:ss');
    }
    return tickItem;
  };

  const renderChart = (dataKey: string, color: string) => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={metricsHistory}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={theme.palette.divider}
          vertical={false}
        />
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatXAxis}
          stroke={theme.palette.text.secondary}
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
          }}
          labelStyle={{ color: theme.palette.text.primary }}
          labelFormatter={(label) => {
            if (label instanceof Date) {
              return format(label, 'HH:mm:ss');
            }
            return label;
          }}
          formatter={(value: number) => [`${value.toFixed(2)}%`, dataKey.toUpperCase()]}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 1 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* System Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Nodes
                    </Typography>
                    <Typography variant="h4">
                      {systemStatus?.totalNodes ?? '-'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Online Nodes
                    </Typography>
                    <Typography variant="h4">
                      {systemStatus?.onlineNodes ?? '-'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Connection Status
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: isConnected
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                      }}
                    >
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Last Update
                    </Typography>
                    <Typography variant="h6">
                      {systemStatus?.timestamp ? format(new Date(systemStatus.timestamp), 'HH:mm:ss') : '-'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Metrics Charts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="CPU Usage" />
              <Tab label="Memory Usage" />
              <Tab label="Network Usage" />
            </Tabs>

            <TabPanel value={currentTab} index={0}>
              {renderChart('cpu', theme.palette.primary.main)}
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              {renderChart('memory', theme.palette.secondary.main)}
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
              {renderChart('network', theme.palette.success.main)}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 