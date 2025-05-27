#!/usr/bin/env python3

import socket
import time
import random
import threading
import uuid
from datetime import datetime

# SDP Template
SDP_TEMPLATE = """v=0
o={client_id} {session_id} {session_version} IN IP4 {client_ip}
s=VoLTE Call
c=IN IP4 {client_ip}
t=0 0
m=audio {rtp_port} RTP/AVP 96 97
a=rtpmap:96 AMR-WB/16000
a=rtpmap:97 AMR/8000
a=fmtp:96 mode-change-capability=2
a=fmtp:97 mode-change-capability=2
a=ptime:20
a=maxptime:240
a=sendrecv"""

# SIP Templates with VoLTE specifics
SIP_REGISTER = """REGISTER sip:{domain} SIP/2.0
Via: SIP/2.0/UDP {client_ip}:{client_port};branch=z9hG4bK{branch}
From: <sip:{client_id}@{domain}>;tag={from_tag}
To: <sip:{client_id}@{domain}>
Call-ID: {call_id}
CSeq: {cseq} REGISTER
Contact: <sip:{client_id}@{client_ip}:{client_port}>
Authorization: Digest username="{client_id}",realm="{domain}",nonce="",uri="sip:{domain}",response=""
Supported: path,gruu
User-Agent: CloudNetMonitor-VoLTEClient/1.0
Allow: INVITE,ACK,OPTIONS,BYE,CANCEL,UPDATE,INFO,SUBSCRIBE,NOTIFY,REFER,MESSAGE
Content-Length: 0

"""

SIP_INVITE = """INVITE sip:{callee}@{domain} SIP/2.0
Via: SIP/2.0/UDP {client_ip}:{client_port};branch=z9hG4bK{branch}
From: <sip:{caller}@{domain}>;tag={from_tag}
To: <sip:{callee}@{domain}>
Call-ID: {call_id}
CSeq: {cseq} INVITE
Contact: <sip:{caller}@{client_ip}:{client_port}>
Authorization: Digest username="{caller}",realm="{domain}",nonce="",uri="sip:{domain}",response=""
Supported: 100rel,precondition,timer,replaces
Session-Expires: 1800;refresher=uac
Min-SE: 90
Allow: INVITE,ACK,OPTIONS,BYE,CANCEL,UPDATE,INFO,SUBSCRIBE,NOTIFY,REFER,MESSAGE
Content-Type: application/sdp
Max-Forwards: 70
User-Agent: CloudNetMonitor-VoLTEClient/1.0
P-Preferred-Service: urn:urn-7:3gpp-service.ims.icsi.mmtel
Accept-Contact: *;+g.3gpp.icsi-ref="urn%3Aurn-7%3A3gpp-service.ims.icsi.mmtel"
P-Early-Media: supported
Content-Length: {content_length}

{sdp_content}"""

class VoLTEClient:
    def __init__(self, client_id, domain="ims.mnc001.mcc001.3gppnetwork.org", local_ip="0.0.0.0", local_port=0):
        self.client_id = client_id
        self.domain = domain
        self.local_ip = local_ip
        self.local_port = local_port
        self.rtp_port = random.randint(10000, 20000)
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind((local_ip, local_port))
        self.cseq = 1
        
    def _generate_sdp(self):
        return SDP_TEMPLATE.format(
            client_id=self.client_id,
            session_id=int(time.time()),
            session_version=int(time.time()),
            client_ip=self.local_ip,
            rtp_port=self.rtp_port
        )
        
    def register(self):
        branch = str(uuid.uuid4())[:8]
        from_tag = str(uuid.uuid4())[:8]
        call_id = str(uuid.uuid4())
        
        msg = SIP_REGISTER.format(
            domain=self.domain,
            client_ip=self.local_ip,
            client_port=self.local_port,
            client_id=self.client_id,
            branch=branch,
            from_tag=from_tag,
            call_id=call_id,
            cseq=self.cseq
        )
        self.cseq += 1
        return msg
        
    def invite(self, callee):
        branch = str(uuid.uuid4())[:8]
        from_tag = str(uuid.uuid4())[:8]
        call_id = str(uuid.uuid4())
        sdp_content = self._generate_sdp()
        
        msg = SIP_INVITE.format(
            domain=self.domain,
            client_ip=self.local_ip,
            client_port=self.local_port,
            caller=self.client_id,
            callee=callee,
            branch=branch,
            from_tag=from_tag,
            call_id=call_id,
            cseq=self.cseq,
            content_length=len(sdp_content),
            sdp_content=sdp_content
        )
        self.cseq += 1
        return msg

class RTPSimulator:
    def __init__(self, local_ip, local_port):
        self.local_ip = local_ip
        self.local_port = local_port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind((local_ip, local_port))
        
    def start_stream(self, remote_ip, remote_port):
        """Simulate RTP media stream"""
        while True:
            # Send dummy RTP packets (just for simulation)
            packet = b'\x80\x60' + random.randbytes(158)  # 160-byte AMR-WB frame
            self.sock.sendto(packet, (remote_ip, remote_port))
            time.sleep(0.02)  # 20ms ptime

def simulate_client(client_id, server_addr):
    client = VoLTEClient(client_id)
    rtp = RTPSimulator(client.local_ip, client.rtp_port)
    print(f"Started VoLTE client {client_id}")
    
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
                
                # Simulate RTP stream for a few seconds
                rtp_thread = threading.Thread(
                    target=rtp.start_stream,
                    args=(server_addr[0], client.rtp_port + 1),
                    daemon=True
                )
                rtp_thread.start()
                time.sleep(random.uniform(10, 30))  # Call duration
            
            time.sleep(random.uniform(5, 15))
            
        except Exception as e:
            print(f"Error in client {client_id}: {e}")
            time.sleep(5)

def main():
    SERVER_IP = "127.0.0.1"
    SERVER_PORT = 5060
    NUM_CLIENTS = 5
    
    print("Starting VoLTE traffic simulator...")
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