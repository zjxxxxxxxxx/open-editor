import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { ServerApis } from '@open-editor/shared';
import { createRuntime, isDev } from '@open-editor/shared/node';
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
    displayToggle = true,
    onOpenEditor,
  } = options;

  const RUNTIME_PUBLIC_PATH = '/@open-editor/client';

  const runtime = createRuntime(import.meta.url);
  runtime.generate({
    rootDir,
    displayToggle,
  });

  return {
    name: 'vite:open-editor',
    apply: 'serve',

    config: () => ({
      optimizeDeps: {
        exclude: [runtime.filename],
      },
      resolve: {
        dedupe: [runtime.filename],
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
    resolveId(id) {
      if (id === RUNTIME_PUBLIC_PATH) {
        return runtime.filename;
      }
    },
    load(id) {
      if (id === runtime.filename) {
        return readFileSync(runtime.filename, 'utf-8');
      }
    },
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: RUNTIME_PUBLIC_PATH,
            },
            injectTo: 'head',
          },
        ],
      };
    },
  };
}
