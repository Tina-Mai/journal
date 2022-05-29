import { contextBridge, ipcRenderer, clipboard } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  onPaste: (callback: any) => ipcRenderer.on('paste', callback),
  onCopy: (callback: any) => ipcRenderer.on('copy', callback),
  storeIndex: {
    getAll() {
      return ipcRenderer.sendSync('electron-storeIndex-get-all')
    },
    setAll(val: any) {
      ipcRenderer.send('electron-storeIndex-set-all', val)
    },
    add(val: any) {
      return ipcRenderer.sendSync('electron-storeIndex-add', val)
    },
  },
  storeEntries: {
    get(val: any) {
      return ipcRenderer.sendSync('electron-storeEntries-get', val)
    },
    getAll() {
      return ipcRenderer.sendSync('electron-storeEntries-get-all')
    },
    set(property: any, val: any) {
      ipcRenderer.send('electron-storeEntries-set', property, val)
    },
  },
  storeUserPreferences: {
    get(val: any) {
      return ipcRenderer.sendSync('electron-storeUserPreferences-get', val)
    },
    getAll() {
      return ipcRenderer.sendSync('electron-storeUserPreferences-get-all')
    },
    set(property: any, val: any) {
      ipcRenderer.send('electron-storeUserPreferences-set', property, val)
    },
  },
  handleSpellCheck: (callback: any) => ipcRenderer.once('electron-handleSpellCheck', callback),
  handleOpenUrl: (callback: any) => ipcRenderer.on('open-url', callback),
})
