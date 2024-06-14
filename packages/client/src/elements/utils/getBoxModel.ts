import {
  getDOMRect,
  computedStyle,
  checkVisibility,
  checkValidElement,
} from '../../utils/dom';

export interface BoxLine {
  top: number;
  right: number;
  left: number;
  bottom: number;
}

export interface BoxLines {
  margin: BoxLine;
  border: BoxLine;
  padding: BoxLine;
}

export interface BoxRect extends BoxLine {
  width: number;
  height: number;
}

export const defaultBoxRect: BoxRect = {
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  left: 0,
  bottom: 0,
};

export const defaultBoxLines: BoxLines = {
  margin: defaultBoxRect,
  border: defaultBoxRect,
  padding: defaultBoxRect,
};

export function getBoxModel(el: HTMLElement | null): [BoxRect, BoxLines] {
  // When an invalid element or invisible element is encountered, empty is returned.
  if (!checkValidElement(el) || !checkVisibility(el)) {
    return [defaultBoxRect, defaultBoxLines];
  }

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

  const borderTop = get('border-top');
  const borderRight = get('border-right');
  const borderBottom = get('border-bottom');
  const borderLeft = get('border-left');

  const paddingTop = get('padding-top');
  const paddingRight = get('padding-right');
  const paddingBottom = get('padding-bottom');
  const paddingLeft = get('padding-left');

  const positionTop = top - marginTop;
  const positionRight = right + marginRight;
  const positionBottom = bottom + marginBottom;
  const positionLeft = left - marginLeft;
  const positionWidth = width + marginLeft + marginRight;
  const positionHeight = height + marginTop + marginBottom;

  return [
    {
      width: positionWidth,
      height: positionHeight,
      top: positionTop,
      right: positionRight,
      bottom: positionBottom,
      left: positionLeft,
    },
    {
      margin: {
        top: marginTop,
        right: marginRight,
        left: marginLeft,
        bottom: marginBottom,
      },
      border: {
        top: borderTop,
        right: borderRight,
        left: borderLeft,
        bottom: borderBottom,
      },
      padding: {
        top: paddingTop,
        right: paddingRight,
        left: paddingLeft,
        bottom: paddingBottom,
      },
    },
  ];
}
