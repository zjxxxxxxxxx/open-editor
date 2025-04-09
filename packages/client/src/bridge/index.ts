/* ---------------------------- 模块导入区域 ---------------------------- */
// 检查器相关桥接器
import { inspectorActiveBridge } from './inspectorActiveBridge'; // 激活状态桥接
import { inspectorEnableBridge } from './inspectorEnableBridge'; // 启用状态桥接
import { inspectorExitBridge } from './inspectorExitBridge'; // 退出行为桥接

// 编辑器相关桥接器
import { openEditorBridge } from './openEditorBridge'; // 编辑器主桥接
import { openEditorStartBridge } from './openEditorStartBridge'; // 启动阶段桥接
import { openEditorEndBridge } from './openEditorEndBridge'; // 完成阶段桥接
import { openEditorErrorBridge } from './openEditorErrorBridge'; // 异常处理桥接

// 树形结构桥接器
import { treeOpenBridge } from './treeOpenBridge'; // 树形展开桥接
import { treeCloseBridge } from './treeCloseBridge'; // 树形关闭桥接

// 核心功能桥接器
import { codeSourceBridge } from './codeSourceBridge'; // 代码源桥接
import { boxModelBridge } from './boxModelBridge'; // 盒模型桥接

/* ---------------------------- 初始化函数 ---------------------------- */

/**
 * 桥接器初始化入口，集中初始化所有功能模块的跨 iframe 通信能力
 */
export function setupBridge() {
  // 初始化检查器相关模块
  inspectorActiveBridge.setup(); // 激活状态监听
  inspectorEnableBridge.setup(); // 启用状态同步
  inspectorExitBridge.setup(); // 退出行为处理

  // 初始化核心功能模块
  codeSourceBridge.setup(); // 代码源同步
  boxModelBridge.setup(); // 盒模型数据传递

  // 初始化树形结构模块
  treeOpenBridge.setup(); // 树形展开事件
  treeCloseBridge.setup(); // 树形关闭事件

  // 初始化编辑器流程模块
  openEditorBridge.setup(); // 主编辑器流程
  openEditorStartBridge.setup(); // 启动阶段事件
  openEditorEndBridge.setup(); // 完成阶段事件
  openEditorErrorBridge.setup(); // 异常处理流程
}

/* ---------------------------- 模块导出区域 ---------------------------- */

/**
 * 检查器状态控制桥接器集合，处理检查器组件的激活、启用、退出等状态同步
 */
export {
  inspectorActiveBridge, // 激活状态跨 iframe 同步
  inspectorEnableBridge, // 启用状态跨 iframe 同步
  inspectorExitBridge, // 退出行为跨 iframe 通知
};

/**
 * 编辑器生命周期桥接器集合，管理编辑器完整生命周期的事件通信
 */
export {
  openEditorBridge, // 主编辑器打开/关闭通信
  openEditorStartBridge, // 编辑器启动阶段通信
  openEditorEndBridge, // 编辑器正常关闭通信
  openEditorErrorBridge, // 编辑器异常终止通信
};

/**
 * 结构操作桥接器集合，处理树形结构和盒模型等 UI 操作通信
 */
export {
  treeOpenBridge, // 树形结构展开操作通信
  treeCloseBridge, // 树形结构关闭操作通信
  boxModelBridge, // 盒模型参数调整通信
};

/**
 * 核心数据桥接器，负责代码源数据同步等核心功能
 */
export {
  codeSourceBridge, // 代码源数据跨 iframe 同步
};
