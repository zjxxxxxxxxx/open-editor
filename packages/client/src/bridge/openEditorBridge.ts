import { bridge } from '../utils/bridge';
import { type CodeSourceMeta } from '../resolve';

export const openEditorBridge = bridge<[CodeSourceMeta | undefined]>();
