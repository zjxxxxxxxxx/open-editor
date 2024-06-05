import picomatch from 'picomatch';
import { getOptions } from '../options';

export function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '');
  }
  return `/${fileName.replace(/^\//, '')}`;
}

const invalidRE = /^\/home\/runner\//;
export function isValidFileName(fileName?: string): fileName is string {
  const { ignoreComponents } = getOptions();
  return fileName
    ? !invalidRE.test(fileName) &&
        !picomatch.isMatch(fileName, ignoreComponents)
    : false;
}
