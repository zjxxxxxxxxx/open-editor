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

const offset = 6;

export class HTMLTooltipElement extends HTMLCustomElement<{
  root: HTMLElement;
  el: HTMLElement;
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
          <span ref={(el) => (this.state.el = el)} />
          <span className="oe-comp" ref={(el) => (this.state.comp = el)} />
          <div className="oe-file" ref={(el) => (this.state.file = el)} />
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
      top: CSS_util.px(offset),
      left: CSS_util.px(offset),
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
    this.state.el.textContent = `${el} in `;
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

    const onTopArea = box.top > rootH + offset * 2 + safe.top;
    const top = clamp(
      onTopArea ? box.top - rootH - offset : box.bottom + offset,
      offset + safe.top,
      winH - rootH - offset - safe.bottom,
    );
    const left = clamp(
      box.left,
      offset + safe.left,
      winW - rootW - offset - safe.right,
    );
    applyStyle(this.state.root, {
      top: CSS_util.px(top),
      left: CSS_util.px(left),
    });
  }
}
