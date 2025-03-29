import { hasOwn } from '@open-editor/shared';
import { IS_CLIENT } from '../constants';
import { createStyleGetter } from './dom';

type BrowserInfo = {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
  version: number;
  chromiumBase?: number;
};

/** 浏览器版本嗅探器 (兼容所有主流浏览器) */
function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  const browserInfo: BrowserInfo = { name: 'unknown', version: 0 };

  // 现代浏览器检测 (支持Chromium系)
  const uaData = (navigator as any).userAgentData || null;
  if (uaData?.brands) {
    for (const { brand, version } of uaData.brands) {
      const normalizedBrand = brand.toLowerCase();
      if (normalizedBrand.includes('chromium')) {
        browserInfo.chromiumBase = +version;
      }
      if (normalizedBrand === 'chrome' || normalizedBrand === 'microsoft edge') {
        browserInfo.name = normalizedBrand === 'microsoft edge' ? 'edge' : 'chrome';
        browserInfo.version = +version;
      }
    }
    return browserInfo;
  }

  // 传统浏览器嗅探 (兼容Safari/Firefox)
  const edgeMatch = ua.match(/Edg\/(\d+)/);
  if (edgeMatch) {
    browserInfo.name = 'edge';
    browserInfo.version = +edgeMatch[1];
    return browserInfo;
  }

  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch) {
    browserInfo.name = 'chrome';
    browserInfo.version = +chromeMatch[1];
    return browserInfo;
  }

  const firefoxMatch = ua.match(/Firefox\/(\d+)/);
  if (firefoxMatch) {
    browserInfo.name = 'firefox';
    browserInfo.version = +firefoxMatch[1];
    return browserInfo;
  }

  const safariMatch = ua.match(/Version\/(\d+).+Safari/);
  if (safariMatch) {
    browserInfo.name = 'safari';
    browserInfo.version = +safariMatch[1];
  }

  return browserInfo;
}

/** 判断是否需要手动计算缩放补偿 */
function checkComputedNeeded(): boolean {
  if (!IS_CLIENT) return false;

  // 获取浏览器特征信息
  const { name, version, chromiumBase } = getBrowserInfo();

  // 排除不支持zoom的浏览器
  if (name === 'firefox' || name === 'safari') return false;

  // 检测zoom样式支持
  if (!hasOwn(document.body.style, 'zoom')) return false;

  // Chromium内核版本判断 (含Edge)
  const chromiumVersion = chromiumBase || version;
  return chromiumVersion <= 127; // 兼容Chromium内核<=127的浏览器
}

const NEED_COMPUTED = IS_CLIENT ? checkComputedNeeded() : false;

/** 获取元素经过zoom校正后的边界矩形 */
export function getDOMRect(target: HTMLElement): Omit<DOMRectReadOnly, 'toJSON'> {
  const rect = target.getBoundingClientRect().toJSON();
  return NEED_COMPUTED ? computedDOMRect(target, rect) : rect;
}

/** 计算zoom补偿后的矩形尺寸 */
function computedDOMRect(target: HTMLElement, baseRect: DOMRect): DOMRect {
  const zoomRate = getCompositeZoom(target);

  if (zoomRate !== 1) {
    // 使用几何变换代替循环操作
    const { x, y, width, height } = baseRect;
    const matrix = new DOMMatrix().translate(x, y).scale(zoomRate, zoomRate).translate(-x, -y);

    return new DOMRect(
      matrix.m41 + x * (zoomRate - 1),
      matrix.m42 + y * (zoomRate - 1),
      width * zoomRate,
      height * zoomRate,
    );
  }
  return baseRect;
}

/** 获取元素及其祖先链的复合缩放率 */
export function getCompositeZoom(target: HTMLElement): number {
  let zoom = 1;
  let currentElement: HTMLElement | null = target;

  while (currentElement) {
    // 优化样式获取性能
    const zoomValue = createStyleGetter(currentElement)('zoom');
    zoom *= zoomValue || 1;

    // 安全遍历父元素
    currentElement = currentElement.parentElement;

    // 防止无限循环 (兼容Shadow DOM)
    if (currentElement?.tagName === 'HTML') break;
  }

  return zoom;
}
