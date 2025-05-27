import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, updateUserPreferences } = useAuth();

  if (!user) return null;

  const handleThemeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTheme = event.target.checked ? 'dark' : 'light';
    try {
      await updateUserPreferences({ theme: newTheme });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleTimeRangeChange = async (event: any) => {
    try {
      await updateUserPreferences({ defaultTimeRange: event.target.value });
    } catch (error) {
      console.error('Failed to update time range:', error);
    }
  };

  const handleAlertNotificationsChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      await updateUserPreferences({
        alertNotifications: event.target.checked,
      });
    } catch (error) {
      console.error('Failed to update alert notifications:', error);
    }
  };

  const handleEmailNotificationsChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      await updateUserPreferences({
        emailNotifications: event.target.checked,
      });
    } catch (error) {
      console.error('Failed to update email notifications:', error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        User Settings
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Theme
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={user.preferences?.theme === 'dark'}
              onChange={handleThemeChange}
            />
          }
          label={<Typography>Dark Mode</Typography>}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Default Time Range
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={user.preferences?.defaultTimeRange || '24h'}
            onChange={handleTimeRangeChange}
            size="small"
          >
            <MenuItem value="1h">Last Hour</MenuItem>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={user.preferences?.alertNotifications ?? false}
                onChange={handleAlertNotificationsChange}
              />
            }
            label={<Typography>Browser Notifications</Typography>}
          />
          <FormControlLabel
            control={
              <Switch
                checked={user.preferences?.emailNotifications ?? false}
                onChange={handleEmailNotificationsChange}
              />
            }
            label={<Typography>Email Notifications</Typography>}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Account Information
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Username: {user.username || 'N/A'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Email: {user.email || 'N/A'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Role: {user.role || 'N/A'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Member since: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Settings; 