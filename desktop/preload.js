const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("aegentixDesktop", {
  hide: () => ipcRenderer.invoke("aegentix:hide"),
  query: (text) => ipcRenderer.invoke("aegentix:query", text),
});
