/**
 * 数值范围限制函数
 *
 * 当数值超过边界时，自动将其约束到最近的边界值
 *
 * @param val 需要限制的原始数值
 * @param start 区间下限值（包含）
 * @param end 区间上限值（包含）
 */
export function clamp(val: number, start: number, end: number): number {
  /**
   * 实现逻辑：
   * 1. 先通过 Math.max 取较大值，确保数值不小于下限
   * 2. 再通过 Math.min 取较小值，确保数值不大于上限
   * 3. 最终结果始终在 [start, end] 区间内
   */

  // 第一步：确保数值不低于区间下限
  const lowerBounded = Math.max(val, start);

  // 第二步：确保数值不高于区间上限
  return Math.min(lowerBounded, end);
}
