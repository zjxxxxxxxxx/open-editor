import { on } from './event';
import { IS_CLIENT } from './constants';
import { type Options, setOptions } from './options';
import { setupBridge } from './bridge';
import { setupInspector } from './inspector';
import { setupUI } from './ui';

export { Options };

export function setupClient(opts: Options) {
  if (IS_CLIENT && !window.__OPEN_EDITOR_SETUPED__) {
    window.__OPEN_EDITOR_SETUPED__ = true;

    on('DOMContentLoaded', () => {
      setOptions(opts);
      setupBridge();
      setupInspector();
      setupUI();
    });
  }
}
