/**
 * @author Collin Jones & electron
 * @description This is the entry point for the electron app, some is boilerplate code to start & run electron, others are the main logic for the app
 * @version 2022.4.11
 */

import { app, BrowserWindow, dialog, ipcMain, Menu, protocol } from 'electron';
import fs from 'fs';
import path from 'path';
import { paiToImage, toPaiImage } from '../lib/index';
import { Seperator } from '../lib/core/constants';

// Main window for the application, can be BrowserWindow or null
let mainWindow: BrowserWindow | null;

// Declare webpack entrys
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Create the window, this acts as a main method on startup
function createWindow() {
  // Create the top Menu for the window
  // accelerator = keyboard shortcuts
  let menu: Menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Image',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            api.openDialog();
          },
        },

        {
          label: 'Export...',
          submenu: [
            {
              label: 'As PAI',
              accelerator: 'CmdOrCtrl+S',
              click: () => {
                api.exportDialog('pai');
              },
            },
            {
              label: 'As PNG',
              accelerator: 'CmdOrCtrl+Shift+S',
              click: () => {
                api.exportDialog('png');
              },
            },
          ],
        },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Shift+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Image Outline',
          accelerator: 'CmdOrCtrl+Shift+O',
          type: 'checkbox',
          click: () => {
            api.toggleOutline();
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  // Create the main window and set it's properties
  mainWindow = new BrowserWindow({
    icon: __dirname + '/assets/icons/win/icon.ico',
    width: 1100,
    height: 700,
    backgroundColor: '#fafafa',
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      devTools: true,
    },
  });

  // Set the icon for the window and load the webpack entry - This causes a crash when compiled, the above works fine
  // mainWindow.setIcon(
  //   path.join(__dirname, '../../assets/icons/png/256x256.png')
  // );

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // When the window is closed, close the application and remove the last image modified if it exists
  mainWindow.on('closed', () => {
    mainWindow = null;

    if (lastImage.length > 0 && fs.existsSync(lastImage)) {
      fs.unlinkSync(lastImage);
    }
  });
}

// Add event listeners to the window.
async function registerListeners() {
  ipcMain.on('setImage', function (event, arg) {
    // Send the image to the renderer process
    mainWindow?.webContents.send('setImage', arg);
  });
  ipcMain.on('setLoading', function (event, arg) {
    // Send the image to the renderer process
    mainWindow?.webContents.send('setLoading', arg);
  });
}

// When the application is ready, create the window, register listeners, and start the application
app
  .on('ready', createWindow)
  .whenReady()
  .then(() => {
    registerListeners();

    // Register a protocol "atom:///" to allow for opening local files.

    /**
     * IF THIS DOESNT WORK, TRY OPENING WITH FS, THEN CONVERTING TO BASE64! HTML LOADS THAT I THINK
     */
    protocol.registerFileProtocol('atom', (request, callback) => {
      const url = request.url.substr(7);
      callback(decodeURI(path.normalize(url)));
    });
  })
  .catch(e => console.error(e));

// When all processes are closed, quit the application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the application is activated, create the window
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Set the state of the loading hash
 * @param loading state of the loading hash
 */
let setLoading = (loading: boolean) => {
  mainWindow?.webContents.send('setLoading', loading);
};

// API assets
let appData = app.getPath('appData');
let lastImage = '';

// API object
let api = {
  /**
   * Open a dialog to select an image
   */
  openDialog: async () => {
    // Opens a dialog to select an image
    let loc = dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {
          name: 'PAI/PNG Image',
          extensions: ['pai', 'png'],
        },
      ],
    });

    // For every file selected (1 or 0), load it
    (await loc).filePaths.forEach(async file => {
      // Dispose of the previous image if it exists
      if (lastImage.length > 0 && fs.existsSync(lastImage)) {
        fs.unlinkSync(lastImage);
      }

      // Get the name of the file, including random characters at the end
      // Random characters are used to reload the image, since caching exists
      let imageName =
        path.basename(file).split('.')[0] +
        Math.random().toString(36).substring(2, 15);

      // Get the full path of the image
      let to = path.join(appData, 'images', `${imageName}.png`);

      // Set the last image to the new image
      lastImage = to;

      // If the file is a pai file, convert it to a png, and load it
      if (file.endsWith('.pai')) {
        await paiToImage(file, to, () => {
          setLoading(true);
        }).then(() => {
          // Wait 1 second before loading the image to avoid it possibly not being written yet
          setTimeout(() => {
            // Send signal to the renderer to load the image
            mainWindow?.webContents.send('setImage', 'atom:///' + to);
            setLoading(false);
          }, 1000);
        });
      } else {
        // Otherwise, copy the file to the images folder, and load it
        setLoading(true);
        fs.copyFile(file, to, err => {
          if (err) {
            throw err;
          }

          // Send signal to the renderer to load the image
          mainWindow?.webContents.send('setImage', 'atom:///' + to);
          setLoading(false);
        });
      }
    });
  },
  /**
   * Export the image to a file
   * @param type png or pai
   */
  exportDialog: async (type: 'pai' | 'png') => {
    let loc = dialog.showSaveDialog({
      title: 'Select the File Path to save',
      defaultPath: path.join(app.getPath('pictures'), `./image.${type}`),
      // defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: 'Save As',
      // Restricting the user to only certain Files.
      filters: [
        {
          name: `${type.toUpperCase()} Image`,
          extensions: [type],
        },
      ],
      properties: [],
    });

    let exportTo = (await loc).filePath;

    if (exportTo === undefined || exportTo.length <= 3) {
      return;
    }

    // If the file is a pai file, convert it to a png, and save it
    if (type === 'pai') {
      await toPaiImage(
        lastImage,
        {
          seperators: {
            pixel: Seperator.PIXEL,
            line: Seperator.LINE,
            size: Seperator.SIZE,
            multiLine: Seperator.MULTI_LINE,
          },
          quality: 11,
          fileName: exportTo,
          writeToFile: true,
        },
        () => {
          setLoading(true);
        },
        () => {
          setLoading(false);
        }
      );
    } else {
      setLoading(true);
      // Otherwise, copy the file to the images folder, and save it
      fs.copyFile(lastImage, exportTo, err => {
        if (err) {
          throw err;
        }

        setLoading(false);
      });
    }
  },
  /**
   * Toggle the outline of the image
   */
  toggleOutline: () => {
    // Send signal to the renderer to toggle the outline
    mainWindow?.webContents.send('toggleOutline');
  },
};
