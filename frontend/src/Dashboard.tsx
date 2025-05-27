import React, { useState, useEffect } from 'react';
import NodeCard from './NodeCard';
import Analytics from './components/Analytics';
import { ImsNode } from './types';
import useWebSocket from './hooks/useWebSocket';
import ThemeToggle from './components/ThemeToggle';

const Dashboard: React.FC = () => {
  const { nodes, isConnected, systemMetrics, timeRange, setTimeRange } = useWebSocket();
  const [sortedNodes, setSortedNodes] = useState<ImsNode[]>([]);

  useEffect(() => {
    setSortedNodes([...nodes].sort((a, b) => a.name.localeCompare(b.name)));
  }, [nodes]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CloudNet Monitor</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`text-sm ${
                  isConnected 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {isConnected ? 'Connected to server' : 'Disconnected'}
                </span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Analytics Section */}
          <Analytics
            systemMetrics={systemMetrics}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          {/* Nodes Grid */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Nodes Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedNodes.map((node) => (
                <NodeCard key={node.ip} {...node} />
              ))}
            </div>
            {sortedNodes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No nodes available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
