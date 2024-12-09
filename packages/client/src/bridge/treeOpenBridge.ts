import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage, postMessageAll } from '../utils/message';
import { preventEventOverlay } from '../utils/preventEventOverlay';
import { resolveSource, type CodeSource } from '../resolve';
import { TREE_OPEN_CROSS_IFRAME } from '../constants';

export const treeOpenBridge = crossIframeBridge<[CodeSource, boolean?]>({
  setup() {
    onMessage<[CodeSource, boolean?]>(TREE_OPEN_CROSS_IFRAME, (args) => {
      const isFormTopWindow = (args[1] ||= isTopWindow);
      if (isFormTopWindow) {
        postMessageAll(TREE_OPEN_CROSS_IFRAME, args);
        preventEventOverlay.mount();
      }
      treeOpenBridge.emit(args, isFormTopWindow);
    });
  },
  emitMiddlewares: [
    ([source], next) => {
      if (window.frameElement) {
        const { tree } = resolveSource(window.frameElement as HTMLElement, true);
        source.tree.push(...tree);
      }

      next();
    },
    (args) => {
      whenTopWindow(
        () => {
          postMessage(TREE_OPEN_CROSS_IFRAME, args, topWindow);
        },
        () => {
          postMessage(TREE_OPEN_CROSS_IFRAME, args, window.parent);
        },
      );
    },
  ],
});
