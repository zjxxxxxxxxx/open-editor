const useStrictRE = /^['"]use strict['"];?/;
export function injectClient(code: string, opts: AnyObject) {
  return (
    (useStrictRE.test(code) ? '"use strict";' : '') +
    'import { setupClient } from "@open-editor/client";' +
    code.replace(useStrictRE, '') +
    ';if(typeof window !== "undefined"){ setupClient(' +
    JSON.stringify(opts) +
    ')};'
  );
}
