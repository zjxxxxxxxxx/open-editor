import { HTML_TOOLTIP_ELEMENT } from '../constants';

export interface HTMLTooltipElement extends HTMLElement {}

export function defineTooltipElement() {
  class TooltipElement extends HTMLElement implements HTMLTooltipElement {
    constructor() {
      super();
    }
  }

  customElements.define(HTML_TOOLTIP_ELEMENT, TooltipElement);
}
