import { isInternalElement } from './isInternalElement';

const filterElements = ['html', 'body', 'iframe'];
export function isValidElement(element: HTMLElement) {
  return (
    !isInternalElement(element) && !filterElements.includes(element.localName)
  );
}
