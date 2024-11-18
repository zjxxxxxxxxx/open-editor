import { enableBridge } from './enableBridge';
import { exitBridge } from './exitBridge';
import { activeBridge } from './activeBridge';
import { sourceBridge } from './sourceBridge';
import { boxModelBridge } from './boxModelBridge';
import { openTreeBridge } from './openTreeBridge';
import { closeTreeBridge } from './closeTreeBridge';
import { openEditorBridge } from './openEditorBridge';
import { openEditorStartBridge } from './openEditorStartBridge';
import { openEditorEndBridge } from './openEditorEndBridge';
import { openEditorErrorBridge } from './openEditorErrorBridge';

export function setupBridge() {
  enableBridge.setup();
  exitBridge.setup();
  activeBridge.setup();
  sourceBridge.setup();
  boxModelBridge.setup();
  openTreeBridge.setup();
  closeTreeBridge.setup();
  openEditorBridge.setup();
  openEditorStartBridge.setup();
  openEditorEndBridge.setup();
  openEditorErrorBridge.setup();
}

export {
  enableBridge,
  exitBridge,
  activeBridge,
  sourceBridge,
  boxModelBridge,
  openTreeBridge,
  closeTreeBridge,
  openEditorBridge,
  openEditorStartBridge,
  openEditorEndBridge,
  openEditorErrorBridge,
};
