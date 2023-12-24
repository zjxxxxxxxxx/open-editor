import { type RectBox, getRectBoxs } from '../../utils/getRectBoxs';
import { CSS_util, applyStyle, addClass, removeClass } from '../../utils/ui';
import { InternalElements } from '../../constants';
import { HTMLCustomElement } from '../HTMLCustomElement';

export class HTMLOverlayElement extends HTMLCustomElement<{
  position: HTMLElement;
  margin: HTMLElement;
  border: HTMLElement;
  padding: HTMLElement;
  content: HTMLElement;
  tooltip: HTMLTooltipElement;
  activeEl: HTMLElement | null;
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
                <div
                  className="oe-content"
                  ref={(el) => (this.state.content = el)}
                />
              </div>
            </div>
          </div>
        </div>
        <InternalElements.HTML_TOOLTIP_ELEMENT
          ref={(el) => (this.state.tooltip = el as HTMLTooltipElement)}
        />
      </>
    );
  }

  open() {
    this.state.activeEl = null;
    this.state.tooltip.open();
    addClass(this.state.position, 'oe-show');
    this.startObserver();
  }

  close() {
    this.state.tooltip.close();
    removeClass(this.state.position, 'oe-show');
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

  private observe() {
    if (this.state.observing) {
      if (this.state.activeEl?.isConnected === false) {
        this.state.activeEl = null;
      }
      this.updateOverlay();
      requestAnimationFrame(this.observe);
    }
  }

  private updateOverlay() {
    const boxs = getRectBoxs(this.state.activeEl);
    this.state.tooltip.update(this.state.activeEl, boxs.position);
    this.updateBoxs(boxs);
  }

  private updateBoxs(boxs: Record<string, RectBox>) {
    applyStyle(this.state.position, {
      width: CSS_util.px(boxs.position.width),
      height: CSS_util.px(boxs.position.height),
      top: CSS_util.px(boxs.position.top),
      left: CSS_util.px(boxs.position.left),
    });
    this.applyRectBox(this.state.margin, boxs.margin);
    this.applyRectBox(this.state.border, boxs.border);
    this.applyRectBox(this.state.padding, boxs.padding);
    this.applyRectBox(this.state.content, boxs.content);
  }

  private applyRectBox(el: HTMLElement, box: RectBox) {
    applyStyle(el, {
      width: CSS_util.px(box.width),
      height: CSS_util.px(box.height),
      borderTopWidth: CSS_util.px(box.top),
      borderRightWidth: CSS_util.px(box.right),
      borderBottomWidth: CSS_util.px(box.bottom),
      borderLeftWidth: CSS_util.px(box.left),
    });
  }
}
