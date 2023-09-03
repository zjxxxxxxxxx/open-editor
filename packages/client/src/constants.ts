export const InternalElements = <const>{
  HTML_INSPECT_ELEMENT: 'open-editor-inspect',
  HTML_OVERLAY_ELEMENT: 'open-editor-overlay',
  HTML_TOOLTIP_ELEMENT: 'open-editor-tooltip',
  HTML_TOGGLE_ELEMENT: 'open-editor-toggle',
  HTML_TREE_ELEMENT: 'open-editor-tree',
};

export const Theme = `
* {
  all: initial;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

style {
  display: none;
}

:host {
  --black: #15181e;
  --white: #ffffff;
  --grey: #abb2bf;
  --red: #ff335c;
  --green: #00dc82;
  --cyan: #2dd9da;
  --overlay-margin: #f6b26ba8;
  --overlay-border: #ffe599a8;
  --overlay-padding: #93c47d8c;
  --overlay-content: #6fa7dca8;

  --bg-opt: #ffffff88;
  --element: var(--black);
  --toggle: var(--black);
  --toggle-bg: #ffffffcc;
  --bg-color: var(--white);
}

@media (prefers-color-scheme: dark) {
  :host {  
    --bg-opt: #15181e88;
    --element: var(--grey);
    --toggle: var(--white);
    --toggle-bg: #15181ecc;
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

  TOGGLE_COLOR: 'var(--toggle)',
  TOGGLE_ACTIVE_COLOR: 'var(--green)',
  TOGGLE_ACTIVE_SHADOW: 'var(--cyan)',
  TOGGLE_BG_COLOR: 'var(--toggle-bg)',

  TOOLTIP_BG_COLOR: 'var(--bg-color)',
  TOOLTIP_BORDER_COLOR: 'var(--green)',
  TOOLTIP_COMPONENT_COLOR: 'var(--green)',
  TOOLTIP_ELEMENT_COLOR: 'var(--element)',
  TOOLTIP_FILE_COLOR: 'var(--cyan)',
};

export const CLIENT = typeof window !== 'undefined';
