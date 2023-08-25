import type { Plugin } from 'rollup';
import { resolve } from 'node:path';
import { createRuntime } from '@open-editor/shared/node';
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
   * @default false
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
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
    return;
  }

  const {
    rootDir = process.cwd(),
    displayToggle = false,
    onOpenEditor,
  } = options;

  const runtime = createRuntime(import.meta.url);
  const include: string[] = [];

  return {
    name: 'open-editor',

    options(options) {
      // 'a' => ['a']
      // ['a', 'b'] => ['a', 'b']
      // { app: 'a', bpp: 'b' } => ['a', 'b']
      const input = <string[]>[].concat(<never>(options.input || 'index.js'));
      for (const path of Object.values(input)) {
        include.push(resolve(path));
      }
    },
    outputOptions(options) {
      options.inlineDynamicImports = true;
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
      if (include.includes(id)) {
        return `import('${runtime.filename}');\n${code}`;
      }
      return code;
    },
  };
}

let port: Promise<number>;
function getServerPort(options: {
  rootDir?: string;
  onOpenEditor?(file: string): void;
}) {
  if (!port) {
    port = setupServer(options);
  }
  return port;
}
