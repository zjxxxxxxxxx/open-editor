import { defineRootElement } from './defineInspectElement';
import { defineOverlayElement } from './defineOverlayElement';
import { definePointerElement } from './definePointerElement';
import { defineTooltipElement } from './defineTooltipElement';

export function defineElements() {
  defineRootElement();
  defineOverlayElement();
  defineTooltipElement();
  definePointerElement();
}
