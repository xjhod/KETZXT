import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../store/useProgressStore';
import { useDailyCheckinStore } from '../store/useDailyCheckinStore';
import { getCurrentUser, getDisplayName, USER_CHANGED_EVENT } from '../utils/auth';
import { isExamModeOn, setExamMode, EXAM_MODE_EVENT } from '../utils/examMode';

// 一科一入口：按孩子当前的学习优先级排（词汇 → 语法 → 阅读 → 听力 → 口语 → 作文）。
// 不做综合每日训练；「今日备考 / 备考计划」是进阶综合能力，收进备考模式，默认不占主线。
const features = [
  {
    title: '词汇',
    desc: '今日新词 + 复习 · 21 主题 · 1500 词',
    icon: '📚',
    to: '/vocabulary',
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    title: '语法',
    desc: '每日打卡主线 · 20 考点 · 2000 题',
    icon: '📝',
    to: '/grammar-daily',
    color: 'from-teal-400 to-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    title: '阅读',
    desc: '5 大题型 · 150 篇文章',
    icon: '📖',
    to: '/reading',
    color: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    title: '听力',
    desc: '5 大 Part · 75 套真题',
    icon: '🎧',
    to: '/listening',
    color: 'from-orange-400 to-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    title: '口语',
    desc: '2 大 Part · 30 道题 · 录音评测',
    icon: '🎤',
    to: '/speaking',
    color: 'from-red-400 to-pink-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  {
    title: '作文',
    desc: '不定期进行 · 12 道题 · 写完自动存档',
    icon: '✍️',
    to: '/writing',
    color: 'from-indigo-400 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { getModuleStats, getWrongAnswers, sessionRecords } = useProgressStore();
  const dc = useDailyCheckinStore();
  // 个人中心改昵称 / 云端同步拉回昵称后，欢迎语要跟着变
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  // 备考模式开关可在首页或个人中心切换，两处靠事件同步
  const [examOn, setExamOn] = useState(isExamModeOn);
  useEffect(() => {
    const refresh = () => setCurrentUser(getCurrentUser());
    window.addEventListener(USER_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(USER_CHANGED_EVENT, refresh);
  }, []);
  useEffect(() => {
    const refresh = () => setExamOn(isExamModeOn());
    window.addEventListener(EXAM_MODE_EVENT, refresh);
    return () => window.removeEventListener(EXAM_MODE_EVENT, refresh);
  }, []);

  // 从 store 读取实时统计
  const vocabStats = getModuleStats('vocabulary');
  const grammarStats = getModuleStats('grammar');
  const readingStats = getModuleStats('reading');
  const listeningStats = getModuleStats('listening');
  const speakingStats = getModuleStats('speaking');

  const totalSessions = sessionRecords.length;
  const totalAnswered =
    vocabStats.totalQuestions +
    grammarStats.totalQuestions +
    readingStats.totalQuestions +
    listeningStats.totalQuestions +
    speakingStats.totalQuestions;
  const totalCorrect =
    vocabStats.correctQuestions +
    grammarStats.correctQuestions +
    readingStats.correctQuestions +
    listeningStats.correctQuestions +
    speakingStats.correctQuestions;
  const overallAcc = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;
  const wrongCount = getWrongAnswers().length;

  const stats = [
    { label: '已练题目', value: totalAnswered > 0 ? String(totalAnswered) : '0', unit: '题', color: 'text-blue-600' },
    { label: '练习次数', value: String(totalSessions), unit: '次', color: 'text-green-600' },
    { label: '综合正确率', value: overallAcc !== null ? String(overallAcc) : '--', unit: '%', color: 'text-purple-600' },
    { label: '待复习错题', value: String(wrongCount), unit: '道', color: wrongCount > 0 ? 'text-red-500' : 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      {/* 欢迎横幅 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">👋 欢迎回来{currentUser ? `，${getDisplayName(currentUser)}` : ''}！</h2>
        <p className="text-blue-100 mb-4">今天继续加油，KET 考试就在前方！</p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/vocabulary')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📚 学词汇
          </button>
          <button
            onClick={() => navigate('/grammar-daily')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📝 学语法
          </button>
          <button
            onClick={() => navigate('/reading')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📖 练阅读
          </button>
          <button
            onClick={() => navigate('/listening')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🎧 练听力
          </button>
          <button
            onClick={() => navigate('/speaking')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🎤 练口语
          </button>
          <button
            onClick={() => navigate('/writing')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ✍️ 写作文
          </button>
          {wrongCount > 0 && (
            <button
              onClick={() => navigate('/wrong')}
              className="bg-red-400/30 hover:bg-red-400/40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              📕 复习 {wrongCount} 道错题
            </button>
          )}
        </div>
      </div>

      {/* 学习数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}<span className="text-sm font-normal text-gray-400 ml-0.5">{s.unit}</span></p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 各模块进度小卡片 */}
      {totalAnswered > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: '词汇', stats: vocabStats, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: '语法', stats: grammarStats, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            { label: '阅读', stats: readingStats, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
            { label: '听力', stats: listeningStats, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: '口语', stats: speakingStats, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
          ].map(item => {
            const acc = item.stats.totalQuestions > 0
              ? Math.round((item.stats.correctQuestions / item.stats.totalQuestions) * 100)
              : null;
            return (
              <div key={item.label} className={`rounded-xl border p-3 text-center ${item.bg} ${item.border}`}>
                <p className={`text-lg font-bold ${item.color}`}>{acc !== null ? `${acc}%` : '--'}</p>
                <p className="text-xs text-gray-500">{item.label} 正确率</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.stats.totalQuestions} 题</p>
              </div>
            );
          })}
        </div>
      )}

      {/* 功能模块入口 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">学习能力</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => {
            const desc =
              f.to === '/grammar-daily' && dc.streak > 0
                ? `🔥 连续 ${dc.streak} 天 · 每天10分钟`
                : f.desc;
            return (
            <div
              key={f.to}
              onClick={() => navigate(f.to)}
              className={`rounded-xl p-5 border transition-all ${f.bg} ${f.border} cursor-pointer hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl text-white shrink-0`}>
                  {f.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{f.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{desc}</p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* 备考模式：综合能力训练，能力打底后再开；默认不占主线 */}
      <div className="rounded-xl border border-dashed border-gray-300 p-4 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-gray-700 text-sm">🎯 备考模式（进阶）</h4>
            <p className="text-xs text-gray-500 mt-1 break-words">
              {examOn
                ? '综合套题 + 1 年计划，适合词汇、语法打底之后使用。'
                : '把六个能力合成一套综合题练。孩子有一定基础后再开启，也可以在右上角头像 → 个人中心里打开。'}
            </p>
          </div>
          {examOn ? (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => navigate('/plan-today')}
                className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs transition-colors"
              >
                今日备考
              </button>
              <button
                onClick={() => navigate('/study-plan')}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs transition-colors"
              >
                备考计划
              </button>
              <button
                onClick={() => setExamMode(false)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs transition-colors"
              >
                关闭
              </button>
            </div>
          ) : (
            <button
              onClick={() => setExamMode(true)}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs transition-colors shrink-0"
            >
              开启
            </button>
          )}
        </div>
      </div>

      {/* 快捷入口：错题本 */}
      <div
        onClick={() => navigate('/wrong')}
        className="bg-white rounded-xl p-5 border border-gray-200 cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">📕</span>
          <div>
            <h4 className="font-semibold text-gray-800">错题本</h4>
            <p className="text-sm text-gray-500">
              {wrongCount > 0 ? `${wrongCount} 道错题待复习，点击查看` : '答题后，错题会自动收录在这里'}
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-lg">›</span>
      </div>

      {/* 版本信息：用于确认手机上是否已是新版（版本号变了=已更新，没变=仍是旧缓存） */}
      <div className="text-center text-xs text-gray-400 mt-8 space-y-1">
        <p>
          版本 v{import.meta.env.VITE_BUILD_HASH}
          {import.meta.env.VITE_BUILD_TIME ? ` · 构建 ${import.meta.env.VITE_BUILD_TIME.slice(0, 10)}` : ''}
        </p>
        <p className="text-gray-300">
          若版本号未变化，说明仍是旧缓存，请关闭标签页重进或清除站点缓存
        </p>
      </div>
    </div>
  );
}
