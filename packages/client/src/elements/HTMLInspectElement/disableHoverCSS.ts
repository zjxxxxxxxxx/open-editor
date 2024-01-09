import { getOptions } from '../../options';

const DISABLE_RE = /:hover/g;
const DISABLE_TOKEN = '.__oe_hover';

const ENABLE_RE = /\.__oe_hover/g;
const ENABLE_TOKEN = ':hover';

export function disableHoverCSS() {
  visitCSS((css) => css.replace(DISABLE_RE, DISABLE_TOKEN));
}

export function enableHoverCSS() {
  visitCSS((css) => css.replace(ENABLE_RE, ENABLE_TOKEN));
}

function visitCSS(visitor: (css: string) => string) {
  const opts = getOptions();
  if (opts.disableHoverCSS) {
    const styles = Array.from(document.querySelectorAll('style'));
    const frameWork = requestAnimationFrame;
    const perFrame = 10;
    let frameTime = performance.now();
    function transformHoverCSS() {
      while (performance.now() - frameTime < perFrame) {
        if (!styles.length) return;
        const style = styles.pop()!;
        if (style.textContent) {
          style.textContent = visitor(style.textContent);
        }
      }
      frameTime = performance.now();
      frameWork(transformHoverCSS);
    }
    frameWork(transformHoverCSS);
  }
}
