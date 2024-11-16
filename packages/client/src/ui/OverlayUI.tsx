import { CSS_util, applyStyle, addClass, removeClass } from '../utils/dom';
import { enableBridge, exitBridge, boxModelBridge } from '../core/bridge';

export function OverlayUI() {
  const state = {} as {
    position: HTMLElement;
    margin: HTMLElement;
    border: HTMLElement;
    padding: HTMLElement;
  };

  enableBridge.on(() => {
    addClass(state.position, 'oe-overlay-show');
  });

  exitBridge.on(() => {
    removeClass(state.position, 'oe-overlay-show');
  });

  boxModelBridge.on((rect, lines) => {
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
  });

  return (
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
  );
}
