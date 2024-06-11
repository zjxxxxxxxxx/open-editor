import picomatch from 'picomatch';
import { getOptions } from '../options';

let pm: (v: string) => boolean;
function setupPm() {
  const { ignoreComponents } = getOptions();
  pm ||= picomatch(ignoreComponents, { dot: true });
}

export function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '');
  }
  return `/${fileName.replace(/^\//, '')}`;
}

const invalidRE = /^\/home\/runner\//;
export function isValidFileName(fileName?: string): fileName is string {
  setupPm();
  return fileName ? !invalidRE.test(fileName) && !pm(fileName) : false;
}
