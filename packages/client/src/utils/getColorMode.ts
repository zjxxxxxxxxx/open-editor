import { getOptions } from '../options';

const LightColors = postcss`
:host {
  --text-color: #000000;
  --text-color2: #222222;
  --bg-color: #feffff;
  --bg-color-opt: #feffff88;
  --bg-color2: #bebfbf;
  --cyan: #2dd9da;
  --red: #ff335c;
  --red-light: #ff335c33;
  --filter: contrast(0.95) blur(20px);
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
  --filter: contrast(0.8) blur(20px);
}
`;

export function getColorMode() {
  const { colorMode } = getOptions();
  switch (colorMode) {
    case 'light':
      return LightColors;
    case 'dark':
      return DarkColors;
    default:
      return `${LightColors}@media(prefers-color-scheme:dark){${DarkColors}}`;
  }
}
