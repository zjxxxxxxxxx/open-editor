import { applyAttrs, checkValidElement } from '../../utils/ui';

let clickedEl: HTMLElement | null = null;

export function checkClickedElement(el: HTMLElement) {
  return el === clickedEl;
}

export function setupClickedElementAttrs(e: Event) {
  const el = <HTMLElement>e.target;
  if (checkValidElement(el)) {
    resetAttrs(el, {
      disabled: {
        from: 'disabled',
        to: '__disabled',
      },
      href: {
        from: 'href',
        to: '__href',
      },
    });

    clickedEl = el;
  }
}

export function cleanClickedElementAttrs() {
  if (clickedEl) {
    resetAttrs(clickedEl, {
      disabled: {
        from: '__disabled',
        to: 'disabled',
      },
      href: {
        from: '__href',
        to: 'href',
      },
    });

    clickedEl = null;
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
  const { as, bs } = findTags(el);

  // Prevents the default jump
  // `e.preventDefault()` has no effect on relative paths
  as.forEach((a) => swapAttr(a, href.from, href.to));

  // Prevent click events from being blocked
  bs.forEach((b) => swapAttr(b, disabled.from, disabled.to));
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

function findTags(el: HTMLElement | null) {
  const as: HTMLElement[] = [];
  const bs: HTMLElement[] = [];

  while (el) {
    if (el.tagName === 'A') {
      as.push(el);
    } else if (el.tagName === 'BUTTON') {
      bs.push(el);
    }
    el = el.parentElement;
  }

  return {
    as,
    bs,
  };
}
