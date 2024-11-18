import { mitt } from '../utils/mitt';
import { isTopWindow, topWindow } from '../utils/getTopWindow';
import { onMessage, postMessage } from '../utils/message';
import { resolveSource, type SourceCode } from '../resolve';
import { OPEN_TREE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const openTreeBridge = mitt<[SourceCode]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage<[SourceCode]>(OPEN_TREE_CROSS_IFRAME, (args) => {
        openTreeBridge.emit(args, isTopWindow);
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
          OPEN_TREE_CROSS_IFRAME,
          [source],
          isTopWindow ? topWindow : window.parent,
        );
      } else {
        next();
      }
    },
  ],
});
