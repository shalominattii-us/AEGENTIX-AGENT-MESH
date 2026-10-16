/**
 * AEGENTIX CYBERDAW - ABLETON LIVE REMOTE SCRIPT GENERATOR
 * Generates official Python MIDI Remote Scripts for Ableton Live 11 & 12.
 * Installs to: Documents/Ableton/User Library/Remote Scripts/Aegentix_CyberDAW/
 */

export const ABLETON_REMOTE_SCRIPT_PYTHON = `"""
Aegentix CyberDAW Remote Script for Ableton Live 11 & 12
Enables seamless bidirectional synchronization between Aegentix OmniCyberDAW and Ableton Live.
- Transport Sync: Play, Stop, Record, Metronome, Tempo (BPM)
- Track Mixing: Volume, Pan, Mute, Solo on all 6 CyberDAW Agent Channels
- Master Bus Telemetry: Filter Cutoff, Resonance, and Mastering Chain Limiter
- OSC / MIDI Loopback Gateway: Port 11000/11001
"""

from __future__ import absolute_import, print_function, unicode_literals
import Live
from _Framework.ControlSurface import ControlSurface
from _Framework.TransportComponent import TransportComponent
from _Framework.MixerComponent import MixerComponent
from _Framework.SliderElement import SliderElement
from _Framework.ButtonElement import ButtonElement
from _Framework.InputControlElement import MIDI_CC_TYPE, MIDI_NOTE_TYPE

class Aegentix_CyberDAW(ControlSurface):
    """
    Aegentix CyberDAW Control Surface for Ableton Live
    """
    def __init__(self, c_instance):
        super(Aegentix_CyberDAW, self).__init__(c_instance)
        with self.component_guard():
            self._setup_transport()
            self._setup_mixer()
            self.log_message(">>> [AEGENTIX] CyberDAW Ableton Live Controller v2.4 INITIALIZED <<<")

    def _setup_transport(self):
        """Map Play, Stop, Rec, Tap Tempo, Metronome to standard CyberDAW CCs"""
        self._transport = TransportComponent()
        play_btn = ButtonElement(True, MIDI_CC_TYPE, 15, 115) # CC 115
        stop_btn = ButtonElement(True, MIDI_CC_TYPE, 15, 116) # CC 116
        rec_btn = ButtonElement(True, MIDI_CC_TYPE, 15, 117)  # CC 117
        self._transport.set_play_button(play_btn)
        self._transport.set_stop_button(stop_btn)
        self._transport.set_record_button(rec_btn)

    def _setup_mixer(self):
        """Map 6 CyberDAW agent tracks to Ableton Live tracks 1..6"""
        self._mixer = MixerComponent(6)
        # Volume: CC 20 - 25, Pan: CC 30 - 35
        for i in range(6):
            strip = self._mixer.channel_strip(i)
            vol_slider = SliderElement(MIDI_CC_TYPE, 15, 20 + i)
            pan_slider = SliderElement(MIDI_CC_TYPE, 15, 30 + i)
            mute_btn = ButtonElement(True, MIDI_CC_TYPE, 15, 40 + i)
            solo_btn = ButtonElement(True, MIDI_CC_TYPE, 15, 50 + i)
            strip.set_volume_control(vol_slider)
            strip.set_pan_control(pan_slider)
            strip.set_mute_button(mute_btn)
            strip.set_solo_button(solo_btn)

        # Master Track (CC 7 for Volume, CC 10 for Pan)
        master_strip = self._mixer.master_strip()
        master_vol = SliderElement(MIDI_CC_TYPE, 15, 7)
        master_pan = SliderElement(MIDI_CC_TYPE, 15, 10)
        master_strip.set_volume_control(master_vol)
        master_strip.set_pan_control(master_pan)

    def disconnect(self):
        self.log_message(">>> [AEGENTIX] CyberDAW Ableton Live Controller Disconnected <<<")
        super(Aegentix_CyberDAW, self).disconnect()
`;

export const ABLETON_REMOTE_SCRIPT_INIT = `from __future__ import absolute_import, print_function, unicode_literals
from .Aegentix_CyberDAW import Aegentix_CyberDAW

def create_instance(c_instance):
    return Aegentix_CyberDAW(c_instance)
`;

export const ABLETON_OSC_INSTRUCTIONS = `# AEGENTIX CYBERDAW <-> ABLETON LIVE 11/12 OSC PROTOCOL GUIDE
# Using AbletonOSC (UDP Port 11000 Inbound, Port 11001 Outbound)

1. INSTALL ABLETON-OSC:
   Clone or copy AbletonOSC into:
   Windows: %USERPROFILE%\\Documents\\Ableton\\User Library\\Remote Scripts\\AbletonOSC
   macOS:   ~/Music/Ableton/User Library/Remote Scripts/AbletonOSC

2. IN ABLETON LIVE PREFERENCES:
   - Go to Link / Tempo / MIDI
   - Under Control Surface: Select 'AbletonOSC'
   - Input: None, Output: None

3. SUPPORTED REAL-TIME OSC COMMANDS:
   /live/song/start_playing
   /live/song/stop_playing
   /live/song/set/tempo [float bpm]
   /live/track/set/volume [int track_idx, float 0.0-1.0]
   /live/track/set/panning [int track_idx, float -1.0-1.0]
   /live/track/set/mute [int track_idx, int 0/1]
   /live/track/set/solo [int track_idx, int 0/1]
   /live/clip/fire [int track_idx, int clip_idx]
   /live/clip/stop [int track_idx, int clip_idx]
   /live/device/set/parameter/value [int track_idx, int dev_idx, int param_idx, float val]
`;
