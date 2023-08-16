import { defineInspectElement } from './defineInspectElement';
import { defineOverlayElement } from './defineOverlayElement';
import { defineToggleElement } from './defineToggleElement';
import { defineTooltipElement } from './defineTooltipElement';

export function defineElements() {
  defineInspectElement();
  defineOverlayElement();
  defineTooltipElement();
  defineToggleElement();
}
