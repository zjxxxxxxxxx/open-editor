import { getOptions } from '../options';

export function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '');
  }
  return `/${fileName.replace(/^\//, '')}`;
}

const invalidRE = /(^\/home\/runner\/|\/node_modules\/)/;
export function isValidFileName(fileName?: string): fileName is string {
  return fileName ? !invalidRE.test(fileName) : false;
}
