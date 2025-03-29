/**
 * 创建右键点击事件分发器模块
 *
 * @设计原则
 * 1. 实现与原生事件解耦的自定义事件体系
 * 2. 自动处理事件监听的生命周期管理
 * 3. 精确识别鼠标右键操作
 */

import {
  type SetupDispatcherListener,
  type SetupDispatcherListenerOptions,
  createCustomEventDispatcher,
} from './create';
import { on, off } from '.';

/**
 * 默认导出右键点击事件分发器实例
 *
 * @特性
 * - 事件类型：'rightclick'
 * - 自动绑定上下文菜单事件监听
 * - 精确过滤非鼠标右键操作
 */
export default createCustomEventDispatcher('rightclick', setupRightclickDispatcher);

/**
 * 配置右键点击事件分发器
 *
 * @参数说明
 * @param listener 事件监听回调函数
 * @param opts     监听器配置选项
 *
 * @生命周期
 * 1. 初始化时自动注册事件监听
 * 2. 返回清理函数供外部手动解除监听
 */
function setupRightclickDispatcher(
  listener: SetupDispatcherListener,
  opts: SetupDispatcherListenerOptions,
) {
  // 事件触发器逻辑层
  function trigger(e: PointerEvent) {
    e.preventDefault();

    /**
     * 精确识别鼠标右键操作：
     * - pointerType为null时表示传统鼠标事件
     * - pointerType显式声明为mouse时表示现代浏览器鼠标事件
     * - 过滤触控笔（pen）和触摸（touch）等非鼠标操作
     */
    if (e.pointerType == null || e.pointerType === 'mouse') {
      listener(e);
    }
  }

  // 事件监听管理层
  function setup() {
    /**
     * 注册全局上下文菜单事件监听：
     * - 使用配置选项传递事件参数
     * - 自动绑定事件处理器与清理逻辑
     */
    on('contextmenu', trigger, opts);

    return clean;
  }

  // 资源清理层
  function clean() {
    /**
     * 解除事件监听：
     * - 精确匹配注册时的事件参数
     * - 避免内存泄漏风险
     */
    off('contextmenu', trigger, opts);
  }

  // 自动初始化事件监听
  return setup();
}
