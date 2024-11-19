import { bridge } from '../utils/bridge';
import { isTopWindow, topWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { resolveSource, type CodeSource } from '../resolve';
import { TREE_OPEN_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const treeOpenBridge = bridge<[CodeSource]>({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage<[CodeSource]>(TREE_OPEN_CROSS_IFRAME, (args) => {
        treeOpenBridge.emit(args, isTopWindow);
      });
    }
  },
  emitMiddlewares: [
    ([source], next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        if (window.frameElement) {
          const { tree } = resolveSource(
            window.frameElement as HTMLElement,
            true,
          );
          source.tree.push(...tree);
        }

        postMessage(
          TREE_OPEN_CROSS_IFRAME,
          [source],
          isTopWindow ? topWindow : window.parent,
        );
      } else {
        next();
      }
    },
  ],
});
