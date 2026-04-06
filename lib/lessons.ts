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
    id: "simple-words-core",
    unitId: "simple-words",
    title: "Simple words",
    description: "Short connected words for rhythm and proportion.",
    orderInUnit: 1,
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
    sectionId: "simple-words-core",
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
    sectionId: "simple-words-core",
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
    sectionId: "simple-words-core",
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
    sectionId: "simple-words-core",
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
