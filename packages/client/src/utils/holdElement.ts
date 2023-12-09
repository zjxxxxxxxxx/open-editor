import { applyAttrs } from './html';
import { isValidElement } from './isValidElement';

let holdEl: HTMLElement | null = null;

export function checkHoldElement(el: HTMLElement) {
  return el === holdEl;
}

export function setupHoldElement(e: Event) {
  const el = <HTMLElement>e.target;
  if (isValidElement(el)) {
    resetAttrs(el, {
      disabled: {
        from: 'disabled',
        to: '__disabled__',
      },
      href: {
        from: 'href',
        to: '__href__',
      },
    });

    holdEl = el;
  }
}

export function cleanHoldElementHOC<T extends (...args: any[]) => any>(fn: T) {
  return function wrapped(...args: Parameters<T>): ReturnType<T> {
    cleanHoldElement();
    return fn(...args);
  };
}

function cleanHoldElement() {
  if (holdEl) {
    resetAttrs(holdEl, {
      disabled: {
        from: '__disabled__',
        to: 'disabled',
      },
      href: {
        from: '__href__',
        to: 'href',
      },
    });

    holdEl = null;
  }
}

function resetAttrs(
  el: HTMLElement,
  attrs: Record<
    'disabled' | 'href',
    {
      from: string;
      to: string;
    }
  >,
) {
  const { disabled, href } = attrs;

  // Prevent click events from being blocked
  swapAttr(el, disabled.from, disabled.to);

  // Prevents the default jump
  // `e.preventDefault()` has no effect on relative paths
  const a = findATag(el);
  if (a) {
    swapAttr(a, href.from, href.to);
  }
}

function swapAttr(el: HTMLElement, from: string, to: string) {
  const val = el.getAttribute(from);
  if (val != null) {
    applyAttrs(el, {
      [from]: null,
      [to]: val,
    });
  }
}

function findATag(el: HTMLElement | null) {
  while (el) {
    if (el.tagName === 'A') {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}
