import { on } from './event';
import { IS_CLIENT } from './constants';
import { type Options, setOptions } from './options';
import { setupUI } from './ui';
import { setupInspector } from './core';

export type { Options };

export function setupClient(opts: Options) {
  if (IS_CLIENT) {
    on('DOMContentLoaded', () => {
      setOptions(opts);
      setupUI();
      setupInspector();
    });
  }
}
