import type { Plugin, ResolvedConfig } from 'vite';
import { join } from 'node:path';
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

  const clientId = 'virtual:@open-editor/vite/client';
  const runtime = createRuntime(import.meta.url);

  let resolvedConfig: ResolvedConfig;

  return {
    name: 'vite:open-editor',
    apply: 'serve',

    buildStart() {
      runtime.generate({
        rootDir,
        displayToggle,
      });
    },

    configResolved(config) {
      resolvedConfig = config;
    },

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
      if (id === join(resolvedConfig.base, clientId)) {
        return `import('${runtime.filename}');`;
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
              async: 'true',
              fetchpriority: 'low',
              src: join(resolvedConfig.base, clientId),
            },
            injectTo: 'head',
          },
        ],
      };
    },
  };
}
