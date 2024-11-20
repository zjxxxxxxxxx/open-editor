import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { OPEN_EDITOR_END_CROSS_IFRAME } from '../constants';

export const openEditorEndBridge = crossIframeBridge({
  setup() {
    onMessage(OPEN_EDITOR_END_CROSS_IFRAME, (args) => {
      postMessageAll(OPEN_EDITOR_END_CROSS_IFRAME, args, true);
      openEditorEndBridge.emit(args, true);
    });
  },
  emitMiddlewares: [
    (args) => {
      postMessage(OPEN_EDITOR_END_CROSS_IFRAME, args, topWindow);
    },
  ],
});
