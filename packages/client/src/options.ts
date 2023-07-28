export interface SetupClientOptions {
  /**
   * render the pointer into the browser
   */
  enablePointer: boolean;

  /**
   * internal server address
   *
   * relative address is used when this parameter is empty
   */
  serverAddress?: string;

  /**
   * source rootDir path
   */
  rootDir: string;
}

let options: SetupClientOptions;

export function setOptions(opts: SetupClientOptions) {
  options = opts;
}

export function getOptions() {
  if (!options) {
    throw Error('@open-editor/client: options missing.');
  }
  return options;
}
