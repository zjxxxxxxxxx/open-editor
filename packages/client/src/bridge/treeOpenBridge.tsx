import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, whenTopWindow } from '../utils/topWindow';
import { appendChild } from '../utils/dom';
import { onMessage, postMessage } from '../utils/message';
import { resolveSource, type CodeSource } from '../resolve';
import { TREE_OPEN_CROSS_IFRAME } from '../constants';
import { on } from '../event';
import { off } from 'process';

export const treeOpenBridge = crossIframeBridge<[CodeSource]>({
  setup() {
    onMessage<[CodeSource]>(TREE_OPEN_CROSS_IFRAME, (args) => {
      treeOpenBridge.emit(args, isTopWindow);
    });
  },
  emitMiddlewares: [
    (_, next) => {
      const preventEventOverlay = <div className="oe-prevent-event-overlay" />;
      const remove = () => {
        off('pointerup', remove);
        off('pointerout', remove);
        preventEventOverlay.remove();
      };
      on('pointerup', remove, { capture: true });
      on('pointerout', remove, { capture: true });
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
