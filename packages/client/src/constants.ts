export const InternalElements = <const>{
  HTML_INSPECT_ELEMENT: 'open-editor-inspect',
  HTML_OVERLAY_ELEMENT: 'open-editor-overlay',
  HTML_TOOLTIP_ELEMENT: 'open-editor-tooltip',
  HTML_TOGGLE_ELEMENT: 'open-editor-toggle',
  HTML_TREE_ELEMENT: 'open-editor-tree',
};

export const Theme = postcss`
:host {
  --text: #ffffff;
  --text-2: #cccccc;
  --fill: #292a2dcc;
  --fill-2: #696a6d;
  --cyan: #2dd9da;
  --red: #ff335c;
  --red-light: #ff335c33;

  --overlay-margin: #f6b26ba8;
  --overlay-border: #ffe599a8;
  --overlay-padding: #93c47d8c;
  --overlay-content: #6fa7dca8;

  --z-index-overlay: 1000000;
  --z-index-error-overlay: 1000000;
  --z-index-tooltip: 1000003;
  --z-index-tree: 1000001;
  --z-index-toggle: 1000002;
}
`;

export const CLIENT = typeof window !== 'undefined';

export const capOpts = {
  capture: true,
};

export const CACHE_POS_Y_ID = '__open_editor_toggle_pos_y__';
