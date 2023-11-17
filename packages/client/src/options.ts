export interface Options {
  /**
   * render the toggle into the browser
   */
  displayToggle: boolean;

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

export function setOptions(userOpts: Options) {
  opts = userOpts;
}

export function getOptions() {
  if (!opts) {
    throw Error('@open-editor/client: options missing.');
  }
  return opts;
}
