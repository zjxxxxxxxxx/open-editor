import type { Plugin } from 'vite';
import { ServerApis } from '@open-editor/shared';
import { createRuntime } from '@open-editor/shared/node';
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
   * @default false
   */
  displayToggle?: boolean;

  /**
   * custom openEditor handler
   */
  onOpenEditor?(file: string): void;
}

export default function openEditorPlugin(options: Options = {}): Plugin {
  const {
    rootDir = process.cwd(),
    displayToggle = false,
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
