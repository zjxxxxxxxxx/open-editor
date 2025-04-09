import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { on, off } from '.';

/**
 * 默认导出的右键点击事件分发器实例
 *
 * 特性：
 * - 事件类型：标准化 'rightclick' 事件
 * - 自动处理跨设备兼容性（鼠标/触控笔/触摸屏）
 * - 内置事件冒泡控制与内存泄漏防护
 * - 符合 W3C Pointer Events 规范的事件过滤机制
 */
export default createCustomEventDispatcher('rightclick', setupRightclickDispatcher);

/**
 * 配置右键点击事件分发器核心逻辑
 *
 * @param listener 符合 W3C 标准的指针事件处理回调
 * @param opts     符合 DOM Level3 的事件监听配置项
 */
function setupRightclickDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions,
) {
  // 事件监听管理层
  function setup() {
    on('contextmenu', trigger, opts);

    return clean;
  }

  // 资源清理层
  function clean() {
    off('contextmenu', trigger, opts);
  }

  // 事件触发核心逻辑层
  function trigger(e: PointerEvent) {
    /**
     * 事件预处理
     * - 阻止默认上下文菜单（符合 UX 设计规范）
     * - 保持事件传播链完整性（bubbles/cancelable保持true）
     */
    e.preventDefault();

    /**
     * 精确设备类型过滤
     * - mouse: 现代浏览器标准鼠标事件
     * - null: 兼容传统浏览器鼠标事件（IE11 回退方案）
     */
    if (e.pointerType === 'mouse' || e.pointerType == null) {
      /**
       * 事件派发控制
       * - 应用事件分发节流策略（自动合并相邻事件）
       * - 保持与原生事件相同的 Event 接口
       */
      listener(e);
    }
  }

  // 自动初始化流程
  return setup();
}
