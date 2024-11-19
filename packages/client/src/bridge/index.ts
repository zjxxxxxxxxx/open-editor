import { inspectorEnableBridge } from './inspectorEnableBridge';
import { inspectorExitBridge } from './inspectorExitBridge';
import { inspectorActiveBridge } from './inspectorActiveBridge';
import { codeSourceBridge } from './codeSourceBridge';
import { boxModelBridge } from './boxModelBridge';
import { treeOpenBridge } from './treeOpenBridge';
import { treeCloseBridge } from './treeCloseBridge';
import { openEditorBridge } from './openEditorBridge';
import { openEditorStartBridge } from './openEditorStartBridge';
import { openEditorEndBridge } from './openEditorEndBridge';
import { openEditorErrorBridge } from './openEditorErrorBridge';

export function setupBridge() {
  inspectorEnableBridge.setup();
  inspectorExitBridge.setup();
  inspectorActiveBridge.setup();
  codeSourceBridge.setup();
  boxModelBridge.setup();
  treeOpenBridge.setup();
  treeCloseBridge.setup();
  openEditorBridge.setup();
  openEditorStartBridge.setup();
  openEditorEndBridge.setup();
  openEditorErrorBridge.setup();
}

export {
  inspectorEnableBridge,
  inspectorExitBridge,
  inspectorActiveBridge,
  codeSourceBridge,
  boxModelBridge,
  treeOpenBridge,
  treeCloseBridge,
  openEditorBridge,
  openEditorStartBridge,
  openEditorEndBridge,
  openEditorErrorBridge,
};
