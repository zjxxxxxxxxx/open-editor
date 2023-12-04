import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node:url';
import connect from 'connect';
import openEditor from 'launch-editor';

export interface OpenEditorMiddlewareOptions {
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

export function openEditorMiddleware(
  options: OpenEditorMiddlewareOptions,
): connect.NextHandleFunction {
  const { rootDir = process.cwd(), onOpenEditor = openEditor } = options;

  return (req, res) => {
    const { pathname, query } = parse(req.url ?? '/', true);
    if (!pathname) {
      res.statusCode = 404;
      res.end(sendMessage('Not found'));
      return;
    }

    let filename = decodeURIComponent(pathname);
    if (!existsSync(filename)) {
      filename = join(rootDir, filename);
    }
    if (!existsSync(filename)) {
      res.statusCode = 500;
      res.end(sendMessage('Invalid'));
      return;
    }

    res.setHeader('Content-Type', 'application/javascript;charset=UTF-8');
    res.end(readFileSync(filename, 'utf-8'));

    if (req.headers.referer) {
      const { line = 1, column = 1 } = query;
      onOpenEditor(`${filename}:${line}:${column}`);
    }
  };
}

function sendMessage(msg: string) {
  return `@open-editor/server: ${msg}.`;
}
