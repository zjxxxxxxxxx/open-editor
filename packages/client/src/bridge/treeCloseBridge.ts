import { bridge } from '../utils/bridge';
import { topWindow } from '../utils/topWindow';
import { onMessage, postMessage } from '../utils/message';
import { TREE_CLOSE_CROSS_IFRAME } from '../constants';
import { getOptions } from '../options';

export const treeCloseBridge = bridge({
  setup() {
    const { crossIframe } = getOptions();
    if (crossIframe) {
      onMessage(TREE_CLOSE_CROSS_IFRAME, (args) => {
        treeCloseBridge.emit(args, true);
      });
    }
  },
  emitMiddlewares: [
    (_, next, formTopWindow) => {
      const { crossIframe } = getOptions();
      if (crossIframe && !formTopWindow) {
        postMessage(TREE_CLOSE_CROSS_IFRAME, [], topWindow);
      } else {
        next();
      }
    },
  ],
});
