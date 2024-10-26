import { IS_CLIENT } from '../constants';
import { appendChild } from './dom';

export function createGlobalStyle(css: string) {
  if (!IS_CLIENT) return { mount() {}, unmount() {} };

  const style = <style type="text/css">{css}</style>;
  return {
    mount() {
      // Insert into `body` to override the same styles that may have been set
      if (!style.isConnected) appendChild(document.body, style);
    },
    unmount() {
      if (style.isConnected) style.remove();
    },
  };
}
