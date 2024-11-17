import { resolve } from 'node:path';
import type { ViteDevServer } from 'vite';
import {
  CLIENT_MODULE_ID,
  ServerApis,
  injectClient,
  normalizePath,
} from '@open-editor/shared';
import { isDev, resolvePath } from '@open-editor/shared/node';
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
   * Disable hover effect from CSS when inspector is enabled
   *
   * @default true
   */
  disableHoverCSS?: boolean;
  /**
   * Ignoring components in some directories, using glob pattern syntax for matching
   *
   * @see https://en.wikipedia.org/wiki/Glob_(programming)
   *
   * @default '\/**\/node_modules\/**\/*'
   */
  ignoreComponents?: string | string[];
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * Enable interaction between multiple iframes to be promoted to the top-level window.
   *
   * It only takes effect when the top window and iframe window have the same origin.
   *
   * @default false
   */
  crossIframe?: boolean;
  /**
   * custom openEditor handler
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

const CLIENT_ID = '/client.mjs';

/**
 * development only
 */
export default function OpenEditorPlugin(options: Options = {}) {
  if (!isDev()) {
    return {
      name: 'OpenEditorPlugin',
    };
  }

  const { onOpenEditor } = options;
  const rootDir = normalizePath(
    options.rootDir ? resolve(options.rootDir) : process.cwd(),
  );

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
    resolveId(id) {
      if (id === CLIENT_MODULE_ID) {
        return resolvePath(CLIENT_MODULE_ID, import.meta.url).replace(
          /\.js$/,
          '.mjs',
        );
      }
    },
    transform(code: string, id: string) {
      if (id.endsWith(CLIENT_ID)) {
        return injectClient(code, {
          ...options,
          rootDir,
        });
      }
    },
  };
}
