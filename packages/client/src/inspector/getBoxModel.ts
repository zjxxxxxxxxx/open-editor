import { createStyleGetter, checkVisibility } from '../utils/dom';
import { checkValidElement } from '../utils/checkElement';
import { getDOMRect, getCompositeZoom } from '../utils/getDOMRect';
import { IS_FIREFOX } from '../constants';

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

const IS_BORDER_WITH_ZOOM = !IS_FIREFOX;

export function getBoxModel(el: HTMLElement | null): [BoxRect, BoxLines] {
  // When an invalid element or invisible element is encountered, empty is returned.
  if (!checkValidElement(el) || !checkVisibility(el)) {
    return getDefaultBoxModel();
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
  const getStyle = createStyleGetter(el);

  const zoom = getCompositeZoom(el);
  function withZoom(value: number, use = true) {
    return use ? value * zoom : value;
  }

  // Negative values will cause the position to shift and should be ignored.
  const marginTop = withZoom(Math.max(getStyle('margin-top'), 0));
  const marginRight = withZoom(Math.max(getStyle('margin-right'), 0));
  const marginBottom = withZoom(Math.max(getStyle('margin-bottom'), 0));
  const marginLeft = withZoom(Math.max(getStyle('margin-left'), 0));

  const borderTop = withZoom(getStyle('border-top'), IS_BORDER_WITH_ZOOM);
  const borderRight = withZoom(getStyle('border-right'), IS_BORDER_WITH_ZOOM);
  const borderBottom = withZoom(getStyle('border-bottom'), IS_BORDER_WITH_ZOOM);
  const borderLeft = withZoom(getStyle('border-left'), IS_BORDER_WITH_ZOOM);

  const paddingTop = withZoom(getStyle('padding-top'));
  const paddingRight = withZoom(getStyle('padding-right'));
  const paddingBottom = withZoom(getStyle('padding-bottom'));
  const paddingLeft = withZoom(getStyle('padding-left'));

  const positionTop = top - marginTop;
  const positionRight = right + marginRight;
  const positionBottom = bottom + marginBottom;
  const positionLeft = left - marginLeft;
  const positionWidth = width + marginLeft + marginRight;
  const positionHeight = height + marginTop + marginBottom;

  return [
    createBoxRect(
      positionWidth,
      positionHeight,
      positionTop,
      positionRight,
      positionBottom,
      positionLeft,
    ),
    {
      margin: createBoxLine(marginTop, marginRight, marginBottom, marginLeft),
      border: createBoxLine(borderTop, borderRight, borderBottom, borderLeft),
      padding: createBoxLine(paddingTop, paddingRight, paddingBottom, paddingLeft),
    },
  ];
}

export function getDefaultBoxModel(): [BoxRect, BoxLines] {
  return [
    createBoxRect(),
    {
      margin: createBoxLine(),
      border: createBoxLine(),
      padding: createBoxLine(),
    },
  ];
}

function createBoxRect(width = 0, height = 0, top = 0, right = 0, bottom = 0, left = 0): BoxRect {
  return {
    width,
    height,
    ...createBoxLine(top, right, bottom, left),
  };
}

function createBoxLine(top = 0, right = 0, bottom = 0, left = 0): BoxLine {
  return {
    top,
    right,
    bottom,
    left,
  };
}
