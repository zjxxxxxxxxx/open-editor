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

let taskID = 0;

function visitCSS(visitor: (css: string) => string) {
  const styles = Array.from(document.querySelectorAll('style'));
  const checkNextFrame = createFrameChecker(1000 / 60);
  const runId = ++taskID;

  return new Promise((resolve, reject) => {
    (function transformHoverCSS() {
      while (!checkNextFrame()) {
        if (runId !== taskID) {
          reject(null);

          return;
        }

        if (!styles.length) {
          resolve(null);

          return;
        }

        const style = styles.pop()!;
        if (style.textContent) {
          style.textContent = visitor(style.textContent);
        }
      }

      requestAnimationFrame(transformHoverCSS);
    })();
  });
}
