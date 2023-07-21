import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import connect from 'connect';
import openEditor from 'launch-editor';

export interface OpenEditorMiddlewareOptions {
  rootDir: string;
}

export function openEditorMiddleware({
  rootDir,
}: OpenEditorMiddlewareOptions): connect.NextHandleFunction {
  return (req, res) => {
    const { pathname } = url.parse(req.url ?? '/', true);
    if (!pathname) {
      res.statusCode = 404;
      res.end(sendMessage('Invalid'));
      return;
    }

    const filename = decodeURIComponent(pathname);
    try {
      const file = fs.readFileSync(filename, 'utf-8');
      openEditor(path.resolve(rootDir, filename));
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
