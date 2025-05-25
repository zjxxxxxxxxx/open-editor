/**
 * 创建一个偏移映射函数：
 * 将 SWC 的 UTF-8 字节偏移量 转换 为 JS 的 UTF-16 字符偏移量。
 */
export function createOffset(code: string, baseOffset: number) {
  // 累积字节长度数组，byteLens[i] 表示前 i 个字符的总字节数
  const byteLens: number[] = [0];
  for (let i = 0; i < code.length; i++) {
    byteLens[i + 1] = byteLens[i] + Buffer.from(code[i]).length;
  }

  // 返回映射函数：字节偏移 → 字符偏移
  function offset(byteOffset: number) {
    const target = byteOffset - baseOffset;
    let low = 0;
    let high = byteLens.length - 1;

    while (low < high) {
      const mid = (low + high) >> 1;
      if (byteLens[mid] < target) low = mid + 1;
      else high = mid;
    }
    return low;
  }

  return offset;
}
