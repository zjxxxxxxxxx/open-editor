import http from 'node:http';
import { createMiddlewares } from './createMiddlewares';

export interface SetupServerOptions {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;
}

export function setupServer(options: SetupServerOptions = {}) {
  const { rootDir = process.cwd() } = options;

  const middlewares = createMiddlewares({
    rootDir,
  });
  const httpServer = http.createServer(middlewares);

  return startServer(httpServer);
}

function startServer(server: http.Server) {
  return new Promise<number>((resolve, reject) => {
    server.on('error', reject);
    server.listen(undefined, () => {
      const address = server.address()!;
      const port = Number(
        typeof address === 'string' ? address.match(/\d+$/)![0] : address.port,
      );
      resolve(port);
    });
  });
}
