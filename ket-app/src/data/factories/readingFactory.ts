/**
 * 阅读模块数据工厂函数
 * 用于生成符合TypeScript类型的阅读题数据
 */

import type {
  Part1Article,
  Part1Question,
  Part2Article,
  PersonProfile,
  InfoPiece,
  Part3ClozeArticle,
  ClozeBlank,
  Part3RCArticle,
  ReadingChoice,
  Part4TFArticle,
  TFStatement,
} from '../types';

// ==================== Part 1: 图片配对题 ====================

interface CreatePart1ArticleParams {
  id: string;
  title: string;
  titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  questions: Omit<Part1Question, 'id'>[];
}

export function createPart1Article(params: CreatePart1ArticleParams): Part1Article {
  return {
    id: params.id,
    title: params.title,
    titleZh: params.titleZh,
    difficulty: params.difficulty,
    topic: params.topic,
    questions: params.questions.map((q, i) => ({
      id: `${params.id}-${String(i + 1).padStart(3, '0')}`,
      ...q,
    })),
  };
}

// ==================== Part 2: 信息匹配题 ====================

interface CreatePart2ArticleParams {
  id: string;
  title: string;
  titleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  people: Omit<PersonProfile, 'id'>[];
  infoPieces: Omit<InfoPiece, 'id'>[];
  answers: Record<string, string>;
}

export function createPart2Article(params: CreatePart2ArticleParams): Part2Article {
  return {
    id: params.id,
    title: params.title,
    titleZh: params.titleZh,
    difficulty: params.difficulty,
    topic: params.topic,
    people: params.people.map((p, i) => ({
      id: `P${String(i + 1).padStart(2, '0')}`,
      ...p,
    })),
    infoPieces: params.infoPieces.map((info, i) => ({
      id: `INFO${String(i + 1).padStart(2, '0')}`,
      ...info,
    })),
    answers: params.answers,
  };
}

// ==================== Part 3-1: 完形填空 ====================

interface CreatePart3ClozeParams {
  id: string;
  title: string;
  titleZh: string;
  passage: string;
  passageFull: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  blanks: Omit<ClozeBlank, 'id'>[];
}

export function createPart3ClozeArticle(params: CreatePart3ClozeParams): Part3ClozeArticle {
  return {
    id: params.id,
    title: params.title,
    titleZh: params.titleZh,
    passage: params.passage,
    passageFull: params.passageFull,
    difficulty: params.difficulty,
    topic: params.topic,
    blanks: params.blanks.map((b, i) => ({
      id: `blank-${String(i + 1).padStart(2, '0')}`,
      ...b,
    })),
  };
}

// ==================== Part 3-2: 阅读理解选择题 ====================

interface CreatePart3RCParams {
  id: string;
  title: string;
  titleZh: string;
  article: string;
  articleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  questions: Omit<ReadingChoice, 'id'>[];
}

export function createPart3RCArticle(params: CreatePart3RCParams): Part3RCArticle {
  return {
    id: params.id,
    title: params.title,
    titleZh: params.titleZh,
    article: params.article,
    articleZh: params.articleZh,
    difficulty: params.difficulty,
    topic: params.topic,
    questions: params.questions.map((q, i) => ({
      id: `${params.id}-q${String(i + 1).padStart(2, '0')}`,
      ...q,
    })),
  };
}

// ==================== Part 4: 正误判断题 ====================

interface CreatePart4TFParams {
  id: string;
  title: string;
  titleZh: string;
  article: string;
  articleZh: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  statements: Omit<TFStatement, 'id'>[];
}

export function createPart4TFArticle(params: CreatePart4TFParams): Part4TFArticle {
  return {
    id: params.id,
    title: params.title,
    titleZh: params.titleZh,
    article: params.article,
    articleZh: params.articleZh,
    difficulty: params.difficulty,
    topic: params.topic,
    statements: params.statements.map((s, i) => ({
      id: `${params.id}-s${String(i + 1).padStart(2, '0')}`,
      ...s,
    })),
  };
}

// ==================== 模板数据（可复用） ====================

/**
 * 使用示例：
 * 
 * import { createPart1Article, part1Template } from './factories/readingFactory';
 * 
 * const article = createPart1Article({
 *   ...part1Template,
 *   id: 'p1-002',
 *   title: 'My School',
 *   questions: [...],
 * });
 */
export const part1Template: Omit<CreatePart1ArticleParams, 'questions'> = {
  id: 'p1-XXX',
  title: 'Template Title',
  titleZh: '模板标题',
  difficulty: 'easy',
  topic: '通用',
};

export const part2Template: Omit<CreatePart2ArticleParams, 'people' | 'infoPieces' | 'answers'> = {
  id: 'p2-XXX',
  title: 'Template Title',
  titleZh: '模板标题',
  difficulty: 'easy',
  topic: '通用',
};

export const part3ClozeTemplate: Omit<CreatePart3ClozeParams, 'passage' | 'passageFull' | 'blanks'> = {
  id: 'p3c-XXX',
  title: 'Template Title',
  titleZh: '模板标题',
  difficulty: 'easy',
  topic: '通用',
};

export const part3RCTemplate: Omit<CreatePart3RCParams, 'article' | 'articleZh' | 'questions'> = {
  id: 'p3r-XXX',
  title: 'Template Title',
  titleZh: '模板标题',
  difficulty: 'easy',
  topic: '通用',
};

export const part4TFTemplate: Omit<CreatePart4TFParams, 'article' | 'articleZh' | 'statements'> = {
  id: 'p4-XXX',
  title: 'Template Title',
  titleZh: '模板标题',
  difficulty: 'easy',
  topic: '通用',
};
