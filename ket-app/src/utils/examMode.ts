// ========== 备考模式开关（界面偏好，不是学习数据）==========
// 备考是综合能力训练（词汇+语法+阅读+听力+写作+口语的大合集），
// 应在各单项能力打底之后再启用，所以默认关闭。
// 开关用全局 localStorage 键（与 ket-theme 同类），不进用户分片、不进云同步。
// 首页 / 侧栏 / 个人中心通过自定义事件同步，避免三处读到不一致的状态。

const KEY = 'ket-exam-mode-v1';
export const EXAM_MODE_EVENT = 'ket-exam-mode-changed';

// 隐私模式或存储被禁用时的会话内兜底值
let fallback = false;

export function isExamModeOn(): boolean {
  try {
    const v = localStorage.getItem(KEY);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

export function setExamMode(on: boolean): void {
  fallback = on;
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // 写不进去时至少保证本次会话内各处一致
  }
  window.dispatchEvent(new Event(EXAM_MODE_EVENT));
}
