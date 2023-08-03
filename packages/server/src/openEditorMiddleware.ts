import fs from 'fs';
import path from 'path';
import url from 'url';
import connect from 'connect';
import openEditor from 'launch-editor';

export interface OpenEditorMiddlewareOptions {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;
}

export function openEditorMiddleware(
  options: OpenEditorMiddlewareOptions,
): connect.NextHandleFunction {
  const { rootDir = process.cwd() } = options;

  return (req, res) => {
    const { pathname, query } = url.parse(req.url ?? '/', true);
    if (!pathname) {
      res.statusCode = 404;
      res.end(sendMessage('Invalid'));
      return;
    }

    let filename = decodeURIComponent(pathname);
    if (!filename.startsWith(rootDir)) {
      filename = path.join(rootDir, filename);
    }

    try {
      const file = fs.readFileSync(filename, 'utf-8');
      const { line = 0, column = 0 } = query;

      openEditor(`${filename}:${line}:${column}`);
      res.setHeader('Content-Type', 'text/javascript');
      res.end(file);
    } catch {
      res.statusCode = 500;
      res.end(sendMessage('Not found'));
    }
  };
}

function sendMessage(msg: string) {
  return `@open-editor/server: ${msg}.`;
}
