import os
import time
import random
import json
import requests
from datetime import datetime

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3001')
NUM_NODES = int(os.getenv('NUM_NODES', '4'))
UPDATE_INTERVAL = int(os.getenv('UPDATE_INTERVAL', '1000')) / 1000  # Convert to seconds

class NodeSimulator:
    def __init__(self, node_id):
        self.node_id = node_id
        self.name = f"Node {node_id}"
        self.ip = f"192.168.1.{10 + node_id}"
        self.status = "online"
        
    def generate_metrics(self):
        return {
            'id': self.node_id,
            'name': self.name,
            'ip': self.ip,
            'status': self.status,
            'load': {
                'cpu': random.randint(10, 90),
                'memory': random.randint(20, 85),
                'network': random.randint(15, 75)
            },
            'timestamp': datetime.now().isoformat()
        }

def main():
    print(f"Starting node simulator with {NUM_NODES} nodes")
    nodes = [NodeSimulator(i) for i in range(1, NUM_NODES + 1)]
    
    while True:
        try:
            for node in nodes:
                metrics = node.generate_metrics()
                response = requests.post(f"{BACKEND_URL}/api/nodes/metrics", 
                                      json=metrics)
                if response.status_code != 200:
                    print(f"Failed to send metrics for {node.name}: {response.status_code}")
                else:
                    print(f"Sent metrics for {node.name}")
            
            time.sleep(UPDATE_INTERVAL)
            
        except Exception as e:
            print(f"Error occurred: {str(e)}")
            time.sleep(5)  # Wait before retrying

if __name__ == "__main__":
    main() 