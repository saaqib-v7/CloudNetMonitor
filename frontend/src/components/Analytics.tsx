import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { SystemMetrics } from '../types/analytics';

interface AnalyticsProps {
  systemMetrics: SystemMetrics[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const timeRangeOptions = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

const Analytics: React.FC<AnalyticsProps> = ({
  systemMetrics,
  timeRange,
  onTimeRangeChange,
}) => {
  const [activeChart, setActiveChart] = useState<'cpu' | 'memory' | 'network'>('cpu');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (systemMetrics && systemMetrics.length > 0) {
      const data = systemMetrics.map(metric => ({
        timestamp: format(new Date(metric.timestamp), timeRange === '1h' ? 'HH:mm' : 'MM/dd HH:mm'),
        value: activeChart === 'cpu' ? metric.averageCpu :
               activeChart === 'memory' ? metric.averageMemory :
               metric.averageNetwork
      }));
      setChartData(data);
    }
  }, [systemMetrics, activeChart, timeRange]);

  const getChartColor = () => {
    switch (activeChart) {
      case 'cpu':
        return '#3B82F6'; // blue
      case 'memory':
        return '#9333EA'; // purple
      case 'network':
        return '#22C55E'; // green
      default:
        return '#3B82F6';
    }
  };

  const getLatestMetric = () => {
    if (!systemMetrics || systemMetrics.length === 0) return null;
    return systemMetrics[systemMetrics.length - 1];
  };

  const latestMetric = getLatestMetric();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Analytics</h2>
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-3 py-1 text-sm border-0 focus:ring-2 focus:ring-blue-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Average CPU</h3>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {latestMetric ? `${latestMetric.averageCpu.toFixed(1)}%` : '0%'}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Average Memory</h3>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {latestMetric ? `${latestMetric.averageMemory.toFixed(1)}%` : '0%'}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Average Network</h3>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {latestMetric ? `${latestMetric.averageNetwork.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveChart('cpu')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'cpu'
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            CPU Usage
          </button>
          <button
            onClick={() => setActiveChart('memory')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'memory'
                ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Memory Usage
          </button>
          <button
            onClick={() => setActiveChart('network')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeChart === 'network'
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Network Usage
          </button>
        </div>

        {/* Chart */}
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#F3F4F6'
                  }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getChartColor()}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 