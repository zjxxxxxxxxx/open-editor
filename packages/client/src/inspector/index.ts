import { addClass, removeClass } from '../utils/dom';
import { on } from '../event';
import { CURRENT_INSPECT_ID } from '../constants';
import {
  inspectorActiveBridge,
  inspectorEnableBridge,
  inspectorExitBridge,
  openEditorBridge,
  openEditorStartBridge,
  openEditorEndBridge,
} from '../bridge';
import { effectStyle } from './globalStyles';
import { openEditor } from './openEditor';
import { inspectorEnable, inspectorExit } from './inspectorEnable';
import { inspectorState } from './inspectorState';

export function setupInspector() {
  effectStyle.mount();

  on('mousemove', () => inspectorActiveBridge.emit([CURRENT_INSPECT_ID]), {
    capture: true,
  });

  on(
    'keydown',
    (e) => {
      if (!inspectorState.isTreeOpen && e.altKey && e.metaKey && e.code === 'KeyO') {
        if (!inspectorState.isEnable) {
          inspectorEnableBridge.emit();
        } else {
          inspectorExitBridge.emit();
        }
      }
    },
    {
      capture: true,
    },
  );

  inspectorActiveBridge.on((activeId) => {
    inspectorState.isActive = activeId === CURRENT_INSPECT_ID;
    if (!inspectorState.isActive && inspectorState.isRendering) {
      inspectorState.isRendering = false;
      inspectorState.activeEl = null;
    }
  });
  inspectorEnableBridge.on(inspectorEnable);
  inspectorExitBridge.on(inspectorExit);
  openEditorBridge.on(openEditor);
  openEditorStartBridge.on(() => addClass(document.body, 'oe-loading'));
  openEditorEndBridge.on(() => removeClass(document.body, 'oe-loading'));
}
