import { cssUtils } from './dom';

export interface ComputedStyle {
  width: number;
  height: number;
  top: number;
  right: number;
  left: number;
  bottom: number;
}

const emptyComputedStyle = {
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
};

export const emptyComputedStyles = {
  posttion: emptyComputedStyle,
  margin: emptyComputedStyle,
  border: emptyComputedStyle,
  padding: emptyComputedStyle,
  content: emptyComputedStyle,
};

export function getComputedStyles(
  element: Element,
): Record<string, ComputedStyle> {
  const styleDeclaration = window.getComputedStyle(element, null);
  const domRect = element.getBoundingClientRect();

  const marginTop = cssUtils.pv(
    styleDeclaration.getPropertyValue('margin-top'),
  );
  const marginRight = cssUtils.pv(
    styleDeclaration.getPropertyValue('margin-right'),
  );
  const marginBottom = cssUtils.pv(
    styleDeclaration.getPropertyValue('margin-bottom'),
  );
  const marginLeft = cssUtils.pv(
    styleDeclaration.getPropertyValue('margin-left'),
  );
  const marginWidth = domRect.width;
  const marginHeight = domRect.height;

  const borderTop = cssUtils.pv(
    styleDeclaration.getPropertyValue('border-top'),
  );
  const borderRight = cssUtils.pv(
    styleDeclaration.getPropertyValue('border-right'),
  );
  const borderBottom = cssUtils.pv(
    styleDeclaration.getPropertyValue('border-bottom'),
  );
  const borderLeft = cssUtils.pv(
    styleDeclaration.getPropertyValue('border-left'),
  );
  const borderWidth = marginWidth - borderRight - borderLeft;
  const borderHeight = marginHeight - borderTop - borderBottom;

  const paddingTop = cssUtils.pv(
    styleDeclaration.getPropertyValue('padding-top'),
  );
  const paddingRight = cssUtils.pv(
    styleDeclaration.getPropertyValue('padding-right'),
  );
  const paddingBottom = cssUtils.pv(
    styleDeclaration.getPropertyValue('padding-bottom'),
  );
  const paddingLeft = cssUtils.pv(
    styleDeclaration.getPropertyValue('padding-left'),
  );
  const paddingWidth = borderWidth - paddingRight - paddingLeft;
  const paddingHeight = borderHeight - paddingTop - paddingBottom;

  const contentWidth = paddingWidth;
  const contentHeight = paddingHeight;

  const posttionTop = domRect.top - marginTop;
  const posttionRight = domRect.right + marginRight;
  const posttionBottom = domRect.bottom + marginBottom;
  const posttionLeft = domRect.left - marginLeft;
  const posttionWidth = marginWidth + marginLeft + marginRight;
  const posttionHeight = marginHeight + marginTop + marginBottom;

  return {
    posttion: {
      width: posttionWidth,
      height: posttionHeight,
      top: posttionTop,
      right: posttionRight,
      bottom: posttionBottom,
      left: posttionLeft,
    },
    margin: {
      width: marginWidth,
      height: marginHeight,
      top: marginTop,
      right: marginRight,
      left: marginLeft,
      bottom: marginBottom,
    },
    border: {
      width: borderWidth,
      height: borderHeight,
      top: borderTop,
      right: borderRight,
      left: borderLeft,
      bottom: borderBottom,
    },
    padding: {
      width: paddingWidth,
      height: paddingHeight,
      top: paddingTop,
      right: paddingRight,
      left: paddingLeft,
      bottom: paddingBottom,
    },
    content: {
      ...emptyComputedStyle,
      width: contentWidth,
      height: contentHeight,
    },
  };
}
