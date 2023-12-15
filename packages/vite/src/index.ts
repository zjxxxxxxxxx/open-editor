import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { ServerApis } from '@open-editor/shared';
import { createClient, isDev } from '@open-editor/shared/node';
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
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;

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
  if (!isDev()) return;

  const {
    rootDir = process.cwd(),
    displayToggle,
    colorMode,
    once,
    onOpenEditor,
  } = options;

  const VITE_CLIENT_PATH = '/vite/dist/client/client.mjs';

  const client = createClient(import.meta.url);
  client.generate(
    {
      rootDir,
      displayToggle,
      colorMode,
      once,
    },
    true,
  );

  return {
    name: 'vite:open-editor',
    apply: 'serve',

    config: () => ({
      optimizeDeps: {
        exclude: [client.filename],
      },
      resolve: {
        dedupe: [client.filename],
      },
    }),
    configureServer(server) {
      server.middlewares.use(
        ServerApis.OPEN_EDITOR,
        openEditorMiddleware({
          rootDir,
          onOpenEditor,
        }),
      );
    },
    load(id) {
      if (id === client.filename) {
        return readFileSync(client.filename, 'utf-8');
      }
    },
    transform(code, id) {
      if (id.endsWith(VITE_CLIENT_PATH)) {
        return `import '${client.filename}';\n${code}`;
      }
    },
  };
}
