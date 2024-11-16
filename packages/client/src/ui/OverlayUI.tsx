import { CSS_util, applyStyle, addClass, removeClass } from '../utils/dom';
import { TooltipUI } from './TooltipUI';
import { type BoxRect, type BoxLines, getBoxModel } from './utils/getBoxModel';

export function OverlayUI(props: { ref: AnyObject }) {
  const state = {} as {
    position: HTMLElement;
    margin: HTMLElement;
    border: HTMLElement;
    padding: HTMLElement;
    activeEl: HTMLElement | null;
    activeRect: DOMRect | null;
    observing: boolean;
  };
  const tooltipRef = {} as AnyObject;

  props.ref.open = function open() {
    state.activeEl = null;

    addClass(state.position, 'oe-overlay-show');

    tooltipRef.open();
    startObserver();
  };

  props.ref.close = function close() {
    removeClass(state.position, 'oe-overlay-show');

    tooltipRef.close();
    stopObserver();
  };

  props.ref.update = function update(el: HTMLElement | null) {
    state.activeEl = el;
  };

  function startObserver() {
    state.observing = true;
    observe();
  }

  function stopObserver() {
    state.observing = false;
  }

  function isActiveRectChanged() {
    const prevAxis = state.activeRect;
    const nextAxis = (state.activeRect =
      state.activeEl?.getBoundingClientRect() ?? null);

    if (prevAxis == null && nextAxis == null) {
      return false;
    }
    if (prevAxis == null || nextAxis == null) {
      return true;
    }

    const diff = (key: keyof DOMRect) => prevAxis[key] !== nextAxis[key];
    return diff('x') || diff('y') || diff('width') || diff('height');
  }

  function observe() {
    if (state.observing) {
      if (!document.hidden && isActiveRectChanged()) {
        if (state.activeEl?.isConnected === false) {
          state.activeEl = null;
          state.activeRect = null;
        }

        const [rect, lines] = getBoxModel(state.activeEl);
        tooltipRef.update(state.activeEl, rect);
        updateOverlay(rect, lines);
      }

      requestAnimationFrame(observe);
    }
  }

  function updateOverlay(rect: BoxRect, lines: BoxLines) {
    applyStyle(state.position, {
      width: CSS_util.px(rect.width),
      height: CSS_util.px(rect.height),
      transform: CSS_util.translate(rect.left, rect.top),
    });

    for (const key of Object.keys(lines)) {
      const el = state[key];
      const line = lines[key];
      applyStyle(el, {
        borderTopWidth: CSS_util.px(line.top),
        borderRightWidth: CSS_util.px(line.right),
        borderBottomWidth: CSS_util.px(line.bottom),
        borderLeftWidth: CSS_util.px(line.left),
      });
    }
  }

  return (
    <>
      <div className="oe-overlay" ref={(el) => (state.position = el)}>
        <div className="oe-overlay-margin" ref={(el) => (state.margin = el)}>
          <div className="oe-overlay-border" ref={(el) => (state.border = el)}>
            <div
              className="oe-overlay-padding"
              ref={(el) => (state.padding = el)}
            >
              <div className="oe-overlay-content" />
            </div>
          </div>
        </div>
      </div>
      <TooltipUI ref={tooltipRef} />
    </>
  );
}
