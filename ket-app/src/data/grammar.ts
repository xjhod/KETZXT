import type { GrammarPoint, GrammarFillQuestion, GrammarChoiceQuestion, GrammarCorrectionQuestion } from '../types';

export type { GrammarPoint, GrammarFillQuestion, GrammarChoiceQuestion, GrammarCorrectionQuestion };

// ========= G01: 一般现在时 =========
export const grammarG01: GrammarPoint = {
  id: 'G01',
  name: 'Present Simple',
  nameZh: '一般现在时',
  explanation: '一般现在时用来描述经常发生的动作、习惯、事实和固定安排。\n\n【结构】\n肯定句：I/You/We/They + 动词原形 | He/She/It + 动词三单形式\n否定句：don\'t / doesn\'t + 动词原形\n疑问句：Do/Does + 主语 + 动词原形？\n\n【三单变化规则】\n· 一般加 -s：work → works\n· 以 s/x/ch/sh/o 结尾加 -es：watch → watches\n· 以辅音+y结尾，变 y 为 i 加 -es：study → studies',
  examples: [
    { en: 'I drink coffee every morning.', zh: '我每天早上喝咖啡。' },
    { en: 'She works in a hospital.', zh: '她在医院工作。' },
    { en: 'Do you like pizza?', zh: '你喜欢披萨吗？' },
  ],
};

export const g01Fill: GrammarFillQuestion[] = [
  // --- 原有 10 题 ---
  { id: 'g01f01', grammarId: 'G01', sentence: 'She ____ (like) music.', options: ['like', 'likes', 'liking'], answer: 'likes', explanation: '第三人称单数，动词加 -s。' },
  { id: 'g01f02', grammarId: 'G01', sentence: 'I ____ (go) to school every day.', options: ['go', 'goes', 'going'], answer: 'go', explanation: 'I 后面用动词原形。' },
  { id: 'g01f03', grammarId: 'G01', sentence: 'My brother ____ (watch) TV after dinner.', options: ['watch', 'watches', 'watchs'], answer: 'watches', explanation: '第三人称单数，以 ch 结尾加 -es。' },
  { id: 'g01f04', grammarId: 'G01', sentence: 'We ____ (not / like) swimming.', options: ["don't like", "doesn't like", 'not like'], answer: "don't like", explanation: 'We 用 don\'t。' },
  { id: 'g01f05', grammarId: 'G01', sentence: '____ she speak English?', options: ['Do', 'Does', 'Is'], answer: 'Does', explanation: 'she 是第三人称单数，用 Does。' },
  { id: 'g01f06', grammarId: 'G01', sentence: 'The sun ____ (rise) in the east.', options: ['rise', 'rises', 'rising'], answer: 'rises', explanation: '客观事实，第三人称单数。' },
  { id: 'g01f07', grammarId: 'G01', sentence: 'They ____ (play) football on Sundays.', options: ['play', 'plays', 'playing'], answer: 'play', explanation: 'They 后面用动词原形。' },
  { id: 'g01f08', grammarId: 'G01', sentence: 'He ____ (study) very hard.', options: ['study', 'studies', 'studys'], answer: 'studies', explanation: '以辅音+y结尾，变 y 为 i 加 -es。' },
  { id: 'g01f09', grammarId: 'G01', sentence: '____ you drink tea?', options: ['Do', 'Does', 'Are'], answer: 'Do', explanation: 'you 用 Do 提问。' },
  { id: 'g01f10', grammarId: 'G01', sentence: 'My sister ____ (teach) maths.', options: ['teach', 'teaches', 'teachs'], answer: 'teaches', explanation: '第三人称单数，以 ch 结尾加 -es。' },
  // --- 新增 20 题（扩充到 30 道 Fill）---
  { id: 'g01f11', grammarId: 'G01', sentence: 'I ____ (like) apples.', options: ['like', 'likes', 'liking'], answer: 'like', explanation: 'I/You/We/They 后面用动词原形。' },
  { id: 'g01f12', grammarId: 'G01', sentence: 'He ____ (work) in a bank.', options: ['work', 'works', 'working'], answer: 'works', explanation: '第三人称单数，动词加 -s。' },
  { id: 'g01f13', grammarId: 'G01', sentence: 'My sister ____ (teach) English.', options: ['teach', 'teaches', 'teachs'], answer: 'teaches', explanation: '以 ch 结尾，加 -es。' },
  { id: 'g01f14', grammarId: 'G01', sentence: 'We ____ (not / play) tennis.', options: ["don't play", "doesn't play", 'not play'], answer: "don't play", explanation: 'We 用 don\'t + 动词原形。' },
  { id: 'g01f15', grammarId: 'G01', sentence: '____ she ____ (speak) French?', options: ['Do / speak', 'Does / speaks', 'Does / speak'], answer: 'Does / speak', explanation: 'she 用 Does，后面用动词原形。' },
  { id: 'g01f16', grammarId: 'G01', sentence: 'The earth ____ (go) around the sun.', options: ['go', 'goes', 'going'], answer: 'goes', explanation: '客观事实，第三人称单数。' },
  { id: 'g01f17', grammarId: 'G01', sentence: 'They ____ (not / be) late.', options: ["don't", "aren't", "doesn't be"], answer: "aren't", explanation: 'be 动词否定：aren\'t。' },
  { id: 'g01f18', grammarId: 'G01', sentence: 'My father ____ (have) a car.', options: ['have', 'has', 'haves'], answer: 'has', explanation: 'have 第三人称单数不规则变化 has。' },
  { id: 'g01f19', grammarId: 'G01', sentence: '____ you ____ (know) him?', options: ['Do / know', 'Does / knows', 'Are / know'], answer: 'Do / know', explanation: 'you 用 Do 提问。' },
  { id: 'g01f20', grammarId: 'G01', sentence: 'She ____ (not / do) her homework.', options: ["don't do", "doesn't do", 'not do'], answer: "doesn't do", explanation: 'she 用 doesn\'t + 动词原形。' },
  { id: 'g01f21', grammarId: 'G01', sentence: 'I usually ____ (get) up at 7.', options: ['get', 'gets', 'getting'], answer: 'get', explanation: 'I 后面用动词原形。' },
  { id: 'g01f22', grammarId: 'G01', sentence: 'Tom ____ (study) every night.', options: ['study', 'studies', 'studys'], answer: 'studies', explanation: '辅音+y结尾，变 y 为 i 加 -es。' },
  { id: 'g01f23', grammarId: 'G01', sentence: '____ your brother ____ (live) here?', options: ['Do / live', 'Does / live', 'Is / live'], answer: 'Does / live', explanation: 'your brother = he，用 Does。' },
  { id: 'g01f24', grammarId: 'G01', sentence: 'We ____ (not / be) friends.', options: ["don't", "aren't", "doesn't"], answer: "aren't", explanation: 'be 动词否定 are not = aren\'t。' },
  { id: 'g01f25', grammarId: 'G01', sentence: 'The shop ____ (open) at 9 am.', options: ['open', 'opens', 'openes'], answer: 'opens', explanation: 'the shop 第三人称单数。' },
  { id: 'g01f26', grammarId: 'G01', sentence: 'I ____ (not / speak) Japanese.', options: ["don't speak", "doesn't speak", 'not speak'], answer: "don't speak", explanation: 'I 用 don\'t + 动词原形。' },
  { id: 'g01f27', grammarId: 'G01', sentence: 'She ____ (wash) her hair every day.', options: ['wash', 'washes', 'washs'], answer: 'washes', explanation: '以 sh 结尾，加 -es。' },
  { id: 'g01f28', grammarId: 'G01', sentence: '____ the children ____ (go) to school?', options: ['Do / go', 'Does / go', 'Are / go'], answer: 'Do / go', explanation: 'children 复数，用 Do。' },
  { id: 'g01f29', grammarId: 'G01', sentence: 'He ____ (not / have) a bike.', options: ["don't have", "doesn't have", 'not have'], answer: "doesn't have", explanation: 'he 用 doesn\'t + have。' },
  { id: 'g01f30', grammarId: 'G01', sentence: 'Water ____ (boil) at 100°C.', options: ['boil', 'boils', 'boiling'], answer: 'boils', explanation: '客观事实，第三人称单数。' },
];

export const g01Choice: GrammarChoiceQuestion[] = [
  // --- 原有 5 题 ---
  { id: 'g01c01', grammarId: 'G01', question: 'Which sentence is correct?', options: ['He like cats.', 'He likes cats.', 'He liking cats.'], answer: 'He likes cats.', explanation: '第三人称单数，动词加 -s。' },
  { id: 'g01c02', grammarId: 'G01', question: 'Choose the correct negative:', options: ["She don't like coffee.", "She doesn't like coffee.", 'She not like coffee.'], answer: "She doesn't like coffee.", explanation: '否定用 doesn\'t + 动词原形。' },
  { id: 'g01c03', grammarId: 'G01', question: '— ____ you speak Chinese? — Yes, I do.', options: ['Do', 'Does', 'Are'], answer: 'Do', explanation: 'you 用 Do 提问。' },
  { id: 'g01c04', grammarId: 'G01', question: 'My father ____ in a bank.', options: ['work', 'works', 'working'], answer: 'works', explanation: 'My father = he，第三人称单数。' },
  { id: 'g01c05', grammarId: 'G01', question: 'We usually ____ basketball after school.', options: ['play', 'plays', 'are play'], answer: 'play', explanation: 'We 后面用动词原形。' },
  // --- 新增 5 题（扩充到 10 道 Choice）---
  { id: 'g01c06', grammarId: 'G01', question: 'Which sentence is correct?', options: ['He work in a shop.', 'He works in a shop.', 'He working in a shop.'], answer: 'He works in a shop.', explanation: '第三人称单数，动词加 -s。' },
  { id: 'g01c07', grammarId: 'G01', question: 'Choose the correct sentence:', options: ['Do you likes tea?', 'Do you like tea?', 'Does you like tea?'], answer: 'Do you like tea?', explanation: 'you 用动词原形 like。' },
  { id: 'g01c08', grammarId: 'G01', question: 'Which is correct?', options: ["She don't like music.", "She doesn't like music.", "She isn't like music."], answer: "She doesn't like music.", explanation: 'she 用 doesn\'t。' },
  { id: 'g01c09', grammarId: 'G01', question: 'Choose the correct question:', options: ['Does the sun rise in the east?', 'Do the sun rises in the east?', 'Does the sun rises in the east?'], answer: 'Does the sun rise in the east?', explanation: 'Does 后面用动词原形 rise。' },
  { id: 'g01c10', grammarId: 'G01', question: 'Which is correct?', options: ['My parents lives in Beijing.', 'My parents live in Beijing.', 'My parents livess in Beijing.'], answer: 'My parents live in Beijing.', explanation: 'parents 复数，动词用原形。' },
];

export const g01Correction: GrammarCorrectionQuestion[] = [
  // --- 原有 5 题 ---
  { id: 'g01x01', grammarId: 'G01', sentence: 'She like dancing.', answer: 'She likes dancing.', explanation: '第三人称单数，动词加 -s。' },
  { id: 'g01x02', grammarId: 'G01', sentence: "I doesn't like cats.", answer: "I don't like cats.", explanation: 'I 用 don\'t，不用 doesn\'t。' },
  { id: 'g01x03', grammarId: 'G01', sentence: 'Do she go to school by bus?', answer: 'Does she go to school by bus?', explanation: 'she 是第三人称单数，用 Does。' },
  { id: 'g01x04', grammarId: 'G01', sentence: 'My brother studys very hard.', answer: 'My brother studies very hard.', explanation: '辅音+y结尾，变 y 为 i 加 -es。' },
  { id: 'g01x05', grammarId: 'G01', sentence: "They doesn't play tennis.", answer: "They don't play tennis.", explanation: 'They 用 don\'t。' },
  // --- 新增 5 题（扩充到 10 道 Correction）---
  { id: 'g01x06', grammarId: 'G01', sentence: 'He work in a factory.', answer: 'He works in a factory.', explanation: '第三人称单数，动词加 -s。' },
  { id: 'g01x07', grammarId: 'G01', sentence: 'I is a student.', answer: 'I am a student.', explanation: 'I 搭配 am，不用 is。' },
  { id: 'g01x08', grammarId: 'G01', sentence: "She don't like cats.", answer: "She doesn't like cats.", explanation: 'she 用 doesn\'t，不用 don\'t。' },
  { id: 'g01x09', grammarId: 'G01', sentence: 'Do he speak English?', answer: 'Does he speak English?', explanation: 'he 用 Does 提问，后面用动词原形。' },
  { id: 'g01x10', grammarId: 'G01', sentence: "We doesn't have a car.", answer: "We don't have a car.", explanation: 'We 用 don\'t，不用 doesn\'t。' },
];


// ========= G02: 一般过去时 =========
export const grammarG02: GrammarPoint = {
  id: 'G02',
  name: 'Past Simple',
  nameZh: '一般过去时',
  explanation: '一般过去时用来描述过去某个时间发生的动作或存在的状态。\n\n【结构】\n肯定句：主语 + 动词过去式\n否定句：didn\'t + 动词原形\n疑问句：Did + 主语 + 动词原形？\n\n【规则动词过去式】直接加 -ed：work → worked\n【不规则动词】需要记忆：go → went, have → had, see → saw',
  examples: [
    { en: 'I watched a film last night.', zh: '我昨晚看了一部电影。' },
    { en: 'She didn\'t go to school yesterday.', zh: '她昨天没去上学。' },
    { en: 'Did you finish your homework?', zh: '你做完作业了吗？' },
  ],
};

export const g02Fill: GrammarFillQuestion[] = [
  // --- 原有 10 题 ---
  { id: 'g02f01', grammarId: 'G02', sentence: 'I ____ (go) to the park yesterday.', options: ['go', 'went', 'goed'], answer: 'went', explanation: 'go 的不规则过去式是 went。' },
  { id: 'g02f02', grammarId: 'G02', sentence: 'She ____ (not / eat) breakfast this morning.', options: ["didn't eat", "didn't ate", 'eat not'], answer: "didn't eat", explanation: '否定用 didn\'t + 动词原形。' },
  { id: 'g02f03', grammarId: 'G02', sentence: 'They ____ (watch) a match last night.', options: ['watch', 'watched', 'watchd'], answer: 'watched', explanation: '规则动词过去式加 -ed。' },
  { id: 'g02f04', grammarId: 'G02', sentence: '____ you ____ (see) the film?', options: ['Did / saw', 'Did / see', 'Do / saw'], answer: 'Did / see', explanation: '疑问句用 Did + 动词原形。' },
  { id: 'g02f05', grammarId: 'G02', sentence: 'He ____ (have) a cold last week.', options: ['have', 'had', 'has'], answer: 'had', explanation: 'have 的不规则过去式是 had。' },
  { id: 'g02f06', grammarId: 'G02', sentence: 'We ____ (be) at home yesterday.', options: ['was', 'were', 'are'], answer: 'were', explanation: 'We 用 were。' },
  { id: 'g02f07', grammarId: 'G02', sentence: 'She ____ (buy) a new dress.', options: ['buy', 'bought', 'buys'], answer: 'bought', explanation: 'buy 的不规则过去式是 bought。' },
  { id: 'g02f08', grammarId: 'G02', sentence: 'I ____ (not / know) his name.', options: ["didn't know", "didn't knew", 'know not'], answer: "didn't know", explanation: '否定用 didn\'t + 动词原形。' },
  { id: 'g02f09', grammarId: 'G02', sentence: '____ she ____ (come) to the party?', options: ['Did / came', 'Did / come', 'Was / come'], answer: 'Did / come', explanation: '疑问句用 Did + 动词原形。' },
  { id: 'g02f10', grammarId: 'G02', sentence: 'The film ____ (start) at 8 o\'clock.', options: ['start', 'started', 'startted'], answer: 'started', explanation: '规则动词过去式加 -ed。' },
  // --- 新增 20 题（扩充到 30 道 Fill）---
  { id: 'g02f11', grammarId: 'G02', sentence: 'I ____ (visit) my grandma last Sunday.', options: ['visit', 'visited', 'visitted'], answer: 'visited', explanation: '规则动词过去式加 -ed。' },
  { id: 'g02f12', grammarId: 'G02', sentence: 'He ____ (not / see) the email.', options: ["didn't see", "didn't saw", 'saw not'], answer: "didn't see", explanation: '否定用 didn\'t + 动词原形。' },
  { id: 'g02f13', grammarId: 'G02', sentence: 'We ____ (be) at the cinema yesterday.', options: ['was', 'were', 'are'], answer: 'were', explanation: 'We 搭配 were。' },
  { id: 'g02f14', grammarId: 'G02', sentence: 'She ____ (do) her homework after dinner.', options: ['do', 'did', 'done'], answer: 'did', explanation: 'do 的不规则过去式是 did。' },
  { id: 'g02f15', grammarId: 'G02', sentence: '____ you ____ (go) to Beijing last year?', options: ['Did / go', 'Did / went', 'Do / go'], answer: 'Did / go', explanation: '疑问句用 Did + 动词原形。' },
  { id: 'g02f16', grammarId: 'G02', sentence: 'The train ____ (arrive) late.', options: ['arrive', 'arrived', 'arriveed'], answer: 'arrived', explanation: '规则动词过去式加 -ed。' },
  { id: 'g02f17', grammarId: 'G02', sentence: 'I ____ (not / have) breakfast this morning.', options: ["didn't have", "didn't had", 'had not'], answer: "didn't have", explanation: '否定用 didn\'t + 动词原形。' },
  { id: 'g02f18', grammarId: 'G02', sentence: 'They ____ (play) football yesterday.', options: ['play', 'played', 'playd'], answer: 'played', explanation: '规则动词过去式加 -ed。' },
  { id: 'g02f19', grammarId: 'G02', sentence: 'He ____ (write) a letter to his friend.', options: ['write', 'wrote', 'writed'], answer: 'wrote', explanation: 'write 的不规则过去式是 wrote。' },
  { id: 'g02f20', grammarId: 'G02', sentence: '____ she ____ (know) the answer?', options: ['Did / knew', 'Did / know', 'Was / know'], answer: 'Did / know', explanation: '疑问句用 Did + 动词原形。' },
  { id: 'g02f21', grammarId: 'G02', sentence: 'We ____ (not / go) to the party.', options: ["didn't go", "didn't went", 'went not'], answer: "didn't go", explanation: '否定用 didn\'t + 动词原形。' },
  { id: 'g02f22', grammarId: 'G02', sentence: 'I ____ (read) a book last night.', options: ['read', 'readed', 'red'], answer: 'read', explanation: 'read 的过去式拼写不变，但发音变为 /red/。' },
  { id: 'g02f23', grammarId: 'G02', sentence: 'She ____ (be) at home yesterday.', options: ['was', 'were', 'is'], answer: 'was', explanation: 'She 搭配 was。' },
  { id: 'g02f24', grammarId: 'G02', sentence: 'They ____ (not / finish) the work.', options: ["didn't finish", "didn't finished", 'finish not'], answer: "didn't finish", explanation: '否定用 didn\'t + 动词原形。' },
  { id: 'g02f25', grammarId: 'G02', sentence: 'He ____ (give) me a present.', options: ['give', 'gave', 'gived'], answer: 'gave', explanation: 'give 的不规则过去式是 gave。' },
  { id: 'g02f26', grammarId: 'G02', sentence: '____ you ____ (have) a good time?', options: ['Did / had', 'Did / have', 'Do / have'], answer: 'Did / have', explanation: '疑问句用 Did + 动词原形。' },
  { id: 'g02f27', grammarId: 'G02', sentence: 'The meeting ____ (start) at 9 am.', options: ['start', 'started', 'startted'], answer: 'started', explanation: '规则动词过去式加 -ed。' },
  { id: 'g02f28', grammarId: 'G02', sentence: 'I ____ (not / be) at school yesterday.', options: ["wasn't", "weren't", "didn't be"], answer: "wasn't", explanation: 'be 动词过去式否定：was not = wasn\'t。' },
  { id: 'g02f29', grammarId: 'G02', sentence: 'We ____ (see) an interesting film.', options: ['see', 'saw', 'seen'], answer: 'saw', explanation: 'see 的不规则过去式是 saw。' },
  { id: 'g02f30', grammarId: 'G02', sentence: 'She ____ (not / come) to the meeting.', options: ["didn't come", "didn't came", 'came not'], answer: "didn't come", explanation: '否定用 didn\'t + 动词原形。' },
];

export const g02Choice: GrammarChoiceQuestion[] = [
  // --- 原有 5 题 ---
  { id: 'g02c01', grammarId: 'G02', question: 'Which sentence is correct?', options: ['I go to Beijing last year.', 'I went to Beijing last year.', 'I goed to Beijing last year.'], answer: 'I went to Beijing last year.', explanation: 'go 的不规则过去式是 went。' },
  { id: 'g02c02', grammarId: 'G02', question: 'Choose the correct sentence:', options: ["She didn't went to school.", "She didn't go to school.", 'She not went to school.'], answer: "She didn't go to school.", explanation: '否定用 didn\'t + 动词原形。' },
  { id: 'g02c03', grammarId: 'G02', question: 'I ____ TV when he called.', options: ['watch', 'watched', 'watching'], answer: 'watched', explanation: '描述过去动作，用过去式。' },
  { id: 'g02c04', grammarId: 'G02', question: 'We ____ in a small house ten years ago.', options: ['live', 'lived', 'lives'], answer: 'lived', explanation: 'ten years ago 用过去式。' },
  { id: 'g02c05', grammarId: 'G02', question: '— ____ you see the email? — Yes, I did.', options: ['Do', 'Did', 'Were'], answer: 'Did', explanation: '过去时疑问句用 Did。' },
  // --- 新增 5 题（扩充到 10 道 Choice）---
  { id: 'g02c06', grammarId: 'G02', question: 'Which is correct?', options: ['He come to school yesterday.', 'He came to school yesterday.', 'He comed to school yesterday.'], answer: 'He came to school yesterday.', explanation: 'come 的不规则过去式是 came。' },
  { id: 'g02c07', grammarId: 'G02', question: 'Choose the correct negative:', options: ["I didn't knew him.", "I didn't know him.", 'I not knew him.'], answer: "I didn't know him.", explanation: 'didn\'t 后面用动词原形 know。' },
  { id: 'g02c08', grammarId: 'G02', question: 'We ____ a great time last summer.', options: ['have', 'had', 'has'], answer: 'had', explanation: 'have 的不规则过去式是 had。' },
  { id: 'g02c09', grammarId: 'G02', question: 'Which question is correct?', options: ['Did she went home?', 'Did she go home?', 'Was she go home?'], answer: 'Did she go home?', explanation: 'Did 后面用动词原形 go。' },
  { id: 'g02c10', grammarId: 'G02', question: 'I ____ a letter from my friend.', options: ['receive', 'received', 'receved'], answer: 'received', explanation: '规则动词过去式加 -ed。' },
];

export const g02Correction: GrammarCorrectionQuestion[] = [
  // --- 原有 5 题 ---
  { id: 'g02x01', grammarId: 'G02', sentence: 'I goed to the zoo last Sunday.', answer: 'I went to the zoo last Sunday.', explanation: 'go 的不规则过去式是 went，不是 goed。' },
  { id: 'g02x02', grammarId: 'G02', sentence: "She didn't came to the party.", answer: "She didn't come to the party.", explanation: 'didn\'t 后面用动词原形 come。' },
  { id: 'g02x03', grammarId: 'G02', sentence: 'Did you saw him yesterday?', answer: 'Did you see him yesterday?', explanation: 'Did 后面用动词原形 see。' },
  { id: 'g02x04', grammarId: 'G02', sentence: 'He buyed a new phone.', answer: 'He bought a new phone.', explanation: 'buy 的不规则过去式是 bought。' },
  { id: 'g02x05', grammarId: 'G02', sentence: 'We was at the cinema yesterday.', answer: 'We were at the cinema yesterday.', explanation: 'We 搭配 were，不用 was。' },
  // --- 新增 5 题（扩充到 10 道 Correction）---
  { id: 'g02x06', grammarId: 'G02', sentence: 'She don\'t like the film.', answer: 'She didn\'t like the film.', explanation: '过去时否定用 didn\'t，不用 don\'t。' },
  { id: 'g02x07', grammarId: 'G02', sentence: 'I didn\'t went to the park.', answer: 'I didn\'t go to the park.', explanation: 'didn\'t 后面用动词原形 go。' },
  { id: 'g02x08', grammarId: 'G02', sentence: 'He runned to school yesterday.', answer: 'He ran to school yesterday.', explanation: 'run 的不规则过去式是 ran。' },
  { id: 'g02x09', grammarId: 'G02', sentence: 'Did she bought a new dress?', answer: 'Did she buy a new dress?', explanation: 'Did 后面用动词原形 buy。' },
  { id: 'g02x10', grammarId: 'G02', sentence: 'They was very happy.', answer: 'They were very happy.', explanation: 'They 搭配 were，不用 was。' },
];


// ========= G03: 现在进行时 =========
export const grammarG03: GrammarPoint = {
  id: 'G03',
  name: 'Present Continuous',
  nameZh: '现在进行时',
  explanation: '现在进行时用来描述此刻正在进行的动作，或现阶段正在进行的动作。\n\n【结构】am/is/are + 动词-ing\n\n【现在分词 -ing 构成规则】\n· 一般加 -ing：go → going\n· 以不发音 e 结尾，去 e 加 -ing：make → making\n· 以重读闭音节结尾，双写末尾辅音加 -ing：run → running',
  examples: [
    { en: 'Look! It is raining.', zh: '看！正在下雨。' },
    { en: 'I am reading a book right now.', zh: '我现在正在读一本书。' },
    { en: 'They are playing football at the moment.', zh: '他们此刻正在踢足球。' },
  ],
};

export const g03Fill: GrammarFillQuestion[] = [
  // --- 原有 10 题 ---
  { id: 'g03f01', grammarId: 'G03', sentence: 'Look! She ____ (dance).', options: ['is dancing', 'dances', 'dance'], answer: 'is dancing', explanation: 'Look! 提示此刻正在进行的动作。' },
  { id: 'g03f02', grammarId: 'G03', sentence: 'I ____ (not / sleep) now.', options: ['am not sleeping', "don't sleeping", "isn't sleeping"], answer: 'am not sleeping', explanation: '否定：am not + -ing。' },
  { id: 'g03f03', grammarId: 'G03', sentence: 'They ____ (play) football in the garden.', options: ['play', 'are playing', 'plays'], answer: 'are playing', explanation: '此刻正在进行的动作。' },
  { id: 'g03f04', grammarId: 'G03', sentence: '____ he ____ (work) today?', options: ['Is / working', 'Does / working', 'Is / work'], answer: 'Is / working', explanation: '疑问句：Is + 主语 + -ing？' },
  { id: 'g03f05', grammarId: 'G03', sentence: 'Listen! Someone ____ (sing).', options: ['sings', 'is singing', 'sing'], answer: 'is singing', explanation: 'Listen! 提示此刻正在进行的动作。' },
  { id: 'g03f06', grammarId: 'G03', sentence: 'We ____ (make) a cake for her birthday.', options: ['are making', 'are makeing', 'make'], answer: 'are making', explanation: 'make 去 e 加 -ing。' },
  { id: 'g03f07', grammarId: 'G03', sentence: 'The baby ____ (sleep) at the moment.', options: ['is sleeping', 'sleeps', 'sleep'], answer: 'is sleeping', explanation: 'at the moment 提示此刻正在进行。' },
  { id: 'g03f08', grammarId: 'G03', sentence: 'You ____ (run) too fast!', options: ['are running', 'run', 'runs'], answer: 'are running', explanation: '此刻正在进行的动作。' },
  { id: 'g03f09', grammarId: 'G03', sentence: '____ they ____ (come) to the party?', options: ['Are / coming', 'Do / coming', 'Are / come'], answer: 'Are / coming', explanation: '疑问句：Are + 主语 + -ing？' },
  { id: 'g03f10', grammarId: 'G03', sentence: 'She ____ (not / work) today.', options: ["isn't working", "doesn't working", "not working"], answer: "isn't working", explanation: '否定：isn\'t + -ing。' },
  // --- 新增 20 题（扩充到 30 道 Fill）---
  { id: 'g03f11', grammarId: 'G03', sentence: 'Look! The bus ____ (come).', options: ['comes', 'is coming', 'come'], answer: 'is coming', explanation: 'Look! 提示此刻正在进行的动作。' },
  { id: 'g03f12', grammarId: 'G03', sentence: 'I ____ (eat) dinner right now.', options: ['eat', 'am eating', 'eats'], answer: 'am eating', explanation: 'right now 提示此刻正在进行的动作。' },
  { id: 'g03f13', grammarId: 'G03', sentence: 'They ____ (not / watch) TV.', options: ["aren't watching", "don't watching", "not watching"], answer: "aren't watching", explanation: '否定：aren\'t + -ing。' },
  { id: 'g03f14', grammarId: 'G03', sentence: '____ she ____ (listen) to music?', options: ['Does / listening', 'Is / listening', 'Is / listen'], answer: 'Is / listening', explanation: '疑问句：Is + 主语 + -ing？' },
  { id: 'g03f15', grammarId: 'G03', sentence: 'The children ____ (play) in the park.', options: ['play', 'are playing', 'plays'], answer: 'are playing', explanation: '此刻正在进行的动作。' },
  { id: 'g03f16', grammarId: 'G03', sentence: 'We ____ (not / go) to school today.', options: ["aren't going", "don't going", "not going"], answer: "aren't going", explanation: '否定：aren\'t + -ing。' },
  { id: 'g03f17', grammarId: 'G03', sentence: 'He ____ (write) a letter.', options: ['writes', 'is writing', 'write'], answer: 'is writing', explanation: '此刻正在进行的动作。' },
  { id: 'g03f18', grammarId: 'G03', sentence: '____ you ____ (wait) for me?', options: ['Do / waiting', 'Are / waiting', 'Are / wait'], answer: 'Are / waiting', explanation: '疑问句：Are + 主语 + -ing？' },
  { id: 'g03f19', grammarId: 'G03', sentence: 'It ____ (rain) outside.', options: ['rains', 'is raining', 'rain'], answer: 'is raining', explanation: '此刻正在进行的动作。' },
  { id: 'g03f20', grammarId: 'G03', sentence: 'The bird ____ (sing) in the tree.', options: ['sings', 'is singing', 'sing'], answer: 'is singing', explanation: '此刻正在进行的动作。' },
  { id: 'g03f21', grammarId: 'G03', sentence: 'I ____ (read) a newspaper.', options: ['read', 'am reading', 'reads'], answer: 'am reading', explanation: '此刻正在进行的动作。' },
  { id: 'g03f22', grammarId: 'G03', sentence: 'She ____ (not / like) the food.', options: ["doesn't like", "isn't liking", "not liking"], answer: "doesn't like", explanation: 'like 是状态动词，不用进行时。用一般现在时。' },
  { id: 'g03f23', grammarId: 'G03', sentence: '____ they ____ (study) now?', options: ['Do / study', 'Are / studying', 'Are / study'], answer: 'Are / studying', explanation: '疑问句：Are + 主语 + -ing？' },
  { id: 'g03f24', grammarId: 'G03', sentence: 'My dad ____ (cook) dinner.', options: ['cooks', 'is cooking', 'cook'], answer: 'is cooking', explanation: '此刻正在进行的动作。' },
  { id: 'g03f25', grammarId: 'G03', sentence: 'We ____ (have) a meeting.', options: ['have', 'are having', 'has'], answer: 'are having', explanation: 'have 去 e 加 -ing = having。' },
  { id: 'g03f26', grammarId: 'G03', sentence: 'The students ____ (take) an exam.', options: ['take', 'are taking', 'takes'], answer: 'are taking', explanation: '此刻正在进行的动作。' },
  { id: 'g03f27', grammarId: 'G03', sentence: 'I ____ (not / understand).', options: ["am not understanding", "don't understand", "not understand"], answer: "don't understand", explanation: 'understand 是状态动词，不用进行时。用一般现在时。' },
  { id: 'g03f28', grammarId: 'G03', sentence: 'Look! She ____ (smile).', options: ['smiles', 'is smiling', 'smile'], answer: 'is smiling', explanation: 'Look! 提示此刻正在进行的动作。' },
  { id: 'g03f29', grammarId: 'G03', sentence: 'They ____ (build) a new house.', options: ['build', 'are building', 'builds'], answer: 'are building', explanation: '此刻正在进行的动作。' },
  { id: 'g03f30', grammarId: 'G03', sentence: 'It ____ (snow) in winter.', options: ['snows', 'is snowing', 'snow'], answer: 'snows', explanation: 'in winter 表示经常性、习惯性事实，用一般现在时 snows。' },
];

export const g03Choice: GrammarChoiceQuestion[] = [
  // --- 原有 5 题 ---
  { id: 'g03c01', grammarId: 'G03', question: 'Which sentence is correct?', options: ['I am read a book.', 'I am reading a book.', 'I reading a book.'], answer: 'I am reading a book.', explanation: '现在进行时：am + reading。' },
  { id: 'g03c02', grammarId: 'G03', question: 'Look at the picture! He ____.', options: ['swims', 'is swimming', 'swim'], answer: 'is swimming', explanation: 'Look! 提示此刻正在进行的动作。' },
  { id: 'g03c03', grammarId: 'G03', question: 'Choose the correct negative:', options: ["They aren't dancing.", "They don't dancing.", "They not are dancing."], answer: "They aren't dancing.", explanation: '否定：aren\'t + -ing。' },
  { id: 'g03c04', grammarId: 'G03', question: '— ____ you ____? — Yes, I am.', options: ['Do / cry', 'Are / crying', 'Is / crying'], answer: 'Are / crying', explanation: '疑问句：Are + 主语 + -ing？' },
  { id: 'g03c05', grammarId: 'G03', question: 'She ____ dinner in the kitchen now.', options: ['cooks', 'is cooking', 'cook'], answer: 'is cooking', explanation: 'now 提示此刻正在进行的动作。' },
  // --- 新增 5 题（扩充到 10 道 Choice）---
  { id: 'g03c06', grammarId: 'G03', question: 'Which is correct?', options: ['I am go to school.', 'I am going to school.', 'I going to school.'], answer: 'I am going to school.', explanation: '现在进行时：am + going。' },
  { id: 'g03c07', grammarId: 'G03', question: 'Listen! She ____ a song.', options: ['sings', 'is singing', 'sing'], answer: 'is singing', explanation: 'Listen! 提示此刻正在进行的动作。' },
  { id: 'g03c08', grammarId: 'G03', question: 'Choose the correct sentence:', options: ["He isn't work.", "He isn't working.", "He don't work."], answer: "He isn't working.", explanation: '否定：isn\'t + -ing。' },
  { id: 'g03c09', grammarId: 'G03', question: '— What ____ you ____? — I am writing.', options: ['do / do', 'are / doing', 'are / do'], answer: 'are / doing', explanation: '疑问句：are + 主语 + -ing？' },
  { id: 'g03c10', grammarId: 'G03', question: 'The children ____ in the garden.', options: ['plays', 'are playing', 'play'], answer: 'are playing', explanation: '此刻正在进行的动作。' },
];

export const g03Correction: GrammarCorrectionQuestion[] = [
  // --- 原有 5 题 ---
  { id: 'g03x01', grammarId: 'G03', sentence: 'Look! It snows.', answer: 'Look! It is snowing.', explanation: 'Look! 提示用现在进行时；snow 加 -ing 要双写 w 吗？不，直接 snowing（但正确拼写是 snowing，不是 snowwing）。实际上 snow → snowing（直接加 -ing）。' },
  { id: 'g03x02', grammarId: 'G03', sentence: 'I am not understand.', answer: 'I don\'t understand.', explanation: 'understand 是状态动词，不用进行时。应该用一般现在时。' },
  { id: 'g03x03', grammarId: 'G03', sentence: 'Are you knowing the answer?', answer: 'Do you know the answer?', explanation: 'know 是状态动词，不用进行时。' },
  { id: 'g03x04', grammarId: 'G03', sentence: 'He is makeing a cake.', answer: 'He is making a cake.', explanation: 'make 去 e 加 -ing = making。' },
  { id: 'g03x05', grammarId: 'G03', sentence: 'They are runing in the park.', answer: 'They are running in the park.', explanation: 'run 双写末尾辅音 n 加 -ing = running。' },
  // --- 新增 5 题（扩充到 10 道 Correction）---
  { id: 'g03x06', grammarId: 'G03', sentence: 'She is danceing.', answer: 'She is dancing.', explanation: 'dance 去 e 加 -ing = dancing。' },
  { id: 'g03x07', grammarId: 'G03', sentence: 'I am knowing him.', answer: 'I know him.', explanation: 'know 是状态动词，不用进行时。' },
  { id: 'g03x08', grammarId: 'G03', sentence: 'Are you believing me?', answer: 'Do you believe me?', explanation: 'believe 是状态动词，不用进行时。' },
  { id: 'g03x09', grammarId: 'G03', sentence: 'He is writeing a letter.', answer: 'He is writing a letter.', explanation: 'write 去 e 加 -ing = writing。' },
  { id: 'g03x10', grammarId: 'G03', sentence: "They are swiming in the pool.", answer: 'They are swimming in the pool.', explanation: 'swim 双写末尾辅音 m 加 -ing = swimming。' },
];


// ========= G04: be going to 将来时 =========
export const grammarG04: GrammarPoint = {
  id: 'G04',
  name: 'be going to (Future)',
  nameZh: 'be going to 将来时',
  explanation: 'be going to 用来描述将来打算做的事情或即将发生的事。\n\n【结构】\n肯定句：主语 + am/is/are going to + 动词原形\n否定句：主语 + am/is/are not going to + 动词原形\n疑问句：Am/Is/Are + 主语 + going to + 动词原形？\n\n【用法】\n· 打算、计划：I am going to visit my grandma.\n· 即将发生：Look at the clouds! It is going to rain.',
  examples: [
    { en: 'I am going to buy a new phone.', zh: '我打算买个新手机。' },
    { en: 'She is not going to come.', zh: '她不打算来。' },
    { en: 'Are you going to play tennis?', zh: '你打算打网球吗？' },
  ],
};

export const g04Fill: GrammarFillQuestion[] = [
  { id: 'g04f01', grammarId: 'G04', sentence: 'I ____ (go) to Beijing tomorrow.', options: ['am going to go', 'go', 'goes'], answer: 'am going to go', explanation: 'tomorrow 提示将来，用 be going to。' },
  { id: 'g04f02', grammarId: 'G04', sentence: 'She ____ (not / come) to the party.', options: ["isn't going to come", "don't come", "didn't come"], answer: "isn't going to come", explanation: '否定：be not going to + 动词原形。' },
  { id: 'g04f03', grammarId: 'G04', sentence: '____ you ____ (visit) your grandma?', options: ['Are / going to visit', 'Do / visit', 'Did / visit'], answer: 'Are / going to visit', explanation: '疑问句：Are + 主语 + going to + 动词原形？' },
  { id: 'g04f04', grammarId: 'G04', sentence: 'Look at the clouds! It ____ (rain).', options: ['is going to rain', 'rains', 'rained'], answer: 'is going to rain', explanation: '根据迹象判断即将发生，用 be going to。' },
  { id: 'g04f05', grammarId: 'G04', sentence: 'We ____ (have) a meeting next week.', options: ['are going to have', 'have', 'had'], answer: 'are going to have', explanation: 'next week 提示将来。' },
  { id: 'g04f06', grammarId: 'G04', sentence: 'He ____ (not / buy) a new car.', options: ["isn't going to buy", "doesn't buy", "didn't buy"], answer: "isn't going to buy", explanation: '否定：be not going to + 动词原形。' },
  { id: 'g04f07', grammarId: 'G04', sentence: '____ she ____ (be) at home tomorrow?', options: ['Is / going to be', 'Does / be', 'Was / be'], answer: 'Is / going to be', explanation: '疑问句：Is + 主语 + going to + 动词原形？' },
  { id: 'g04f08', grammarId: 'G04', sentence: 'I think I ____ (be) sick.', options: ['am going to be', 'am', 'was'], answer: 'am going to be', explanation: '根据感觉判断即将发生。' },
  { id: 'g04f09', grammarId: 'G04', sentence: 'They ____ (not / play) football.', options: ["aren't going to play", "don't play", "didn't play"], answer: "aren't going to play", explanation: '否定：be not going to + 动词原形。' },
  { id: 'g04f10', grammarId: 'G04', sentence: 'My sister ____ (get) married next month.', options: ['is going to get', 'gets', 'got'], answer: 'is going to get', explanation: 'next month 提示将来。' },
  { id: 'g04f11', grammarId: 'G04', sentence: 'I ____ (call) you later.', options: ['am going to call', 'call', 'called'], answer: 'am going to call', explanation: 'later 提示将来。' },
  { id: 'g04f12', grammarId: 'G04', sentence: 'It ____ (be) a sunny day.', options: ['is going to be', 'is', 'was'], answer: 'is going to be', explanation: '预测将来。' },
  { id: 'g04f13', grammarId: 'G04', sentence: 'We ____ (not / go) to school tomorrow.', options: ["aren't going to go", "don't go", "didn't go"], answer: "aren't going to go", explanation: 'tomorrow 提示将来。' },
  { id: 'g04f14', grammarId: 'G04', sentence: '____ he ____ (win) the game?', options: ['Is / going to win', 'Does / win', 'Did / win'], answer: 'Is / going to win', explanation: '预测他将赢得比赛。' },
  { id: 'g04f15', grammarId: 'G04', sentence: 'She ____ (be) a doctor.', options: ['is going to be', 'is', 'was'], answer: 'is going to be', explanation: '打算成为医生。' },
  { id: 'g04f16', grammarId: 'G04', sentence: 'I ____ (buy) a present for her.', options: ['am going to buy', 'buy', 'bought'], answer: 'am going to buy', explanation: '打算买礼物。' },
  { id: 'g04f17', grammarId: 'G04', sentence: 'They ____ (not / come) to the party.', options: ["aren't going to come", "don't come", "didn't come"], answer: "aren't going to come", explanation: '不打算来。' },
  { id: 'g04f18', grammarId: 'G04', sentence: 'Look! The bus ____ (leave).', options: ['is going to leave', 'leaves', 'left'], answer: 'is going to leave', explanation: '根据迹象判断即将发生。' },
  { id: 'g04f19', grammarId: 'G04', sentence: 'We ____ (have) dinner at 7.', options: ['are going to have', 'have', 'had'], answer: 'are going to have', explanation: '计划好的安排。' },
  { id: 'g04f20', grammarId: 'G04', sentence: 'He ____ (not / be) at home.', options: ["isn't going to be", "isn't", "wasn't"], answer: "isn't going to be", explanation: '不打算在家。' },
  { id: 'g04f21', grammarId: 'G04', sentence: 'I ____ (learn) to drive.', options: ['am going to learn', 'learn', 'learned'], answer: 'am going to learn', explanation: '打算学开车。' },
  { id: 'g04f22', grammarId: 'G04', sentence: 'She ____ (travel) to Japan.', options: ['is going to travel', 'travels', 'traveled'], answer: 'is going to travel', explanation: '计划去日本旅行。' },
  { id: 'g04f23', grammarId: 'G04', sentence: '____ you ____ (help) me?', options: ['Are / going to help', 'Do / help', 'Did / help'], answer: 'Are / going to help', explanation: '询问打算是否帮忙。' },
  { id: 'g04f24', grammarId: 'G04', sentence: 'It ____ (snow) tonight.', options: ['is going to snow', 'snows', 'snowed'], answer: 'is going to snow', explanation: '天气预报预测。' },
  { id: 'g04f25', grammarId: 'G04', sentence: 'We ____ (move) to a new house.', options: ['are going to move', 'move', 'moved'], answer: 'are going to move', explanation: '打算搬新家。' },
  { id: 'g04f26', grammarId: 'G04', sentence: 'My dad ____ (not / retire) yet.', options: ["isn't going to retire", "doesn't retire", "didn't retire"], answer: "isn't going to retire", explanation: '不打算退休。' },
  { id: 'g04f27', grammarId: 'G04', sentence: 'I ____ (be) 20 next year.', options: ['am going to be', 'am', 'was'], answer: 'am going to be', explanation: '明年将满20岁。' },
  { id: 'g04f28', grammarId: 'G04', sentence: 'They ____ (build) a new school.', options: ['are going to build', 'build', 'built'], answer: 'are going to build', explanation: '计划建新学校。' },
  { id: 'g04f29', grammarId: 'G04', sentence: '____ she ____ (marry) him?', options: ['Is / going to marry', 'Does / marry', 'Did / marry'], answer: 'Is / going to marry', explanation: '询问是否打算结婚。' },
  { id: 'g04f30', grammarId: 'G04', sentence: 'The movie ____ (start) at 8.', options: ['is going to start', 'starts', 'started'], answer: 'is going to start', explanation: '电影即将开始。' },
];

export const g04Choice: GrammarChoiceQuestion[] = [
  { id: 'g04c01', grammarId: 'G04', question: 'Which sentence is correct?', options: ['I going to go home.', 'I am going to go home.', 'I go to go home.'], answer: 'I am going to go home.', explanation: 'be going to 结构：be + going to + 动词原形。' },
  { id: 'g04c02', grammarId: 'G04', question: 'Choose the correct negative:', options: ["I am not going to come.", "I don't going to come.", "I am not going come."], answer: "I am not going to come.", explanation: '否定：be not going to + 动词原形。' },
  { id: 'g04c03', grammarId: 'G04', question: 'Which shows future plan?', options: ['I go to school every day.', 'I am going to visit Paris.', 'I visited Paris.'], answer: 'I am going to visit Paris.', explanation: 'be going to 表示计划或打算。' },
  { id: 'g04c04', grammarId: 'G04', question: '— ____ you ____ to the party? — Yes, I am.', options: ['Do / go', 'Are / going', 'Did / go'], answer: 'Are / going', explanation: '疑问句：Are + 主语 + going to...?' },
  { id: 'g04c05', grammarId: 'G04', question: 'Look at the clouds! It ____ rain.', options: ['is going to', 'will', 'is'], answer: 'is going to', explanation: '根据迹象判断即将发生，用 be going to。' },
  { id: 'g04c06', grammarId: 'G04', question: 'Which is correct?', options: ["She isn't going to come.", "She don't going to come.", "She didn't going to come."], answer: "She isn't going to come.", explanation: '否定：be not going to + 动词原形。' },
  { id: 'g04c07', grammarId: 'G04', question: 'I ____ buy a new phone.', options: ['am going to', 'am go to', 'am going'], answer: 'am going to', explanation: 'be going to + 动词原形。' },
  { id: 'g04c08', grammarId: 'G04', question: 'We ____ have a test tomorrow.', options: ['are going to', 'are go to', 'are going'], answer: 'are going to', explanation: 'tomorrow 提示将来。' },
  { id: 'g04c09', grammarId: 'G04', question: 'Which is a prediction?', options: ['I am going to eat now.', 'It is going to rain.', 'I eat every day.'], answer: 'It is going to rain.', explanation: '根据迹象做出的预测。' },
  { id: 'g04c10', grammarId: 'G04', question: 'They ____ moving to a new house.', options: ['are going to', 'are go to', 'are going'], answer: 'are going to', explanation: 'be going to + 动词原形 move。' },
];

export const g04Correction: GrammarCorrectionQuestion[] = [
  { id: 'g04x01', grammarId: 'G04', sentence: 'I am go to call you.', answer: 'I am going to call you.', explanation: 'be going to 结构，不是 be go to。' },
  { id: 'g04x02', grammarId: 'G04', sentence: "I don't going to come.", answer: "I am not going to come.", explanation: '否定用 be not going to，不用 don\'t。' },
  { id: 'g04x03', grammarId: 'G04', sentence: 'Are you going come?', answer: 'Are you going to come?', explanation: '缺少 to，应该是 going to + 动词原形。' },
  { id: 'g04x04', grammarId: 'G04', sentence: 'She is going to goes home.', answer: 'She is going to go home.', explanation: 'going to 后面用动词原形，不用 goes。' },
  { id: 'g04x05', grammarId: 'G04', sentence: "He isn't going to comes.", answer: "He isn't going to come.", explanation: 'going to 后面用动词原形，不用 comes。' },
  { id: 'g04x06', grammarId: 'G04', sentence: 'We are go to be late.', answer: 'We are going to be late.', explanation: 'be going to 结构，不是 be go to。' },
  { id: 'g04x07', grammarId: 'G04', sentence: 'I am going to buying a car.', answer: 'I am going to buy a car.', explanation: 'going to 后面用动词原形，不用 -ing。' },
  { id: 'g04x08', grammarId: 'G04', sentence: "Did you going to help?", answer: 'Are you going to help?', explanation: '疑问句用 Are + 主语 + going to...?，不用 Did。' },
  { id: 'g04x09', grammarId: 'G04', sentence: 'They going to play football.', answer: 'They are going to play football.', explanation: '缺少 be 动词 are。' },
  { id: 'g04x10', grammarId: 'G04', sentence: "She don't going to come.", answer: "She isn't going to come.", explanation: '否定用 be not going to，不用 don\'t。' },
];


// ========= G05: 现在完成时 =========
export const grammarG05: GrammarPoint = {
  id: 'G05',
  name: 'Present Perfect',
  nameZh: '现在完成时',
  explanation: '现在完成时用来描述过去发生但与现在有联系的动作，或持续到现在的状态。\n\n【结构】have/has + 过去分词\n\n【用法】\n· 经历：I have been to Beijing twice.\n· 已完成但对现在有影响的动作：I have lost my keys.\n· 持续状态：She has lived here for 10 years.\n\n【不规则过去分词】go → gone, see → seen, do → done',
  examples: [
    { en: 'I have finished my homework.', zh: '我已经做完作业了。' },
    { en: 'She has never eaten sushi.', zh: '她从没吃过寿司。' },
    { en: 'Have you seen the email?', zh: '你看到邮件了吗？' },
  ],
};

export const g05Fill: GrammarFillQuestion[] = [
  { id: 'g05f01', grammarId: 'G05', sentence: 'I ____ (finish) my homework.', options: ['finished', 'have finished', 'had finished'], answer: 'have finished', explanation: '现在完成时表示已完成的动作，对现在有影响。' },
  { id: 'g05f02', grammarId: 'G05', sentence: 'She ____ (never / eat) sushi.', options: ["has never eaten", "never ate", "never eat"], answer: "has never eaten", explanation: 'never 常与现在完成时连用。' },
  { id: 'g05f03', grammarId: 'G05', sentence: '____ you ____ (see) the film?', options: ['Have / seen', 'Did / see', 'Do / see'], answer: 'Have / seen', explanation: '疑问句用 Have/Has + 主语 + 过去分词？' },
  { id: 'g05f04', grammarId: 'G05', sentence: 'We ____ (not / go) to Beijing.', options: ["haven't gone", "didn't go", "don't go"], answer: "haven't gone", explanation: '否定：haven\'t/hasn\'t + 过去分词。' },
  { id: 'g05f05', grammarId: 'G05', sentence: 'He ____ (be) to Japan twice.', options: ['was', 'has been', 'had been'], answer: 'has been', explanation: 'have/has been to 表示去过某地（经历）。' },
  { id: 'g05f06', grammarId: 'G05', sentence: 'I ____ (lose) my keys.', options: ['lost', 'have lost', 'had lost'], answer: 'have lost', explanation: '现在完成时强调对现在的影响（钥匙现在找不到了）。' },
  { id: 'g05f07', grammarId: 'G05', sentence: 'She ____ (live) here for 10 years.', options: ['lived', 'has lived', 'has living'], answer: 'has lived', explanation: 'for + 时间段，用现在完成时表示持续。' },
  { id: 'g05f08', grammarId: 'G05', sentence: '____ he ____ (finish) the work?', options: ['Has / finished', 'Did / finish', 'Does / finish'], answer: 'Has / finished', explanation: '疑问句用 Has + 主语 + 过去分词？' },
  { id: 'g05f09', grammarId: 'G05', sentence: 'We ____ (not / see) him today.', options: ["haven't seen", "didn't see", "don't see"], answer: "haven't seen", explanation: 'today 与现在完成时连用。' },
  { id: 'g05f10', grammarId: 'G05', sentence: 'I ____ (know) her for a long time.', options: ['knew', 'have known', 'have knew'], answer: 'have known', explanation: 'for + 时间段，用现在完成时。' },
  { id: 'g05f11', grammarId: 'G05', sentence: 'She ____ (just / leave).', options: ['just left', 'has just left', 'had just left'], answer: 'has just left', explanation: 'just 与现在完成时连用。' },
  { id: 'g05f12', grammarId: 'G05', sentence: '____ you ever ____ (be) to Paris?', options: ['Have / been', 'Did / go', 'Do / go'], answer: 'Have / been', explanation: 'ever 与现在完成时连用，表示经历。' },
  { id: 'g05f13', grammarId: 'G05', sentence: 'The train ____ (already / arrive).', options: ['already arrived', 'has already arrived', 'had already arrived'], answer: 'has already arrived', explanation: 'already 与现在完成时连用。' },
  { id: 'g05f14', grammarId: 'G05', sentence: 'I ____ (not / read) the book.', options: ["haven't read", "didn't read", "don't read"], answer: "haven't read", explanation: '否定：haven\'t/hasn\'t + 过去分词。' },
  { id: 'g05f15', grammarId: 'G05', sentence: 'He ____ (write) three books.', options: ['wrote', 'has written', 'has wrote'], answer: 'has written', explanation: 'write 的过去分词是 written。' },
  { id: 'g05f16', grammarId: 'G05', sentence: 'We ____ (be) friends since 2010.', options: ['were', 'have been', 'are'], answer: 'have been', explanation: 'since + 时间点，用现在完成时。' },
  { id: 'g05f17', grammarId: 'G05', sentence: '____ she ____ (call) you?', options: ['Has / called', 'Did / call', 'Does / call'], answer: 'Has / called', explanation: '疑问句用 Has + 主语 + 过去分词？' },
  { id: 'g05f18', grammarId: 'G05', sentence: 'I ____ (never / see) the sea.', options: ["never saw", "have never seen", "never see"], answer: "have never seen", explanation: 'never 常与现在完成时连用。' },
  { id: 'g05f19', grammarId: 'G05', sentence: 'They ____ (not / arrive) yet.', options: ["haven't arrived", "didn't arrive", "don't arrive"], answer: "haven't arrived", explanation: 'yet 与现在完成时否定连用。' },
  { id: 'g05f20', grammarId: 'G05', sentence: 'She ____ (work) here for 5 years.', options: ['worked', 'has worked', 'has work'], answer: 'has worked', explanation: 'for + 时间段，用现在完成时。' },
  { id: 'g05f21', grammarId: 'G05', sentence: 'I ____ (lose) my phone.', options: ['lost', 'have lost', 'had lost'], answer: 'have lost', explanation: '现在完成时强调对现在的影响。' },
  { id: 'g05f22', grammarId: 'G05', sentence: '____ you ____ (do) your homework?', options: ['Have / done', 'Did / do', 'Do / do'], answer: 'Have / done', explanation: 'do 的过去分词是 done。' },
  { id: 'g05f23', grammarId: 'G05', sentence: 'He ____ (not / be) to China.', options: ["hasn't been", "didn't go", "isn't"], answer: "hasn't been", explanation: 'have/has been to 表示去过某地。' },
  { id: 'g05f24', grammarId: 'G05', sentence: 'We ____ (know) each other for years.', options: ['knew', 'have known', 'have knew'], answer: 'have known', explanation: 'for + 时间段，用现在完成时。' },
  { id: 'g05f25', grammarId: 'G05', sentence: 'She ____ (just / go) out.', options: ['just went', 'has just gone', 'had just gone'], answer: 'has just gone', explanation: 'just 与现在完成时连用。' },
  { id: 'g05f26', grammarId: 'G05', sentence: 'I ____ (read) that book twice.', options: ['read', 'have read', 'had read'], answer: 'have read', explanation: 'twice 表示经历，用现在完成时。' },
  { id: 'g05f27', grammarId: 'G05', sentence: '____ he ____ (finish) yet?', options: ['Has / finished', 'Did / finish', 'Does / finish'], answer: 'Has / finished', explanation: 'yet 与现在完成时疑问句连用。' },
  { id: 'g05f28', grammarId: 'G05', sentence: 'They ____ (not / see) the film.', options: ["haven't seen", "didn't see", "don't see"], answer: "haven't seen", explanation: '否定：haven\'t/hasn\'t + 过去分词。' },
  { id: 'g05f29', grammarId: 'G05', sentence: 'She ____ (be) ill for a week.', options: ['was', 'has been', 'is'], answer: 'has been', explanation: 'for + 时间段，用现在完成时。' },
  { id: 'g05f30', grammarId: 'G05', sentence: 'We ____ (already / eat).', options: ['already ate', 'have already eaten', 'had already eaten'], answer: 'have already eaten', explanation: 'already 与现在完成时连用。' },
];

export const g05Choice: GrammarChoiceQuestion[] = [
  { id: 'g05c01', grammarId: 'G05', question: 'Which sentence is correct?', options: ['I have seen him yesterday.', 'I saw him yesterday.', 'I have saw him.'], answer: 'I saw him yesterday.', explanation: 'yesterday 是具体过去时间，用一般过去时，不用现在完成时。' },
  { id: 'g05c02', grammarId: 'G05', question: 'Choose the correct sentence:', options: ['She has gone to Paris.', 'She has been to Paris.', 'She have been to Paris.'], answer: 'She has been to Paris.', explanation: 'have/has been to 表示去过（已回来）；have/has gone to 表示去了（还没回来）。' },
  { id: 'g05c03', grammarId: 'G05', question: '— ____ you ever ____ to Japan? — Yes, twice.', options: ['Did / go', 'Have / been', 'Do / go'], answer: 'Have / been', explanation: 'ever 表示经历，用现在完成时。' },
  { id: 'g05c04', grammarId: 'G05', question: 'Which is correct?', options: ["I haven't seen him.", "I didn't see him.", "I don't see him."], answer: "I haven't seen him.", explanation: '现在完成时否定：haven\'t/hasn\'t + 过去分词。' },
  { id: 'g05c05', grammarId: 'G05', question: 'She ____ in London for 3 years.', options: ['lived', 'has lived', 'has living'], answer: 'has lived', explanation: 'for + 时间段，用现在完成时。' },
  { id: 'g05c06', grammarId: 'G05', question: 'Which uses present perfect?', options: ['I lost my keys.', 'I have lost my keys.', 'I lose my keys.'], answer: 'I have lost my keys.', explanation: '现在完成时强调对现在的影响。' },
  { id: 'g05c07', grammarId: 'G05', question: 'Choose the correct question:', options: ['Have you eaten?', 'Did you eat?', 'Do you eat?'], answer: 'Have you eaten?', explanation: '询问是否已经做了某事，用现在完成时。' },
  { id: 'g05c08', grammarId: 'G05', question: 'I ____ my homework. Can I go out?', options: ['finished', 'have finished', 'had finished'], answer: 'have finished', explanation: '强调已完成，对现在有影响（可以出去玩了）。' },
  { id: 'g05c09', grammarId: 'G05', question: 'Which is wrong?', options: ["I have been to Paris twice.", "I have seen him yesterday.", "I haven't eaten."], answer: "I have seen him yesterday.", explanation: 'yesterday 是具体过去时间，不能用现在完成时。' },
  { id: 'g05c10', grammarId: 'G05', question: 'She ____ the email.', options: ['has wrote', 'has written', 'has writing'], answer: 'has written', explanation: 'write 的过去分词是 written。' },
];

export const g05Correction: GrammarCorrectionQuestion[] = [
  { id: 'g05x01', grammarId: 'G05', sentence: 'I have saw him.', answer: 'I have seen him.', explanation: 'see 的过去分词是 seen，不是 saw。' },
  { id: 'g05x02', grammarId: 'G05', sentence: 'She have finished her work.', answer: 'She has finished her work.', explanation: 'she 搭配 has，不用 have。' },
  { id: 'g05x03', grammarId: 'G05', sentence: 'I have been to Beijing in 2020.', answer: 'I went to Beijing in 2020.', explanation: 'in 2020 是具体过去时间，用一般过去时。' },
  { id: 'g05x04', grammarId: 'G05', sentence: "I haven't saw the film.", answer: "I haven't seen the film.", explanation: '否定用 haven\'t/hasn\'t + 过去分词，see 的过去分词是 seen。' },
  { id: 'g05x05', grammarId: 'G05', sentence: 'He has go to school.', answer: 'He has gone to school.', explanation: 'go 的过去分词是 gone。' },
  { id: 'g05x06', grammarId: 'G05', sentence: 'Have you ever went to London?', answer: 'Have you ever been to London?', explanation: 'ever 表示经历，用 have/has been to；go 的过去分词是 gone/been。' },
  { id: 'g05x07', grammarId: 'G05', sentence: "We didn't have seen him.", answer: "We haven't seen him.", explanation: '现在完成时否定用 haven\'t/hasn\'t，不用 didn\'t。' },
  { id: 'g05x08', grammarId: 'G05', sentence: 'She has live here for 10 years.', answer: 'She has lived here for 10 years.', explanation: 'have/has + 过去分词，live 的过去分词是 lived。' },
  { id: 'g05x09', grammarId: 'G05', sentence: 'I have know him for years.', answer: 'I have known him for years.', explanation: 'know 的过去分词是 known。' },
  { id: 'g05x10', grammarId: 'G05', sentence: 'Has you finished?', answer: 'Have you finished?', explanation: 'you 搭配 have，不用 has。' },
];


// ========= G06: 情态动词 can/could =========
export const grammarG06: GrammarPoint = {
  id: 'G06',
  name: 'Modal Verbs: can/could',
  nameZh: '情态动词 can/could',
  explanation: 'can 和 could 用来表示能力、许可或请求。\n\n【can】现在的能力/许可：I can swim.（我会游泳。）\n【could】过去的能力 / 委婉请求：I could swim when I was five.（我五岁时就会游泳了。）Could you help me?（你能帮我吗？语气更委婉）\n\n【结构】can/could + 动词原形（不接 to）',
  examples: [
    { en: 'I can ride a bike.', zh: '我会骑自行车。' },
    { en: 'Could you open the window, please?', zh: '你能打开窗户吗？（委婉请求）' },
    { en: 'I couldn\'t sleep last night.', zh: '我昨晚睡不着。' },
  ],
};

export const g06Fill: GrammarFillQuestion[] = [
  // --- 原有 10 题 ---
  { id: 'g06f01', grammarId: 'G06', sentence: 'I ____ swim very well.', options: ['can', 'could', 'can to'], answer: 'can', explanation: 'can + 动词原形，不加 to。' },
  { id: 'g06f02', grammarId: 'G06', sentence: '____ you help me, please?', options: ['Can', 'Could', 'Are'], answer: 'Could', explanation: 'Could 比 Can 更委婉礼貌。' },
  { id: 'g06f03', grammarId: 'G06', sentence: 'She ____ speak three languages.', options: ['can', 'cans', 'can to'], answer: 'can', explanation: 'can 没有人称变化。' },
  { id: 'g06f04', grammarId: 'G06', sentence: 'I ____ (not) ride a horse.', options: ["can't", "couldn't", 'not can'], answer: "can't", explanation: '否定：can\'t + 动词原形。' },
  { id: 'g06f05', grammarId: 'G06', sentence: 'When I was young, I ____ run very fast.', options: ['can', 'could', 'could to'], answer: 'could', explanation: '描述过去的能力用 could。' },
  { id: 'g06f06', grammarId: 'G06', sentence: '____ I use your phone?', options: ['Can', 'Could', 'Am'], answer: 'Can', explanation: '请求许可用 Can I...?' },
  { id: 'g06f07', grammarId: 'G06', sentence: 'We ____ (not) hear the music.', options: ["couldn't", "can't", 'not could'], answer: "couldn't", explanation: '描述过去听不到用 couldn\'t。' },
  { id: 'g06f08', grammarId: 'G06', sentence: '____ they come to the party?', options: ['Can', 'Could', 'Are'], answer: 'Can', explanation: 'can 提问能力或可能性。' },
  { id: 'g06f09', grammarId: 'G06', sentence: 'I think you ____ try again.', options: ['can', 'could', 'can to'], answer: 'can', explanation: '建议用 can。' },
  { id: 'g06f10', grammarId: 'G06', sentence: 'She ____ be at home now.', options: ['can', 'could', 'cans'], answer: 'could', explanation: 'could 表示可能性（推测）。' },
  // --- 新增 20 题（扩充到 30 道 Fill）---
  { id: 'g06f11', grammarId: 'G06', sentence: 'He ____ play the piano.', options: ['can', 'cans', 'can to'], answer: 'can', explanation: 'can 没有人称变化。' },
  { id: 'g06f12', grammarId: 'G06', sentence: '____ you open the door?', options: ['Can', 'Could', 'Will'], answer: 'Could', explanation: 'Could 比 Can 更委婉。' },
  { id: 'g06f13', grammarId: 'G06', sentence: 'I ____ (not) come yesterday.', options: ["couldn't", "can't", 'not could'], answer: "couldn't", explanation: '过去不能来用 couldn\'t。' },
  { id: 'g06f14', grammarId: 'G06', sentence: 'She ____ speak English and French.', options: ['can', 'cans', 'can to'], answer: 'can', explanation: 'can 没有人称变化。' },
  { id: 'g06f15', grammarId: 'G06', sentence: '____ I sit here?', options: ['Can', 'Could', 'May'], answer: 'Can', explanation: '请求许可用 Can I...?' },
  { id: 'g06f16', grammarId: 'G06', sentence: 'We ____ (not) find the key.', options: ["couldn't", "can't", 'not can'], answer: "couldn't", explanation: '过去找不到用 couldn\'t。' },
  { id: 'g06f17', grammarId: 'G06', sentence: 'When I was young, I ____ swim across the river.', options: ['can', 'could', 'could to'], answer: 'could', explanation: '过去的能力用 could。' },
  { id: 'g06f18', grammarId: 'G06', sentence: '____ you pass the salt?', options: ['Can', 'Could', 'Will'], answer: 'Could', explanation: '请求用 Could you...? 更礼貌。' },
  { id: 'g06f19', grammarId: 'G06', sentence: 'He ____ be at home now.', options: ['can', 'could', 'cans'], answer: 'could', explanation: 'could 表示推测可能性。' },
  { id: 'g06f20', grammarId: 'G06', sentence: 'I ____ (not) lift the box.', options: ["can't", "couldn't", 'not can'], answer: "can't", explanation: '现在不能举起用 can\'t。' },
  { id: 'g06f21', grammarId: 'G06', sentence: 'She ____ dance very well.', options: ['can', 'cans', 'can to'], answer: 'can', explanation: 'can 没有人称变化。' },
  { id: 'g06f22', grammarId: 'G06', sentence: '____ you help me with my homework?', options: ['Can', 'Could', 'Will'], answer: 'Could', explanation: 'Could 更委婉礼貌。' },
  { id: 'g06f23', grammarId: 'G06', sentence: 'We ____ (not) go to the party.', options: ["couldn't", "can't", 'not could'], answer: "couldn't", explanation: '过去不能去用 couldn\'t。' },
  { id: 'g06f24', grammarId: 'G06', sentence: 'He ____ speak four languages.', options: ['can', 'cans', 'can to'], answer: 'can', explanation: 'can 没有人称变化。' },
  { id: 'g06f25', grammarId: 'G06', sentence: '____ I use your bathroom?', options: ['Can', 'Could', 'May'], answer: 'Can', explanation: '请求许可用 Can I...?' },
  { id: 'g06f26', grammarId: 'G06', sentence: 'I ____ (not) sleep last night.', options: ["couldn't", "can't", 'not could'], answer: "couldn't", explanation: '过去睡不着用 couldn\'t。' },
  { id: 'g06f27', grammarId: 'G06', sentence: 'She ____ be at school now.', options: ['can', 'could', 'cans'], answer: 'could', explanation: 'could 表示推测。' },
  { id: 'g06f28', grammarId: 'G06', sentence: '____ you turn down the music?', options: ['Can', 'Could', 'Will'], answer: 'Could', explanation: '请求用 Could you...? 更礼貌。' },
  { id: 'g06f29', grammarId: 'G06', sentence: 'We ____ (not) hear the teacher.', options: ["couldn't", "can't", 'not could'], answer: "couldn't", explanation: '过去听不清用 couldn\'t。' },
  { id: 'g06f30', grammarId: 'G06', sentence: 'He ____ run very fast when he was young.', options: ['can', 'could', 'could to'], answer: 'could', explanation: '过去的能力用 could。' },
];

export const g06Choice: GrammarChoiceQuestion[] = [
  // --- 原有 5 题 ---
  { id: 'g06c01', grammarId: 'G06', question: 'Which sentence is correct?', options: ['I can to swim.', 'I can swim.', 'I can swimming.'], answer: 'I can swim.', explanation: 'can + 动词原形，不加 to，不加 -ing。' },
  { id: 'g06c02', grammarId: 'G06', question: 'Choose the correct past ability:', options: ['I can play the piano when I was young.', 'I could play the piano when I was young.', 'I could to play the piano.'], answer: 'I could play the piano when I was young.', explanation: '过去能力用 could + 动词原形。' },
  { id: 'g06c03', grammarId: 'G06', question: 'Which is more polite?', options: ['Can you help me?', 'Could you help me?', 'Do you help me?'], answer: 'Could you help me?', explanation: 'Could 比 Can 更委婉礼貌。' },
  { id: 'g06c04', grammarId: 'G06', question: 'Choose the correct negative:', options: ["I don't can swim.", "I can't swim.", "I no can swim."], answer: "I can't swim.", explanation: '否定：can\'t + 动词原形。' },
  { id: 'g06c05', grammarId: 'G06', question: '— ____ you speak French? — A little.', options: ['Are', 'Can', 'Could'], answer: 'Can', explanation: '询问能力用 Can you...?' },
  // --- 新增 5 题（扩充到 10 道 Choice）---
  { id: 'g06c06', grammarId: 'G06', question: 'Which is correct?', options: ['She can to dance.', 'She can dance.', 'She can dancing.'], answer: 'She can dance.', explanation: 'can + 动词原形，不加 to。' },
  { id: 'g06c07', grammarId: 'G06', question: 'Choose the correct past negative:', options: ["I couldn't to go.", "I couldn't go.", "I didn't can go."], answer: "I couldn't go.", explanation: 'couldn\'t 后面直接加动词原形。' },
  { id: 'g06c08', grammarId: 'G06', question: '____ you pass the salt?', options: ['Can', 'Could', 'Will'], answer: 'Could', explanation: 'Could 更委婉礼貌。' },
  { id: 'g06c09', grammarId: 'G06', question: 'Which shows ability?', options: ['I can swim.', 'I am swimming.', 'I swam.'], answer: 'I can swim.', explanation: 'can 表示能力。' },
  { id: 'g06c10', grammarId: 'G06', question: 'Choose the correct sentence:', options: ["He can't to come.", "He can't come.", "He doesn't can come."], answer: "He can't come.", explanation: 'can\'t 后面直接加动词原形。' },
];

export const g06Correction: GrammarCorrectionQuestion[] = [
  // --- 原有 5 题 ---
  { id: 'g06x01', grammarId: 'G06', sentence: 'I can to play tennis.', answer: 'I can play tennis.', explanation: 'can 后面直接加动词原形，不加 to。' },
  { id: 'g06x02', grammarId: 'G06', sentence: "I couldn't to sleep last night.", answer: "I couldn't sleep last night.", explanation: 'couldn\'t 后面直接加动词原形，不加 to。' },
  { id: 'g06x03', grammarId: 'G06', sentence: 'She can speaks English.', answer: 'She can speak English.', explanation: 'can 后面的动词用原形，不加 -s。' },
  { id: 'g06x04', grammarId: 'G06', sentence: 'Can you helping me?', answer: 'Can you help me?', explanation: 'can 后面加动词原形，不加 -ing。' },
  { id: 'g06x05', grammarId: 'G06', sentence: 'Could you to open the door?', answer: 'Could you open the door?', explanation: 'could 后面直接加动词原形，不加 to。' },
  // --- 新增 5 题（扩充到 10 道 Correction）---
  { id: 'g06x06', grammarId: 'G06', sentence: 'He can swimming.', answer: 'He can swim.', explanation: 'can 后面加动词原形，不加 -ing。' },
  { id: 'g06x07', grammarId: 'G06', sentence: "She couldn't to come.", answer: "She couldn't come.", explanation: 'couldn\'t 后面直接加动词原形。' },
  { id: 'g06x08', grammarId: 'G06', sentence: 'Can you dancing?', answer: 'Can you dance?', explanation: 'can 后面加动词原形，不加 -ing。' },
  { id: 'g06x09', grammarId: 'G06', sentence: 'I am can play piano.', answer: 'I can play piano.', explanation: 'can 本身作谓语动词，不需要 be 动词。' },
  { id: 'g06x10', grammarId: 'G06', sentence: "We couldn't to go.", answer: "We couldn't go.", explanation: 'couldn\'t 后面直接加动词原形。' },
];


// ========= G07: 情态动词 must/have to/should =========
export const grammarG07: GrammarPoint = {
  id: 'G07',
  name: 'Modal Verbs: must/have to/should',
  nameZh: '情态动词 must/have to/should',
  explanation: 'must, have to, should 用来表示义务、必要或建议。\n\n【must】主观认为必须：I must finish this today.\n【have to】客观需要：I have to wear a uniform.\n【should】建议：You should see a doctor.\n\n【结构】must/have to/should + 动词原形',
  examples: [
    { en: 'You must wear a seatbelt.', zh: '你必须系安全带。' },
    { en: 'I have to get up early.', zh: '我得早起。' },
    { en: 'You should drink more water.', zh: '你应该多喝水。' },
  ],
};

export const g07Fill: GrammarFillQuestion[] = [
  { id: 'g07f01', grammarId: 'G07', sentence: 'You ____ wear a seatbelt.', options: ['must', 'should', 'can'], answer: 'must', explanation: 'must 表示必须（规则/法律）。' },
  { id: 'g07f02', grammarId: 'G07', sentence: 'I ____ (not) be late.', options: ["mustn't", "don't have to", "shouldn't"], answer: "mustn't", explanation: 'mustn\'t 表示禁止。' },
  { id: 'g07f03', grammarId: 'G07', sentence: 'She ____ see a doctor.', options: ['should', 'must', 'can'], answer: 'should', explanation: 'should 表示建议。' },
  { id: 'g07f04', grammarId: 'G07', sentence: 'I ____ (not) smoke.', options: ["shouldn't", "mustn't", "don't have to"], answer: "shouldn't", explanation: 'shouldn\'t 表示建议不要做某事。' },
  { id: 'g07f05', grammarId: 'G07', sentence: 'We ____ wear a uniform.', options: ['have to', 'must', 'should'], answer: 'have to', explanation: 'have to 表示客观需要。' },
  { id: 'g07f06', grammarId: 'G07', sentence: 'He ____ (not) work on Sundays.', options: ["doesn't have to", "mustn't", "shouldn't"], answer: "doesn't have to", explanation: 'don\'t have to 表示不必。' },
  { id: 'g07f07', grammarId: 'G07', sentence: 'You ____ stop here.', options: ['must', 'should', 'can'], answer: 'must', explanation: 'must 表示必须（规则）。' },
  { id: 'g07f08', grammarId: 'G07', sentence: 'I think you ____ apologize.', options: ['should', 'must', 'can'], answer: 'should', explanation: 'should 表示建议。' },
  { id: 'g07f09', grammarId: 'G07', sentence: 'She ____ (not) be late again.', options: ["mustn't", "shouldn't", "doesn't have to"], answer: "mustn't", explanation: 'mustn\'t 表示禁止。' },
  { id: 'g07f10', grammarId: 'G07', sentence: 'We ____ (not) forget her birthday.', options: ["mustn't", "shouldn't", "don't have to"], answer: "mustn't", explanation: 'mustn\'t 表示不应该（禁止）。' },
  { id: 'g07f11', grammarId: 'G07', sentence: 'I ____ study hard.', options: ['must', 'should', 'can'], answer: 'must', explanation: 'must 表示必须。' },
  { id: 'g07f12', grammarId: 'G07', sentence: 'You ____ (not) park here.', options: ["mustn't", "don't have to", "shouldn't"], answer: "mustn't", explanation: 'mustn\'t 表示禁止。' },
  { id: 'g07f13', grammarId: 'G07', sentence: 'He ____ take a taxi.', options: ['should', 'must', 'can'], answer: 'should', explanation: 'should 表示建议。' },
  { id: 'g07f14', grammarId: 'G07', sentence: 'She ____ (not) get up early on Sundays.', options: ["doesn't have to", "mustn't", "shouldn't"], answer: "doesn't have to", explanation: 'don\'t have to 表示不必。' },
  { id: 'g07f15', grammarId: 'G07', sentence: 'We ____ finish this today.', options: ['must', 'should', 'can'], answer: 'must', explanation: 'must 表示必须。' },
  { id: 'g07f16', grammarId: 'G07', sentence: 'I think he ____ see a doctor.', options: ['should', 'must', 'can'], answer: 'should', explanation: 'should 表示建议。' },
  { id: 'g07f17', grammarId: 'G07', sentence: 'You ____ (not) touch it.', options: ["mustn't", "shouldn't", "don't have to"], answer: "mustn't", explanation: 'mustn\'t 表示禁止。' },
  { id: 'g07f18', grammarId: 'G07', sentence: 'They ____ wear a seatbelt.', options: ['have to', 'should', 'can'], answer: 'have to', explanation: 'have to 表示客观需要（法律）。' },
  { id: 'g07f19', grammarId: 'G07', sentence: 'She ____ (not) work too hard.', options: ["shouldn't", "mustn't", "doesn't have to"], answer: "shouldn't", explanation: 'shouldn\'t 表示建议不要。' },
  { id: 'g07f20', grammarId: 'G07', sentence: 'I ____ go to the dentist.', options: ['have to', 'should', 'can'], answer: 'have to', explanation: 'have to 表示客观需要。' },
  { id: 'g07f21', grammarId: 'G07', sentence: 'You ____ be careful.', options: ['must', 'should', 'can'], answer: 'must', explanation: 'must 表示必须。' },
  { id: 'g07f22', grammarId: 'G07', sentence: 'He ____ (not) smoke.', options: ["shouldn't", "mustn't", "doesn't have to"], answer: "shouldn't", explanation: 'shouldn\'t 表示建议不要。' },
  { id: 'g07f23', grammarId: 'G07', sentence: 'We ____ leave now.', options: ['must', 'should', 'can'], answer: 'must', explanation: 'must 表示必须。' },
  { id: 'g07f24', grammarId: 'G07', sentence: 'She ____ (not) forget.', options: ["mustn't", "shouldn't", "doesn't have to"], answer: "mustn't", explanation: 'mustn\'t 表示不应该忘记。' },
  { id: 'g07f25', grammarId: 'G07', sentence: 'I think you ____ try again.', options: ['should', 'must', 'can'], answer: 'should', explanation: 'should 表示建议。' },
  { id: 'g07f26', grammarId: 'G07', sentence: 'They ____ (not) be late.', options: ["mustn't", "shouldn't", "don't have to"], answer: "mustn't", explanation: 'mustn\'t 表示禁止。' },
  { id: 'g07f27', grammarId: 'G07', sentence: 'He ____ wear a tie.', options: ['has to', 'should', 'can'], answer: 'has to', explanation: 'have to 第三人称单数 has to。' },
  { id: 'g07f28', grammarId: 'G07', sentence: 'You ____ (not) worry.', options: ["shouldn't", "mustn't", "don't have to"], answer: "shouldn't", explanation: 'shouldn\'t 表示建议不要担心。' },
  { id: 'g07f29', grammarId: 'G07', sentence: 'We ____ help him.', options: ['should', 'must', 'can'], answer: 'should', explanation: 'should 表示建议。' },
  { id: 'g07f30', grammarId: 'G07', sentence: 'I ____ (not) go there alone.', options: ["mustn't", "shouldn't", "don't have to"], answer: "mustn't", explanation: 'mustn\'t 表示禁止。' },
];

export const g07Choice: GrammarChoiceQuestion[] = [
  { id: 'g07c01', grammarId: 'G07', question: 'Which shows obligation?', options: ['You should stop.', 'You must stop.', 'You can stop.'], answer: 'You must stop.', explanation: 'must 表示必须（义务）。' },
  { id: 'g07c02', grammarId: 'G07', question: 'Choose the correct advice:', options: ['You must see a doctor.', 'You should see a doctor.', 'You have to see a doctor.'], answer: 'You should see a doctor.', explanation: 'should 表示建议。' },
  { id: 'g07c03', grammarId: 'G07', question: 'Which is correct?', options: ["I don't have to work on Sundays.", "I mustn't work on Sundays.", "I shouldn't work on Sundays."], answer: "I don't have to work on Sundays.", explanation: 'don\'t have to 表示不必。' },
  { id: 'g07c04', grammarId: 'G07', question: 'Which shows prohibition?', options: ['You should not park here.', "You mustn't park here.", 'You do not have to park here.'], answer: "You mustn't park here.", explanation: 'mustn\'t 表示禁止。' },
  { id: 'g07c05', grammarId: 'G07', question: 'Choose the correct sentence:', options: ['You should to study.', 'You should study.', 'You should studying.'], answer: 'You should study.', explanation: 'should + 动词原形，不加 to。' },
  { id: 'g07c06', grammarId: 'G07', question: 'Which shows necessity?', options: ['I should get up early.', 'I have to get up early.', 'I can get up early.'], answer: 'I have to get up early.', explanation: 'have to 表示客观需要。' },
  { id: 'g07c07', grammarId: 'G07', question: 'Choose the correct negative:', options: ["You mustn't be late.", "You don't have to be late.", "You shouldn't be late."], answer: "You mustn't be late.", explanation: 'mustn\'t 表示禁止。' },
  { id: 'g07c08', grammarId: 'G07', question: 'Which is a suggestion?', options: ['You must try this.', 'You should try this.', 'You have to try this.'], answer: 'You should try this.', explanation: 'should 表示建议。' },
  { id: 'g07c09', grammarId: 'G07', question: 'Which is correct?', options: ["She has to wear a uniform.", "She have to wear a uniform.", "She must to wear a uniform."], answer: "She has to wear a uniform.", explanation: 'have to 第三人称单数 has to。' },
  { id: 'g07c10', grammarId: 'G07', question: 'Choose the correct advice:', options: ['You must drink more water.', 'You should drink more water.', 'You have to drink more water.'], answer: 'You should drink more water.', explanation: 'should 表示建议。' },
];

export const g07Correction: GrammarCorrectionQuestion[] = [
  { id: 'g07x01', grammarId: 'G07', sentence: 'You must to stop.', answer: 'You must stop.', explanation: 'must 后面直接加动词原形，不加 to。' },
  { id: 'g07x02', grammarId: 'G07', sentence: "You shouldn't to go.", answer: 'You should not go.', explanation: 'should 后面直接加动词原形，不加 to。' },
  { id: 'g07x03', grammarId: 'G07', sentence: "I don't must go.", answer: "I mustn't go.", explanation: 'must 的否定直接加 not = mustn\'t。' },
  { id: 'g07x04', grammarId: 'G07', sentence: 'She have to leave.', answer: 'She has to leave.', explanation: 'have to 第三人称单数 has to。' },
  { id: 'g07x05', grammarId: 'G07', sentence: 'You should working hard.', answer: 'You should work hard.', explanation: 'should 后面加动词原形，不加 -ing。' },
  { id: 'g07x06', grammarId: 'G07', sentence: "He shouldn't to come.", answer: "He shouldn't come.", explanation: 'should 后面直接加动词原形，不加 to。' },
  { id: 'g07x07', grammarId: 'G07', sentence: "We must to finish this.", answer: 'We must finish this.', explanation: 'must 后面直接加动词原形，不加 to。' },
  { id: 'g07x08', grammarId: 'G07', sentence: "They don't must do it.", answer: "They mustn't do it.", explanation: 'must 的否定直接加 not = mustn\'t。' },
  { id: 'g07x09', grammarId: 'G07', sentence: 'I have study hard.', answer: 'I have to study hard.', explanation: 'have to + 动词原形。' },
  { id: 'g07x10', grammarId: 'G07', sentence: "You mustn't to smoke.", answer: "You mustn't smoke.", explanation: 'mustn\'t 后面直接加动词原形，不加 to。' },
];


// ========= G08: 比较级与最高级 =========
export const grammarG08: GrammarPoint = {
  id: 'G08',
  name: 'Comparatives & Superlatives',
  nameZh: '比较级与最高级',
  explanation: '比较级用于两者之间的比较，最高级用于三者或以上的比较。\n\n【比较级】A + be/动词 + 比较级 + than + B\n· 短形容词 + -er：taller, smaller\n· 以 e 结尾 + -r：nicer, larger\n· 辅音+y → -ier：heavier, happier\n· 长形容词 + more：more interesting, more beautiful\n\n【最高级】the + 最高级 (+ in/of...)\n· 短形容词 + -est：the tallest, the smallest\n· 长形容词 + most：the most interesting',
  examples: [
    { en: 'She is taller than her sister.', zh: '她比她姐姐高。' },
    { en: 'This is the biggest city in China.', zh: '这是中国最大的城市。' },
    { en: 'English is more difficult than maths.', zh: '英语比数学难。' },
  ],
};

export const g08Fill: GrammarFillQuestion[] = [
  // 原有 10 题
  { id: 'g08f01', grammarId: 'G08', sentence: 'A cat is ____ than a mouse.', options: ['big', 'bigger', 'biggest'], answer: 'bigger', explanation: '两者比较用比较级 bigger。' },
  { id: 'g08f02', grammarId: 'G08', sentence: 'This is ____ book I have ever read.', options: ['good', 'better', 'the best'], answer: 'the best', explanation: '三者以上用最高级，前面加 the。' },
  { id: 'g08f03', grammarId: 'G08', sentence: 'Today is ____ than yesterday.', options: ['hot', 'hotter', 'hottest'], answer: 'hotter', explanation: '今天和昨天比较，用比较级。' },
  { id: 'g08f04', grammarId: 'G08', sentence: 'Elephants are ____ animals on land.', options: ['the big', 'the biggest', 'bigger'], answer: 'the biggest', explanation: '陆地上的所有动物中，用最高级。' },
  { id: 'g08f05', grammarId: 'G08', sentence: 'My room is ____ than yours.', options: ['clean', 'cleaner', 'cleanest'], answer: 'cleaner', explanation: '两个房间比较，用比较级 cleaner。' },
  { id: 'g08f06', grammarId: 'G08', sentence: 'This film is ____ interesting than that one.', options: ['more', 'most', 'much'], answer: 'more', explanation: '长形容词 interesting 用 more + 原形构成比较级。' },
  { id: 'g08f07', grammarId: 'G08', sentence: 'She is ____ girl in our class.', options: ['pretty', 'prettier', 'the prettiest'], answer: 'the prettiest', explanation: '全班范围内，用最高级 prettiest。' },
  { id: 'g08f08', grammarId: 'G08', sentence: 'The weather is getting ____ and ____. (bad)', options: ['bad / bad', 'worse / worse', 'worst / worst'], answer: 'worse / worse', explanation: 'bad 的比较级是 worse。' },
  { id: 'g08f09', grammarId: 'G08', sentence: 'This is ____ picture in the museum.', options: ['beautiful', 'more beautiful', 'the most beautiful'], answer: 'the most beautiful', explanation: '长形容词 beautiful 用 most + 原形构成最高级。' },
  { id: 'g08f10', grammarId: 'G08', sentence: 'My bag is heavy, but your bag is ____. (heavy)', options: ['heavy', 'heavier', 'heaviest'], answer: 'heavier', explanation: '重音节单音节词直接加 -er。' },
  // 新增 20 题
  { id: 'g08f11', grammarId: 'G08', sentence: 'He is ____ than his brother.', options: ['tall', 'taller', 'tallest'], answer: 'taller', explanation: '两者比较用比较级 taller。' },
  { id: 'g08f12', grammarId: 'G08', sentence: 'This is ____ car in the world.', options: ['expensive', 'more expensive', 'the most expensive'], answer: 'the most expensive', explanation: '三者以上用最高级。' },
  { id: 'g08f13', grammarId: 'G08', sentence: 'My phone is ____ than yours.', options: ['new', 'newer', 'newest'], answer: 'newer', explanation: 'new 的比较级是 newer。' },
  { id: 'g08f14', grammarId: 'G08', sentence: 'She is ____ student in the school.', options: ['smart', 'smarter', 'the smartest'], answer: 'the smartest', explanation: '全校范围内，用最高级 smartest。' },
  { id: 'g08f15', grammarId: 'G08', sentence: 'English is ____ than maths.', options: ['difficult', 'more difficult', 'most difficult'], answer: 'more difficult', explanation: '长形容词用 more + 原形。' },
  { id: 'g08f16', grammarId: 'G08', sentence: 'This book is ____ than that one.', options: ['interesting', 'more interesting', 'most interesting'], answer: 'more interesting', explanation: 'interesting 用 more + 原形。' },
  { id: 'g08f17', grammarId: 'G08', sentence: 'He is ____ boy in the village.', options: ['strong', 'stronger', 'the strongest'], answer: 'the strongest', explanation: '全村范围内，用最高级 strongest。' },
  { id: 'g08f18', grammarId: 'G08', sentence: 'The weather is ____ today than yesterday.', options: ['cold', 'colder', 'coldest'], answer: 'colder', explanation: '今天和昨天比较，用比较级 colder。' },
  { id: 'g08f19', grammarId: 'G08', sentence: 'This is ____ restaurant in town.', options: ['good', 'better', 'the best'], answer: 'the best', explanation: 'good 的最高级是 best。' },
  { id: 'g08f20', grammarId: 'G08', sentence: 'She runs ____ than me.', options: ['fast', 'faster', 'fastest'], answer: 'faster', explanation: 'fast 的比较级是 faster。' },
  { id: 'g08f21', grammarId: 'G08', sentence: 'This is ____ movie I have ever seen.', options: ['exciting', 'more exciting', 'the most exciting'], answer: 'the most exciting', explanation: '三者以上用最高级。' },
  { id: 'g08f22', grammarId: 'G08', sentence: 'My bag is ____ than yours.', options: ['heavy', 'heavier', 'heaviest'], answer: 'heavier', explanation: 'heavy 变 y 为 i 加 -er。' },
  { id: 'g08f23', grammarId: 'G08', sentence: 'He is ____ person I know.', options: ['kind', 'kinder', 'the kindest'], answer: 'the kindest', explanation: '我认识的人中，用最高级 kindest。' },
  { id: 'g08f24', grammarId: 'G08', sentence: 'This test is ____ than the last one.', options: ['easy', 'easier', 'easiest'], answer: 'easier', explanation: 'easy 变 y 为 i 加 -er。' },
  { id: 'g08f25', grammarId: 'G08', sentence: 'She is ____ than her sister.', options: ['beautiful', 'more beautiful', 'most beautiful'], answer: 'more beautiful', explanation: '长形容词用 more + 原形。' },
  { id: 'g08f26', grammarId: 'G08', sentence: 'This is ____ day of the year.', options: ['hot', 'hotter', 'the hottest'], answer: 'the hottest', explanation: '一年中最热的一天，用最高级 hottest。' },
  { id: 'g08f27', grammarId: 'G08', sentence: 'He works ____ than me.', options: ['hard', 'harder', 'hardest'], answer: 'harder', explanation: 'hard 的比较级是 harder。' },
  { id: 'g08f28', grammarId: 'G08', sentence: 'This is ____ building in the city.', options: ['tall', 'taller', 'the tallest'], answer: 'the tallest', explanation: '城市中最高的大楼，用最高级 tallest。' },
  { id: 'g08f29', grammarId: 'G08', sentence: 'My score is ____ than yours.', options: ['high', 'higher', 'highest'], answer: 'higher', explanation: '两者比较用比较级 higher。' },
  { id: 'g08f30', grammarId: 'G08', sentence: 'She is ____ girl in the country.', options: ['famous', 'more famous', 'the most famous'], answer: 'the most famous', explanation: '三者以上用最高级。' },
];

export const g08Choice: GrammarChoiceQuestion[] = [
  // 原有 5 题
  { id: 'g08c01', grammarId: 'G08', question: 'Which is correct?', options: ['Tom is taller of the two.', 'Tom is taller than his brother.', 'Tom is the taller than his brother.'], answer: 'Tom is taller than his brother.', explanation: '比较级 + than 结构。' },
  { id: 'g08c02', grammarId: 'G08', question: 'Choose the correct superlative:', options: ['She is the smartest in class.', 'She is the smartest in the class.', 'She is smartest in the class.'], answer: 'She is the smartest in the class.', explanation: '最高级需要加 the。' },
  { id: 'g08c03', grammarId: 'G08', question: '— Which season do you like best? — I like winter ____. (cold)', options: ['less cold', 'the coldest', 'more cold'], answer: 'the coldest', explanation: '四个季节中选一个，用最高级。' },
  { id: 'g08c04', grammarId: 'G08', question: 'My new phone is ____ my old one.', options: ['expensive', 'more expensive', 'most expensive'], answer: 'more expensive', explanation: '多音节词 expensive 用 more + 原形。' },
  { id: 'g08c05', grammarId: 'G08', question: 'He ran the ____ of all the runners.', options: ['faster', 'fastest', 'most fast'], answer: 'fastest', explanation: '所有跑者中最快，fast 的最高级是 fastest。' },
  // 新增 5 题
  { id: 'g08c06', grammarId: 'G08', question: 'Which is correct?', options: ['She is more smart than me.', 'She is smarter than me.', 'She is smartest than me.'], answer: 'She is smarter than me.', explanation: '短形容词用 -er 比较级。' },
  { id: 'g08c07', grammarId: 'G08', question: 'Choose the correct sentence:', options: ['This is most beautiful picture.', 'This is the most beautiful picture.', 'This is more beautiful picture.'], answer: 'This is the most beautiful picture.', explanation: '最高级需要加 the。' },
  { id: 'g08c08', grammarId: 'G08', question: 'My bag is ____ than yours.', options: ['heavy', 'heavier', 'heaviest'], answer: 'heavier', explanation: 'heavy 变 y 为 i 加 -er。' },
  { id: 'g08c09', grammarId: 'G08', question: 'He is ____ student in the school.', options: ['tall', 'taller', 'the tallest'], answer: 'the tallest', explanation: '全校范围内，用最高级。' },
  { id: 'g08c10', grammarId: 'G08', question: 'This book is ____ than that one.', options: ['interesting', 'more interesting', 'most interesting'], answer: 'more interesting', explanation: '长形容词用 more + 原形。' },
];

export const g08Correction: GrammarCorrectionQuestion[] = [
  // 原有 5 题
  { id: 'g08x01', grammarId: 'G08', sentence: 'She is more smart than me.', answer: 'She is smarter than me.', explanation: '短形容词用 -er，不用 more。' },
  { id: 'g08x02', grammarId: 'G08', sentence: 'This is most beautiful picture.', answer: 'This is the most beautiful picture.', explanation: '最高级需要加 the。' },
  { id: 'g08x03', grammarId: 'G08', sentence: 'He is tallest than me.', answer: 'He is taller than me.', explanation: 'tallest 是最高级，比较级用 taller。' },
  { id: 'g08x04', grammarId: 'G08', sentence: 'She is the smarter in the class.', answer: 'She is the smartest in the class.', explanation: '全班范围内用最高级，不是比较级。' },
  { id: 'g08x05', grammarId: 'G08', sentence: 'This book is expensiver than that one.', answer: 'This book is more expensive than that one.', explanation: '多音节词用 more + 原形，不用 -er。' },
  // 新增 5 题
  { id: 'g08x06', grammarId: 'G08', sentence: 'He is more tall than his brother.', answer: 'He is taller than his brother.', explanation: '短形容词用 -er，不用 more。' },
  { id: 'g08x07', grammarId: 'G08', sentence: 'She is the kinder of all.', answer: 'She is the kindest of all.', explanation: '三者以上用最高级 kindest。' },
  { id: 'g08x08', grammarId: 'G08', sentence: 'This is most expensive car.', answer: 'This is the most expensive car.', explanation: '最高级需要加 the。' },
  { id: 'g08x09', grammarId: 'G08', sentence: 'My bag is heavyer than yours.', answer: 'My bag is heavier than yours.', explanation: 'heavy 变 y 为 i 加 -er = heavier。' },
  { id: 'g08x10', grammarId: 'G08', sentence: 'He runs the fast of all.', answer: 'He runs the fastest of all.', explanation: '所有跑步者中最快，用最高级 fastest。' },
];


// ========= G09: 最高级 =========
export const grammarG09: GrammarPoint = {
  id: 'G09',
  name: 'Superlative',
  nameZh: '最高级',
  explanation: '最高级用来比较三个或以上的人或事物，表示"最..."。\n\n【结构】\n· 短形容词 + -est：the tallest, the biggest\n· 长形容词 + most：the most beautiful, the most expensive\n· 不规则：the best, the worst, the most, the least\n\n【注意】最高级前通常要加 the',
  examples: [
    { en: 'He is the tallest in the class.', zh: '他是班里最高的。' },
    { en: 'This is the most delicious cake.', zh: '这是最美味的蛋糕。' },
    { en: 'She is the best student.', zh: '她是最好的学生。' },
  ],
};

export const g09Fill: GrammarFillQuestion[] = [
  { id: 'g09f01', grammarId: 'G09', sentence: 'He is ____ (tall) in the class.', options: ['tallest', 'the tallest', 'taller'], answer: 'the tallest', explanation: '最高级前要加 the。' },
  { id: 'g09f02', grammarId: 'G09', sentence: 'This is ____ (beautiful) picture.', options: ['most beautiful', 'the most beautiful', 'more beautiful'], answer: 'the most beautiful', explanation: '长形容词用 most + 原形，加 the。' },
  { id: 'g09f03', grammarId: 'G09', sentence: 'She is ____ (good) student.', options: ['the best', 'best', 'better'], answer: 'the best', explanation: 'good 的最高级是 best，加 the。' },
  { id: 'g09f04', grammarId: 'G09', sentence: 'This is ____ (bad) film I have ever seen.', options: ['worst', 'the worst', 'worse'], answer: 'the worst', explanation: 'bad 的最高级是 worst，加 the。' },
  { id: 'g09f05', grammarId: 'G09', sentence: 'He is ____ (smart) in the school.', options: ['smartest', 'the smartest', 'smarter'], answer: 'the smartest', explanation: '短形容词加 -est，加 the。' },
  { id: 'g09f06', grammarId: 'G09', sentence: 'This is ____ (expensive) car.', options: ['most expensive', 'the most expensive', 'more expensive'], answer: 'the most expensive', explanation: '长形容词用 most + 原形，加 the。' },
  { id: 'g09f07', grammarId: 'G09', sentence: 'She is ____ (happy) girl I know.', options: ['happiest', 'the happiest', 'happier'], answer: 'the happiest', explanation: 'happy 变 y 为 i 加 -est，加 the。' },
  { id: 'g09f08', grammarId: 'G09', sentence: 'This is ____ (interesting) book.', options: ['most interesting', 'the most interesting', 'more interesting'], answer: 'the most interesting', explanation: '长形容词用 most + 原形，加 the。' },
  { id: 'g09f09', grammarId: 'G09', sentence: 'He is ____ (bad) player.', options: ['worst', 'the worst', 'worse'], answer: 'the worst', explanation: 'bad 的最高级是 worst，加 the。' },
  { id: 'g09f10', grammarId: 'G09', sentence: 'She is ____ (young) in the team.', options: ['youngest', 'the youngest', 'younger'], answer: 'the youngest', explanation: '短形容词加 -est，加 the。' },
  { id: 'g09f11', grammarId: 'G09', sentence: 'This is ____ (good) restaurant.', options: ['best', 'the best', 'better'], answer: 'the best', explanation: 'good 的最高级是 best，加 the。' },
  { id: 'g09f12', grammarId: 'G09', sentence: 'He is ____ (fast) runner.', options: ['fastest', 'the fastest', 'faster'], answer: 'the fastest', explanation: '短形容词加 -est，加 the。' },
  { id: 'g09f13', grammarId: 'G09', sentence: 'This is ____ (difficult) exam.', options: ['most difficult', 'the most difficult', 'more difficult'], answer: 'the most difficult', explanation: '长形容词用 most + 原形，加 the。' },
  { id: 'g09f14', grammarId: 'G09', sentence: 'She is ____ (pretty) of the three.', options: ['prettiest', 'the prettiest', 'prettier'], answer: 'the prettiest', explanation: 'pretty 变 y 为 i 加 -est，加 the。' },
  { id: 'g09f15', grammarId: 'G09', sentence: 'This is ____ (old) building.', options: ['oldest', 'the oldest', 'older'], answer: 'the oldest', explanation: '短形容词加 -est，加 the。' },
  { id: 'g09f16', grammarId: 'G09', sentence: 'He is ____ (far) I have ever run.', options: ['farthest', 'the farthest', 'farther'], answer: 'the farthest', explanation: 'far 的最高级是 farthest（或 furthest），最高级前加 the。' },
  { id: 'g09f17', grammarId: 'G09', sentence: 'This is ____ (easy) question.', options: ['easiest', 'the easiest', 'easier'], answer: 'the easiest', explanation: 'easy 变 y 为 i 加 -est，加 the。' },
  { id: 'g09f18', grammarId: 'G09', sentence: 'She is ____ (famous) singer.', options: ['most famous', 'the most famous', 'more famous'], answer: 'the most famous', explanation: '长形容词用 most + 原形，加 the。' },
  { id: 'g09f19', grammarId: 'G09', sentence: 'This is ____ (big) city in China.', options: ['biggest', 'the biggest', 'bigger'], answer: 'the biggest', explanation: '重读闭音节双写末尾辅音加 -est。' },
  { id: 'g09f20', grammarId: 'G09', sentence: 'He is ____ (early) bird.', options: ['earliest', 'the earliest', 'earlier'], answer: 'the earliest', explanation: '以 y 结尾变 i 加 -est。' },
  { id: 'g09f21', grammarId: 'G09', sentence: 'This is ____ (nice) day.', options: ['nicest', 'the nicest', 'nicer'], answer: 'the nicest', explanation: '以 e 结尾加 -st。' },
  { id: 'g09f22', grammarId: 'G09', sentence: 'She is ____ (busy) person.', options: ['busiest', 'the busiest', 'busier'], answer: 'the busiest', explanation: 'busy 变 y 为 i 加 -est。' },
  { id: 'g09f23', grammarId: 'G09', sentence: 'This is ____ (dangerous) sport.', options: ['most dangerous', 'the most dangerous', 'more dangerous'], answer: 'the most dangerous', explanation: '长形容词用 most + 原形。' },
  { id: 'g09f24', grammarId: 'G09', sentence: 'He is ____ (tall) of all.', options: ['tallest', 'the tallest', 'taller'], answer: 'the tallest', explanation: '最高级加 the。' },
  { id: 'g09f25', grammarId: 'G09', sentence: 'This is ____ (cheap) hotel.', options: ['cheapest', 'the cheapest', 'cheaper'], answer: 'the cheapest', explanation: '短形容词加 -est。' },
  { id: 'g09f26', grammarId: 'G09', sentence: 'She is ____ (beautiful) girl.', options: ['most beautiful', 'the most beautiful', 'more beautiful'], answer: 'the most beautiful', explanation: '长形容词用 most + 原形。' },
  { id: 'g09f27', grammarId: 'G09', sentence: 'This is ____ (bad) weather.', options: ['worst', 'the worst', 'worse'], answer: 'the worst', explanation: 'bad 的最高级是 worst。' },
  { id: 'g09f28', grammarId: 'G09', sentence: 'He is ____ (smart) student.', options: ['smartest', 'the smartest', 'smarter'], answer: 'the smartest', explanation: '短形容词加 -est。' },
  { id: 'g09f29', grammarId: 'G09', sentence: 'This is ____ (good) movie.', options: ['best', 'the best', 'better'], answer: 'the best', explanation: 'good 的最高级是 best。' },
  { id: 'g09f30', grammarId: 'G09', sentence: 'She is ____ (happy) child.', options: ['happiest', 'the happiest', 'happier'], answer: 'the happiest', explanation: 'happy 变 y 为 i 加 -est。' },
];

export const g09Choice: GrammarChoiceQuestion[] = [
  { id: 'g09c01', grammarId: 'G09', question: 'Which is correct?', options: ['He is tallest.', 'He is the tallest.', 'He is tallert.'], answer: 'He is the tallest.', explanation: '最高级前要加 the。' },
  { id: 'g09c02', grammarId: 'G09', question: 'Choose the correct superlative:', options: ['the most beautiful', 'most beautiful', 'beautifulest'], answer: 'the most beautiful', explanation: '长形容词用 most + 原形。' },
  { id: 'g09c03', grammarId: 'G09', question: 'Which is correct?', options: ['She is best.', 'She is the best.', 'She is better.'], answer: 'She is the best.', explanation: 'good 的最高级是 best，加 the。' },
  { id: 'g09c04', grammarId: 'G09', question: 'Choose the correct sentence:', options: ['This is most expensive.', 'This is the most expensive.', 'This is expensivest.'], answer: 'This is the most expensive.', explanation: '长形容词用 most + 原形，加 the。' },
  { id: 'g09c05', grammarId: 'G09', question: 'Which is correct?', options: ['He is badest.', 'He is the worst.', 'He is badder.'], answer: 'He is the worst.', explanation: 'bad 的最高级是 worst。' },
  { id: 'g09c06', grammarId: 'G09', question: 'Choose the superlative:', options: ['the smartest', 'smartest', 'smart'], answer: 'the smartest', explanation: '短形容词加 -est，加 the。' },
  { id: 'g09c07', grammarId: 'G09', question: 'Which is correct?', options: ['She is happiest.', 'She is the happiest.', 'She is happier.'], answer: 'She is the happiest.', explanation: 'happy 变 y 为 i 加 -est。' },
  { id: 'g09c08', grammarId: 'G09', question: 'Choose the correct sentence:', options: ['This is most interesting.', 'This is the most interesting.', 'This is interestingest.'], answer: 'This is the most interesting.', explanation: '长形容词用 most + 原形。' },
  { id: 'g09c09', grammarId: 'G09', question: 'Which is correct?', options: ['He is younggest.', 'He is the youngest.', 'He is youngger.'], answer: 'He is the youngest.', explanation: 'young 的最高级是 youngest。' },
  { id: 'g09c10', grammarId: 'G09', question: 'Choose the superlative:', options: ['the biggest', 'biggest', 'big'], answer: 'the biggest', explanation: '重读闭音节双写末尾辅音加 -est。' },
];

export const g09Correction: GrammarCorrectionQuestion[] = [
  { id: 'g09x01', grammarId: 'G09', sentence: 'He is tallest in the class.', answer: 'He is the tallest in the class.', explanation: '最高级前要加 the。' },
  { id: 'g09x02', grammarId: 'G09', sentence: 'This is most beautiful picture.', answer: 'This is the most beautiful picture.', explanation: '最高级前要加 the。' },
  { id: 'g09x03', grammarId: 'G09', sentence: 'She is best student.', answer: 'She is the best student.', explanation: 'good 的最高级是 best，加 the。' },
  { id: 'g09x04', grammarId: 'G09', sentence: 'This is most expensive car.', answer: 'This is the most expensive car.', explanation: '长形容词用 most + 原形，加 the。' },
  { id: 'g09x05', grammarId: 'G09', sentence: 'He is badest player.', answer: 'He is the worst player.', explanation: 'bad 的最高级是 worst。' },
  { id: 'g09x06', grammarId: 'G09', sentence: 'She is younggest in the team.', answer: 'She is the youngest in the team.', explanation: 'young 的最高级是 youngest。' },
  { id: 'g09x07', grammarId: 'G09', sentence: 'This is goodest restaurant.', answer: 'This is the best restaurant.', explanation: 'good 的最高级是 best。' },
  { id: 'g09x08', grammarId: 'G09', sentence: 'He is fast runner.', answer: 'He is the fastest runner.', explanation: 'fast 的最高级是 fastest。' },
  { id: 'g09x09', grammarId: 'G09', sentence: 'This is most difficult exam.', answer: 'This is the most difficult exam.', explanation: '长形容词用 most + 原形。' },
  { id: 'g09x10', grammarId: 'G09', sentence: 'She is prettiest of all.', answer: 'She is the prettiest of all.', explanation: '最高级前要加 the。' },
];


// ========= G10: 冠词 a/an/the =========
export const grammarG10: GrammarPoint = {
  id: 'G10',
  name: 'Articles: a/an/the',
  nameZh: '冠词 a/an/the',
  explanation: '冠词用在名词前，帮助说明名词的特指或泛指。\n\n【a/an】泛指"一个"，用于可数名词单数。\na：用在辅音音素开头的单词前：a book, a university（u 发 /j/，辅音）\nan：用在元音音素开头的单词前：an apple, an hour（h 不发音）\n\n【the】特指，用于：\n· 双方都知道的人或物：Close the door, please.\n· 世界上独一无二的事物：the sun, the moon\n· 再次提到的人或物：I saw a dog. The dog was brown.',
  examples: [
    { en: 'I saw a cat and a dog. The dog was very friendly.', zh: '我看见一只猫和一只狗。那只狗很友好。' },
    { en: 'She is an honest girl.', zh: '她是一个诚实的女孩。（h不发音）' },
    { en: 'The Earth goes around the Sun.', zh: '地球绕着太阳转。' },
  ],
};

export const g10Fill: GrammarFillQuestion[] = [
  { id: 'g10f01', grammarId: 'G10', sentence: 'I have ____ apple in my bag.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'apple 以元音音素 /æ/ 开头，用 an。' },
  { id: 'g10f02', grammarId: 'G10', sentence: 'She is ____ honest girl.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'honest 中 h 不发音，以元音 /ɒ/ 开头，用 an。' },
  { id: 'g10f03', grammarId: 'G10', sentence: 'Please close ____ door.', options: ['a', 'an', 'the'], answer: 'the', explanation: '双方都知道的 door，用 the 特指。' },
  { id: 'g10f04', grammarId: 'G10', sentence: 'I want to be ____ astronaut.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'astronaut 以元音音素 /æ/ 开头，用 an。' },
  { id: 'g10f05', grammarId: 'G10', sentence: '____ sun rises in the east.', options: ['A', 'An', 'The'], answer: 'The', explanation: '世界上独一无二的事物用 the。' },
  { id: 'g10f06', grammarId: 'G10', sentence: 'I saw ____ movie last night. ____ movie was great.', options: ['a / The', 'an / A', 'the / A'], answer: 'a / The', explanation: '第一次提到用 a，再次提到用 the。' },
  { id: 'g10f07', grammarId: 'G10', sentence: 'He has ____ university degree.', options: ['a', 'an', 'the'], answer: 'a', explanation: 'university 中 u 发 /j/（辅音音素），用 a。' },
  { id: 'g10f08', grammarId: 'G10', sentence: 'My brother is in ____ kitchen.', options: ['a', 'an', 'the'], answer: 'the', explanation: '特指某个 kitchen（家里的厨房），用 the。' },
  { id: 'g10f09', grammarId: 'G10', sentence: 'There is ____ umbrella in the corner.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'umbrella 以元音音素 /ʌ/ 开头，用 an。' },
  { id: 'g10f10', grammarId: 'G10', sentence: 'I have ____ cat and ____ dog.', options: ['a / a', 'an / a', 'the / the'], answer: 'a / a', explanation: '泛指"一只猫和一只狗"，都用 a。' },
  { id: 'g10f11', grammarId: 'G10', sentence: 'She is ____ teacher.', options: ['a', 'an', 'the'], answer: 'a', explanation: 'teacher 以辅音音素 /t/ 开头，用 a。' },
  { id: 'g10f12', grammarId: 'G10', sentence: 'I found ____ old book.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'old 以元音音素 /əʊ/ 开头，用 an。' },
  { id: 'g10f13', grammarId: 'G10', sentence: '____ moon is very bright.', options: ['A', 'An', 'The'], answer: 'The', explanation: '世界上独一无二的事物用 the。' },
  { id: 'g10f14', grammarId: 'G10', sentence: 'He is ____ engineer.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'engineer 以元音音素 /e/ 开头，用 an。' },
  { id: 'g10f15', grammarId: 'G10', sentence: 'I saw ____ movie. ____ movie was boring.', options: ['a / The', 'an / A', 'the / The'], answer: 'a / The', explanation: '第一次提到用 a，再次提到用 the。' },
  { id: 'g10f16', grammarId: 'G10', sentence: 'She has ____ cat.', options: ['a', 'an', 'the'], answer: 'a', explanation: 'cat 以辅音音素 /k/ 开头，用 a。' },
  { id: 'g10f17', grammarId: 'G10', sentence: 'I want to be ____ actor.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'actor 以元音音素 /æ/ 开头，用 an。' },
  { id: 'g10f18', grammarId: 'G10', sentence: 'We went to ____ school.', options: ['a', 'an', 'the', 'NO_ARTICLE'], answer: 'NO_ARTICLE', explanation: 'go to school（上学）是固定搭配，不需要冠词。' },
  { id: 'g10f19', grammarId: 'G10', sentence: 'I am in ____ hospital.', options: ['a', 'an', 'the', 'NO_ARTICLE'], answer: 'NO_ARTICLE', explanation: 'in hospital（住院）是固定搭配，不需要冠词。' },
  { id: 'g10f20', grammarId: 'G10', sentence: 'She is ____ honest person.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'honest 中 h 不发音，用 an。' },
  { id: 'g10f21', grammarId: 'G10', sentence: 'I have ____ idea.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'idea 以元音音素 /aɪ/ 开头，用 an。' },
  { id: 'g10f22', grammarId: 'G10', sentence: 'He is in ____ kitchen.', options: ['a', 'an', 'the'], answer: 'the', explanation: '特指家里的厨房，用 the。' },
  { id: 'g10f23', grammarId: 'G10', sentence: 'I saw ____ elephant.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'elephant 以元音音素 /e/ 开头，用 an。' },
  { id: 'g10f24', grammarId: 'G10', sentence: 'She goes to ____ school every day.', options: ['a', 'an', 'the', 'NO_ARTICLE'], answer: 'NO_ARTICLE', explanation: 'go to school（上学）是固定搭配。' },
  { id: 'g10f25', grammarId: 'G10', sentence: 'I want to buy ____ new phone.', options: ['a', 'an', 'the'], answer: 'a', explanation: 'phone 以辅音音素 /f/ 开头，用 a。' },
  { id: 'g10f26', grammarId: 'G10', sentence: 'He is ____ university student.', options: ['a', 'an', 'the'], answer: 'a', explanation: 'university 中 u 发 /j/（辅音音素），用 a。' },
  { id: 'g10f27', grammarId: 'G10', sentence: 'I saw ____ interesting film.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'interesting 以元音音素 /ɪ/ 开头，用 an。' },
  { id: 'g10f28', grammarId: 'G10', sentence: 'She is ____ best student.', options: ['a', 'an', 'the'], answer: 'the', explanation: '最高级前用 the。' },
  { id: 'g10f29', grammarId: 'G10', sentence: 'I live in ____ United States.', options: ['a', 'an', 'the'], answer: 'the', explanation: '国家名中有 United，用 the。' },
  { id: 'g10f30', grammarId: 'G10', sentence: 'He is ____ honest man.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'honest 中 h 不发音，用 an。' },
];

export const g10Choice: GrammarChoiceQuestion[] = [
  { id: 'g10c01', grammarId: 'G10', question: 'Which is correct?', options: ['I have a apple.', 'I have an apple.', 'I have the apple.'], answer: 'I have an apple.', explanation: 'apple 以元音音素开头，用 an。' },
  { id: 'g10c02', grammarId: 'G10', question: 'Choose the correct article:', options: ['a university', 'an university', 'the university'], answer: 'a university', explanation: 'university 中 u 发 /j/（辅音音素），用 a。' },
  { id: 'g10c03', grammarId: 'G10', question: '____ moon is very bright.', options: ['A', 'An', 'The'], answer: 'The', explanation: '世界上独一无二的事物用 the。' },
  { id: 'g10c04', grammarId: 'G10', question: 'She is ____ teacher.', options: ['a', 'an', 'the'], answer: 'a', explanation: 'teacher 以辅音音素 /t/ 开头，用 a。' },
  { id: 'g10c05', grammarId: 'G10', question: 'I found ____ old book.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'old 以元音音素 /əʊ/ 开头，用 an。' },
  { id: 'g10c06', grammarId: 'G10', question: 'Which is correct?', options: ['He is a honest boy.', 'He is an honest boy.', 'He is the honest boy.'], answer: 'He is an honest boy.', explanation: 'honest 中 h 不发音，用 an。' },
  { id: 'g10c07', grammarId: 'G10', question: 'Choose the correct sentence:', options: ['I saw a movie.', 'I saw an movie.', 'I saw the movie.'], answer: 'I saw a movie.', explanation: 'movie 以辅音音素 /m/ 开头，用 a。' },
  { id: 'g10c08', grammarId: 'G10', question: '____ sun is hot.', options: ['A', 'An', 'The'], answer: 'The', explanation: '世界上独一无二的事物用 the。' },
  { id: 'g10c09', grammarId: 'G10', question: 'She is ____ engineer.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'engineer 以元音音素 /e/ 开头，用 an。' },
  { id: 'g10c10', grammarId: 'G10', question: 'I want to be ____ astronaut.', options: ['a', 'an', 'the'], answer: 'an', explanation: 'astronaut 以元音音素 /æ/ 开头，用 an。' },
];

export const g10Correction: GrammarCorrectionQuestion[] = [
  { id: 'g10x01', grammarId: 'G10', sentence: 'I have a apple.', answer: 'I have an apple.', explanation: 'apple 以元音音素开头，应该用 an。' },
  { id: 'g10x02', grammarId: 'G10', sentence: 'She goes to a school every day.', answer: 'She goes to school every day.', explanation: 'go to school（上学）是固定搭配，不需要冠词。' },
  { id: 'g10x03', grammarId: 'G10', sentence: 'I saw a movie. A movie was boring.', answer: 'I saw a movie. The movie was boring.', explanation: '第二次提到同一部电影，用 the。' },
  { id: 'g10x04', grammarId: 'G10', sentence: 'He is a honest man.', answer: 'He is an honest man.', explanation: 'honest 中 h 不发音，用 an。' },
  { id: 'g10x05', grammarId: 'G10', sentence: 'I want to be a astronaut.', answer: 'I want to be an astronaut.', explanation: 'astronaut 以元音音素开头，用 an。' },
  { id: 'g10x06', grammarId: 'G10', sentence: 'I have an cat.', answer: 'I have a cat.', explanation: 'cat 以辅音音素 /k/ 开头，用 a。' },
  { id: 'g10x07', grammarId: 'G10', sentence: 'She is an teacher.', answer: 'She is a teacher.', explanation: 'teacher 以辅音音素 /t/ 开头，用 a。' },
  { id: 'g10x08', grammarId: 'G10', sentence: 'A sun is hot.', answer: 'The sun is hot.', explanation: '世界上独一无二的事物用 the。' },
  { id: 'g10x09', grammarId: 'G10', sentence: 'I saw an movie.', answer: 'I saw a movie.', explanation: 'movie 以辅音音素 /m/ 开头，用 a。' },
  { id: 'g10x10', grammarId: 'G10', sentence: 'He is an university student.', answer: 'He is a university student.', explanation: 'university 中 u 发 /j/（辅音音素），用 a。' },
];


// ========= G11: 代词 =========
export const grammarG11: GrammarPoint = {
  id: 'G11',
  name: 'Pronouns',
  nameZh: '代词',
  explanation: '代词用来代替名词，避免重复。\n\n【人称代词】\n· 主格（作主语）：I, you, he, she, it, we, they\n· 宾格（作宾语）：me, you, him, her, it, us, them\n\n【物主代词】\n· 形容词性：my, your, his, her, its, our, their\n· 名词性：mine, yours, his, hers, its, ours, theirs\n\n【反身代词】myself, yourself, himself...',
  examples: [
    { en: 'She gave me a present.', zh: '她给了我一份礼物。' },
    { en: 'This book is mine.', zh: '这本书是我的。' },
    { en: 'He did it himself.', zh: '他自己做了这件事。' },
  ],
};

export const g11Fill: GrammarFillQuestion[] = [
  { id: 'g11f01', grammarId: 'G11', sentence: 'She gave ____ (I) a present.', options: ['I', 'me', 'my'], answer: 'me', explanation: '动词后用人称代词宾格 me。' },
  { id: 'g11f02', grammarId: 'G11', sentence: 'This book is ____ (I).', options: ['my', 'mine', 'me'], answer: 'mine', explanation: '名词性物主代词 mine = my book。' },
  { id: 'g11f03', grammarId: 'G11', sentence: 'He did it ____ (him).', options: ['him', 'himself', 'his'], answer: 'himself', explanation: '反身代词表示"他自己"。' },
  { id: 'g11f04', grammarId: 'G11', sentence: '____ (we) are going to school.', options: ['We', 'Us', 'Our'], answer: 'We', explanation: '主格 we 作主语。' },
  { id: 'g11f05', grammarId: 'G11', sentence: 'She loves ____ (he).', options: ['he', 'him', 'his'], answer: 'him', explanation: '动词后用人称代词宾格 him。' },
  { id: 'g11f06', grammarId: 'G11', sentence: 'This is ____ (we) house.', options: ['we', 'us', 'our'], answer: 'our', explanation: '形容词性物主代词 our 修饰 house。' },
  { id: 'g11f07', grammarId: 'G11', sentence: 'I did it ____ (my).', options: ['my', 'mine', 'myself'], answer: 'myself', explanation: '反身代词 myself 表示"我自己"。' },
  { id: 'g11f08', grammarId: 'G11', sentence: 'They helped ____ (we).', options: ['we', 'us', 'our'], answer: 'us', explanation: '动词后用人称代词宾格 us。' },
  { id: 'g11f09', grammarId: 'G11', sentence: 'This pen is ____ (she).', options: ['she', 'her', 'hers'], answer: 'hers', explanation: '名词性物主代词 hers = her pen。' },
  { id: 'g11f10', grammarId: 'G11', sentence: '____ (they) like music.', options: ['They', 'Them', 'Their'], answer: 'They', explanation: '主格 they 作主语。' },
  { id: 'g11f11', grammarId: 'G11', sentence: 'I saw ____ (she) yesterday.', options: ['she', 'her', 'hers'], answer: 'her', explanation: '动词后用人称代词宾格 her。' },
  { id: 'g11f12', grammarId: 'G11', sentence: 'This is ____ (they) dog.', options: ['they', 'them', 'their'], answer: 'their', explanation: '形容词性物主代词 their 修饰 dog。' },
  { id: 'g11f13', grammarId: 'G11', sentence: 'You should do it ____ (you).', options: ['you', 'your', 'yourself'], answer: 'yourself', explanation: '反身代词 yourself 表示"你自己"。' },
  { id: 'g11f14', grammarId: 'G11', sentence: 'He told ____ (I) a story.', options: ['I', 'me', 'my'], answer: 'me', explanation: '动词后用人称代词宾格 me。' },
  { id: 'g11f15', grammarId: 'G11', sentence: 'This bike is ____ (I).', options: ['my', 'mine', 'me'], answer: 'mine', explanation: '名词性物主代词 mine = my bike。' },
  { id: 'g11f16', grammarId: 'G11', sentence: 'She made it ____ (she).', options: ['she', 'her', 'herself'], answer: 'herself', explanation: '反身代词 herself 表示"她自己"。' },
  { id: 'g11f17', grammarId: 'G11', sentence: '____ (he) is my teacher.', options: ['He', 'Him', 'His'], answer: 'He', explanation: '主格 he 作主语。' },
  { id: 'g11f18', grammarId: 'G11', sentence: 'I will call ____ (they).', options: ['they', 'them', 'their'], answer: 'them', explanation: '动词后用人称代词宾格 them。' },
  { id: 'g11f19', grammarId: 'G11', sentence: 'This is ____ (he) book.', options: ['he', 'him', 'his'], answer: 'his', explanation: '形容词性物主代词 his 修饰 book。' },
  { id: 'g11f20', grammarId: 'G11', sentence: 'We enjoyed ____ (we) at the party.', options: ['we', 'us', 'ourselves'], answer: 'ourselves', explanation: '反身代词 ourselves 表示"我们自己"。' },
  { id: 'g11f21', grammarId: 'G11', sentence: 'Please pass ____ (I) the salt.', options: ['I', 'me', 'my'], answer: 'me', explanation: '动词后用人称代词宾格 me。' },
  { id: 'g11f22', grammarId: 'G11', sentence: 'This bag is ____ (she).', options: ['she', 'her', 'hers'], answer: 'hers', explanation: '名词性物主代词 hers = her bag。' },
  { id: 'g11f23', grammarId: 'G11', sentence: 'They did it ____ (they).', options: ['they', 'them', 'themselves'], answer: 'themselves', explanation: '反身代词 themselves 表示"他们自己"。' },
  { id: 'g11f24', grammarId: 'G11', sentence: 'I know ____ (she).', options: ['she', 'her', 'hers'], answer: 'her', explanation: '动词后用人称代词宾格 her。' },
  { id: 'g11f25', grammarId: 'G11', sentence: 'This is ____ (we) classroom.', options: ['we', 'us', 'our'], answer: 'our', explanation: '形容词性物主代词 our 修饰 classroom。' },
  { id: 'g11f26', grammarId: 'G11', sentence: 'He can help ____ (you).', options: ['you', 'your', 'yourself'], answer: 'you', explanation: '动词后用人称代词宾格 you（主宾同形）。' },
  { id: 'g11f27', grammarId: 'G11', sentence: 'That car is ____ (they).', options: ['they', 'them', 'theirs'], answer: 'theirs', explanation: '名词性物主代词 theirs = their car。' },
  { id: 'g11f28', grammarId: 'G11', sentence: 'I taught ____ (I) to cook.', options: ['I', 'me', 'myself'], answer: 'myself', explanation: '反身代词 myself 表示"我自己"。' },
  { id: 'g11f29', grammarId: 'G11', sentence: 'She will visit ____ (we) tomorrow.', options: ['we', 'us', 'our'], answer: 'us', explanation: '动词后用人称代词宾格 us。' },
  { id: 'g11f30', grammarId: 'G11', sentence: 'This is ____ (I) seat.', options: ['my', 'mine', 'me'], answer: 'my', explanation: '形容词性物主代词 my 修饰 seat。' },
];

export const g11Choice: GrammarChoiceQuestion[] = [
  { id: 'g11c01', grammarId: 'G11', question: 'Which is correct?', options: ['She gave I a book.', 'She gave me a book.', 'She gave my a book.'], answer: 'She gave me a book.', explanation: '动词后用人称代词宾格 me。' },
  { id: 'g11c02', grammarId: 'G11', question: 'Choose the correct sentence:', options: ['This book is my.', 'This book is mine.', 'This book is I.'], answer: 'This book is mine.', explanation: '名词性物主代词 mine = my book。' },
  { id: 'g11c03', grammarId: 'G11', question: 'Which is correct?', options: ['He did it himself.', 'He did it his.', 'He did it themselves.'], answer: 'He did it himself.', explanation: '反身代词 himself 表示"他自己"。' },
  { id: 'g11c04', grammarId: 'G11', question: 'Choose the correct sentence:', options: ['Her is my sister.', 'She is my sister.', 'Hers is my sister.'], answer: 'She is my sister.', explanation: '主格 she 作主语。' },
  { id: 'g11c05', grammarId: 'G11', question: 'Which is correct?', options: ['This is their house.', 'This is theirs house.', 'This is them house.'], answer: 'This is their house.', explanation: '形容词性物主代词 their 修饰 house。' },
  { id: 'g11c06', grammarId: 'G11', question: 'Choose the correct sentence:', options: ['I saw he.', 'I saw him.', 'I saw his.'], answer: 'I saw him.', explanation: '动词后用人称代词宾格 him。' },
  { id: 'g11c07', grammarId: 'G11', question: 'Which is correct?', options: ['This pen is her.', 'This pen is hers.', 'This pen is she.'], answer: 'This pen is hers.', explanation: '名词性物主代词 hers = her pen。' },
  { id: 'g11c08', grammarId: 'G11', question: 'Choose the correct sentence:', options: ['We enjoyed us.', 'We enjoyed ourselves.', 'We enjoyed our.'], answer: 'We enjoyed ourselves.', explanation: '反身代词 ourselves 表示"我们自己"。' },
  { id: 'g11c09', grammarId: 'G11', question: 'Which is correct?', options: ['They helped we.', 'They helped us.', 'They helped our.'], answer: 'They helped us.', explanation: '动词后用人称代词宾格 us。' },
  { id: 'g11c10', grammarId: 'G11', question: 'Choose the correct sentence:', options: ['This is my bike.', 'This is mine bike.', 'This is me bike.'], answer: 'This is my bike.', explanation: '形容词性物主代词 my 修饰 bike。' },
];

export const g11Correction: GrammarCorrectionQuestion[] = [
  { id: 'g11x01', grammarId: 'G11', sentence: 'She gave I a present.', answer: 'She gave me a present.', explanation: '动词后用人称代词宾格 me。' },
  { id: 'g11x02', grammarId: 'G11', sentence: 'This book is my.', answer: 'This book is mine.', explanation: '名词性物主代词 mine = my book。' },
  { id: 'g11x03', grammarId: 'G11', sentence: 'He did it his.', answer: 'He did it himself.', explanation: '反身代词 himself 表示"他自己"。' },
  { id: 'g11x04', grammarId: 'G11', sentence: 'Her is my teacher.', answer: 'She is my teacher.', explanation: '主格 she 作主语。' },
  { id: 'g11x05', grammarId: 'G11', sentence: 'This is theirs house.', answer: 'This is their house.', explanation: '形容词性物主代词 their 修饰 house。' },
  { id: 'g11x06', grammarId: 'G11', sentence: 'I saw he yesterday.', answer: 'I saw him yesterday.', explanation: '动词后用人称代词宾格 him。' },
  { id: 'g11x07', grammarId: 'G11', sentence: 'This pen is her.', answer: 'This pen is hers.', explanation: '名词性物主代词 hers = her pen。' },
  { id: 'g11x08', grammarId: 'G11', sentence: 'We enjoyed our at the party.', answer: 'We enjoyed ourselves at the party.', explanation: '反身代词 ourselves 表示"我们自己"。' },
  { id: 'g11x09', grammarId: 'G11', sentence: 'They helped we.', answer: 'They helped us.', explanation: '动词后用人称代词宾格 us。' },
  { id: 'g11x10', grammarId: 'G11', sentence: 'This is mine book.', answer: 'This is my book.', explanation: '形容词性物主代词 my 修饰 book。' },
];


// ========= G12: 介词（时间） =========
export const grammarG12: GrammarPoint = {
  id: 'G12',
  name: 'Prepositions of Time',
  nameZh: '介词（时间）',
  explanation: '时间介词 in, on, at 的用法。\n\n【in】用于较长的时间\n· 年、月、季节：in 2023, in July, in summer\n· 一天中的时段：in the morning/afternoon/evening\n\n【on】用于具体的某天\n· 星期、日期：on Monday, on May 1st\n· 具体某天的早晚：on Monday morning\n\n【at】用于具体的时间点\n· 钟点：at 8 o\'clock, at noon, at night',
  examples: [
    { en: 'I was born in 2010.', zh: '我出生于2010年。' },
    { en: 'We have a meeting on Monday.', zh: '我们周一有个会议。' },
    { en: 'She gets up at 7 am.', zh: '她早上7点起床。' },
  ],
};

export const g12Fill: GrammarFillQuestion[] = [
  { id: 'g12f01', grammarId: 'G12', sentence: 'I was born ____ 2010.', options: ['in', 'on', 'at'], answer: 'in', explanation: '年份前用 in。' },
  { id: 'g12f02', grammarId: 'G12', sentence: 'We have a meeting ____ Monday.', options: ['in', 'on', 'at'], answer: 'on', explanation: '星期前用 on。' },
  { id: 'g12f03', grammarId: 'G12', sentence: 'She gets up ____ 7 am.', options: ['in', 'on', 'at'], answer: 'at', explanation: '钟点前用 at。' },
  { id: 'g12f04', grammarId: 'G12', sentence: 'I go on holiday ____ summer.', options: ['in', 'on', 'at'], answer: 'in', explanation: '季节前用 in。' },
  { id: 'g12f05', grammarId: 'G12', sentence: 'The party is ____ May 1st.', options: ['in', 'on', 'at'], answer: 'on', explanation: '具体日期前用 on。' },
  { id: 'g12f06', grammarId: 'G12', sentence: 'I have a class ____ the morning.', options: ['in', 'on', 'at'], answer: 'in', explanation: 'in the morning 是固定搭配。' },
  { id: 'g12f07', grammarId: 'G12', sentence: 'Let\'s meet ____ noon.', options: ['in', 'on', 'at'], answer: 'at', explanation: 'noon 前用 at。' },
  { id: 'g12f08', grammarId: 'G12', sentence: 'He was born ____ July.', options: ['in', 'on', 'at'], answer: 'in', explanation: '月份前用 in。' },
  { id: 'g12f09', grammarId: 'G12', sentence: 'We have a test ____ Monday morning.', options: ['in', 'on', 'at'], answer: 'on', explanation: '具体某天的早上用 on。' },
  { id: 'g12f10', grammarId: 'G12', sentence: 'The shop opens ____ 9 o\'clock.', options: ['in', 'on', 'at'], answer: 'at', explanation: '钟点前用 at。' },
  { id: 'g12f11', grammarId: 'G12', sentence: 'I visited her ____ 2022.', options: ['in', 'on', 'at'], answer: 'in', explanation: '年份前用 in。' },
  { id: 'g12f12', grammarId: 'G12', sentence: 'The concert is ____ Saturday.', options: ['in', 'on', 'at'], answer: 'on', explanation: '星期前用 on。' },
  { id: 'g12f13', grammarId: 'G12', sentence: 'I go to bed ____ 10 pm.', options: ['in', 'on', 'at'], answer: 'at', explanation: '钟点前用 at。' },
  { id: 'g12f14', grammarId: 'G12', sentence: 'Leaves fall ____ autumn.', options: ['in', 'on', 'at'], answer: 'in', explanation: '季节前用 in。' },
  { id: 'g12f15', grammarId: 'G12', sentence: 'My birthday is ____ January 15th.', options: ['in', 'on', 'at'], answer: 'on', explanation: '具体日期前用 on。' },
  { id: 'g12f16', grammarId: 'G12', sentence: 'I study ____ the evening.', options: ['in', 'on', 'at'], answer: 'in', explanation: 'in the evening 是固定搭配。' },
  { id: 'g12f17', grammarId: 'G12', sentence: 'The train leaves ____ 8:30.', options: ['in', 'on', 'at'], answer: 'at', explanation: '钟点前用 at。' },
  { id: 'g12f18', grammarId: 'G12', sentence: 'We have no school ____ Sunday.', options: ['in', 'on', 'at'], answer: 'on', explanation: '星期前用 on。' },
  { id: 'g12f19', grammarId: 'G12', sentence: 'He was born ____ winter.', options: ['in', 'on', 'at'], answer: 'in', explanation: '季节前用 in。' },
  { id: 'g12f20', grammarId: 'G12', sentence: 'I have an appointment ____ 3 pm.', options: ['in', 'on', 'at'], answer: 'at', explanation: '钟点前用 at。' },
  { id: 'g12f21', grammarId: 'G12', sentence: 'The war started ____ 1999.', options: ['in', 'on', 'at'], answer: 'in', explanation: '年份前用 in。' },
  { id: 'g12f22', grammarId: 'G12', sentence: 'I always feel tired ____ Monday.', options: ['in', 'on', 'at'], answer: 'on', explanation: '星期前用 on。' },
  { id: 'g12f23', grammarId: 'G12', sentence: "She doesn't work ____ night.", options: ['in', 'on', 'at'], answer: 'at', explanation: 'at night 是固定搭配。' },
  { id: 'g12f24', grammarId: 'G12', sentence: 'We have a holiday ____ Christmas.', options: ['in', 'on', 'at'], answer: 'on', explanation: '具体日期前用 on。' },
  { id: 'g12f25', grammarId: 'G12', sentence: 'I wake up ____ 6 every day.', options: ['in', 'on', 'at'], answer: 'at', explanation: '钟点前用 at。' },
  { id: 'g12f26', grammarId: 'G12', sentence: 'She was born ____ March.', options: ['in', 'on', 'at'], answer: 'in', explanation: '月份前用 in。' },
  { id: 'g12f27', grammarId: 'G12', sentence: 'The exam is ____ Friday morning.', options: ['in', 'on', 'at'], answer: 'on', explanation: '具体某天的早上用 on。' },
  { id: 'g12f28', grammarId: 'G12', sentence: 'I have lunch ____ noon.', options: ['in', 'on', 'at'], answer: 'at', explanation: 'noon 前用 at。' },
  { id: 'g12f29', grammarId: 'G12', sentence: 'They got married ____ 2020.', options: ['in', 'on', 'at'], answer: 'in', explanation: '年份前用 in。' },
  { id: 'g12f30', grammarId: 'G12', sentence: 'I will see you ____ the weekend.', options: ['in', 'on', 'at'], answer: 'at', explanation: 'at the weekend 是固定搭配（英式）。' },
];

export const g12Choice: GrammarChoiceQuestion[] = [
  { id: 'g12c01', grammarId: 'G12', question: 'Which is correct?', options: ['I was born in 2010.', 'I was born on 2010.', 'I was born at 2010.'], answer: 'I was born in 2010.', explanation: '年份前用 in。' },
  { id: 'g12c02', grammarId: 'G12', question: 'Choose the correct sentence:', options: ['We have a meeting at Monday.', 'We have a meeting in Monday.', 'We have a meeting on Monday.'], answer: 'We have a meeting on Monday.', explanation: '星期前用 on。' },
  { id: 'g12c03', grammarId: 'G12', question: 'Which is correct?', options: ['She gets up in 7 am.', 'She gets up on 7 am.', 'She gets up at 7 am.'], answer: 'She gets up at 7 am.', explanation: '钟点前用 at。' },
  { id: 'g12c04', grammarId: 'G12', question: 'Choose the correct sentence:', options: ['I go on holiday in summer.', 'I go on holiday at summer.', 'I go on holiday on summer.'], answer: 'I go on holiday in summer.', explanation: '季节前用 in。' },
  { id: 'g12c05', grammarId: 'G12', question: 'Which is correct?', options: ['The party is in May 1st.', 'The party is on May 1st.', 'The party is at May 1st.'], answer: 'The party is on May 1st.', explanation: '具体日期前用 on。' },
  { id: 'g12c06', grammarId: 'G12', question: 'Choose the correct sentence:', options: ['I have a class in the morning.', 'I have a class on the morning.', 'I have a class at the morning.'], answer: 'I have a class in the morning.', explanation: 'in the morning 是固定搭配。' },
  { id: 'g12c07', grammarId: 'G12', question: 'Which is correct?', options: ['Let\'s meet in noon.', 'Let\'s meet on noon.', 'Let\'s meet at noon.'], answer: 'Let\'s meet at noon.', explanation: 'noon 前用 at。' },
  { id: 'g12c08', grammarId: 'G12', question: 'Choose the correct sentence:', options: ['He was born in July.', 'He was born on July.', 'He was born at July.'], answer: 'He was born in July.', explanation: '月份前用 in。' },
  { id: 'g12c09', grammarId: 'G12', question: 'Which is correct?', options: ['We have a test in Monday morning.', 'We have a test on Monday morning.', 'We have a test at Monday morning.'], answer: 'We have a test on Monday morning.', explanation: '具体某天的早上用 on。' },
  { id: 'g12c10', grammarId: 'G12', question: 'Choose the correct sentence:', options: ['The shop opens in 9 o\'clock.', 'The shop opens on 9 o\'clock.', 'The shop opens at 9 o\'clock.'], answer: 'The shop opens at 9 o\'clock.', explanation: '钟点前用 at。' },
];

export const g12Correction: GrammarCorrectionQuestion[] = [
  { id: 'g12x01', grammarId: 'G12', sentence: 'I was born on 2010.', answer: 'I was born in 2010.', explanation: '年份前用 in，不用 on。' },
  { id: 'g12x02', grammarId: 'G12', sentence: 'We have a meeting at Monday.', answer: 'We have a meeting on Monday.', explanation: '星期前用 on，不用 at。' },
  { id: 'g12x03', grammarId: 'G12', sentence: 'She gets up in 7 am.', answer: 'She gets up at 7 am.', explanation: '钟点前用 at，不用 in。' },
  { id: 'g12x04', grammarId: 'G12', sentence: 'I go on holiday at summer.', answer: 'I go on holiday in summer.', explanation: '季节前用 in，不用 at。' },
  { id: 'g12x05', grammarId: 'G12', sentence: 'The party is in May 1st.', answer: 'The party is on May 1st.', explanation: '具体日期前用 on，不用 in。' },
  { id: 'g12x06', grammarId: 'G12', sentence: 'I have a class at the morning.', answer: 'I have a class in the morning.', explanation: 'in the morning 是固定搭配，不用 at。' },
  { id: 'g12x07', grammarId: 'G12', sentence: 'Let\'s meet on noon.', answer: 'Let\'s meet at noon.', explanation: 'noon 前用 at，不用 on。' },
  { id: 'g12x08', grammarId: 'G12', sentence: 'He was born on July.', answer: 'He was born in July.', explanation: '月份前用 in，不用 on。' },
  { id: 'g12x09', grammarId: 'G12', sentence: 'We have a test in Monday morning.', answer: 'We have a test on Monday morning.', explanation: '具体某天的早上用 on，不用 in。' },
  { id: 'g12x10', grammarId: 'G12', sentence: 'The shop opens in 9 o\'clock.', answer: 'The shop opens at 9 o\'clock.', explanation: '钟点前用 at，不用 in。' },
];


// ========= G13: 介词（地点/方向） =========
export const grammarG13: GrammarPoint = {
  id: 'G13',
  name: 'Prepositions of Place',
  nameZh: '介词（地点/方向）',
  explanation: '地点和方向介词的用法。\n\n【in】在...里面：in the box, in the room\n【on】在...上面（接触表面）：on the table, on the wall\n【at】在某地点（小地点）：at home, at school, at the bus stop\n\n【方向介词】\n· to：去...（方向）：go to school\n· from：从...（来源）：I come from China\n· through：穿过（立体）：walk through the tunnel',
  examples: [
    { en: 'The cat is on the table.', zh: '猫在桌子上。' },
    { en: 'I live in Beijing.', zh: '我住在北京。' },
    { en: 'She is at the library.', zh: '她在图书馆。' },
  ],
};

export const g13Fill: GrammarFillQuestion[] = [
  { id: 'g13f01', grammarId: 'G13', sentence: 'The cat is ____ the table.', options: ['in', 'on', 'at'], answer: 'on', explanation: 'on 表示在桌子表面上面。' },
  { id: 'g13f02', grammarId: 'G13', sentence: 'I live ____ Beijing.', options: ['in', 'on', 'at'], answer: 'in', explanation: '在大城市用 in。' },
  { id: 'g13f03', grammarId: 'G13', sentence: 'She is ____ home.', options: ['in', 'on', 'at'], answer: 'at', explanation: 'at home 是固定搭配。' },
  { id: 'g13f04', grammarId: 'G13', sentence: 'The book is ____ the bag.', options: ['in', 'on', 'at'], answer: 'in', explanation: '在袋子里面用 in。' },
  { id: 'g13f05', grammarId: 'G13', sentence: 'I go ____ school every day.', options: ['in', 'on', 'to'], answer: 'to', explanation: 'go to 表示方向。' },
  { id: 'g13f06', grammarId: 'G13', sentence: 'He is ____ the door.', options: ['in', 'at', 'behind'], answer: 'behind', explanation: 'behind 表示在...后面。' },
  { id: 'g13f07', grammarId: 'G13', sentence: 'The picture is ____ the wall.', options: ['in', 'on', 'at'], answer: 'on', explanation: 'on the wall 表示在墙上。' },
  { id: 'g13f08', grammarId: 'G13', sentence: 'I come ____ China.', options: ['in', 'from', 'to'], answer: 'from', explanation: 'come from 表示来自...' },
  { id: 'g13f09', grammarId: 'G13', sentence: 'She is waiting ____ the bus stop.', options: ['in', 'on', 'at'], answer: 'at', explanation: '在小地点用 at。' },
  { id: 'g13f10', grammarId: 'G13', sentence: 'The keys are ____ the drawer.', options: ['in', 'on', 'at'], answer: 'in', explanation: '在抽屉里面用 in。' },
  { id: 'g13f11', grammarId: 'G13', sentence: 'I am going ____ the park.', options: ['in', 'to', 'at'], answer: 'to', explanation: 'go to 表示方向。' },
  { id: 'g13f12', grammarId: 'G13', sentence: 'The bank is ____ the left.', options: ['in', 'on', 'on the left'], answer: 'on the left', explanation: 'on the left 表示在左边。' },
  { id: 'g13f13', grammarId: 'G13', sentence: 'She arrived ____ the airport.', options: ['in', 'at', 'to'], answer: 'at', explanation: '在小地点用 at。' },
  { id: 'g13f14', grammarId: 'G13', sentence: 'The dog is ____ the garden.', options: ['in', 'on', 'at'], answer: 'in', explanation: '在花园里用 in。' },
  { id: 'g13f15', grammarId: 'G13', sentence: 'I walked ____ the tunnel.', options: ['through', 'across', 'to'], answer: 'through', explanation: 'through 表示穿过立体空间。' },
  { id: 'g13f16', grammarId: 'G13', sentence: 'The pen is ____ the desk.', options: ['in', 'on', 'at'], answer: 'on', explanation: '在书桌表面用 on。' },
  { id: 'g13f17', grammarId: 'G13', sentence: 'He is ____ work.', options: ['in', 'at', 'to'], answer: 'at', explanation: 'at work 是固定搭配。' },
  { id: 'g13f18', grammarId: 'G13', sentence: 'I received a letter ____ her.', options: ['in', 'from', 'to'], answer: 'from', explanation: 'from 表示来自...' },
  { id: 'g13f19', grammarId: 'G13', sentence: 'The shop is ____ the corner.', options: ['in', 'on', 'at'], answer: 'at', explanation: '在小地点用 at。' },
  { id: 'g13f20', grammarId: 'G13', sentence: 'She walked ____ the room.', options: ['through', 'across', 'into'], answer: 'into', explanation: 'into 表示进入里面。' },
  { id: 'g13f21', grammarId: 'G13', sentence: 'I left my phone ____ home.', options: ['in', 'at', 'to'], answer: 'at', explanation: 'at home 是固定搭配。' },
  { id: 'g13f22', grammarId: 'G13', sentence: 'The plane flew ____ the city.', options: ['through', 'over', 'across'], answer: 'over', explanation: 'over 表示在...上方（不接触）。' },
  { id: 'g13f23', grammarId: 'G13', sentence: 'She is standing ____ the queue.', options: ['in', 'on', 'in the queue'], answer: 'in the queue', explanation: 'in the queue 表示在队伍里。' },
  { id: 'g13f24', grammarId: 'G13', sentence: 'I go ____ the supermarket.', options: ['in', 'to', 'at'], answer: 'to', explanation: 'go to 表示方向。' },
  { id: 'g13f25', grammarId: 'G13', sentence: 'The children are playing ____ the park.', options: ['in', 'on', 'at'], answer: 'in', explanation: '在公园里用 in。' },
  { id: 'g13f26', grammarId: 'G13', sentence: 'He sat ____ the chair.', options: ['in', 'on', 'at'], answer: 'on', explanation: '坐在椅子上用 on。' },
  { id: 'g13f27', grammarId: 'G13', sentence: 'I am listening ____ music.', options: ['in', 'to', 'at'], answer: 'to', explanation: 'listen to 是固定搭配。' },
  { id: 'g13f28', grammarId: 'G13', sentence: 'She is ____ the office.', options: ['in', 'on', 'at'], answer: 'in', explanation: '在办公室里用 in。' },
  { id: 'g13f29', grammarId: 'G13', sentence: 'The cat jumped ____ the wall.', options: ['through', 'over', 'across'], answer: 'over', explanation: 'over 表示跳过...' },
  { id: 'g13f30', grammarId: 'G13', sentence: 'I am going ____ London.', options: ['in', 'to', 'at'], answer: 'to', explanation: 'go to 表示方向。' },
];

export const g13Choice: GrammarChoiceQuestion[] = [
  { id: 'g13c01', grammarId: 'G13', question: 'Which is correct?', options: ['The cat is in the table.', 'The cat is on the table.', 'The cat is at the table.'], answer: 'The cat is on the table.', explanation: '在桌子表面上面用 on。' },
  { id: 'g13c02', grammarId: 'G13', question: 'Choose the correct sentence:', options: ['I live in Beijing.', 'I live on Beijing.', 'I live at Beijing.'], answer: 'I live in Beijing.', explanation: '在大城市用 in。' },
  { id: 'g13c03', grammarId: 'G13', question: 'Which is correct?', options: ['She is at home.', 'She is in home.', 'She is on home.'], answer: 'She is at home.', explanation: 'at home 是固定搭配。' },
  { id: 'g13c04', grammarId: 'G13', question: 'Choose the correct sentence:', options: ['I go to school.', 'I go in school.', 'I go at school.'], answer: 'I go to school.', explanation: 'go to 表示方向。' },
  { id: 'g13c05', grammarId: 'G13', question: 'Which is correct?', options: ['The book is in the bag.', 'The book is on the bag.', 'The book is at the bag.'], answer: 'The book is in the bag.', explanation: '在袋子里面用 in。' },
  { id: 'g13c06', grammarId: 'G13', question: 'Choose the correct sentence:', options: ['He is at the door.', 'He is on the door.', 'He is in the door.'], answer: 'He is at the door.', explanation: '在小地点用 at。' },
  { id: 'g13c07', grammarId: 'G13', question: 'Which is correct?', options: ['I come from China.', 'I come to China.', 'I come in China.'], answer: 'I come from China.', explanation: 'come from 表示来自...' },
  { id: 'g13c08', grammarId: 'G13', question: 'Choose the correct sentence:', options: ['She is waiting at the bus stop.', 'She is waiting in the bus stop.', 'She is waiting on the bus stop.'], answer: 'She is waiting at the bus stop.', explanation: '在小地点用 at。' },
  { id: 'g13c09', grammarId: 'G13', question: 'Which is correct?', options: ['The picture is on the wall.', 'The picture is in the wall.', 'The picture is at the wall.'], answer: 'The picture is on the wall.', explanation: 'on the wall 表示在墙上。' },
  { id: 'g13c10', grammarId: 'G13', question: 'Choose the correct sentence:', options: ['I walked through the tunnel.', 'I walked across the tunnel.', 'I walked in the tunnel.'], answer: 'I walked through the tunnel.', explanation: 'through 表示穿过立体空间。' },
];

export const g13Correction: GrammarCorrectionQuestion[] = [
  { id: 'g13x01', grammarId: 'G13', sentence: 'The cat is in the table.', answer: 'The cat is on the table.', explanation: '在桌子表面上面用 on，不用 in。' },
  { id: 'g13x02', grammarId: 'G13', sentence: 'I live on Beijing.', answer: 'I live in Beijing.', explanation: '在大城市用 in，不用 on。' },
  { id: 'g13x03', grammarId: 'G13', sentence: 'She is in home.', answer: 'She is at home.', explanation: 'at home 是固定搭配，不用 in。' },
  { id: 'g13x04', grammarId: 'G13', sentence: 'I go in school every day.', answer: 'I go to school every day.', explanation: 'go to 表示方向，不用 in。' },
  { id: 'g13x05', grammarId: 'G13', sentence: 'The book is on the bag.', answer: 'The book is in the bag.', explanation: '在袋子里面用 in，不用 on。' },
  { id: 'g13x06', grammarId: 'G13', sentence: 'He is on the door.', answer: 'He is at the door.', explanation: '在小地点用 at，不用 on。' },
  { id: 'g13x07', grammarId: 'G13', sentence: 'I come to China.', answer: 'I come from China.', explanation: 'come from 表示来自...，不用 to。' },
  { id: 'g13x08', grammarId: 'G13', sentence: 'She is waiting in the bus stop.', answer: 'She is waiting at the bus stop.', explanation: '在小地点用 at，不用 in。' },
  { id: 'g13x09', grammarId: 'G13', sentence: 'The picture is in the wall.', answer: 'The picture is on the wall.', explanation: 'on the wall 表示在墙上，不用 in。' },
  { id: 'g13x10', grammarId: 'G13', sentence: 'I walked across the tunnel.', answer: 'I walked through the tunnel.', explanation: 'through 表示穿过立体空间，不用 across。' },
];


// ========= G14: 连词 =========
export const grammarG14: GrammarPoint = {
  id: 'G14',
  name: 'Conjunctions',
  nameZh: '连词',
  explanation: '连词用来连接词、短语或句子。\n\n【并列连词】\n· and：和（并列）：I like tea and coffee.\n· but：但是（转折）：I like tea but I don\'t like coffee.\n· or：或者（选择）：Do you want tea or coffee?\n· so：所以（结果）：It was raining, so we stayed home.\n\n【从属连词】\n· because：因为（原因）：I stayed home because it was raining.\n· when：当...时（时间）：Call me when you arrive.\n· if：如果（条件）：If it rains, I will stay home.',
  examples: [
    { en: 'I like apples and bananas.', zh: '我喜欢苹果和香蕉。' },
    { en: 'She is smart but lazy.', zh: '她聪明但懒惰。' },
    { en: 'I stayed home because I was sick.', zh: '我待在家里因为生病了。' },
  ],
};

export const g14Fill: GrammarFillQuestion[] = [
  { id: 'g14f01', grammarId: 'G14', sentence: 'I like tea ____ coffee.', options: ['and', 'but', 'or'], answer: 'and', explanation: 'and 表示并列关系。' },
  { id: 'g14f02', grammarId: 'G14', sentence: 'She is smart ____ lazy.', options: ['and', 'but', 'or'], answer: 'but', explanation: 'but 表示转折关系。' },
  { id: 'g14f03', grammarId: 'G14', sentence: 'Do you want tea ____ coffee?', options: ['and', 'but', 'or'], answer: 'or', explanation: 'or 表示选择关系。' },
  { id: 'g14f04', grammarId: 'G14', sentence: 'It was raining, ____ we stayed home.', options: ['and', 'but', 'so'], answer: 'so', explanation: 'so 表示结果。' },
  { id: 'g14f05', grammarId: 'G14', sentence: 'I stayed home ____ I was sick.', options: ['because', 'so', 'or'], answer: 'because', explanation: 'because 表示原因。' },
  { id: 'g14f06', grammarId: 'G14', sentence: 'Call me ____ you arrive.', options: ['when', 'because', 'so'], answer: 'when', explanation: 'when 表示时间。' },
  { id: 'g14f07', grammarId: 'G14', sentence: '____ it rains, I will stay home.', options: ['When', 'If', 'Because'], answer: 'If', explanation: 'if 表示条件。' },
  { id: 'g14f08', grammarId: 'G14', sentence: 'I like music, ____ I don\'t like dance music.', options: ['and', 'but', 'so'], answer: 'but', explanation: 'but 表示转折。' },
  { id: 'g14f09', grammarId: 'G14', sentence: 'Hurry up, ____ you will be late.', options: ['and', 'or', 'so'], answer: 'or', explanation: 'or 表示否则（警告）。' },
  { id: 'g14f10', grammarId: 'G14', sentence: 'He was tired, ____ he went to bed early.', options: ['and', 'but', 'so'], answer: 'so', explanation: 'so 表示结果。' },
  { id: 'g14f11', grammarId: 'G14', sentence: 'I will go ____ it is sunny.', options: ['when', 'if', 'because'], answer: 'if', explanation: 'if 表示条件。' },
  { id: 'g14f12', grammarId: 'G14', sentence: 'She likes tea ____ I like coffee.', options: ['and', 'but', 'or'], answer: 'and', explanation: 'and 表示并列。' },
  { id: 'g14f13', grammarId: 'G14', sentence: 'I didn\'t go ____ I was busy.', options: ['because', 'so', 'or'], answer: 'because', explanation: 'because 表示原因。' },
  { id: 'g14f14', grammarId: 'G14', sentence: 'Wake me up ____ you leave.', options: ['when', 'if', 'so'], answer: 'when', explanation: 'when 表示时间。' },
  { id: 'g14f15', grammarId: 'G14', sentence: 'He is old ____ strong.', options: ['and', 'but', 'or'], answer: 'but', explanation: 'but 表示转折。' },
  { id: 'g14f16', grammarId: 'G14', sentence: 'I will buy it ____ it is cheap.', options: ['if', 'because', 'so'], answer: 'if', explanation: 'if 表示条件。' },
  { id: 'g14f17', grammarId: 'G14', sentence: 'It was cold, ____ I wore a coat.', options: ['and', 'but', 'so'], answer: 'so', explanation: 'so 表示结果。' },
  { id: 'g14f18', grammarId: 'G14', sentence: 'Do you want pizza ____ pasta?', options: ['and', 'but', 'or'], answer: 'or', explanation: 'or 表示选择。' },
  { id: 'g14f19', grammarId: 'G14', sentence: 'I love her ____ she is kind.', options: ['because', 'so', 'or'], answer: 'because', explanation: 'because 表示原因。' },
  { id: 'g14f20', grammarId: 'G14', sentence: 'I will call you ____ I arrive.', options: ['when', 'if', 'because'], answer: 'when', explanation: 'when 表示时间。' },
  { id: 'g14f21', grammarId: 'G14', sentence: 'He can\'t swim, ____ he won\'t go to the beach.', options: ['and', 'but', 'so'], answer: 'so', explanation: 'so 表示结果。' },
  { id: 'g14f22', grammarId: 'G14', sentence: 'I will go ____ it doesn\'t rain.', options: ['if', 'because', 'so'], answer: 'if', explanation: 'if 表示条件。' },
  { id: 'g14f23', grammarId: 'G14', sentence: 'She is rich ____ unhappy.', options: ['and', 'but', 'or'], answer: 'but', explanation: 'but 表示转折。' },
  { id: 'g14f24', grammarId: 'G14', sentence: 'I bought it ____ I needed it.', options: ['because', 'so', 'or'], answer: 'because', explanation: 'because 表示原因。' },
  { id: 'g14f25', grammarId: 'G14', sentence: '____ you finish your work, you can go home.', options: ['When', 'If', 'Because'], answer: 'When', explanation: 'when 表示时间。' },
  { id: 'g14f26', grammarId: 'G14', sentence: 'Hurry up ____ you will miss the bus.', options: ['and', 'or', 'so'], answer: 'or', explanation: 'or 表示否则。' },
  { id: 'g14f27', grammarId: 'G14', sentence: 'I like him ____ he is funny.', options: ['because', 'so', 'or'], answer: 'because', explanation: 'because 表示原因。' },
  { id: 'g14f28', grammarId: 'G14', sentence: 'I will help you ____ I can.', options: ['if', 'when', 'because'], answer: 'if', explanation: 'if 表示条件。' },
  { id: 'g14f29', grammarId: 'G14', sentence: 'He studied hard, ____ he passed the exam.', options: ['and', 'but', 'so'], answer: 'so', explanation: 'so 表示结果。' },
  { id: 'g14f30', grammarId: 'G14', sentence: 'Do you want to go now ____ later?', options: ['and', 'but', 'or'], answer: 'or', explanation: 'or 表示选择。' },
];

export const g14Choice: GrammarChoiceQuestion[] = [
  { id: 'g14c01', grammarId: 'G14', question: 'Which is correct?', options: ['I like tea and coffee.', 'I like tea but coffee.', 'I like tea or coffee.'], answer: 'I like tea and coffee.', explanation: 'and 表示并列关系。' },
  { id: 'g14c02', grammarId: 'G14', question: 'Choose the correct sentence:', options: ['She is smart and lazy.', 'She is smart but lazy.', 'She is smart so lazy.'], answer: 'She is smart but lazy.', explanation: 'but 表示转折。' },
  { id: 'g14c03', grammarId: 'G14', question: 'Which is correct?', options: ['Do you want tea or coffee?', 'Do you want tea and coffee?', 'Do you want tea but coffee?'], answer: 'Do you want tea or coffee?', explanation: 'or 表示选择。' },
  { id: 'g14c04', grammarId: 'G14', question: 'Choose the correct sentence:', options: ['It was raining, and we stayed home.', 'It was raining, but we stayed home.', 'It was raining, so we stayed home.'], answer: 'It was raining, so we stayed home.', explanation: 'so 表示结果。' },
  { id: 'g14c05', grammarId: 'G14', question: 'Which is correct?', options: ['I stayed home because I was sick.', 'I stayed home so I was sick.', 'I stayed home or I was sick.'], answer: 'I stayed home because I was sick.', explanation: 'because 表示原因。' },
  { id: 'g14c06', grammarId: 'G14', question: 'Choose the correct sentence:', options: ['Call me when you arrive.', 'Call me because you arrive.', 'Call me so you arrive.'], answer: 'Call me when you arrive.', explanation: 'when 表示时间。' },
  { id: 'g14c07', grammarId: 'G14', question: 'Which is correct?', options: ['If it rains, I will stay home.', 'When it rains, I will stay home.', 'Because it rains, I will stay home.'], answer: 'If it rains, I will stay home.', explanation: 'if 表示条件。' },
  { id: 'g14c08', grammarId: 'G14', question: 'Choose the correct sentence:', options: ['He is old and strong.', 'He is old but strong.', 'He is old so strong.'], answer: 'He is old but strong.', explanation: 'but 表示转折。' },
  { id: 'g14c09', grammarId: 'G14', question: 'Which is correct?', options: ['Hurry up, and you will be late.', 'Hurry up, or you will be late.', 'Hurry up, so you will be late.'], answer: 'Hurry up, or you will be late.', explanation: 'or 表示否则。' },
  { id: 'g14c10', grammarId: 'G14', question: 'Choose the correct sentence:', options: ['I will go if it is sunny.', 'I will go when it is sunny.', 'I will go because it is sunny.'], answer: 'I will go if it is sunny.', explanation: 'if 表示条件。' },
];

export const g14Correction: GrammarCorrectionQuestion[] = [
  { id: 'g14x01', grammarId: 'G14', sentence: 'I like tea but coffee.', answer: 'I like tea and coffee.', explanation: '并列关系用 and，不用 but。' },
  { id: 'g14x02', grammarId: 'G14', sentence: 'She is smart and lazy.', answer: 'She is smart but lazy.', explanation: '转折关系用 but，不用 and。' },
  { id: 'g14x03', grammarId: 'G14', sentence: 'Do you want tea and coffee?', answer: 'Do you want tea or coffee?', explanation: '选择关系用 or，不用 and。' },
  { id: 'g14x04', grammarId: 'G14', sentence: 'It was raining, and we stayed home.', answer: 'It was raining, so we stayed home.', explanation: '结果关系用 so，不用 and。' },
  { id: 'g14x05', grammarId: 'G14', sentence: 'I stayed home so I was sick.', answer: 'I stayed home because I was sick.', explanation: '原因关系用 because，不用 so。' },
  { id: 'g14x06', grammarId: 'G14', sentence: 'Call me because you arrive.', answer: 'Call me when you arrive.', explanation: '时间关系用 when，不用 because。' },
  { id: 'g14x07', grammarId: 'G14', sentence: 'When it rains, I will stay home.', answer: 'If it rains, I will stay home.', explanation: '条件关系用 if，不用 when。' },
  { id: 'g14x08', grammarId: 'G14', sentence: 'He is old and strong.', answer: 'He is old but strong.', explanation: '转折关系用 but，不用 and。' },
  { id: 'g14x09', grammarId: 'G14', sentence: 'Hurry up, and you will be late.', answer: 'Hurry up, or you will be late.', explanation: '否则用 or，不用 and。' },
  { id: 'g14x10', grammarId: 'G14', sentence: 'I will go when it is sunny.', answer: 'I will go if it is sunny.', explanation: '条件关系用 if，不用 when。' },
];


// ========= G15: there be 句型 =========
export const grammarG15: GrammarPoint = {
  id: 'G15',
  name: 'there be',
  nameZh: 'there be 句型',
  explanation: 'there be 句型用来描述某处存在某物。\n\n【结构】\n· 单数/不可数名词：There is + 单数名词/不可数名词\n· 复数名词：There are + 复数名词\n\n【时态变化】\n· 一般现在时：There is/are\n· 一般过去时：There was/were\n· 将来时：There will be / There is/are going to be\n\n【疑问句】Are there...? / Is there...?',
  examples: [
    { en: 'There is a book on the table.', zh: '桌子上有一本书。' },
    { en: 'There are five apples in the bowl.', zh: '碗里有五个苹果。' },
    { en: 'Are there any questions?', zh: '有什么问题吗？' },
  ],
};

export const g15Fill: GrammarFillQuestion[] = [
  { id: 'g15f01', grammarId: 'G15', sentence: 'There ____ a book on the table.', options: ['is', 'are', 'be'], answer: 'is', explanation: '单数名词用 There is。' },
  { id: 'g15f02', grammarId: 'G15', sentence: 'There ____ five apples.', options: ['is', 'are', 'be'], answer: 'are', explanation: '复数名词用 There are。' },
  { id: 'g15f03', grammarId: 'G15', sentence: 'There ____ some water in the bottle.', options: ['is', 'are', 'be'], answer: 'is', explanation: '不可数名词用 There is。' },
  { id: 'g15f04', grammarId: 'G15', sentence: 'There ____ (be) a cat under the tree.', options: ['is', 'are', 'was'], answer: 'is', explanation: '单数名词用 There is。' },
  { id: 'g15f05', grammarId: 'G15', sentence: 'There ____ (be) two dogs in the garden.', options: ['is', 'are', 'were'], answer: 'are', explanation: '复数名词用 There are。' },
  { id: 'g15f06', grammarId: 'G15', sentence: 'There ____ (be) some milk in the fridge.', options: ['is', 'are', 'be'], answer: 'is', explanation: '不可数名词用 There is。' },
  { id: 'g15f07', grammarId: 'G15', sentence: '____ there a park near here?', options: ['Is', 'Are', 'Be'], answer: 'Is', explanation: '单数名词用 Is there...?' },
  { id: 'g15f08', grammarId: 'G15', sentence: '____ there any questions?', options: ['Is', 'Are', 'Be'], answer: 'Are', explanation: '复数名词用 Are there...?' },
  { id: 'g15f09', grammarId: 'G15', sentence: 'There ____ (not) a bank nearby.', options: ["isn't", "aren't", 'be not'], answer: "isn't", explanation: '单数名词否定：There isn\'t。' },
  { id: 'g15f10', grammarId: 'G15', sentence: 'There ____ (not) any students in the classroom.', options: ["isn't", "aren't", 'be not'], answer: "aren't", explanation: '复数名词否定：There aren\'t。' },
  { id: 'g15f11', grammarId: 'G15', sentence: 'There ____ a pen on the desk.', options: ['is', 'are', 'be'], answer: 'is', explanation: '单数名词用 There is。' },
  { id: 'g15f12', grammarId: 'G15', sentence: 'There ____ three birds in the tree.', options: ['is', 'are', 'be'], answer: 'are', explanation: '复数名词用 There are。' },
  { id: 'g15f13', grammarId: 'G15', sentence: 'There ____ some bread on the plate.', options: ['is', 'are', 'be'], answer: 'is', explanation: '不可数名词用 There is。' },
  { id: 'g15f14', grammarId: 'G15', sentence: 'There ____ (be) a cinema in the town.', options: ['is', 'are', 'was'], answer: 'is', explanation: '单数名词用 There is。' },
  { id: 'g15f15', grammarId: 'G15', sentence: 'There ____ (be) seven days in a week.', options: ['is', 'are', 'were'], answer: 'are', explanation: '复数名词用 There are。' },
  { id: 'g15f16', grammarId: 'G15', sentence: 'There ____ (be) a lot of furniture in the room.', options: ['is', 'are', 'be'], answer: 'is', explanation: 'furniture 是不可数名词，用 There is。' },
  { id: 'g15f17', grammarId: 'G15', sentence: '____ there a supermarket near here?', options: ['Is', 'Are', 'Be'], answer: 'Is', explanation: '单数名词用 Is there...?' },
  { id: 'g15f18', grammarId: 'G15', sentence: '____ there any shops open?', options: ['Is', 'Are', 'Be'], answer: 'Are', explanation: '复数名词用 Are there...?' },
  { id: 'g15f19', grammarId: 'G15', sentence: 'There ____ (not) a hotel in the village.', options: ["isn't", "aren't", 'be not'], answer: "isn't", explanation: '单数名词否定：There isn\'t。' },
  { id: 'g15f20', grammarId: 'G15', sentence: 'There ____ (not) any eggs in the fridge.', options: ["isn't", "aren't", 'be not'], answer: "aren't", explanation: '复数名词否定：There aren\'t。' },
  { id: 'g15f21', grammarId: 'G15', sentence: 'There ____ a library in our school.', options: ['is', 'are', 'be'], answer: 'is', explanation: '单数名词用 There is。' },
  { id: 'g15f22', grammarId: 'G15', sentence: 'There ____ many people at the party.', options: ['is', 'are', 'be'], answer: 'are', explanation: '复数名词用 There are。' },
  { id: 'g15f23', grammarId: 'G15', sentence: 'There ____ some rice in the bowl.', options: ['is', 'are', 'be'], answer: 'is', explanation: '不可数名词用 There is。' },
  { id: 'g15f24', grammarId: 'G15', sentence: 'There ____ (be) a post office near my house.', options: ['is', 'are', 'was'], answer: 'is', explanation: '单数名词用 There is。' },
  { id: 'g15f25', grammarId: 'G15', sentence: 'There ____ (be) five pencils in the box.', options: ['is', 'are', 'were'], answer: 'are', explanation: '复数名词用 There are。' },
  { id: 'g15f26', grammarId: 'G15', sentence: 'There ____ (be) some news about the accident.', options: ['is', 'are', 'be'], answer: 'is', explanation: 'news 是不可数名词，用 There is。' },
  { id: 'g15f27', grammarId: 'G15', sentence: '____ there a bathroom in the house?', options: ['Is', 'Are', 'Be'], answer: 'Is', explanation: '单数名词用 Is there...?' },
  { id: 'g15f28', grammarId: 'G15', sentence: '____ there any children playing?', options: ['Is', 'Are', 'Be'], answer: 'Are', explanation: '复数名词用 Are there...?' },
  { id: 'g15f29', grammarId: 'G15', sentence: 'There ____ (not) a restaurant here.', options: ["isn't", "aren't", 'be not'], answer: "isn't", explanation: '单数名词否定：There isn\'t。' },
  { id: 'g15f30', grammarId: 'G15', sentence: 'There ____ (not) any flowers in the garden.', options: ["isn't", "aren't", 'be not'], answer: "aren't", explanation: '复数名词否定：There aren\'t。' },
];

export const g15Choice: GrammarChoiceQuestion[] = [
  { id: 'g15c01', grammarId: 'G15', question: 'Which is correct?', options: ['There is a books on the table.', 'There is a book on the table.', 'There are a book on the table.'], answer: 'There is a book on the table.', explanation: '单数名词用 There is。' },
  { id: 'g15c02', grammarId: 'G15', question: 'Choose the correct sentence:', options: ['There are five apples.', 'There is five apples.', 'There be five apples.'], answer: 'There are five apples.', explanation: '复数名词用 There are。' },
  { id: 'g15c03', grammarId: 'G15', question: 'Which is correct?', options: ['Is there a bank near here?', 'Are there a bank near here?', 'Be there a bank near here?'], answer: 'Is there a bank near here?', explanation: '单数名词用 Is there...?' },
  { id: 'g15c04', grammarId: 'G15', question: 'Choose the correct question:', options: ['Is there any questions?', 'Are there any questions?', 'Be there any questions?'], answer: 'Are there any questions?', explanation: '复数名词用 Are there...?' },
  { id: 'g15c05', grammarId: 'G15', question: 'Which is correct?', options: ["There isn't a park.", "There aren't a park.", "There be not a park."], answer: "There isn't a park.", explanation: '单数名词否定：There isn\'t。' },
  { id: 'g15c06', grammarId: 'G15', question: 'Choose the correct negative:', options: ["There isn't any students.", "There aren't any students.", "There be not any students."], answer: "There aren't any students.", explanation: '复数名词否定：There aren\'t。' },
  { id: 'g15c07', grammarId: 'G15', question: 'Which is correct?', options: ['There is some water.', 'There are some water.', 'There be some water.'], answer: 'There is some water.', explanation: '不可数名词用 There is。' },
  { id: 'g15c08', grammarId: 'G15', question: 'Choose the correct sentence:', options: ['There is a information desk.', 'There is an information desk.', 'There are an information desk.'], answer: 'There is an information desk.', explanation: 'information 以元音音素开头，用 an。' },
  { id: 'g15c09', grammarId: 'G15', question: 'Which is correct?', options: ['There is many people.', 'There are many people.', 'There be many people.'], answer: 'There are many people.', explanation: '复数名词用 There are。' },
  { id: 'g15c10', grammarId: 'G15', question: 'Choose the correct sentence:', options: ['There is a furniture.', 'There is a piece of furniture.', 'There are some furniture.'], answer: 'There is a piece of furniture.', explanation: 'furniture 是不可数名词，不能直接加 a。' },
];

export const g15Correction: GrammarCorrectionQuestion[] = [
  { id: 'g15x01', grammarId: 'G15', sentence: 'There are a book on the table.', answer: 'There is a book on the table.', explanation: '单数名词用 There is，不用 are。' },
  { id: 'g15x02', grammarId: 'G15', sentence: 'There is five apples.', answer: 'There are five apples.', explanation: '复数名词用 There are，不用 is。' },
  { id: 'g15x03', grammarId: 'G15', sentence: 'Are there a park near here?', answer: 'Is there a park near here?', explanation: '单数名词用 Is there...?，不用 Are。' },
  { id: 'g15x04', grammarId: 'G15', sentence: 'Is there any questions?', answer: 'Are there any questions?', explanation: '复数名词用 Are there...?，不用 Is。' },
  { id: 'g15x05', grammarId: 'G15', sentence: "There aren't a bank nearby.", answer: "There isn't a bank nearby.", explanation: '单数名词否定用 There isn\'t，不用 aren\'t。' },
  { id: 'g15x06', grammarId: 'G15', sentence: "There isn't any students in the classroom.", answer: "There aren't any students in the classroom.", explanation: '复数名词否定用 There aren\'t，不用 isn\'t。' },
  { id: 'g15x07', grammarId: 'G15', sentence: 'There are some water in the bottle.', answer: 'There is some water in the bottle.', explanation: '不可数名词用 There is，不用 are。' },
  { id: 'g15x08', grammarId: 'G15', sentence: 'There is a people in the room.', answer: 'There are some people in the room.', explanation: 'people 是复数，用 There are。' },
  { id: 'g15x09', grammarId: 'G15', sentence: "There isn't a news about it.", answer: "There isn't any news about it.", explanation: 'news 是不可数名词，不用 a。' },
  { id: 'g15x10', grammarId: 'G15', sentence: 'There are a furniture in the room.', answer: 'There is a piece of furniture in the room.', explanation: 'furniture 是不可数名词，不能直接加 a。' },
];


// ========= G16: 疑问句与否定句 =========
export const grammarG16: GrammarPoint = {
  id: 'G16',
  name: 'Questions and Negatives',
  nameZh: '疑问句与否定句',
  explanation: '疑问句和否定句的构成。\n\n【疑问句】\n· 助动词提前：Do you like...? / Can she...?\n· be动词提前：Are you...? / Is he...?\n· 特殊疑问句：Wh- + 助动词/be动词 + 主语...?\n\n【否定句】\n· 助动词 + not：don\'t / doesn\'t / didn\'t + 动词原形\n· be动词 + not：am not/isn\'t/aren\'t\n· 情态动词 + not：can\'t/mustn\'t/shouldn\'t',
  examples: [
    { en: 'Do you speak English?', zh: '你说英语吗？' },
    { en: 'I don\'t like coffee.', zh: '我不喜欢咖啡。' },
    { en: 'Where do you live?', zh: '你住在哪里？' },
  ],
};

export const g16Fill: GrammarFillQuestion[] = [
  { id: 'g16f01', grammarId: 'G16', sentence: '____ you like tea?', options: ['Do', 'Does', 'Are'], answer: 'Do', explanation: 'you 用 Do 提问。' },
  { id: 'g16f02', grammarId: 'G16', sentence: 'I ____ (not / like) coffee.', options: ["don't like", "doesn't like", 'not like'], answer: "don't like", explanation: '否定用 don\'t + 动词原形。' },
  { id: 'g16f03', grammarId: 'G16', sentence: '____ she speak English?', options: ['Do', 'Does', 'Is'], answer: 'Does', explanation: 'she 是第三人称单数，用 Does。' },
  { id: 'g16f04', grammarId: 'G16', sentence: 'He ____ (not / work) here.', options: ["doesn't work", "don't work", 'not work'], answer: "doesn't work", explanation: 'he 用 doesn\'t + 动词原形。' },
  { id: 'g16f05', grammarId: 'G16', sentence: '____ you ____ (go) to school?', options: ['Do / go', 'Does / goes', 'Are / go'], answer: 'Do / go', explanation: '疑问句用 Do + 主语 + 动词原形？' },
  { id: 'g16f06', grammarId: 'G16', sentence: 'We ____ (not / be) late.', options: ["aren't", "don't be", "isn't"], answer: "aren't", explanation: 'be 动词否定：aren\'t。' },
  { id: 'g16f07', grammarId: 'G16', sentence: '____ he at home?', options: ['Is', 'Does', 'Do'], answer: 'Is', explanation: 'be 动词疑问句：Is + 主语 + 表语？' },
  { id: 'g16f08', grammarId: 'G16', sentence: 'She ____ (not / be) a teacher.', options: ["isn't", "doesn't be", "aren't"], answer: "isn't", explanation: 'be 动词否定：isn\'t。' },
  { id: 'g16f09', grammarId: 'G16', sentence: '____ they ____ (play) football?', options: ['Do / play', 'Does / plays', 'Are / play'], answer: 'Do / play', explanation: '疑问句用 Do + 主语 + 动词原形？' },
  { id: 'g16f10', grammarId: 'G16', sentence: 'I ____ (not / have) a car.', options: ["don't have", "doesn't have", 'not have'], answer: "don't have", explanation: '否定用 don\'t + 动词原形。' },
  { id: 'g16f11', grammarId: 'G16', sentence: '____ you know him?', options: ['Do', 'Does', 'Are'], answer: 'Do', explanation: '一般现在时疑问句用 Do。' },
  { id: 'g16f12', grammarId: 'G16', sentence: 'We ____ (not / go) to school.', options: ["don't go", "doesn't go", 'not go'], answer: "don't go", explanation: '否定用 don\'t + 动词原形。' },
  { id: 'g16f13', grammarId: 'G16', sentence: '____ she ____ (have) a bike?', options: ['Does / have', 'Do / has', 'Is / have'], answer: 'Does / have', explanation: 'she 用 Does + 动词原形。' },
  { id: 'g16f14', grammarId: 'G16', sentence: 'They ____ (not / be) friends.', options: ["aren't", "don't be", "isn't"], answer: "aren't", explanation: 'be 动词否定：aren\'t。' },
  { id: 'g16f15', grammarId: 'G16', sentence: '____ you swim?', options: ['Can', 'Do', 'Are'], answer: 'Can', explanation: '情态动词疑问句：Can + 主语 + 动词原形？' },
  { id: 'g16f16', grammarId: 'G16', sentence: 'He ____ (not / can) swim.', options: ["can't swim", "doesn't can swim", 'not can swim'], answer: "can't swim", explanation: '情态动词否定：can\'t + 动词原形。' },
  { id: 'g16f17', grammarId: 'G16', sentence: '____ she come?', options: ['Will', 'Does', 'Is'], answer: 'Will', explanation: 'will 疑问句：Will + 主语 + 动词原形？' },
  { id: 'g16f18', grammarId: 'G16', sentence: 'We ____ (not / will) go.', options: ["won't go", "don't will go", 'not will go'], answer: "won't go", explanation: 'will 否定：won\'t + 动词原形。' },
  { id: 'g16f19', grammarId: 'G16', sentence: '____ they go?', options: ['Should', 'Do', 'Are'], answer: 'Should', explanation: 'should 疑问句：Should + 主语 + 动词原形？' },
  { id: 'g16f20', grammarId: 'G16', sentence: 'She ____ (not / should) go.', options: ["shouldn't go", "doesn't should go", 'not should go'], answer: "shouldn't go", explanation: 'should 否定：shouldn\'t + 动词原形。' },
  { id: 'g16f21', grammarId: 'G16', sentence: '____ he go?', options: ['Must', 'Does', 'Is'], answer: 'Must', explanation: 'must 疑问句：Must + 主语 + 动词原形？' },
  { id: 'g16f22', grammarId: 'G16', sentence: 'I ____ (not / must) go.', options: ["mustn't go", "don't must go", 'not must go'], answer: "mustn't go", explanation: 'must 否定：mustn\'t + 动词原形。' },
  { id: 'g16f23', grammarId: 'G16', sentence: '____ you at home?', options: ['Are', 'Do', 'Is'], answer: 'Are', explanation: 'be 动词疑问句：Are + 主语 + 表语？' },
  { id: 'g16f24', grammarId: 'G16', sentence: 'They ____ (not / be) here.', options: ["aren't here", "don't be here", "isn't here"], answer: "aren't here", explanation: 'be 动词否定：aren\'t。' },
  { id: 'g16f25', grammarId: 'G16', sentence: '____ he ____ (have) a car?', options: ['Does / have', 'Do / has', 'Is / have'], answer: 'Does / have', explanation: 'have 疑问句用 Does + 动词原形。' },
  { id: 'g16f26', grammarId: 'G16', sentence: 'She ____ (not / have) a dog.', options: ["doesn't have", "don't have", 'not have'], answer: "doesn't have", explanation: 'she 用 doesn\'t + 动词原形。' },
  { id: 'g16f27', grammarId: 'G16', sentence: '____ we ____ (eat) dinner?', options: ['Do / eat', 'Does / eats', 'Are / eat'], answer: 'Do / eat', explanation: '疑问句用 Do + 主语 + 动词原形？' },
  { id: 'g16f28', grammarId: 'G16', sentence: 'He ____ (not / eat) meat.', options: ["doesn't eat", "don't eat", 'not eat'], answer: "doesn't eat", explanation: 'he 用 doesn\'t + 动词原形。' },
  { id: 'g16f29', grammarId: 'G16', sentence: '____ she ____ (do) her homework?', options: ['Does / do', 'Do / does', 'Is / do'], answer: 'Does / do', explanation: 'she 用 Does + 动词原形。' },
  { id: 'g16f30', grammarId: 'G16', sentence: 'We ____ (not / do) our homework.', options: ["don't do", "doesn't do", 'not do'], answer: "don't do", explanation: '否定用 don\'t + 动词原形。' },
];

export const g16Choice: GrammarChoiceQuestion[] = [
  { id: 'g16c01', grammarId: 'G16', question: 'Which is correct?', options: ['Do you like tea?', 'Does you like tea?', 'Are you like tea?'], answer: 'Do you like tea?', explanation: 'you 用 Do 提问。' },
  { id: 'g16c02', grammarId: 'G16', question: 'Choose the correct negative:', options: ["I don't like coffee.", "I doesn't like coffee.", 'I am not like coffee.'], answer: "I don't like coffee.", explanation: '否定用 don\'t + 动词原形。' },
  { id: 'g16c03', grammarId: 'G16', question: 'Which is correct?', options: ['Does she speak English?', 'Do she speak English?', 'Is she speak English?'], answer: 'Does she speak English?', explanation: 'she 用 Does 提问。' },
  { id: 'g16c04', grammarId: 'G16', question: 'Choose the correct sentence:', options: ["He doesn't work here.", "He don't work here.", 'He is not work here.'], answer: "He doesn't work here.", explanation: 'he 用 doesn\'t + 动词原形。' },
  { id: 'g16c05', grammarId: 'G16', question: 'Which is correct?', options: ['Are you a student?', 'Do you a student?', 'Does you a student?'], answer: 'Are you a student?', explanation: 'be 动词疑问句提前。' },
  { id: 'g16c06', grammarId: 'G16', question: 'Choose the correct negative:', options: ["She isn't a teacher.", "She doesn't be a teacher.", "She aren't a teacher."], answer: "She isn't a teacher.", explanation: 'be 动词否定：isn\'t。' },
  { id: 'g16c07', grammarId: 'G16', question: 'Which is correct?', options: ['Can you swim?', 'Do you can swim?', 'Are you can swim?'], answer: 'Can you swim?', explanation: '情态动词疑问句提前。' },
  { id: 'g16c08', grammarId: 'G16', question: 'Choose the correct sentence:', options: ["I can't swim.", "I don't can swim.", 'I am not can swim.'], answer: "I can't swim.", explanation: '情态动词否定：can\'t + 动词原形。' },
  { id: 'g16c09', grammarId: 'G16', question: 'Which is correct?', options: ['Will you come?', 'Do you will come?', 'Are you will come?'], answer: 'Will you come?', explanation: 'will 疑问句提前。' },
  { id: 'g16c10', grammarId: 'G16', question: 'Choose the correct negative:', options: ["I won't go.", "I don't will go.", 'I am not will go.'], answer: "I won't go.", explanation: 'will 否定：won\'t + 动词原形。' },
];

export const g16Correction: GrammarCorrectionQuestion[] = [
  { id: 'g16x01', grammarId: 'G16', sentence: 'Do she like tea?', answer: 'Does she like tea?', explanation: 'she 是第三人称单数，用 Does。' },
  { id: 'g16x02', grammarId: 'G16', sentence: "I doesn't like coffee.", answer: "I don't like coffee.", explanation: 'I 用 don\'t，不用 doesn\'t。' },
  { id: 'g16x03', grammarId: 'G16', sentence: 'Does you speak English?', answer: 'Do you speak English?', explanation: 'you 用 Do 提问，不用 Does。' },
  { id: 'g16x04', grammarId: 'G16', sentence: "He don't work here.", answer: "He doesn't work here.", explanation: 'he 用 doesn\'t，不用 don\'t。' },
  { id: 'g16x05', grammarId: 'G16', sentence: 'Are you like tea?', answer: 'Do you like tea?', explanation: 'like 是实义动词，用 Do 提问。' },
  { id: 'g16x06', grammarId: 'G16', sentence: "She doesn't be a teacher.", answer: "She isn't a teacher.", explanation: 'be 动词否定用 isn\'t，不用 doesn\'t be。' },
  { id: 'g16x07', grammarId: 'G16', sentence: 'Do you can swim?', answer: 'Can you swim?', explanation: '情态动词疑问句提前，不用 Do。' },
  { id: 'g16x08', grammarId: 'G16', sentence: "I don't can swim.", answer: "I can't swim.", explanation: '情态动词否定用 can\'t，不用 don\'t can。' },
  { id: 'g16x09', grammarId: 'G16', sentence: 'Do you will come?', answer: 'Will you come?', explanation: 'will 疑问句提前，不用 Do。' },
  { id: 'g16x10', grammarId: 'G16', sentence: "I don't will go.", answer: "I won't go.", explanation: 'will 否定用 won\'t，不用 don\'t will。' },
];


// ========= G17: some / any / much / many =========
export const grammarG17: GrammarPoint = {
  id: 'G17',
  name: 'some/any/much/many',
  nameZh: 'some / any / much / many',
  explanation: '这些词用来表达数量和程度。\n\n【some/any】\n· some：肯定句、表示请求/建议的疑问句：I have some money. / Would you like some coffee?\n· any：否定句、疑问句：I don\'t have any money. / Do you have any questions?\n\n【much/many】\n· much + 不可数名词：much time, much water\n· many + 可数名词复数：many books, many people\n\n【区别】much 用于不可数名词，many 用于可数名词',
  examples: [
    { en: 'I have some friends.', zh: '我有一些朋友。' },
    { en: 'Do you have any questions?', zh: '你有什么问题吗？' },
    { en: 'How many books do you have?', zh: '你有多少本书？' },
  ],
};

export const g17Fill: GrammarFillQuestion[] = [
  { id: 'g17f01', grammarId: 'G17', sentence: 'I have ____ friends.', options: ['some', 'any', 'much'], answer: 'some', explanation: '肯定句用 some。' },
  { id: 'g17f02', grammarId: 'G17', sentence: "I don't have ____ money.", options: ['some', 'any', 'many'], answer: 'any', explanation: '否定句用 any。' },
  { id: 'g17f03', grammarId: 'G17', sentence: 'Do you have ____ questions?', options: ['some', 'any', 'much'], answer: 'any', explanation: '疑问句用 any。' },
  { id: 'g17f04', grammarId: 'G17', sentence: 'How ____ books do you have?', options: ['much', 'many', 'some'], answer: 'many', explanation: '可数名词复数用 many。' },
  { id: 'g17f05', grammarId: 'G17', sentence: 'How ____ time do you need?', options: ['much', 'many', 'any'], answer: 'much', explanation: '不可数名词用 much。' },
  { id: 'g17f06', grammarId: 'G17', sentence: 'Would you like ____ coffee?', options: ['some', 'any', 'much'], answer: 'some', explanation: '表示请求的疑问句用 some。' },
  { id: 'g17f07', grammarId: 'G17', sentence: 'There aren\'t ____ students in the class.', options: ['some', 'any', 'many'], answer: 'any', explanation: '否定句用 any。' },
  { id: 'g17f08', grammarId: 'G17', sentence: 'I need ____ water.', options: ['some', 'many', 'much'], answer: 'some', explanation: '肯定句中不可数名词可用 some。' },
  { id: 'g17f09', grammarId: 'G17', sentence: 'Are there ____ apples?', options: ['some', 'any', 'much'], answer: 'any', explanation: '疑问句用 any。' },
  { id: 'g17f10', grammarId: 'G17', sentence: 'She has ____ money.', options: ['some', 'any', 'much'], answer: 'some', explanation: '肯定句用 some。' },
  { id: 'g17f11', grammarId: 'G17', sentence: "He doesn't have ____ brothers.", options: ['some', 'any', 'much'], answer: 'any', explanation: '否定句用 any。' },
  { id: 'g17f12', grammarId: 'G17', sentence: 'How ____ people are there?', options: ['much', 'many', 'some'], answer: 'many', explanation: '可数名词复数用 many。' },
  { id: 'g17f13', grammarId: 'G17', sentence: 'Is there ____ milk in the fridge?', options: ['some', 'any', 'many'], answer: 'any', explanation: '疑问句用 any。' },
  { id: 'g17f14', grammarId: 'G17', sentence: 'I bought ____ new books.', options: ['some', 'any', 'much'], answer: 'some', explanation: '肯定句用 some。' },
  { id: 'g17f15', grammarId: 'G17', sentence: "There isn't ____ rice left.", options: ['some', 'any', 'many'], answer: 'any', explanation: '否定句用 any。' },
  { id: 'g17f16', grammarId: 'G17', sentence: 'Can I have ____ tea?', options: ['some', 'any', 'much'], answer: 'some', explanation: '表示请求的疑问句用 some。' },
  { id: 'g17f17', grammarId: 'G17', sentence: 'How ____ sugar do you want?', options: ['much', 'many', 'any'], answer: 'much', explanation: '不可数名词用 much。' },
  { id: 'g17f18', grammarId: 'G17', sentence: 'I don\'t have ____ information.', options: ['some', 'any', 'many'], answer: 'any', explanation: '否定句 + 不可数名词用 any。' },
  { id: 'g17f19', grammarId: 'G17', sentence: 'Have you got ____ children?', options: ['some', 'any', 'much'], answer: 'any', explanation: '疑问句用 any。' },
  { id: 'g17f20', grammarId: 'G17', sentence: 'I need ____ help.', options: ['some', 'any', 'many'], answer: 'some', explanation: '肯定句用 some。' },
  { id: 'g17f21', grammarId: 'G17', sentence: "She doesn't eat ____ meat.", options: ['some', 'any', 'much'], answer: 'any', explanation: '否定句用 any。' },
  { id: 'g17f22', grammarId: 'G17', sentence: 'How ____ windows are there?', options: ['much', 'many', 'some'], answer: 'many', explanation: '可数名词复数用 many。' },
  { id: 'g17f23', grammarId: 'G17', sentence: 'Is there ____ bread?', options: ['some', 'any', 'many'], answer: 'any', explanation: '疑问句用 any。' },
  { id: 'g17f24', grammarId: 'G17', sentence: 'I did ____ work yesterday.', options: ['some', 'any', 'much'], answer: 'some', explanation: '肯定句用 some。' },
  { id: 'g17f25', grammarId: 'G17', sentence: "We don't have ____ eggs.", options: ['some', 'any', 'much'], answer: 'any', explanation: '否定句用 any。' },
  { id: 'g17f26', grammarId: 'G17', sentence: 'Would you like ____ cake?', options: ['some', 'any', 'much'], answer: 'some', explanation: '表示建议的疑问句用 some。' },
  { id: 'g17f27', grammarId: 'G17', sentence: 'How ____ luggage do you have?', options: ['much', 'many', 'any'], answer: 'much', explanation: 'luggage 是不可数名词，用 much。' },
  { id: 'g17f28', grammarId: 'G17', sentence: "There aren't ____ hotels nearby.", options: ['some', 'any', 'much'], answer: 'any', explanation: '否定句用 any。' },
  { id: 'g17f29', grammarId: 'G17', sentence: 'Do you know ____ good restaurants?', options: ['some', 'any', 'much'], answer: 'any', explanation: '疑问句用 any。' },
  { id: 'g17f30', grammarId: 'G17', sentence: 'I drank ____ coffee.', options: ['some', 'any', 'many'], answer: 'some', explanation: '肯定句用 some。' },
];

export const g17Choice: GrammarChoiceQuestion[] = [
  { id: 'g17c01', grammarId: 'G17', question: 'Which is correct?', options: ['I have any friends.', 'I have some friends.', 'I have much friends.'], answer: 'I have some friends.', explanation: '肯定句用 some。' },
  { id: 'g17c02', grammarId: 'G17', question: 'Choose the correct sentence:', options: ["I don't have some money.", "I don't have any money.", "I don't have many money."], answer: "I don't have any money.", explanation: '否定句用 any。' },
  { id: 'g17c03', grammarId: 'G17', question: 'Which is correct?', options: ['How much books do you have?', 'How many books do you have?', 'How some books do you have?'], answer: 'How many books do you have?', explanation: '可数名词复数用 many。' },
  { id: 'g17c04', grammarId: 'G17', question: 'Choose the correct sentence:', options: ['How much water is there?', 'How many water is there?', 'How some water is there?'], answer: 'How much water is there?', explanation: '不可数名词用 much。' },
  { id: 'g17c05', grammarId: 'G17', question: 'Which is correct?', options: ['Would you like any coffee?', 'Would you like some coffee?', 'Would you like much coffee?'], answer: 'Would you like some coffee?', explanation: '表示请求的疑问句用 some。' },
  { id: 'g17c06', grammarId: 'G17', question: 'Choose the correct negative:', options: ["There aren't some students.", "There aren't any students.", "There aren't many students."], answer: "There aren't any students.", explanation: '否定句用 any。' },
  { id: 'g17c07', grammarId: 'G17', question: 'Which is correct?', options: ['Are there some apples?', 'Are there any apples?', 'Are there much apples?'], answer: 'Are there any apples?', explanation: '疑问句用 any。' },
  { id: 'g17c08', grammarId: 'G17', question: 'Choose the correct sentence:', options: ['She has any money.', 'She has some money.', 'She has many money.'], answer: 'She has some money.', explanation: '肯定句用 some。' },
  { id: 'g17c09', grammarId: 'G17', question: 'Which is correct?', options: ["He doesn't have some brothers.", "He doesn't have any brothers.", "He doesn't have much brothers."], answer: "He doesn't have any brothers.", explanation: '否定句用 any。' },
  { id: 'g17c10', grammarId: 'G17', question: 'Choose the correct question:', options: ['How much people are there?', 'How many people are there?', 'How some people are there?'], answer: 'How many people are there?', explanation: 'people 是复数，用 many。' },
];

export const g17Correction: GrammarCorrectionQuestion[] = [
  { id: 'g17x01', grammarId: 'G17', sentence: 'I have any friends.', answer: 'I have some friends.', explanation: '肯定句用 some，不用 any。' },
  { id: 'g17x02', grammarId: 'G17', sentence: "I don't have some money.", answer: "I don't have any money.", explanation: '否定句用 any，不用 some。' },
  { id: 'g17x03', grammarId: 'G17', sentence: 'How much books do you have?', answer: 'How many books do you have?', explanation: 'books 是复数，用 many。' },
  { id: 'g17x04', grammarId: 'G17', sentence: 'How many water is there?', answer: 'How much water is there?', explanation: 'water 是不可数名词，用 much。' },
  { id: 'g17x05', grammarId: 'G17', sentence: 'Would you like any coffee?', answer: 'Would you like some coffee?', explanation: '表示请求的疑问句用 some。' },
  { id: 'g17x06', grammarId: 'G17', sentence: "There aren't some students.", answer: "There aren't any students.", explanation: '否定句用 any，不用 some。' },
  { id: 'g17x07', grammarId: 'G17', sentence: 'Are there some apples?', answer: 'Are there any apples?', explanation: '疑问句用 any，不用 some。' },
  { id: 'g17x08', grammarId: 'G17', sentence: 'She has any money.', answer: 'She has some money.', explanation: '肯定句用 some，不用 any。' },
  { id: 'g17x09', grammarId: 'G17', sentence: "He doesn't have some brothers.", answer: "He doesn't have any brothers.", explanation: '否定句用 any，正确。' },
  { id: 'g17x10', grammarId: 'G17', sentence: 'How much people are there?', answer: 'How many people are there?', explanation: 'people 是复数，用 many。' },
];


// ========= G18: 固定搭配与短语动词 =========
export const grammarG18: GrammarPoint = {
  id: 'G18',
  name: 'Fixed Collocations and Phrasal Verbs',
  nameZh: '固定搭配与短语动词',
  explanation: '固定搭配和短语动词是英语中的重要部分。\n\n【固定搭配】动词+介词/副词的固定组合\n· listen to：听...\n· look for：寻找\n· depend on：取决于\n\n【短语动词】动词+副词/介词，意思often与原来的动词不同\n· give up：放弃\n· look after：照顾\n· take off：起飞；脱掉\n· turn on/off：打开/关闭',
  examples: [
    { en: 'I am looking for my keys.', zh: '我在找我的钥匙。' },
    { en: 'Can you look after my cat?', zh: '你能照顾我的猫吗？' },
    { en: "Turn off the light, please.", zh: '请关灯。' },
  ],
};

export const g18Fill: GrammarFillQuestion[] = [
  { id: 'g18f01', grammarId: 'G18', sentence: 'I am looking ____ my keys.', options: ['for', 'after', 'at'], answer: 'for', explanation: 'look for 表示寻找。' },
  { id: 'g18f02', grammarId: 'G18', sentence: 'Can you look ____ my cat?', options: ['for', 'after', 'at'], answer: 'after', explanation: 'look after 表示照顾。' },
  { id: 'g18f03', grammarId: 'G18', sentence: 'Please turn ____ the light.', options: ['on', 'off', 'up'], answer: 'on', explanation: 'turn on 表示打开。' },
  { id: 'g18f04', grammarId: 'G18', sentence: 'I depend ____ you.', options: ['on', 'for', 'at'], answer: 'on', explanation: 'depend on 表示取决于。' },
  { id: 'g18f05', grammarId: 'G18', sentence: 'He gave ____ smoking.', options: ['up', 'off', 'in'], answer: 'up', explanation: 'give up 表示放弃。' },
  { id: 'g18f06', grammarId: 'G18', sentence: 'The plane took ____.', options: ['off', 'up', 'in'], answer: 'off', explanation: 'take off 表示起飞。' },
  { id: 'g18f07', grammarId: 'G18', sentence: 'I am listening ____ music.', options: ['to', 'for', 'at'], answer: 'to', explanation: 'listen to 表示听...' },
  { id: 'g18f08', grammarId: 'G18', sentence: 'Please turn ____ the TV.', options: ['off', 'on', 'up'], answer: 'off', explanation: 'turn off 表示关闭。' },
  { id: 'g18f09', grammarId: 'G18', sentence: 'She looks ____ her mother.', options: ['like', 'after', 'for'], answer: 'like', explanation: 'look like 表示看起来像。' },
  { id: 'g18f10', grammarId: 'G18', sentence: 'I will call ____ you tomorrow.', options: ['on', '/', 'at'], answer: '/', explanation: 'call 后面直接加宾语，不需要介词。' },
  { id: 'g18f11', grammarId: 'G18', sentence: 'They are looking ____ a new house.', options: ['for', 'after', 'at'], answer: 'for', explanation: 'look for 表示寻找。' },
  { id: 'g18f12', grammarId: 'G18', sentence: 'Can you look ____ the children?', options: ['for', 'after', 'at'], answer: 'after', explanation: 'look after 表示照顾。' },
  { id: 'g18f13', grammarId: 'G18', sentence: 'Please turn ____ the heating.', options: ['on', 'off', 'up'], answer: 'on', explanation: 'turn on 表示打开。' },
  { id: 'g18f14', grammarId: 'G18', sentence: 'It depends ____ the weather.', options: ['on', 'for', 'at'], answer: 'on', explanation: 'depend on 表示取决于。' },
  { id: 'g18f15', grammarId: 'G18', sentence: 'Don\'t give ____!', options: ['up', 'off', 'in'], answer: 'up', explanation: 'give up 表示放弃。' },
  { id: 'g18f16', grammarId: 'G18', sentence: 'The shop closed ____.', options: ['down', 'up', 'off'], answer: 'down', explanation: 'close down 表示关闭（企业）。' },
  { id: 'g18f17', grammarId: 'G18', sentence: 'I am listening ____ the radio.', options: ['to', 'for', 'at'], answer: 'to', explanation: 'listen to 表示听...' },
  { id: 'g18f18', grammarId: 'G18', sentence: 'Turn ____ the computer.', options: ['off', 'on', 'up'], answer: 'off', explanation: 'turn off 表示关闭。' },
  { id: 'g18f19', grammarId: 'G18', sentence: 'He takes ____ his mother.', options: ['after', 'like', 'for'], answer: 'after', explanation: 'take after 表示长得像。' },
  { id: 'g18f20', grammarId: 'G18', sentence: 'I will call ____ him.', options: ['/', 'on', 'at'], answer: '/', explanation: 'call 后面直接加宾语，不需要介词。' },
  { id: 'g18f21', grammarId: 'G18', sentence: 'She is looking ____ a job.', options: ['for', 'after', 'at'], answer: 'for', explanation: 'look for 表示寻找。' },
  { id: 'g18f22', grammarId: 'G18', sentence: 'Can you look ____ my dog?', options: ['for', 'after', 'at'], answer: 'after', explanation: 'look after 表示照顾。' },
  { id: 'g18f23', grammarId: 'G18', sentence: 'Please turn ____ the air conditioning.', options: ['on', 'off', 'up'], answer: 'on', explanation: 'turn on 表示打开。' },
  { id: 'g18f24', grammarId: 'G18', sentence: 'I depend ____ my parents.', options: ['on', 'for', 'at'], answer: 'on', explanation: 'depend on 表示取决于。' },
  { id: 'g18f25', grammarId: 'G18', sentence: 'He gave ____ his dream.', options: ['up', 'off', 'in'], answer: 'up', explanation: 'give up 表示放弃。' },
  { id: 'g18f26', grammarId: 'G18', sentence: 'The bird took ____.', options: ['off', 'up', 'in'], answer: 'off', explanation: 'take off 表示起飞。' },
  { id: 'g18f27', grammarId: 'G18', sentence: 'Are you listening ____ me?', options: ['to', 'for', 'at'], answer: 'to', explanation: 'listen to 表示听...' },
  { id: 'g18f28', grammarId: 'G18', sentence: 'Turn ____ the lights.', options: ['off', 'on', 'up'], answer: 'off', explanation: 'turn off 表示关闭。' },
  { id: 'g18f29', grammarId: 'G18', sentence: 'She looks ____ a model.', options: ['like', 'after', 'for'], answer: 'like', explanation: 'look like 表示看起来像。' },
  { id: 'g18f30', grammarId: 'G18', sentence: 'I will call ____ her tonight.', options: ['/', 'on', 'at'], answer: '/', explanation: 'call 后面直接加宾语，不需要介词。' },
];

export const g18Choice: GrammarChoiceQuestion[] = [
  { id: 'g18c01', grammarId: 'G18', question: 'Which is correct?', options: ['I am looking for my keys.', 'I am looking after my keys.', 'I am looking at my keys.'], answer: 'I am looking for my keys.', explanation: 'look for 表示寻找。' },
  { id: 'g18c02', grammarId: 'G18', question: 'Choose the correct sentence:', options: ['Can you look after my cat?', 'Can you look for my cat?', 'Can you look at my cat?'], answer: 'Can you look after my cat?', explanation: 'look after 表示照顾。' },
  { id: 'g18c03', grammarId: 'G18', question: 'Which is correct?', options: ["Turn on the light, please.", "Turn off the light, please.", "Turn up the light, please."], answer: "Turn on the light, please.", explanation: 'turn on 表示打开。' },
  { id: 'g18c04', grammarId: 'G18', question: 'Choose the correct phrase:', options: ['depend on', 'depend for', 'depend at'], answer: 'depend on', explanation: 'depend on 表示取决于。' },
  { id: 'g18c05', grammarId: 'G18', question: 'Which is correct?', options: ['He gave up smoking.', 'He gave off smoking.', 'He gave in smoking.'], answer: 'He gave up smoking.', explanation: 'give up 表示放弃。' },
  { id: 'g18c06', grammarId: 'G18', question: 'The plane ____.', options: ['took off', 'took up', 'took in'], answer: 'took off', explanation: 'take off 表示起飞。' },
  { id: 'g18c07', grammarId: 'G18', question: 'Which is correct?', options: ['I am listening to music.', 'I am listening for music.', 'I am listening at music.'], answer: 'I am listening to music.', explanation: 'listen to 表示听...' },
  { id: 'g18c08', grammarId: 'G18', question: 'Choose the correct sentence:', options: ["Turn off the TV.", "Turn on the TV.", "Turn up the TV."], answer: "Turn off the TV.", explanation: 'turn off 表示关闭。' },
  { id: 'g18c09', grammarId: 'G18', question: 'She ____ her mother.', options: ['looks like', 'looks after', 'looks for'], answer: 'looks like', explanation: 'look like 表示看起来像。' },
  { id: 'g18c10', grammarId: 'G18', question: 'Which is correct?', options: ['I will call you.', 'I will call on you.', 'I will call at you.'], answer: 'I will call you.', explanation: 'call 后面直接加宾语，不需要介词。' },
];

export const g18Correction: GrammarCorrectionQuestion[] = [
  { id: 'g18x01', grammarId: 'G18', sentence: 'I am looking after my keys.', answer: 'I am looking for my keys.', explanation: 'look for 表示寻找，look after 表示照顾。' },
  { id: 'g18x02', grammarId: 'G18', sentence: 'Can you look for my cat?', answer: 'Can you look after my cat?', explanation: 'look after 表示照顾，look for 表示寻找。' },
  { id: 'g18x03', grammarId: 'G18', sentence: "Turn up the light, please.", answer: "Turn on the light, please.", explanation: 'turn on 表示打开，turn up 表示调大音量。' },
  { id: 'g18x04', grammarId: 'G18', sentence: 'I depend for you.', answer: 'I depend on you.', explanation: 'depend on 表示取决于。' },
  { id: 'g18x05', grammarId: 'G18', sentence: 'He gave off smoking.', answer: 'He gave up smoking.', explanation: 'give up 表示放弃，give off 表示散发。' },
  { id: 'g18x06', grammarId: 'G18', sentence: 'The plane took up.', answer: 'The plane took off.', explanation: 'take off 表示起飞，take up 表示开始从事。' },
  { id: 'g18x07', grammarId: 'G18', sentence: 'I am listening for music.', answer: 'I am listening to music.', explanation: 'listen to 表示听...' },
  { id: 'g18x08', grammarId: 'G18', sentence: 'Please turn off the lights so we can see.', answer: 'Please turn on the lights so we can see.', explanation: 'turn on 表示打开（开灯以便看清），turn off 表示关闭。' },
  { id: 'g18x09', grammarId: 'G18', sentence: 'The nurse looks like the patients.', answer: 'The nurse looks after the patients.', explanation: 'look after 表示照顾，look like 表示看起来像；护士照顾病人。' },
  { id: 'g18x10', grammarId: 'G18', sentence: 'I will call on you.', answer: 'I will call you.', explanation: 'call 后面直接加宾语，不需要介词 on。' },
];


// ========= G19: 条件句 if =========
export const grammarG19: GrammarPoint = {
  id: 'G19',
  name: 'Conditional Sentences (if)',
  nameZh: '条件句 if',
  explanation: '条件句用来描述假设的情况及其结果。\n\n【第一类条件句】可能实现的条件\n· 结构：If + 一般现在时，主语 + will + 动词原形\n· 例：If it rains, I will stay home.\n\n【第二类条件句】不太可能或假设的条件\n· 结构：If + 一般过去时，主语 + would + 动词原形\n· 例：If I won the lottery, I would buy a house.\n\n【注意】if 从句用现在时表示将来，不用 will',
  examples: [
    { en: 'If it rains, we will cancel the picnic.', zh: '如果下雨，我们会取消野餐。' },
    { en: 'If I have time, I will help you.', zh: '如果我有时间，我会帮你。' },
    { en: 'If I were you, I would go.', zh: '如果我是你，我会去。' },
  ],
};

export const g19Fill: GrammarFillQuestion[] = [
  { id: 'g19f01', grammarId: 'G19', sentence: 'If it ____ (rain), we will stay home.', options: ['rain', 'rains', 'will rain'], answer: 'rains', explanation: 'if 从句用一般现在时，不用 will。' },
  { id: 'g19f02', grammarId: 'G19', sentence: 'If I ____ (have) time, I will help you.', options: ['have', 'will have', 'had'], answer: 'have', explanation: 'if 从句用一般现在时。' },
  { id: 'g19f03', grammarId: 'G19', sentence: 'If she ____ (come), I will be happy.', options: ['come', 'comes', 'will come'], answer: 'comes', explanation: 'she 是第三人称单数，动词加 -s。' },
  { id: 'g19f04', grammarId: 'G19', sentence: 'If I ____ (be) you, I would go.', options: ['am', 'be', 'were'], answer: 'were', explanation: '第二类条件句，be 动词用 were。' },
  { id: 'g19f05', grammarId: 'G19', sentence: 'If we ____ (have) money, we will buy it.', options: ['have', 'will have', 'had'], answer: 'have', explanation: 'if 从句用一般现在时。' },
  { id: 'g19f06', grammarId: 'G19', sentence: 'If he ____ (study) hard, he will pass.', options: ['study', 'studies', 'will study'], answer: 'studies', explanation: 'he 是第三人称单数，动词加 -es。' },
  { id: 'g19f07', grammarId: 'G19', sentence: 'If it ____ (snow) tomorrow, we will stay home.', options: ['snow', 'snows', 'will snow'], answer: 'snows', explanation: 'if 从句用一般现在时。' },
  { id: 'g19f08', grammarId: 'G19', sentence: 'If I ____ (can) swim, I would go to the beach.', options: ['can', 'could', 'will can'], answer: 'could', explanation: '第二类条件句，can 变成 could。' },
  { id: 'g19f09', grammarId: 'G19', sentence: 'If you ____ (go) now, you will be late.', options: ['go', 'will go', 'went'], answer: 'go', explanation: 'if 从句用一般现在时，不用 will。' },
  { id: 'g19f10', grammarId: 'G19', sentence: 'If we ____ (live) in Beijing, I would learn Chinese.', options: ['live', 'lived', 'will live'], answer: 'lived', explanation: '第二类条件句，用一般过去时。' },
  { id: 'g19f11', grammarId: 'G19', sentence: 'If she ____ (call), I will answer.', options: ['call', 'calls', 'will call'], answer: 'calls', explanation: 'she 是第三人称单数，动词加 -s。' },
  { id: 'g19f12', grammarId: 'G19', sentence: 'If I ____ (know) his number, I would call him.', options: ['know', 'knew', 'will know'], answer: 'knew', explanation: '第二类条件句，用一般过去时。' },
  { id: 'g19f13', grammarId: 'G19', sentence: 'If they ____ (come) tomorrow, we will have a party.', options: ['come', 'will come', 'came'], answer: 'come', explanation: 'if 从句用一般现在时。' },
  { id: 'g19f14', grammarId: 'G19', sentence: 'If it ____ (be) sunny, we will go to the park.', options: ['is', 'will be', 'was'], answer: 'is', explanation: 'if 从句用一般现在时。' },
  { id: 'g19f15', grammarId: 'G19', sentence: 'If I ____ (be) rich, I would buy a car.', options: ['am', 'were', 'will be'], answer: 'were', explanation: '第二类条件句，be 动词用 were。' },
  { id: 'g19f16', grammarId: 'G19', sentence: 'If he ____ (not / come), I will be angry.', options: ["doesn't come", "won't come", "didn't come"], answer: "doesn't come", explanation: 'if 从句用一般现在时的否定。' },
  { id: 'g19f17', grammarId: 'G19', sentence: 'If we ____ (have) a car, we would travel a lot.', options: ['have', 'had', 'will have'], answer: 'had', explanation: '第二类条件句，用一般过去时。' },
  { id: 'g19f18', grammarId: 'G19', sentence: 'If she ____ (be) here, she would help us.', options: ['is', 'was', 'will be'], answer: 'was', explanation: '第二类条件句，用一般过去时。' },
  { id: 'g19f19', grammarId: 'G19', sentence: 'If you ____ (not / go) now, you will be late.', options: ["don't go", "won't go", "didn't go"], answer: "don't go", explanation: 'if 从句用一般现在时的否定。' },
  { id: 'g19f20', grammarId: 'G19', sentence: 'If I ____ (see) him, I will tell him.', options: ['see', 'saw', 'will see'], answer: 'see', explanation: 'if 从句用一般现在时。' },
  { id: 'g19f21', grammarId: 'G19', sentence: 'If it ____ (rain) yesterday, the ground would be wet.', options: ['rained', 'rains', 'would rain'], answer: 'rained', explanation: '第二类条件句，用一般过去时。' },
  { id: 'g19f22', grammarId: 'G19', sentence: 'If they ____ (invite) me, I will go.', options: ['invite', 'invites', 'will invite'], answer: 'invite', explanation: 'if 从句用一般现在时。' },
  { id: 'g19f23', grammarId: 'G19', sentence: 'If I ____ (can) help, I would.', options: ['can', 'could', 'will can'], answer: 'could', explanation: '第二类条件句，can 变成 could。' },
  { id: 'g19f24', grammarId: 'G19', sentence: 'If he ____ (not / be) busy, he will come.', options: ["isn't", "won't be", "wasn't"], answer: "isn't", explanation: 'if 从句用一般现在时的否定。' },
  { id: 'g19f25', grammarId: 'G19', sentence: 'If we ____ (go) to Paris, I would visit the Eiffel Tower.', options: ['go', 'went', 'will go'], answer: 'went', explanation: '第二类条件句，用一般过去时。' },
  { id: 'g19f26', grammarId: 'G19', sentence: 'If she ____ (study) hard, she will pass the exam.', options: ['studies', 'studied', 'will study'], answer: 'studies', explanation: 'she 是第三人称单数，动词加 -es。' },
  { id: 'g19f27', grammarId: 'G19', sentence: 'If I ____ (have) more time, I would read more.', options: ['have', 'had', 'will have'], answer: 'had', explanation: '第二类条件句，用一般过去时。' },
  { id: 'g19f28', grammarId: 'G19', sentence: 'If you ____ (not / come), I will be sad.', options: ["don't come", "won't come", "didn't come"], answer: "don't come", explanation: 'if 从句用一般现在时的否定。' },
  { id: 'g19f29', grammarId: 'G19', sentence: 'If it ____ (be) cold tomorrow, I will wear a coat.', options: ['is', 'was', 'will be'], answer: 'is', explanation: 'if 从句用一般现在时。' },
  { id: 'g19f30', grammarId: 'G19', sentence: 'If I ____ (be) taller, I could reach the shelf.', options: ['am', 'were', 'will be'], answer: 'were', explanation: '第二类条件句，be 动词用 were。' },
];

export const g19Choice: GrammarChoiceQuestion[] = [
  { id: 'g19c01', grammarId: 'G19', question: 'Which is correct?', options: ['If it will rain, I will stay home.', 'If it rains, I will stay home.', 'If it rained, I will stay home.'], answer: 'If it rains, I will stay home.', explanation: 'if 从句用一般现在时，不用 will。' },
  { id: 'g19c02', grammarId: 'G19', question: 'Choose the correct sentence:', options: ['If I will have time, I will help.', 'If I have time, I will help.', 'If I had time, I will help.'], answer: 'If I have time, I will help.', explanation: 'if 从句用一般现在时。' },
  { id: 'g19c03', grammarId: 'G19', question: 'Which is correct? (Second conditional)', options: ['If I am you, I will go.', 'If I were you, I would go.', 'If I will be you, I would go.'], answer: 'If I were you, I would go.', explanation: '第二类条件句，be 动词用 were，主句用 would。' },
  { id: 'g19c04', grammarId: 'G19', question: 'Choose the correct sentence:', options: ['If she comes, I will be happy.', 'If she will come, I will be happy.', 'If she came, I will be happy.'], answer: 'If she comes, I will be happy.', explanation: 'if 从句用一般现在时，she 动词加 -s。' },
  { id: 'g19c05', grammarId: 'G19', question: 'Which is correct?', options: ['If I can swim, I would go.', 'If I could swim, I would go.', 'If I will can swim, I would go.'], answer: 'If I could swim, I would go.', explanation: '第二类条件句，can 变成 could。' },
  { id: 'g19c06', grammarId: 'G19', question: 'Choose the correct negative:', options: ["If it doesn't rain, we will go.", "If it won't rain, we will go.", "If it didn't rain, we will go."], answer: "If it doesn't rain, we will go.", explanation: 'if 从句否定用 don\'t/doesn\'t。' },
  { id: 'g19c07', grammarId: 'G19', question: 'Which is correct? (Second conditional)', options: ['If I have money, I would buy it.', 'If I had money, I would buy it.', 'If I will have money, I would buy it.'], answer: 'If I had money, I would buy it.', explanation: '第二类条件句，从句用一般过去时。' },
  { id: 'g19c08', grammarId: 'G19', question: 'Choose the correct sentence:', options: ['I will go if it is sunny.', 'I will go if it will be sunny.', 'I will go if it was sunny.'], answer: 'I will go if it is sunny.', explanation: 'if 从句用一般现在时。' },
  { id: 'g19c09', grammarId: 'G19', question: 'Which is correct?', options: ['If I am rich, I would buy a car.', 'If I were rich, I would buy a car.', 'If I will be rich, I would buy a car.'], answer: 'If I were rich, I would buy a car.', explanation: '第二类条件句，be 动词用 were。' },
  { id: 'g19c10', grammarId: 'G19', question: 'Choose the correct sentence:', options: ["If you don't go now, you will be late.", "If you won't go now, you will be late.", "If you didn't go now, you will be late."], answer: "If you don't go now, you will be late.", explanation: 'if 从句否定用 don\'t。' },
];

export const g19Correction: GrammarCorrectionQuestion[] = [
  { id: 'g19x01', grammarId: 'G19', sentence: 'If it will rain, I will stay home.', answer: 'If it rains, I will stay home.', explanation: 'if 从句用一般现在时，不用 will。' },
  { id: 'g19x02', grammarId: 'G19', sentence: 'If I will have time, I will help you.', answer: 'If I have time, I will help you.', explanation: 'if 从句用一般现在时，不用 will。' },
  { id: 'g19x03', grammarId: 'G19', sentence: 'If I am you, I would go.', answer: 'If I were you, I would go.', explanation: '第二类条件句，be 动词用 were。' },
  { id: 'g19x04', grammarId: 'G19', sentence: 'If she will come, I will be happy.', answer: 'If she comes, I will be happy.', explanation: 'if 从句用一般现在时，she 动词加 -s。' },
  { id: 'g19x05', grammarId: 'G19', sentence: 'If I can swim, I would go.', answer: 'If I could swim, I would go.', explanation: '第二类条件句，can 变成 could。' },
  { id: 'g19x06', grammarId: 'G19', sentence: "If it won't rain, we will go.", answer: "If it doesn't rain, we will go.", explanation: 'if 从句否定用 don\'t/doesn\'t，不用 won\'t。' },
  { id: 'g19x07', grammarId: 'G19', sentence: 'If I have money, I would buy it.', answer: 'If I had money, I would buy it.', explanation: '第二类条件句，从句用一般过去时。' },
  { id: 'g19x08', grammarId: 'G19', sentence: 'I will go if it will be sunny.', answer: 'I will go if it is sunny.', explanation: 'if 从句用一般现在时，不用 will。' },
  { id: 'g19x09', grammarId: 'G19', sentence: 'If I am rich, I would buy a car.', answer: 'If I were rich, I would buy a car.', explanation: '第二类条件句，be 动词用 were。' },
  { id: 'g19x10', grammarId: 'G19', sentence: "If you won't go now, you will be late.", answer: "If you don't go now, you will be late.", explanation: 'if 从句否定用 don\'t，不用 won\'t。' },
];


// ========= G20: 动名词 / 不定式 =========
export const grammarG20: GrammarPoint = {
  id: 'G20',
  name: 'Gerund and Infinitive',
  nameZh: '动名词 / 不定式',
  explanation: '动名词（-ing）和不定式（to do）的用法。\n\n【动名词 -ing】\n· 作主语：Swimming is good exercise.\n· 介词后：I am interested in learning French.\n· 某些动词后：enjoy, mind, avoid + -ing\n\n【不定式 to do】\n· 表示目的：I came here to learn.\n· 某些动词后：want, decide, promise + to do\n· 名词/形容词后：It is important to sleep well.\n\n【区别】remember/stop/forget + to do（未做）vs + -ing（已做）',
  examples: [
    { en: 'I enjoy swimming.', zh: '我喜欢游泳。' },
    { en: 'I want to learn French.', zh: '我想学法语。' },
    { en: 'It is important to sleep well.', zh: '睡好觉很重要。' },
  ],
};

export const g20Fill: GrammarFillQuestion[] = [
  { id: 'g20f01', grammarId: 'G20', sentence: 'I enjoy ____ (swim).', options: ['swim', 'swimming', 'to swim'], answer: 'swimming', explanation: 'enjoy 后接 -ing。' },
  { id: 'g20f02', grammarId: 'G20', sentence: 'I want ____ (learn) French.', options: ['learn', 'learning', 'to learn'], answer: 'to learn', explanation: 'want 后接 to do。' },
  { id: 'g20f03', grammarId: 'G20', sentence: 'She decided ____ (go) home.', options: ['go', 'going', 'to go'], answer: 'to go', explanation: 'decide 后接 to do。' },
  { id: 'g20f04', grammarId: 'G20', sentence: 'I am interested in ____ (read).', options: ['read', 'reading', 'to read'], answer: 'reading', explanation: '介词 in 后接 -ing。' },
  { id: 'g20f05', grammarId: 'G20', sentence: 'It is important ____ (sleep) well.', options: ['sleep', 'sleeping', 'to sleep'], answer: 'to sleep', explanation: 'It is + adj + to do。' },
  { id: 'g20f06', grammarId: 'G20', sentence: 'He promised ____ (help) me.', options: ['help', 'helping', 'to help'], answer: 'to help', explanation: 'promise 后接 to do。' },
  { id: 'g20f07', grammarId: 'G20', sentence: 'I mind ____ (open) the window.', options: ['open', 'opening', 'to open'], answer: 'opening', explanation: 'mind 后接 -ing。' },
  { id: 'g20f08', grammarId: 'G20', sentence: 'She came here ____ (study).', options: ['study', 'studying', 'to study'], answer: 'to study', explanation: '表示目的，用 to do。' },
  { id: 'g20f09', grammarId: 'G20', sentence: 'I avoided ____ (see) him.', options: ['see', 'seeing', 'to see'], answer: 'seeing', explanation: 'avoid 后接 -ing。' },
  { id: 'g20f10', grammarId: 'G20', sentence: 'It is difficult ____ (understand).', options: ['understand', 'understanding', 'to understand'], answer: 'to understand', explanation: 'It is + adj + to do。' },
  { id: 'g20f11', grammarId: 'G20', sentence: 'I suggest ____ (go) by bus.', options: ['go', 'going', 'to go'], answer: 'going', explanation: 'suggest 后接 -ing。' },
  { id: 'g20f12', grammarId: 'G20', sentence: 'I hope ____ (see) you.', options: ['see', 'seeing', 'to see'], answer: 'to see', explanation: 'hope 后接 to do。' },
  { id: 'g20f13', grammarId: 'G20', sentence: 'She is good at ____ (cook).', options: ['cook', 'cooking', 'to cook'], answer: 'cooking', explanation: '介词 at 后接 -ing。' },
  { id: 'g20f14', grammarId: 'G20', sentence: 'I need ____ (finish) this.', options: ['finish', 'finishing', 'to finish'], answer: 'to finish', explanation: 'need 后接 to do。' },
  { id: 'g20f15', grammarId: 'G20', sentence: 'He finished ____ (eat).', options: ['eat', 'eating', 'to eat'], answer: 'eating', explanation: 'finish 后接 -ing。' },
  { id: 'g20f16', grammarId: 'G20', sentence: 'It is easy ____ (do).', options: ['do', 'doing', 'to do'], answer: 'to do', explanation: 'It is + adj + to do。' },
  { id: 'g20f17', grammarId: 'G20', sentence: 'I miss ____ (see) you.', options: ['see', 'seeing', 'to see'], answer: 'seeing', explanation: 'miss 后接 -ing。' },
  { id: 'g20f18', grammarId: 'G20', sentence: 'She wants ____ (be) a doctor.', options: ['be', 'being', 'to be'], answer: 'to be', explanation: 'want 后接 to do。' },
  { id: 'g20f19', grammarId: 'G20', sentence: 'I am tired of ____ (work).', options: ['work', 'working', 'to work'], answer: 'working', explanation: '介词 of 后接 -ing。' },
  { id: 'g20f20', grammarId: 'G20', sentence: 'It is nice ____ (meet) you.', options: ['meet', 'meeting', 'to meet'], answer: 'to meet', explanation: 'It is + adj + to do。' },
  { id: 'g20f21', grammarId: 'G20', sentence: 'I practice ____ (speak) English.', options: ['speak', 'speaking', 'to speak'], answer: 'speaking', explanation: 'practice 后接 -ing。' },
  { id: 'g20f22', grammarId: 'G20', sentence: 'I decided ____ (buy) a new phone.', options: ['buy', 'buying', 'to buy'], answer: 'to buy', explanation: 'decide 后接 to do。' },
  { id: 'g20f23', grammarId: 'G20', sentence: 'He is afraid of ____ (fly).', options: ['fly', 'flying', 'to fly'], answer: 'flying', explanation: '介词 of 后接 -ing。' },
  { id: 'g20f24', grammarId: 'G20', sentence: 'I hope ____ (pass) the exam.', options: ['pass', 'passing', 'to pass'], answer: 'to pass', explanation: 'hope 后接 to do。' },
  { id: 'g20f25', grammarId: 'G20', sentence: 'She kept ____ (work) all night.', options: ['work', 'working', 'to work'], answer: 'working', explanation: 'keep 后接 -ing。' },
  { id: 'g20f26', grammarId: 'G20', sentence: 'It is dangerous ____ (climb) mountains.', options: ['climb', 'climbing', 'to climb'], answer: 'to climb', explanation: 'It is + adj + to do。' },
  { id: 'g20f27', grammarId: 'G20', sentence: 'I dislike ____ (get) up early.', options: ['get', 'getting', 'to get'], answer: 'getting', explanation: 'dislike 后接 -ing。' },
  { id: 'g20f28', grammarId: 'G20', sentence: 'He promised ____ (call) me.', options: ['call', 'calling', 'to call'], answer: 'to call', explanation: 'promise 后接 to do。' },
  { id: 'g20f29', grammarId: 'G20', sentence: 'I am thinking of ____ (move).', options: ['move', 'moving', 'to move'], answer: 'moving', explanation: '介词 of 后接 -ing。' },
  { id: 'g20f30', grammarId: 'G20', sentence: 'It is fun ____ (play) football.', options: ['play', 'playing', 'to play'], answer: 'to play', explanation: 'It is + adj + to do。' },
];

export const g20Choice: GrammarChoiceQuestion[] = [
  { id: 'g20c01', grammarId: 'G20', question: 'Which is correct?', options: ['I enjoy to swim.', 'I enjoy swimming.', 'I enjoy swiming.'], answer: 'I enjoy swimming.', explanation: 'enjoy 后接 -ing。' },
  { id: 'g20c02', grammarId: 'G20', question: 'Choose the correct sentence:', options: ['I want to learn French.', 'I want learning French.', 'I want learn French.'], answer: 'I want to learn French.', explanation: 'want 后接 to do。' },
  { id: 'g20c03', grammarId: 'G20', question: 'Which is correct?', options: ['I decided going home.', 'I decided to go home.', 'I decided go home.'], answer: 'I decided to go home.', explanation: 'decide 后接 to do。' },
  { id: 'g20c04', grammarId: 'G20', question: 'Choose the correct sentence:', options: ['I am interested in read.', 'I am interested in reading.', 'I am interested in to read.'], answer: 'I am interested in reading.', explanation: '介词 in 后接 -ing。' },
  { id: 'g20c05', grammarId: 'G20', question: 'Which shows purpose?', options: ['I came here learning.', 'I came here to learn.', 'I came here learn.'], answer: 'I came here to learn.', explanation: '表示目的用 to do。' },
  { id: 'g20c06', grammarId: 'G20', question: 'Choose the correct sentence:', options: ['He promised helping me.', 'He promised to help me.', 'He promised help me.'], answer: 'He promised to help me.', explanation: 'promise 后接 to do。' },
  { id: 'g20c07', grammarId: 'G20', question: 'Which is correct?', options: ['I mind to open it.', 'I mind opening it.', 'I mind open it.'], answer: 'I mind opening it.', explanation: 'mind 后接 -ing。' },
  { id: 'g20c08', grammarId: 'G20', question: 'Choose the correct sentence:', options: ['It is important sleeping well.', 'It is important to sleep well.', 'It is important sleep well.'], answer: 'It is important to sleep well.', explanation: 'It is + adj + to do。' },
  { id: 'g20c09', grammarId: 'G20', question: 'Which is correct?', options: ['I avoided to see him.', 'I avoided seeing him.', 'I avoided see him.'], answer: 'I avoided seeing him.', explanation: 'avoid 后接 -ing。' },
  { id: 'g20c10', grammarId: 'G20', question: 'Choose the correct sentence:', options: ['I suggest to go by bus.', 'I suggest going by bus.', 'I suggest go by bus.'], answer: 'I suggest going by bus.', explanation: 'suggest 后接 -ing。' },
];

export const g20Correction: GrammarCorrectionQuestion[] = [
  { id: 'g20x01', grammarId: 'G20', sentence: 'I enjoy to swim.', answer: 'I enjoy swimming.', explanation: 'enjoy 后接 -ing，不用 to do。' },
  { id: 'g20x02', grammarId: 'G20', sentence: 'I want learning French.', answer: 'I want to learn French.', explanation: 'want 后接 to do，不用 -ing。' },
  { id: 'g20x03', grammarId: 'G20', sentence: 'I decided going home.', answer: 'I decided to go home.', explanation: 'decide 后接 to do，不用 -ing。' },
  { id: 'g20x04', grammarId: 'G20', sentence: 'I am interested in read.', answer: 'I am interested in reading.', explanation: '介词 in 后接 -ing。' },
  { id: 'g20x05', grammarId: 'G20', sentence: 'He promised helping me.', answer: 'He promised to help me.', explanation: 'promise 后接 to do，不用 -ing。' },
  { id: 'g20x06', grammarId: 'G20', sentence: 'I mind to open it.', answer: 'I mind opening it.', explanation: 'mind 后接 -ing，不用 to do。' },
  { id: 'g20x07', grammarId: 'G20', sentence: 'It is important sleeping well.', answer: 'It is important to sleep well.', explanation: 'It is + adj + to do。' },
  { id: 'g20x08', grammarId: 'G20', sentence: 'I avoided to see him.', answer: 'I avoided seeing him.', explanation: 'avoid 后接 -ing，不用 to do。' },
  { id: 'g20x09', grammarId: 'G20', sentence: 'I suggest to go by bus.', answer: 'I suggest going by bus.', explanation: 'suggest 后接 -ing，不用 to do。' },
  { id: 'g20x10', grammarId: 'G20', sentence: 'She came here studying.', answer: 'She came here to study.', explanation: '表示目的用 to do。' },
];

// ========= 汇总导出 =========
export const allGrammarPoints = [
  grammarG01, grammarG02, grammarG03, grammarG04, grammarG05,
  grammarG06, grammarG07, grammarG08, grammarG09, grammarG10,
  grammarG11, grammarG12, grammarG13, grammarG14, grammarG15,
  grammarG16, grammarG17, grammarG18, grammarG19, grammarG20,
];


