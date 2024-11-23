import { crossIframeBridge } from '../utils/crossIframeBridge';
import { isTopWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { type BoxLines, type BoxRect, getBoxModel } from '../inspector/getBoxModel';
import { BOX_MODEL_CROSS_IFRAME } from '../constants';

export const boxModelBridge = crossIframeBridge<[BoxRect, BoxLines]>({
  setup() {
    onMessage<[BoxRect, BoxLines]>(BOX_MODEL_CROSS_IFRAME, (args) => {
      boxModelBridge.emit(args, isTopWindow);
    });
  },
  emitMiddlewares: [
    ([rect], next) => {
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

      next();
    },
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(BOX_MODEL_CROSS_IFRAME, args, window.parent);
      });
    },
  ],
});
