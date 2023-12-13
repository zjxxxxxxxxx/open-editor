import { getOptions } from '../options';

const LightColors = postcss`
:host {
  --text: #000000;
  --text-2: #222222;
  --fill: #f6f7f8;
  --fill-opt: #f6f7f866;
  --fill-2: #c6c7c8;
  --cyan: #2dd9da;
  --red: #ff335c;
  --red-light: #ff335c33;
}
`;

const DarkColors = postcss`
:host {
  --text: #ffffff;
  --text-2: #dddddd;
  --fill: #292a2d;
  --fill-opt: #292a2d88;
  --fill-2: #595a5d;
  --cyan: #4df9fa;
  --red: #ff335c;
  --red-light: #ff335c33;
}
`;

export function getColorMode() {
  const { colorMode } = getOptions();

  if (colorMode === 'light') {
    return LightColors;
  } else if (colorMode === 'dark') {
    return DarkColors;
  } else {
    return `${LightColors}@media(prefers-color-scheme:dark){${DarkColors}}`;
  }
}
