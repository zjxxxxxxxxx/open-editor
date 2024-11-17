import { mitt } from '../utils/mitt';
import { decodeMessage, encodeMessage, isMessage } from '../utils/message';
import { getDOMRect } from '../utils/getDOMRect';
import type { BoxLines, BoxRect } from '../core/getBoxModel';
import { BOX_MODEL_CROSS_IFRAME, IS_TOP_WINDOW } from '../constants';
import { getOptions } from '../options';
import { on } from '../event';

export const boxModelBridge = mitt<[BoxRect, BoxLines]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      on('message', (e) => {
        if (isMessage(BOX_MODEL_CROSS_IFRAME, e.data)) {
          const args = decodeMessage(BOX_MODEL_CROSS_IFRAME, e.data);
          boxModelBridge.emit(args, IS_TOP_WINDOW);
        }
      });
    }
  },
  emitMiddlewares: [
    ([rect, lines], next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        if (window.frameElement) {
          const { top, left } = getDOMRect(window.frameElement as HTMLElement);
          rect.top += top;
          rect.right = rect.left + rect.width;
          rect.bottom = rect.top + rect.height;
          rect.left += left;
        }
        const message = encodeMessage(BOX_MODEL_CROSS_IFRAME, [rect, lines]);
        window.parent.postMessage(message);
      } else {
        next();
      }
    },
  ],
});
