import { type RectBox } from '../../utils/getRectBoxs';
import { clamp } from '../../utils/util';
import {
  getDOMRect,
  getHtml,
  CSS_util,
  applyStyle,
  addClass,
  removeClass,
} from '../../utils/ui';
import { SafeAreaObserver } from '../../utils/SafeAreaObserver';
import { isValidElement } from '../../utils/isValidElement';
import { type SourceCode, resolveSource } from '../../resolve';
import { HTMLCustomElement } from '../HTMLCustomElement';

const OFFSET = 6;

export class HTMLTooltipElement extends HTMLCustomElement<{
  root: HTMLElement;
  tag: HTMLElement;
  comp: HTMLElement;
  file: HTMLElement;
}> {
  constructor() {
    super();
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

  update(el: HTMLElement | null, box: RectBox) {
    // before hidden
    applyStyle(this.state.root, {
      visibility: 'hidden',
      top: CSS_util.px(OFFSET),
      left: CSS_util.px(OFFSET),
    });

    if (!isValidElement(el)) return;

    const source = resolveSource(el);
    if (source.meta) {
      this.updateText(source);
      this.updatePosition(box);

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

  private updatePosition(box: RectBox) {
    const {
      // window width excluding the scrollbar width
      clientWidth: winW,
      // window height excluding the scrollbar height
      clientHeight: winH,
    } = getHtml();
    const { width: rootW, height: rootH } = getDOMRect(this.state.root);
    const { value: safe } = SafeAreaObserver;
    const onTopArea = box.top > rootH + safe.top + OFFSET * 2;
    const top = clamp(
      onTopArea ? box.top - rootH - OFFSET : box.bottom + OFFSET,
      safe.top + OFFSET,
      winH - rootH - safe.bottom - OFFSET,
    );
    const left = clamp(
      box.left,
      safe.left + OFFSET,
      winW - rootW - safe.right - OFFSET,
    );

    applyStyle(this.state.root, {
      top: CSS_util.px(top),
      left: CSS_util.px(left),
    });
  }
}
