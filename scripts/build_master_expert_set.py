import gzip
import xml.etree.ElementTree as ET
import copy
import os

DEMO_PATH = r'C:\ProgramData\Ableton\Live 12 Trial\Resources\Core Library\Lessons\Demo Songs\Chuck Sutton - Patience (Live 12 Suite Demo).als'
OUTPUT_PATH = r'C:\Users\eagle\antigravity\Aegentix-Super-Agent-Wallet\OmniCyberDAW_Master_Expert_Suite.als'

print(">>> [AEGENTIX] Building Masterpiece Ableton Live 12 Project Suite...")

with gzip.open(DEMO_PATH, 'rb') as f:
    xml_data = f.read()

root = ET.fromstring(xml_data)
live_set = root.find('LiveSet')
tracks_elem = live_set.find('Tracks')
all_tracks = list(tracks_elem)

print(f"Source demo contains {len(all_tracks)} tracks.")

# We want 6 Master Agent Tracks + 2 Return Tracks
# 1. Sub Bass (Track 7 in demo: 'Sub Sub Bass' - Operator + Eq8 + MultibandDynamics)
# 2. Drums (Track 3 in demo: 'Drums' - DrumGroupDevice + StereoGain)
# 3. Acid Lead (Track 4 in demo: 'The Beat Of History' - InstrumentMeld + Roar)
# 4. Granular Pad (Track 5 in demo: 'Mello' - Drift + GrainDelay + Delay)
# 5. Dual Saw Lead (Track 1 in demo: 'Coffee Leaf' - Drift + StereoGain)
# 6. Metallic Perc / FM (Track 6 in demo: 'Rose Bass' / FM)
# Return Tracks: Track 16 (A-Reverb), Track 17 (B-Delay)

selected_indices = [6, 2, 3, 4, 0, 5, 15, 16]
track_names = [
    "Sentinel Sub-Bass [Operator + OTT]",
    "Aegis Drum Core [Drum Rack]",
    "Nexus Acid Matrix [Meld + Roar]",
    "Chronos Granular Pad [Drift + GrainDelay]",
    "Valkyrie Dual-Saw Lead [Drift + StereoGain]",
    "Cipher Metallic FM [FM Modulator]",
    "A-Reverb [Hybrid Space]",
    "B-Delay [Dotted 8th]"
]

new_tracks_list = []
for idx, s_idx in enumerate(selected_indices):
    track_clone = copy.deepcopy(all_tracks[s_idx])
    
    # Rename track
    eff_name = track_clone.find('Name/EffectiveName')
    if eff_name is not None:
        eff_name.attrib['Value'] = track_names[idx]
    user_name = track_clone.find('Name/UserName')
    if user_name is not None:
        user_name.attrib['Value'] = track_names[idx]
        
    new_tracks_list.append(track_clone)

# Clear existing tracks and replace with our 6 Master Agent tracks + 2 Returns
tracks_elem.clear()
for t in new_tracks_list:
    tracks_elem.append(t)

# Update Transport BPM to 132.00
transport = live_set.find('Transport')
if transport is not None:
    for tempo_elem in transport.iter('Tempo'):
        if 'Value' in tempo_elem.attrib:
            tempo_elem.attrib['Value'] = '132'
        manual = tempo_elem.find('Manual')
        if manual is not None and 'Value' in manual.attrib:
            manual.attrib['Value'] = '132'

print(f"Configured {len(new_tracks_list)} Master Tracks with native Live 12 DSP!")

# Write out the compressed ALS
new_xml_bytes = ET.tostring(root, encoding='utf-8', xml_declaration=True)
with gzip.open(OUTPUT_PATH, 'wb', compresslevel=9) as f:
    f.write(new_xml_bytes)

als_size = os.path.getsize(OUTPUT_PATH)
print(f"[SUCCESS] Masterpiece Set successfully created at: {OUTPUT_PATH} ({als_size / 1024:.1f} KB)")
