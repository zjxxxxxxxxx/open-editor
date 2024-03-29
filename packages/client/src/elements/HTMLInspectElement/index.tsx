import {
  applyAttrs,
  appendChild,
  addClass,
  removeClass,
  getHtml,
  checkValidElement,
} from '../../utils/ui';
import { off, on } from '../../utils/event';
import {
  offOpenEditorError,
  onOpenEditorError,
  openEditor,
} from '../../utils/openEditor';
import { logError } from '../../utils/logError';
import { InternalElements } from '../../constants';
import { getOptions } from '../../options';
import { resolveSource } from '../../resolve';
import { HTMLCustomElement } from '../HTMLCustomElement';
import { getColorMode } from './getColorMode';
import { setupListeners } from './setupListeners';
import { disableHoverCSS, enableHoverCSS } from './disableHoverCSS';
import { effectStyle, overrideStyle } from './globalStyles';

export class HTMLInspectElement extends HTMLCustomElement<{
  overlay: HTMLOverlayElement;
  tree: HTMLTreeElement;
  toggle?: HTMLToggleElement;
  pointE: PointerEvent;
  active: boolean;
}> {
  constructor() {
    super();

    this.savePointE = this.savePointE.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.toggleActiveEffect = this.toggleActiveEffect.bind(this);
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
        <style type="text/css">{getColorMode()}</style>
        <InternalElements.HTML_OVERLAY_ELEMENT
          ref={(el) => (this.state.overlay = el as HTMLOverlayElement)}
        />
        <InternalElements.HTML_TREE_ELEMENT
          ref={(el) => (this.state.tree = el as HTMLTreeElement)}
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
    // Capture mouse position to prevent `stopPropagation`
    on('mousemove', this.savePointE, {
      capture: true,
    });

    onOpenEditorError(this.showErrorOverlay);
  }

  override unmount() {
    this.cleanHandlers();

    off('keydown', this.onKeydown);
    off('mousemove', this.savePointE, {
      capture: true,
    });

    offOpenEditorError(this.showErrorOverlay);
  }

  private savePointE(e: PointerEvent) {
    this.state.pointE = e;
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

  private setupHandlers() {
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

      disableHoverCSS();

      // @ts-ignore
      document.activeElement?.blur();

      if (this.state.pointE) {
        const { x, y } = this.state.pointE;
        const initEl = document.elementFromPoint(x, y) as HTMLElement;
        if (checkValidElement(initEl)) {
          this.state.overlay.update(initEl);
        }
      }
    }
  }

  private declare cleanListeners: () => void;

  private cleanHandlers() {
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

      enableHoverCSS();
    }
  }

  private async openEditor(el: HTMLElement) {
    try {
      addClass(getHtml(), 'o-e-loading');
      const { meta } = resolveSource(el);
      if (!meta) {
        logError('file not found');
        this.showErrorOverlay();
        return;
      }

      const dispatch = (e: CustomEvent<URL>) => this.dispatchEvent(e);
      await openEditor(meta, dispatch);
    } finally {
      removeClass(getHtml(), 'o-e-loading');
    }
  }

  private showErrorOverlay() {
    const errorOverlay = <div className="o-e-error-overlay" />;
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
