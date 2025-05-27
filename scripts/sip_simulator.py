#!/usr/bin/env python3

import socket
import time
import random
import threading
from datetime import datetime

# SIP message templates
SIP_REGISTER = """REGISTER sip:service.com SIP/2.0
Via: SIP/2.0/UDP {client_ip}:{client_port}
From: <sip:{client_id}@service.com>
To: <sip:{client_id}@service.com>
Call-ID: {call_id}@{client_ip}
CSeq: {cseq} REGISTER
Contact: <sip:{client_id}@{client_ip}:{client_port}>
Max-Forwards: 70
User-Agent: CloudNetMonitor-SIPClient/1.0
Content-Length: 0

"""

SIP_INVITE = """INVITE sip:{callee}@service.com SIP/2.0
Via: SIP/2.0/UDP {client_ip}:{client_port}
From: <sip:{caller}@service.com>
To: <sip:{callee}@service.com>
Call-ID: {call_id}@{client_ip}
CSeq: {cseq} INVITE
Contact: <sip:{caller}@{client_ip}:{client_port}>
Content-Type: application/sdp
Max-Forwards: 70
User-Agent: CloudNetMonitor-SIPClient/1.0
Content-Length: 0

"""

class SIPClient:
    def __init__(self, client_id, local_ip="0.0.0.0", local_port=0):
        self.client_id = client_id
        self.local_ip = local_ip
        self.local_port = local_port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind((local_ip, local_port))
        self.cseq = 1
        
    def register(self):
        call_id = f"{random.randint(1000, 9999)}"
        msg = SIP_REGISTER.format(
            client_ip=self.local_ip,
            client_port=self.local_port,
            client_id=self.client_id,
            call_id=call_id,
            cseq=self.cseq
        )
        self.cseq += 1
        return msg
        
    def invite(self, callee):
        call_id = f"{random.randint(1000, 9999)}"
        msg = SIP_INVITE.format(
            client_ip=self.local_ip,
            client_port=self.local_port,
            caller=self.client_id,
            callee=callee,
            call_id=call_id,
            cseq=self.cseq
        )
        self.cseq += 1
        return msg

def simulate_client(client_id, server_addr):
    client = SIPClient(client_id)
    print(f"Started client {client_id}")
    
    while True:
        try:
            # Register periodically
            register_msg = client.register()
            client.sock.sendto(register_msg.encode(), server_addr)
            print(f"[{datetime.now()}] Client {client_id} sent REGISTER")
            
            # Random calls
            if random.random() < 0.3:  # 30% chance to make a call
                callee = f"user{random.randint(1000, 9999)}"
                invite_msg = client.invite(callee)
                client.sock.sendto(invite_msg.encode(), server_addr)
                print(f"[{datetime.now()}] Client {client_id} sent INVITE to {callee}")
            
            time.sleep(random.uniform(5, 15))
            
        except Exception as e:
            print(f"Error in client {client_id}: {e}")
            time.sleep(5)

def main():
    SERVER_IP = "127.0.0.1"
    SERVER_PORT = 5060
    NUM_CLIENTS = 5
    
    print("Starting SIP traffic simulator...")
    server_addr = (SERVER_IP, SERVER_PORT)
    
    # Start multiple clients
    threads = []
    for i in range(NUM_CLIENTS):
        client_id = f"client{i+1}"
        thread = threading.Thread(
            target=simulate_client,
            args=(client_id, server_addr),
            daemon=True
        )
        threads.append(thread)
        thread.start()
        time.sleep(1)  # Stagger client starts
    
    try:
        # Keep main thread running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")

if __name__ == "__main__":
    main() 