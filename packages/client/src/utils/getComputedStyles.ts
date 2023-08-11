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
  const {
    // border + padding + content
    width,
    // border + padding + content
    height,
    top,
    right,
    bottom,
    left,
  } = element.getBoundingClientRect();
  const style = window.getComputedStyle(element, null);
  const getValue = style.getPropertyValue.bind(style);

  const marginTop = Math.max(cssUtils.pv(getValue('margin-top')), 0);
  const marginRight = Math.max(cssUtils.pv(getValue('margin-right')), 0);
  const marginBottom = Math.max(cssUtils.pv(getValue('margin-bottom')), 0);
  const marginLeft = Math.max(cssUtils.pv(getValue('margin-left')), 0);
  const marginWidth = width;
  const marginHeight = height;

  const borderTop = cssUtils.pv(getValue('border-top'));
  const borderRight = cssUtils.pv(getValue('border-right'));
  const borderBottom = cssUtils.pv(getValue('border-bottom'));
  const borderLeft = cssUtils.pv(getValue('border-left'));
  const borderWidth = marginWidth - borderRight - borderLeft;
  const borderHeight = marginHeight - borderTop - borderBottom;

  const paddingTop = cssUtils.pv(getValue('padding-top'));
  const paddingRight = cssUtils.pv(getValue('padding-right'));
  const paddingBottom = cssUtils.pv(getValue('padding-bottom'));
  const paddingLeft = cssUtils.pv(getValue('padding-left'));
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
