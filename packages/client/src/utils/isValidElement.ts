import { InternalElements } from '../constants';

const filterElements: string[] = [
  'html',
  'bpdy',
  ...Object.values(InternalElements),
];
export function isValidElement(element: HTMLElement) {
  return !filterElements.includes(element.localName);
}
