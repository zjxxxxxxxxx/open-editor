import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, whenTopWindow } from '../utils/topWindow';
import { appendChild } from '../utils/dom';
import { onMessage, postMessage } from '../utils/message';
import { resolveSource, type CodeSource } from '../resolve';
import { TREE_OPEN_CROSS_IFRAME } from '../constants';

export const treeOpenBridge = crossIframeBridge<[CodeSource]>({
  setup() {
    onMessage<[CodeSource]>(TREE_OPEN_CROSS_IFRAME, (args) => {
      treeOpenBridge.emit(args, isTopWindow);
    });
  },
  emitMiddlewares: [
    (_, next) => {
      const preventEventOverlay = (
        <div
          className="oe-prevent-event-overlay"
          onPointerUp={() => preventEventOverlay.remove()}
          onPointerOut={() => preventEventOverlay.remove()}
        />
      );
      appendChild(document.body, preventEventOverlay);

      next();
    },
    ([source], next) => {
      if (window.frameElement) {
        const { tree } = resolveSource(window.frameElement as HTMLElement, true);
        source.tree.push(...tree);
      }

      next();
    },
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(TREE_OPEN_CROSS_IFRAME, args, window.parent);
      });
    },
  ],
});
