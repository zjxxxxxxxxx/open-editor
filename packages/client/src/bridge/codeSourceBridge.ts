import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import type { CodeSource } from '../resolve';
import { CODE_SOURCE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const codeSourceBridge = bridge<[CodeSource | undefined]>({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage<[CodeSource | undefined]>(CODE_SOURCE_CROSS_IFRAME, (args) => {
        codeSourceBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (args, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(CODE_SOURCE_CROSS_IFRAME, args, topWindow);
      } else {
        next();
      }
    },
  ],
});
