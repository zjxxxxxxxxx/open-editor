import { clamp } from '@open-editor/shared';
import {
  getHtml,
  CSS_util,
  applyStyle,
  addClass,
  removeClass,
} from '../utils/dom';
import { getDOMRect } from '../utils/getDOMRect';
import { safeArea } from '../utils/safeArea';
import {
  enableBridge,
  exitBridge,
  boxModelBridge,
  sourceBridge,
} from '../bridge';

export function TooltipUI() {
  const OFFSET = 6;
  const state = {} as {
    root: HTMLElement;
    tag: HTMLElement;
    comp: HTMLElement;
    file: HTMLElement;
  };

  enableBridge.on(() => {
    addClass(state.root, 'oe-tooltip-show');
  });

  exitBridge.on(() => {
    removeClass(state.root, 'oe-tooltip-show');
  });

  sourceBridge.on((source) => {
    // before hidden
    applyStyle(state.root, {
      visibility: 'hidden',
      transform: CSS_util.translate(OFFSET, OFFSET),
    });

    if (source?.meta) {
      state.tag.textContent = `${source.el} in `;
      state.comp.textContent = `<${source.meta.name}>`;
      state.file.textContent = `${source.meta.file}:${source.meta.line}:${source.meta.column}`;

      // after visible
      applyStyle(state.root, {
        visibility: 'visible',
      });
    }
  });

  boxModelBridge.on((rect) => {
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
  });

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
