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

export class HTMLTooltipElementConstructor
  extends HTMLCustomElement<{
    root: HTMLElement;
    el: HTMLElement;
    comp: HTMLElement;
    file: HTMLElement;
  }>
  implements HTMLTooltipElement
{
  host() {
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

  connectedCallback() {}
  disconnectedCallback() {}

  open = () => {
    addClass(this.state.root, 'oe-show');
  };

  close = () => {
    removeClass(this.state.root, 'oe-show');
  };

  update = (el: HTMLElement | null, box: RectBox) => {
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
  };

  private updateText(source: SourceCode) {
    const { el, meta } = source;
    this.state.el.innerText = `${el} in `;
    this.state.comp.innerText = `<${meta!.name}>`;
    this.state.file.innerText = `${meta!.file}:${meta!.line}:${meta!.column}`;
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

    const topArea = box.top > rootH + offset * 2 + safe.top;
    const posTop = clamp(
      topArea ? box.top - rootH - offset : box.bottom + offset,
      offset + safe.top,
      winH - rootH - offset - safe.bottom,
    );
    const posLeft = clamp(
      box.left,
      offset + safe.left,
      winW - rootW - offset - safe.right,
    );

    applyStyle(this.state.root, {
      top: CSS_util.px(posTop),
      left: CSS_util.px(posLeft),
    });
  }
}
