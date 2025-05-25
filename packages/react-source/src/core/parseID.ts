export function parseID(id: string, rootDir: string) {
  const [filename] = id.split('?', 1);
  const file = filename.startsWith(rootDir)
    ? filename.replace(rootDir, '').replace(/^\//, '')
    : filename;

  return {
    file,
    isTsx: /\.tsx?$/.test(file),
  };
}
