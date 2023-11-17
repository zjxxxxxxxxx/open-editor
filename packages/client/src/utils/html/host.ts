import { isArr } from '@open-editor/shared';
import { append } from './dom';
import { Children, jsx } from './jsx';

export interface Options {
  root: HTMLElement;
  style: string | string[];
  element: Children[0] | Children;
}

export function host(options: Options) {
  if (!isArr(options.style)) options.style = [options.style];
  if (!isArr(options.element)) options.element = [options.element];

  const shadowRoot = options.root.attachShadow({ mode: 'closed' });
  Object.defineProperty(options.root, 'shadowRoot', {
    get() {
      return shadowRoot;
    },
  });

  const style = jsx('style', {
    type: 'text/css',
    __html: options.style.join(''),
  });
  const { children } = jsx('template', undefined, ...options.element);
  // @ts-ignore
  append(shadowRoot, style, ...children);
}
