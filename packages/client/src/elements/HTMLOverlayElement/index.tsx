import { CSS_util, applyStyle, addClass, removeClass } from '../../utils/dom';
import { type BoxRect, type BoxLines, getBoxModel } from '../utils/getBoxModel';
import { InternalElements } from '../../constants';
import { HTMLCustomElement } from '../HTMLCustomElement';

export class HTMLOverlayElement extends HTMLCustomElement<{
  position: HTMLElement;
  margin: HTMLElement;
  border: HTMLElement;
  padding: HTMLElement;
  tooltip: HTMLTooltipElement;
  activeEl: HTMLElement | null;
  activeRect: DOMRect | null;
  observing: boolean;
}> {
  constructor() {
    super();

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.update = this.update.bind(this);
    this.observe = this.observe.bind(this);
    this.updateOverlay = this.updateOverlay.bind(this);
  }

  override host() {
    return (
      <>
        <link rel="stylesheet" href="./index.css" />
        <div className="oe-position" ref={(el) => (this.state.position = el)}>
          <div className="oe-margin" ref={(el) => (this.state.margin = el)}>
            <div className="oe-border" ref={(el) => (this.state.border = el)}>
              <div
                className="oe-padding"
                ref={(el) => (this.state.padding = el)}
              >
                <div className="oe-content" />
              </div>
            </div>
          </div>
        </div>
        <InternalElements.HTML_TOOLTIP_ELEMENT
          ref={(el) => (this.state.tooltip = el)}
        />
      </>
    );
  }

  open() {
    this.state.activeEl = null;

    addClass(this.state.position, 'oe-show');

    this.state.tooltip.open();
    this.startObserver();
  }

  close() {
    removeClass(this.state.position, 'oe-show');

    this.state.tooltip.close();
    this.stopObserver();
  }

  update(el: HTMLElement | null) {
    this.state.activeEl = el;
  }

  private startObserver() {
    this.state.observing = true;
    this.observe();
  }

  private stopObserver() {
    this.state.observing = false;
  }

  private get isActiveRectChanged() {
    const prevAxis = this.state.activeRect;
    const nextAxis = (this.state.activeRect =
      this.state.activeEl?.getBoundingClientRect() ?? null);

    if (prevAxis == null && nextAxis == null) {
      return false;
    }
    if (prevAxis == null || nextAxis == null) {
      return true;
    }

    const diff = (key: keyof DOMRect) => prevAxis[key] !== nextAxis[key];
    return diff('x') || diff('y') || diff('width') || diff('height');
  }

  private observe() {
    if (this.state.observing) {
      if (!document.hidden && this.isActiveRectChanged) {
        if (this.state.activeEl?.isConnected === false) {
          this.state.activeEl = null;
          this.state.activeRect = null;
        }

        const [rect, lines] = getBoxModel(this.state.activeEl);
        this.state.tooltip.update(this.state.activeEl, rect);
        this.updateOverlay(rect, lines);
      }

      requestAnimationFrame(this.observe);
    }
  }

  private updateOverlay(rect: BoxRect, lines: BoxLines) {
    applyStyle(this.state.position, {
      width: CSS_util.px(rect.width),
      height: CSS_util.px(rect.height),
      transform: CSS_util.translate(rect.left, rect.top),
    });

    for (const key of Object.keys(lines)) {
      const el = this.state[key];
      const line = lines[key];
      applyStyle(el, {
        borderTopWidth: CSS_util.px(line.top),
        borderRightWidth: CSS_util.px(line.right),
        borderBottomWidth: CSS_util.px(line.bottom),
        borderLeftWidth: CSS_util.px(line.left),
      });
    }
  }
}
