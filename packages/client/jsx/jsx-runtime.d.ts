declare type UnionCharacter<T extends string> = T extends `${infer F}${infer R}`
  ? F | UnionCharacter<R>
  : never;

declare type UppercaseLetter = UnionCharacter<'ABCDEFGHIJKLMNOPQRSTUVWXYZ'>;

declare type NativeElement<P> =
  P extends React.DetailedHTMLProps<infer _, infer T> ? T : HTMLElement;

declare type EventKey<K extends string> = K extends `on${infer F}${infer _}`
  ? F extends UppercaseLetter
    ? true
    : false
  : false;

declare type EventType<K extends string> = K extends `on${infer F}`
  ? Lowercase<F>
  : never;

declare type NativeEvent<K extends string> = HTMLElementEventMap[EventType<K>];

declare type InternalCustomElements = {
  'open-editor-inspect': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLInspectElement>,
    HTMLInspectElement
  >;
};

declare type _Node = HTMLElement | string | number | false | null | undefined;

declare type _Element<P> = {
  [K in keyof P]: K extends 'children'
    ? _Node[]
    : K extends 'ref'
      ? (el: NativeElement<P>) => void
      : EventKey<K> extends true
        ? (e: NativeEvent<K>) => void
        : P[K];
} & {
  onLongPress?(e: PointerEvent): void;
  onQuickExit?(e: PointerEvent): void;
  onRightClick?(e: PointerEvent): void;
};

declare type _IntrinsicElements<ES> = {
  [E in keyof ES]: _Element<ES[E]>;
};

declare namespace _JSX {
  type Element = HTMLElement;
  type IntrinsicElements = _IntrinsicElements<
    JSX.IntrinsicElements & InternalCustomElements
  >;
}

declare const _Fragment: string;

export { _JSX as JSX, _Fragment as Fragment };
