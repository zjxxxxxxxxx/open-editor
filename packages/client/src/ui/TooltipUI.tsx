import { clamp } from '@open-editor/shared';
import {
  getHtml,
  CSS_util,
  applyStyle,
  addClass,
  removeClass,
  checkVisibility,
} from '../utils/dom';
import { checkValidElement } from '../utils/checkElement';
import { getDOMRect } from '../utils/getDOMRect';
import { type SourceCode, resolveSource } from '../resolve';
import { safeArea } from './utils/safeArea';
import { type BoxRect } from './utils/getBoxModel';

export function TooltipUI(props: { ref: AnyObject }) {
  const OFFSET = 6;

  const state = {} as {
    root: HTMLElement;
    tag: HTMLElement;
    comp: HTMLElement;
    file: HTMLElement;
  };

  props.ref.open = function open() {
    addClass(state.root, 'oe-tooltip-show');
  };

  props.ref.close = function close() {
    removeClass(state.root, 'oe-tooltip-show');
  };

  props.ref.update = function update(el: HTMLElement | null, rect: BoxRect) {
    // before hidden
    applyStyle(state.root, {
      visibility: 'hidden',
      transform: CSS_util.translate(OFFSET, OFFSET),
    });

    // When encountering an invalid element or an invisible element, hide it
    if (!checkValidElement(el) || !checkVisibility(el)) return;

    const source = resolveSource(el);
    if (source.meta) {
      updateText(source);
      updatePosition(rect);

      // after visible
      applyStyle(state.root, {
        visibility: 'visible',
      });
    }
  };

  function updateText(source: SourceCode) {
    const { el, meta } = source;
    state.tag.textContent = `${el} in `;
    state.comp.textContent = `<${meta!.name}>`;
    state.file.textContent = `${meta!.file}:${meta!.line}:${meta!.column}`;
  }

  function updatePosition(rect: BoxRect) {
    const {
      // window width excluding the scrollbar width
      clientWidth: winW,
      // window height excluding the scrollbar height
      clientHeight: winH,
    } = getHtml();
    const { width: rootW, height: rootH } = getDOMRect(state.root);

    const onTopArea = rect.top > rootH + safeArea.top + OFFSET * 2;
    const top = clamp(
      onTopArea ? rect.top - rootH - OFFSET : rect.bottom + OFFSET,
      safeArea.top + OFFSET,
      winH - rootH - safeArea.bottom - OFFSET,
    );
    const left = clamp(
      rect.left,
      safeArea.left + OFFSET,
      winW - rootW - safeArea.right - OFFSET,
    );

    applyStyle(state.root, {
      transform: CSS_util.translate(left, top),
    });
  }

  return (
    <div className="oe-tooltip" ref={(el) => (state.root = el)}>
      <div className="oe-tooltip-content">
        <span className="oe-tooltip-tag" ref={(el) => (state.tag = el)}>
          {/* el textContent */}
        </span>
        <span className="oe-tooltip-comp" ref={(el) => (state.comp = el)}>
          {/* comp textContent */}
        </span>
        <span className="oe-tooltip-file" ref={(el) => (state.file = el)}>
          {/* file textContent */}
        </span>
      </div>
    </div>
  );
}
