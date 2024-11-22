import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { dispatchEvent } from '../utils/dispatchEvent';
import {
  EXIT_INSPECTOR_EVENT,
  INSPECTOR_EXIT_CROSS_IFRAME,
} from '../constants';

export const inspectorExitBridge = crossIframeBridge({
  setup() {
    onMessage(INSPECTOR_EXIT_CROSS_IFRAME, (args) => {
      if (dispatchEvent(EXIT_INSPECTOR_EVENT)) {
        postMessageAll(INSPECTOR_EXIT_CROSS_IFRAME, args);
        inspectorExitBridge.emit(args, true);
      }
    });
  },
  emitMiddlewares: [
    (args) => {
      postMessage(INSPECTOR_EXIT_CROSS_IFRAME, args, topWindow);
    },
  ],
});
