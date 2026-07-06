import json, urllib.request, os, sys, time
from datetime import datetime, timezone

OLLAMA_URL = "http://localhost:11434/api/generate"
NODES = {
    'RECON': {'model': 'llama3.2:3b', 'role': 'system_scanner'},
    'INFIL': {'model': 'llama3.2:3b', 'role': 'threat_analyzer'},
    'EXFIL': {'model': 'llama3.2:3b', 'role': 'data_extractor'},
    'DEFEND': {'model': 'llama3.2:3b', 'role': 'security_guard'},
    'OFFEND': {'model': 'llama3.2:3b', 'role': 'countermeasure'},
    'INTEL': {'model': 'llama3.2:3b', 'role': 'strategist'},
    'MEDIC': {'model': 'llama3.2:3b', 'role': 'healer'},
    'GHOST': {'model': 'llama3.2:3b', 'role': 'stealth_ops'}
}

def ollama_infer(model, prompt, timeout=30):
    try:
        data = json.dumps({'model': model, 'prompt': prompt, 'stream': False}).encode()
        req = urllib.request.Request(OLLAMA_URL, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read())['response']
    except Exception as e:
        return f"[FAIL] {str(e)}"

def node_think(node_id, context):
    prompt = f"[NODE {node_id}] {context}. ONE directive. No filler."
    return ollama_infer('llama3.2:3b', prompt)

def system_scan():
    return {
        'time': datetime.now(timezone.utc).isoformat(),
        'cpu': os.cpu_count(),
        'cwd': os.getcwd(),
        'node': 'AEG-576414'
    }

def swarm_execute(mission):
    print(f"\n[Ω] SWARM: {mission}")
    state = system_scan()
    for node_id in ['RECON', 'INTEL', 'DEFEND', 'MEDIC', 'GHOST']:
        print(f"[Ω] {node_id} thinking...")
        r = node_think(node_id, f"Mission: {mission}. System: {json.dumps(state)}")
        print(f"[ΩΩ] {node_id}: {r[:120]}")
        time.sleep(0.3)
    print("[ΩΩΩ] SWARM COMPLETE")

if __name__ == '__main__':
    mission = ' '.join(sys.argv[1:]) if len(sys.argv) > 1 else 'Perimeter scan'
    swarm_execute(mission)
