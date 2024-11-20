import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { TREE_CLOSE_CROSS_IFRAME } from '../constants';

export const treeCloseBridge = crossIframeBridge({
  setup() {
    onMessage(TREE_CLOSE_CROSS_IFRAME, (args) => {
      treeCloseBridge.emit(args, true);
    });
  },
  emitMiddlewares: [
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(TREE_CLOSE_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
