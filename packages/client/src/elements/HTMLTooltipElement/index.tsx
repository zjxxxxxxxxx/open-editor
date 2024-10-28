import { clamp } from '@open-editor/shared';
import {
  getHtml,
  CSS_util,
  applyStyle,
  addClass,
  removeClass,
  checkVisibility,
} from '../../utils/dom';
import { checkValidElement } from '../../utils/checkElement';
import { getDOMRect } from '../../utils/getDOMRect';
import {
  createSafeAreaObserver,
  type SafeAreaObserver,
} from '../../utils/createSafeAreaObserver';
import { type SourceCode, resolveSource } from '../../resolve';
import { type BoxRect } from '../utils/getBoxModel';
import { HTMLCustomElement } from '../HTMLCustomElement';

const OFFSET = 6;

export class HTMLTooltipElement extends HTMLCustomElement<{
  root: HTMLElement;
  tag: HTMLElement;
  comp: HTMLElement;
  file: HTMLElement;
}> {
  private declare safeAreaObserver: SafeAreaObserver;

  constructor() {
    super();

    this.safeAreaObserver = createSafeAreaObserver();

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.update = this.update.bind(this);
  }

  override host() {
    return (
      <>
        <link rel="stylesheet" href="./index.css" />
        <div className="oe-root" ref={(el) => (this.state.root = el)}>
          <div className="oe-content">
            <span className="oe-tag" ref={(el) => (this.state.tag = el)}>
              {/* el textContent */}
            </span>
            <span className="oe-comp" ref={(el) => (this.state.comp = el)}>
              {/* comp textContent */}
            </span>
            <span className="oe-file" ref={(el) => (this.state.file = el)}>
              {/* file textContent */}
            </span>
          </div>
        </div>
      </>
    );
  }

  open() {
    addClass(this.state.root, 'oe-show');
  }

  close() {
    removeClass(this.state.root, 'oe-show');
  }

  update(el: HTMLElement | null, rect: BoxRect) {
    // before hidden
    applyStyle(this.state.root, {
      visibility: 'hidden',
      transform: CSS_util.translate(OFFSET, OFFSET),
    });

    // When encountering an invalid element or an invisible element, hide it
    if (!checkValidElement(el) || !checkVisibility(el)) return;

    const source = resolveSource(el);
    if (source.meta) {
      this.updateText(source);
      this.updatePosition(rect);

      // after visible
      applyStyle(this.state.root, {
        visibility: 'visible',
      });
    }
  }

  private updateText(source: SourceCode) {
    const { el, meta } = source;
    this.state.tag.textContent = `${el} in `;
    this.state.comp.textContent = `<${meta!.name}>`;
    this.state.file.textContent = `${meta!.file}:${meta!.line}:${meta!.column}`;
  }

  private updatePosition(rect: BoxRect) {
    const {
      // window width excluding the scrollbar width
      clientWidth: winW,
      // window height excluding the scrollbar height
      clientHeight: winH,
    } = getHtml();
    const { width: rootW, height: rootH } = getDOMRect(this.state.root);
    const { value: safe } = this.safeAreaObserver;

    const onTopArea = rect.top > rootH + safe.top + OFFSET * 2;
    const top = clamp(
      onTopArea ? rect.top - rootH - OFFSET : rect.bottom + OFFSET,
      safe.top + OFFSET,
      winH - rootH - safe.bottom - OFFSET,
    );
    const left = clamp(
      rect.left,
      safe.left + OFFSET,
      winW - rootW - safe.right - OFFSET,
    );

    applyStyle(this.state.root, {
      transform: CSS_util.translate(left, top),
    });
  }
}
