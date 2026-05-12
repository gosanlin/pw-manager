const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

const DATA_DIR_NAME = 'Gestor de Contraseñas';
const STORE_FILENAME = 'entries.json';

function getDataDirectory() {
  return path.join(app.getPath('documents'), DATA_DIR_NAME);
}

function getDataFilePath() {
  return path.join(getDataDirectory(), STORE_FILENAME);
}

async function ensureStorageDirectory() {
  const dirPath = getDataDirectory();
  await fs.mkdir(dirPath, { recursive: true });
  return dirPath;
}

async function ensureDataFile() {
  await ensureStorageDirectory();
  const filePath = getDataFilePath();
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]', { encoding: 'utf8' });
  }
  return filePath;
}

async function readEntries() {
  try {
    const filePath = await ensureDataFile();
    const raw = await fs.readFile(filePath, { encoding: 'utf8' });
    return JSON.parse(raw || '[]');
  } catch (error) {
    console.error('Error leyendo datos de contraseñas:', error);
    return [];
  }
}

async function writeEntries(entries) {
  try {
    const filePath = await ensureDataFile();
    await fs.writeFile(filePath, JSON.stringify(entries, null, 2), { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.error('Error guardando datos de contraseñas:', error);
    return false;
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, 'logo.ico');
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 840,
    minHeight: 650,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false,
    },
  });

  win.removeMenu();
  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  ipcMain.handle('read-entries', readEntries);
  ipcMain.handle('write-entries', async (_event, entries) => {
    await writeEntries(entries);
    return true;
  });

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
