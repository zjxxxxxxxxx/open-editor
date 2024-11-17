import { mitt } from '../utils/mitt';
import type { SourceCodeMeta } from '../resolve';

export const openEditorBridge = mitt<[SourceCodeMeta | undefined]>();
