import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useProgressStore } from '../store/useProgressStore';

type TimeRange = 'today' | 'week' | 'month' | 'all';

const MODULE_NAMES: Record<string, string> = {
  vocabulary: '词汇',
  grammar: '语法',
  reading: '阅读',
  listening: '听力',
};

const MODULE_COLORS: Record<string, string> = {
  vocabulary: '#3b82f6',
  grammar: '#10b981',
  reading: '#f59e0b',
  listening: '#ef4444',
};

export default function StatisticsPage() {
  const { answerRecords, sessionRecords } = useProgressStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // 时间筛选逻辑
  const filteredRecords = useMemo(() => {
    if (timeRange === 'all') return answerRecords;

    const now = new Date();
    const start = new Date(now);

    if (timeRange === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (timeRange === 'week') {
      start.setDate(start.getDate() - 7);
    } else if (timeRange === 'month') {
      start.setMonth(start.getMonth() - 1);
    }

    return answerRecords.filter((r) => new Date(r.answeredAt) >= start);
  }, [answerRecords, timeRange]);

  // 学习连续天数
  const learningStreak = useMemo(() => {
    if (answerRecords.length === 0) return 0;

    const dates = new Set(
      answerRecords.map((r) => {
        const d = new Date(r.answeredAt);
        return d.toLocaleDateString('zh-CN');
      })
    );

    const today = new Date().toLocaleDateString('zh-CN');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('zh-CN');

    // 从今天或昨天开始计算
    let currentDate: Date;
    if (dates.has(today)) {
      currentDate = new Date();
    } else if (dates.has(yesterday)) {
      currentDate = new Date(Date.now() - 86400000);
    } else {
      return 0; // 今天和昨天都没学习，连续中断
    }

    let streak = 0;
    while (dates.has(currentDate.toLocaleDateString('zh-CN'))) {
      streak++;
      currentDate = new Date(currentDate.getTime() - 86400000);
    }

    return streak;
  }, [answerRecords]);

  // 按日期统计答题数
  const dailyData = useMemo(() => {
    const map = new Map<string, Record<string, number>>();

    filteredRecords.forEach((r) => {
      const date = new Date(r.answeredAt).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
      if (!map.has(date)) {
        map.set(date, { vocabulary: 0, grammar: 0, reading: 0, listening: 0 });
      }
      const entry = map.get(date)!;
      const key = r.module as string;
      if (key in entry) {
        entry[key]++;
      }
    });

    return Array.from(map.entries())
      .map(([date, data]) => ({ date, ...data }))
      .slice(-14) // 最近14天
      .reverse();
  }, [filteredRecords]);

  // 正确率趋势
  const accuracyData = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();

    filteredRecords.forEach((r) => {
      const date = new Date(r.answeredAt).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
      if (!map.has(date)) {
        map.set(date, { correct: 0, total: 0 });
      }
      const entry = map.get(date)!;
      entry.total++;
      if (r.isCorrect) entry.correct++;
    });

    return Array.from(map.entries())
      .map(([date, { correct, total }]) => ({
        date,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      }))
      .slice(-14)
      .reverse();
  }, [filteredRecords]);

  // 模块分布
  const moduleDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      vocabulary: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
    };

    filteredRecords.forEach((r) => {
      const key = r.module as string;
      if (key in counts) {
        counts[key]++;
      }
    });

    return [
      { name: '词汇', value: counts.vocabulary, color: '#3b82f6' },
      { name: '语法', value: counts.grammar, color: '#10b981' },
      { name: '阅读', value: counts.reading, color: '#f59e0b' },
      { name: '听力', value: counts.listening, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  }, [filteredRecords]);

  // 各模块正确率
  const moduleAccuracy = useMemo(() => {
    return ['vocabulary', 'grammar', 'reading', 'listening'].map((module) => {
      const moduleRecords = filteredRecords.filter((r) => r.module === module);
      const correct = moduleRecords.filter((r) => r.isCorrect).length;
      const total = moduleRecords.length;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      return {
        module,
        name: MODULE_NAMES[module],
        color: MODULE_COLORS[module],
        accuracy,
        total,
      };
    });
  }, [filteredRecords]);

  // 最薄弱主题 Top 5
  const weakestTopics = useMemo(() => {
    const topicStats = new Map<string, { correct: number; total: number; name: string }>();

    filteredRecords.forEach((r) => {
      const key = r.subjectId;
      if (!topicStats.has(key)) {
        topicStats.set(key, { correct: 0, total: 0, name: r.subjectName });
      }
      const stat = topicStats.get(key)!;
      stat.total++;
      if (r.isCorrect) stat.correct++;
    });

    return Array.from(topicStats.entries())
      .map(([id, stat]) => ({
        id,
        name: stat.name,
        accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
        total: stat.total,
      }))
      .filter((t) => t.total >= 3) // 至少做过3题才算
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  }, [filteredRecords]);

  // 总统计（基于筛选后的数据）
  const totalStats = useMemo(() => {
    const total = filteredRecords.length;
    const correct = filteredRecords.filter((r) => r.isCorrect).length;
    const modules = new Set(filteredRecords.map((r) => r.module)).size;
    const sessions = sessionRecords.filter((s) => {
      if (timeRange === 'all') return true;
      const now = new Date();
      const start = new Date(now);
      if (timeRange === 'today') {
        start.setHours(0, 0, 0, 0);
      } else if (timeRange === 'week') {
        start.setDate(start.getDate() - 7);
      } else if (timeRange === 'month') {
        start.setMonth(start.getMonth() - 1);
      }
      return new Date(s.completedAt) >= start;
    }).length;
    const totalTime = sessionRecords
      .filter((s) => {
        if (timeRange === 'all') return true;
        const now = new Date();
        const start = new Date(now);
        if (timeRange === 'today') {
          start.setHours(0, 0, 0, 0);
        } else if (timeRange === 'week') {
          start.setDate(start.getDate() - 7);
        } else if (timeRange === 'month') {
          start.setMonth(start.getMonth() - 1);
        }
        return new Date(s.completedAt) >= start;
      })
      .reduce((sum, s) => sum + s.duration, 0);

    return {
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      modules,
      sessions,
      totalTime: Math.round(totalTime / 60),
    };
  }, [filteredRecords, sessionRecords, timeRange]);

  if (answerRecords.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">暂无学习数据</h2>
        <p className="text-gray-400">完成练习后，这里会显示你的学习统计</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 + 时间筛选器 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">学习统计</h1>
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range === 'today' && '今天'}
              {range === 'week' && '本周'}
              {range === 'month' && '本月'}
              {range === 'all' && '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* 学习连续天数徽章 */}
      {learningStreak > 0 && (
        <div className="card p-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="text-2xl font-bold">{learningStreak} 天</div>
              <div className="text-sm opacity-90">连续学习</div>
            </div>
          </div>
        </div>
      )}

      {/* 总统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">总题数</div>
          <div className="text-2xl font-bold text-blue-600">{totalStats.total}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">正确率</div>
          <div className="text-2xl font-bold text-green-600">{totalStats.accuracy}%</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">使用模块</div>
          <div className="text-2xl font-bold text-purple-600">{totalStats.modules}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">练习次数</div>
          <div className="text-2xl font-bold text-orange-600">{totalStats.sessions}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">学习时长</div>
          <div className="text-2xl font-bold text-pink-600">{totalStats.totalTime}分钟</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-400 mb-1">正确题数</div>
          <div className="text-2xl font-bold text-teal-600">{totalStats.correct}</div>
        </div>
      </div>

      {/* 各模块正确率对比 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">各模块正确率</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moduleAccuracy.map((item) => (
            <div key={item.module} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-3xl font-bold mb-2" style={{ color: item.color }}>
                {item.accuracy}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{item.name}</div>
              <div className="text-xs text-gray-400 mt-1">{item.total}题</div>
              {/* 正确率进度条 */}
              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.accuracy}%`, backgroundColor: item.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最薄弱主题 Top 5 */}
      {weakestTopics.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">📉 最薄弱主题 Top 5</h2>
          <div className="space-y-3">
            {weakestTopics.map((topic, index) => (
              <div key={topic.id} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{topic.name}</span>
                    <span className="text-sm text-red-600 dark:text-red-400">{topic.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${topic.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">已做 {topic.total} 题</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 每日答题数趋势 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">每日答题数</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="vocabulary" name="词汇" fill="#3b82f6" />
            <Bar dataKey="grammar" name="语法" fill="#10b981" />
            <Bar dataKey="reading" name="阅读" fill="#f59e0b" />
            <Bar dataKey="listening" name="听力" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 正确率趋势 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">正确率趋势</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="accuracy"
              name="正确率 (%)"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 模块分布 */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">模块分布</h2>
        <div className="flex items-center gap-8">
          <div className="w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moduleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {moduleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {moduleDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                <span className="ml-auto font-medium">{item.value}题</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
