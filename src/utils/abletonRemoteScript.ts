/**
 * AEGENTIX CYBERDAW - ABLETON LIVE REMOTE SCRIPT & LIVE API BRIDGE
 * Enables complete, real-time programmatic control of Ableton Live 11 & 12.
 */

export const ABLETON_EXE_PATH = 'C:\\ProgramData\\Ableton\\Live 12 Trial\\Program\\Ableton Live 12 Trial.exe';

export const ABLETON_REMOTE_SCRIPT_PYTHON = `"""
Aegentix CyberDAW Full-Scale Ableton Live 11 & 12 Controller & JSON-RPC Live API Bridge
Enables complete programmatic control of Ableton Live from CyberDAW / Aegentix AI Agent:
- Real-time Transport (Play, Stop, Record, Loop, Scrub, Tempo/BPM)
- Multi-track Architecture (Add/Delete Audio & MIDI Tracks, Volume, Pan, Mute, Solo, Arm)
- Clip & Generative MIDI Sequencer (Create clips, inject algorithmic notes, fire/stop clips)
- Device & Parameter Automation (Inspect instruments/effects, modulate parameters)
- Scene Launching & Arrangement Control
- Bidirectional TCP Socket Server on localhost:11000
"""

from __future__ import absolute_import, print_function, unicode_literals
import sys
import socket
import threading
import json
import queue
import traceback

try:
    import Live
    from _Framework.ControlSurface import ControlSurface
    from _Framework.TransportComponent import TransportComponent
    from _Framework.MixerComponent import MixerComponent
    from _Framework.SliderElement import SliderElement
    from _Framework.ButtonElement import ButtonElement
    from _Framework.InputControlElement import MIDI_CC_TYPE
    LIVE_AVAILABLE = True
except ImportError:
    LIVE_AVAILABLE = False
    class ControlSurface(object):
        def __init__(self, c_instance=None):
            self._c_instance = c_instance
        def log_message(self, msg):
            print(msg)
        def schedule_message(self, delay, callback, *args):
            pass
        def disconnect(self):
            pass

HOST = '127.0.0.1'
PORT = 11000

class Aegentix_CyberDAW(ControlSurface):
    def __init__(self, c_instance=None):
        super(Aegentix_CyberDAW, self).__init__(c_instance)
        self._running = True
        self._cmd_queue = queue.Queue()
        self._server_sock = None
        self._server_thread = None

        self.log_message(">>> [AEGENTIX] CyberDAW Full Live Bridge Initializing... <<<")

        if LIVE_AVAILABLE:
            try:
                self._setup_midi_surface()
            except Exception as e:
                self.log_message("[AEGENTIX] MIDI Surface Setup Error: %s" % str(e))

        self._start_socket_server()

        if LIVE_AVAILABLE:
            self.schedule_message(1, self._tick)

        self.log_message(">>> [AEGENTIX] CyberDAW Full Live Bridge ACTIVE on %s:%d <<<" % (HOST, PORT))

    def _setup_midi_surface(self):
        self._transport = TransportComponent()
        play_btn = ButtonElement(True, MIDI_CC_TYPE, 15, 115)
        stop_btn = ButtonElement(True, MIDI_CC_TYPE, 15, 116)
        rec_btn = ButtonElement(True, MIDI_CC_TYPE, 15, 117)
        self._transport.set_play_button(play_btn)
        self._transport.set_stop_button(stop_btn)
        self._transport.set_record_button(rec_btn)

        self._mixer = MixerComponent(6)
        for i in range(6):
            strip = self._mixer.channel_strip(i)
            strip.set_volume_control(SliderElement(MIDI_CC_TYPE, 15, 20 + i))
            strip.set_pan_control(SliderElement(MIDI_CC_TYPE, 15, 30 + i))
            strip.set_mute_button(ButtonElement(True, MIDI_CC_TYPE, 15, 40 + i))
            strip.set_solo_button(ButtonElement(True, MIDI_CC_TYPE, 15, 50 + i))

        master_strip = self._mixer.master_strip()
        master_strip.set_volume_control(SliderElement(MIDI_CC_TYPE, 15, 7))
        master_strip.set_pan_control(SliderElement(MIDI_CC_TYPE, 15, 10))

    def _start_socket_server(self):
        try:
            self._server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self._server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self._server_sock.bind((HOST, PORT))
            self._server_sock.listen(5)
            self._server_sock.settimeout(1.0)

            self._server_thread = threading.Thread(target=self._server_accept_loop)
            self._server_thread.daemon = True
            self._server_thread.start()
        except Exception as e:
            self.log_message("[AEGENTIX] Failed to bind socket on port %d: %s" % (PORT, str(e)))

    def _server_accept_loop(self):
        while self._running:
            try:
                client_sock, addr = self._server_sock.accept()
                client_thread = threading.Thread(target=self._client_handler, args=(client_sock,))
                client_thread.daemon = True
                client_thread.start()
            except socket.timeout:
                continue
            except Exception as e:
                if self._running:
                    self.log_message("[AEGENTIX] Accept loop error: %s" % str(e))
                break

    def _client_handler(self, client_sock):
        buffer = ""
        client_sock.settimeout(0.5)
        while self._running:
            try:
                data = client_sock.recv(4096)
                if not data:
                    break
                buffer += data.decode('utf-8', errors='ignore')
                while '\\n' in buffer:
                    line, buffer = buffer.split('\\n', 1)
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        req = json.loads(line)
                        resp_event = threading.Event()
                        resp_holder = {}
                        self._cmd_queue.put((req, resp_event, resp_holder))
                        
                        if resp_event.wait(3.0):
                            resp_json = json.dumps(resp_holder.get('response', {})) + '\\n'
                            client_sock.sendall(resp_json.encode('utf-8'))
                        else:
                            timeout_resp = json.dumps({
                                "id": req.get("id"),
                                "error": "Execution timed out on Live main thread",
                            }) + '\\n'
                            client_sock.sendall(timeout_resp.encode('utf-8'))
                    except Exception as json_err:
                        err_resp = json.dumps({"error": "Invalid JSON: " + str(json_err)}) + '\\n'
                        client_sock.sendall(err_resp.encode('utf-8'))
            except socket.timeout:
                continue
            except Exception:
                break
        try:
            client_sock.close()
        except Exception:
            pass

    def _tick(self):
        self._drain_queue()
        if self._running and LIVE_AVAILABLE:
            self.schedule_message(1, self._tick)

    def _drain_queue(self):
        while not self._cmd_queue.empty():
            try:
                req, event, holder = self._cmd_queue.get_nowait()
                result = self._dispatch_command(req)
                holder['response'] = {
                    "id": req.get("id"),
                    "result": result,
                    "error": None
                }
                event.set()
            except queue.Empty:
                break
            except Exception as e:
                holder['response'] = {
                    "id": req.get("id") if 'req' in locals() else None,
                    "result": None,
                    "error": str(e)
                }
                if 'event' in locals():
                    event.set()

    def _dispatch_command(self, req):
        method = req.get("method", "")
        params = req.get("params", {}) or {}

        if not LIVE_AVAILABLE:
            return {"mock": True, "method": method, "params": params}

        song = self.song()

        if method == "song.get_state":
            tracks_info = []
            for idx, t in enumerate(song.tracks):
                tracks_info.append({
                    "index": idx,
                    "name": t.name,
                    "color": t.color,
                    "is_audio": not t.has_midi_input,
                    "is_midi": t.has_midi_input,
                    "mute": t.mute,
                    "solo": t.solo,
                    "arm": getattr(t, 'arm', False),
                    "volume": round(t.mixer_device.volume.value, 3),
                    "pan": round(t.mixer_device.panning.value, 3),
                    "clips_count": len(t.clip_slots),
                    "devices": [d.name for d in t.devices]
                })

            return {
                "tempo": round(song.tempo, 2),
                "is_playing": song.is_playing,
                "is_recording": song.record_mode,
                "current_song_time": round(song.current_song_time, 3),
                "loop": song.loop,
                "loop_start": round(song.loop_start, 2),
                "loop_length": round(song.loop_length, 2),
                "signature_numerator": song.signature_numerator,
                "signature_denominator": song.signature_denominator,
                "master_volume": round(song.master_track.mixer_device.volume.value, 3),
                "master_pan": round(song.master_track.mixer_device.panning.value, 3),
                "tracks": tracks_info,
                "scenes_count": len(song.scenes),
            }

        elif method == "song.play":
            song.start_playing()
            return {"status": "playing"}

        elif method == "song.stop":
            song.stop_playing()
            return {"status": "stopped"}

        elif method == "song.continue":
            song.continue_playing()
            return {"status": "continued"}

        elif method == "song.record":
            val = params.get("enabled")
            if val is None:
                song.record_mode = not song.record_mode
            else:
                song.record_mode = bool(val)
            return {"record_mode": song.record_mode}

        elif method == "song.set_tempo":
            bpm = float(params.get("bpm", 120.0))
            song.tempo = max(20.0, min(999.0, bpm))
            return {"tempo": song.tempo}

        elif method == "song.set_time_signature":
            num = int(params.get("numerator", 4))
            denom = int(params.get("denominator", 4))
            song.signature_numerator = num
            song.signature_denominator = denom
            return {"numerator": num, "denominator": denom}

        elif method == "song.jump_to_time":
            time_val = float(params.get("time", 0.0))
            song.current_song_time = max(0.0, time_val)
            return {"current_song_time": song.current_song_time}

        elif method == "song.set_loop":
            start = float(params.get("start", song.loop_start))
            length = float(params.get("length", song.loop_length))
            enabled = bool(params.get("enabled", song.loop))
            song.loop_start = max(0.0, start)
            song.loop_length = max(0.25, length)
            song.loop = enabled
            return {"loop": song.loop, "loop_start": song.loop_start, "loop_length": song.loop_length}

        elif method == "tracks.create_midi":
            index = int(params.get("index", -1))
            new_track = song.create_midi_track(index)
            name = params.get("name")
            if name:
                new_track.name = str(name)
            return {"created_index": len(song.tracks) - 1 if index == -1 else index, "name": new_track.name}

        elif method == "tracks.create_audio":
            index = int(params.get("index", -1))
            new_track = song.create_audio_track(index)
            name = params.get("name")
            if name:
                new_track.name = str(name)
            return {"created_index": len(song.tracks) - 1 if index == -1 else index, "name": new_track.name}

        elif method == "tracks.delete":
            idx = int(params.get("index", -1))
            if 0 <= idx < len(song.tracks):
                song.delete_track(idx)
                return {"deleted_index": idx}
            raise ValueError("Track index %d out of bounds" % idx)

        elif method == "tracks.duplicate":
            idx = int(params.get("index", -1))
            if 0 <= idx < len(song.tracks):
                song.duplicate_track(idx)
                return {"duplicated_index": idx}
            raise ValueError("Track index %d out of bounds" % idx)

        elif method == "tracks.set_volume":
            idx = int(params.get("track_index", 0))
            val = float(params.get("value", 0.85))
            track = song.tracks[idx]
            track.mixer_device.volume.value = max(0.0, min(1.0, val))
            return {"track_index": idx, "volume": track.mixer_device.volume.value}

        elif method == "tracks.set_pan":
            idx = int(params.get("track_index", 0))
            val = float(params.get("value", 0.0))
            track = song.tracks[idx]
            track.mixer_device.panning.value = max(-1.0, min(1.0, val))
            return {"track_index": idx, "pan": track.mixer_device.panning.value}

        elif method == "tracks.set_mute":
            idx = int(params.get("track_index", 0))
            val = bool(params.get("value", False))
            track = song.tracks[idx]
            track.mute = val
            return {"track_index": idx, "mute": track.mute}

        elif method == "tracks.set_solo":
            idx = int(params.get("track_index", 0))
            val = bool(params.get("value", False))
            track = song.tracks[idx]
            track.solo = val
            return {"track_index": idx, "solo": track.solo}

        elif method == "tracks.set_arm":
            idx = int(params.get("track_index", 0))
            val = bool(params.get("value", False))
            track = song.tracks[idx]
            if hasattr(track, 'arm'):
                track.arm = val
            return {"track_index": idx, "arm": getattr(track, 'arm', False)}

        elif method == "tracks.set_name":
            idx = int(params.get("track_index", 0))
            name = str(params.get("name", "Track"))
            track = song.tracks[idx]
            track.name = name
            return {"track_index": idx, "name": track.name}

        elif method == "clips.create":
            track_idx = int(params.get("track_index", 0))
            slot_idx = int(params.get("slot_index", 0))
            length = float(params.get("length", 4.0))
            track = song.tracks[track_idx]
            slot = track.clip_slots[slot_idx]
            slot.create_clip(length)
            name = params.get("name")
            if name and slot.clip:
                slot.clip.name = str(name)
            return {"track_index": track_idx, "slot_index": slot_idx, "length": length}

        elif method == "clips.fire":
            track_idx = int(params.get("track_index", 0))
            slot_idx = int(params.get("slot_index", 0))
            song.tracks[track_idx].clip_slots[slot_idx].fire()
            return {"fired": True, "track_index": track_idx, "slot_index": slot_idx}

        elif method == "clips.stop":
            track_idx = int(params.get("track_index", 0))
            slot_idx = int(params.get("slot_index", 0))
            song.tracks[track_idx].clip_slots[slot_idx].stop()
            return {"stopped": True, "track_index": track_idx, "slot_index": slot_idx}

        elif method == "clips.delete":
            track_idx = int(params.get("track_index", 0))
            slot_idx = int(params.get("slot_index", 0))
            song.tracks[track_idx].clip_slots[slot_idx].delete_clip()
            return {"deleted": True, "track_index": track_idx, "slot_index": slot_idx}

        elif method == "clips.add_notes":
            track_idx = int(params.get("track_index", 0))
            slot_idx = int(params.get("slot_index", 0))
            notes_data = params.get("notes", [])
            clip = song.tracks[track_idx].clip_slots[slot_idx].clip
            if not clip:
                raise ValueError("No clip found at track %d slot %d" % (track_idx, slot_idx))

            formatted_notes = []
            for n in notes_data:
                pitch = int(n.get("pitch", 60))
                start_time = float(n.get("start_time", 0.0))
                duration = float(n.get("duration", 0.25))
                velocity = float(n.get("velocity", 100))
                mute = bool(n.get("mute", False))

                if hasattr(Live.Clip, 'MidiNoteSpecification'):
                    formatted_notes.append(Live.Clip.MidiNoteSpecification(
                        pitch=pitch,
                        start_time=start_time,
                        duration=duration,
                        velocity=velocity,
                        mute=mute
                    ))
                else:
                    formatted_notes.append((pitch, start_time, duration, velocity, mute))

            if hasattr(clip, 'add_new_notes'):
                clip.add_new_notes(tuple(formatted_notes))
            elif hasattr(clip, 'set_notes'):
                clip.set_notes(tuple(formatted_notes))

            return {"track_index": track_idx, "slot_index": slot_idx, "notes_added": len(formatted_notes)}

        elif method == "clips.clear_notes":
            track_idx = int(params.get("track_index", 0))
            slot_idx = int(params.get("slot_index", 0))
            clip = song.tracks[track_idx].clip_slots[slot_idx].clip
            if clip and hasattr(clip, 'remove_notes_extended'):
                clip.remove_notes_extended(from_time=0.0, from_pitch=0, time_span=9999.0, pitch_span=128)
            return {"cleared": True}

        elif method == "devices.get_all":
            track_idx = int(params.get("track_index", 0))
            track = song.tracks[track_idx]
            devices_info = []
            for dev_idx, dev in enumerate(track.devices):
                params_info = []
                for p_idx, p in enumerate(dev.parameters):
                    params_info.append({
                        "index": p_idx,
                        "name": p.name,
                        "value": round(p.value, 3),
                        "min": round(p.min, 3),
                        "max": round(p.max, 3),
                        "is_quantized": p.is_quantized
                    })
                devices_info.append({
                    "index": dev_idx,
                    "name": dev.name,
                    "class_name": getattr(dev, 'class_name', dev.name),
                    "parameters": params_info
                })
            return {"track_index": track_idx, "devices": devices_info}

        elif method == "devices.set_parameter":
            track_idx = int(params.get("track_index", 0))
            dev_idx = int(params.get("device_index", 0))
            param_idx = int(params.get("parameter_index", 0))
            val = float(params.get("value", 0.0))
            dev = song.tracks[track_idx].devices[dev_idx]
            param = dev.parameters[param_idx]
            param.value = max(param.min, min(param.max, val))
            return {
                "track_index": track_idx,
                "device_index": dev_idx,
                "parameter_index": param_idx,
                "parameter_name": param.name,
                "value": param.value
            }

        elif method == "scenes.fire":
            idx = int(params.get("scene_index", 0))
            song.scenes[idx].fire()
            return {"fired_scene": idx}

        elif method == "scenes.create":
            idx = int(params.get("index", -1))
            song.create_scene(idx)
            return {"scenes_count": len(song.scenes)}

        elif method == "master.set_volume":
            val = float(params.get("value", 0.85))
            song.master_track.mixer_device.volume.value = max(0.0, min(1.0, val))
            return {"master_volume": song.master_track.mixer_device.volume.value}

        elif method == "master.set_pan":
            val = float(params.get("value", 0.0))
            song.master_track.mixer_device.panning.value = max(-1.0, min(1.0, val))
            return {"master_pan": song.master_track.mixer_device.panning.value}

        else:
            raise NotImplementedError("Unknown method: %s" % method)

    def disconnect(self):
        self.log_message(">>> [AEGENTIX] CyberDAW Ableton Live Controller Disconnecting... <<<")
        self._running = False
        if self._server_sock:
            try:
                self._server_sock.close()
            except Exception:
                pass
        super(Aegentix_CyberDAW, self).disconnect()
`;

export const ABLETON_REMOTE_SCRIPT_INIT = `from __future__ import absolute_import, print_function, unicode_literals
from .Aegentix_CyberDAW import Aegentix_CyberDAW

def create_instance(c_instance):
    return Aegentix_CyberDAW(c_instance)
`;

export const ABLETON_OSC_INSTRUCTIONS = `# AEGENTIX CYBERDAW <-> ABLETON LIVE FULL LIVE API PROTOCOL GUIDE
# Uses Bidirectional JSON-RPC Socket on TCP Port 11000

1. SCRIPT INSTALLED TO:
   C:\\ProgramData\\Ableton\\Live 12 Trial\\Resources\\MIDI Remote Scripts\\Aegentix_CyberDAW\\

2. ACTIVATE IN ABLETON LIVE:
   - Preferences (Ctrl + ,) -> Link / Tempo / MIDI
   - Under Control Surface, select 'Aegentix_CyberDAW'

3. DIRECT METHODS:
   song.get_state, song.play, song.stop, song.record, song.set_tempo
   tracks.create_midi, tracks.set_volume, tracks.set_pan, tracks.set_mute, tracks.set_solo, tracks.set_arm
   clips.create, clips.add_notes, clips.fire, clips.stop
   devices.get_all, devices.set_parameter
`;
