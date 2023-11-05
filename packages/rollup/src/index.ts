import type { Plugin } from 'rollup';
import { resolve } from 'node:path';
import { createRuntime } from '@open-editor/shared/node';
import { isObj, isStr } from '@open-editor/shared';
import { setupServer } from '@open-editor/server';

export interface Options {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;

  /**
   * render the toggle into the browser
   *
   * @default true
   */
  displayToggle?: boolean;

  /**
   * custom openEditor handler
   */
  onOpenEditor?(file: string): void;
}

/**
 * development only
 */
export default function openEditorPlugin(
  options: Options = {},
): Plugin | undefined {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const {
    rootDir = process.cwd(),
    displayToggle = true,
    onOpenEditor,
  } = options;

  const runtime = createRuntime(import.meta.url);
  const include = new Set<string>();

  return {
    name: 'open-editor',

    options({ input }) {
      if (input) {
        // 'a' => ['a']
        // ['a', 'b'] => ['a', 'b']
        // { app: 'a', bpp: 'b' } => ['a', 'b']
        const entrys = isStr(input)
          ? [input]
          : isObj(input)
          ? Object.values(input)
          : input;
        for (const entry of entrys) {
          include.add(resolve(entry));
        }
      }
    },
    async buildStart() {
      const port = await getServerPort({
        rootDir,
        onOpenEditor,
      });
      runtime.generate({
        port,
        rootDir,
        displayToggle,
      });
    },
    transform(code, id) {
      if (include.has(id)) {
        return `import '${runtime.filename}';\n${code}`;
      }
    },
  };
}

let port: Promise<number>;
function getServerPort(options: {
  rootDir?: string;
  onOpenEditor?(file: string): void;
}) {
  return (port ||= setupServer(options));
}
