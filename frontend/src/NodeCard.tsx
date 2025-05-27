import React, { useState } from 'react';
import { ImsNode } from './types';
import NodeModal from './components/NodeModal';

const NodeCard: React.FC<ImsNode> = (node) => {
  const [showModal, setShowModal] = useState(false);
  const { name, status, type, ip, load, lastUpdated } = node;

  return (
    <>
      <div 
        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer dark:shadow-gray-900"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{type} node - {ip}</p>
          </div>
          <div className={`h-3 w-3 rounded-full ${
            status === 'online' 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`} />
        </div>

        <div className="space-y-3">
          <p className={`text-sm font-medium ${
            status === 'online' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            Status: {status.charAt(0).toUpperCase() + status.slice(1)}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">CPU</span>
              <div className="flex-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    load.cpu > 90 ? 'bg-red-500' :
                    load.cpu > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${load.cpu}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-right">{Math.round(load.cpu)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Memory</span>
              <div className="flex-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    load.memory > 90 ? 'bg-red-500' :
                    load.memory > 70 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${load.memory}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-right">{Math.round(load.memory)}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Network</span>
              <div className="flex-1 mx-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    load.network > 90 ? 'bg-red-500' :
                    load.network > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${load.network}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 w-12 text-right">{Math.round(load.network)}%</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {showModal && (
        <NodeModal 
          node={node} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

export default NodeCard;
