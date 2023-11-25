import { getOptions } from '../options';

const LightColor = postcss`
:host {
  --text: #000000;
  --text-2: #333333;
  --fill: #f4f5f6;
  --fill-opacity: #f4f5f688;
  --fill-2: #c4c5c6;
  --active: #2dd9da;
  --red: #ff335c;
  --red-light: #ff335c33;
}
`;

const DarkColor = postcss`
:host {
  --text: #ffffff;
  --text-2: #cccccc;
  --fill: #393a3d;
  --fill-opacity: #393a3daa;
  --fill-2: #797a7d;
  --active: #4df9fa;
  --red: #ff335c;
  --red-light: #ff335c33;
}
`;

export function getColorMode() {
  const { colorMode } = getOptions();

  if (colorMode === 'light') {
    return LightColor;
  } else if (colorMode === 'dark') {
    return DarkColor;
  } else {
    const getMedia = (mode: string, color: string) =>
      `@media(prefers-color-scheme:${mode}){${color}}`;
    return `${getMedia('light', LightColor)}${getMedia('dark', DarkColor)}`;
  }
}
