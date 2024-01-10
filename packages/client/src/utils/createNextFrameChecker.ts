/**
 * Create a frame checker
 *
 * @param frameDuration
 * @returns checkNextFrame()
 */
export function createNextFrameChecker(frameDuration: number) {
  let frameLastTime = performance.now();
  return function checkNextFrame() {
    const currentTime = performance.now();
    const nextFrame = currentTime - frameLastTime > frameDuration;
    if (nextFrame) {
      frameLastTime = currentTime;
    }
    return nextFrame;
  };
}
