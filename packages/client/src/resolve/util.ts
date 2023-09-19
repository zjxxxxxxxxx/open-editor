import { getOptions } from '../options';

export function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '');
  }
  return `/${fileName.replace(/^\//, '')}`;
}

const vueComponentNameRE = /([^/.]+)\.vue$/;
export function getVueComponentName(file = '') {
  return file.match(vueComponentNameRE)?.[1];
}

export function isValidFileName(fileName?: string) {
  if (fileName) {
    fileName = ensureFileName(fileName);
    return (
      !fileName.startsWith('/home/runner/') &&
      !fileName.startsWith('/node_modules/')
    );
  }
  return false;
}

let hvs: boolean | null = null;
export function hasVueSource(element: HTMLElement) {
  if (hvs != null) {
    return hvs;
  }

  while (element) {
    if (element.getAttribute('__source') != null) {
      return (hvs = true);
    }

    element = element.parentElement!;
  }

  return (hvs = false);
}

export function parseVueSource(__source: string) {
  const [file, line, column] = __source.split(':');
  return {
    file,
    line: Number(line),
    column: Number(column),
  };
}
