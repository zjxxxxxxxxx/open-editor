import connect from 'connect';
import corsMiddleware from 'cors';
import { ServerApis } from '@open-editor/shared';
import { openEditorMiddleware } from './openEditorMiddleware';

export function createApp(options: { rootDir?: string }) {
  const { rootDir } = options;
  const app = connect();

  app.use(
    corsMiddleware({
      methods: 'GET',
    }),
  );
  app.use(
    ServerApis.OPEN_EDITOR,
    openEditorMiddleware({
      rootDir,
    }),
  );

  return app;
}
