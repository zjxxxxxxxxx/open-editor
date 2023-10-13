import { append, create } from './document';

export function createStyleInject(css: string, target = document.body) {
  let style: HTMLStyleElement;
  function createStyle() {
    if (!style) {
      style = create('style');
      style.innerHTML = css;
    }
  }

  return {
    insert() {
      createStyle();
      append(target, style);
    },
    remove() {
      style?.remove();
    },
  };
}
