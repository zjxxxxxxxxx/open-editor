import type webpack from 'webpack';
import { isDev, resolvePath } from '@open-editor/shared/node';
import { setupServer } from '@open-editor/server';

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

const PLUGIN_NAME = 'OpenEditorPlugin';
const LOADER_PATH = resolvePath('./transform', import.meta.url);

/**
 * development only
 */
export default class OpenEditorPlugin {
  private declare options: Options & { port?: number };
  private declare compiler: webpack.Compiler;
  private declare entries: string[];
  private declare entryRE: RegExp;
  private declare beforeSlashRE: RegExp;
  private declare nodeModuleRE: RegExp;
  private declare fileNameRE: RegExp;

  constructor(options: Options = {}) {
    const { rootDir = options.rootDir ?? process.cwd(), onOpenEditor } =
      options;
    this.options = {
      ...options,
      rootDir,
      onOpenEditor,
    };
    this.entries = [];
    this.beforeSlashRE = /^\/+/;
    this.nodeModuleRE = /node_modules/;
    this.fileNameRE = /([^.]*)\.[tj]sx?$/;
    this.setEntry = this.setEntry.bind(this);
  }

  apply(compiler: webpack.Compiler) {
    if (!isDev()) return;

    this.compiler = compiler;
    this.setPort();
    this.addRules();
    this.addEntry();
  }

  setPort() {
    this.compiler.hooks.make.tapPromise(PLUGIN_NAME, async () => {
      setupPortPromise(this.options);
      const port = await getPortPromise(this.options);
      this.options = {
        ...this.options,
        port,
      };
    });
  }

  addRules() {
    this.compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      this.compiler.options.module.rules.unshift({
        test: this.fileNameRE,
        exclude: this.nodeModuleRE,
        use: ({ resource }: AnyObject) => {
          if (resource && this.entryRE.test(resource)) {
            return {
              options: this.options,
              loader: LOADER_PATH,
            };
          }
          return [];
        },
      });
      this.compiler.options.module.rules.unshift({
        test: /\.mjs$/,
        type: 'javascript/auto',
        include: /open-editor/,
      });
    });
  }

  addEntry() {
    this.compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.addEntry.tap(PLUGIN_NAME, this.setEntry);
    });
  }

  setEntry({ request }: AnyObject, { name }: webpack.EntryOptions) {
    if (name && !this.nodeModuleRE.test(request)) {
      const entry = this.ensureEntry(request, name);
      if (!this.entries.includes(entry)) {
        this.entries.push(entry);
        this.entryRE = new RegExp(`(${this.entries.join('|')})(\\.[jt]sx?)?$`);
      }
    }
  }

  ensureEntry(request: string, name: string) {
    const [baseRequest] = request.split('?');
    const entry = this.fileNameRE.test(request)
      ? baseRequest
          .replace(this.compiler.context, '')
          .match(this.fileNameRE)![1]
      : name;

    return `/${entry.replace(this.beforeSlashRE, '')}`;
  }
}

// because many scaffolding tools rewrite the devServer part, it is impossible to add
// middleware, so it has to start another server to handle the client side request.
const portPromiseCache: AnyObject<Promise<number>> = {};
function setupPortPromise(opts: Options) {
  portPromiseCache[cacheKey(opts)] ||= setupServer(opts);
}
function getPortPromise(opts: Options) {
  return portPromiseCache[cacheKey(opts)];
}
function cacheKey(opts: Options) {
  return `${opts.rootDir}${opts.onOpenEditor}`;
}
