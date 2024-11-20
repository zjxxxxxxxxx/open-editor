import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { postMessageAll, onMessage, postMessage } from '../utils/message';
import { INSPECTOR_RENDER_CROSS_IFRAME } from '../constants';

export const inspectorRenderBridge = crossIframeBridge({
  setup() {
    onMessage(INSPECTOR_RENDER_CROSS_IFRAME, (args) => {
      postMessageAll(INSPECTOR_RENDER_CROSS_IFRAME, args);
      inspectorRenderBridge.emit(args, true);
    });
  },
  emitMiddlewares: [
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(INSPECTOR_RENDER_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
