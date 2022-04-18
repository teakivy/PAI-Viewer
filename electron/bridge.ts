/**
 * @author Collin Jones
 * @description This is the bridge between the main process and the renderer process
 * @version 2022.4.11
 */

import { contextBridge, ipcRenderer } from 'electron';

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  sendMessage: (message: string) => {
    ipcRenderer.send('message', message);
  },

  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, func: Function) => {
    ipcRenderer.on(channel, (event, ...args) => {
      func(...args);
    });
  },

  setLoading: (loading: boolean) => {
    ipcRenderer.send('setLoading', loading);
  },
};

// Expose api methods to window.Main
contextBridge.exposeInMainWorld('Main', api);
