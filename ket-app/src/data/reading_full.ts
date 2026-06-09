// ============================================================
// KET 阅读理解模块 - 数据文件
// 包含 KET Reading Part 1–5 共 5 大题型
// 每部分10篇文章 - 完整版
// ============================================================

export interface Part1Question {
  id: string;
  imageDesc: string;
  emoji: string;
  options: string[];
  answer: string;
}

export interface Part1Article {
  id: string;
  title: string;
  titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  questions: Part1Question[];
}

export interface PersonProfile {
  id: string;
  name: string;
  age?: number;
  description: string;
  descriptionZh: string;
}

export interface InfoPiece {
  id: string;
  text: string;
  textZh: string;
}

export interface Part2Article {
  id: string;
  title: string;
  titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  people: PersonProfile[];
  infoPieces: InfoPiece[];
  answers: Record<string, string>;
}

export interface ClozeBlank {
  id: string;
  position: number;
  options: string[];
  answer: string;
  explanation: string;
}

export interface Part3ClozeArticle {
  id: string;
  title: string;
  titleZh: string;
  passage: string;
  passageFull: string;
  blanks: ClozeBlank[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface ReadingChoice {
  id: string;
  question: string;
  questionZh: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface Part3RCArticle {
  id: string;
  title: string;
  titleZh: string;
  article: string;
  articleZh: string;
  questions: ReadingChoice[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface TFStatement {
  id: string;
  statement: string;
  statementZh: string;
  answer: 'T' | 'F' | 'DN';
  evidence: string;
  explanation: string;
}

export interface Part4TFArticle {
  id: string;
  title: string;
  titleZh: string;
  article: string;
  articleZh: string;
  statements: TFStatement[];
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

