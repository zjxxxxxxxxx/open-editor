export const HTML_INSPECT_ELEMENT = 'open-editor-inspect';

export const IS_CLIENT = typeof window !== 'undefined';
export const IS_FIREFOX = IS_CLIENT && /firefox/i.test(navigator.userAgent);

export const CURRENT_INSPECT_ID = Math.random().toString(16).substring(2, 10);

export const ENABLE_CROSS_IFRAME = 'oe:ENABLE_CROSS_IFRAME';
export const EXIT_CROSS_IFRAME = 'oe:EXIT_CROSS_IFRAME';
export const ACTIVE_CROSS_IFRAME = 'oe:ACTIVE_CROSS_IFRAME';
export const SOURCE_CROSS_IFRAME = 'oe:SOURCE_CROSS_IFRAME';
export const BOX_MODEL_CROSS_IFRAME = 'oe:BOX_MODEL_CROSS_IFRAME';
export const OPEN_TREE_CROSS_IFRAME = 'oe:OPEN_TREE_CROSS_IFRAME';
export const CLOSE_TREE_CROSS_IFRAME = 'oe:CLOSE_TREE_CROSS_IFRAME';
export const OPEN_EDITOR_START_CROSS_IFRAME =
  'oe:OPEN_EDITOR_START_CROSS_IFRAME';
export const OPEN_EDITOR_END_CROSS_IFRAME = 'oe:OPEN_EDITOR_END_CROSS_IFRAME';
export const OPEN_EDITOR_ERROR_CROSS_IFRAME =
  'oe:OPEN_EDITOR_ERROR_CROSS_IFRAME';
