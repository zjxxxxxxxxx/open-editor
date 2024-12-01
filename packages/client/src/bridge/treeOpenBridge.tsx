import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, whenTopWindow } from '../utils/topWindow';
import { appendChild } from '../utils/dom';
import { onMessage, postMessage } from '../utils/message';
import { getOptions } from '../options';
import { resolveSource, type CodeSource } from '../resolve';
import { CURRENT_INSPECT_ID, TREE_OPEN_CROSS_IFRAME } from '../constants';
import { on, off } from '../event';

export const treeOpenBridge = crossIframeBridge<[CodeSource, string]>({
  setup() {
    onMessage<[CodeSource, string]>(TREE_OPEN_CROSS_IFRAME, (args) => {
      treeOpenBridge.emit(args, isTopWindow);
    });
  },
  emitMiddlewares: [
    ([, activeId], next) => {
      if (activeId === CURRENT_INSPECT_ID) {
        const { once } = getOptions();

        const overlay = <div className="oe-prevent-event-overlay" />;
        const eventOpts = {
          target: once ? overlay : window,
          capture: true,
        };

        const remove = () => {
          off('pointerup', remove, eventOpts);
          off('pointerout', remove, eventOpts);
          overlay.remove();
        };
        on('pointerup', remove, eventOpts);
        on('pointerout', remove, eventOpts);

        appendChild(document.body, overlay);
      }

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
