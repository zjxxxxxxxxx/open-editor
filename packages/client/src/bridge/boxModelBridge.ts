import { mitt } from '../utils/mitt';
import { onMessage, postMessage } from '../utils/message';
import {
  type BoxLines,
  type BoxRect,
  getBoxModel,
} from '../inspector/getBoxModel';
import {
  BOX_MODEL_CROSS_IFRAME,
  IS_SAME_ORIGIN,
  IS_TOP_WINDOW,
} from '../constants';
import { getOptions } from '../options';

export const boxModelBridge = mitt<[BoxRect, BoxLines]>({
  onBefore() {
    const { crossIframe } = getOptions();
    if (crossIframe && IS_SAME_ORIGIN) {
      onMessage<[BoxRect, BoxLines]>(BOX_MODEL_CROSS_IFRAME, (args) => {
        boxModelBridge.emit(args, IS_TOP_WINDOW);
      });
    }
  },
  emitMiddlewares: [
    ([rect, lines], next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && IS_SAME_ORIGIN && !formTopWindow) {
        if (window.frameElement) {
          const [position, { margin, border, padding }] = getBoxModel(
            window.frameElement as HTMLElement,
          );
          const frameDifference = [position, margin, border, padding];
          for (const { top, left } of frameDifference) {
            rect.top += top;
            rect.left += left;
          }
          rect.bottom = rect.top + rect.height;
          rect.right = rect.left + rect.width;
        }
        postMessage(BOX_MODEL_CROSS_IFRAME, [rect, lines], window.parent);
      } else {
        next();
      }
    },
  ],
});
