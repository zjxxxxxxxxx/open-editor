import http from 'node:http';
import { createApp } from './createApp';

export interface Options {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;

  /**
   * custom openEditor handler
   */
  onOpenEditor?(file: string): void;
}

export function setupServer(options: Options = {}) {
  const { rootDir } = options;

  const app = createApp({
    rootDir,
  });
  const httpServer = http.createServer(app);
  return startServer(httpServer);
}

function startServer(server: http.Server) {
  return new Promise<number>((resolve, reject) => {
    server.on('error', reject);

    server.listen(
      // auto port
      undefined,
      () => {
        const address = server.address();
        if (!address) {
          server.close();
          reject(new Error('@open-editor/server: start fail.'));
          return;
        }

        const port =
          typeof address === 'string'
            ? +address.match(/:(\d+)$/)![1]
            : address.port;
        resolve(port);
      },
    );
  });
}
