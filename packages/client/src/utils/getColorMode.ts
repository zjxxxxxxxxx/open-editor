import { getOptions } from '../options';

const LightColors = postcss`
:host {
  --text-color: #000000;
  --text-color2: #222222;
  --bg-color: #fffffe;
  --bg-color-opt: #fffffe88;
  --bg-color2: #bfbfbe;
  --cyan: #2dd9da;
  --red: #ff335c;
  --red-light: #ff335c33;
  --filter-c: contrast(0.9);
}
`;

const DarkColors = postcss`
:host {
  --text-color: #ffffff;
  --text-color2: #dddddd;
  --bg-color: #292a2d;
  --bg-color-opt: #292a2d88;
  --bg-color2: #696a6d;
  --cyan: #4df9fa;
  --red: #ff335c;
  --red-light: #ff335c33;
  --filter-c: contrast(0.8);
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
