export interface UserProfile {
  userId: string;
  displayName: string;
  email?: string;
  genderTheme: 'female' | 'male' | 'general' | 'neutral';
  leaderName: string;
  groupName: string;
  cellGroupName?: string;
  churchName?: string;
  favoriteVerse?: string;
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

export const DEFAULT_WEEKLY_VERSES = [
  {
    reference: 'Salmos 63:1',
    text: 'Dios, Dios mío eres tú; de madrugada te buscaré; mi alma tiene sed de ti, mi carne te anhela, en tierra seca y árida donde no hay aguas.'
  },
  {
    reference: 'Josué 1:8',
    text: 'Nunca se apartará de tu boca este libro de la ley, sino que de día y de noche meditarás en él, para que guardes y hagas conforme a todo lo que en él está escrito; porque entonces harás prosperar tu camino, y todo te saldrá bien.'
  },
  {
    reference: 'Jeremías 33:3',
    text: 'Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.'
  },
  {
    reference: 'Juan 15:5',
    text: 'Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer.'
  },
  {
    reference: 'Filipenses 4:6-7',
    text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones.'
  },
  {
    reference: 'Isaías 40:31',
    text: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.'
  }
];
