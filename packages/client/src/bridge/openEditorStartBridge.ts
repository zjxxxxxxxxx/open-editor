import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_START_CROSS_IFRAME } from '../constants';

export const openEditorStartBridge = crossIframeBridge({
  setup() {
    onMessage(OPEN_EDITOR_START_CROSS_IFRAME, (args) => {
      postMessageAll(OPEN_EDITOR_START_CROSS_IFRAME, args, true);
      openEditorStartBridge.emit(args, true);
    });
  },
  emitMiddlewares: [
    (args) => {
      postMessage(OPEN_EDITOR_START_CROSS_IFRAME, args, topWindow);
    },
  ],
});
