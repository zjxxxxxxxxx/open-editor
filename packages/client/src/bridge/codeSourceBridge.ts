import { crossIframeBridge } from '../utils/crossIframeBridge';
import { topWindow, whenTopWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { inspectorState } from '../inspector/inspectorState';
import { type CodeSource } from '../resolve';
import { CODE_SOURCE_CROSS_IFRAME } from '../constants';

export const codeSourceBridge = crossIframeBridge<[CodeSource | undefined]>({
  setup() {
    onMessage<[CodeSource | undefined]>(CODE_SOURCE_CROSS_IFRAME, (args) => {
      if (inspectorState.isEnable) {
        codeSourceBridge.emit(args, true);
      }
    });
  },
  emitMiddlewares: [
    (args, next) => {
      whenTopWindow(next, () => {
        postMessage(CODE_SOURCE_CROSS_IFRAME, args, topWindow);
      });
    },
  ],
});
