declare type AnyObject<V = any> = Record<string, V>;
declare type PartialWithNull<T> = { [P in keyof T]?: T[P] | null | undefined };
declare const __DEV__: boolean;
