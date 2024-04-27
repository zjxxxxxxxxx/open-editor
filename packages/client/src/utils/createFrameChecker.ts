export type FrameChecker = ReturnType<typeof createFrameChecker>;

/**
 * Create a frame checker
 */
export function createFrameChecker(frameDuration: number) {
  let lastTime = performance.now();
  return function checkNextFrame() {
    const currentTime = performance.now();
    const nextFrame = currentTime - lastTime > frameDuration;
    if (nextFrame) {
      lastTime = currentTime;
    }
    return nextFrame;
  };
}
