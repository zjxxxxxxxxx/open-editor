import { CSS_util, getDOMRect } from './document';

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
  const {
    // border + padding + content
    width,
    // border + padding + content
    height,
    top,
    right,
    bottom,
    left,
  } = getDOMRect(element);
  const style = window.getComputedStyle(element, null);
  const getStyle = style.getPropertyValue.bind(style);
  const getValue = (property: string) => {
    return Math.max(CSS_util.pv(getStyle(property)), 0);
  };

  const marginTop = getValue('margin-top');
  const marginRight = getValue('margin-right');
  const marginBottom = getValue('margin-bottom');
  const marginLeft = getValue('margin-left');
  const marginWidth = width;
  const marginHeight = height;

  const borderTop = getValue('border-top');
  const borderRight = getValue('border-right');
  const borderBottom = getValue('border-bottom');
  const borderLeft = getValue('border-left');
  const borderWidth = marginWidth - borderRight - borderLeft;
  const borderHeight = marginHeight - borderTop - borderBottom;

  const paddingTop = getValue('padding-top');
  const paddingRight = getValue('padding-right');
  const paddingBottom = getValue('padding-bottom');
  const paddingLeft = getValue('padding-left');
  const paddingWidth = borderWidth - paddingRight - paddingLeft;
  const paddingHeight = borderHeight - paddingTop - paddingBottom;

  const contentWidth = paddingWidth;
  const contentHeight = paddingHeight;

  const posttionTop = top - marginTop;
  const posttionRight = right + marginRight;
  const posttionBottom = bottom + marginBottom;
  const posttionLeft = left - marginLeft;
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
