import { isArr } from '@open-editor/shared';
import { append } from './dom';
import { jsx } from './jsx';

export interface Options {
  root: Element;
  style: string | string[];
  element: Element | Element[];
}

export function host(options: Options) {
  if (!isArr(options.style)) options.style = [options.style];
  if (!isArr(options.element)) options.element = [options.element];

  append(
    options.root.attachShadow({ mode: 'closed' }),
    jsx('style', {
      type: 'text/css',
      __html: options.style.join(''),
    }),
    ...options.element,
  );
}
