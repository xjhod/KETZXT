// ========= KET 口语练习 - 类型定义 =========

/** Part 1: 回答问题 */
export interface SpeakingPart1Question {
  id: string;
  question: string;         // 英文问题
  questionZh: string;        // 中文翻译
  prompts: string[];         // 提示词（2-3个）
  keywords: string[];        // 关键词（用于评分）
  modelAnswer: string;       // 标准答案文本
}

/** Part 2: 看图讨论 */
export interface SpeakingPart2Question {
  id: string;
  imageUrl: string;         // 图片文件名（放在 public/speaking/ 目录）
  questions: string[];       // 讨论问题（2-3个）
  keywords: string[];        // 关键词提示
  tips: string[];           // 回答建议
}

/** 练习记录 */
export interface SpeakingRecord {
  id: string;
  userId: string;
  questionId: string;
  part: 1 | 2;
  audioBlob?: Blob;          // 录音 Blob（临时）
  audioUrl?: string;         // 录音文件 URL（持久化后）
  transcript: string;        // 语音识别结果
  score: number;             // 得分 0-100
  matchedKeywords: string[]; // 匹配到的关键词
  feedback: string;          // 反馈文本
  createdAt: string;
}
