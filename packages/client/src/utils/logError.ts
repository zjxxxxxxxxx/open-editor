export function logError(msg: string, logLevel: 'log' | 'throw' = 'log') {
  const s = errMsg(msg);
  if (logLevel === 'throw') {
    throw Error(s);
  }
  console.error(s);
}

export function errMsg(msg: string) {
  return `@open-editor/client: ${msg}.`;
}
