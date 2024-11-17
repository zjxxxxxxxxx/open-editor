import { mitt } from '../utils/mitt';
import type { SourceCode } from '../resolve';
import { decodeMessage, encodeMessage, isMessage } from '../utils/message';
import { SOURCE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';
import { on } from '../event';

export const sourceBridge = mitt<[SourceCode | undefined]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      on('message', (e) => {
        if (isMessage(SOURCE_CROSS_IFRAME, e.data)) {
          const args = decodeMessage(SOURCE_CROSS_IFRAME, e.data);
          sourceBridge.emit(args, true);
        }
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        const message = encodeMessage(SOURCE_CROSS_IFRAME, args);
        window.top?.postMessage(message);
      } else {
        next();
      }
    },
  ],
});
