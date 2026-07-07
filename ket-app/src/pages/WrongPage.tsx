import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore, type ModuleType, type AnswerRecord } from '../store/useProgressStore';

const MODULE_LABELS: Record<ModuleType, { label: string; icon: string; color: string; bg: string }> = {
  vocabulary: { label: '词汇', icon: '📚', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  grammar: { label: '语法', icon: '📝', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  reading: { label: '阅读', icon: '📖', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  listening: { label: '听力', icon: '🎧', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  speaking: { label: '口语', icon: '🗣️', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200' },
};

const EXERCISE_LABELS: Record<string, string> = {
  spelling: '拼写练习',
  matching: '单词匹配',
  fill_blank: '填空练习',
  flashcard: '单词卡片',
  grammar_fill: '语法填空',
  grammar_choice: '语法选择',
  grammar_correction: '语法改错',
  reading_p1: '阅读Part1',
  reading_p2: '阅读Part2',
  reading_p3: '阅读Part3',
  reading_p4: '阅读Part4',
  speaking_p1: '口语Part1',
  speaking_p2: '口语Part2',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function WrongCard({ record, onRemove }: { record: AnswerRecord; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [practicing, setPracticing] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const { recordAnswer, hasConsecutiveCorrect } = useProgressStore();
  const mod = MODULE_LABELS[record.module];

  const handlePracticeResult = (isCorrect: boolean) => {
    // 记录这次练习结果
    recordAnswer({
      module: record.module,
      exerciseType: record.exerciseType,
      subjectId: record.subjectId,
      subjectName: record.subjectName,
      questionId: record.questionId,
      questionText: record.questionText,
      userAnswer: isCorrect ? record.correctAnswer : '（练习答错）',
      correctAnswer: record.correctAnswer,
      isCorrect,
    });

    if (isCorrect) {
      const newCount = consecutiveCorrect + 1;
      setConsecutiveCorrect(newCount);

      // 检查是否连续答对3次
      if (newCount >= 3 || hasConsecutiveCorrect(record.subjectId, record.questionId)) {
        setShowSuccess(true);
        setTimeout(() => {
          onRemove();
        }, 2000);
      }
    } else {
      setConsecutiveCorrect(0);
    }
  };

  if (showSuccess) {
    return (
      <div className="border rounded-xl p-4 bg-green-50 border-green-200 transition-all">
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-lg font-bold text-green-700">恭喜！已连续答对3次</p>
          <p className="text-sm text-green-600 mt-1">题目已自动从错题本移除</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-xl p-4 ${mod.bg} transition-all`}>
      {/* 头部 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/60 ${mod.color}`}>
            {mod.icon} {mod.label}
          </span>
          <span className="text-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
            {EXERCISE_LABELS[record.exerciseType] || record.exerciseType}
          </span>
          <span className="text-xs text-gray-400">
            {record.subjectName}
          </span>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{formatDate(record.answeredAt)}</span>
      </div>

      {/* 题目内容 */}
      <div className="mt-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {record.questionText.length > 80 && !expanded
            ? record.questionText.slice(0, 80) + '…'
            : record.questionText}
          {record.questionText.length > 80 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-xs text-blue-500 hover:underline"
            >
              {expanded ? '收起' : '展开'}
            </button>
          )}
        </p>
      </div>

      {/* 答案对比 */}
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-xs text-red-500 mb-0.5">你的答案</p>
          <p className="text-sm font-medium text-red-700">{record.userAnswer || '（未作答）'}</p>
        </div>
        <div className="flex-1 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <p className="text-xs text-green-600 mb-0.5">正确答案</p>
          <p className="text-sm font-medium text-green-700">{record.correctAnswer}</p>
        </div>
      </div>

      {/* 练习模式 */}
      {practicing && (
        <div className="mt-4 p-4 bg-white/80 rounded-lg border border-blue-200">
          <h4 className="text-sm font-bold text-blue-700 mb-3">📝 练习模式</h4>
          <p className="text-sm text-gray-600 mb-3">请重新练习此题，然后选择本次练习结果：</p>

          {/* 连续正确次数 */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">连续正确：</span>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  i <= consecutiveCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i}
              </span>
            ))}
          </div>

          {/* 练习结果按钮 */}
          <div className="flex gap-3">
            <button
              onClick={() => handlePracticeResult(true)}
              className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              ✅ 这次答对了
            </button>
            <button
              onClick={() => handlePracticeResult(false)}
              className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              ❌ 这次答错了
            </button>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="mt-3 flex justify-between items-center">
        <button
          onClick={() => setPracticing(!practicing)}
          className={`text-xs px-3 py-1 rounded-lg transition-colors ${
            practicing
              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {practicing ? '取消练习' : '📝 练习'}
        </button>
        <button
          onClick={onRemove}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-white/60"
        >
          ✓ 已掌握，移除
        </button>
      </div>
    </div>
  );
}

export default function WrongPage() {
  const navigate = useNavigate();
  const { getWrongAnswers, removeFromWrong, getModuleStats, reset, hasConsecutiveCorrect } = useProgressStore();

  const [activeModule, setActiveModule] = useState<ModuleType | 'all'>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 添加"listening"到模块列表
  const modules: Array<ModuleType | 'all'> = ['all', 'vocabulary', 'grammar', 'reading', 'listening', 'speaking'];

  const wrongList = getWrongAnswers(activeModule === 'all' ? undefined : activeModule);

  // 各模块统计
  const stats = (['vocabulary', 'grammar', 'reading', 'listening', 'speaking'] as ModuleType[]).map((m) => ({
    module: m,
    ...getModuleStats(m),
  }));

  const totalWrong = getWrongAnswers().length;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      {/* 页头 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">📕 错题本</h1>
          <p className="text-sm text-gray-500">
            {totalWrong > 0 ? `共 ${totalWrong} 道错题待复习` : '太棒了！暂无错题 🎉'}
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const mod = MODULE_LABELS[s.module];
          const acc = s.totalQuestions > 0
            ? Math.round((s.correctQuestions / s.totalQuestions) * 100)
            : null;
          return (
            <div key={s.module} className={`rounded-xl border p-3 text-center ${mod.bg}`}>
              <div className="text-xl mb-1">{mod.icon}</div>
              <div className={`text-lg font-bold ${mod.color}`}>
                {acc !== null ? `${acc}%` : '--'}
              </div>
              <div className="text-xs text-gray-500">{mod.label} 正确率</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {s.totalQuestions > 0 ? `${s.totalQuestions} 题` : '尚未练习'}
              </div>
            </div>
          );
        })}
      </div>

      {/* 筛选 Tab */}
      <div className="flex gap-2 flex-wrap">
        {modules.map((m) => {
          const count = m === 'all'
            ? totalWrong
            : getWrongAnswers(m as ModuleType).length;
          const isActive = activeModule === m;
          return (
            <button
              key={m}
              onClick={() => setActiveModule(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              {m === 'all' ? '全部' : MODULE_LABELS[m as ModuleType].label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 错题列表 */}
      {wrongList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-lg font-medium text-gray-500">
            {activeModule === 'all' ? '暂无错题！' : `${MODULE_LABELS[activeModule as ModuleType].label}暂无错题！`}
          </p>
          <p className="text-sm mt-2">去练习题目，错题会自动收录到这里</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            去练习
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {wrongList.map((record) => (
            <WrongCard
              key={record.id}
              record={record}
              onRemove={() => removeFromWrong(record.questionId, record.subjectId)}
            />
          ))}
        </div>
      )}

      {/* 底部重置 */}
      {stats.some((s) => s.totalQuestions > 0) && (
        <div className="pt-4 border-t border-gray-200 text-center">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              清空全部学习记录
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <p className="text-sm text-red-600">确定清空所有记录？此操作不可撤销</p>
              <button
                onClick={() => { reset(); setShowResetConfirm(false); }}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
              >
                确定
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
