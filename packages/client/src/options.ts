import { logError } from './utils/logError';

export interface Options {
  /**
   * source rootDir path
   */
  rootDir: string;
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
   * internal server port
   *
   * relative address is used when this parameter is empty
   */
  port?: string;
}

let opts: Options;

export function setOptions(
  userOpts: Partial<Options> & Pick<Options, 'rootDir'>,
) {
  opts = {
    ...userOpts,
    displayToggle: userOpts.displayToggle ?? true,
    colorMode: userOpts.colorMode ?? 'system',
    disableHoverCSS: userOpts.disableHoverCSS ?? true,
    retainFrame: userOpts.retainFrame ?? true,
    ignoreComponents: userOpts.ignoreComponents ?? '/node_modules/**/*',
    once: userOpts.once ?? true,
  };
}

export function getOptions() {
  if (!opts) {
    logError('options missing', 'throw');
  }
  return opts;
}
