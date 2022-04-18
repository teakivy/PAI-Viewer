/**
 * @author Collin Jones
 * @description Provide type declarations for the bridge
 * @version 2022.4.11
 */

import { api } from '../../electron/bridge';

declare global {
  // eslint-disable-next-line
  interface Window {
    Main: typeof api;
  }
}
