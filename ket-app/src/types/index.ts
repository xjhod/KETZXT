// 词汇相关类型
export interface Word {
  id: string;
  en: string;        // 英文
  phonetic: string;   // 音标
  zh: string;         // 中文释义
  example: string;    // 英文例句
  exampleZh: string;  // 例句中文
}

export interface VocabularyTheme {
  id: string;
  name: string;       // 主题名称
  nameZh: string;      // 中文名称
  icon: string;        // 图标 emoji
  words: Word[];       // 词汇列表
}

// 词汇练习题型
export interface SpellingQuestion {
  id: string;
  wordId: string;
  en: string;
  phonetic: string;
  audioText: string;   // 用于语音合成的文本
}

export interface MatchingQuestion {
  id: string;
  themeId: string;
  prompt: string;       // 题目提示（英文或中文）
  promptLang: 'en' | 'zh';
  options: string[];     // 选项
  answer: string;        // 正确答案
}

export interface FillBlankQuestion {
  id: string;
  themeId: string;
  sentence: string;      // 句子（含空白）
  answer: string;        // 正确答案
  hint: string;          // 提示（中文）
}

// 语法相关类型
export interface GrammarPoint {
  id: string;
  name: string;         // 语法点名称
  nameZh: string;       // 中文名称
  explanation: string;   // 讲解（中文）
  examples: GrammarExample[];  // 例句
}

export interface GrammarExample {
  en: string;
  zh: string;
}

export interface GrammarFillQuestion {
  id: string;
  grammarId: string;
  sentence: string;      // 句子（含空白）
  options: string[];      // 选项（填空题型）
  answer: string;         // 正确答案
  explanation: string;    // 解析
}

export interface GrammarChoiceQuestion {
  id: string;
  grammarId: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface GrammarCorrectionQuestion {
  id: string;
  grammarId: string;
  sentence: string;      // 可能错误的句子
  answer: string;         // 正确形式
  explanation: string;    // 解析
}

// 学习进度
export interface WordProgress {
  wordId: string;
  spellingCorrect: number;
  spellingTotal: number;
  lastPracticed: string;  // ISO日期
}

export interface ThemeProgress {
  themeId: string;
  wordsLearned: string[];     // 已学会的单词ID
  spellingPassed: boolean;
  matchingPassed: boolean;
  fillBlankPassed: boolean;
}

export interface GrammarProgress {
  grammarId: string;
  fillCorrect: number;
  fillTotal: number;
  choiceCorrect: number;
  choiceTotal: number;
  correctionCorrect: number;
  correctionTotal: number;
  quizPassed: boolean;
}

// 错题本
export interface WrongQuestion {
  id: string;
  module: 'vocabulary' | 'grammar' | 'reading' | 'listening';
  questionId: string;
  questionType: string;
  userAnswer: string;
  correctAnswer: string;
  addedAt: string;  // ISO日期
}

// ========== 听力模块类型 ==========

/** 听力套题公共属性 */
export interface ListeningSet {
  id: string;
  title: string;         // 套题标题（英文）
  titleZh: string;       // 中文标题
  part: 1 | 2 | 3 | 4 | 5;
  difficulty: 'easy' | 'medium' | 'hard';
  speed: 'slow' | 'normal' | 'fast';  // 语速分级
}

/** Part 1: 听图选答案 — 5题，每题1图+3选项音频文本 */
export interface ListeningPart1Question {
  id: string;
  imageEmoji: string;    // 用emoji表示图片内容
  imageDesc: string;      // 图片描述（中文，用于显示）
  audioText: string;      // 要朗读的音频文本（题干）
  options: string[];      // A/B/C 三个选项文本
  answer: string;         // 正确答案 A/B/C
  transcript: string;      // 音频原文（用于解析）
}

export interface ListeningPart1Set extends ListeningSet {
  part: 1;
  questions: ListeningPart1Question[];
}

/** Part 2: 听独白填空（note completion）— 一段独白，填写 5 个关键信息 */
export interface ListeningPart2Blank {
  id: string;
  field: string;          // 字段英文标签（如：Event / Day / Time / Price / Place）
  fieldZh: string;        // 字段中文标签
  answer: string;         // 正确答案（1-2 个词或数字，多个用 " / " 分隔）
  audioText: string;      // 包含此空的句子的朗读文本（用于单句 TTS 播放）
  hint: string;           // 提示（中文）
  choices?: string[];     // 选项列表（可选，提供则显示按钮选择）
}

export interface ListeningPart2Set extends ListeningSet {
  part: 2;
  speaker: string;               // 说话人身份（如：Camp Leader / Librarian）
  monologueAudio: string;        // 完整独白朗读文本
  transcript: string;            // 完整原文（与 monologueAudio 一致）
  blanks: ListeningPart2Blank[]; // 5 个填空
}

/** Part 3: 听录音填空 — 一段长对话/独白，填空 */
export interface ListeningPart3Blank {
  id: string;
  field: string;          // 字段名称（如：Name / Age / Phone）
  fieldZh: string;        // 字段中文名称（如：姓名 / 年龄 / 电话）
  answer: string;          // 正确答案（多个答案用 " / " 分隔）
  hint: string;            // 提示（中文）
  audioText: string;       // 包含此空的句子的朗读文本
  choices?: string[];      // 选项列表（可选，有则此空显示为按钮选择）
}

export interface ListeningPart3Set extends ListeningSet {
  part: 3;
  speaker?: string;       // 说话者身份（如：Camp Counselor）
  passage?: string;       // 完整短文（空格用 ____ 表示），缺省时 UI 用 generatePassage 兜底
  monologueAudio: string; // 整段短文的朗读文本（独白）
  blanks: ListeningPart3Blank[];
  transcript: string;      // 完整原文
}

/** Part 4: 选择题 — 一段对话/访谈，5-6道选择 */
export interface ListeningPart4Question {
  id: string;
  question: string;       // 问题文本
  options: string[];       // A/B/C/D 选项
  answer: string;          // 正确答案
  hint: string;            // 提示（中文）
  explanation?: string;    // 解析（可选，数据缺失时回退显示 hint）
  audioText?: string;      // 相关对话片段的朗读文本（可选）
}

export interface ListeningPart4Set extends ListeningSet {
  part: 4;
  speaker?: string;        // 说话者身份（如：Teacher / Friend）
  monologueAudio: string;  // 完整独白/对话朗读文本
  transcript: string;      // 完整原文
  questions: ListeningPart4Question[];
}

/** Part 5: 听写/笔记填空 — 一段独白，填写关键信息 */
export interface ListeningPart5Note {
  id: string;
  field: string;          // 字段名称（如：Name / Age / Phone）
  fieldZh: string;        // 中文字段名
  answer: string;          // 正确答案
  audioText: string;       // 包含此信息的句子的朗读文本
  hint: string;            // 提示
}

export interface ListeningPart5Set extends ListeningSet {
  part: 5;
  title: string;           // 笔记标题（如：Summer Camp Registration）
  titleZh: string;
  speaker: string;         // 说话人
  monologueAudio: string;  // 完整独白的朗读文本
  notes: ListeningPart5Note[];
  transcript: string;       // 完整原文
}
