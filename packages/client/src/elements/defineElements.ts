import { defineInspectElement } from './defineInspectElement';
import { defineOverlayElement } from './defineOverlayElement';
import { defineToggleElement } from './defineToggleElement';
import { defineTooltipElement } from './defineTooltipElement';
import { defineTreeElement } from './defineTreeElement';

export function defineElements() {
  defineInspectElement();
  defineOverlayElement();
  defineTooltipElement();
  defineToggleElement();
  defineTreeElement();
}
