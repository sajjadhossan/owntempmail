const { app, BrowserWindow, Menu, Tray, nativeImage, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

const isDev = process.env.NODE_ENV === 'development';
const APP_URL = process.env.OWNTEMP_URL || 'http://localhost:3000';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0b0f19',
    title: 'Owntemp — Free Disposable Temp Mail & Lifetime Lock',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
