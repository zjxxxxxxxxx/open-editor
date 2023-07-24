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

  const marginTop = parseInt(
    styleDeclaration.getPropertyValue('margin-top'),
    10,
  );
  const marginRight = parseInt(
    styleDeclaration.getPropertyValue('margin-right'),
    10,
  );
  const marginBottom = parseInt(
    styleDeclaration.getPropertyValue('margin-bottom'),
    10,
  );
  const marginLeft = parseInt(
    styleDeclaration.getPropertyValue('margin-left'),
    10,
  );
  const marginWidth = domRect.width;
  const marginHeight = domRect.height;

  const borderTop = parseInt(
    styleDeclaration.getPropertyValue('border-top'),
    10,
  );
  const borderRight = parseInt(
    styleDeclaration.getPropertyValue('border-right'),
    10,
  );
  const borderBottom = parseInt(
    styleDeclaration.getPropertyValue('border-bottom'),
    10,
  );
  const borderLeft = parseInt(
    styleDeclaration.getPropertyValue('border-left'),
    10,
  );
  const borderWidth = marginWidth - borderRight - borderLeft;
  const borderHeight = marginHeight - borderTop - borderBottom;

  const paddingTop = parseInt(
    styleDeclaration.getPropertyValue('padding-top'),
    10,
  );
  const paddingRight = parseInt(
    styleDeclaration.getPropertyValue('padding-right'),
    10,
  );
  const paddingBottom = parseInt(
    styleDeclaration.getPropertyValue('padding-bottom'),
    10,
  );
  const paddingLeft = parseInt(
    styleDeclaration.getPropertyValue('padding-left'),
    10,
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
