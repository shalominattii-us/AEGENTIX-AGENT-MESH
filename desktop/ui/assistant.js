// Aegentix Conversational Assistant UI
// Powered by Multi-Turn Conversational Memory & Windows SpeechSynthesis TTS

const voiceOrb = document.getElementById("voiceOrb");
const stateLabel = document.getElementById("stateLabel");
const waveform = document.getElementById("waveform");
const queryInput = document.getElementById("queryInput");
const micBtn = document.getElementById("micBtn");
const sendBtn = document.getElementById("sendBtn");
const chatFeed = document.getElementById("chatFeed");
const hideBtn = document.getElementById("hideBtn");
const muteBtn = document.getElementById("muteBtn");
const clearBtn = document.getElementById("clearBtn");

let isMuted = false;
let isRecording = false;
let audioContext = null;
let mediaStream = null;
let analyser = null;
let animationFrameId = null;
let speechRecognizer = null;

// Set initial time
const initialTime = document.getElementById("initialTime");
if (initialTime) initialTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Initialize Speech Recognition if supported in environment
function setupSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return null;

  try {
    const recognizer = new SpeechRec();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = "en-US";

    recognizer.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          queryInput.value = event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
          queryInput.value = interim;
        }
      }
    };

    recognizer.onerror = (e) => {
      console.warn("Speech recognition notice:", e.error);
    };

    recognizer.onend = () => {
      if (isRecording) {
        stopMicrophone();
      }
    };

    return recognizer;
  } catch (e) {
    return null;
  }
}

speechRecognizer = setupSpeechRecognition();

// Start Microphone & Audio Visualizer
async function startMicrophone() {
  if (isRecording) return;
  isRecording = true;

  micBtn.classList.add("recording");
  voiceOrb.classList.add("listening");
  waveform.classList.add("active");
  stateLabel.textContent = "Listening to you...";

  // Start speech recognizer if available
  if (speechRecognizer) {
    try { speechRecognizer.start(); } catch {}
  }

  // Web Audio decibel visualizer
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);
    visualizeAudio();
  } catch (err) {
    console.warn("Audio visualizer microphone notice:", err);
  }
}

function stopMicrophone() {
  if (!isRecording) return;
  isRecording = false;

  micBtn.classList.remove("recording");
  voiceOrb.classList.remove("listening");
  waveform.classList.remove("active");
  stateLabel.textContent = "Processing response...";

  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch {}
  }

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
    audioContext = null;
  }

  const prompt = queryInput.value.trim();
  if (prompt) {
    dispatchConversation(prompt);
  } else {
    stateLabel.textContent = "Ready • Speak or Type";
  }
}

function visualizeAudio() {
  if (!isRecording || !analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
  const avg = sum / bufferLength;

  const scale = 1 + Math.min(avg / 128, 0.35);
  voiceOrb.style.transform = `scale(${scale})`;

  const bars = document.querySelectorAll(".waveform .bar");
  bars.forEach((bar, idx) => {
    const val = dataArray[idx % bufferLength] || 10;
    const height = Math.max(4, Math.min(20, (val / 255) * 22));
    bar.style.height = `${height}px`;
  });

  animationFrameId = requestAnimationFrame(visualizeAudio);
}

// Speak aloud using native SpeechSynthesis
function speakAloud(text) {
  if (isMuted || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    voiceOrb.classList.add("speaking");
    waveform.classList.add("active");
    stateLabel.textContent = "Aegentix is speaking...";
  };

  utterance.onend = () => {
    voiceOrb.classList.remove("speaking");
    waveform.classList.remove("active");
    stateLabel.textContent = "Ready • Speak or Type";
    voiceOrb.style.transform = "scale(1)";
  };

  utterance.onerror = () => {
    voiceOrb.classList.remove("speaking");
    waveform.classList.remove("active");
    voiceOrb.style.transform = "scale(1)";
    stateLabel.textContent = "Ready • Speak or Type";
  };

  window.speechSynthesis.speak(utterance);
}

// Append message turn to dialogue feed
function appendUserMessage(text) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const turn = document.createElement("div");
  turn.className = "msg-turn user-turn";
  turn.innerHTML = `
    <div class="msg-bubble">
      <p class="bubble-text">${escapeHtml(text)}</p>
      <div class="bubble-meta">
        <span class="provider-pill">Operator</span>
        <span class="msg-time">${time}</span>
      </div>
    </div>
  `;
  chatFeed.appendChild(turn);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function appendThinkingTurn() {
  const turn = document.createElement("div");
  turn.className = "msg-turn bot-turn";
  turn.id = "thinkingTurn";
  turn.innerHTML = `
    <div class="bot-badge">AE</div>
    <div class="msg-bubble">
      <div class="thinking-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatFeed.appendChild(turn);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function removeThinkingTurn() {
  const turn = document.getElementById("thinkingTurn");
  if (turn) turn.remove();
}

function appendBotMessage(response) {
  removeThinkingTurn();

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const turn = document.createElement("div");
  turn.className = "msg-turn bot-turn";
  turn.innerHTML = `
    <div class="bot-badge">AE</div>
    <div class="msg-bubble">
      <p class="bubble-text">${escapeHtml(response.spoken || "Operational status confirmed.")}</p>
      <div class="bubble-meta">
        <span class="provider-pill">${escapeHtml(response.provider || "Aegentix Sovereign Engine")}</span>
        <span class="msg-time">${time}</span>
      </div>
    </div>
  `;
  chatFeed.appendChild(turn);
  chatFeed.scrollTop = chatFeed.scrollHeight;
}

function escapeHtml(str) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Dispatch conversational turn
async function dispatchConversation(query) {
  if (!query || !query.trim()) return;

  queryInput.value = "";
  stateLabel.textContent = "Consulting intelligence mesh...";
  waveform.classList.add("active");

  // 1. Render User Message
  appendUserMessage(query);

  // 2. Render Thinking Placeholder
  appendThinkingTurn();

  // 3. Query Electron IPC
  let response;
  try {
    if (window.aegentixDesktop && window.aegentixDesktop.query) {
      response = await window.aegentixDesktop.query(query);
    } else {
      response = {
        spoken: `Understood, Operator. Monitoring 29 exchange streams for ${query}.`,
        provider: "Offline Direct",
      };
    }
  } catch (err) {
    response = {
      spoken: "Encountered a temporary communication delay. Retaining state.",
      provider: "Aegentix Safeguard",
    };
  }

  // 4. Render Aegentix Response
  appendBotMessage(response);
  waveform.classList.remove("active");

  // 5. Speak Aloud
  if (response.spoken) {
    speakAloud(response.spoken);
  }
}

// Clear conversation memory
clearBtn.addEventListener("click", async () => {
  if (window.aegentixDesktop && window.aegentixDesktop.query) {
    await window.aegentixDesktop.query("clear history");
  }
  chatFeed.innerHTML = `
    <div class="msg-turn bot-turn">
      <div class="bot-badge">AE</div>
      <div class="msg-bubble">
        <p class="bubble-text">Conversation memory reset. All systems green. What would you like to discuss?</p>
        <div class="bubble-meta">
          <span class="provider-pill">Aegentix Sovereign OS</span>
          <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  `;
  stateLabel.textContent = "Memory Cleared • Ready";
});

// Event Listeners: Mic & Buttons
micBtn.addEventListener("click", () => {
  if (isRecording) {
    stopMicrophone();
  } else {
    startMicrophone();
  }
});

voiceOrb.addEventListener("click", () => {
  if (isRecording) {
    stopMicrophone();
  } else {
    startMicrophone();
  }
});

sendBtn.addEventListener("click", () => {
  dispatchConversation(queryInput.value);
});

queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    dispatchConversation(queryInput.value);
  }
});

// Spacebar Push-To-Talk
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && document.activeElement !== queryInput && !isRecording) {
    e.preventDefault();
    startMicrophone();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space" && document.activeElement !== queryInput && isRecording) {
    e.preventDefault();
    stopMicrophone();
  }
});

// Chips click
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const cmd = chip.getAttribute("data-cmd");
    dispatchConversation(cmd);
  });
});

// Hide button
hideBtn.addEventListener("click", () => {
  if (window.aegentixDesktop && window.aegentixDesktop.hide) {
    window.aegentixDesktop.hide();
  }
});

// Mute button
muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? "🔇" : "🔊";
  if (isMuted && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
});
