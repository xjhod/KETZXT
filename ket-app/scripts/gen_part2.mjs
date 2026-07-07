// ============================================================
// KET 阅读 Part 2 信息匹配 - 数据生成脚本
// 用法: node scripts/gen_part2.mjs
// 读取 src/data/reading.ts，替换 part2Articles 数组为真实内容
// ============================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const READING_TS = join(ROOT, 'src', 'data', 'reading.ts');

// ------------------------------------------------------------
// 50 道 KET Part 2 信息匹配题（A2 级别，真实可读内容）
// 每题: 5 个人物(people) + 8 条陈述(statements)
// statements 元素格式: [文本, 正确人物下标(0-4)]
// 设计原则: 每条陈述都明确对应一个人物的需求，分布合理
// ------------------------------------------------------------
const SPECS = [
  {
    id: 'p2-001', title: 'Travel Destinations', titleZh: '旅行目的地',
    difficulty: 'easy', topic: '旅行',
    people: [
      'PersonA wants a quiet beach with no crowds.',
      'PersonB loves old buildings and history.',
      'PersonC wants to see wild animals.',
      'PersonD likes busy cities and shopping.',
      'PersonE enjoys mountains and long walks.',
    ],
    statements: [
      ['A small island with empty beaches and very few visitors.', 0],
      ['A city full of shops, markets and bright lights.', 3],
      ['Ancient castles and museums on every street.', 1],
      ['A national park where you can watch lions and elephants.', 2],
      ['High hills with long paths for hikers.', 4],
      ['A quiet village by the sea, perfect for a rest.', 0],
      ['A modern town with big shopping centres.', 3],
      ['A forest area with birds and monkeys to observe.', 2],
    ],
  },
  {
    id: 'p2-002', title: 'Weekend Plans', titleZh: '周末计划',
    difficulty: 'easy', topic: '休闲',
    people: [
      'PersonA wants to stay at home and relax.',
      'PersonB would like to eat good food.',
      'PersonC hopes to learn something new.',
      'PersonD wants to do exercise outside.',
      'PersonE enjoys watching films.',
    ],
    statements: [
      ['A cooking class where you make pizza.', 2],
      ['A football match in the park this Saturday.', 3],
      ['A new action film at the cinema tonight.', 4],
      ['A quiet afternoon reading in the garden.', 0],
      ['A famous restaurant with cheap lunches.', 1],
      ['An online course about painting.', 2],
      ['A long bike ride along the river.', 3],
      ['A box set of old comedies at home.', 0],
    ],
  },
  {
    id: 'p2-003', title: 'Hobbies', titleZh: '爱好',
    difficulty: 'easy', topic: '兴趣',
    people: [
      'PersonA likes making things with hands.',
      'PersonB enjoys music and singing.',
      'PersonC loves reading books.',
      'PersonD wants to play a sport.',
      'PersonE likes taking photos.',
    ],
    statements: [
      ['A camera club that meets every Sunday.', 4],
      ['A guitar lesson for beginners.', 1],
      ['A library with free novels to borrow.', 2],
      ['A football team looking for players.', 3],
      ['A class where you build model planes.', 0],
      ['A singing group at the community centre.', 1],
      ['A shop selling pencils and sketchbooks.', 0],
      ['A magazine about famous writers.', 2],
    ],
  },
  {
    id: 'p2-004', title: 'Travel Plans', titleZh: '旅行计划',
    difficulty: 'easy', topic: '旅行',
    people: [
      'PersonA needs a cheap place to sleep.',
      'PersonB wants to travel by train.',
      'PersonC likes warm weather.',
      'PersonD wants to visit family.',
      'PersonE enjoys boat trips.',
    ],
    statements: [
      ['A small hostel with beds for £10 a night.', 0],
      ['A fast train to the mountains every morning.', 1],
      ['A sunny island with 30°C all week.', 2],
      ['A ferry across the lake at sunset.', 4],
      ['A house in the next town where her mother lives.', 3],
      ['A budget hotel near the station.', 0],
      ['A cruise along the river with dinner.', 4],
      ['A warm beach resort for the holiday.', 2],
    ],
  },
  {
    id: 'p2-005', title: 'After-school Clubs', titleZh: '课后俱乐部',
    difficulty: 'easy', topic: '校园',
    people: [
      'PersonA wants to play an instrument.',
      'PersonB likes computers and robots.',
      'PersonC enjoys drawing.',
      'PersonD wants to play a team game.',
      'PersonE loves animals.',
    ],
    statements: [
      ['A violin group that practises on Tuesdays.', 0],
      ['A science club that builds small robots.', 1],
      ['An art room open after school.', 2],
      ['A basketball team for all levels.', 3],
      ['A pet-care group with the school rabbits.', 4],
      ['A piano teacher available at lunch.', 0],
      ['A coding competition next month.', 1],
      ['A painting exhibition by students.', 2],
    ],
  },
  {
    id: 'p2-006', title: 'Birthday Gifts', titleZh: '生日礼物',
    difficulty: 'easy', topic: '礼物',
    people: [
      'PersonA loves football.',
      'PersonB likes sweets and chocolate.',
      'PersonC enjoys reading stories.',
      'PersonD wants to learn the guitar.',
      'PersonE likes taking pictures.',
    ],
    statements: [
      ['A real football with his name on it.', 0],
      ['A box of dark chocolate from Belgium.', 1],
      ['The new adventure book by her favourite writer.', 2],
      ['A second-hand guitar in good condition.', 3],
      ['A small digital camera for holidays.', 4],
      ['Tickets to a football match.', 0],
      ['A notebook for writing stories.', 2],
      ['A beginner guitar course online.', 3],
    ],
  },
  {
    id: 'p2-007', title: 'Restaurants', titleZh: '餐厅',
    difficulty: 'easy', topic: '美食',
    people: [
      'PersonA is a vegetarian.',
      'PersonB loves Italian food.',
      'PersonC wants a cheap meal.',
      'PersonD likes spicy dishes.',
      'PersonE wants a place for children.',
    ],
    statements: [
      ['A cafe with salads and meat-free burgers.', 0],
      ['A pizzeria with fresh pasta.', 1],
      ['A street stall with meals under £5.', 2],
      ['A Thai restaurant with hot curries.', 3],
      ['A family diner with a play area.', 4],
      ['A juice bar with no meat dishes.', 0],
      ['A small trattoria in the old town.', 1],
      ['A play centre with kids menu.', 4],
    ],
  },
  {
    id: 'p2-008', title: 'Summer Courses', titleZh: '暑期课程',
    difficulty: 'medium', topic: '学习',
    people: [
      'PersonA wants to improve English.',
      'PersonB likes sports and water.',
      'PersonC enjoys art and design.',
      'PersonD wants to learn to cook.',
      'PersonE is interested in science.',
    ],
    statements: [
      ['An English camp with games and trips.', 0],
      ['A swimming and sailing school.', 1],
      ['A fashion design workshop.', 2],
      ['A baking class for teenagers.', 3],
      ['A young inventors laboratory.', 4],
      ['A conversation club every morning.', 0],
      ['A painting and sculpture course.', 2],
      ['A kitchen skills programme.', 3],
    ],
  },
  {
    id: 'p2-009', title: 'Films to Watch', titleZh: '电影推荐',
    difficulty: 'easy', topic: '影视',
    people: [
      'PersonA likes funny films.',
      'PersonB enjoys scary stories.',
      'PersonC loves cartoon movies.',
      'PersonD wants to see real animals.',
      'PersonE likes adventure films.',
    ],
    statements: [
      ['A comedy about a clumsy detective.', 0],
      ['A horror film set in a dark forest.', 1],
      ['A cartoon about a talking cat.', 2],
      ['A documentary about African elephants.', 3],
      ['A pirate story on the open sea.', 4],
      ['A silly movie with talking animals.', 0],
      ['A thriller with a surprising end.', 1],
      ['A journey to a lost island.', 4],
    ],
  },
  {
    id: 'p2-010', title: 'Pets to Adopt', titleZh: '领养宠物',
    difficulty: 'easy', topic: '动物',
    people: [
      'PersonA lives in a small flat.',
      'PersonB has a big garden.',
      'PersonC wants a quiet animal.',
      'PersonD wants a friendly dog.',
      'PersonE likes small animals.',
    ],
    statements: [
      ['A small fish that needs little space.', 0],
      ['A young dog that loves to run.', 3],
      ['A quiet old cat for a calm home.', 2],
      ['A rabbit that enjoys the garden.', 1],
      ['A hamster in a small cage.', 4],
      ['A puppy good with children.', 3],
      ['A turtle that lives in water.', 0],
      ['A horse for a large field.', 1],
    ],
  },
  {
    id: 'p2-011', title: 'Books to Read', titleZh: '好书推荐',
    difficulty: 'easy', topic: '阅读',
    people: [
      'PersonA likes funny stories.',
      'PersonB enjoys mysteries.',
      'PersonC loves space and planets.',
      'PersonD wants to learn to cook.',
      'PersonE likes books about animals.',
    ],
    statements: [
      ['A silly book about a laughing prince.', 0],
      ['A detective story with a clever ending.', 1],
      ['A guide to the stars and the moon.', 2],
      ['A recipe book for young chefs.', 3],
      ['A true story about a brave dog.', 4],
      ['A comic novel for the beach.', 0],
      ['A science book about rockets.', 2],
      ['A cookbook with easy dinners.', 3],
    ],
  },
  {
    id: 'p2-012', title: 'Sports to Try', titleZh: '尝试的运动',
    difficulty: 'easy', topic: '运动',
    people: [
      'PersonA wants a sport with a ball.',
      'PersonB likes water sports.',
      'PersonC enjoys individual exercise.',
      'PersonD wants a team game.',
      'PersonE likes fast movement.',
    ],
    statements: [
      ['A tennis lesson in the park.', 0],
      ['A swimming class for all ages.', 1],
      ['A yoga session every morning.', 2],
      ['A volleyball club on the beach.', 3],
      ['A running group around the lake.', 4],
      ['A football training on Saturdays.', 3],
      ['A diving course at the pool.', 1],
      ['A badminton game for two.', 0],
    ],
  },
  {
    id: 'p2-013', title: 'Jobs for Students', titleZh: '学生兼职',
    difficulty: 'medium', topic: '工作',
    people: [
      'PersonA is good with children.',
      "PersonB can speak two languages.",
      'PersonC likes working with food.',
      'PersonD enjoys computers.',
      'PersonE likes being outside.',
    ],
    statements: [
      ['A babysitter needed on weekends.', 0],
      ['A translator for a travel office.', 1],
      ['A shop assistant in a bakery.', 2],
      ['A website helper for a small firm.', 3],
      ['A garden worker in the park.', 4],
      ['A language teacher for beginners.', 1],
      ['A cafe cook on Friday nights.', 2],
      ['A dog walker in the mornings.', 4],
    ],
  },
  {
    id: 'p2-014', title: 'Music Concerts', titleZh: '音乐会',
    difficulty: 'easy', topic: '音乐',
    people: [
      'PersonA likes classical music.',
      'PersonB enjoys pop songs.',
      'PersonC loves jazz.',
      'PersonD wants to dance.',
      'PersonE likes guitar music.',
    ],
    statements: [
      ['An orchestra playing Beethoven.', 0],
      ['A famous pop star on tour.', 1],
      ['A small jazz band in a cafe.', 2],
      ['A DJ night with loud beats.', 3],
      ['A flamenco guitarist from Spain.', 4],
      ['A piano concert on Sunday.', 0],
      ['A summer pop festival.', 1],
      ['A blues guitarist downtown.', 4],
    ],
  },
  {
    id: 'p2-015', title: 'Holiday Activities', titleZh: '假期活动',
    difficulty: 'easy', topic: '休闲',
    people: [
      'PersonA wants to learn to swim.',
      'PersonB likes making friends.',
      'PersonC enjoys nature.',
      'PersonD wants to ride horses.',
      'PersonE likes building things.',
    ],
    statements: [
      ['A swimming pool open all day.', 0],
      ['A camp with group games.', 1],
      ['A forest walk with a guide.', 2],
      ['A stable with riding lessons.', 3],
      ['A workshop to build a birdhouse.', 4],
      ['A lifeguard training course.', 0],
      ['A picnic in the countryside.', 2],
      ['A carpentry class for kids.', 4],
    ],
  },
  {
    id: 'p2-016', title: 'Apps to Download', titleZh: '推荐应用',
    difficulty: 'medium', topic: '科技',
    people: [
      'PersonA wants to learn words.',
      'PersonB likes to draw.',
      'PersonC wants to keep fit.',
      'PersonD enjoys cooking.',
      'PersonE likes music.',
    ],
    statements: [
      ['A daily vocabulary game.', 0],
      ['A simple drawing pad app.', 1],
      ['A step counter and workout planner.', 2],
      ['A recipe app with videos.', 3],
      ['A free music streaming service.', 4],
      ['A flashcard app for exams.', 0],
      ['A paint tool with colours.', 1],
      ['A running music player.', 4],
    ],
  },
  {
    id: 'p2-017', title: 'Places to Study', titleZh: '学习场所',
    difficulty: 'easy', topic: '学习',
    people: [
      'PersonA needs a quiet room.',
      'PersonB wants free wifi.',
      'PersonC likes books around.',
      'PersonD wants a group space.',
      'PersonE needs coffee nearby.',
    ],
    statements: [
      ['A silent study hall on the top floor.', 0],
      ['A cafe with fast internet.', 1],
      ['A library with many desks.', 2],
      ['A meeting room for projects.', 3],
      ['A coffee shop with warm seats.', 4],
      ['A reading corner with no noise.', 0],
      ['A co-working space downtown.', 1],
      ['A book cafe open late.', 4],
    ],
  },
  {
    id: 'p2-018', title: 'Gifts for Family', titleZh: '给家人的礼物',
    difficulty: 'easy', topic: '礼物',
    people: [
      'PersonA wants a gift for Mum.',
      'PersonB wants a gift for Dad.',
      'PersonC wants a gift for a baby.',
      'PersonD wants a gift for Grandma.',
      'PersonE wants a gift for a friend.',
    ],
    statements: [
      ['A flower box with a nice card.', 0],
      ['A tool kit for the garage.', 1],
      ['A soft toy for a small child.', 2],
      ['A warm scarf she will like.', 3],
      ['A funny mug with a joke.', 4],
      ['A photo album of the family.', 0],
      ['A book of old recipes.', 3],
      ['A key ring with his name.', 1],
    ],
  },
  {
    id: 'p2-019', title: 'Weekend Trips', titleZh: '周末出游',
    difficulty: 'medium', topic: '旅行',
    people: [
      'PersonA likes the sea.',
      'PersonB enjoys museums.',
      'PersonC wants adventure.',
      'PersonD likes the countryside.',
      'PersonE enjoys markets.',
    ],
    statements: [
      ['A day at a quiet beach.', 0],
      ['A tour of the history museum.', 1],
      ['A zip-line in the mountains.', 2],
      ['A walk in the green hills.', 3],
      ['A visit to the food market.', 4],
      ['A boat trip on the coast.', 0],
      ['An art gallery afternoon.', 1],
      ['A farm shop with fresh eggs.', 4],
    ],
  },
  {
    id: 'p2-020', title: 'Cooking Classes', titleZh: '烹饪课',
    difficulty: 'medium', topic: '美食',
    people: [
      'PersonA wants to bake bread.',
      'PersonB likes Asian food.',
      'PersonC enjoys sweets.',
      'PersonD wants healthy meals.',
      'PersonE likes pasta.',
    ],
    statements: [
      ['A bread-making workshop.', 0],
      ['A sushi rolling class.', 1],
      ['A chocolate dessert course.', 2],
      ['A salad and soup lesson.', 3],
      ['A fresh pasta class.', 4],
      ['A pizza oven session.', 4],
      ['A cake decorating day.', 2],
      ['A stir-fry evening.', 1],
    ],
  },
  {
    id: 'p2-021', title: 'Outdoor Activities', titleZh: '户外活动',
    difficulty: 'easy', topic: '自然',
    people: [
      'PersonA likes climbing.',
      'PersonB enjoys biking.',
      'PersonC wants to camp.',
      'PersonD likes watching birds.',
      'PersonE enjoys water.',
    ],
    statements: [
      ['A rock wall at the gym.', 0],
      ['A mountain bike trail.', 1],
      ['A tent night under the stars.', 2],
      ['A lake with many wild birds.', 3],
      ['A canoe trip on the river.', 4],
      ['A hill walking club.', 0],
      ['A camping weekend.', 2],
      ['A kayak lesson.', 4],
    ],
  },
  {
    id: 'p2-022', title: 'Computer Games', titleZh: '电脑游戏',
    difficulty: 'medium', topic: '科技',
    people: [
      'PersonA likes racing games.',
      'PersonB enjoys puzzles.',
      'PersonC likes sports games.',
      'PersonD wants to build worlds.',
      'PersonE likes fighting games.',
    ],
    statements: [
      ['A fast car racing simulator.', 0],
      ['A logic game with levels.', 1],
      ['A football manager game.', 2],
      ['A sandbox where you build cities.', 3],
      ['A martial arts battle game.', 4],
      ['A go-kart online race.', 0],
      ['A block-building adventure.', 3],
      ['A boxing video game.', 4],
    ],
  },
  {
    id: 'p2-023', title: 'Museums to Visit', titleZh: '博物馆',
    difficulty: 'easy', topic: '文化',
    people: [
      'PersonA likes old cars.',
      'PersonB enjoys paintings.',
      'PersonC loves space.',
      'PersonD likes dinosaurs.',
      'PersonE enjoys ships.',
    ],
    statements: [
      ['A transport museum with vintage cars.', 0],
      ['An art gallery with modern works.', 1],
      ['A planetarium with rocket shows.', 2],
      ['A natural history hall with bones.', 3],
      ['A maritime museum by the port.', 4],
      ['A classic motor show.', 0],
      ['A Picasso exhibition.', 1],
      ['A submarine you can enter.', 4],
    ],
  },
  {
    id: 'p2-024', title: 'Parties', titleZh: '派对',
    difficulty: 'easy', topic: '社交',
    people: [
      'PersonA wants music and dancing.',
      'PersonB likes games.',
      'PersonC enjoys good food.',
      'PersonD wants a small group.',
      'PersonE likes costumes.',
    ],
    statements: [
      ['A disco with a DJ.', 0],
      ['A board-game evening.', 1],
      ['A dinner party with friends.', 2],
      ['A quiet tea with few people.', 3],
      ['A fancy-dress costume party.', 4],
      ['A dance night at school.', 0],
      ['A pizza and games night.', 1],
      ['A Halloween dress-up.', 4],
    ],
  },
  {
    id: 'p2-025', title: 'Volunteer Work', titleZh: '志愿工作',
    difficulty: 'medium', topic: '公益',
    people: [
      'PersonA likes helping old people.',
      'PersonB enjoys animals.',
      'PersonC likes the environment.',
      'PersonD wants to help children.',
      'PersonE likes cooking.',
    ],
    statements: [
      ['A visit to a care home.', 0],
      ['A dog shelter assistant.', 1],
      ['A beach clean-up group.', 2],
      ['A homework club for kids.', 3],
      ['A soup kitchen helper.', 4],
      ['A reading friend for elders.', 0],
      ['A tree planting day.', 2],
      ['A meal service for families.', 4],
    ],
  },
  {
    id: 'p2-026', title: 'New Phone', titleZh: '新手机',
    difficulty: 'medium', topic: '科技',
    people: [
      'PersonA wants a cheap phone.',
      'PersonB needs a good camera.',
      'PersonC wants a big screen.',
      'PersonD needs long battery.',
      'PersonE likes a small phone.',
    ],
    statements: [
      ['A budget model under £100.', 0],
      ['A phone with a 200MP camera.', 1],
      ['A 7-inch screen tablet-phone.', 2],
      ['A phone that lasts two days.', 3],
      ['A tiny phone that fits any pocket.', 4],
      ['A starter phone for students.', 0],
      ['A photo phone for travel.', 1],
      ['A compact mini handset.', 4],
    ],
  },
  {
    id: 'p2-027', title: 'Exercise Plans', titleZh: '锻炼计划',
    difficulty: 'easy', topic: '健康',
    people: [
      'PersonA wants to lose weight.',
      'PersonB wants to relax.',
      'PersonC likes strong exercise.',
      'PersonD wants to stretch.',
      'PersonE likes dancing.',
    ],
    statements: [
      ['A running plan three times a week.', 0],
      ['A calm meditation class.', 1],
      ['A heavy weight-training session.', 2],
      ['A morning stretching routine.', 3],
      ['A Zumba dance workout.', 4],
      ['A jogging group.', 0],
      ['A Pilates class.', 3],
      ['A salsa fitness hour.', 4],
    ],
  },
  {
    id: 'p2-028', title: 'Art Classes', titleZh: '美术课',
    difficulty: 'easy', topic: '艺术',
    people: [
      'PersonA likes painting.',
      'PersonB enjoys clay.',
      'PersonC likes drawing.',
      'PersonD wants to take photos.',
      'PersonE likes making jewellery.',
    ],
    statements: [
      ['A watercolour painting group.', 0],
      ['A pottery class with clay.', 1],
      ['A pencil sketch workshop.', 2],
      ['A photography walk.', 3],
      ['A bead and silver class.', 4],
      ['An oil painting course.', 0],
      ['A sculpture lesson.', 1],
      ['A portrait drawing club.', 2],
    ],
  },
  {
    id: 'p2-029', title: 'Language Learning', titleZh: '语言学习',
    difficulty: 'medium', topic: '学习',
    people: [
      'PersonA wants to learn Spanish.',
      'PersonB wants to learn French.',
      'PersonC wants to learn Chinese.',
      'PersonD wants to learn Japanese.',
      'PersonE wants to learn German.',
    ],
    statements: [
      ['A Spanish conversation group.', 0],
      ['A French film and chat club.', 1],
      ['A Chinese characters class.', 2],
      ['A Japanese manga reading group.', 3],
      ['A German grammar workshop.', 4],
      ['A Spanish cooking vocab class.', 0],
      ['A French songs lesson.', 1],
      ['A Japanese calligraphy group.', 3],
    ],
  },
  {
    id: 'p2-030', title: 'Garden Plants', titleZh: '园艺',
    difficulty: 'easy', topic: '自然',
    people: [
      'PersonA wants flowers.',
      'PersonB likes vegetables.',
      'PersonC wants a tree.',
      'PersonD likes herbs.',
      'PersonE wants easy plants.',
    ],
    statements: [
      ['A pack of rose seeds.', 0],
      ['A box of tomato plants.', 1],
      ['A small apple tree.', 2],
      ['A pot of basil and mint.', 3],
      ['A set of succulents.', 4],
      ['A sunflower growing kit.', 0],
      ['A lettuce garden box.', 1],
      ['A cactus collection.', 4],
    ],
  },
  {
    id: 'p2-031', title: 'Holiday Gifts', titleZh: '节日礼物',
    difficulty: 'medium', topic: '礼物',
    people: [
      'PersonA wants something sweet.',
      'PersonB wants something warm.',
      'PersonC wants something funny.',
      'PersonD wants something useful.',
      'PersonE wants something musical.',
    ],
    statements: [
      ['A box of holiday chocolates.', 0],
      ['A knitted winter hat.', 1],
      ['A joke book for the season.', 2],
      ['A useful torch and tools.', 3],
      ['A small bell ornament.', 4],
      ['A candy cane set.', 0],
      ['A cosy pair of socks.', 1],
      ['A singing snow globe.', 4],
    ],
  },
  {
    id: 'p2-032', title: 'Bicycle Tours', titleZh: '自行车游',
    difficulty: 'medium', topic: '运动',
    people: [
      'PersonA wants an easy ride.',
      'PersonB likes long distances.',
      'PersonC wants a city tour.',
      'PersonD likes mountain trails.',
      'PersonE wants a family ride.',
    ],
    statements: [
      ['A flat 5km riverside loop.', 0],
      ['A 100km coast route.', 1],
      ['A guided old-town ride.', 2],
      ['A steep forest downhill.', 3],
      ['A safe park circuit for all.', 4],
      ['A gentle lake path.', 0],
      ['A hill climb challenge.', 3],
      ['A child-friendly greenway.', 4],
    ],
  },
  {
    id: 'p2-033', title: 'Food Markets', titleZh: '美食市场',
    difficulty: 'easy', topic: '美食',
    people: [
      'PersonA wants fresh fruit.',
      'PersonB likes cheese.',
      'PersonC wants street food.',
      'PersonD likes fish.',
      'PersonE wants bread.',
    ],
    statements: [
      ['A stall with local apples.', 0],
      ['A shop with aged cheese.', 1],
      ['A truck selling tacos.', 2],
      ['A counter with fresh salmon.', 3],
      ['A bakery with warm rolls.', 4],
      ['A berry farm stand.', 0],
      ['A bread oven on the corner.', 4],
      ['A sushi stand.', 3],
    ],
  },
  {
    id: 'p2-034', title: 'Winter Activities', titleZh: '冬季活动',
    difficulty: 'easy', topic: '季节',
    people: [
      'PersonA likes snow sports.',
      'PersonB wants to stay warm.',
      'PersonC likes ice.',
      'PersonD wants indoor fun.',
      'PersonE likes winter light.',
    ],
    statements: [
      ['A ski lesson on the slopes.', 0],
      ['A hot chocolate festival.', 1],
      ['An ice-skating rink.', 2],
      ['An indoor climbing gym.', 3],
      ['A lantern show at night.', 4],
      ['A snowboard camp.', 0],
      ['A warm pool day.', 1],
      ['An ice sculpture park.', 2],
    ],
  },
  {
    id: 'p2-035', title: 'Summer Camp', titleZh: '夏令营',
    difficulty: 'medium', topic: '休闲',
    people: [
      'PersonA wants water fun.',
      'PersonB likes performing.',
      'PersonC wants to code.',
      'PersonD likes sports.',
      'PersonE wants crafts.',
    ],
    statements: [
      ['A lake swimming programme.', 0],
      ['A drama and acting week.', 1],
      ['A robotics summer camp.', 2],
      ['A multi-sport training camp.', 3],
      ['A jewellery-making workshop.', 4],
      ['A canoe and sail camp.', 0],
      ['A theatre show camp.', 1],
      ['A pottery and craft week.', 4],
    ],
  },
  {
    id: 'p2-036', title: 'Photo Spots', titleZh: '拍照地点',
    difficulty: 'easy', topic: '旅行',
    people: [
      'PersonA likes city views.',
      'PersonB enjoys nature.',
      'PersonC likes old buildings.',
      'PersonD wants the beach.',
      'PersonE likes night lights.',
    ],
    statements: [
      ['A rooftop over the skyline.', 0],
      ['A forest with tall trees.', 1],
      ['A castle with stone walls.', 2],
      ['A sandy shore at noon.', 3],
      ['A bridge lit at night.', 4],
      ['A tower with a city panorama.', 0],
      ['A waterfall in the hills.', 1],
      ['A lit fountain square.', 4],
    ],
  },
  {
    id: 'p2-037', title: 'Board Games', titleZh: '桌游',
    difficulty: 'easy', topic: '休闲',
    people: [
      'PersonA likes strategy.',
      'PersonB enjoys card games.',
      'PersonC likes word games.',
      'PersonD wants a party game.',
      'PersonE likes building.',
    ],
    statements: [
      ['A war strategy board game.', 0],
      ['A fast poker-style card game.', 1],
      ['A scrabble word challenge.', 2],
      ['A silly charades party game.', 3],
      ['A train-building set game.', 4],
      ['A kingdom conquest game.', 0],
      ['A spelling bee game.', 2],
      ['A tower-stacking game.', 4],
    ],
  },
  {
    id: 'p2-038', title: 'Dance Classes', titleZh: '舞蹈课',
    difficulty: 'easy', topic: '艺术',
    people: [
      'PersonA likes ballet.',
      'PersonB enjoys hip-hop.',
      'PersonC likes Latin.',
      'PersonD wants slow dance.',
      'PersonE likes folk.',
    ],
    statements: [
      ['A classical ballet school.', 0],
      ['A street dance crew.', 1],
      ['A salsa and rumba class.', 2],
      ['A gentle waltz lesson.', 3],
      ['A traditional dance group.', 4],
      ['A pointe technique class.', 0],
      ['A breakdance workshop.', 1],
      ['A tango evening.', 3],
    ],
  },
  {
    id: 'p2-039', title: 'Local Events', titleZh: '本地活动',
    difficulty: 'easy', topic: '社交',
    people: [
      'PersonA likes live music.',
      'PersonB enjoys fairs.',
      'PersonC likes talks.',
      'PersonD wants a race.',
      'PersonE likes food.',
    ],
    statements: [
      ['A band playing in the square.', 0],
      ['A fun fair with rides.', 1],
      ['A science lecture at the library.', 2],
      ['A 5km fun run.', 3],
      ['A street food festival.', 4],
      ['A jazz night downtown.', 0],
      ['A craft fair.', 1],
      ['A tasting event.', 4],
    ],
  },
  {
    id: 'p2-040', title: 'Car Hire', titleZh: '租车',
    difficulty: 'medium', topic: '交通',
    people: [
      'PersonA wants a small car.',
      'PersonB needs a big car.',
      'PersonC wants an electric car.',
      'PersonD wants a cheap car.',
      'PersonE wants a luxury car.',
    ],
    statements: [
      ['A mini city hatchback.', 0],
      ['A seven-seat family van.', 1],
      ['A zero-emission EV.', 2],
      ['A budget car per day.', 3],
      ['A premium sports model.', 4],
      ['A compact for parking.', 0],
      ['A Tesla rental.', 2],
      ['A low-cost economy car.', 3],
    ],
  },
  {
    id: 'p2-041', title: 'Hotel Rooms', titleZh: '酒店房间',
    difficulty: 'medium', topic: '旅行',
    people: [
      'PersonA wants a sea view.',
      'PersonB needs two beds.',
      'PersonC wants quiet.',
      'PersonD wants a kitchen.',
      'PersonE wants cheap.',
    ],
    statements: [
      ['A room facing the ocean.', 0],
      ['A family room with twin beds.', 1],
      ['A top-floor silent suite.', 2],
      ['A studio with a kitchenette.', 3],
      ['A hostel room for £15.', 4],
      ['A balcony over the bay.', 0],
      ['A quiet garden bungalow.', 2],
      ['A budget pod room.', 4],
    ],
  },
  {
    id: 'p2-042', title: 'Online Shopping', titleZh: '网购',
    difficulty: 'medium', topic: '购物',
    people: [
      'PersonA wants books.',
      'PersonB wants clothes.',
      'PersonC wants electronics.',
      'PersonD wants toys.',
      'PersonE wants food.',
    ],
    statements: [
      ['A site with millions of titles.', 0],
      ['A fashion marketplace.', 1],
      ['A gadget store online.', 2],
      ['A toy shop with free delivery.', 3],
      ['A grocery app for home.', 4],
      ['A second-hand book exchange.', 0],
      ['A clothing outlet sale.', 1],
      ['A snack box subscription.', 4],
    ],
  },
  {
    id: 'p2-043', title: 'Music Lessons', titleZh: '音乐课',
    difficulty: 'easy', topic: '音乐',
    people: [
      'PersonA wants to sing.',
      'PersonB wants piano.',
      'PersonC wants drums.',
      'PersonD wants violin.',
      'PersonE wants guitar.',
    ],
    statements: [
      ['A vocal coaching class.', 0],
      ['A piano teacher at home.', 1],
      ['A drum kit lesson.', 2],
      ['A strings tutor.', 3],
      ['A guitar crash course.', 4],
      ['A choir that meets weekly.', 0],
      ['A keyboard beginners group.', 1],
      ['An acoustic guitar club.', 4],
    ],
  },
  {
    id: 'p2-044', title: 'Science Club', titleZh: '科学俱乐部',
    difficulty: 'medium', topic: '学习',
    people: [
      'PersonA likes chemistry.',
      'PersonB enjoys space.',
      'PersonC likes biology.',
      'PersonD wants robotics.',
      'PersonE likes weather.',
    ],
    statements: [
      ['A lab mixing experiments.', 0],
      ['A stargazing telescope night.', 1],
      ['A plant cell microscope group.', 2],
      ['A robot-building team.', 3],
      ['A cloud and storm club.', 4],
      ['A volcano model project.', 0],
      ['A Mars mission talk.', 1],
      ['A weather balloon launch.', 4],
    ],
  },
  {
    id: 'p2-045', title: 'Healthy Food', titleZh: '健康食品',
    difficulty: 'easy', topic: '健康',
    people: [
      'PersonA wants low sugar.',
      'PersonB wants protein.',
      'PersonC wants vegetables.',
      'PersonD wants gluten-free.',
      'PersonE wants smoothies.',
    ],
    statements: [
      ['A no-sugar snack bar.', 0],
      ['A grilled chicken bowl.', 1],
      ['A big salad plate.', 2],
      ['A rice and veg meal.', 3],
      ['A fruit blender drink.', 4],
      ['A sugar-free yoghurt.', 0],
      ['A bean and tofu dish.', 3],
      ['A berry shake.', 4],
    ],
  },
  {
    id: 'p2-046', title: 'Weekend Markets', titleZh: '周末集市',
    difficulty: 'easy', topic: '购物',
    people: [
      'PersonA wants antiques.',
      'PersonB wants handmade.',
      'PersonC wants fresh meat.',
      'PersonD wants books.',
      'PersonE wants flowers.',
    ],
    statements: [
      ['A stall with old clocks.', 0],
      ['A table of knit scarves.', 1],
      ['A butcher with local beef.', 2],
      ['A box of used novels.', 3],
      ['A bucket of tulips.', 4],
      ['A vintage furniture corner.', 0],
      ['A craft jewellery stand.', 1],
      ['A rose garden seller.', 4],
    ],
  },
  {
    id: 'p2-047', title: 'Theatre Shows', titleZh: '戏剧演出',
    difficulty: 'medium', topic: '艺术',
    people: [
      'PersonA likes comedy.',
      'PersonB enjoys musicals.',
      'PersonC likes drama.',
      'PersonD wants a kids show.',
      'PersonE likes magic.',
    ],
    statements: [
      ['A funny play about neighbours.', 0],
      ['A singing and dancing show.', 1],
      ['A serious historical drama.', 2],
      ['A puppet show for children.', 3],
      ['A magic illusion night.', 4],
      ['A laugh-out-loud farce.', 0],
      ['A Disney-style musical.', 1],
      ['A close-up magic act.', 4],
    ],
  },
  {
    id: 'p2-048', title: 'Writing Group', titleZh: '写作小组',
    difficulty: 'medium', topic: '阅读',
    people: [
      'PersonA writes stories.',
      'PersonB writes poems.',
      'PersonC writes news.',
      'PersonD writes scripts.',
      'PersonE writes blogs.',
    ],
    statements: [
      ['A fiction workshop.', 0],
      ['A poetry reading circle.', 1],
      ['A school newspaper team.', 2],
      ['A screenplay lab.', 3],
      ['A personal blog club.', 4],
      ['A short-story contest.', 0],
      ['A rhyme and verse group.', 1],
      ['A film-writing class.', 3],
    ],
  },
  {
    id: 'p2-049', title: 'Animal Shelter', titleZh: '动物收容所',
    difficulty: 'easy', topic: '动物',
    people: [
      'PersonA wants to walk dogs.',
      'PersonB wants to feed cats.',
      'PersonC likes birds.',
      'PersonD wants to clean.',
      'PersonE likes rabbits.',
    ],
    statements: [
      ['A dog walking roster.', 0],
      ['A cat feeding shift.', 1],
      ['A bird cage care task.', 2],
      ['A kennel cleaning day.', 3],
      ['A rabbit grooming session.', 4],
      ['A morning dog run.', 0],
      ['A parrot feeding job.', 2],
      ['A hutch cleaning role.', 4],
    ],
  },
  {
    id: 'p2-050', title: 'Free Time', titleZh: '空闲时间',
    difficulty: 'easy', topic: '休闲',
    people: [
      'PersonA likes to sleep.',
      'PersonB likes to travel.',
      'PersonC likes to cook.',
      'PersonD likes to read.',
      'PersonE likes to exercise.',
    ],
    statements: [
      ['A lazy Sunday with no plans.', 0],
      ['A weekend trip to another city.', 1],
      ['A new recipe to try tonight.', 2],
      ['A novel you cannot put down.', 3],
      ['A morning jog in the park.', 4],
      ['A long lie-in Saturday.', 0],
      ['A train journey to the coast.', 1],
      ['A gym session after work.', 4],
    ],
  },
];

// ------------------------------------------------------------
// 生成 TS 数组文本
// ------------------------------------------------------------
function buildArticle(spec) {
  const people = spec.people.map((desc, i) => {
    const letter = String.fromCharCode(65 + i); // A-E
    return `{ id: '${spec.id}-${letter.toLowerCase()}', name: 'Person${letter}', description: ${JSON.stringify(desc)} }`;
  }).join(',\n      ');

  const statements = spec.statements.map(s => `      ${JSON.stringify(s[0])}`).join(',\n');

  const answers = spec.statements.map(s => {
    const letter = String.fromCharCode(65 + s[1]);
    return `'${spec.id}-${letter.toLowerCase()}'`;
  }).join(', ');

  return `  {
    id: '${spec.id}',
    title: ${JSON.stringify(spec.title)},
    titleZh: ${JSON.stringify(spec.titleZh)},
    difficulty: ${JSON.stringify(spec.difficulty)},
    topic: ${JSON.stringify(spec.topic)},
    people: [
      ${people}
    ],
    statements: [
${statements}
    ],
    answers: [${answers}],
  }`;
}

const arrayText = `// ==================== Part 2 数据 ====================

export const part2Articles: Part2Article[] = [
${SPECS.map(buildArticle).join(',\n')}
];
`;

// ------------------------------------------------------------
// 注入 reading.ts: 替换 part2Articles 区块
// ------------------------------------------------------------
if (!existsSync(READING_TS)) {
  console.error('找不到 reading.ts:', READING_TS);
  process.exit(1);
}

const src = readFileSync(READING_TS, 'utf8');
const startMarker = 'export const part2Articles: Part2Article[] = [';
const endMarker = '// ==================== Part 3-1 数据 ====================';

const startIdx = src.indexOf(startMarker);
const endIdx = src.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1) {
  console.error('未找到 part2Articles 区块边界');
  process.exit(1);
}

// 保留 endMarker 前的换行
const before = src.slice(0, startIdx);
const after = src.slice(endIdx);
const newSrc = before + arrayText + '\n' + after;

writeFileSync(READING_TS, newSrc, 'utf8');
console.log(`✅ 已生成 ${SPECS.length} 道 Part 2 信息匹配题并写入 reading.ts`);
