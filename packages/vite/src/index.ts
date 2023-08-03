import type { Plugin, ResolvedConfig } from 'vite';
import { join } from 'node:path';
import { openEditorMiddleware } from '@open-editor/server';
import { ServerApis } from '@open-editor/shared';
import { createRuntime } from '@open-editor/shared/node';

export interface Options {
  /**
   * render the pointer into the browser
   *
   * @default false
   */
  enablePointer?: boolean;

  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;
}

export default function openEditorPlugin(options: Options = {}): Plugin {
  const { enablePointer = false, rootDir = process.cwd() } = options;

  const clientId = 'virtual:@open-editor/vite/client';
  const runtime = createRuntime(import.meta.url);

  let resolvedConfig: ResolvedConfig;

  return {
    name: 'vite:open-editor',
    apply: 'serve',

    buildStart() {
      runtime.generate({
        enablePointer,
        rootDir,
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
        }),
      );
    },

    load(id) {
      if (id === join(resolvedConfig.base, clientId)) {
        return `import('${runtime.filename}');`;
      }
    },

    transform(code, id) {
      if (id.includes('/entry')) {
        return `import('${runtime.filename}');\n${code}`;
      }

      return code;
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
