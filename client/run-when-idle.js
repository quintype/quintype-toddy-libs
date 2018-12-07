export function runWhenIdle(f, maxIdleDelay = 2950, postIdleDelay = 50, unsupportedDelay = postIdleDelay + maxIdleDelay) {
  if(global.requestIdleCallback) {
    global.requestIdleCallback(() => global.setTimeout(f, postIdleDelay), { timeout: maxIdleDelay });
  } else {
    global.setTimeout(f, unsupportedDelay);
  }
}