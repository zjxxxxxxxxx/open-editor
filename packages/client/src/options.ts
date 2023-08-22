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

let options: Options;

export function setOptions(opts: Options) {
  options = opts;
}

export function getOptions() {
  if (!options) {
    throw Error('@open-editor/client: options missing.');
  }
  return options;
}
