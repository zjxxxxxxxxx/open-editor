export const HTML_INSPECTOR_ELEMENT = 'open-editor-inspector';

export const IS_CLIENT = typeof window !== 'undefined';
export const IS_FIREFOX = IS_CLIENT && /firefox/i.test(navigator.userAgent);

export const CURRENT_INSPECT_ID = Math.random().toString(16).substring(2, 10);

export const ENABLE_INSPECTOR_EVENT = 'enableinspector';
export const EXIT_INSPECTOR_EVENT = 'exitinspector';
export const OPEN_EDITOR_EVENT = 'openeditor';

export const INSPECTOR_ACTIVE_CROSS_IFRAME = 'oe:INSPECTOR_ACTIVE_CROSS_IFRAME';
export const INSPECTOR_ENABLE_CROSS_IFRAME = 'oe:INSPECTOR_ENABLE_CROSS_IFRAME';
export const INSPECTOR_EXIT_CROSS_IFRAME = 'oe:INSPECTOR_EXIT_CROSS_IFRAME';
export const CODE_SOURCE_CROSS_IFRAME = 'oe:CODE_SOURCE_CROSS_IFRAME';
export const BOX_MODEL_CROSS_IFRAME = 'oe:BOX_MODEL_CROSS_IFRAME';
export const TREE_OPEN_CROSS_IFRAME = 'oe:TREE_OPEN_CROSS_IFRAME';
export const TREE_CLOSE_CROSS_IFRAME = 'oe:TREE_CLOSE_CROSS_IFRAME';
export const OPEN_EDITOR_CROSS_IFRAME = 'oe:OPEN_EDITOR_CROSS_IFRAME';
export const OPEN_EDITOR_START_CROSS_IFRAME = 'oe:OPEN_EDITOR_START_CROSS_IFRAME';
export const OPEN_EDITOR_END_CROSS_IFRAME = 'oe:OPEN_EDITOR_END_CROSS_IFRAME';
export const OPEN_EDITOR_ERROR_CROSS_IFRAME = 'oe:OPEN_EDITOR_ERROR_CROSS_IFRAME';
