import outmatch from 'outmatch';
import { getOptions } from '../options';

export function ensureFileName(fileName: string) {
  const { rootDir } = getOptions();
  if (fileName.startsWith(rootDir)) {
    fileName = fileName.replace(rootDir, '').replace(/^\//, '');
  }
  return fileName;
}

const invalidRE = /^\/home\/runner\//;
export function isValidFileName(fileName?: string | null): fileName is string {
  if (fileName) {
    fileName = fileName.startsWith('/') ? fileName : `/${fileName}`;
    return !invalidRE.test(fileName) && filter(fileName);
  }

  return false;
}

let glob: ReturnType<typeof outmatch>;
function filter(fileName: string) {
  const { ignoreComponents } = getOptions();
  if (ignoreComponents) {
    return !(glob ||= outmatch(ignoreComponents, { excludeDot: true }))(
      fileName,
    );
  }
  return true;
}
