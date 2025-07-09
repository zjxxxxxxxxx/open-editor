/**
 * 数值范围限制函数
 *
 * 当数值超过边界时，自动将其约束到最近的边界值
 * @param val 需要限制的原始数值
 * @param start 区间下限值（包含）
 * @param end 区间上限值（包含）
 */
export function clamp(val: number, start: number, end: number): number {
  return Math.min(Math.max(val, start), end);
}
