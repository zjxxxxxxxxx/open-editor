import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { dispatchEvent } from '../utils/dispatchEvent';
import {
  ENABLE_INSPECTOR_EVENT,
  INSPECTOR_ENABLE_CROSS_IFRAME,
} from '../constants';

export const inspectorEnableBridge = crossIframeBridge({
  setup() {
    onMessage(INSPECTOR_ENABLE_CROSS_IFRAME, (args) => {
      if (dispatchEvent(ENABLE_INSPECTOR_EVENT)) {
        postMessageAll(INSPECTOR_ENABLE_CROSS_IFRAME, args);
        inspectorEnableBridge.emit(args, true);
      }
    });
  },
  emitMiddlewares: [
    (args) => {
      postMessage(INSPECTOR_ENABLE_CROSS_IFRAME, args, topWindow);
    },
  ],
});
