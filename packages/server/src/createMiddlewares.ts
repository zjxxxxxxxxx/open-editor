import connect from 'connect';
import corsMiddleware from 'cors';
import { OPEN_EDITOR_PATH } from '@open-editor/shared';
import { openEditorMiddleware } from './openEditorMiddleware';

export interface CreateMiddlewaresOptions {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir: string;
}

export function createMiddlewares(options: CreateMiddlewaresOptions) {
  const { rootDir } = options;
  const middlewares = connect();

  middlewares.use(corsMiddleware({ methods: 'GET' }));
  middlewares.use(OPEN_EDITOR_PATH, openEditorMiddleware({ rootDir }));

  return middlewares;
}
