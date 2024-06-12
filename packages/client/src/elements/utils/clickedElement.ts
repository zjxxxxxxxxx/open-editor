import { applyAttrs, checkValidElement } from '../../utils/dom';

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
        to: 'oe-disabled',
      },
      href: {
        from: 'href',
        to: 'oe-href',
      },
    });

    clickedEl = el;
  }
}

export function cleanClickedElementAttrs() {
  if (clickedEl) {
    resetAttrs(clickedEl, {
      disabled: {
        from: 'oe-disabled',
        to: 'disabled',
      },
      href: {
        from: 'oe-href',
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
  const { hs, ds } = findTags(el);

  // Prevents the default jump
  // `e.preventDefault()` has no effect on relative paths
  hs.forEach((h) => swapAttr(h, href.from, href.to));

  // Prevent click events from being blocked
  ds.forEach((d) => swapAttr(d, disabled.from, disabled.to));
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

const dTagRE = /^(button|fieldset|optgroup|option|select|textarea|input)$/;

function findTags(el: HTMLElement | null) {
  const hs: HTMLElement[] = [];
  const ds: HTMLElement[] = [];

  while (el) {
    if (el.localName === 'a') {
      hs.push(el);
    } else if (dTagRE.test(el.localName)) {
      ds.push(el);
    }
    el = el.parentElement;
  }

  return {
    hs,
    ds,
  };
}
