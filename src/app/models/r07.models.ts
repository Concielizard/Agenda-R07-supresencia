export type AppEdition = 'female' | 'male' | 'general' | 'neutral' | 'WOMEN' | 'MEN';

export type AppThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export type AppColorPalette =
  | 'ROSE_PASTEL'      // Rosa pastel y crema
  | 'ROYAL_BLUE'       // Azul rey y arena
  | 'SAGE_OLIVE'       // Salvia y olivo paz
  | 'CLASSIC_GOLD'     // Oro clásico y marfil
  | 'LAVENDER_LILY'    // Lavanda pastel y lirio
  | 'SKY_BREEZE'       // Celeste cielo y brisa
  | 'TERRACOTTA_CANE'; // Terracota y caña

export type AppFontFamily =
  | 'STANDARD'      // Estándar (Plus Jakarta Sans)
  | 'EDITORIAL'     // Clásica editorial (Playfair Display)
  | 'BIBLICAL'      // Bíblica (Cinzel)
  | 'MINIMALIST'    // Moderna minimalista (Outfit)
  | 'DEVOTIONAL'    // Cálida y devocional (Lora)
  | 'HERMENEUTIC';  // Estudio hermenéutica (Newsreader)

export type AppLogoTheme =
  | 'DIVINE_GOLD'      // Dorado Divino
  | 'COBALT_BLUE'      // Azul Cobalto
  | 'AURORA_PINK'      // Rosa Aurora
  | 'SAGE_EMERALD'     // Esmeralda Salvia
  | 'SCARLET_FIRE'     // Fuego Carmesí
  | 'AMETHYST_PURPLE'  // Amatista Celestial
  | 'ETHER_CYAN'       // Celeste Éter
  | 'TERRACOTTA_COPPER'// Cobre Terracota
  | 'ONYX_GOLD';       // Negro Ónice & Oro

export type AppLogoSymbol =
  | 'DOVE_CROSS'       // Paloma de la paz y cruz
  | 'LION_JUDAH'       // León de Judá
  | 'LIVING_WORD'      // Palabra viva (Biblia abierta / espada)
  | 'SHIELD_FAITH'     // Escudo de la fe
  | 'CROWN_GLORY'      // Corona de gloria
  | 'FLAME_SPIRIT'     // Fuego del espíritu
  | 'HEART_GRACE'      // Corazón de gracia
  | 'STAR_BETHLEHEM';  // Estrella de Belén

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  scriptureRefs?: string[];
  theme?: string;
}

export interface UserPreferences {
  themeMode: AppThemeMode;
  colorPalette: AppColorPalette;
  fontFamily: AppFontFamily;
  logoSymbol: AppLogoSymbol;
  logoTheme: AppLogoTheme;
  edition: AppEdition;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  handle?: string;
  email?: string;
  genderTheme: 'female' | 'male' | 'general' | 'neutral';
  accountType?: 'GROUP' | 'INDIVIDUAL';
  leaderName: string;
  leaderPhone?: string;
  leaderEmail?: string;
  groupName: string;
  cellGroupName?: string;
  churchName?: string;
  favoriteVerse?: string;
  avatarEmoji?: string;
  photoUri?: string;
  currentStreak?: number;
  longestStreak?: number;
  onboardingCompleted?: boolean;
  currentMood?: string;
  lifeSituation?: string;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface BibleReading {
  book: string;
  chapter: number;
  verses: string;
  passageText?: string;
}

export interface DayJournal {
  dayOfWeek: number; // 0 = Lunes, 1 = Martes, ..., 6 = Domingo
  dayName: string;   // 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  date: string;      // YYYY-MM-DD
  completed: boolean;
  timeSpentMinutes: number;
  bibleReading: BibleReading;
  rhema: string;           // Lo que Dios me habló (Palabra viva)
  reflection: string;      // Meditación y entendimiento
  application: string;     // ¿Cómo lo aplico a mi vida hoy?
  prayerSummary: string;   // Mi clamor / Agradecimiento
  dailyAffirmation: string;// Declaración profética de identidad y fe
  actionItem: string;      // Mi paso de obediencia de hoy
  moodRating: number;      // 1 to 5 (Corazón agradecido, lleno de paz, etc.)
  notes?: string;
}

export interface WeeklyGoal {
  id: string;
  title: string;
  category: 'espiritual' | 'caracter' | 'familia' | 'servicio' | 'lectura';
  completed: boolean;
}

export interface PrayerItem {
  id: string;
  request: string;
  category: 'salud' | 'familia' | 'finanzas' | 'espiritual' | 'misiones' | 'otros';
  answered: boolean;
  dateCreated: string;
  answerDate?: string;
  answerNote?: string;
}

export interface WeeklyEvaluation {
  attendanceChurch: boolean;
  devotionalDaysCompleted: number;
  fastingDone: boolean;
  bibleChaptersRead: number;
  personalTestimony: string;
  summaryForLeader: string;
  leaderComments?: string;
  spiritualRating: number; // 1 to 5
}

export interface R07Week {
  id: string;
  userId: string;
  weekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string;   // YYYY-MM-DD (Sunday)
  motto: string;     // Lema semanal: ej. "Permaneciendo en la Vid Verdadera"
  weeklyVerse: {
    reference: string;
    text: string;
    translation?: string;
  };
  weeklyGoals: WeeklyGoal[];
  generalPrayerRequests: PrayerItem[];
  days: DayJournal[];
  weeklyEvaluation: WeeklyEvaluation;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPrayer {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  category: 'salud' | 'familia' | 'finanzas' | 'espiritual' | 'misiones' | 'otro';
  prayerCount: number;
  answered: boolean;
  testimony?: string;
  createdAt: string;
  updatedAt?: string;
}

export const SPANISH_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

export interface DailyScripturePlan {
  dayIndex: number;
  dayName: string;
  book: string;
  chapter: number;
  verses: string;
  reference: string;
  scriptureSnippet: string;
  dailyAffirmation: string;
}

export const MEN_DAILY_READINGS: DailyScripturePlan[] = [
  {
    dayIndex: 0,
    dayName: 'Lunes',
    book: 'Josué',
    chapter: 1,
    verses: '1-9',
    reference: 'Josué 1:1-9',
    scriptureSnippet: '«Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.» (Josué 1:9)',
    dailyAffirmation: '«SOY UN HOMBRE ESFORZADO, VALIENTE Y DE FE ÍNTEGRA; LA PRESENCIA DE DIOS ME GUÍA Y TODO LO QUE EMPRENDA PROSPERARÁ.»'
  },
  {
    dayIndex: 1,
    dayName: 'Martes',
    book: 'Salmos',
    chapter: 34,
    verses: '1-18',
    reference: 'Salmos 34:1-18',
    scriptureSnippet: '«Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu. Muchas son las aflicciones del justo, pero de todas ellas le librará Jehová.» (Salmos 34:18-19)',
    dailyAffirmation: '«BENDECIRÉ AL SEÑOR EN TODO TIEMPO; SU ALABANZA ESTARÁ DE CONTINUO EN MI BOCA. SOY UN HOMBRE REDIMIDO, EN PAZ Y FORTALECIDO EN CRISTO.»'
  },
  {
    dayIndex: 2,
    dayName: 'Miércoles',
    book: 'Efesios',
    chapter: 6,
    verses: '10-18',
    reference: 'Efesios 6:10-18',
    scriptureSnippet: '«Por lo demás, hermanos míos, fortaleceos en el Señor, y en el poder de su fuerza. Vestíos de toda la armadura de Dios.» (Efesios 6:10-11)',
    dailyAffirmation: '«ESTOY VESTIDO DE LA ARMADURA DE DIOS; CON EL ESCUDO DE LA FE APAGO TODO DARDO DEL ENEMIGO Y PROTEJO MI HOGAR CON ORACIÓN.»'
  },
  {
    dayIndex: 3,
    dayName: 'Jueves',
    book: 'Salmos',
    chapter: 1,
    verses: '1-6',
    reference: 'Salmos 1:1-6',
    scriptureSnippet: '«Será como árbol plantado junto a corrientes de aguas, que da su fruto en su tiempo, y su hoja no cae; y todo lo que hace, prosperará.» (Salmos 1:3)',
    dailyAffirmation: '«SOY COMO ÁRBOL PLANTADO JUNTO A CORRIENTES DE AGUA; MI DELEITE ESTÁ EN LA LEY DE DIOS Y MI CASA DA FRUTO EN TODA TEMPORADA.»'
  },
  {
    dayIndex: 4,
    dayName: 'Viernes',
    book: 'Proverbios',
    chapter: 3,
    verses: '1-12',
    reference: 'Proverbios 3:1-12',
    scriptureSnippet: '«Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.» (Proverbios 3:5-6)',
    dailyAffirmation: '«CONFÍO EN EL SEÑOR CON TODO MI CORAZÓN; ÉL ENDEREZA MIS PASOS Y ME CONCEDE SABIDURÍA DIVINA PARA LIDERAR MI VIDA CON INTEGRIDAD.»'
  },
  {
    dayIndex: 5,
    dayName: 'Sábado',
    book: 'Salmos',
    chapter: 27,
    verses: '1-6',
    reference: 'Salmos 27:1-6',
    scriptureSnippet: '«Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?» (Salmos 27:1)',
    dailyAffirmation: '«EL SEÑOR ES MI LUZ, MI FORTALEZA Y MI SALVACIÓN; NADA ME APARTARÁ DE SU PRESENCIA Y VIVIRÉ CONFIADO BAJO SUS ALAS.»'
  },
  {
    dayIndex: 6,
    dayName: 'Domingo',
    book: 'Juan',
    chapter: 15,
    verses: '1-8',
    reference: 'Juan 15:1-8',
    scriptureSnippet: '«Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer.» (Juan 15:5)',
    dailyAffirmation: '«PERMANEZCO EN CRISTO LA VID VERDADERA; MI VIDA DA FRUTO ABUNDANTE PARA LA GLORIA DEL PADRE CELESTIAL.»'
  }
];

export const WOMEN_DAILY_READINGS: DailyScripturePlan[] = [
  {
    dayIndex: 0,
    dayName: 'Lunes',
    book: 'Proverbios',
    chapter: 31,
    verses: '10-31',
    reference: 'Proverbios 31:10-31',
    scriptureSnippet: '«Fuerza y honor son su vestidura; y se ríe de lo por venir. Abre su boca con sabiduría, y la ley de clemencia está en su lengua.» (Proverbios 31:25-26)',
    dailyAffirmation: '«SOY UNA MUJER SABIA, REVESTIDA DE FORTALEZA, GRACIA Y DIGNIDAD; MI BOCA HABLA CON SABIDURÍA Y EDIFICA MI CASA EN PAZ.»'
  },
  {
    dayIndex: 1,
    dayName: 'Martes',
    book: 'Salmos',
    chapter: 34,
    verses: '1-18',
    reference: 'Salmos 34:1-18',
    scriptureSnippet: '«Busqué a Jehová, y él me oyó, y me libró de todos mis temores. Los que miraron a él fueron alumbrados, y sus rostros no fueron avergonzados.» (Salmos 34:4-5)',
    dailyAffirmation: '«MI ROSTRO ESTÁ RADIANTE Y NUNCA SERÁ AVERGONZADO; EL SEÑOR ME LIBRA DE TODO TEMOR Y LLENA MI CORAZÓN DE SU PAZ SOBRENATURAL.»'
  },
  {
    dayIndex: 2,
    dayName: 'Miércoles',
    book: 'Filipenses',
    chapter: 4,
    verses: '4-13',
    reference: 'Filipenses 4:4-13',
    scriptureSnippet: '«Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.» (Filipenses 4:7)',
    dailyAffirmation: '«LA PAZ DE DIOS QUE SOBREPASA TODO ENTENDIMIENTO CUSTODIA MI CORAZÓN Y MIS EMOCIONES; TODO LO PUEDO EN CRISTO QUE ME FORTALECE.»'
  },
  {
    dayIndex: 3,
    dayName: 'Jueves',
    book: 'Salmos',
    chapter: 139,
    verses: '1-18',
    reference: 'Salmos 139:1-18',
    scriptureSnippet: '«Te alabaré; porque formidables, maravillosas son tus obras; estoy maravillado, y mi alma lo sabe muy bien.» (Salmos 139:14)',
    dailyAffirmation: '«SOY LA CREACIÓN AMADA Y ESCOGIDA DE DIOS; SUS PENSAMIENTOS SOBRE MÍ SON PRECIOSOS, INNUMERABLES Y LLENOS DE ESPERANZA.»'
  },
  {
    dayIndex: 4,
    dayName: 'Viernes',
    book: 'Isaías',
    chapter: 40,
    verses: '28-31',
    reference: 'Isaías 40:28-31',
    scriptureSnippet: '«Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ningunas... los que esperan a Jehová levantarán alas como las águilas.» (Isaías 40:29,31)',
    dailyAffirmation: '«EL SEÑOR RENUEVA MIS FUERZAS CADA MAÑANA; ME ELEVO EN FE POR ENCIMA DE TODA DIFICULTAD Y CAMINO SEGURA EN SU AMOR.»'
  },
  {
    dayIndex: 5,
    dayName: 'Sábado',
    book: 'Salmos',
    chapter: 91,
    verses: '1-16',
    reference: 'Salmos 91:1-16',
    scriptureSnippet: '«El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente. Diré yo a Jehová: Esperanza mía, y castillo mío; mi Dios, en quien confiaré.» (Salmos 91:1-2)',
    dailyAffirmation: '«HABITO AL ABRIGO DEL ALTÍSIMO Y DESCANSO BAJO LA SOMBRA DE SU AMOR; MI FAMILIA Y MI HOGAR ESTÁN BLINDADOS EN SU PRESENCIA.»'
  },
  {
    dayIndex: 6,
    dayName: 'Domingo',
    book: 'Juan',
    chapter: 15,
    verses: '1-8',
    reference: 'Juan 15:1-8',
    scriptureSnippet: '«Como el Padre me ha amado, así también yo os he amado; permaneced en mi amor... para que vuestro gozo sea cumplido.» (Juan 15:9,11)',
    dailyAffirmation: '«PERMANEZCO EN EL AMOR DE JESÚS; SU GOZO ES MI FUERZA Y MI VIDA DESBORDA EN BENDICIÓN PARA TODOS A MI ALREDEDOR.»'
  }
];
