import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import type { SourceCode } from '../resolve';
import { SOURCE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const sourceBridge = bridge<[SourceCode | undefined]>({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage<[SourceCode | undefined]>(SOURCE_CROSS_IFRAME, (args) => {
        sourceBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(SOURCE_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
