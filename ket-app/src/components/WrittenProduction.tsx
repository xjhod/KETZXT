// ========== 手写产出输入组件（词汇造句 / 语法手写共用）==========
//
// 设计约束：
//   · 写之前屏幕上不出现可照抄的完整答案；错两次也只给低刺激提示
//   · 校验通过后才显示「对照内容」（词库真实例句 / 标准答案）
//   · 可跳过由调用方负责，本组件不强制提交
//   · 不打分、不判语法、不改任何记忆状态；通过只回调 onAccepted
//   · 手机窄屏：textarea 宽度 100%、flex 带 min-w-0、长句 break-words
import { useState, type ReactNode } from 'react';
import type { WrittenCheck } from '../utils/writtenProduction';

interface WrittenProductionProps {
  title: string;
  description?: string;
  placeholder?: string;
  submitLabel?: string;
  /** 连续两次不通过后才显示；不得包含可以直接照抄的英文答案 */
  hint?: ReactNode;
  /** 校验通过后显示的对照内容（此时已经写完，不构成照抄） */
  reveal?: ReactNode;
  check: (text: string) => WrittenCheck;
  onAccepted: (text: string) => void;
}

export function WrittenProduction({
  title,
  description,
  placeholder = '在这里写一句英文',
  submitLabel = '记下这句话',
  hint,
  reveal,
  check,
  onAccepted,
}: WrittenProductionProps) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [accepted, setAccepted] = useState('');

  const submit = () => {
    const value = text.trim();
    const result = check(value);
    if (!result.ok) {
      setErr(result.reason ?? '再试一次');
      setAttempts((n) => n + 1);
      return;
    }
    setErr('');
    setAccepted(value);
    onAccepted(value);
  };

  return (
    <div className="mt-3 min-w-0">
      <p className="text-sm font-medium text-gray-800 break-words">{title}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words">{description}</p>
      )}

      {!accepted ? (
        <form
          onSubmit={(e) => { e.preventDefault(); submit(); }}
          className="mt-2 min-w-0"
        >
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); if (err) setErr(''); }}
            placeholder={placeholder}
            rows={2}
            maxLength={160}
            autoComplete="off"
            autoCapitalize="sentences"
            spellCheck={false}
            className="w-full min-w-0 block border border-gray-200 rounded-xl px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-300 resize-y"
          />
          <div className="flex flex-wrap items-center gap-2 mt-2 min-w-0">
            <button type="submit" className="btn-primary shrink-0" disabled={!text.trim()}>
              {submitLabel}
            </button>
            <span className="text-xs text-gray-400">{text.length}/160</span>
          </div>
          {err && <p className="text-xs text-amber-700 mt-2 break-words">{err}</p>}
          {attempts >= 2 && hint && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600 min-w-0 break-words">
              {hint}
            </div>
          )}
        </form>
      ) : (
        <div className="mt-2 p-3 bg-green-50 rounded-xl min-w-0">
          <p className="text-sm text-green-700 break-words">✓ 已记下：{accepted}</p>
          {reveal && (
            <div className="mt-2 pt-2 border-t border-green-100 text-xs text-gray-600 min-w-0 break-words">
              {reveal}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
