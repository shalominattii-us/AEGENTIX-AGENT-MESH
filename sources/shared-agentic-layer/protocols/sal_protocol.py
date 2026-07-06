import json, hashlib, base64
from datetime import datetime
class MessageEnvelope:
    def __init__(self, sender, recipient, msg_type, payload):
        self.version = '1.0'
        self.from_addr = sender
        self.to_addr = recipient
        self.type = msg_type
        self.payload = payload
        self.timestamp = datetime.utcnow().isoformat()
        self.signature = None
    def to_dict(self):
        return {'version': self.version, 'from': self.from_addr, 'to': self.to_addr, 'type': self.type, 'payload': self.payload, 'timestamp': self.timestamp, 'sig': self.signature}
    def sign(self, key):
        msg = json.dumps(self.to_dict(), sort_keys=True).encode()
        self.signature = base64.b64encode(hashlib.sha256(msg + key).digest()).decode()
class AgentBus:
    def __init__(self, agent_id):
        self.agent_id = agent_id
        self.subscribers = {}
    def subscribe(self, topic, cb):
        self.subscribers.setdefault(topic, []).append(cb)
    def publish(self, topic, payload):
        for cb in self.subscribers.get(topic, []):
            cb({'topic': topic, 'payload': payload})
