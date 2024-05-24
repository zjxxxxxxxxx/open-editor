import { resolve } from 'node:path';
import { type Plugin } from 'rollup';
import { isDev } from '@open-editor/shared/node';
import { injectClient, isObj, isStr } from '@open-editor/shared';
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
   * set UI color mode
   *
   * @default 'system'
   */
  colorMode?: 'system' | 'light' | 'dark';
  /**
   * Disable hover effect from CSS when inspector is enabled
   *
   * @default true
   */
  disableHoverCSS?: boolean;
  /**
   * The inspector remains rendered when the browser is idle
   *
   * @default true
   */
  retainFrame?: boolean;
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * custom openEditor handler
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

// because many scaffolding tools rewrite the devServer part, it is impossible to add
// middleware, so it has to start another server to handle the client side request.
const portPromiseCache: AnyObject<Promise<number>> = {};

/**
 * development only
 */
export default function OpenEditorPlugin(
  options: Options = {},
): Plugin | undefined {
  if (!isDev()) return;

  const { onOpenEditor } = options;
  const rootDir = options.rootDir ? resolve(options.rootDir) : process.cwd();

  const include = new Set<string>();

  let port: number;

  return {
    name: 'OpenEditorPlugin',
    options({ input }) {
      if (input) {
        const entries = isStr(input)
          ? [input]
          : isObj(input)
            ? Object.values(input)
            : input;
        for (const entry of entries) {
          include.add(resolve(entry));
        }
      }
    },
    async buildStart() {
      const cacheKey = `${rootDir}${onOpenEditor}`;
      port = await (portPromiseCache[cacheKey] ||= setupServer({
        rootDir,
        onOpenEditor,
      }));
    },
    transform(code, id) {
      if (include.has(id)) {
        return injectClient(code, {
          ...options,
          rootDir,
          port,
        });
      }
    },
  };
}
