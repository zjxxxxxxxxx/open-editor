import type webpack from 'webpack';
import { isDev, resolvePath } from '@open-editor/shared/node';
import { isArr, isObj } from '@open-editor/shared';
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

const portPromiseCache: AnyObject<Promise<number>> = {};

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
    this.fileNameRE = /([^.]*)\.[cm]?[tj]sx?$/;
    this.addEntry = this.addEntry.bind(this);
    this.ensureEntry = this.ensureEntry.bind(this);
    this.setEntry = this.setEntry.bind(this);
  }

  apply(compiler: webpack.Compiler) {
    if (!isDev()) return;

    this.compiler = compiler;
    this.setupServer();
    this.setupRules();
    this.setupEntry();
  }

  setupServer() {
    this.compiler.hooks.make.tapPromise(PLUGIN_NAME, async () => {
      const cacheKey = `${this.options.rootDir}${this.options.onOpenEditor}`;
      this.options.port = await (portPromiseCache[cacheKey] ||= setupServer(
        this.options,
      ));
    });
  }

  setupRules() {
    this.compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      this.compiler.options.module.rules.push({
        test: this.fileNameRE,
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
      this.compiler.options.module.rules.push({
        test: /node_modules\/@open-editor\//,
        type: 'javascript/auto',
      });
    });
  }

  setupEntry() {
    const nuxtEntry = 'nuxt/dist/(client|app)/entry';
    this.setEntry(nuxtEntry);
    this.compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.addEntry.tap(PLUGIN_NAME, this.addEntry);
    });
  }

  addEntry(
    dep: webpack.Dependency & AnyObject,
    opts?: webpack.EntryOptions | string,
  ) {
    const { request, dependencies } = dep;

    // webpack4 MultiEntryDependency
    if (isArr(dependencies)) {
      dependencies.forEach((dep) => this.addEntry(dep, opts));

      return;
    }

    const name = isObj<webpack.EntryOptions>(opts) ? opts.name : opts;
    if (name && request && !this.nodeModuleRE.test(request)) {
      const entry = this.ensureEntry(request, name);
      this.setEntry(entry);
    }
  }

  ensureEntry(request: string, name: string) {
    const [baseRequest] = request.split('?');
    const entry = this.fileNameRE.test(baseRequest)
      ? baseRequest
          .replace(this.compiler.context, '')
          .match(this.fileNameRE)![1]
      : name;

    return `/${entry.replace(this.beforeSlashRE, '')}`;
  }

  setEntry(entry: string) {
    if (!this.entries.includes(entry)) {
      this.entries.push(entry);
      this.entryRE = new RegExp(`(${this.entries.join('|')})\\.[cm]?[jt]sx?$`);
    }
  }
}
