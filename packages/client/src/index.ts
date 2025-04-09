import { on } from './event';
import { IS_CLIENT } from './constants';
import { type Options, setOptions } from './options';
import { setupBridge } from './bridge';
import { setupInspector } from './inspector';
import { setupUI } from './ui';

export { Options };

/**
 * 初始化编辑器客户端
 *
 * @param opts - 编辑器配置对象，包含各子系统所需参数
 *
 * 功能说明：执行客户端环境检测、配置注入、模块初始化等启动流程
 *
 * 执行策略：
 *   1. 采用单例模式避免重复初始化
 *   2. 在 DOM 就绪后启动子系统
 *   3. 严格的环境检测机制
 */
export function setupClient(opts: Options) {
  // 环境检测与单例控制
  if (IS_CLIENT && !window.__OPEN_EDITOR_SETUPED__) {
    window.__OPEN_EDITOR_SETUPED__ = true;

    //  DOM 就绪后执行初始化序列
    on('DOMContentLoaded', () => {
      // 配置注入阶段
      setOptions(opts);

      // 通信层初始化
      setupBridge();

      // 调试工具初始化
      setupInspector();

      // 用户界面初始化
      setupUI();
    });
  }
}
