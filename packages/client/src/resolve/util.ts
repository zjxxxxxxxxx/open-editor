import { getOptions } from '../options';

export function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '');
  }
  return `/${fileName.replace(/^\//, '')}`;
}

export function getComponentNameByFile(file = '', suffix = '') {
  if (file.endsWith(`.${suffix}`)) {
    const matchRE = new RegExp(`([^/.]+).${suffix}$`);
    return file.match(matchRE)?.[1];
  }
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
