import { createStyleController } from '../utils/createStyleController';

/**
 * 全局样式覆盖模块
 * 作用：强制修改浏览器默认行为，用于特殊场景下的交互限制
 */
const overrideCSS = css`
  /* 全局选择器重置 */
  * {
    /* 强制系统默认光标样式 */
    cursor: default !important;

    /* 禁止用户选中文本/图像 */
    user-select: none !important;

    /* 禁用触摸滚动行为 */
    touch-action: none !important;

    /* 屏蔽iOS长按弹出菜单 */
    -webkit-touch-callout: none !important;
  }
`;
export const overrideStyle = createStyleController(overrideCSS);

/**
 * 交互效果样式模块
 * 包含：
 * 1. 屏幕锁定样式
 * 2. 加载状态样式
 * 3. 事件阻止层样式
 */
const effectCSS = css`
  /* 屏幕锁定样式类
   * 应用场景：模态框弹出时防止背景滚动
   */
  .oe-lock-screen {
    overflow: hidden !important;
  }

  /* 全局加载状态样式类
   * 应用场景：异步操作时提示等待
   */
  .oe-loading * {
    cursor: wait !important;
  }

  /* 事件阻止覆盖层样式
   * 功能特性：
   * - 全屏覆盖阻挡底层交互
   * - 透明显示但能捕获事件
   * - 最高层级保证覆盖顺序
   */
  .oe-event-blocker {
    /* 定位方式 */
    position: fixed;
    inset: 0; /* 替代top/right/bottom/left声明 */

    /* 视觉表现 */
    opacity: 0;

    /* 层级控制 */
    z-index: 2147483647; /* 32位最大安全整数 */
  }
`;
export const effectStyle = createStyleController(effectCSS);
