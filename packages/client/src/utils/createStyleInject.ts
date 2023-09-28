import { append, create } from './document';

export function createStyleInject(css: string, target = document.body) {
  let style: HTMLStyleElement;

  function insert() {
    if (!style) {
      style = create('style');
      style.innerHTML = css;
    }

    append(target, style);
  }

  function remove() {
    style?.remove();
  }

  return {
    insert,
    remove,
  };
}
