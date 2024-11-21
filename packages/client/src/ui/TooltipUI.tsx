import { clamp } from '@open-editor/shared';
import { mitt } from '../utils/mitt';
import {
  getHtml,
  CSS_util,
  applyStyle,
  addClass,
  removeClass,
} from '../utils/dom';
import { getDOMRect } from '../utils/getDOMRect';
import { safeArea } from '../utils/safeArea';
import { type BoxRect } from '../inspector/getBoxModel';
import { type CodeSource } from '../resolve';
import {
  inspectorEnableBridge,
  inspectorExitBridge,
  boxModelBridge,
  codeSourceBridge,
} from '../bridge';

export function TooltipUI() {
  const OFFSET = 6;
  const state = {} as {
    root: HTMLElement;
    tag: HTMLElement;
    comp: HTMLElement;
    file: HTMLElement;
    isPending: boolean;
  };
  const pending = mitt();

  inspectorEnableBridge.on(() => {
    addClass(state.root, 'oe-tooltip-show');
  });

  inspectorExitBridge.on(() => {
    removeClass(state.root, 'oe-tooltip-show');
    updateSource();
  });

  codeSourceBridge.on(updateSource);

  boxModelBridge.on((rect) => {
    if (state.isPending) {
      pending.once(() => updateRect(rect));
    } else {
      updateRect(rect);
    }
  });

  function updateSource(source?: CodeSource) {
    state.isPending = true;

    // before hidden
    applyStyle(state.root, {
      visibility: 'hidden',
      transform: CSS_util.translate(OFFSET, OFFSET),
    });

    if (source?.meta) {
      state.tag.textContent = `${source.el} in `;
      state.comp.textContent = `<${source.meta.name}>`;
      state.file.textContent = `${source.meta.file}:${source.meta.line}:${source.meta.column}`;

      state.isPending = false;
      pending.emit();
    }
  }

  function updateRect(rect: BoxRect) {
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
      visibility: 'visible',
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
