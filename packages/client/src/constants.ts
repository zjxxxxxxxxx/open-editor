export const HTML_INSPECT_ELEMENT = 'open-editor-inspect';

export const IS_CLIENT = typeof window !== 'undefined';

export const IS_FIREFOX = IS_CLIENT && /firefox/i.test(navigator.userAgent);
