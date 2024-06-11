import { createFrameChecker } from '../../utils/createFrameChecker';
import { createAsyncTask } from '../../utils/createAsyncTask';

const DISABLE_RE = /:hover/g;
const DISABLE_TOKEN = '::hover';

const ENABLE_RE = /:+:hover/g;
const ENABLE_TOKEN = ':hover';

export function disableHoverCSS() {
  return visitCSS((css) => css.replace(DISABLE_RE, DISABLE_TOKEN));
}

export function enableHoverCSS() {
  return visitCSS((css) => css.replace(ENABLE_RE, ENABLE_TOKEN));
}

let taskID = 0;

function visitCSS(visitor: (css: string) => string) {
  const checkNextFrame = createFrameChecker(1000 / 60);
  const asyncTask = createAsyncTask();
  const runID = ++taskID;

  const rules = Array.from(document.styleSheets).flatMap((sheet) => {
    if (sheet.ownerNode instanceof HTMLLinkElement) {
      return Array.from(sheet.cssRules);
    }
    return [];
  });
  const rulesLength = rules.length;

  const styles = Array.from(document.querySelectorAll('style'));
  const stylesLength = styles.length;

  let ruleIndex = 0;
  let styleIndex = 0;

  void (function transformHoverCSS() {
    while (!checkNextFrame()) {
      if (runID !== taskID) {
        asyncTask.reject();

        return;
      }

      if (rulesLength && ruleIndex < rulesLength) {
        const rule = rules[ruleIndex++];
        replaceRule(rule.parentStyleSheet!, visitor(rule.cssText));
      } else if (stylesLength && styleIndex < stylesLength) {
        const style = styles[styleIndex++];
        style.textContent = visitor(style.textContent!);
      } else {
        asyncTask.resolve(null);

        return;
      }
    }

    requestAnimationFrame(transformHoverCSS);
  })();

  return asyncTask;
}

function replaceRule(sheet: CSSStyleSheet, text: string) {
  sheet.deleteRule(0);
  sheet.insertRule(text, sheet.cssRules.length);
}
