#!/bin/bash

# Network Node Simulator
# This script creates Docker containers that simulate network nodes with varying conditions

# Default values
NUM_NODES=4
NETWORK_DELAY="50ms"
PACKET_LOSS="0.1%"
BASE_PORT=5060

# Create Docker network if it doesn't exist
docker network create --subnet=172.18.0.0/16 netmon-network 2>/dev/null

# Function to start a node
start_node() {
    local NODE_ID=$1
    local PORT=$((BASE_PORT + NODE_ID))
    local IP="172.18.0.$((10 + NODE_ID))"
    
    # Create container with network conditions
    docker run -d \
        --name "netmon-node-$NODE_ID" \
        --network netmon-network \
        --ip "$IP" \
        --cap-add=NET_ADMIN \
        alpine:latest /bin/sh -c "
            apk add --no-cache iproute2 tcpdump netcat-openbsd
            tc qdisc add dev eth0 root netem delay $NETWORK_DELAY loss $PACKET_LOSS
            while true; do
                echo \"Node $NODE_ID heartbeat - \$(date)\" | nc -u -w1 172.18.0.2 $PORT
                sleep 5
            done
        "
    
    echo "Started node $NODE_ID with IP $IP"
}

# Function to monitor traffic
monitor_traffic() {
    docker run -d \
        --name netmon-monitor \
        --network netmon-network \
        --ip 172.18.0.2 \
        alpine:latest /bin/sh -c "
            apk add --no-cache tcpdump netcat-openbsd
            echo 'Starting traffic monitoring...'
            while true; do
                nc -ul -p $BASE_PORT | while read line; do
                    echo \"\$(date): \$line\"
                done
            done
        "
}

# Cleanup function
cleanup() {
    echo "Cleaning up containers..."
    docker rm -f netmon-monitor 2>/dev/null
    for i in $(seq 1 $NUM_NODES); do
        docker rm -f "netmon-node-$i" 2>/dev/null
    done
    docker network rm netmon-network 2>/dev/null
}

# Handle script termination
trap cleanup EXIT

# Start monitor
echo "Starting network monitor..."
monitor_traffic

# Start nodes
echo "Starting $NUM_NODES network nodes..."
for i in $(seq 1 $NUM_NODES); do
    start_node $i
done

# Show logs
echo "Monitoring network traffic (Ctrl+C to stop)..."
docker logs -f netmon-monitor 