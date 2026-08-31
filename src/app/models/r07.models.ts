export type AppEdition = 'WOMEN' | 'MEN';

export type AppThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export type AppColorPalette =
  | 'WOMEN_PINK'
  | 'MEN_BLUE'
  | 'OLIVE_SAGE'
  | 'ROYAL_GOLD'
  | 'LAVENDER_PASTEL'
  | 'SKY_PASTEL'
  | 'TERRACOTTA';

export type AppFontFamily = 'DEFAULT' | 'SERIF' | 'SANS_SERIF' | 'CURSIVE' | 'MONOSPACE';

export type AppLogoTheme =
  | 'DYNAMIC'
  | 'GOLD_DIVINE'
  | 'ROSE_PASTEL'
  | 'ROYAL_NAVY'
  | 'LAVENDER_PURPLE'
  | 'EMERALD_SAGE'
  | 'SKY_CYAN'
  | 'TERRACOTTA_WARM'
  | 'BLACK_GOLD';

export type AppLogoSymbol =
  | 'DOVE_CROSS'
  | 'LION_JUDAH'
  | 'OPEN_BIBLE'
  | 'SHIELD_FAITH'
  | 'CROWN_GLORY'
  | 'FLAME_SPIRIT'
  | 'HEART_GRACE'
  | 'STAR_HOPE';

export type UserAccountType = 'INDIVIDUAL' | 'CONNECTION_GROUP';

export interface R07Mood {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  colorHex: string;
}

export const WOMEN_MOODS: R07Mood[] = [
  { id: 'agradecida', name: 'Agradecida', emoji: '🌸', subtitle: 'Llena de gratitud y alabanza', colorHex: '#AD1457' },
  { id: 'en_paz', name: 'En Paz', emoji: '🕊️', subtitle: 'Descansando en Su presencia', colorHex: '#00897B' },
  { id: 'gozosa', name: 'Gozosa', emoji: '✨', subtitle: 'Alegre y llena de energía', colorHex: '#D81B60' },
  { id: 'confiada', name: 'Confiada', emoji: '🌿', subtitle: 'Firme en la fe y promesas', colorHex: '#2E7D32' },
  { id: 'reflexiva', name: 'Reflexiva', emoji: '💭', subtitle: 'Buscando sabiduría y quietud', colorHex: '#6A1B9A' },
  { id: 'cansada', name: 'Cansada', emoji: '🌧️', subtitle: 'Agotada, pidiendo fuerzas', colorHex: '#455A64' },
  { id: 'afligida', name: 'Afligida', emoji: '💔', subtitle: 'Necesito consuelo y gracia', colorHex: '#C2185B' }
];

export const MEN_MOODS: R07Mood[] = [
  { id: 'agradecido', name: 'Agradecido', emoji: '🛡️', subtitle: 'Lleno de gratitud y victoria', colorHex: '#1565C0' },
  { id: 'en_paz', name: 'En Paz', emoji: '🕊️', subtitle: 'Firmeza y descanso en Dios', colorHex: '#00695C' },
  { id: 'firme', name: 'Firme', emoji: '⚔️', subtitle: 'Valiente, listo para la batalla', colorHex: '#0D47A1' },
  { id: 'confiado', name: 'Confiado', emoji: '⚓', subtitle: 'Anclado en la roca inmutable', colorHex: '#2E7D32' },
  { id: 'reflexivo', name: 'Reflexivo', emoji: '📖', subtitle: 'Meditando en la palabra', colorHex: '#4527A0' },
  { id: 'cansado', name: 'Cansado', emoji: '🌧️', subtitle: 'Renovando fuerzas en el Señor', colorHex: '#37474F' },
  { id: 'enfocado', name: 'Enfocado', emoji: '🎯', subtitle: 'Mirada puesta en el blanco', colorHex: '#D84315' }
];

export interface R07WeekEntity {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  readingGoal: string;
  isGoalCompleted: boolean;
  prayerAttendanceCount: number;
  verseOfTheWeek: string;
  generalNotes: string;
  attendedGroup: boolean;
  groupLearnings: string;
  groupTopics: string;
  groupFeelings: string;
  groupAbsenceReason: string;
  attendedPrayerDay1: boolean;
  prayerDay1Date: string;
  prayerDay1Notes: string;
  prayerDay1AbsenceReason: string;
  attendedPrayerDay2: boolean;
  prayerDay2Date: string;
  prayerDay2Notes: string;
  prayerDay2AbsenceReason: string;
  attendedSundayService: boolean;
  sundayServiceNotes: string;
  createdAt: number;
}

export interface R07WeeklyGoalEntity {
  id: number;
  weekId: number;
  title: string;
  category: string;
  isCompleted: boolean;
  createdAt: number;
}

export interface R07DayEntryEntity {
  id: number;
  weekId: number;
  dayNumber: number; // 1 to 7
  dayName: string; // Lunes, Martes, etc.
  dateText: string;
  timeText: string;
  scriptureRef: string;
  reflectionText: string;
  godSpoke?: string;
  actionStep?: string;
  prayerText?: string;
  mood: string;
  moodEmoji: string;
  photoUrisJson: string; // serialized JSON array of data URLs or image URLs
  isCompleted: boolean;
  updatedAt: number;
}

export interface R07FriendEntity {
  id: number;
  friendToken: string;
  name: string;
  avatarEmoji: string;
  churchOrGroup: string;
  currentStreak: number;
  lastDevotionalDate: string;
  prayerRequest: string;
  isFavorite: boolean;
  connectedAt: number;
}

export interface R07CommunityEntity {
  id: number;
  communityToken: string;
  name: string;
  churchName: string;
  leaderName: string;
  meetingSchedule: string;
  description: string;
  memberCount: number;
  isMyCommunity: boolean;
  createdAt: number;
}

export interface R07PrayerPetitionEntity {
  id: number;
  title: string;
  description: string;
  category: string;
  isAnswered: boolean;
  answeredDate: string;
  testimonyNote: string;
  prayerCount: number;
  createdAt: number;
}

export interface WeekWithDays {
  week: R07WeekEntity;
  days: R07DayEntryEntity[];
  goals: R07WeeklyGoalEntity[];
}

export enum BibleVersion {
  RVR1960 = 'RVR1960',
  NTV = 'NTV'
}

export interface BibleBookInfo {
  number: number;
  name: string;
  testament: 'Antiguo Testamento' | 'Nuevo Testamento';
  category: string;
  chaptersCount: number;
  abbreviation: string;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: BibleVersion;
}

export interface SingleVerseData {
  verse: number;
  text: string;
}

export interface FullChapterData {
  bookNumber: number;
  bookName: string;
  chapter: number;
  testament: string;
  version: BibleVersion;
  verses: SingleVerseData[];
  isOfflineAvailable: boolean;
}

export interface AiDevotionalInspiration {
  mainMessage: string;
  practicalApplication: string;
  guidedPrayer: string;
  keyQuestions: string[];
}

export interface AiWeeklyLeaderSummary {
  executiveSummary: string;
  spiritualHighlights: string[];
  prayerRequestSummary: string;
  pastoralEncouragement: string;
}

export interface AiGuidedPrayerResponse {
  title: string;
  adoration: string;
  confessionAndHonesty: string;
  petitionAndFaith: string;
  gratitudeAndDeclaration: string;
  fullPrayerText: string;
  biblicalPromise: string;
}

export interface ScannedR07Entry {
  dayNumber: number;
  dayName: string;
  timeText: string;
  scriptureRef: string;
  godSpoke: string;
  reflectionText: string;
  actionStep: string;
  prayerText: string;
  mood: string;
  moodEmoji: string;
  fullTranscription: string;
  legibilityScore: number;
  legibilityNotes: string;
  pageCount: number;
  photoUris: string[];
}
