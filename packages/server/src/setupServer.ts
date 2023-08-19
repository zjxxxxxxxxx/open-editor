import http from 'node:http';
import ip from 'ip';
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
  return new Promise<string>((resolve, reject) => {
    server.on('error', reject);

    server.listen(
      // auto port
      undefined,
      () => {
        const serverAddress = server.address();
        if (!serverAddress) {
          server.close();
          reject(new Error('@open-editor/server: start fail.'));
          return;
        }

        if (typeof serverAddress === 'string') {
          const port = serverAddress.match(/:(\d+)$/)![1];
          resolve(`http://${ip.address()}:${port}`);
        } else {
          const { port } = serverAddress;
          resolve(`http://${ip.address()}:${port}`);
        }
      },
    );
  });
}
