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
   * Disable hover effect from CSS when inspector is enabled
   *
   * @default true
   */
  disableHoverCSS?: boolean;
  /**
   * Ignoring components in some directories, using glob pattern syntax for match
   *
   * @see https://en.wikipedia.org/wiki/Glob_(programming)
   *
   * @default '\/**\/node_modules\/**\/*'
   */
  ignoreComponents?: string | string[];
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * Enable interaction between multiple iframes to be promoted to the top-level window.
   *
   * It only takes effect when the top window and iframe window have the same origin.
   *
   * @default false
   */
  crossIframe?: boolean;
  /**
   * internal server port
   *
   * relative address is used when this parameter is empty
   */
  port?: string;
}

let opts: Options;

export function setOptions(userOpts: Partial<Options> & Pick<Options, 'rootDir'>) {
  opts = {
    ...userOpts,
    displayToggle: userOpts.displayToggle ?? true,
    disableHoverCSS: userOpts.disableHoverCSS ?? true,
    ignoreComponents: userOpts.ignoreComponents ?? '/**/node_modules/**/*',
    once: userOpts.once ?? true,
    crossIframe: userOpts.crossIframe ?? false,
  };
}

export function getOptions() {
  if (!opts) {
    logError('options missing.', 'throw');
  }
  return opts;
}
