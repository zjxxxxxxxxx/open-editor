export const InternalElements = <const>{
  HTML_INSPECT_ELEMENT: 'open-editor-inspect',
  HTML_OVERLAY_ELEMENT: 'open-editor-overlay',
  HTML_TOOLTIP_ELEMENT: 'open-editor-tooltip',
  HTML_TOGGLE_ELEMENT: 'open-editor-toggle',
  HTML_TREE_ELEMENT: 'open-editor-tree',
};

export const IS_CLIENT = typeof window !== 'undefined';

export const IS_FIREFOX = IS_CLIENT && /firefox/i.test(navigator.userAgent);

export const CACHE_POS_TOP_ID = 'oe-pt';
