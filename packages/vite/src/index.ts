import { Plugin } from 'vite';
import { openEditorMiddleware } from '@open-editor/server';
import { ServerApis } from '@open-editor/shared';

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

const pluginId = '@open-editor/vite';
const clientId = `${pluginId}/client` as const;
const clientRuntimeId = `${pluginId}/client-runtime` as const;
const clientRuntimeCode = `import('${clientId}').then(({ setupClient }) => {
  setupClient(__OPTIONS__);
})` as const;

export default function openEditorPlugin(options: Options = {}): Plugin {
  const { enablePointer = false, rootDir = process.cwd() } = options;

  let base = '/';

  return {
    name: 'vite:open-editor',
    apply: 'serve',

    configResolved(config) {
      base = config.base;
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
      if (id === `${base}${clientRuntimeId}`) {
        return clientRuntimeCode.replace(
          '__OPTIONS__',
          JSON.stringify({
            enablePointer,
            rootDir,
          }),
        );
      }
    },

    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              async: 'true',
              src: `${base}${clientRuntimeId}`,
              fetchpriority: 'low',
            },
            injectTo: 'head',
          },
        ],
      };
    },
  };
}
