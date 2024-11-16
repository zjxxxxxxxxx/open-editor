import { type Options, setOptions } from './options';
import { setupUI } from './ui';
import { on } from './event';
import { setupInspector } from './core';

export function setupClient(userOpts: Options) {
  on('DOMContentLoaded', () => {
    setOptions(userOpts);
    setupUI();
    setupInspector();
  });
}
