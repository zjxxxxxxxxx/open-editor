import net from 'node:net';

// 端口选择策略配置
const MIN_PORT_NUMBER = 3000; // 最小可用端口（避免系统保留端口冲突）
const MAX_PORT_NUMBER = 9000; // 最大探测端口（不超过 9000 的安全范围）

/**
 * 智能端口探测控制器
 *
 * @param concurrency - 并发探测数（默认 5，建议根据系统负载调整）
 * @param retries - 最大重试次数（默认 10，防止无限循环）
 *
 * @returns 首个可用的端口号
 *
 * @throws 当所有尝试失败时抛出错误
 *
 * 算法核心：
 * 1. 批量生成：每次循环生成 concurrency 个随机端口
 * 2. 竞争检测：使用 Promise.race 获取最快响应结果
 * 3. 超时熔断：100ms 未响应的端口视为不可用
 * 4. 重试机制：避免单次失败导致流程终止
 */
export async function getAvailablePort({ concurrency = 5, retries = 10 } = {}) {
  // 重试循环保障基础可用性
  for (let i = 0; i < retries; i++) {
    // 生成候选端口池（规避单一顺序导致的端口冲突）
    const ports = Array.from({ length: concurrency }, generatePort);

    // 创建异步探测任务池
    const promises = ports.map((port) =>
      checkPortNumber(port).then(
        // 映射可用端口，不可用转为 null
        (available) => (available ? port : null),
      ),
    );

    // 竞争式响应处理（优先取最快成功结果）
    const result = await Promise.race([
      ...promises,
      // 超时熔断保护：防止僵尸端口阻塞流程
      new Promise((resolve) => {
        // 100ms 系统级超时阈值
        setTimeout(() => resolve(null), 100);
      }),
    ]);

    // 成功获取到可用端口则提前返回
    if (result) return result as number;
  }
  // 全重试周期失败后抛出业务异常
  throw new Error(`端口探测失败，请检查系统资源。尝试次数：${retries}`);
}

/**
 * 端口可用性检测器
 *
 * 原理说明：
 * 1. 创建临时 TCP 服务尝试绑定端口
 * 2. 成功监听 → 端口可用
 * 3. 监听报错 → 端口被占用
 * 4. 使用 unref() 防止进程挂起
 */
function checkPortNumber(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    // 解除进程强引用，避免阻止事件循环退出
    server.unref();

    // 错误处理（EADDRINUSE 或其他系统错误）
    server.on('error', () => {
      resolve(false); // 明确不可用状态
    });

    // 成功监听时的处理流程
    server.listen(port, () => {
      // 在验证后立即释放端口资源
      server.close(() => {
        resolve(true); // 确认端口可用性
      });
    });
  });
}

/**
 * 随机端口生成器（四位端口号
 * ）
 * 安全策略：
 * - 范围限制：3000-9000 避免系统端口冲突
 * - 随机分布：均匀分布降低重复碰撞概率
 *
 * @optimizations
 * 可升级为基于历史记录的智能生成
 */
function generatePort(): number {
  // 计算安全范围内的随机整数
  return Math.floor(Math.random() * (MAX_PORT_NUMBER - MIN_PORT_NUMBER) + MIN_PORT_NUMBER);
}
