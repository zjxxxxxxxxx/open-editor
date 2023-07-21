import type webpack from 'webpack';
import qs from 'querystring';
import { setupServer } from '@open-editor/server';

export interface OpenEditorPluginOptions {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * render the pointer into the browser
   */
  enablePointer?: boolean;
}

export class OpenEditorPlugin {
  opts: OpenEditorPluginOptions;

  constructor(options: OpenEditorPluginOptions = {}) {
    this.opts = options;
  }

  apply(compiler: webpack.Compiler) {
    if (
      compiler.options.mode !== 'development' ||
      (process.env.NODE_ENV && process.env.NODE_ENV !== 'development')
    ) {
      return;
    }

    const { rootDir, enablePointer } = this.opts;
    const { EntryPlugin } = compiler.webpack;

    function addEntry(port: number) {
      const query = qs.stringify({
        enablePointer,
        port,
      });
      const entry =
        require.resolve('@open-editor/client-runtime') + `?${query}`;
      new EntryPlugin(compiler.context, entry, { name: undefined }).apply(
        compiler,
      );
    }

    setupServer({ rootDir }).then(addEntry);
  }
}
