import { sendErrMsg } from './utils/errorMessage';

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
   * @default false
   */
  disableHoverCSS?: boolean;
  /**
   * Track animations and page re-rendering
   *
   * @default false
   */
  realtimeRender?: boolean;
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
    disableHoverCSS: userOpts.disableHoverCSS ?? false,
    once: userOpts.once ?? true,
  };
}

export function getOptions() {
  if (!opts) {
    sendErrMsg('options missing', 'throw');
  }
  return opts;
}
