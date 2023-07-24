import { InternalElements } from '../constants';

export interface HTMLTooltipElement extends HTMLElement {}

export function defineTooltipElement() {
  class TooltipElement extends HTMLElement implements HTMLTooltipElement {
    constructor() {
      super();
    }
  }

  customElements.define(InternalElements.HTML_TOOLTIP_ELEMENT, TooltipElement);
}
