declare type UnionCharacter<T extends string> = T extends `${infer F}${infer R}`
  ? F | UnionCharacter<R>
  : never;

declare type UppercaseLetter = UnionCharacter<'ABCDEFGHIJKLMNOPQRSTUVWXYZ'>;

declare type EventKey<K extends string> = K extends `on${infer F}${infer _}`
  ? F extends UppercaseLetter
    ? true
    : false
  : false;

declare type EventType<K extends string> = K extends `on${infer F}`
  ? Lowercase<F>
  : never;

declare type NativeEvent<K extends string> = HTMLElementEventMap[EventType<K>];

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
    ? (e: NativeEvent<K>) => void
    : P[K];
} & {
  onLongPress?(e: PointerEvent): void;
  onQuickExit?(e: PointerEvent): void;
};

declare type CustomPropertyElements<ES> = {
  [E in keyof ES]: CustomProperty<ES[E]>;
};

declare interface InternalCustomElements {
  'o-e-inspect': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLInspectElement>,
    HTMLInspectElement
  >;
  'o-e-overlay': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLOverlayElement>,
    HTMLOverlayElement
  >;
  'o-e-tooltip': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTooltipElement>,
    HTMLTooltipElement
  >;
  'o-e-toggle': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLToggleElement>,
    HTMLToggleElement
  >;
  'o-e-tree': React.DetailedHTMLProps<
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
