// 常量：关于伪类替换的正则表达式及替换标记
const HOVER_REGEXP = {
  normal: /:hover/g,
  placeholder: /:oe-disable-hover/g,
};

const HOVER_REPLACEMENTS = {
  normal: ':hover',
  placeholder: ':oe-disable-hover',
};

// 每批次处理的规则数量
const CSS_RULES_CHUNK_SIZE = 200;

// 激活状态的任务标识器，用于取消旧任务（当启动新任务时更新此值）
let activeTaskId = 0;

/**
 * 禁用所有 :hover 伪类样式
 *
 * 通过将 ':hover' 替换为占位符，避免伪类样式影响交互效果
 *
 * @returns Promise，当所有任务完成更新后 resolve
 */
export function disableHoverCSS() {
  return updateHoverCSS(HOVER_REGEXP.normal, HOVER_REPLACEMENTS.placeholder);
}

/**
 * 恢复所有被禁用的 :hover 伪类样式
 *
 * 将占位符替换回 ':hover'，使样式恢复原状
 *
 * @returns Promise，当所有任务完成更新后 resolve
 */
export function enableHoverCSS() {
  return updateHoverCSS(HOVER_REGEXP.placeholder, HOVER_REPLACEMENTS.normal);
}

/**
 * 更新 CSS 样式规则
 *
 * 生成更新任务并采用 async/await 分帧调度执行，以避免阻塞主线程
 *
 * @param pattern 用于匹配需要替换的正则表达式
 * @param replacement 替换文本
 *
 * @returns Promise，当所有任务执行完毕后 resolve
 */
async function updateHoverCSS(pattern: RegExp, replacement: string) {
  // 启动新任务时更新全局任务 ID，之前的任务将失效
  const taskId = ++activeTaskId;
  const taskGenerator = createCSSTaskGenerator(pattern, replacement);

  await executeTasksWithFrameScheduling(
    taskGenerator,
    // 如果任务 ID 不匹配则取消当前任务
    () => taskId !== activeTaskId,
  );
}

/**
 * 生成器：按需创建 CSS 更新任务（包括外部样式表和内联样式）
 *
 * @param pattern 正则表达式，用于匹配 CSS 中的伪类
 * @param replacement 替换文本
 */
function* createCSSTaskGenerator(pattern: RegExp, replacement: string) {
  for (const styleSheet of Array.from(document.styleSheets)) {
    const { ownerNode } = styleSheet;

    if (ownerNode instanceof HTMLLinkElement) {
      yield* generateTasksForLink(styleSheet, pattern, replacement);
    } else if (ownerNode instanceof HTMLStyleElement) {
      if (ownerNode.textContent) {
        yield () => {
          ownerNode.textContent = ownerNode.textContent!.replace(pattern, replacement);
        };
      }
    }
  }
}

/**
 * 生成器：为外部样式表（<link> 引入）生成分批替换规则的任务
 *
 * @param styleSheet 外部样式表的 CSSStyleSheet 对象
 * @param pattern 正则表达式，用于匹配 CSS 中的伪类
 * @param replacement 替换文本
 */
function* generateTasksForLink(styleSheet: CSSStyleSheet, pattern: RegExp, replacement: string) {
  try {
    const rules = Array.from(styleSheet.cssRules);
    const rulesSize = rules.length;

    let index = 0;
    while (index < rulesSize) {
      // 分批次处理 cssRules，以避免一次性处理过多规则导致性能问题
      const endIndex = Math.min(index + CSS_RULES_CHUNK_SIZE, rulesSize);

      yield () => {
        while (index < endIndex) {
          const rule = rules[index];
          updateCSSRule(styleSheet, rule.cssText.replace(pattern, replacement));

          index++;
        }
      };
    }
  } catch {
    // 静默处理潜在异常，如何跨域脚本访问异常
  }
}

/**
 * 分帧执行任务生成器中的任务，以避免长时间阻塞主线程
 *
 * 在每一帧开始时检测是否需要中断任务（例如被新任务替换），或当前帧执行时间是否超限，
 * 超时则延迟到下一帧继续执行
 *
 * @param taskGenerator 生成任务的迭代器，每次 yield 返回一个任务函数
 * @param shouldCancel 一个回调函数，返回 true 时表示任务应被取消
 *
 * @returns Promise，当所有任务执行完毕时 resolve；若任务中途被取消则抛出异常
 */
async function executeTasksWithFrameScheduling(
  taskGenerator: Generator<() => void>,
  shouldCancel: () => boolean,
) {
  // 单帧最大执行时间约为 16ms
  const frameTimeChecker = createFrameDurationChecker(16);
  const scheduleNextFrame = window.requestAnimationFrame;
  let result = taskGenerator.next();

  scheduleNextFrame(function processTasks() {
    // 遍历生成器中的任务
    while (!result.done) {
      // 若检测到任务取消条件则中断任务执行
      if (shouldCancel()) {
        return;
      }
      // 如果当前帧超时，则等待下一帧继续处理任务
      if (frameTimeChecker()) {
        return scheduleNextFrame(processTasks);
      }
      // 执行当前任务
      result.value();
      result = taskGenerator.next();
    }
  });
}

/**
 * 创建帧时长检查器，检测当前帧已执行时间是否超过设定的最大时长，避免长时间阻塞主线程
 *
 * @param maxFrameDuration 每帧最大允许执行时间（单位：毫秒）
 *
 * @returns 一个函数，调用时返回是否超过设定时长
 */
function createFrameDurationChecker(maxFrameDuration: number) {
  let lastFrameTime = performance.now();
  return () => {
    const now = performance.now();
    const exceeded = now - lastFrameTime > maxFrameDuration;
    if (exceeded) {
      lastFrameTime = now;
    }
    return exceeded;
  };
}

/**
 * 安全更新 CSS 规则：先删除旧规则，再插入更新后的规则文本
 *
 * @param styleSheet 目标 CSSStyleSheet 对象
 * @param newRuleText 新的 CSS 规则文本
 */
function updateCSSRule(styleSheet: CSSStyleSheet, newRuleText: string) {
  styleSheet.deleteRule(0);
  styleSheet.insertRule(newRuleText, styleSheet.cssRules.length);
}
