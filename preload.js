const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readEntries: () => ipcRenderer.invoke('read-entries'),
  writeEntries: (entries) => ipcRenderer.invoke('write-entries', entries),
});
