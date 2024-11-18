import { bridge } from '../utils/bridge';
import { isTopWindow, topWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import {
  type BoxLines,
  type BoxRect,
  getBoxModel,
} from '../inspector/getBoxModel';
import { BOX_MODEL_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const boxModelBridge = bridge<[BoxRect, BoxLines]>({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage<[BoxRect, BoxLines]>(BOX_MODEL_CROSS_IFRAME, (args) => {
        boxModelBridge.emit(args, isTopWindow);
      });
    }
  },
  emitMiddlewares: [
    ([rect, lines], next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
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

        postMessage(
          BOX_MODEL_CROSS_IFRAME,
          [rect, lines],
          isTopWindow ? topWindow : window.parent,
        );
      } else {
        next();
      }
    },
  ],
});
