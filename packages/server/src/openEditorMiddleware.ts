import fs from 'fs';
import path from 'path';
import url from 'url';
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

    let filename = decodeURIComponent(pathname);
    if (!path.isAbsolute(rootDir)) {
      filename = path.resolve(rootDir, filename.replace(/^\//, ''));
    }

    try {
      const file = fs.readFileSync(filename, 'utf-8');
      openEditor(filename + ':1:1');
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
