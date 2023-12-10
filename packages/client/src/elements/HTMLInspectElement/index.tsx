import {
  applyAttrs,
  globalStyle,
  append,
  addClass,
  removeClass,
  getHtml,
} from '../../utils/ui';
import { off, on } from '../../utils/event';
import { isValidElement } from '../../utils/isValidElement';
import { setupListeners } from '../../utils/setupListeners';
import {
  offOpenEditorError,
  onOpenEditorError,
  openEditor,
} from '../../utils/openEditor';
import { getColorMode } from '../../utils/getColorMode';
import { InternalElements, capOpts } from '../../constants';
import { getOptions } from '../../options';
import { resolveSource } from '../../resolve';
import { HTMLCustomElement } from '../HTMLCustomElement';

const overrideCSS = postcss`
* {
  cursor: default !important;
  user-select: none !important;
  touch-action: none !important;
  -webkit-touch-callout: none !important;
}
`;

const overrideStyle = globalStyle(overrideCSS);

export class HTMLInspectElementConstructor
  extends HTMLCustomElement<{
    overlay: HTMLOverlayElement;
    tree: HTMLTreeElement;
    toggle?: HTMLToggleElement;
    pointE: PointerEvent;
    active: boolean;
  }>
  implements HTMLInspectElement
{
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

  host() {
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
          />
        )}
      </>
    );
  }

  connectedCallback() {
    globalStyle(
      '.oe-screen-lock{overflow:hidden;}.oe-loading *{cursor:wait!important;}',
    ).mount();

    on('keydown', this.onKeydown, capOpts);
    on('mousemove', this.savePointE, capOpts);
    onOpenEditorError(this.showErrorOverlay);

    if (this.state.toggle) {
      on('toggle', this.toggleActiveEffect, {
        target: this.state.toggle,
      });
    }
  }

  disconnectedCallback() {
    off('keydown', this.onKeydown, capOpts);
    off('mousemove', this.savePointE, capOpts);
    offOpenEditorError(this.showErrorOverlay);

    if (this.state.toggle) {
      off('toggle', this.toggleActiveEffect, {
        target: this.state.toggle,
      });
    }

    this.cleanHandlers();
  }

  private savePointE = (e: PointerEvent) => {
    this.state.pointE = e;
  };

  private onKeydown = (e: KeyboardEvent) => {
    if (e.altKey && e.metaKey && e.code === 'KeyO') {
      this.toggleActiveEffect();
    }
  };

  private toggleActiveEffect = () => {
    if (!this.active) {
      this.setupHandlers();
    } else {
      this.cleanHandlers();
    }
  };

  private setupHandlers() {
    if (!this.active && !this.state.tree.show) {
      this.active = true;
      this.state.overlay.open();
      this.cleanListeners = setupListeners({
        onChangeElement: this.state.overlay.update,
        onOpenTree: this.state.tree.open,
        onOpenEditor: this.openEditor,
        onExitInspect: this.cleanHandlers,
      });

      if (this.state.pointE) {
        const { x, y } = this.state.pointE;
        const initEl = document.elementFromPoint(x, y) as HTMLElement;
        if (isValidElement(initEl)) {
          this.state.overlay.update(initEl);
        }
      }

      overrideStyle.mount();
    }
  }

  private cleanListeners!: () => void;

  private cleanHandlers = () => {
    if (this.active && !this.state.tree.show) {
      this.active = false;
      this.state.overlay.close();
      this.cleanListeners();

      overrideStyle.unmount();
    }
  };

  private openEditor = async (el: HTMLElement) => {
    try {
      addClass(getHtml(), 'oe-loading');
      const { meta } = resolveSource(el);
      if (!meta) {
        console.error(Error('@open-editor/client: file not found.'));
        return this.showErrorOverlay();
      }
      await openEditor(meta, (e) => this.dispatchEvent(e));
    } finally {
      removeClass(getHtml(), 'oe-loading');
    }
  };

  private showErrorOverlay = () => {
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
    on('finish', () => errorOverlay.remove(), {
      target: ani,
    });
    append(this.shadowRoot, errorOverlay);
  };
}
