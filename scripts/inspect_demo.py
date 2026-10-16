import gzip
import xml.etree.ElementTree as ET

path = r'C:\ProgramData\Ableton\Live 12 Trial\Resources\Core Library\Lessons\Demo Songs\Chuck Sutton - Patience (Live 12 Suite Demo).als'

with gzip.open(path, 'rb') as f:
    xml_data = f.read()

root = ET.fromstring(xml_data)
live_set = root.find('LiveSet')
tracks = live_set.find('Tracks')

print(f"Total Tracks in Demo: {len(list(tracks))}")
for idx, t in enumerate(tracks):
    eff_name = t.find('Name/EffectiveName')
    name = eff_name.attrib.get('Value', '') if eff_name is not None else 'Unnamed'
    
    # Check instruments & devices
    dev_tags = []
    for d in t.iter('Devices'):
        for child in list(d):
            dev_tags.append(child.tag)
    
    # Check clips
    clips = []
    for c in t.iter('MidiClip'):
        cname = c.find('Name')
        if cname is not None and 'Value' in cname.attrib:
            clips.append(cname.attrib['Value'])
        else:
            clips.append('Clip')
    for c in t.iter('AudioClip'):
        cname = c.find('Name')
        if cname is not None and 'Value' in cname.attrib:
            clips.append(cname.attrib['Value'])
        else:
            clips.append('AudioClip')
            
    print(f"Track {idx+1} [{t.tag}]: '{name}' | Devices: {dev_tags[:4]} | Clips: {len(clips)}")
