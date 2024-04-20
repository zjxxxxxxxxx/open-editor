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
  return new Promise((resolve) => {
    const styles = Array.from(document.querySelectorAll('style'));
    const checkNextFrame = createFrameChecker(10);
    requestAnimationFrame(function transformHoverCSS() {
      while (!checkNextFrame()) {
        const style = styles.pop();
        if (style?.textContent) {
          style.textContent = visitor(style.textContent);
        }
      }
      if (styles.length) {
        requestAnimationFrame(transformHoverCSS);
      } else {
        resolve(null);
      }
    });
  });
}
