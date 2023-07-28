import connect from 'connect';
import corsMiddleware from 'cors';
import { ServerApis } from '@open-editor/shared';
import { openEditorMiddleware } from './openEditorMiddleware';

export interface CreateMiddlewaresOptions {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;
}

export function createMiddlewares(options: CreateMiddlewaresOptions) {
  const { rootDir } = options;
  const middlewares = connect();

  middlewares.use(corsMiddleware({ methods: 'GET' }));
  middlewares.use(ServerApis.OPEN_EDITOR, openEditorMiddleware({ rootDir }));

  return middlewares;
}
