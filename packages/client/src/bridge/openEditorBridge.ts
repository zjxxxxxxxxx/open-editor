import { bridge } from '../utils/bridge';
import type { SourceCodeMeta } from '../resolve';

export const openEditorBridge = bridge<[SourceCodeMeta | undefined]>();
