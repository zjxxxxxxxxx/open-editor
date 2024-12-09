import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, topWindow } from '../utils/topWindow';
import { onMessage, postMessage, postMessageAll } from '../utils/message';
import { preventEventOverlay } from '../utils/preventEventOverlay';
import { TREE_CLOSE_CROSS_IFRAME } from '../constants';

export const treeCloseBridge = crossIframeBridge<[boolean?]>({
  setup() {
    onMessage<[boolean?]>(TREE_CLOSE_CROSS_IFRAME, (args) => {
      const isFormTopWindow = (args[0] ||= isTopWindow);
      if (isFormTopWindow) {
        postMessageAll(TREE_CLOSE_CROSS_IFRAME, args);
        preventEventOverlay.unmount();
      }
      treeCloseBridge.emit(args, isFormTopWindow);
    });
  },
  emitMiddlewares: [
    (args) => {
      postMessage(TREE_CLOSE_CROSS_IFRAME, args, topWindow);
    },
  ],
});
