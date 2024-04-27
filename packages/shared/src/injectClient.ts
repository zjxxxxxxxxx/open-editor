export function injectClient(code: string, opts: AnyObject) {
  return `
import { setupClient } from '@open-editor/client';
${code}
if (typeof window !== 'undefined') {
  setupClient(${JSON.stringify(opts)});
};
  `;
}
