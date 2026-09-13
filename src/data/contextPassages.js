// Context Clues passages (Premium). Each embeds one target word from the
// Tricky/Fiendish word bank in a short passage with enough surrounding
// meaning to disambiguate it — the passage shows a common student
// misspelling (`shown`) highlighted; the player picks the correct spelling
// from 4 options. `category` tags the *kind* of error for the parent
// dashboard's accuracy-by-category breakdown.
export const CONTEXT_PASSAGES = [
  {
    before: "Before the mountain expedition began, the guide checked every item twice. She explained that carrying too much weight could be dangerous, but leaving out anything",
    target: "necessary", shown: "neccessary",
    after: "could be just as risky. Warm clothing, a reliable torch, and enough food for five days were not luxuries — they were essential for survival at altitude. One nervous student asked whether a spare pair of socks really mattered. The guide smiled and said that in the mountains, even the smallest, most ordinary items often turned out to be the most important of all. By the time the group set off at dawn, every rucksack held exactly what was needed, ready for whatever the climb might demand.",
    category: "phonetic", examBoard: "GL", tier: 3,
  },
  {
    before: "Mr Harrington stood at the front of the classroom holding a clipboard. \"I need a",
    target: "definite", shown: "definate",
    after: "answer by Friday,\" he said, tapping his pen against the board. The class had been debating for weeks whether to visit the science museum or the castle ruins, and the arguments on both sides had grown louder every lesson. Some pupils wanted dinosaur skeletons; others wanted battlements and secret passages. Mr Harrington explained that the coach company needed firm numbers, not vague guesses. Whatever the class decided, it had to be final and certain, impossible to take back once the form was posted that afternoon.",
    category: "suffix", examBoard: "CGP", tier: 2,
  },
  {
    before: "At the recycling centre, volunteers spent their Saturday morning teaching visitors how to",
    target: "separate", shown: "seperate",
    after: "their rubbish properly. Glass bottles went into one bin, paper and cardboard into another, and plastic containers into a third. Mixing them together, the supervisor warned, made the whole load impossible to recycle, wasting hours of sorting work later. A young boy asked why it mattered when everything ended up in the same lorry eventually. The supervisor explained that the lorry itself had separate compartments, each one kept apart so that nothing became contaminated along the way.",
    category: "phonetic", examBoard: "Bond", tier: 3,
  },
  {
    before: "Priya had rehearsed her speech a hundred times, yet standing at the podium in front of the whole school made her stomach twist with nerves. She worried that forgetting a single line might",
    target: "embarrass", shown: "embarass",
    after: "her in front of three hundred students. Her teacher had told her that everyone stumbles occasionally, and that the audience is usually far kinder than a nervous speaker expects. Taking a deep breath, Priya glanced at her notes one last time and began. Halfway through, she lost her place for a moment, but instead of panicking, she simply paused, smiled, and continued. Nobody laughed — several students even clapped encouragingly.",
    category: "phonetic", examBoard: "GL", tier: 3,
  },
  {
    before: "The town's",
    target: "government", shown: "goverment",
    after: "announced plans to build a new library where the old car park used to stand. Residents packed into the community hall to hear the proposal, some excited about extra books and study space, others worried about losing parking near the shops. A councillor explained how public services were funded through local taxes, and how decisions like this were made carefully, after months of surveys and consultation. An elderly resident asked whether ordinary people could still have their say before anything was built.",
    category: "silentLetter", examBoard: "CEM", tier: 2,
  },
  {
    before: "Every morning before school, Daniel ran three laps of the park, determined to",
    target: "achieve", shown: "acheive",
    after: "his goal of qualifying for the regional championships. His coach reminded him that talent alone was never enough; consistent, patient training mattered far more than a single brilliant performance. Some weeks felt impossible, especially when his times barely improved despite the effort. Still, he kept a small notebook recording every session, watching the numbers slowly, steadily improve over months rather than days. On the morning of the trials, nervous but ready, Daniel finally crossed the line with a personal best.",
    category: "phonetic", examBoard: "GL", tier: 2,
  },
  {
    before: "In music class, Mrs Alavi clapped a steady beat and asked the students to copy the",
    target: "rhythm", shown: "rythm",
    after: "exactly, without rushing or slowing down. Keeping perfect timing, she explained, was harder than it sounded, especially once a melody and several instruments were added on top. A few students clapped too quickly, eager to finish, while others lagged behind, distracted by the drums. Mrs Alavi encouraged everyone to feel the pulse of the music rather than counting numbers in their heads. By the end of the lesson, the whole class was clapping together in perfect time.",
    category: "phonetic", examBoard: "CGP", tier: 3,
  },
  {
    before: "Walking home from school, Tom spotted a wallet lying on the pavement, stuffed with banknotes and an old photograph. Nobody was around, and for a moment he wondered what would happen if he simply kept it. His",
    target: "conscience", shown: "consience",
    after: "nagged at him immediately, reminding him how upset he would feel if he lost something so precious. He thought about the owner searching desperately, perhaps an elderly person who depended on that money. Tom picked up the wallet and walked straight to the police station instead of home, even though it made him late for dinner. A week later, a grateful letter arrived, thanking him for being honest when nobody would ever have known otherwise.",
    category: "phonetic", examBoard: "Bond", tier: 3,
  },
  {
    before: "Grandad often said that hearing his own grandmother's stories about the war had been a rare",
    target: "privilege", shown: "priviledge",
    after: "one he never took for granted. Few people his age had listened so closely to voices from a world so different from their own. Every Sunday, he gathered the grandchildren around the fire and repeated the tales exactly as she had told them. Some of the details seemed impossible — rationed sugar, blacked-out windows, letters that took months to arrive — yet each story carried a lesson about resilience that Grandad wanted passed carefully to the next generation.",
    category: "suffix", examBoard: "CEM", tier: 3,
  },
  {
    before: "For her grandmother's eightieth birthday, the whole family booked a table at the",
    target: "restaurant", shown: "restaraunt",
    after: "overlooking the harbour, the same one where her grandparents had celebrated their wedding decades earlier. Waiters arrived carrying candles, and the youngest cousins argued over who would sit closest to the window. Between courses, older relatives told stories nobody had heard before, about storms at sea and a wedding dress rescued from a leaking boat. As the sun set over the water, three generations sat together at one long table, and the passing decades seemed to disappear entirely.",
    category: "phonetic", examBoard: "GL", tier: 3,
  },
];

export const CONTEXT_CATEGORY_LABEL = {
  phonetic: "Phonetic slips",
  silentLetter: "Silent letters",
  suffix: "Suffix confusion",
  homophone: "Homophones",
};
