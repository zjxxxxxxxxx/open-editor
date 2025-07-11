import { createStyleController } from './createStyleController';
import { on, onDocumentReady } from '../event';
import { createStyleGetter } from './dom';
import { mitt } from './mitt';

/**
 * 安全区域尺寸结构体
 * 描述设备屏幕四周的安全内边距（如刘海屏、底部手势条区域）
 */
export interface SafeArea {
  // 顶部安全距离（单位 px）
  top: number;
  // 右侧安全距离
  right: number;
  // 底部安全距离
  bottom: number;
  // 左侧安全距离
  left: number;
}

// 创建事件发射器，用于安全区域变化通知
export const safeAreaObserver = mitt<[SafeArea]>();

/**
 * 定义 CSS 安全区域变量的全局样式
 * 通过 env() 函数获取设备环境变量，映射为 CSS 自定义属性
 */
const safeAreaCSS = css`
  :root {
    --oe-sait: env(safe-area-inset-top); /* 顶部安全区域 */
    --oe-sair: env(safe-area-inset-right); /* 右侧安全区域 */
    --oe-saib: env(safe-area-inset-bottom); /* 底部安全区域 */
    --oe-sail: env(safe-area-inset-left); /* 左侧安全区域 */
  }
`;

// 全局安全区域值存储
export let safeArea: SafeArea;

// 等待 DOM 就绪后执行初始化
onDocumentReady(initSafeAreaSystem);

/**
 * 初始化安全区域监控系统
 * 包含样式注入、初始值计算、屏幕方向变化监听
 */
function initSafeAreaSystem() {
  // 1. 注入全局 CSS 变量定义
  createStyleController(safeAreaCSS).mount();

  // 2. 计算初始安全区域值
  refreshSafeAreaValues();

  // 3. 监听屏幕方向变化（同时兼容设备旋转和折叠屏状态变化）
  const orientationMedia = matchMedia('(orientation: portrait)');
  on('change', refreshSafeAreaValues, { target: orientationMedia });
}

/**
 * 更新安全区域数值并触发事件
 * 通过计算当前 CSS 自定义属性值获取最新安全区域尺寸
 */
function refreshSafeAreaValues() {
  // 获取 body 元素的计算样式（包含动态更新的 CSS 变量）
  const getStyle = createStyleGetter(document.body);

  // 更新全局安全区域对象
  safeArea = {
    top: getStyle('--oe-sait'),
    right: getStyle('--oe-sair'),
    bottom: getStyle('--oe-saib'),
    left: getStyle('--oe-sail'),
  };

  // 发布安全区域变更事件
  safeAreaObserver.emit(safeArea);
}
