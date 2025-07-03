import { isTopWindow } from '../utils/topWindow';
import { appendChild, replaceChild } from '../utils/dom';
import { openEditorErrorBridge } from '../bridge';
import { HTML_INSPECTOR_ELEMENT, IS_CLIENT } from '../constants';
import { getOptions } from '../options';
import { ToggleUI } from './ToggleUI';
import { OverlayUI } from './OverlayUI';
import { TooltipUI } from './TooltipUI';
import { TreeUI } from './TreeUI';

/**
 * 初始化编辑器 UI 系统
 * - 在跨 iframe 场景中，仅顶层窗口执行初始化
 * - 注册自定义元素并将其实例挂载到文档主体
 */
export function setupUI() {
  const { crossIframe } = getOptions();
  // 跨 iframe 且非顶层窗口，不初始化
  if (crossIframe && !isTopWindow) {
    return;
  }

  // 注册自定义元素标签
  customElements.define(HTML_INSPECTOR_ELEMENT, HTMLInspectorElement);

  // 创建并挂载检查器容器到页面主体
  appendChild(document.body, <HTML_INSPECTOR_ELEMENT />);
}

/**
 * 检查器元素
 */
class HTMLInspectorElement extends (IS_CLIENT ? HTMLElement : (class {} as typeof HTMLElement)) {
  /** 封闭的 Shadow DOM 根，用于样式与脚本隔离 */
  declare readonly shadowRoot: ShadowRoot;

  /** 当前活跃的错误消息元素引用 */
  declare private errorMessage: HTMLElement | null;

  constructor() {
    super();
    this.initShadowDOM();
  }

  /**
   * 在自定义元素上附加 closed 模式的 Shadow DOM，防止外部访问
   */
  private initShadowDOM() {
    Object.defineProperty(this, 'shadowRoot', {
      value: this.attachShadow({ mode: 'closed' }),
    });
  }

  /**
   * 当元素插入文档后自动调用
   * - 配置错误处理机制
   * - 渲染子级 UI 组件
   */
  public connectedCallback() {
    this.setupErrorHandling();
    this.renderUIComponents();
  }

  /**
   * 设置编辑器错误可视化处理
   */
  private setupErrorHandling() {
    openEditorErrorBridge.on(async (message) => {
      // 如果已有旧的错误提示，取消其所有动画并从 DOM 中移除
      if (this.errorMessage) {
        this.errorMessage.getAnimations().forEach((ani) => ani.cancel());
        this.errorMessage.remove();
      }

      // 创建并保存新的错误提示元素
      this.errorMessage = <div className="oe-error-message">{message}</div>;

      // 将新提示插入到 Shadow DOM 中
      appendChild(this.shadowRoot, this.errorMessage);

      // 对新提示执行抖动 + 淡出动画，确保总时长 2000ms
      await this.runAnimation(this.errorMessage);

      // 动画完毕后，移除提示并清空引用
      this.errorMessage.remove();
      this.errorMessage = null;
    });
  }

  /**
   * 对目标元素执行一次完整关键帧动画
   * - 0–300ms：抖动反馈
   * - 300–1900ms：保持静止且不透明
   * - 1900–2000ms：淡出至透明
   * 整体时长固定 2000ms，结束后保持最终帧状态
   *
   * @param element 需要执行动画的 HTMLElement
   * @returns Promise<Animation> 动画完成时的 Promise
   */
  private runAnimation(element: HTMLElement) {
    const total = 2000;
    const shakeDur = 300;
    const fadeStart = 1900;

    const keyframes: Keyframe[] = [
      // 抖动阶段：0 → 300ms
      { transform: 'translateX(-50%)', offset: 0 },
      { transform: 'translateX(calc(-50% - 8px))', offset: (shakeDur * 0.1) / total },
      { transform: 'translateX(calc(-50% + 8px))', offset: (shakeDur * 0.2) / total },
      { transform: 'translateX(calc(-50% - 6px))', offset: (shakeDur * 0.35) / total },
      { transform: 'translateX(calc(-50% + 6px))', offset: (shakeDur * 0.5) / total },
      { transform: 'translateX(calc(-50% - 4px))', offset: (shakeDur * 0.65) / total },
      { transform: 'translateX(calc(-50% + 4px))', offset: (shakeDur * 0.8) / total },
      { transform: 'translateX(-50%)', offset: shakeDur / total },

      // 保持阶段：300 → 1900ms
      { transform: 'translateX(-50%)', opacity: 1, offset: fadeStart / total },

      // 淡出阶段：1900 → 2000ms
      { transform: 'translateX(-50%)', opacity: 0, offset: 1 },
    ];

    const animation = element.animate(keyframes, {
      duration: total,
      easing: 'ease-in-out',
      fill: 'forwards',
    });

    return animation.finished;
  }

  /**
   * 渲染并更新 Shadow DOM 内的子级 UI 组件
   * - 注入样式表
   * - 可选渲染 ToggleUI
   * - 渲染核心的 OverlayUI、TooltipUI、TreeUI
   */
  private renderUIComponents() {
    const { displayToggle } = getOptions();

    replaceChild(
      this.shadowRoot,
      <>
        {/* 样式表注入 */}
        <link rel="stylesheet" href="./index.css" />

        {/* 切换按钮（可选） */}
        {displayToggle && <ToggleUI />}

        {/* 核心 UI 组件 */}
        <OverlayUI />
        <TooltipUI />
        <TreeUI />
      </>,
    );
  }
}
