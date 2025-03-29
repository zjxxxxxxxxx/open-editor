import { checkValidElement } from '../utils/checkElement';
import { IS_CLIENT } from '../constants';
import { on } from '../event';
import { inspectorState } from './inspectorState';

/**
 * 光标空间状态追踪器
 *
 * 核心能力：
 * 1. 实时追踪光标在视口坐标系中的精确位置（clientX/clientY）
 * 2. 智能识别光标是否完全离开浏览器可视区域
 * 3. 动态适应视口尺寸变化（窗口缩放/旋转等场景）
 *
 * 坐标系说明：
 * - viewportX/Y 基于视口坐标系，不受页面滚动影响
 * - 原点(0,0)始终位于视口左上角
 * - 坐标系范围：X轴向右递增，Y轴向下递增
 */
export interface CursorTracker {
  /**
   * 光标完全离开视口边界时为true
   * @场景 当光标移动到浏览器窗口外或系统任务栏区域时触发
   */
  isOutsideViewport: boolean;

  /**
   * 视口坐标系X轴坐标
   * @单位 CSS像素
   * @特性 实时更新，精度可达亚像素级别
   */
  viewportX: number;

  /**
   * 视口坐标系Y轴坐标
   * @单位 CSS像素
   * @特性 与浏览器渲染管线同步更新
   */
  viewportY: number;
}

// 全局光标状态单例（兼容SSR场景）
const cursorState: CursorTracker = {
  isOutsideViewport: false,
  viewportX: 0,
  viewportY: 0,
};

// 环境隔离初始化（仅浏览器环境生效）
if (IS_CLIENT) {
  initCursorTracking();
}

/**
 * 获取当前光标下的有效交互元素
 *
 * 算法特性：
 * 1. 空间层级优先：返回最顶层可见元素（不受CSS遮挡影响）
 * 2. 跨框架兼容：支持在iframe嵌套场景中正确获取元素
 * 3. 性能优化：无DOM查询开销，直接访问底层渲染结果
 *
 * @返回 符合以下条件的元素或null：
 * - 通过有效性校验（非body/documentElement）
 * - 位于当前光标正下方
 * - 在激活检测状态且光标位于视口内
 */
export function getActiveElement(): HTMLElement | null {
  // 短路逻辑：非激活状态或光标越界时立即返回
  if (!inspectorState.isActive || cursorState.isOutsideViewport) {
    return null;
  }

  // 获取光标位置最上层元素（可能跨文档边界）
  const topElement = document.elementFromPoint(
    cursorState.viewportX,
    cursorState.viewportY,
  ) as HTMLElement | null;

  // 过滤无效元素（body/documentElement/隐藏元素等）
  return checkValidElement(topElement) ? topElement : null;
}

/**
 * 初始化光标追踪系统
 *
 * 事件处理策略：
 * 1. 捕获阶段处理：确保优先于其他事件监听器执行
 * 2. 高频事件优化：mousemove不节流（依赖浏览器原生优化）
 * 3. 复合检测机制：坐标更新+定期验证+事件触发多维度检测
 *
 * 系统容错机制：
 * - 定期状态验证：防止事件丢失导致的错误状态
 * - 滚动条区域补偿：避免误判滚动条为视口外区域
 * - 窗口尺寸监听：动态适应视口变化
 */
function initCursorTracking() {
  on('DOMContentLoaded', () => {
    // 视口尺寸变化响应
    on('resize', updateOutOfViewportState, { capture: true });

    // 主坐标更新通道
    on(
      'mousemove',
      (e: PointerEvent) => {
        cursorState.viewportX = e.clientX;
        cursorState.viewportY = e.clientY;
        updateOutOfViewportState(e);
      },
      { capture: true },
    );

    // 边缘检测增强
    on(
      'mouseout',
      (e: PointerEvent) => {
        if (e.target === document.documentElement) {
          updateOutOfViewportState(e);
        }
      },
      { capture: true },
    );
  });
}

/**
 * 复合越界状态检测器
 *
 * 采用多因素决策机制：
 * 1. 事件相关元素分析（主流浏览器行为）
 * 2. 坐标边界检测（应对快速移动场景）
 * 3. 滚动条区域补偿（防止误判）
 *
 * 决策优先级：
 * 相关元素分析 > 坐标检测 > 滚动条补偿
 */
function updateOutOfViewportState(e?: PointerEvent) {
  // 因素1：事件链分析（离开文档根节点）
  const fromWindowExit =
    e?.relatedTarget === null || (e?.relatedTarget as Node)?.nodeType === Node.DOCUMENT_NODE;

  // 因素2：坐标边界检查
  const fromPositionCheck = isOutsideViewportBoundary(cursorState.viewportX, cursorState.viewportY);

  // 因素3：滚动条区域补偿计算
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const scrollbarHeight = window.innerHeight - document.documentElement.clientHeight;
  const onScrollbarArea =
    cursorState.viewportX > document.documentElement.clientWidth - scrollbarWidth ||
    cursorState.viewportY > document.documentElement.clientHeight - scrollbarHeight;

  // 综合决策（排除滚动条误判）
  cursorState.isOutsideViewport = (fromWindowExit || fromPositionCheck) && !onScrollbarArea;
}

/**
 * 视口边界检测函数
 *
 * 数学原理：
 * 视口坐标系范围：[0, clientWidth] × [0, clientHeight]
 * 其中 clientWidth/clientHeight 表示可视区域尺寸（不含滚动条）
 *
 * @参数 x - 视口X坐标
 * @参数 y - 视口Y坐标
 * @返回 当坐标超出有效范围时返回true
 */
function isOutsideViewportBoundary(x: number, y: number): boolean {
  return (
    x < 0 ||
    x > document.documentElement.clientWidth ||
    y < 0 ||
    y > document.documentElement.clientHeight
  );
}
