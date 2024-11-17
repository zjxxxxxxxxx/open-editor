import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { resolveSource, type SourceCode } from '../resolve';
import {
  IS_SAME_ORIGIN,
  IS_TOP_WINDOW,
  OPEN_TREE_CROSS_IFRAME,
} from '../constants';
import { getOptions } from '../options';

export const openTreeBridge = mitt<[SourceCode]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_SAME_ORIGIN) {
      onMessage<[SourceCode]>(OPEN_TREE_CROSS_IFRAME, (args) => {
        openTreeBridge.emit(args, IS_TOP_WINDOW);
      });
    }
  },
  emitMiddlewares: [
    ([source], next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_SAME_ORIGIN && !formTopWindow) {
        if (window.frameElement) {
          const { tree } = resolveSource(
            window.frameElement as HTMLElement,
            true,
          );
          source.tree.push(...tree);
        }
        postMessage(OPEN_TREE_CROSS_IFRAME, [source], window.parent);
      } else {
        next();
      }
    },
  ],
});
