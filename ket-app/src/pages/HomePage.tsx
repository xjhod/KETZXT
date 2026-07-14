import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../store/useProgressStore';
import { useDailyCheckinStore } from '../store/useDailyCheckinStore';
import { getCurrentUser } from '../utils/auth';

const features = [
  {
    title: '每日综合训练',
    desc: '一次练齐 · 单词/语法/听力/阅读 · 弱项多练',
    icon: '🚀',
    to: '/daily',
    color: 'from-indigo-400 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    title: '每日语法打卡',
    desc: '每天10分钟 · 语法稳步进阶',
    icon: '📆',
    to: '/grammar-daily',
    color: 'from-teal-400 to-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
  {
    title: '词汇学习',
    desc: '21个主题 · 1500词 · 语音拼写练习',
    icon: '📚',
    to: '/vocabulary',
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    title: '语法学习',
    desc: '20个考点 · 2000题 · 讲解+练习',
    icon: '📝',
    to: '/grammar',
    color: 'from-green-400 to-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
  },
  {
    title: '阅读理解',
    desc: '5大题型 · 150篇文章',
    icon: '📖',
    to: '/reading',
    color: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
  },
  {
    title: '听力训练',
    desc: '5大Part · 75套真题',
    icon: '🎧',
    to: '/listening',
    color: 'from-orange-400 to-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    title: '口语练习',
    desc: '2大Part · 30道题目 · 录音评测',
    icon: '🎤',
    to: '/speaking',
    color: 'from-red-400 to-pink-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { getModuleStats, getWrongAnswers, sessionRecords } = useProgressStore();
  const dc = useDailyCheckinStore();
  const currentUser = getCurrentUser();

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
        <h2 className="text-2xl font-bold mb-2">👋 欢迎回来{currentUser ? `，${currentUser.name}` : ''}！</h2>
        <p className="text-blue-100 mb-4">今天继续加油，KET 考试就在前方！</p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate('/vocabulary')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📚 开始学词汇
          </button>
          <button
            onClick={() => navigate('/grammar')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📝 开始学语法
          </button>
          <button
            onClick={() => navigate('/grammar-daily')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📆 每日打卡
          </button>
          <button
            onClick={() => navigate('/reading')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📖 开始练阅读
          </button>
          <button
            onClick={() => navigate('/listening')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🎧 开始练听力
          </button>
          <button
            onClick={() => navigate('/speaking')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🎤 开始练口语
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
        <h3 className="text-lg font-semibold text-gray-800 mb-3">学习模块</h3>
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
