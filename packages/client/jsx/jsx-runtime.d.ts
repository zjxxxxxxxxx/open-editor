/**
 * 将字符串类型解构为单个字符的联合类型
 *
 * @example
 * StringToCharUnion<'ABC'> → 'A' | 'B' | 'C'
 */
declare type StringToCharUnion<T extends string> = T extends `${infer First}${infer Rest}`
  ? First | StringToCharUnion<Rest>
  : never;

/** 所有大写字母的联合类型（A-Z） */
declare type UppercaseLetters = StringToCharUnion<'ABCDEFGHIJKLMNOPQRSTUVWXYZ'>;

/**
 * 从 React 元素属性中提取对应的原生 DOM 元素类型
 *
 * @example
 * ExtractNativeElement<ButtonHTMLAttributes<HTMLButtonElement>> → HTMLButtonElement
 */
declare type ExtractNativeElement<Props> =
  Props extends React.DetailedHTMLProps<infer _, infer Element> ? Element : HTMLElement;

/**
 * 判断属性名是否符合 React 事件命名规范（onXxx 形式且X大写）
 *
 * @example
 * IsValidReactEventKey<'onClick'> → true
 */
declare type IsValidReactEventKey<Key extends string> = Key extends `on${infer Head}${infer _}`
  ? Head extends UppercaseLetters
    ? true
    : false
  : false;

/**
 * 从 React 事件属性名中提取浏览器原生事件类型名
 *
 * @example
 * ExtractNativeEventType<'onClick'> → 'click'
 */
declare type ExtractNativeEventType<Key extends string> = Key extends `on${infer Event}`
  ? Lowercase<Event>
  : never;

/**
 * 根据 React 事件属性名映射到对应的原生 DOM 事件类型
 *
 * @example
 * MapReactEventToNative<'onClick'> → MouseEvent
 */
declare type MapReactEventToNative<Key extends string> =
  HTMLElementEventMap[ExtractNativeEventType<Key>];

/** 自定义 Web Component 元素属性扩展 */
declare type CustomElementsRegistry = {
  /** 编辑器审查器组件属性 */
  'open-editor-inspector': React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLInspectorElement>,
    HTMLInspectorElement
  >;
};

/** 允许的子元素类型集合 */
declare type ValidChildNode = HTMLElement | string | number | boolean | null | undefined;

/** 处理 React 元素属性的类型转换逻辑 */
declare type ElementPropsTransformer<Props> = {
  [K in keyof Props]: K extends 'children' // 处理 children 属性
    ? ValidChildNode | ValidChildNode[]
    : // 处理 ref 回调函数
      K extends 'ref'
      ? (element: ExtractNativeElement<Props>) => void
      : // 处理 React 标准事件属性
        IsValidReactEventKey<K> extends true
        ? (event: MapReactEventToNative<K>) => void
        : Props[K];
} & {
  /** 长按事件（非标准事件扩展） */
  onLongPress?(event: PointerEvent): void;
  /** 快速退出事件（自定义交互逻辑） */
  onQuickExit?(event: PointerEvent): void;
  /** 右键点击事件（扩展标准点击行为） */
  onRightClick?(event: PointerEvent): void;
};

/** 合并标准 HTML 元素与自定义元素属性 */
declare type MergedIntrinsicElements<Elements> = {
  [E in keyof Elements]: ElementPropsTransformer<Elements[E]>;
};

/** 增强型 JSX 命名空间定义 */
declare namespace EnhancedJSX {
  /** 元素类型约束 */
  type Element = HTMLElement;
  /** 合并原生与自定义元素类型 */
  type IntrinsicElements = MergedIntrinsicElements<JSX.IntrinsicElements & CustomElementsRegistry>;
}

/** 自定义 Fragment 组件标识 */
declare const CustomFragment: string;

/**
 * 创建一个特定类型的 HTML 元素
 *
 * @param type - 元素类型，必须是 `HTMLElementTagNameMap` 中的键（即 HTML 标签名）
 * @param props - 元素的属性，类型为 `EnhancedJSX.IntrinsicElements` 中对应 `type` 的属性类型
 *
 * @returns 返回一个对应 `type` 的 HTML 元素实例
 */
declare function jsx<Type extends keyof HTMLElementTagNameMap>(
  type: Type,
  props: EnhancedJSX.IntrinsicElements[Type],
): HTMLElementTagNameMap[Type];
/**
 * 创建一个通用的 HTML 元素
 *
 * @param type - 元素类型，字符串类型，表示 HTML 标签名
 * @param props - 元素的属性，类型为 `unknown`，表示可以是任意类型
 *
 * @returns 返回一个通用的 HTML 元素实例
 */
declare function jsx(type: string, props: unknown): HTMLElement;

export { EnhancedJSX as JSX, CustomFragment as Fragment, jsx, jsx as jsxs };
