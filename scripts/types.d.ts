/** CSS 编译器 */
declare function css(...args: (readonly string[] | ArrayLike<string>)[]): string;
/** 代码转换器（目前主要用于压缩代码体积） */
declare function code(...args: (readonly string[] | ArrayLike<string>)[]): string;
