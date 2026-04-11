/**
 * Local MVP curriculum for ArabivoWrite.
 * Structure: unit → section → lesson. Progress is still keyed by stable lesson `id` in Supabase.
 */

export const UNIT_IDS = ["letters", "letter-forms", "simple-words"] as const;
export type UnitId = (typeof UNIT_IDS)[number];

export type LessonType = "isolated_letter" | "letter_form" | "word";

export type Lesson = {
  id: string;
  title: string;
  arabicText: string;
  transliteration: string;
  englishMeaning: string;
  unit: UnitId;
  /** Sort within the unit */
  order: number;
  type: LessonType;
  /** Curriculum section (group on Lessons page, in-section navigation) */
  sectionId: string;
  /**
   * Legacy UI flag; real unlock uses Supabase progress + `lib/progress/unlock`.
   */
  locked: boolean;
};

export type UnitDefinition = {
  id: UnitId;
  title: string;
  description: string;
  order: number;
};

export type SectionDefinition = {
  id: string;
  unitId: UnitId;
  title: string;
  description: string;
  orderInUnit: number;
  lessonIds: string[];
};

/** Section cards (metadata); `lessonIds` filled by `getCurriculumSections()`. */
type SectionMeta = Omit<SectionDefinition, "lessonIds">;

export const UNITS: UnitDefinition[] = [
  {
    id: "letters",
    title: "Arabic letters",
    description:
      "Isolated letter shapes—the alphabet before worrying about connections.",
    order: 1,
  },
  {
    id: "letter-forms",
    title: "Letter forms (positions)",
    description:
      "Initial, medial, and final shapes as letters join in real words.",
    order: 2,
  },
  {
    id: "simple-words",
    title: "Simple words",
    description:
      "Short, high-frequency words to practice flow and proportion.",
    order: 3,
  },
];

const UNIT_BY_ID: Record<UnitId, UnitDefinition> = UNITS.reduce(
  (acc, u) => {
    acc[u.id] = u;
    return acc;
  },
  {} as Record<UnitId, UnitDefinition>,
);

const SECTION_META: SectionMeta[] = [
  {
    id: "letters-i",
    unitId: "letters",
    title: "Letters I",
    description: "Alif, bāʾ, tāʾ, thāʾ, and jīm.",
    orderInUnit: 1,
  },
  {
    id: "letters-ii",
    unitId: "letters",
    title: "Letters II",
    description: "Ḥāʾ, khāʾ, dāl, dhāl, and rāʾ.",
    orderInUnit: 2,
  },
  {
    id: "letters-iii",
    unitId: "letters",
    title: "Letters III",
    description: "Zāy, sīn, shīn, ṣād, and ḍād.",
    orderInUnit: 3,
  },
  {
    id: "letters-iv",
    unitId: "letters",
    title: "Letters IV",
    description: "Ṭāʾ, ẓāʾ, ʿayn, ghayn, and fāʾ.",
    orderInUnit: 4,
  },
  {
    id: "letters-v",
    unitId: "letters",
    title: "Letters V",
    description: "Qāf, kāf, lām, mīm, nūn, hāʾ, wāw, and yāʾ.",
    orderInUnit: 5,
  },
  {
    id: "letter-forms-core",
    unitId: "letter-forms",
    title: "Letter forms",
    description: "Initial, medial, and final jīm and nūn.",
    orderInUnit: 1,
  },
  {
    id: "simple-words-i",
    unitId: "simple-words",
    title: "Simple words I",
    description: "Greetings and short everyday words you already know from culture.",
    orderInUnit: 1,
  },
  {
    id: "simple-words-ii",
    unitId: "simple-words",
    title: "Simple words II",
    description: "People, home, and light—concrete words with smooth joins.",
    orderInUnit: 2,
  },
  {
    id: "simple-words-iii",
    unitId: "simple-words",
    title: "Simple words III",
    description: "Everyday nouns: pen, eye, sea, dog, and sun.",
    orderInUnit: 3,
  },
  {
    id: "simple-words-body-people",
    unitId: "simple-words",
    title: "Body & people",
    description: "Face, limbs, and people—short words for clear tracing.",
    orderInUnit: 4,
  },
  {
    id: "simple-words-home-objects",
    unitId: "simple-words",
    title: "Home & objects",
    description: "Things around the house: furniture, dishes, and light.",
    orderInUnit: 5,
  },
  {
    id: "simple-words-nature",
    unitId: "simple-words",
    title: "Nature",
    description: "Sky, weather, and plants—common three-letter nouns.",
    orderInUnit: 6,
  },
  {
    id: "simple-words-animals",
    unitId: "simple-words",
    title: "Animals",
    description: "Creatures big and small; smooth joins and familiar shapes.",
    orderInUnit: 7,
  },
];

const SECTION_META_BY_ID: Record<string, SectionMeta> = SECTION_META.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, SectionMeta>,
);

export function getUnitTitle(unitId: UnitId): string {
  return UNIT_BY_ID[unitId].title;
}

export function lessonTypeLabel(type: LessonType): string {
  if (type === "isolated_letter") return "Isolated letter";
  if (type === "letter_form") return "Letter form";
  return "Word";
}

export function getSectionMeta(sectionId: string): SectionMeta | undefined {
  return SECTION_META_BY_ID[sectionId];
}

/** Sections in curriculum order (unit order, then section order within unit). */
export function getSectionsOrdered(): SectionDefinition[] {
  return UNITS.slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((unit) =>
      SECTION_META.filter((s) => s.unitId === unit.id)
        .sort((a, b) => a.orderInUnit - b.orderInUnit)
        .map((meta) => ({
          ...meta,
          lessonIds: lessons
            .filter((l) => l.sectionId === meta.id)
            .sort((a, b) => a.order - b.order)
            .map((l) => l.id),
        })),
    );
}

export function getCurriculumSections(): SectionDefinition[] {
  return getSectionsOrdered();
}

export function getSectionsForUnit(unitId: UnitId): SectionDefinition[] {
  return getSectionsOrdered().filter((s) => s.unitId === unitId);
}

export function getSectionById(sectionId: string): SectionDefinition | undefined {
  return getSectionsOrdered().find((s) => s.id === sectionId);
}

export function getSectionIds(): string[] {
  return SECTION_META.map((s) => s.id);
}

export function getLessonsInSection(sectionId: string): Lesson[] {
  return lessons
    .filter((l) => l.sectionId === sectionId)
    .sort((a, b) => a.order - b.order);
}

export const lessons: Lesson[] = [
  {
    id: "alif-isolated",
    title: "Alif — isolated",
    arabicText: "ا",
    transliteration: "alif",
    englishMeaning:
      "The first letter; a vertical stroke and long-vowel carrier in many words.",
    unit: "letters",
    order: 1,
    type: "isolated_letter",
    sectionId: "letters-i",
    locked: false,
  },
  {
    id: "ba-isolated",
    title: "Bāʾ — isolated",
    arabicText: "ب",
    transliteration: "bāʾ",
    englishMeaning: "Like English *b*; starts the main “bowl” letter family.",
    unit: "letters",
    order: 2,
    type: "isolated_letter",
    sectionId: "letters-i",
    locked: false,
  },
  {
    id: "ta-isolated",
    title: "Tāʾ — isolated",
    arabicText: "ت",
    transliteration: "tāʾ",
    englishMeaning: "Two dots above; like a *t* sound in Modern Standard Arabic.",
    unit: "letters",
    order: 3,
    type: "isolated_letter",
    sectionId: "letters-i",
    locked: false,
  },
  {
    id: "tha-isolated",
    title: "Thāʾ — isolated",
    arabicText: "ث",
    transliteration: "thāʾ",
    englishMeaning: "Three dots; a *th* as in “think” in MSA.",
    unit: "letters",
    order: 4,
    type: "isolated_letter",
    sectionId: "letters-i",
    locked: false,
  },
  {
    id: "jim-isolated",
    title: "Jīm — isolated",
    arabicText: "ج",
    transliteration: "jīm",
    englishMeaning: "Dot below the curve; *j* as in MSA (regional sounds vary).",
    unit: "letters",
    order: 5,
    type: "isolated_letter",
    sectionId: "letters-i",
    locked: false,
  },
  {
    id: "ha-heavy-isolated",
    title: "Ḥāʾ — isolated",
    arabicText: "ح",
    transliteration: "ḥāʾ",
    englishMeaning: "Deep *h* from the throat; distinct from ه (hāʾ).",
    unit: "letters",
    order: 6,
    type: "isolated_letter",
    sectionId: "letters-ii",
    locked: false,
  },
  {
    id: "kha-isolated",
    title: "Khāʾ — isolated",
    arabicText: "خ",
    transliteration: "khāʾ",
    englishMeaning: "A breathy *kh* (like the *ch* in “Bach”).",
    unit: "letters",
    order: 7,
    type: "isolated_letter",
    sectionId: "letters-ii",
    locked: false,
  },
  {
    id: "dal-isolated",
    title: "Dāl — isolated",
    arabicText: "د",
    transliteration: "dāl",
    englishMeaning: "Simple *d*; one of the non-connecting letters to the left.",
    unit: "letters",
    order: 8,
    type: "isolated_letter",
    sectionId: "letters-ii",
    locked: false,
  },
  {
    id: "dhal-isolated",
    title: "Dhāl — isolated",
    arabicText: "ذ",
    transliteration: "dhāl",
    englishMeaning: "Like *dāl* with one dot; *dh* as in “this” in MSA.",
    unit: "letters",
    order: 9,
    type: "isolated_letter",
    sectionId: "letters-ii",
    locked: false,
  },
  {
    id: "ra-isolated",
    title: "Rāʾ — isolated",
    arabicText: "ر",
    transliteration: "rāʾ",
    englishMeaning: "Tapped or trilled *r*; does not connect to the left.",
    unit: "letters",
    order: 10,
    type: "isolated_letter",
    sectionId: "letters-ii",
    locked: false,
  },
  {
    id: "zay-isolated",
    title: "Zāy — isolated",
    arabicText: "ز",
    transliteration: "zāy",
    englishMeaning: "A *z* sound; one dot above, no join to the left.",
    unit: "letters",
    order: 11,
    type: "isolated_letter",
    sectionId: "letters-iii",
    locked: false,
  },
  {
    id: "seen-isolated",
    title: "Sīn — isolated",
    arabicText: "س",
    transliteration: "sīn",
    englishMeaning: "Smooth *s*; connects on both sides in words.",
    unit: "letters",
    order: 12,
    type: "isolated_letter",
    sectionId: "letters-iii",
    locked: false,
  },
  {
    id: "sheen-isolated",
    title: "Shīn — isolated",
    arabicText: "ش",
    transliteration: "shīn",
    englishMeaning: "Three dots; *sh* as in “she.”",
    unit: "letters",
    order: 13,
    type: "isolated_letter",
    sectionId: "letters-iii",
    locked: false,
  },
  {
    id: "sad-isolated",
    title: "Ṣād — isolated",
    arabicText: "ص",
    transliteration: "ṣād",
    englishMeaning: "Emphatic *s*; deeper and tenser than sīn.",
    unit: "letters",
    order: 14,
    type: "isolated_letter",
    sectionId: "letters-iii",
    locked: false,
  },
  {
    id: "dad-isolated",
    title: "Ḍād — isolated",
    arabicText: "ض",
    transliteration: "ḍād",
    englishMeaning: "Emphatic *d*; dot above the bowl.",
    unit: "letters",
    order: 15,
    type: "isolated_letter",
    sectionId: "letters-iii",
    locked: false,
  },
  {
    id: "tah-isolated",
    title: "Ṭāʾ — isolated",
    arabicText: "ط",
    transliteration: "ṭāʾ",
    englishMeaning: "Emphatic *t*; tall bowl with a dot above.",
    unit: "letters",
    order: 16,
    type: "isolated_letter",
    sectionId: "letters-iv",
    locked: false,
  },
  {
    id: "zah-isolated",
    title: "Ẓāʾ — isolated",
    arabicText: "ظ",
    transliteration: "ẓāʾ",
    englishMeaning: "Emphatic *dh/z* sound; dot in the bowl.",
    unit: "letters",
    order: 17,
    type: "isolated_letter",
    sectionId: "letters-iv",
    locked: false,
  },
  {
    id: "ain-isolated",
    title: "ʿAyn — isolated",
    arabicText: "ع",
    transliteration: "ʿayn",
    englishMeaning: "From the throat; a voiced pharyngeal sound in Arabic.",
    unit: "letters",
    order: 18,
    type: "isolated_letter",
    sectionId: "letters-iv",
    locked: false,
  },
  {
    id: "ghain-isolated",
    title: "Ghayn — isolated",
    arabicText: "غ",
    transliteration: "ghayn",
    englishMeaning: "Voiced *gh*; deeper than khāʾ in many dialects.",
    unit: "letters",
    order: 19,
    type: "isolated_letter",
    sectionId: "letters-iv",
    locked: false,
  },
  {
    id: "fa-isolated",
    title: "Fāʾ — isolated",
    arabicText: "ف",
    transliteration: "fāʾ",
    englishMeaning: "A clear *f*; dot above the hook.",
    unit: "letters",
    order: 20,
    type: "isolated_letter",
    sectionId: "letters-iv",
    locked: false,
  },
  {
    id: "qaf-isolated",
    title: "Qāf — isolated",
    arabicText: "ق",
    transliteration: "qāf",
    englishMeaning: "Deep *q* from the back of the tongue in MSA.",
    unit: "letters",
    order: 21,
    type: "isolated_letter",
    sectionId: "letters-v",
    locked: false,
  },
  {
    id: "kaf-isolated",
    title: "Kāf — isolated",
    arabicText: "ك",
    transliteration: "kāf",
    englishMeaning: "A *k* sound; tall letter with a hook or serif.",
    unit: "letters",
    order: 22,
    type: "isolated_letter",
    sectionId: "letters-v",
    locked: false,
  },
  {
    id: "lam-isolated",
    title: "Lām — isolated",
    arabicText: "ل",
    transliteration: "lām",
    englishMeaning: "Clear *l*; connects widely in Arabic script.",
    unit: "letters",
    order: 23,
    type: "isolated_letter",
    sectionId: "letters-v",
    locked: false,
  },
  {
    id: "mim-isolated",
    title: "Mīm — isolated",
    arabicText: "م",
    transliteration: "mīm",
    englishMeaning: "Rounded *m*; very common in roots and prefixes.",
    unit: "letters",
    order: 24,
    type: "isolated_letter",
    sectionId: "letters-v",
    locked: false,
  },
  {
    id: "nun-isolated",
    title: "Nūn — isolated",
    arabicText: "ن",
    transliteration: "nūn",
    englishMeaning: "One dot above; a clean *n* in most positions.",
    unit: "letters",
    order: 25,
    type: "isolated_letter",
    sectionId: "letters-v",
    locked: false,
  },
  {
    id: "ha-light-isolated",
    title: "Hāʾ — isolated",
    arabicText: "ه",
    transliteration: "hāʾ",
    englishMeaning: "Light *h* at the end of syllables; not the deep ح.",
    unit: "letters",
    order: 26,
    type: "isolated_letter",
    sectionId: "letters-v",
    locked: false,
  },
  {
    id: "waw-isolated",
    title: "Wāw — isolated",
    arabicText: "و",
    transliteration: "wāw",
    englishMeaning: "*w* or long *ū*; also used in diphthongs.",
    unit: "letters",
    order: 27,
    type: "isolated_letter",
    sectionId: "letters-v",
    locked: false,
  },
  {
    id: "ya-isolated",
    title: "Yāʾ — isolated",
    arabicText: "ي",
    transliteration: "yāʾ",
    englishMeaning: "*y* or long *ī*; two dots below in isolated/final forms.",
    unit: "letters",
    order: 28,
    type: "isolated_letter",
    sectionId: "letters-v",
    locked: false,
  },
  {
    id: "jim-initial",
    title: "Jīm — initial",
    arabicText: "جـ",
    transliteration: "jīm (initial)",
    englishMeaning: "Shape at the start of a word before a connecting letter.",
    unit: "letter-forms",
    order: 1,
    type: "letter_form",
    sectionId: "letter-forms-core",
    locked: false,
  },
  {
    id: "jim-medial",
    title: "Jīm — medial",
    arabicText: "ـجـ",
    transliteration: "jīm (medial)",
    englishMeaning: "Middle form between two connecting letters.",
    unit: "letter-forms",
    order: 2,
    type: "letter_form",
    sectionId: "letter-forms-core",
    locked: false,
  },
  {
    id: "jim-final",
    title: "Jīm — final",
    arabicText: "ـج",
    transliteration: "jīm (final)",
    englishMeaning: "Tail form after a connecting letter; no join to the left.",
    unit: "letter-forms",
    order: 3,
    type: "letter_form",
    sectionId: "letter-forms-core",
    locked: false,
  },
  {
    id: "nun-final",
    title: "Nūn — final",
    arabicText: "ـن",
    transliteration: "nūn (final)",
    englishMeaning: "Final *n* with one dot; often ends a syllable or word.",
    unit: "letter-forms",
    order: 4,
    type: "letter_form",
    sectionId: "letter-forms-core",
    locked: false,
  },
  {
    id: "word-salam",
    title: "Word: salām",
    arabicText: "سلام",
    transliteration: "salām",
    englishMeaning: "“Peace”—smooth connections across three letters.",
    unit: "simple-words",
    order: 1,
    type: "word",
    sectionId: "simple-words-i",
    locked: false,
  },
  {
    id: "word-marhaba",
    title: "Word: marḥaba",
    arabicText: "مرحبا",
    transliteration: "marḥaba",
    englishMeaning: "“Welcome”; practice ر and ح in a friendly greeting.",
    unit: "simple-words",
    order: 2,
    type: "word",
    sectionId: "simple-words-i",
    locked: false,
  },
  {
    id: "word-kitab",
    title: "Word: kitāb",
    arabicText: "كتاب",
    transliteration: "kitāb",
    englishMeaning: "“Book”; good for tall kāf and compact tāʾ.",
    unit: "simple-words",
    order: 3,
    type: "word",
    sectionId: "simple-words-i",
    locked: false,
  },
  {
    id: "word-umm",
    title: "Word: umm",
    arabicText: "أم",
    transliteration: "umm",
    englishMeaning: "“Mother”; short word with hamza on alif.",
    unit: "simple-words",
    order: 4,
    type: "word",
    sectionId: "simple-words-i",
    locked: false,
  },
  {
    id: "word-bint",
    title: "Word: bint",
    arabicText: "بنت",
    transliteration: "bint",
    englishMeaning: "“Girl” or “daughter”; bāʾ, nūn, and tāʾ in one short word.",
    unit: "simple-words",
    order: 5,
    type: "word",
    sectionId: "simple-words-ii",
    locked: false,
  },
  {
    id: "word-walad",
    title: "Word: walad",
    arabicText: "ولد",
    transliteration: "walad",
    englishMeaning: "“Boy” or “child”; wāw opens, then lām and dāl.",
    unit: "simple-words",
    order: 6,
    type: "word",
    sectionId: "simple-words-ii",
    locked: false,
  },
  {
    id: "word-bab",
    title: "Word: bāb",
    arabicText: "باب",
    transliteration: "bāb",
    englishMeaning: "“Door”; two bāʾ shapes with a clean middle join.",
    unit: "simple-words",
    order: 7,
    type: "word",
    sectionId: "simple-words-ii",
    locked: false,
  },
  {
    id: "word-bayt",
    title: "Word: bayt",
    arabicText: "بيت",
    transliteration: "bayt",
    englishMeaning: "“House”; bāʾ, yāʾ, and tāʾ in a compact flow.",
    unit: "simple-words",
    order: 8,
    type: "word",
    sectionId: "simple-words-ii",
    locked: false,
  },
  {
    id: "word-dar",
    title: "Word: dār",
    arabicText: "دار",
    transliteration: "dār",
    englishMeaning: "“Home” or “abode”; dāl, alif, and rāʾ (no join after rāʾ).",
    unit: "simple-words",
    order: 9,
    type: "word",
    sectionId: "simple-words-ii",
    locked: false,
  },
  {
    id: "word-nur",
    title: "Word: nūr",
    arabicText: "نور",
    transliteration: "nūr",
    englishMeaning: "“Light”; nūn, wāw, and rāʾ with a calm rhythm.",
    unit: "simple-words",
    order: 10,
    type: "word",
    sectionId: "simple-words-ii",
    locked: false,
  },
  {
    id: "word-qalam",
    title: "Word: qalam",
    arabicText: "قلم",
    transliteration: "qalam",
    englishMeaning: "“Pen”; qāf, lām, and mīm—tall qāf into a tight tail.",
    unit: "simple-words",
    order: 11,
    type: "word",
    sectionId: "simple-words-iii",
    locked: false,
  },
  {
    id: "word-ayn",
    title: "Word: ʿayn",
    arabicText: "عين",
    transliteration: "ʿayn",
    englishMeaning: "“Eye”; two ʿayn shapes with yāʾ in the middle.",
    unit: "simple-words",
    order: 12,
    type: "word",
    sectionId: "simple-words-iii",
    locked: false,
  },
  {
    id: "word-bahr",
    title: "Word: baḥr",
    arabicText: "بحر",
    transliteration: "baḥr",
    englishMeaning: "“Sea”; bāʾ, ḥāʾ, and rāʾ—good depth contrast in the middle.",
    unit: "simple-words",
    order: 13,
    type: "word",
    sectionId: "simple-words-iii",
    locked: false,
  },
  {
    id: "word-kalb",
    title: "Word: kalb",
    arabicText: "كلب",
    transliteration: "kalb",
    englishMeaning: "“Dog”; kāf, lām, and bāʾ in a friendly three-letter word.",
    unit: "simple-words",
    order: 14,
    type: "word",
    sectionId: "simple-words-iii",
    locked: false,
  },
  {
    id: "word-shams",
    title: "Word: shams",
    arabicText: "شمس",
    transliteration: "shams",
    englishMeaning: "“Sun”; shīn, mīm, and sīn—wide curves and a neat finish.",
    unit: "simple-words",
    order: 15,
    type: "word",
    sectionId: "simple-words-iii",
    locked: false,
  },
  {
    id: "word-wajh",
    title: "Word: wajh",
    arabicText: "وجه",
    transliteration: "wajh",
    englishMeaning: "“Face”; wāw, jīm, and hāʾ in a compact word.",
    unit: "simple-words",
    order: 16,
    type: "word",
    sectionId: "simple-words-body-people",
    locked: false,
  },
  {
    id: "word-famm",
    title: "Word: famm",
    arabicText: "فم",
    transliteration: "famm",
    englishMeaning: "“Mouth”; fāʾ and mīm—short and very clear.",
    unit: "simple-words",
    order: 17,
    type: "word",
    sectionId: "simple-words-body-people",
    locked: false,
  },
  {
    id: "word-rijl",
    title: "Word: rajul",
    arabicText: "رجل",
    transliteration: "rajul",
    englishMeaning: "“Man”; rāʾ, jīm, and lām in a familiar three-letter word.",
    unit: "simple-words",
    order: 18,
    type: "word",
    sectionId: "simple-words-body-people",
    locked: false,
  },
  {
    id: "word-qadam",
    title: "Word: qadam",
    arabicText: "قدم",
    transliteration: "qadam",
    englishMeaning: "“Foot”; qāf, dāl, and mīm with a tall opening.",
    unit: "simple-words",
    order: 19,
    type: "word",
    sectionId: "simple-words-body-people",
    locked: false,
  },
  {
    id: "word-yad",
    title: "Word: yad",
    arabicText: "يد",
    transliteration: "yad",
    englishMeaning: "“Hand”; yāʾ and dāl—short and very common.",
    unit: "simple-words",
    order: 20,
    type: "word",
    sectionId: "simple-words-body-people",
    locked: false,
  },
  {
    id: "word-batn",
    title: "Word: baṭn",
    arabicText: "بطن",
    transliteration: "baṭn",
    englishMeaning: "“Belly” or “stomach”; bāʾ, ṭāʾ, and nūn.",
    unit: "simple-words",
    order: 21,
    type: "word",
    sectionId: "simple-words-body-people",
    locked: false,
  },
  {
    id: "word-kub",
    title: "Word: kūb",
    arabicText: "كوب",
    transliteration: "kūb",
    englishMeaning: "“Cup” or “mug”; kāf, wāw, and bāʾ.",
    unit: "simple-words",
    order: 22,
    type: "word",
    sectionId: "simple-words-home-objects",
    locked: false,
  },
  {
    id: "word-tabaq",
    title: "Word: ṭabaq",
    arabicText: "طبق",
    transliteration: "ṭabaq",
    englishMeaning: "“Plate” or “dish”; ṭāʾ, bāʾ, and qāf.",
    unit: "simple-words",
    order: 23,
    type: "word",
    sectionId: "simple-words-home-objects",
    locked: false,
  },
  {
    id: "word-kursi",
    title: "Word: kursī",
    arabicText: "كرسي",
    transliteration: "kursī",
    englishMeaning: "“Chair”; kāf, rāʾ, sīn, and yāʾ.",
    unit: "simple-words",
    order: 24,
    type: "word",
    sectionId: "simple-words-home-objects",
    locked: false,
  },
  {
    id: "word-sarir",
    title: "Word: sarīr",
    arabicText: "سرير",
    transliteration: "sarīr",
    englishMeaning: "“Bed”; sīn, rāʾ, and yāʾ doubled for rhythm.",
    unit: "simple-words",
    order: 25,
    type: "word",
    sectionId: "simple-words-home-objects",
    locked: false,
  },
  {
    id: "word-maktab",
    title: "Word: maktab",
    arabicText: "مكتب",
    transliteration: "maktab",
    englishMeaning: "“Desk” or “office”; mīm, kāf, tāʾ, and bāʾ.",
    unit: "simple-words",
    order: 26,
    type: "word",
    sectionId: "simple-words-home-objects",
    locked: false,
  },
  {
    id: "word-siraj",
    title: "Word: sirāj",
    arabicText: "سراج",
    transliteration: "sirāj",
    englishMeaning: "“Lamp” or “lantern”; sīn, rāʾ, alif, and jīm.",
    unit: "simple-words",
    order: 27,
    type: "word",
    sectionId: "simple-words-home-objects",
    locked: false,
  },
  {
    id: "word-qamar",
    title: "Word: qamar",
    arabicText: "قمر",
    transliteration: "qamar",
    englishMeaning: "“Moon”; qāf, mīm, and rāʾ.",
    unit: "simple-words",
    order: 28,
    type: "word",
    sectionId: "simple-words-nature",
    locked: false,
  },
  {
    id: "word-najm",
    title: "Word: najm",
    arabicText: "نجم",
    transliteration: "najm",
    englishMeaning: "“Star”; nūn, jīm, and mīm.",
    unit: "simple-words",
    order: 29,
    type: "word",
    sectionId: "simple-words-nature",
    locked: false,
  },
  {
    id: "word-nar",
    title: "Word: nār",
    arabicText: "نار",
    transliteration: "nār",
    englishMeaning: "“Fire”; nūn, alif, and rāʾ.",
    unit: "simple-words",
    order: 30,
    type: "word",
    sectionId: "simple-words-nature",
    locked: false,
  },
  {
    id: "word-matar",
    title: "Word: maṭar",
    arabicText: "مطر",
    transliteration: "maṭar",
    englishMeaning: "“Rain”; mīm, ṭāʾ, and rāʾ.",
    unit: "simple-words",
    order: 31,
    type: "word",
    sectionId: "simple-words-nature",
    locked: false,
  },
  {
    id: "word-thalj",
    title: "Word: thalj",
    arabicText: "ثلج",
    transliteration: "thalj",
    englishMeaning: "“Snow” or “ice”; thāʾ, lām, and jīm.",
    unit: "simple-words",
    order: 32,
    type: "word",
    sectionId: "simple-words-nature",
    locked: false,
  },
  {
    id: "word-ward",
    title: "Word: ward",
    arabicText: "ورد",
    transliteration: "ward",
    englishMeaning: "“Rose”; wāw, rāʾ, and dāl—gentle curves.",
    unit: "simple-words",
    order: 33,
    type: "word",
    sectionId: "simple-words-nature",
    locked: false,
  },
  {
    id: "word-qitt",
    title: "Word: qiṭṭ",
    arabicText: "قط",
    transliteration: "qiṭṭ",
    englishMeaning: "“Cat”; qāf and ṭāʾ with a clear tail.",
    unit: "simple-words",
    order: 34,
    type: "word",
    sectionId: "simple-words-animals",
    locked: false,
  },
  {
    id: "word-dub",
    title: "Word: dubb",
    arabicText: "دب",
    transliteration: "dubb",
    englishMeaning: "“Bear”; dāl and bāʾ—very short and bold.",
    unit: "simple-words",
    order: 35,
    type: "word",
    sectionId: "simple-words-animals",
    locked: false,
  },
  {
    id: "word-fiyl",
    title: "Word: fīl",
    arabicText: "فيل",
    transliteration: "fīl",
    englishMeaning: "“Elephant”; fāʾ, yāʾ, and lām.",
    unit: "simple-words",
    order: 36,
    type: "word",
    sectionId: "simple-words-animals",
    locked: false,
  },
  {
    id: "word-diik",
    title: "Word: dīk",
    arabicText: "ديك",
    transliteration: "dīk",
    englishMeaning: "“Rooster”; dāl, yāʾ, and kāf.",
    unit: "simple-words",
    order: 37,
    type: "word",
    sectionId: "simple-words-animals",
    locked: false,
  },
  {
    id: "word-naml",
    title: "Word: naml",
    arabicText: "نمل",
    transliteration: "naml",
    englishMeaning: "“Ant”; nūn, mīm, and lām.",
    unit: "simple-words",
    order: 38,
    type: "word",
    sectionId: "simple-words-animals",
    locked: false,
  },
  {
    id: "word-kharuf",
    title: "Word: kharūf",
    arabicText: "خروف",
    transliteration: "kharūf",
    englishMeaning: "“Sheep”; khāʾ, rāʾ, wāw, and fāʾ.",
    unit: "simple-words",
    order: 39,
    type: "word",
    sectionId: "simple-words-animals",
    locked: false,
  },
];

function sortLessons(list: Lesson[]): Lesson[] {
  return [...list].sort((a, b) => {
    const ua = UNIT_BY_ID[a.unit].order;
    const ub = UNIT_BY_ID[b.unit].order;
    if (ua !== ub) return ua - ub;
    return a.order - b.order;
  });
}

export function getLessonsOrdered(): Lesson[] {
  return sortLessons(lessons);
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

/** Title before an em dash (e.g. “Khāʾ — isolated” → “Khāʾ”) for completion UI. */
export function getLessonShortTitle(title: string): string {
  const sep = " — ";
  const i = title.indexOf(sep);
  return i >= 0 ? title.slice(0, i).trim() : title.trim();
}

export function getLessonIds(): string[] {
  return getLessonsOrdered().map((l) => l.id);
}

/** Dashboard cards: built via `getDashboardUnits` in `lib/progress/dashboard-units`. */
export type DashboardUnit = {
  id: UnitId;
  title: string;
  description: string;
  lessonCount: number;
  completedCount: number;
  locked: boolean;
};
