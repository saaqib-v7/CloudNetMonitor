import React from 'react';
import { ImsNode } from '../types';

interface NodeModalProps {
  node: ImsNode;
  onClose: () => void;
}

const NodeModal: React.FC<NodeModalProps> = ({ node, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-[600px] mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className={`h-4 w-4 rounded-full ${
              node.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{node.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{node.type} node · {node.ip}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Resource Usage */}
          <div className="col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Resource Usage</h3>
            <div className="space-y-4">
              {/* CPU Usage */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">CPU</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{Math.round(node.load.cpu)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      node.load.cpu > 90 ? 'bg-red-500' :
                      node.load.cpu > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${node.load.cpu}%` }}
                  />
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Memory</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{Math.round(node.load.memory)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      node.load.memory > 90 ? 'bg-red-500' :
                      node.load.memory > 70 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${node.load.memory}%` }}
                  />
                </div>
              </div>

              {/* Network Usage */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Network</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{Math.round(node.load.network)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      node.load.network > 90 ? 'bg-red-500' :
                      node.load.network > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${node.load.network}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Status Info</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className={`text-sm font-medium ${
                  node.status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {new Date(node.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Node Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Node Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">IP Address</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{node.ip}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{node.type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeModal; 