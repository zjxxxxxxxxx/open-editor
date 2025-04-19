import { isTopWindow } from '../utils/topWindow';
import { appendChild, replaceChild } from '../utils/dom';
import { openEditorErrorBridge } from '../bridge';
import { on } from '../event';
import { HTML_INSPECTOR_ELEMENT, IS_CLIENT } from '../constants';
import { getOptions } from '../options';
import { ToggleUI } from './ToggleUI';
import { OverlayUI } from './OverlayUI';
import { TooltipUI } from './TooltipUI';
import { TreeUI } from './TreeUI';

/**
 * 初始化编辑器 UI 系统
 *
 * 职责：注册自定义元素并挂载到文档主体
 */
export function setupUI() {
  const { crossIframe } = getOptions();
  // 跨 iframe 场景下非顶层窗口不初始化
  if (crossIframe && !isTopWindow) return;

  // 注册自定义元素
  customElements.define(HTML_INSPECTOR_ELEMENT, HTMLInspectorElement);

  // 挂载到文档主体
  appendChild(document.body, <HTML_INSPECTOR_ELEMENT />);
}

/**
 * 自定义元素类：编辑器检查器容器
 *
 * 职责：管理 Shadow DOM 及子组件生命周期
 */
class HTMLInspectorElement extends (IS_CLIENT ? HTMLElement : (class {} as typeof HTMLElement)) {
  /** Shadow DOM 根节点 */
  declare readonly shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.initShadowDOM();
  }

  /**
   * 初始化 Shadow DOM，模式设置为 closed 防止外部访问
   */
  private initShadowDOM() {
    Object.defineProperty(this, 'shadowRoot', {
      value: this.attachShadow({ mode: 'closed' }),
    });
  }

  /**
   * 元素挂载回调
   *
   * 职责：配置错误处理和子组件渲染
   */
  public connectedCallback() {
    this.setupErrorHandling();
    this.renderUIComponents();
  }

  /**
   * 配置错误可视化处理，创建动画警示层并在动画结束后自动移除
   */
  private setupErrorHandling() {
    openEditorErrorBridge.on(() => {
      const errorOverlay = <div className="oe-error-overlay" />;

      const animation = errorOverlay.animate(
        [
          {},
          {
            boxShadow: 'inset 0 0 20px 10px var(--red)',
            background: 'var(--red-light)',
          },
          {},
        ],
        {
          duration: 600,
          easing: 'ease-out',
        },
      );

      on('finish', () => errorOverlay.remove(), { target: animation });
      appendChild(this.shadowRoot, errorOverlay);
    });
  }

  /**
   * 渲染子组件树，包含样式表注入和条件渲染控制
   */
  private renderUIComponents() {
    const { displayToggle } = getOptions();

    replaceChild(
      this.shadowRoot,
      <>
        {/* 注入样式表 */}
        <link rel="stylesheet" href="./index.css" />

        {/* 条件渲染切换按钮 */}
        {displayToggle && <ToggleUI />}

        {/* 核心UI组件 */}
        <OverlayUI />
        <TooltipUI />
        <TreeUI />
      </>,
    );
  }
}
