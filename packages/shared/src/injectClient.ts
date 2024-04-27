export function injectClient(code: string, { sync, ...options }: AnyObject) {
  if (sync) {
    return `
      import { setupClient } from '@open-editor/client';
      ${code}
      if (typeof window !== 'undefined') {
          setupClient(${JSON.stringify(options)});
      };
    `;
  }
  return `
    ${code}
    if (typeof window !== 'undefined') {
      import('@open-editor/client').then(({ setupClient }) => setupClient(${JSON.stringify(
        options,
      )}));
    }
  `;
}
