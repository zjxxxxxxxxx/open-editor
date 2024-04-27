import { createFrameChecker } from '../../utils/createFrameChecker';

const DISABLE_RE = /:hover/g;
const DISABLE_TOKEN = '.o-e-hover';

const ENABLE_RE = /\.o-e-hover/g;
const ENABLE_TOKEN = ':hover';

export function disableHoverCSS() {
  return visitCSS((css) => css.replace(DISABLE_RE, DISABLE_TOKEN));
}

export function enableHoverCSS() {
  return visitCSS((css) => css.replace(ENABLE_RE, ENABLE_TOKEN));
}

function visitCSS(visitor: (css: string) => string) {
  const styles = Array.from(document.querySelectorAll('style'));
  const checkNextFrame = createFrameChecker(10);

  return new Promise((resolve) => {
    (function transformHoverCSS() {
      while (!checkNextFrame()) {
        if (styles.length) {
          const style = styles.pop()!;
          if (style.textContent) {
            style.textContent = visitor(style.textContent);
          }
        } else {
          resolve(null);
        }
      }
      requestAnimationFrame(transformHoverCSS);
    })();
  });
}
