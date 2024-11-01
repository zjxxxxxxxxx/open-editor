import {
  applyAttrs,
  appendChild,
  addClass,
  removeClass,
  getHtml,
} from '../../utils/dom';
import { logError } from '../../utils/logError';
import { effectStyle, overrideStyle } from '../../styles/globalStyles';
import { off, on } from '../../event';
import { InternalElements } from '../../constants';
import { getOptions } from '../../options';
import { resolveSource } from '../../resolve';
import { openEditor } from '../utils/openEditor';
import { setupListeners } from '../utils/setupListeners';
import { disableHoverCSS, enableHoverCSS } from '../utils/disableHoverCSS';
import { HTMLCustomElement } from '../HTMLCustomElement';

export class HTMLInspectElement extends HTMLCustomElement<{
  overlay: HTMLOverlayElement;
  tree: HTMLTreeElement;
  toggle?: HTMLToggleElement;
  active: boolean;
}> {
  constructor() {
    super();

    this.onKeydown = this.onKeydown.bind(this);
    this.toggleActiveEffect = this.toggleActiveEffect.bind(this);
    this.setupHandlers = this.setupHandlers.bind(this);
    this.cleanHandlers = this.cleanHandlers.bind(this);
    this.openEditor = this.openEditor.bind(this);
    this.showErrorOverlay = this.showErrorOverlay.bind(this);

    effectStyle.mount();
  }

  private get active() {
    return this.state.active;
  }
  private set active(value) {
    this.state.active = value;

    if (this.state.toggle) {
      applyAttrs(this.state.toggle, {
        active: value,
      });
    }
  }

  override host() {
    const opts = getOptions();
    return (
      <>
        <link rel="stylesheet" href="./index.css" />
        <InternalElements.HTML_OVERLAY_ELEMENT
          ref={(el) => (this.state.overlay = el)}
        />
        <InternalElements.HTML_TREE_ELEMENT
          ref={(el) => (this.state.tree = el)}
        />
        {opts.displayToggle && (
          <InternalElements.HTML_TOGGLE_ELEMENT
            ref={(el) => (this.state.toggle = el)}
            onChange={this.toggleActiveEffect}
          />
        )}
      </>
    );
  }

  override mounted() {
    on('keydown', this.onKeydown);

    openEditor.onError(this.showErrorOverlay);
  }

  override unmount() {
    this.cleanHandlers();

    off('keydown', this.onKeydown);

    openEditor.offError(this.showErrorOverlay);
  }

  private onKeydown(e: KeyboardEvent) {
    if (e.altKey && e.metaKey && e.code === 'KeyO') {
      this.toggleActiveEffect();
    }
  }

  private toggleActiveEffect() {
    if (!this.active) {
      this.setupHandlers();
    } else {
      this.cleanHandlers();
    }
  }

  private async setupHandlers() {
    try {
      const e = new CustomEvent('enableinspector', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      if (!this.active && !this.state.tree.isOpen && this.dispatchEvent(e)) {
        this.active = true;
        this.state.overlay.open();
        this.cleanListeners = setupListeners({
          onActive: this.state.overlay.update,
          onOpenTree: this.state.tree.open,
          onOpenEditor: this.openEditor,
          onExitInspect: this.cleanHandlers,
        });

        // Override the default mouse style and touch feedback
        overrideStyle.mount();

        const { disableHoverCSS: isDisabled } = getOptions();
        if (isDisabled) await disableHoverCSS();

        // @ts-ignore
        document.activeElement?.blur();
      }
    } catch {
      //
    }
  }

  private declare cleanListeners: () => void;

  private async cleanHandlers() {
    try {
      const e = new CustomEvent('exitinspector', {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      if (this.active && !this.state.tree.isOpen && this.dispatchEvent(e)) {
        this.active = false;
        this.state.overlay.close();
        this.cleanListeners();

        overrideStyle.unmount();

        const { disableHoverCSS: isDisabled } = getOptions();
        if (isDisabled) await enableHoverCSS();
      }
    } catch {
      //
    }
  }

  private async openEditor(el: HTMLElement) {
    try {
      addClass(getHtml(), 'oe-loading');
      const { meta } = resolveSource(el);
      if (!meta) {
        logError('file not found');
        this.showErrorOverlay();
        return;
      }

      const dispatch = (e: CustomEvent<URL>) => this.dispatchEvent(e);
      await openEditor(meta, dispatch);
    } finally {
      removeClass(getHtml(), 'oe-loading');
    }
  }

  private showErrorOverlay() {
    const errorOverlay = <div className="oe-error-overlay" />;
    const ani = errorOverlay.animate(
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

    const remove = () => errorOverlay.remove();
    on('finish', remove, { target: ani });

    appendChild(this.shadowRoot, errorOverlay);
  }
}
