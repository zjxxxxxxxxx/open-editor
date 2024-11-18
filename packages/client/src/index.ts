import { on } from './event';
import { IS_CLIENT } from './constants';
import { type Options, setOptions } from './options';
import { setupBridge } from './bridge';
import { setupInspector } from './inspector';
import { setupUI } from './ui';

export type { Options };

export function setupClient(opts: Options) {
  if (IS_CLIENT) {
    on('DOMContentLoaded', () => {
      setOptions(opts);
      setupBridge();
      setupInspector();
      setupUI();
    });
  }
}
