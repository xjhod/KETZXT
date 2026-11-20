// 听力播放配置：语速 + 循环，存本机 localStorage，不进云同步。
// 纯函数 normalizeRate / normalizeLoop 可独立单测，读写函数做 window 守卫。

export const LISTENING_RATE_KEY = 'ket-listening-rate-v1';
export const LISTENING_LOOP_KEY = 'ket-listening-loop-v1';

/** 允许的语速档位（0.75 慢 / 1 正常 / 1.25 快） */
export const ALLOWED_RATES = [0.75, 1, 1.25] as const;
export const DEFAULT_RATE = 1;
export const DEFAULT_LOOP = false;

/** 非法值一律回退到正常语速 */
export function normalizeRate(value: unknown): number {
  return ALLOWED_RATES.some((r) => r === value) ? (value as number) : DEFAULT_RATE;
}

/** 循环只认布尔 true */
export function normalizeLoop(value: unknown): boolean {
  return value === true;
}

function safeGet(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch {
    /* 隐私模式/配额满时静默失败，不影响播放 */
  }
}

export function readRate(): number {
  return normalizeRate(Number(safeGet(LISTENING_RATE_KEY)));
}

export function writeRate(rate: number): void {
  safeSet(LISTENING_RATE_KEY, String(normalizeRate(rate)));
}

export function readLoop(): boolean {
  return normalizeLoop(safeGet(LISTENING_LOOP_KEY) === 'true');
}

export function writeLoop(loop: boolean): void {
  safeSet(LISTENING_LOOP_KEY, String(normalizeLoop(loop)));
}

/** 循环开启时一段音频连播的次数 */
export function playTimes(loop: boolean): number {
  return loop ? 2 : 1;
}
