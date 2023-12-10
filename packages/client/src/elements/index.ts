import { InternalElements } from '../constants';
import { HTMLInspectElementConstructor } from './HTMLInspectElement';
import { HTMLOverlayElementConstructor } from './HTMLOverlayElement';
import { HTMLToggleElementConstructor } from './HTMLToggleElement';
import { HTMLTooltipElementConstructor } from './HTMLTooltipElement';
import { HTMLTreeElementConstructor } from './HTMLTreeElement';

export function defineElements() {
  customElements.define(
    InternalElements.HTML_INSPECT_ELEMENT,
    HTMLInspectElementConstructor,
  );
  customElements.define(
    InternalElements.HTML_OVERLAY_ELEMENT,
    HTMLOverlayElementConstructor,
  );
  customElements.define(
    InternalElements.HTML_TOGGLE_ELEMENT,
    HTMLToggleElementConstructor,
  );
  customElements.define(
    InternalElements.HTML_TOOLTIP_ELEMENT,
    HTMLTooltipElementConstructor,
  );
  customElements.define(
    InternalElements.HTML_TREE_ELEMENT,
    HTMLTreeElementConstructor,
  );
}
