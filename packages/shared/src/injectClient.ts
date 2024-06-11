const useStrictRE = /^['"]use strict['"];?/;
export function injectClient(code: string, userOpts: AnyObject) {
  const { isCommonjs, ...opts } = userOpts;
  return (
    (useStrictRE.test(code) ? '"use strict";\n' : '') +
    (isCommonjs
      ? 'const { setupClient } = require("@open-editor/client");\n'
      : 'import { setupClient } from "@open-editor/client";\n') +
    code.replace(useStrictRE, '') +
    '\nif(typeof window !== "undefined"){setupClient(' +
    JSON.stringify(opts) +
    ')};\n'
  );
}
