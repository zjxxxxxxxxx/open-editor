export interface Options {
  /**
   * render the toggle into the browser
   *
   * @default true
   */
  displayToggle?: boolean;

  /**
   * set UI color mode
   *
   * @default 'auto'
   */
  colorMode?: 'auto' | 'light' | 'dark';

  /**
   * internal server port
   *
   * relative address is used when this parameter is empty
   */
  port?: string;

  /**
   * source rootDir path
   */
  rootDir: string;
}

let opts: Options;

export function setOptions(
  userOpts: Partial<Options> & Pick<Options, 'rootDir'>,
) {
  opts = {
    ...userOpts,
    displayToggle: userOpts.displayToggle ?? true,
    colorMode: userOpts.colorMode ?? 'auto',
  };
}

export function getOptions() {
  if (!opts) {
    throw Error('@open-editor/client: options missing.');
  }
  return opts;
}
