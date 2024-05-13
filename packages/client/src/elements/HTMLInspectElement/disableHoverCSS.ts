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
  const checkNextFrame = createFrameChecker(1000 / 60);
  const runID = ++taskID;

  const rules = Array.from(document.styleSheets).flatMap((sheet) => {
    if (sheet.ownerNode instanceof HTMLLinkElement) {
      return Array.from(sheet.cssRules);
    }
    return [];
  });
  const ruleLength = rules.length;

  const styles = Array.from(document.querySelectorAll('style'));
  const styleLength = styles.length;

  let cssRuleIndex = 0;
  let styleIndex = 0;

  return new Promise((resolve, reject) => {
    (function transformHoverCSS() {
      while (!checkNextFrame()) {
        if (runID !== taskID) {
          reject(null);

          return;
        }

        if (ruleLength && cssRuleIndex < ruleLength) {
          const cssRule = rules[cssRuleIndex++];
          replaceRule(cssRule.parentStyleSheet!, visitor(cssRule.cssText));
        } else if (styleLength && styleIndex < styleLength) {
          const style = styles[styleIndex++];
          style.textContent = visitor(style.textContent!);
        } else {
          resolve(null);

          return;
        }
      }

      requestAnimationFrame(transformHoverCSS);
    })();
  });
}

function replaceRule(sheet: CSSStyleSheet, text: string) {
  sheet.deleteRule(0);
  sheet.insertRule(text, sheet.cssRules.length);
}
