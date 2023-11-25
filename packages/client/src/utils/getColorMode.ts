import { getOptions } from '../options';

const Light = postcss`
:host {
  --text: #000000;
  --text-2: #333333;
  --fill: #f6f6f6cc;
  --fill-2: #c6c6c6;
  --cyan: #2dd9da;
}
`;

const Dark = postcss`
:host {
  --text: #ffffff;
  --text-2: #cccccc;
  --fill: #393a3dcc;
  --fill-2: #797a7d;
  --cyan: #4df9fa;
}
`;

export function getColorMode() {
  const { colorMode } = getOptions();

  if (colorMode === 'light') {
    return Light;
  } else if (colorMode === 'dark') {
    return Dark;
  } else {
    const getMedia = (mode: string, color: string) =>
      `@media(prefers-color-scheme:${mode}){${color}}`;
    return `${getMedia('light', Light)}${getMedia('dark', Dark)}`;
  }
}
