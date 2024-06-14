import { CSS_util, applyStyle, addClass, removeClass } from '../../utils/dom';
import {
  type FrameChecker,
  createFrameChecker,
} from '../../utils/createFrameChecker';
import {
  type IdleObserver,
  createIdleObserver,
} from '../../utils/createIdleObserver';
import { InternalElements } from '../../constants';
import { getOptions } from '../../options';
import { type BoxRect, type BoxLines, getBoxModel } from '../utils/getBoxModel';
import { HTMLCustomElement } from '../HTMLCustomElement';

export class HTMLOverlayElement extends HTMLCustomElement<{
  position: HTMLElement;
  margin: HTMLElement;
  border: HTMLElement;
  padding: HTMLElement;
  tooltip: HTMLTooltipElement;
  activeEl: HTMLElement | null;
  observing: boolean;
}> {
  /**
   * Detects frame rate and keeps rendering at 60 frames per second to avoid over-rendering on high refresh rate screens.
   */
  private declare checkNextFrame: FrameChecker;

  private declare idleObserver: IdleObserver;

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

    const { retainFrame } = getOptions();
    if (!retainFrame) {
      this.idleObserver.start();
    }
  }

  close() {
    removeClass(this.state.position, 'oe-show');

    this.state.tooltip.close();
    this.stopObserver();

    const { retainFrame } = getOptions();
    if (!retainFrame) {
      this.idleObserver.stop();
    }
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
    const [rect, lines] = getBoxModel(this.state.activeEl);
    this.state.tooltip.update(this.state.activeEl, rect);
    this.renderOverlay(rect, lines);
  }

  private renderOverlay(rect: BoxRect, lines: BoxLines) {
    applyStyle(this.state.position, {
      width: CSS_util.px(rect.width),
      height: CSS_util.px(rect.height),
      top: CSS_util.px(rect.top),
      left: CSS_util.px(rect.left),
    });

    for (const name of Object.keys(lines)) {
      const el = this.state[name];
      const line = lines[name];

      applyStyle(el, {
        borderTopWidth: CSS_util.px(line.top),
        borderRightWidth: CSS_util.px(line.right),
        borderBottomWidth: CSS_util.px(line.bottom),
        borderLeftWidth: CSS_util.px(line.left),
      });
    }
  }
}
