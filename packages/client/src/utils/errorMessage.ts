export function sendErrMsg(msg: string, logLevel: 'log' | 'throw' = 'log') {
  const s = `@open-editor/client: ${msg}.`;
  if (logLevel === 'throw') {
    throw Error(s);
  }
  console.error(s);
}
