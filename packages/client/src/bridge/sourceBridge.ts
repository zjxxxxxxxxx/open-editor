import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import type { SourceCode } from '../resolve';
import { IS_CROSS_ORIGIN, SOURCE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const sourceBridge = mitt<[SourceCode | undefined]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_CROSS_ORIGIN) {
      onMessage<[SourceCode | undefined]>(SOURCE_CROSS_IFRAME, (args) => {
        sourceBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_CROSS_ORIGIN && !formTopWindow) {
        postMessage(SOURCE_CROSS_IFRAME, args, window.top);
      } else {
        next();
      }
    },
  ],
});
