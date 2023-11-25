import { getOptions } from '../options';

const LightColor = postcss`
:host {
  --text: #000000;
  --text-2: #333333;
  --fill: #f8f9fa;
  --fill-opacity: #f8f9fa88;
  --fill-2: #c8c9ca;
  --active: #2dd9da;
  --red: #ff335c;
  --red-light: #ff335c33;
}
`;

const DarkColor = postcss`
:host {
  --text: #ffffff;
  --text-2: #cccccc;
  --fill: #292a2d;
  --fill-opacity: #292a2daa;
  --fill-2: #696a6d;
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
