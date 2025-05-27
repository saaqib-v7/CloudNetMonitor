import random
from datetime import datetime, timedelta

def generate_metric_data(num_points=60):
    now = datetime.now()
    metrics = []
    
    for i in range(num_points):
        timestamp = (now - timedelta(seconds=num_points - i)).isoformat()
        metric = {
            'totalNodes': 4,
            'onlineNodes': 3,
            'averageCpu': 30 + random.random() * 20,
            'averageMemory': 40 + random.random() * 30,
            'averageNetwork': 25 + random.random() * 15,
            'timestamp': timestamp
        }
        metrics.append(metric)
    
    return metrics

def generate_node_data(num_nodes=4):
    nodes = []
    for i in range(num_nodes):
        node = {
            'id': f'node-{i+1}',
            'name': f'Node {i+1}',
            'ip': f'192.168.1.{i+10}',
            'status': 'online' if random.random() > 0.2 else 'offline',
            'load': {
                'cpu': random.randint(10, 90),
                'memory': random.randint(20, 85),
                'network': random.randint(15, 75)
            }
        }
        nodes.append(node)
    
    return nodes

if __name__ == '__main__':
    print("Sample Metric Data:")
    print(generate_metric_data(5))
    print("\nSample Node Data:")
    print(generate_node_data(2)) 