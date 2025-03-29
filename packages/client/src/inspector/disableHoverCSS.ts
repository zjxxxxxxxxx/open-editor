// 定义支持手动控制的Promise扩展接口
interface AsyncTask<T> extends Promise<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

// 样式替换相关常量
const HOVER_DISABLE_RE = /:hover/g; // 匹配:hover伪类正则
const HOVER_DISABLE_TOKEN = ':oe-disable-hover'; // 替换占位符
const HOVER_ENABLE_RE = /:oe-disable-hover/g; // 匹配占位符正则
const HOVER_ENABLE_TOKEN = ':hover'; // 恢复伪类

// 禁用所有:hover伪类样式
export function disableHoverCSS() {
  return processCSSRules(HOVER_DISABLE_RE, HOVER_DISABLE_TOKEN);
}

// 恢复被禁用的:hover伪类样式
export function enableHoverCSS() {
  return processCSSRules(HOVER_ENABLE_RE, HOVER_ENABLE_TOKEN);
}

let taskID = 0; // 用于防止并发操作冲突的任务标识

/**
 * 核心处理函数：遍历并修改CSS规则
 * @param pattern 需要匹配的正则表达式
 * @param replacement 替换文本内容
 * @returns 返回可手动控制的Promise任务
 */
function processCSSRules(pattern: RegExp, replacement: string) {
  const frameChecker = createFrameDurationChecker(1000 / 60); // 每帧16.6ms
  const asyncTask = createControllablePromise(); // 创建可控Promise
  const currentTaskID = ++taskID; // 生成唯一任务ID

  // 收集所有外部样式表规则
  const externalRules = Array.from(document.styleSheets).flatMap((sheet) => {
    if (sheet.ownerNode instanceof HTMLLinkElement) {
      return Array.from(sheet.cssRules);
    }
    return [];
  });

  // 收集所有内联<style>标签
  const inlineStyles = Array.from(document.querySelectorAll('style'));

  let ruleIndex = 0;
  let styleIndex = 0;

  // 启动异步处理循环
  void (function processNextItem() {
    // 在每帧时间限制内批量处理
    while (!frameChecker()) {
      // 任务被新调用覆盖时终止当前任务
      if (currentTaskID !== taskID) {
        asyncTask.reject();
        return;
      }

      // 优先处理外部样式表规则
      if (ruleIndex < externalRules.length) {
        const rule = externalRules[ruleIndex++];
        updateStyleRule(rule.parentStyleSheet!, rule.cssText.replace(pattern, replacement));
      }
      // 处理内联样式内容
      else if (styleIndex < inlineStyles.length) {
        const style = inlineStyles[styleIndex++];
        style.textContent = style.textContent!.replace(pattern, replacement);
      }
      // 所有处理完成
      else {
        asyncTask.resolve();
        return;
      }
    }

    // 下一帧继续处理
    requestAnimationFrame(processNextItem);
  })();

  return asyncTask;
}

/**
 * 安全更新样式规则
 * @param sheet 目标样式表
 * @param newRuleText 新规则文本
 */
function updateStyleRule(sheet: CSSStyleSheet, newRuleText: string) {
  if (sheet.cssRules.length > 0) {
    sheet.deleteRule(0); // 移除旧规则
  }
  sheet.insertRule(newRuleText, sheet.cssRules.length); // 插入新规则
}

/**
 * 创建帧时长检查器（避免长时间阻塞主线程）
 * @param frameDuration 单帧最大时长(ms)
 * @returns 返回检查当前是否超过帧时长的函数
 */
function createFrameDurationChecker(frameDuration: number) {
  let lastCheckTime = performance.now();
  return () => {
    const currentTime = performance.now();
    const shouldYield = currentTime - lastCheckTime > frameDuration;
    if (shouldYield) lastCheckTime = currentTime;
    return shouldYield;
  };
}

/**
 * 创建可手动控制的Promise对象
 * @returns 返回带resolve/reject方法的Promise
 */
function createControllablePromise<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  }) as AsyncTask<T>;

  promise.resolve = resolve;
  promise.reject = reject;

  return promise;
}
