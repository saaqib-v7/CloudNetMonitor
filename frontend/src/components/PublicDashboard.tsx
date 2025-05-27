import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Login as LoginIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useNavigate } from 'react-router-dom';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const PublicDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useAppTheme();
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics/public');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        console.log('Received metrics:', data);
        
        if (Array.isArray(data)) {
          setMetrics(data);
        } else if (data.systemMetrics && Array.isArray(data.systemMetrics)) {
          setMetrics(data.systemMetrics);
        } else {
          console.error('Unexpected metrics data format:', data);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1000);

    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    animation: {
      duration: 0
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const,
          displayFormats: {
            minute: 'HH:mm:ss'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: (value: number) => `${value}%`
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
          usePointStyle: true,
          padding: 20
        },
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
        }
      }
    },
  };

  const cpuData = {
    datasets: [
      {
        label: 'CPU Usage',
        data: metrics.map(m => ({
          x: new Date(m.timestamp),
          y: m.averageCpu,
        })),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        tension: 0.4,
      },
    ],
  };

  const memoryData = {
    datasets: [
      {
        label: 'Memory Usage',
        data: metrics.map(m => ({
          x: new Date(m.timestamp),
          y: m.averageMemory,
        })),
        borderColor: theme.palette.secondary.main,
        backgroundColor: theme.palette.secondary.main,
        tension: 0.4,
      },
    ],
  };

  const networkData = {
    datasets: [
      {
        label: 'Network Usage',
        data: metrics.map(m => ({
          x: new Date(m.timestamp),
          y: m.averageNetwork,
        })),
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.main,
        tension: 0.4,
      },
    ],
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          boxShadow: 1,
          p: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon sx={{ fontSize: 32 }} />
            <span>CloudNet Monitor</span>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
            >
              <span>Admin Login</span>
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: 2,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Overview
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Real-time system metrics
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                CPU Usage
              </Typography>
              <Box sx={{ height: 240 }}>
                <Line options={chartOptions} data={cpuData} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Memory Usage
              </Typography>
              <Box sx={{ height: 240 }}>
                <Line options={chartOptions} data={memoryData} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                Network Usage
              </Typography>
              <Box sx={{ height: 240 }}>
                <Line options={chartOptions} data={networkData} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PublicDashboard; 