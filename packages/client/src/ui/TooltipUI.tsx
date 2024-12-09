import { clamp } from '@open-editor/shared';
import { mitt } from '../utils/mitt';
import { CSS_util, applyStyle, addClass, removeClass } from '../utils/dom';
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
  const RENDER_RESERVE_SIZE = 4;

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
      transform: CSS_util.translate(RENDER_RESERVE_SIZE, RENDER_RESERVE_SIZE),
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
    // window (width|height) excluding the scrollbar (width|height)
    const { clientWidth: winW, clientHeight: winH } = document.documentElement;
    const { width: rootW, height: rootH } = getDOMRect(state.root);

    const minRenderX = safeArea.left + RENDER_RESERVE_SIZE;
    const maxRenderX = winW - rootW - safeArea.right - RENDER_RESERVE_SIZE;
    const renderX = clamp(rect.left, minRenderX, maxRenderX);

    const minAvailableY = rootH + safeArea.top + RENDER_RESERVE_SIZE * 2;
    const isRenderOnTop = rect.top > minAvailableY;
    const renderOnTopY = rect.top - rootH - RENDER_RESERVE_SIZE;
    const renderOnBottomY = rect.bottom + RENDER_RESERVE_SIZE;
    const minRenderY = safeArea.top + RENDER_RESERVE_SIZE;
    const maxRenderY = winH - rootH - safeArea.bottom - RENDER_RESERVE_SIZE;
    const renderY = clamp(isRenderOnTop ? renderOnTopY : renderOnBottomY, minRenderY, maxRenderY);

    applyStyle(state.root, {
      visibility: 'visible',
      transform: CSS_util.translate(renderX, renderY),
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
