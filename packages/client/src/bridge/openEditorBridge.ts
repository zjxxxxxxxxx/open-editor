import { crossIframeBridge } from '../utils/crossIframeBridge';
import { type CodeSourceMeta } from '../resolve';

export const openEditorBridge =
  crossIframeBridge<[CodeSourceMeta | undefined]>();
