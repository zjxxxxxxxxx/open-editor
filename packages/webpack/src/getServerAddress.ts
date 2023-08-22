import { setupServer } from '@open-editor/server';

let port: Promise<number>;

// because many scaffolding tools rewrite the devServer part, it is impossible to add
// middleware, so it has to start another server to handle the client side request.
export function getServerAddress(options: {
  rootDir?: string;
  onOpenEditor?(file: string): void;
}) {
  if (!port) {
    port = setupServer(options);
  }

  return port;
}
