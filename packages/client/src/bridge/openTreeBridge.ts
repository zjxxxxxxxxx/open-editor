import { mitt } from '../utils/mitt';
import { decodeMessage, encodeMessage, isMessage } from '../utils/message';
import type { SourceCode } from '../resolve';
import { OPEN_TREE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';
import { on } from '../event';

export const openTreeBridge = mitt<[SourceCode]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      on('message', (e) => {
        if (isMessage(OPEN_TREE_CROSS_IFRAME, e.data)) {
          const args = decodeMessage(OPEN_TREE_CROSS_IFRAME, e.data);
          openTreeBridge.emit(args, true);
        }
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        const message = encodeMessage(OPEN_TREE_CROSS_IFRAME, args);
        window.top?.postMessage(message);
      } else {
        next();
      }
    },
  ],
});
