import { isStr } from '@open-editor/shared';

export function isMessage(type: string, message: string) {
  return isStr(message) && message.startsWith(type);
}

export function encodeMessage(type: string, data: any) {
  return `${type}${JSON.stringify(data)}`;
}

export function decodeMessage(type: string, message: string) {
  return JSON.parse(message.replace(type, ''));
}
