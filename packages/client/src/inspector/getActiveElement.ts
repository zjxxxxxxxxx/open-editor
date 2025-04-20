import { checkValidElement } from '../utils/checkElement';
import { on, onDocumentReady } from '../event';
import { inspectorState } from './inspectorState';

/**
 * 光标跟踪状态接口
 */
export interface CursorTracker {
  /**
   * 标记光标是否离开浏览器视口
   */
  isOutsideViewport: boolean;
  /**
   * 光标在视口坐标系中的水平位置（基于 clientX）
   */
  viewportX: number;
  /**
   * 光标在视口坐标系中的垂直位置（基于 clientY）
   */
  viewportY: number;
}

// 全局光标状态追踪器（使用冻结对象防止意外修改）
const cursorState: CursorTracker = {
  isOutsideViewport: false,
  viewportX: 0,
  viewportY: 0,
};

// 等待 DOM 就绪后执行初始化
onDocumentReady(initCursorTracking);

/**
 * 获取当前光标位置下的有效DOM元素
 * @returns 符合校验规则的元素或 null
 *
 * 实现要点：
 * 1. 依赖 inspectorState 控制功能开关
 * 2. 当光标移出视口时立即返回 null
 * 3. 使用 elementFromPoint API 获取精确元素
 */
export function getActiveElement() {
  // 双重状态检查确保功能可靠性
  if (!inspectorState.isActive || cursorState.isOutsideViewport) {
    return null;
  }

  // 基于物理坐标获取元素（可能穿透部分 CSS 效果）
  const el = document.elementFromPoint(
    cursorState.viewportX,
    cursorState.viewportY,
  ) as HTMLElement | null;

  return checkValidElement(el) ? el : null;
}

/**
 * 初始化光标追踪系统
 *
 * 设计说明：
 * - 使用 capture 阶段监听确保优先处理
 * - 选择 clientX/Y 而非 pageX/Y 避免滚动偏移
 * - 通过 mouseout 事件检测光标离开视口
 */
function initCursorTracking() {
  // 实时更新光标坐标（高频事件）
  on(
    'mousemove',
    (e: PointerEvent) => {
      // 使用 client 坐标系保证视口相对性
      cursorState.viewportX = e.clientX;
      cursorState.viewportY = e.clientY;
      // 重置视口状态（移动即代表在视口内）
      cursorState.isOutsideViewport = false;
    },
    { capture: true },
  );

  // 检测光标离开视口边界
  on(
    'mouseout',
    (e: PointerEvent) => {
      /* 
          事件逻辑说明：
          - relatedTarget 为 null 表示移出文档
          - 非 null 时为移入的新元素（需额外判断文档根元素）
        */
      cursorState.isOutsideViewport =
        e.relatedTarget == null || e.relatedTarget === document.documentElement;
    },
    { capture: true },
  );
}
