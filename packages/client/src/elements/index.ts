import { InternalElements } from '../constants';
import { HTMLInspectElement } from './HTMLInspectElement';
import { HTMLOverlayElement } from './HTMLOverlayElement';
import { HTMLToggleElement } from './HTMLToggleElement';
import { HTMLTooltipElement } from './HTMLTooltipElement';
import { HTMLTreeElement } from './HTMLTreeElement';

export function defineElements() {
  customElements.define(
    InternalElements.HTML_INSPECT_ELEMENT,
    HTMLInspectElement,
  );
  customElements.define(
    InternalElements.HTML_OVERLAY_ELEMENT,
    HTMLOverlayElement,
  );
  customElements.define(
    InternalElements.HTML_TOGGLE_ELEMENT,
    HTMLToggleElement,
  );
  customElements.define(
    InternalElements.HTML_TOOLTIP_ELEMENT,
    HTMLTooltipElement,
  );
  customElements.define(InternalElements.HTML_TREE_ELEMENT, HTMLTreeElement);
}
