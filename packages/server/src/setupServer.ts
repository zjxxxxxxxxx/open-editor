import http from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { createApp } from './createApp';

export interface Options {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * enable https
   *
   * @see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
   */
  https?: {
    key: string;
    cert: string;
  };
  /**
   * custom openEditor handler
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

export function setupServer(options: Options = {}) {
  const { rootDir, https: httpsOpts } = options;

  const app = createApp({
    rootDir,
  });
  const httpServer = httpsOpts
    ? https.createServer(
        {
          key: readFileSync(httpsOpts.key),
          cert: readFileSync(httpsOpts.cert),
        },
        app,
      )
    : http.createServer(app);
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
          reject(Error('@open-editor/server: start fail.'));
          return;
        }

        const port = typeof address === 'string' ? +address.match(/:(\d+)$/)![1] : address.port;
        resolve(port);
      },
    );
  });
}
