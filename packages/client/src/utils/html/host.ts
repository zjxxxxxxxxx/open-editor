import { isArr } from '@open-editor/shared';
import { append } from './dom';
import { JSXNode, jsx } from './jsx';

export interface Options {
  css: string | string[];
  html: JSXNode | JSXNode[];
}

export function host(root: HTMLElement, opts: Options) {
  if (!isArr(opts.css)) opts.css = [opts.css];
  if (!isArr(opts.html)) opts.html = [opts.html];

  const shadow = root.attachShadow({ mode: 'closed' });
  Object.defineProperty(root, 'shadowRoot', {
    value: shadow,
  });

  const style = jsx('style', {
    type: 'text/css',
    __html: opts.css.join(''),
  });
  const { children } = jsx('template', undefined, ...opts.html);
  // @ts-ignore
  append(shadow, style, ...children);
}
