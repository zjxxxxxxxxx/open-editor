import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { INSPECTOR_ACTIVE_CROSS_IFRAME } from '../constants';

export const inspectorActiveBridge = crossIframeBridge<[string]>({
  setup() {
    onMessage<[string]>(INSPECTOR_ACTIVE_CROSS_IFRAME, (args) => {
      postMessageAll(INSPECTOR_ACTIVE_CROSS_IFRAME, args);
      inspectorActiveBridge.emit(args, true);
    });
  },
  emitMiddlewares: [
    (args) => {
      postMessage(INSPECTOR_ACTIVE_CROSS_IFRAME, args, topWindow);
    },
  ],
});
