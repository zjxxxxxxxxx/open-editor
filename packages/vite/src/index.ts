import { resolve } from 'node:path';
import type { ViteDevServer } from 'vite';
import { ServerApis, injectClient } from '@open-editor/shared';
import { openEditorMiddleware } from '@open-editor/server';

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

const CLIENT_PATH = '/client.mjs';

/**
 * development only
 */
export default function OpenEditorPlugin(options: Options = {}) {
  const { onOpenEditor } = options;
  const rootDir = options.rootDir ? resolve(options.rootDir) : process.cwd();

  return {
    name: 'OpenEditorPlugin',
    apply: <const>'serve',
    configureServer(server: Pick<ViteDevServer, 'middlewares'>) {
      server.middlewares.use(
        ServerApis.OPEN_EDITOR,
        openEditorMiddleware({
          rootDir,
          onOpenEditor,
        }),
      );
    },
    transform(code: string, id: string) {
      if (id.endsWith(CLIENT_PATH)) {
        return injectClient(code, {
          ...options,
          rootDir,
        });
      }
    },
  };
}
