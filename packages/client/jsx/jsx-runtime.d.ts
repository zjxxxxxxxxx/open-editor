declare type CustomProperty<P> = {
  [K in keyof P]: K extends 'children'
    ? (HTMLElement | string | number | false | null | undefined)[]
    : K extends 'ref'
    ? (el: HTMLElement) => void
    : P[K];
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
