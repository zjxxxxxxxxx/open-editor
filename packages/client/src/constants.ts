/* --------------------------- DOM元素标识 --------------------------- */

/**
 * 检查器DOM元素标识
 * 用于定位页面中的编辑器检查器根节点
 */
export const HTML_INSPECTOR_ELEMENT = 'open-editor-inspector';
export const HTML_INSPECTOR_ELEMENT_TAG_NAME = 'OPEN-EDITOR-INSPECTOR';

/* --------------------------- 环境检测常量 --------------------------- */

/**
 * 是否处于浏览器环境
 * 用于区分服务端渲染场景
 */
export const IS_CLIENT = typeof window !== 'undefined';

/**
 * 是否Firefox浏览器
 * 用于处理浏览器特定兼容逻辑
 */
export const IS_FIREFOX = IS_CLIENT && /firefox/i.test(navigator.userAgent);

/* --------------------------- 随机标识常量 --------------------------- */

/**
 * 当前检查会话ID
 * 生成规则：8位16进制随机数，保证同页面多实例隔离
 */
export const CURRENT_INSPECT_ID = Math.random().toString(16).substring(2, 10);

/* --------------------------- 核心事件名称常量 --------------------------- */

/**
 * 启用检查器事件
 * 触发时机：当用户激活组件检查功能时
 */
export const ENABLE_INSPECTOR_EVENT = 'enableinspector';

/**
 * 退出检查模式事件
 * 触发时机：当用户关闭检查器或切换页面时
 */
export const EXIT_INSPECTOR_EVENT = 'exitinspector';

/**
 * 打开编辑器主事件
 * 触发时机：用户确认要打开代码编辑器时
 */
export const OPEN_EDITOR_EVENT = 'openeditor';

/* --------------------------- 跨iframe通信事件 --------------------------- */

/**
 * 检查器激活状态同步事件
 * 作用场景：跨iframe同步检查器激活/禁用状态
 */
export const INSPECTOR_ACTIVE_CROSS_IFRAME = 'oe:INSPECTOR_ACTIVE_CROSS_IFRAME';

/**
 * 检查器启用状态同步事件
 * 作用场景：跨iframe控制检查器可用性状态
 */
export const INSPECTOR_ENABLE_CROSS_IFRAME = 'oe:INSPECTOR_ENABLE_CROSS_IFRAME';

/**
 * 退出检查模式广播事件
 * 作用场景：跨iframe统一退出检查器模式
 */
export const INSPECTOR_EXIT_CROSS_IFRAME = 'oe:INSPECTOR_EXIT_CROSS_IFRAME';

/**
 * 代码源数据同步事件
 * 作用场景：跨iframe同步当前组件的源码信息
 */
export const CODE_SOURCE_CROSS_IFRAME = 'oe:CODE_SOURCE_CROSS_IFRAME';

/**
 * 盒模型参数同步事件
 * 作用场景：跨iframe传递元素的盒模型计算值
 */
export const BOX_MODEL_CROSS_IFRAME = 'oe:BOX_MODEL_CROSS_IFRAME';

/**
 * 树形结构展开事件
 * 作用场景：跨iframe同步组件树展开操作
 */
export const TREE_OPEN_CROSS_IFRAME = 'oe:TREE_OPEN_CROSS_IFRAME';

/**
 * 树形结构关闭事件
 * 作用场景：跨iframe同步组件树折叠操作
 */
export const TREE_CLOSE_CROSS_IFRAME = 'oe:TREE_CLOSE_CROSS_IFRAME';

/**
 * 编辑器主流程事件
 * 作用场景：跨iframe协调编辑器打开流程
 */
export const OPEN_EDITOR_CROSS_IFRAME = 'oe:OPEN_EDITOR_CROSS_IFRAME';

/**
 * 编辑器启动事件
 * 触发时机：跨iframe通知编辑器启动阶段开始
 */
export const OPEN_EDITOR_START_CROSS_IFRAME = 'oe:OPEN_EDITOR_START_CROSS_IFRAME';

/**
 * 编辑器完成事件
 * 触发时机：跨iframe通知编辑器正常结束流程
 */
export const OPEN_EDITOR_END_CROSS_IFRAME = 'oe:OPEN_EDITOR_END_CROSS_IFRAME';

/**
 * 编辑器异常事件
 * 触发时机：跨iframe传递编辑器流程中的错误信息
 */
export const OPEN_EDITOR_ERROR_CROSS_IFRAME = 'oe:OPEN_EDITOR_ERROR_CROSS_IFRAME';
