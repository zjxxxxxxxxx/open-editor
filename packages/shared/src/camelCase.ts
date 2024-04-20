const camelCaseRE = /(?:(?=^)|(?:[./\-_]+))([a-z])/g;
export function camelCase(str: string) {
  return str.replace(camelCaseRE, (...$) => $[1].toUpperCase());
}
