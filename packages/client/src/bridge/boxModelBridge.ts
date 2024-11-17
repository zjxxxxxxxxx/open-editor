import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import { getDOMRect } from '../utils/getDOMRect';
import type { BoxLines, BoxRect } from '../inspector/getBoxModel';
import {
  BOX_MODEL_CROSS_IFRAME,
  IS_CROSS_ORIGIN,
  IS_TOP_WINDOW,
} from '../constants';
import { getOptions } from '../options';

export const boxModelBridge = mitt<[BoxRect, BoxLines]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_CROSS_ORIGIN) {
      onMessage<[BoxRect, BoxLines]>(BOX_MODEL_CROSS_IFRAME, (args) => {
        boxModelBridge.emit(args, IS_TOP_WINDOW);
      });
    }
  },
  emitMiddlewares: [
    ([rect, lines], next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_CROSS_ORIGIN && !formTopWindow) {
        if (window.frameElement) {
          const { top, left } = getDOMRect(window.frameElement as HTMLElement);
          rect.top += top;
          rect.right = rect.left + rect.width;
          rect.bottom = rect.top + rect.height;
          rect.left += left;
        }
        postMessage(BOX_MODEL_CROSS_IFRAME, [rect, lines], window.parent);
      } else {
        next();
      }
    },
  ],
});
