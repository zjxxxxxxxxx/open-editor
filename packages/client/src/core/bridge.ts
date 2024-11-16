import { mitt } from '../utils/mitt';
import type { SourceCode, SourceCodeMeta } from '../resolve';
import type { BoxLines, BoxRect } from './getBoxModel';

export const enableBridge = mitt();
export const exitBridge = mitt();
export const sourceBridge = mitt<[SourceCode | undefined]>();
export const boxModelBridge = mitt<[BoxRect, BoxLines]>();
export const openTreeBridge = mitt<[SourceCode]>();
export const closeTreeBridge = mitt();
export const openEditorBridge = mitt<[SourceCodeMeta | undefined]>();
export const openEditorErrorBridge = mitt();
