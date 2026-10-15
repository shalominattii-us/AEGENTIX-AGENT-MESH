const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require("electron");
const path = require("path");

// Suppress unauthenticated cloud speech upload pipe and noisy Chromium network logs
app.commandLine.appendSwitch("disable-speech-api");
app.commandLine.appendSwitch("log-level", "3");

// Enforce single instance lock to avoid multiple background ghosts
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log("[AEGENTIX] Another instance is already running. Focusing existing instance and quitting new one.");
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let tray = null;
let activeShortcutKey = null;

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const winWidth = 440;
  const winHeight = 640;

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: Math.max(20, Math.round(width - winWidth - 30)),
    y: Math.max(20, Math.round(height - winHeight - 40)),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    show: false, // will show in ready-to-show
    skipTaskbar: false,
    resizable: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "ui", "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.focus();
    console.log(`\n======================================================`);
    console.log(`  AEGENTIX ASSISTANT HUD IS ONLINE & VISIBLE ON SCREEN `);
    console.log(`  Hotkey to toggle: ${activeShortcutKey || "Ctrl+Shift+A"}       `);
    console.log(`  DevTools Toggle:  Ctrl+Shift+I or F12               `);
    console.log(`======================================================\n`);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  try {
    tray = new Tray(path.join(__dirname, "ui", "favicon.ico"));
  } catch {
    // If icon missing, create fallback
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Aegentix Assistant",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: "Toggle Always on Top",
      type: "checkbox",
      checked: true,
      click: (item) => {
        if (mainWindow) mainWindow.setAlwaysOnTop(item.checked);
      },
    },
    { type: "separator" },
    {
      label: "Quit Aegentix",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  if (tray) {
    tray.setToolTip("Aegentix Desktop Assistant");
    tray.setContextMenu(contextMenu);
    tray.on("click", toggleWindow);
  }
}

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Try candidate global shortcuts in order of reliability
  const candidateShortcuts = [
    "CommandOrControl+Shift+Space",
    "CommandOrControl+Shift+A",
    "Alt+Shift+A",
    "F1"
  ];

  for (const sc of candidateShortcuts) {
    try {
      const ok = globalShortcut.register(sc, toggleWindow);
      if (ok) {
        activeShortcutKey = sc;
        break;
      }
    } catch {}
  }

  if (!activeShortcutKey) {
    console.warn("[AEGENTIX] Could not register global shortcut. Tray icon or clicking taskbar is active.");
  }

  // Developer Tools Toggle
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools();
  });
  globalShortcut.register("F12", () => {
    if (mainWindow) mainWindow.webContents.toggleDevTools();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

const { AegentixReasoningEngine } = require("./reasoning-engine");
const reasoningEngine = new AegentixReasoningEngine();

// IPC Handlers
ipcMain.handle("aegentix:hide", () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.handle("aegentix:query", async (_event, queryText) => {
  try {
    return await reasoningEngine.processQuery(queryText);
  } catch (err) {
    console.error("[MAIN IPC] Error processing query:", err);
    return {
      spoken: "Operational exception detected. Subsystem state has been preserved.",
      intent: "ERROR",
      confidence: 1.0,
      riskLevel: "HIGH",
      reasoning: String(err?.message || err),
      data: { error: true, message: String(err?.message || err) },
      provider: "Aegentix Safeguard"
    };
  }
});
