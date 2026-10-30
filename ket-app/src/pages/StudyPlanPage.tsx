import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyPlan } from '../data/studyPlan';
import type { SkillArea, WeekPlan } from '../data/studyPlan';
import { dateKey } from '../data/dailyPlan';
import { usePlanStore } from '../store/usePlanStore';

const areaMeta: Record<SkillArea, { label: string; color: string; bg: string }> = {
  reading:   { label: '阅读', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  writing:   { label: '写作', color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
  listening: { label: '听力', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
  speaking:  { label: '口语', color: 'text-red-600',    bg: 'bg-red-50 border-red-100' },
};

const dayLabels = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function StudyPlanPage() {
  const [month, setMonth] = useState(1);
  const [week, setWeek] = useState(1);
  const current: WeekPlan | undefined = studyPlan.weeks.find((w) => w.month === month && w.week === week);

  const navigate = useNavigate();
  const todayKey = dateKey(new Date());
  const startDate = usePlanStore((s) => s.startDate);
  const ensureStartDate = usePlanStore((s) => s.ensureStartDate);
  const setStartDate = usePlanStore((s) => s.setStartDate);
  const getStreak = usePlanStore((s) => s.getStreak);
  const getCompletedCount = usePlanStore((s) => s.getCompletedCount);
  const isDone = usePlanStore((s) => s.isDone);
  const effectiveStart = startDate ?? todayKey;

  const areas: SkillArea[] = ['reading', 'writing', 'listening', 'speaking'];

  return (
    <div className="space-y-6">
      {/* 头部：诊断 + 配比 */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">🎯 KET 一年备考计划</h2>
        <p className="text-indigo-100 text-sm">诊断驱动 · 写作优先（写作最弱 → 最大投入）</p>
        <div className="flex gap-3 flex-wrap mt-4">
          {areas.map((a) => (
            <div key={a} className="bg-white/20 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-bold">{studyPlan.ratios[a]}%</p>
              <p className="text-xs text-indigo-100">{areaMeta[a].label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 今日执行入口 */}
      <div className="bg-white rounded-2xl shadow p-4 border border-orange-200">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-bold text-gray-800">📌 今日备考</p>
            <p className="text-xs text-gray-500 mt-0.5">
              按计划自动出题 · 客观题判分 + 写作/口语任务 · 完成后自动打卡
            </p>
            <p className="text-xs text-gray-400 mt-1">
              起始日 {effectiveStart} · 已完成 {getCompletedCount()} 天 · 连续 {getStreak(todayKey)} 天
              {isDone(todayKey) ? ' · ✅ 今天已完成' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={effectiveStart}
              onChange={(e) => {
                if (!e.target.value) return;
                ensureStartDate(todayKey);
                setStartDate(e.target.value);
              }}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600"
            />
            <button onClick={() => navigate('/plan-today')} className="btn-primary text-sm whitespace-nowrap">
              开始今日备考 →
            </button>
          </div>
        </div>
      </div>

      {/* 诊断结果 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <p className="text-sm text-gray-500 mb-2">诊断得分（1–5）</p>
        <div className="flex gap-4 flex-wrap">
          {areas.map((a) => (
            <span key={a} className="text-sm text-gray-600">
              {areaMeta[a].label}：<b className={areaMeta[a].color}>{studyPlan.diagnosis[a]}</b>
            </span>
          ))}
        </div>
      </div>

      {/* 阶段时间轴 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">四个阶段</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {studyPlan.phases.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="font-semibold text-gray-800">{p.name}</p>
              <p className="text-xs text-gray-400">第 {p.months[0]}–{p.months[1]} 月</p>
              <p className="text-xs text-gray-500 mt-1">{p.writingFocus}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 周任务查看器 */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-gray-600">月份</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>第 {m} 月</option>
            ))}
          </select>
          <label className="text-sm text-gray-600">周次</label>
          <select
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 text-sm"
          >
            {[1, 2, 3, 4].map((w) => (
              <option key={w} value={w}>第 {w} 周</option>
            ))}
          </select>
        </div>

        {current && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">本周重点：{current.focus}</p>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => {
                const dayTasks = current.tasks.filter((t) => t.day === d);
                if (dayTasks.length === 0) return null;
                return (
                  <div key={d} className="flex gap-3 items-start">
                    <div className="w-12 shrink-0 text-sm text-gray-400 pt-3">{dayLabels[d]}</div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dayTasks.map((t, i) => (
                        <div key={i} className={`rounded-lg border p-3 ${areaMeta[t.area].bg}`}>
                          <span className={`text-xs font-medium ${areaMeta[t.area].color}`}>
                            {areaMeta[t.area].label} · {t.minutes} 分
                          </span>
                          <p className="text-sm font-medium text-gray-800 mt-1">{t.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 写作脚手架 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">写作脚手架</h3>
        <div className="space-y-2">
          {studyPlan.scaffolds.map((s) => (
            <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-800">
                {s.kind === 'email' ? '邮件' : '故事'} · 第 {s.stage} 阶
              </p>
              <p className="text-sm text-blue-700 mt-2 font-mono bg-blue-50 rounded p-2 break-words">{s.template}</p>
              <p className="text-xs text-gray-500 mt-2">要求：{s.requirement}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
