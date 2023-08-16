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
  return new Promise<string>((resolve, reject) => {
    server.on('error', reject);
    // auto port
    server.listen(undefined, () => {
      let serverAddress = server.address()!;
      if (typeof serverAddress !== 'string') {
        serverAddress = `${serverAddress.address}:${serverAddress.port}`;
      }
      serverAddress = serverAddress.replace(/^::/, '0.0.0.0');

      resolve(`http://${serverAddress}`);
    });
  });
}
