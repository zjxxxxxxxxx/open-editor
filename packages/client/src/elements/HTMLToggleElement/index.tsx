import { clamp } from '@open-editor/shared';
import {
  getHtml,
  CSS_util,
  applyStyle,
  addClass,
  removeClass,
} from '../../utils/ui';
import { off, on } from '../../utils/event';
import {
  SafeAreaObserver,
  type SafeAreaValue,
} from '../../utils/SafeAreaObserver';
import { CACHE_POS_TOP_ID } from '../../constants';
import { HTMLCustomElement } from '../HTMLCustomElement';

export class HTMLToggleElement extends HTMLCustomElement<{
  root: HTMLElement;
  button: HTMLElement;
  dnding: boolean;
  touchable: boolean;
}> {
  static get observedAttributes() {
    return ['active'];
  }

  constructor() {
    super();
    this.startDnD = this.startDnD.bind(this);
    this.stopDnD = this.stopDnD.bind(this);
    this.changePosTop = this.changePosTop.bind(this);
    this.updateSize = this.updateSize.bind(this);
    this.updatePosRight = this.updatePosRight.bind(this);
    this.updatePosTop = this.updatePosTop.bind(this);
    this.dispatchChange = this.dispatchChange.bind(this);
  }

  override host() {
    return (
      <>
        <link rel="stylesheet" href="./index.css" />
        <div className="o-e-root" ref={(el) => (this.state.root = el)}>
          <div className="o-e-overlay" />
          <button
            className="o-e-button"
            ref={(el) => (this.state.button = el)}
            onClick={this.dispatchChange}
            onLongPress={this.startDnD}
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
      </>
    );
  }

  override attrChanged(name: string, newValue: any) {
    switch (name) {
      case 'active':
        if (newValue) {
          addClass(this.state.button, 'o-e-active');
        } else {
          removeClass(this.state.button, 'o-e-active');
        }
    }
  }

  override mounted() {
    this.updatePosTop();
    this.updateSize();

    on('resize', this.updatePosTop);
    on('resize', this.updateSize);

    SafeAreaObserver.observe(this.updatePosRight);
  }

  override unmount() {
    off('resize', this.updatePosTop);
    off('resize', this.updateSize);

    SafeAreaObserver.unobserve(this.updatePosRight);
  }

  private startDnD() {
    this.state.dnding = true;

    on('pointermove', this.changePosTop);
    on('pointerup', this.stopDnD);

    addClass(this.state.root, 'o-e-dnd');
  }

  private stopDnD() {
    // Modify when the click e is complete
    setTimeout(() => (this.state.dnding = false));

    off('pointermove', this.changePosTop);
    off('pointerup', this.stopDnD);

    removeClass(this.state.root, 'o-e-dnd');
  }

  private changePosTop(e: PointerEvent) {
    localStorage[CACHE_POS_TOP_ID] = e.clientY;
    this.updatePosTop();
  }

  private updateSize() {
    const touchable =
      'maxTouchPoints' in navigator
        ? navigator.maxTouchPoints > 0
        : 'ontouchstart' in window;
    if (this.state.touchable !== touchable) {
      // Display larger button on the touch screen
      if (touchable) {
        addClass(this.state.root, 'o-e-touch');
      } else {
        removeClass(this.state.root, 'o-e-touch');
      }
      this.state.touchable = touchable;
    }
  }

  private updatePosRight(value: SafeAreaValue) {
    applyStyle(this.state.root, {
      right: CSS_util.px(value.right),
    });
  }

  private updatePosTop() {
    const { clientHeight: winH } = getHtml();
    const { offsetHeight: toggleH } = this.state.root;
    const { top, bottom } = SafeAreaObserver.value;

    const cachePosY = +localStorage[CACHE_POS_TOP_ID] || 0;
    const safePosY = clamp(
      cachePosY - toggleH / 2,
      top,
      winH - toggleH - bottom,
    );

    applyStyle(this.state.root, {
      top: CSS_util.px(safePosY),
    });
  }

  private dispatchChange() {
    // Let the button lose focus to prevent the click event from being accidentally triggered by pressing the Enter key or the Space bar.
    this.state.button.blur();
    // Prevents the click event from being triggered by the end of the drag
    if (!this.state.dnding) {
      this.dispatchEvent(new CustomEvent('change'));
    }
  }
}
