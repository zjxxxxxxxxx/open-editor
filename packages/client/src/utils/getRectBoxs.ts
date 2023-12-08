import { getDOMRect, computedStyle } from './html';

export interface RectBox {
  width: number;
  height: number;
  top: number;
  right: number;
  left: number;
  bottom: number;
}

const emptyRectBox = {
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
};

export const emptyRectBoxs = {
  position: emptyRectBox,
  margin: emptyRectBox,
  border: emptyRectBox,
  padding: emptyRectBox,
  content: emptyRectBox,
};

export function getRectBoxs(el?: Element): Record<string, RectBox> {
  if (!el) return emptyRectBoxs;

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

  // Negative values will cause the position to shift and should be ignored.
  const marginTop = Math.max(get('margin-top'), 0);
  // Negative values will cause the position to shift and should be ignored.
  const marginLeft = Math.max(get('margin-left'), 0);

  const marginRight = get('margin-right');
  const marginBottom = get('margin-bottom');
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

  const positionTop = top - marginTop;
  const positionRight = right + marginRight;
  const positionBottom = bottom + marginBottom;
  const positionLeft = left - marginLeft;
  const positionWidth = marginWidth + marginLeft + marginRight;
  const positionHeight = marginHeight + marginTop + marginBottom;

  return {
    position: {
      width: positionWidth,
      height: positionHeight,
      top: positionTop,
      right: positionRight,
      bottom: positionBottom,
      left: positionLeft,
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
      ...emptyRectBox,
      width: contentWidth,
      height: contentHeight,
    },
  };
}
