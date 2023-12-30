import { getOptions } from '../../options';

const LightColors = postcss`
:host {
  --text-color: #000000;
  --text-color2: #222222;
  --bg-color: #feffff;
  --bg-color-opt: #feffffcc;
  --bg-color2: #bebfbf;
  --cyan: #2dd9da;
}
`;

const DarkColors = postcss`
:host {
  --text-color: #ffffff;
  --text-color2: #dddddd;
  --bg-color: #2c2c2e;
  --bg-color-opt: #2c2c2ed9;
  --bg-color2: #6c6c6e;
  --cyan: #4df9fa;
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
