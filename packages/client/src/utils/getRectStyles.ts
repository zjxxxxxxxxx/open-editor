import { getDOMRect, computedStyle } from './html';

export interface RectStyle {
  width: number;
  height: number;
  top: number;
  right: number;
  left: number;
  bottom: number;
}

const emptyRectStyle = {
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
};

export const emptyRectStyles = {
  posttion: emptyRectStyle,
  margin: emptyRectStyle,
  border: emptyRectStyle,
  padding: emptyRectStyle,
  content: emptyRectStyle,
};

export function getRectStyles(el?: Element): Record<string, RectStyle> {
  if (!el) return emptyRectStyles;

  const {
    // border + padding + content
    width,
    // border + padding + content
    height,
    top,
    right,
    bottom,
    left,
  } = getDOMRect(el);
  const get = computedStyle(el);

  const marginTop = get('margin-top');
  const marginRight = get('margin-right');
  const marginBottom = get('margin-bottom');
  const marginLeft = get('margin-left');
  const marginWidth = width;
  const marginHeight = height;

  const borderTop = get('border-top');
  const borderRight = get('border-right');
  const borderBottom = get('border-bottom');
  const borderLeft = get('border-left');
  const borderWidth = marginWidth - borderRight - borderLeft;
  const borderHeight = marginHeight - borderTop - borderBottom;

  const paddingTop = get('padding-top');
  const paddingRight = get('padding-right');
  const paddingBottom = get('padding-bottom');
  const paddingLeft = get('padding-left');
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
      ...emptyRectStyle,
      width: contentWidth,
      height: contentHeight,
    },
  };
}
