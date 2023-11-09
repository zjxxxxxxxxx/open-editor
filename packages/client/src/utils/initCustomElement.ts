import { isArr } from '@open-editor/shared';
import { append, create } from './dom';

export interface Options {
  root: Element;
  style: string | string[];
  children: Element | Element[];
}

export function initCustomElement(options: Options) {
  if (!isArr(options.style)) options.style = [options.style];
  if (!isArr(options.children)) options.children = [options.children];

  append(
    options.root.attachShadow({ mode: 'closed' }),
    create('style', {
      type: 'text/css',
      __html: options.style.join(''),
    }),
    ...options.children,
  );
}
