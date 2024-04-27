import { type Plugin } from 'rollup';
import { resolve } from 'node:path';
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
   * @default false
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

/**
 * development only
 */
export default function openEditorPlugin(
  options: Options = {},
): Plugin | undefined {
  if (!isDev()) return;

  const { rootDir = process.cwd(), onOpenEditor } = options;
  const include = new Set<string>();

  let port: number;

  return {
    name: 'rollup:open-editor',
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
      port = await getServerPort({
        rootDir,
        onOpenEditor,
      });
    },
    transform(code, id) {
      if (include.has(id)) {
        return injectClient(code, {
          ...options,
          rootDir,
          port,
          sync: true,
        });
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
