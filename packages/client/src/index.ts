import { onDocumentReady } from './event';
import { type Options, setOptions } from './options';
import { setupBridge } from './bridge';
import { setupInspector } from './inspector';
import { setupUI } from './ui';
import { isTopWindow } from './utils/topWindow';
import { CURRENT_INSPECT_ID } from './constants';

export { Options };

/**
 * 初始化编辑器客户端
 * @param opts - 编辑器配置对象，包含各子系统所需参数
 */
export function setupClient(opts: Options) {
  //  DOM 就绪后执行初始化序列
  onDocumentReady(() => {
    // 单例控制
    if (window.__OPEN_EDITOR_SETUPED__) {
      return;
    }
    window.__OPEN_EDITOR_SETUPED__ = true;
    console.log('[OpenEditor] ' + (isTopWindow ? 'TopWindow ' : 'SubWindow ') + CURRENT_INSPECT_ID);

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
