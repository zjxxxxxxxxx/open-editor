import { getOptions } from '../../options';

const DISABLE_RE = /:hover/g;
const ENABLE_RE = /\[__hover__\]/g;

const DISABLE_TOKEN = '[__hover__]';
const ENABLE_TOKEN = ':hover';

export function disableHoverCSS() {
  forEachCSS((css) => css.replace(DISABLE_RE, DISABLE_TOKEN));
}

export function enableHoverCSS() {
  forEachCSS((css) => css.replace(ENABLE_RE, ENABLE_TOKEN));
}

function forEachCSS(transform: (css: string) => void) {
  const opts = getOptions();
  if (opts.disableHoverCSS) {
    // @ts-ignore
    for (const style of document.querySelectorAll('style')) {
      requestAnimationFrame(() => {
        if (style.textContent) {
          style.textContent = transform(style.textContent);
        }
      });
    }
  }
}
