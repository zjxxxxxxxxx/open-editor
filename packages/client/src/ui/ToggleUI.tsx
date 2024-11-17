import { clamp } from '@open-editor/shared';
import {
  getHtml,
  CSS_util,
  applyStyle,
  addClass,
  removeClass,
} from '../utils/dom';
import { safeArea, safeAreaObserver } from '../utils/safeArea';
import { off, on } from '../event';
import { enableBridge, exitBridge } from '../bridge';
import { isEnable } from '../inspector';

export function ToggleUI() {
  const state = {} as {
    root: HTMLElement;
    button: HTMLElement;
    dnding: boolean;
    active: boolean;
    touchable: boolean;
  };

  enableBridge.on(() => {
    applyStyle(state.button, {
      color: 'var(--cyan)',
    });
  });

  exitBridge.on(() => {
    applyStyle(state.button, {
      color: null,
    });
  });

  on('resize', updatePosTop);
  on('resize', updateSize);

  function startDnD() {
    state.dnding = true;

    addClass(state.root, 'oe-toggle-dnd');

    on('pointermove', changePosTop);
    on('pointerup', stopDnD);
  }

  function stopDnD() {
    // Modify when the click e is complete
    setTimeout(() => (state.dnding = false));

    removeClass(state.root, 'oe-toggle-dnd');

    off('pointermove', changePosTop);
    off('pointerup', stopDnD);
  }

  function changePosTop(e: PointerEvent) {
    localStorage['oe-pt'] = e.clientY;
    updatePosTop();
  }

  function updateSize() {
    const touchable =
      'maxTouchPoints' in navigator
        ? navigator.maxTouchPoints > 0
        : 'ontouchstart' in window;
    if (state.touchable !== touchable) {
      // Display larger button on the touch screen
      if (touchable) {
        addClass(state.root, 'oe-toggle-touch');
      } else {
        removeClass(state.root, 'oe-toggle-touch');
      }
      state.touchable = touchable;
    }
  }

  function updatePosRight() {
    applyStyle(state.root, {
      right: CSS_util.px(safeArea.right),
    });
  }

  function updatePosTop() {
    const { clientHeight: winH } = getHtml();
    const { offsetHeight: toggleH } = state.root;

    const cachePosY = +localStorage['oe-pt'] || 0;
    const safePosY = clamp(
      cachePosY - toggleH / 2,
      safeArea.top,
      winH - toggleH - safeArea.bottom,
    );

    applyStyle(state.root, {
      top: CSS_util.px(safePosY),
    });
  }

  function toggleEnable() {
    // Prevents the click event from being triggered by the end of the drag
    if (!state.dnding) {
      if (!isEnable) {
        enableBridge.emit();
      } else {
        exitBridge.emit();
      }
    }
  }

  try {
    return (
      <div
        className="oe-toggle"
        ref={(el) => (state.root = el)}
        // Prevent screen scrolling caused by dragging buttons
        // in Firefox browser
        onTouchMove={(e) => e.preventDefault()}
        // Prevent the default behavior of contextmenu triggered
        // by long pressing the screen on mobile devices
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="oe-toggle-overlay" />
        <button
          className="oe-toggle-button"
          ref={(el) => (state.button = el)}
          onClick={toggleEnable}
          onLongPress={startDnD}
        >
          <svg
            viewBox="0 0 1024 1024"
            width="100%"
            height="100%"
            fill="currentColor"
          >
            <path d="M512 134.07031223a26.3671875 26.3671875 0 0 1 26.2441409 23.8359375L538.3671875 160.43749973v70.31250054l-0.05273438 1.23046848c134.33203098 12.4453125 241.25976563 119.390625 253.72265598 253.72265598L793.24999973 485.6328125h70.31250054a26.3671875 26.3671875 0 0 1 2.53125 52.6113284L863.56250027 538.3671875h-70.31250054l-1.23046848-0.05273438c-12.4453125 134.33203098-119.37304715 241.25976563-253.70507812 253.72265598L538.3671875 793.24999973v70.31250054a26.3671875 26.3671875 0 0 1-52.6113284 2.53125L485.6328125 863.56250027v-70.31250054l0.07031223-1.21289063c-134.33203098-12.46289035-241.27734348-119.390625-253.74023383-253.72265597L230.75000027 538.3671875H160.43749973a26.3671875 26.3671875 0 0 1-2.53125-52.6113284L160.43749973 485.6328125h70.31250054l1.21289063 0.07031223c12.46289035-134.34960965 119.390625-241.27734348 253.74023383-253.74023383L485.6328125 230.75000027V160.43749973A26.3671875 26.3671875 0 0 1 512 134.07031223z m0 147.83203179c-127.08984375 0-230.09765598 103.00781223-230.09765598 230.09765598 0 127.08984375 103.00781223 230.09765598 230.09765598 230.09765598 127.08984375 0 230.09765598-103.00781223 230.09765598-230.09765598 0-127.08984375-103.00781223-230.09765598-230.09765598-230.09765598z" />
            <path d="M512 388.95312527a123.04687473 123.04687473 0 1 0 0 246.09374946 123.04687473 123.04687473 0 0 0 0-246.09374946z m0 49.21874973a73.828125 73.828125 0 1 1 0 147.65625 73.828125 73.828125 0 0 1 0-147.65625z" />
          </svg>
        </button>
      </div>
    );
  } finally {
    updatePosTop();
    updateSize();
    safeAreaObserver.on(updatePosRight);
  }
}
