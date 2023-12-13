declare type Letter = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
][number];

declare type EventKey<K extends string> = K extends `on${infer F}${infer _}`
  ? F extends Letter
    ? true
    : false
  : false;

declare type EventType<K extends string> = K extends `on${infer F}`
  ? Lowercase<F>
  : never;

declare type Event<K extends string> = HTMLElementEventMap[EventType<K>];

declare type CustomNode =
  | HTMLElement
  | string
  | number
  | false
  | null
  | undefined;

declare type CustomProperty<P> = {
  [K in keyof P]: K extends 'children'
    ? CustomNode[]
    : K extends 'ref'
    ? (el: HTMLElement) => void
    : EventKey<K> extends true
    ? (e: Event<K>) => void
    : P[K];
} & {
  onLongPress?(e: PointerEvent): void;
  onQuickExit?(e: PointerEvent): void;
};

declare type CustomPropertyElements<ES> = {
  [E in keyof ES]: CustomProperty<ES[E]>;
};

declare interface InternalCustomElements {
  'oe-inspect': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLInspectElement>,
    HTMLInspectElement
  >;
  'oe-overlay': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLOverlayElement>,
    HTMLOverlayElement
  >;
  'oe-tooltip': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTooltipElement>,
    HTMLTooltipElement
  >;
  'oe-toggle': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLToggleElement>,
    HTMLToggleElement
  >;
  'oe-tree': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTreeElement>,
    HTMLTreeElement
  >;
}

declare namespace _JSX {
  type Element = HTMLElement;
  type IntrinsicElements = CustomPropertyElements<
    JSX.IntrinsicElements & InternalCustomElements
  >;
}

declare const Fragment: string;

export { _JSX as JSX, Fragment };
