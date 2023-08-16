import { setupServer } from '@open-editor/server';

let serverAddress: Promise<string>;

export function getServerAddress(options: {
  rootDir?: string;
  onOpenEditor?(file: string): void;
}) {
  if (!serverAddress) {
    serverAddress = setupServer(options);
  }

  return serverAddress;
}
