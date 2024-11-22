export function dispatchEvent(type: string, detail?: AnyObject) {
  const e = new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail,
  });
  return window.dispatchEvent(e);
}
