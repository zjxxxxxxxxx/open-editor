/// <reference types="../../scripts/types.d.ts" />

declare type AnyObject = Record<string, any>;

declare interface HTMLInspectElement extends HTMLElement {}

declare interface HTMLToggleElement extends HTMLElement {}

declare interface HTMLOverlayElement extends HTMLElement {
  open(): void;
  close(): void;
  update(el: HTMLElement | null): void;
}

declare interface HTMLTooltipElement extends HTMLElement {
  open(): void;
  close(): void;
  update(el: HTMLElement | null, box: AnyObject): void;
}

declare interface HTMLTreeElement extends HTMLElement {
  show: boolean;
  open(el: HTMLElement): void;
  close(): void;
}
