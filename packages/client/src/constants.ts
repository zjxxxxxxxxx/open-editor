export const InternalElements = <const>{
  HTML_INSPECT_ELEMENT: 'open-editor-inspect',
  HTML_OVERLAY_ELEMENT: 'open-editor-overlay',
  HTML_TOOLTIP_ELEMENT: 'open-editor-tooltip',
  HTML_POINTER_ELEMENT: 'open-editor-pointer',
};

export const Colors = <const>{
  SUCCESS: 'var(--green)',
  ERROR: 'var(--red)',

  OVERLAY_MARGIN_RECT: 'var(--overlay-margin)',
  OVERLAY_BORDER_RECT: 'var(--overlay-border)',
  OVERLAY_PADDING_RECT: 'var(--overlay-padding)',
  OVERLAY_CONTENT_RECT: 'var(--overlay-content)',

  POINTER_COLOR: 'var(--pointer)',
  POINTER_ACTIVE_COLOR: 'var(--green)',
  POINTER_BG_COLOR: 'var(--pointer-bg)',

  TOOLTIP_BG_COLOR: 'var(--bg-color)',
  TOOLTIP_BORDER_COLOR: 'var(--green)',
  TOOLTIP_COMPONENT_COLOR: 'var(--green)',
  TOOLTIP_ELEMENT_COLOR: 'var(--element)',
  TOOLTIP_FILE_COLOR: 'var(--cyan)',
};

export const CLIENT = typeof window !== 'undefined';
