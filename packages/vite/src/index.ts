import type { Plugin, ResolvedConfig } from 'vite';
import { join } from 'node:path';
import { openEditorMiddleware } from '@open-editor/server';
import { ServerApis } from '@open-editor/shared';
import {
  clientRuntimeFilename,
  generateClientRuntime,
} from './generateClientRuntime';

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

  let resolvedConfig: ResolvedConfig;

  return {
    name: 'vite:open-editor',
    apply: 'serve',

    buildStart() {
      generateClientRuntime({
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
        return clientRuntimeFilename;
      }
    },

    transform(code, id) {
      if (id.includes('/entry')) {
        return `import '${clientRuntimeFilename}';\n${code}`;
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
