export const InternalElements = <const>{
  HTML_INSPECT_ELEMENT: 'open-editor-inspect',
  HTML_OVERLAY_ELEMENT: 'open-editor-overlay',
  HTML_TOOLTIP_ELEMENT: 'open-editor-tooltip',
  HTML_TOGGLE_ELEMENT: 'open-editor-toggle',
};

export const Theme = `
* {
  all: initial;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

:host {
  --black: #181818;
  --white: #ffffff;
  --grey: #abb2bf;
  --red: #ff335c;
  --green: #00dc82;
  --cyan: #2dd9da;
  --overlay-margin: #f6b26ba8;
  --overlay-border: #ffe599a8;
  --overlay-padding: #93c47d8c;
  --overlay-content: #6fa7dca8;

  --element: var(--black);
  --toggle: var(--black);
  --toggle-bg: #ffffffcc;
  --bg-color: var(--white);
}

@media (prefers-color-scheme: dark) {
  :host {  
    --element: var(--grey);
    --toggle: var(--white);
    --toggle-bg: #181818cc;
    --bg-color: var(--black);
  }
}
`;

export const Colors = <const>{
  SUCCESS: 'var(--green)',
  ERROR: 'var(--red)',

  OVERLAY_MARGIN_RECT: 'var(--overlay-margin)',
  OVERLAY_BORDER_RECT: 'var(--overlay-border)',
  OVERLAY_PADDING_RECT: 'var(--overlay-padding)',
  OVERLAY_CONTENT_RECT: 'var(--overlay-content)',

  POINTER_COLOR: 'var(--toggle)',
  POINTER_ACTIVE_COLOR: 'var(--green)',
  POINTER_ACTIVE_SHADOW: 'var(--cyan)',
  POINTER_BG_COLOR: 'var(--toggle-bg)',

  TOOLTIP_BG_COLOR: 'var(--bg-color)',
  TOOLTIP_BORDER_COLOR: 'var(--green)',
  TOOLTIP_COMPONENT_COLOR: 'var(--green)',
  TOOLTIP_ELEMENT_COLOR: 'var(--element)',
  TOOLTIP_FILE_COLOR: 'var(--cyan)',
};

export const CLIENT = typeof window !== 'undefined';
