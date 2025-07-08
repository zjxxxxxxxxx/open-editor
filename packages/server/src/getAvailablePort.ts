import net from 'node:net';

// 端口选择策略配置
const MIN_PORT_NUMBER = 3000; // 最小可用端口（避免系统保留端口冲突）
const MAX_PORT_NUMBER = 9000; // 最大探测端口（不超过 9000 的安全范围）

/**
 * 智能端口探测控制器
 * @param customPort - 自定义端口号
 * @returns 首个可用的端口号
 * @throws 当所有尝试失败时抛出错误
 */
export async function getAvailablePort(customPort?: number) {
  if (customPort) return Promise.resolve(customPort);

  const concurrency = 5;
  const retries = 10;
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
      // 防止僵尸端口阻塞流程
      new Promise((resolve) => {
        // 100ms 系统级超时阈值
        setTimeout(() => resolve(null), 100);
      }),
    ]);

    // 成功获取到可用端口则提前返回
    if (result) return result as number;
  }
  // 全重试周期失败后抛出业务异常
  throw new Error(
    `port detection failed, please check system resources. number of attempts: ${retries}`,
  );
}

/**
 * 端口可用性检测器
 */
function checkPortNumber(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    // 解除进程强引用，避免阻止事件循环退出
    server.unref();

    // 错误处理（EADDRINUSE 或其他系统错误）
    server.on('error', () => {
      // 明确不可用状态
      resolve(false);
    });

    // 成功监听时的处理流程
    server.listen(port, () => {
      // 在验证后立即释放端口资源
      server.close(() => {
        // 确认端口可用性
        resolve(true);
      });
    });
  });
}

/**
 * 随机端口生成器（四位端口号）
 */
function generatePort(): number {
  // 计算安全范围内的随机整数
  return Math.floor(Math.random() * (MAX_PORT_NUMBER - MIN_PORT_NUMBER) + MIN_PORT_NUMBER);
}
