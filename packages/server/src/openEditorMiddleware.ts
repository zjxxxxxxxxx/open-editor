import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
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
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}

export function openEditorMiddleware(
  options: OpenEditorMiddlewareOptions,
): connect.NextHandleFunction {
  const { rootDir = process.cwd(), onOpenEditor = openEditor } = options;

  return (req, res) => {
    const { query } = parse(req.url ?? '/', true);
    const { f: file = '', l: line = 1, c: column = 1 } = query as AnyObject<string>;

    const filename = resolve(rootDir, decodeURIComponent(file));
    if (!existsSync(filename)) {
      res.statusCode = 404;
      res.end(sendMessage(`file '${filename}' not found`));
      return;
    }
    if (!statSync(filename).isFile()) {
      res.statusCode = 500;
      res.end(sendMessage(`'${filename}' is not a valid file`));
      return;
    }

    if (req.headers.referer) {
      onOpenEditor(`${filename}:${line}:${column}`);
    }

    res.setHeader('Content-Type', 'application/javascript;charset=UTF-8');
    res.end(readFileSync(filename, 'utf-8'));
  };
}

function sendMessage(msg: string) {
  return `[@open-editor/server] ${msg}.`;
}
