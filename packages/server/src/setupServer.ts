import http from 'http';
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
  process.on('exit', httpServer.close);

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
