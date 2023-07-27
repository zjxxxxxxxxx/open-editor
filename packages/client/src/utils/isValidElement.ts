import { isInternalElement } from './isInternalElement';

const filterElements = ['html', 'body'];
export function isValidElement(element: HTMLElement) {
  return (
    !isInternalElement(element) && !filterElements.includes(element.localName)
  );
}
