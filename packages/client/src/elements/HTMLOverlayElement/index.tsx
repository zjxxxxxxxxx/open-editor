import { CSS_util, applyStyle, addClass, removeClass } from '../../utils/ui';
import { createFrameChecker } from '../../utils/createFrameChecker';
import { InternalElements } from '../../constants';
import { getOptions } from '../../options';
import { HTMLCustomElement } from '../HTMLCustomElement';
import { type RectBox, getRectBoxs } from './getRectBoxs';
import { createIdleObserver } from './createIdleObserver';

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
  /**
   * Detects frame rate and keeps rendering at 60 frames per second to avoid over-rendering on high refresh rate screens.
   */
  private declare checkNextFrame: ReturnType<typeof createFrameChecker>;

  private declare idleObserver: ReturnType<typeof createIdleObserver>;

  constructor() {
    super();

    // After testing, it was concluded that setting the frame interval to 15 milliseconds
    // can ensure rendering on a 120-frame monitor at a speed of about 60 frames per second.
    this.checkNextFrame = createFrameChecker(15);

    this.idleObserver = createIdleObserver(300);

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
        <div className="o-e-position" ref={(el) => (this.state.position = el)}>
          <div className="o-e-margin" ref={(el) => (this.state.margin = el)}>
            <div className="o-e-border" ref={(el) => (this.state.border = el)}>
              <div
                className="o-e-padding"
                ref={(el) => (this.state.padding = el)}
              >
                <div
                  className="o-e-content"
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
    const { realtimeFrame } = getOptions();

    this.state.activeEl = null;
    this.state.tooltip.open();
    this.startObserver();

    if (realtimeFrame) {
      this.idleObserver.start();
    }

    addClass(this.state.position, 'o-e-show');
  }

  close() {
    const { realtimeFrame } = getOptions();

    this.state.tooltip.close();
    this.stopObserver();

    if (realtimeFrame) {
      this.idleObserver.stop();
    }

    removeClass(this.state.position, 'o-e-show');
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
      if (!this.idleObserver.isIdle && this.checkNextFrame()) {
        if (this.state.activeEl?.isConnected === false) {
          this.state.activeEl = null;
        }
        this.updateOverlay();
      }
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
