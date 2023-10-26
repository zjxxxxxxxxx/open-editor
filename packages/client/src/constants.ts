export const InternalElements = <const>{
  HTML_INSPECT_ELEMENT: 'open-editor-inspect',
  HTML_OVERLAY_ELEMENT: 'open-editor-overlay',
  HTML_TOOLTIP_ELEMENT: 'open-editor-tooltip',
  HTML_TOGGLE_ELEMENT: 'open-editor-toggle',
  HTML_TREE_ELEMENT: 'open-editor-tree',
};

export const Theme = postcss`
:host {
  --black: #15181e;
  --white: #ffffff;
  --grey: #abb2bf;
  --red: #ff335c;
  --red-light: #ff335c22;
  --green: #00dc82;
  --green-light: #00dc8222;
  --cyan: #2dd9da;
  --overlay-margin: #f6b26ba8;
  --overlay-border: #ffe599a8;
  --overlay-padding: #93c47d8c;
  --overlay-content: #6fa7dca8;

  --bg-opt: #15181e1;
  --element: var(--black);
  --toggle: var(--black);
  --toggle-bg: #ffffffcc;
  --bg-color: var(--white);

  --z-index-overlay: 1000000;
  --z-index-tooltip: 1000003;
  --z-index-tree: 1000001;
  --z-index-toggle: 1000002;
}

@media (prefers-color-scheme: dark) {
  :host {  
    --bg-opt: #15181ee;
    --element: var(--grey);
    --toggle: var(--white);
    --toggle-bg: #15181ecc;
    --bg-color: var(--black);
  }
}
`;

export const CLIENT = typeof window !== 'undefined';

export const captureOpts = {
  capture: true,
};

export const POS_Y_CACHE_ID = '__open_editor_toggle_pos_y__';
