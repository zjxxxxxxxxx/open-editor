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
   * Ignoring components in some directories, using glob pattern syntax for matching
   *
   * @see https://en.wikipedia.org/wiki/Glob_(programming)
   *
   * @default '\/node_modules\/**\/*'
   */
  ignoreComponents?: string | string[];
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * Internal server configuration
   */
  server?: {
    /**
     * enable https
     *
     * @see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
     */
    https?: {
      key: string;
      cert: string;
    };
  };
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

const beforeSlashRE = /^\/+/;
const nodeModuleRE = /\/node_modules\//;
const fileNameRE = /([^.]*)\.[cm]?[tj]sx?$/;

/**
 * development only
 */
export default class OpenEditorPlugin {
  private declare options: Options & { port?: number };
  private declare compiler: webpack.Compiler;
  private declare entries: string[];
  private declare entryRE: RegExp;

  constructor(options: Options = {}) {
    const { rootDir = options.rootDir ?? process.cwd(), onOpenEditor } =
      options;
    this.options = {
      ...options,
      rootDir,
      onOpenEditor,
    };
    this.entries = [];
    this.setEntry('nuxt/dist/(client|app)/entry');

    this.addEntry = this.addEntry.bind(this);
    this.ensureEntry = this.ensureEntry.bind(this);
    this.setEntry = this.setEntry.bind(this);
  }

  apply(compiler: webpack.Compiler) {
    if (!isDev()) return;

    this.compiler = compiler;
    this.setupEntry();
    this.setupRules();
    this.setupServer();
  }

  setupEntry() {
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
    if (name && request && !nodeModuleRE.test(request)) {
      const entry = this.ensureEntry(request, name);
      this.setEntry(entry);
    }
  }

  ensureEntry(request: string, name: string) {
    const [baseRequest] = request.split('?');
    const entry = fileNameRE.test(baseRequest)
      ? baseRequest.replace(this.compiler.context, '').match(fileNameRE)![1]
      : name;

    return `/${entry.replace(beforeSlashRE, '')}`;
  }

  setEntry(entry: string) {
    if (!this.entries.includes(entry)) {
      this.entries.push(entry);
      this.entryRE = new RegExp(`(${this.entries.join('|')})\\.[cm]?[jt]sx?$`);
    }
  }

  setupRules() {
    this.compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
      this.compiler.options.module.rules.push({
        test: fileNameRE,
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

  setupServer() {
    this.compiler.hooks.make.tapPromise(PLUGIN_NAME, async () => {
      const cacheKey = `${this.options.rootDir}${this.options.onOpenEditor}`;
      this.options.port = await (portPromiseCache[cacheKey] ||= setupServer({
        ...this.options,
        ...(this.options.server ?? {}),
      }));
    });
  }
}
