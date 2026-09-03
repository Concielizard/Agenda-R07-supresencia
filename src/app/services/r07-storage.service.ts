import { Injectable, signal, effect, computed, inject } from '@angular/core';
import {
  R07Week,
  DayJournal,
  UserProfile,
  DailyScripturePlan,
  MEN_DAILY_READINGS,
  WOMEN_DAILY_READINGS,
  SPANISH_DAYS,
  AppColorPalette,
  AppFontFamily,
  AppLogoSymbol,
  AppLogoTheme,
  AppThemeMode,
  AppEdition,
  ChatMessage,
  SavedVerse
} from '../models/r07.models';
import { FirebaseService } from './firebase.service';

const STORAGE_KEY_PROFILE = 'r07_user_profile';
const STORAGE_KEY_CURRENT_WEEK_ID = 'r07_current_week_id';
const STORAGE_KEY_WEEKS = 'r07_weeks_data';
const STORAGE_KEY_SAVED_VERSES = 'r07_saved_verses';
const STORAGE_KEY_ONBOARDING_DONE = 'r07_onboarding_completed';

// Fallback weekly verses (used when generating new week headers)
const DEFAULT_WEEKLY_VERSES: { reference: string; text: string; translation?: string }[] = [
  { reference: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.', translation: 'RVR1960' },
  { reference: 'Salmos 23:1', text: 'El Señor es mi pastor, nada me faltará.', translation: 'RVR1960' },
  { reference: 'Josué 1:9', text: 'Esfuérzate y sé valiente. No temas ni desmayes.', translation: 'RVR1960' },
  { reference: 'Romanos 8:28', text: 'A los que aman a Dios, todo les ayuda para bien.', translation: 'RVR1960' },
  { reference: 'Isaías 40:31', text: 'Los que esperan en el Señor renovarán sus fuerzas.', translation: 'RVR1960' }
];

const STORAGE_KEY_PREFS = 'r07_preferences';
const STORAGE_KEY_CHAT = 'r07_chat_history';

@Injectable({
  providedIn: 'root'
})
export class R07StorageService {
  private firebase = inject(FirebaseService);

  // ⚠️ IMPORTANTE: estas señales DEBEN declararse antes que userProfile/allWeeks,
  // porque loadInitialWeeks() -> createDefaultWeek() -> createEmptyDay() lee this.edition().
  // Si se declaran después, this.edition es undefined y la app revienta en blanco.
  // Customization Signals
  public edition = signal<AppEdition>('male');
  public themeMode = signal<AppThemeMode>('LIGHT');
  public colorPalette = signal<AppColorPalette>('CLASSIC_GOLD');
  public fontFamily = signal<AppFontFamily>('EDITORIAL');
  public logoSymbol = signal<AppLogoSymbol>('DOVE_CROSS');
  public logoTheme = signal<AppLogoTheme>('DIVINE_GOLD');

  // Core reactive signals
  public userProfile = signal<UserProfile>(this.loadInitialProfile());
  public allWeeks = signal<R07Week[]>(this.loadInitialWeeks());
  public currentWeekId = signal<string>(typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY_CURRENT_WEEK_ID) || '') : '');
  public selectedDayIndex = signal<number>(this.getTodayDayIndex()); // 0 = Monday ... 6 = Sunday

  // Navigation: 5 Mobile Tabs ('chat' | 'community' | 'today' | 'bible' | 'explore')
  public activeMobileTab = signal<'chat' | 'community' | 'today' | 'bible' | 'explore'>('today');

  // Highlighted Bible reading target
  public highlightedVerses = signal<{ book: string; chapter: number; verseStart: number; verseEnd: number; reference: string } | null>(null);

  // Streak & Activity
  public currentStreak = signal<number>(1);
  public longestStreak = signal<number>(6);

  // System Dark Mode
  public systemIsDark = signal<boolean>(false);

  // Chat History
  public chatMessages = signal<ChatMessage[]>(this.loadInitialChat());

  // Saved Verses Collection
  public savedVerses = signal<SavedVerse[]>(this.loadInitialSavedVerses());

  // Toast message
  public snackbarMessage = signal<string | null>(null);

  // Auth modal trigger
  public showAuthModal = signal<boolean>(false);
  public openAuthModal(): void { this.showAuthModal.set(true); }
  public closeAuthModal(): void { this.showAuthModal.set(false); }

  // Computed Properties for Theming & Typography
  public isDarkEffective = computed(() => {
    const mode = this.themeMode();
    if (mode === 'DARK') return true;
    if (mode === 'LIGHT') return false;
    return this.systemIsDark();
  });

  public fontClass = computed(() => {
    const font = this.fontFamily();
    switch (font) {
      case 'EDITORIAL': return 'font-editorial';
      case 'BIBLICAL': return 'font-biblical';
      case 'MINIMALIST': return 'font-minimalist';
      case 'DEVOTIONAL': return 'font-devotional';
      case 'HERMENEUTIC': return 'font-hermeneutic';
      case 'STANDARD':
      default: return 'font-standard';
    }
  });

  public logoSymbolIcon = computed(() => {
    const sym = this.logoSymbol();
    switch (sym) {
      case 'LION_JUDAH': return '🦁';
      case 'LIVING_WORD': return '📖';
      case 'SHIELD_FAITH': return '🛡️';
      case 'CROWN_GLORY': return '👑';
      case 'FLAME_SPIRIT': return '🔥';
      case 'HEART_GRACE': return '💖';
      case 'STAR_BETHLEHEM': return '⭐';
      case 'DOVE_CROSS':
      default: return '🕊️';
    }
  });

  public logoColorHex = computed(() => {
    const theme = this.logoTheme();
    switch (theme) {
      case 'COBALT_BLUE': return '#1E40AF';
      case 'AURORA_PINK': return '#E11D48';
      case 'SAGE_EMERALD': return '#059669';
      case 'SCARLET_FIRE': return '#DC2626';
      case 'AMETHYST_PURPLE': return '#7C3AED';
      case 'ETHER_CYAN': return '#0284C7';
      case 'TERRACOTTA_COPPER': return '#C2410C';
      case 'ONYX_GOLD': return '#292524';
      case 'DIVINE_GOLD':
      default: return '#D4AF37';
    }
  });

  public currentThemeColors = computed(() => {
    const palette = this.colorPalette();
    const isDark = this.isDarkEffective();

    switch (palette) {
      case 'ROYAL_BLUE':
        return {
          primary: isDark ? '#60A5FA' : '#1E40AF',
          primaryDark: isDark ? '#3B82F6' : '#172554',
          primaryLight: isDark ? '#172554' : '#EFF6FF',
          primaryContainer: isDark ? '#1E3A8A' : '#DBEAFE',
          accent: isDark ? '#38BDF8' : '#2563EB',
          background: isDark ? '#0A0F1D' : '#F5F4EE',
          surface: isDark ? '#141E33' : '#FFFFFF',
          card: isDark ? '#1A2744' : '#FFFFFF',
          border: isDark ? '#233860' : '#E2D9C8',
          textPrimary: isDark ? '#F8FAFC' : '#0F172A',
          textSecondary: isDark ? '#94A3B8' : '#475569',
          textMuted: isDark ? '#64748B' : '#78716C'
        };

      case 'SAGE_OLIVE':
        return {
          primary: isDark ? '#4ADE80' : '#2E6F40',
          primaryDark: isDark ? '#22C55E' : '#1B4728',
          primaryLight: isDark ? '#14291B' : '#F0F7F2',
          primaryContainer: isDark ? '#1C3D27' : '#DCEEE0',
          accent: isDark ? '#86EFAC' : '#38A169',
          background: isDark ? '#0D1510' : '#F4F7F3',
          surface: isDark ? '#16231B' : '#FFFFFF',
          card: isDark ? '#1E3025' : '#FFFFFF',
          border: isDark ? '#2B4233' : '#D3DFD5',
          textPrimary: isDark ? '#F0FDF4' : '#14291B',
          textSecondary: isDark ? '#A7F3D0' : '#3E5C46',
          textMuted: isDark ? '#6EE7B7' : '#6B7280'
        };

      case 'CLASSIC_GOLD':
        return {
          primary: isDark ? '#FBBF24' : '#996515',
          primaryDark: isDark ? '#F59E0B' : '#784E10',
          primaryLight: isDark ? '#2D2310' : '#FFFBEB',
          primaryContainer: isDark ? '#3D3016' : '#FEF3C7',
          accent: isDark ? '#FCD34D' : '#D97706',
          background: isDark ? '#14100A' : '#FAF7F0',
          surface: isDark ? '#211B11' : '#FFFFFF',
          card: isDark ? '#2D2517' : '#FFFFFF',
          border: isDark ? '#453823' : '#E8DEC8',
          textPrimary: isDark ? '#FEF3C7' : '#291F0B',
          textSecondary: isDark ? '#FDE68A' : '#574828',
          textMuted: isDark ? '#D97706' : '#78716C'
        };

      case 'LAVENDER_LILY':
        return {
          primary: isDark ? '#A78BFA' : '#6D28D9',
          primaryDark: isDark ? '#8B5CF6' : '#5B21B6',
          primaryLight: isDark ? '#2E1065' : '#F5F3FF',
          primaryContainer: isDark ? '#3B1A7E' : '#EDE9FE',
          accent: isDark ? '#C084FC' : '#7C3AED',
          background: isDark ? '#110D1E' : '#FAF7FC',
          surface: isDark ? '#1C1530' : '#FFFFFF',
          card: isDark ? '#271D42' : '#FFFFFF',
          border: isDark ? '#3B2D61' : '#DFD7EC',
          textPrimary: isDark ? '#F5F3FF' : '#22163A',
          textSecondary: isDark ? '#DDD6FE' : '#5C4A7B',
          textMuted: isDark ? '#A78BFA' : '#78716C'
        };

      case 'SKY_BREEZE':
        return {
          primary: isDark ? '#38BDF8' : '#0284C7',
          primaryDark: isDark ? '#0EA5E9' : '#0369A1',
          primaryLight: isDark ? '#082F49' : '#F0F9FF',
          primaryContainer: isDark ? '#0C4A6E' : '#E0F2FE',
          accent: isDark ? '#7DD3FC' : '#0284C7',
          background: isDark ? '#0A121A' : '#F1F7FB',
          surface: isDark ? '#111F2D' : '#FFFFFF',
          card: isDark ? '#192C3F' : '#FFFFFF',
          border: isDark ? '#213E5A' : '#CFE2F0',
          textPrimary: isDark ? '#F0F9FF' : '#0C2840',
          textSecondary: isDark ? '#BAE6FD' : '#315C80',
          textMuted: isDark ? '#38BDF8' : '#78716C'
        };

      case 'TERRACOTTA_CANE':
        return {
          primary: isDark ? '#FB923C' : '#C2410C',
          primaryDark: isDark ? '#F97316' : '#9A3412',
          primaryLight: isDark ? '#431407' : '#FFF7ED',
          primaryContainer: isDark ? '#5C1D0B' : '#FFEDD5',
          accent: isDark ? '#FDBA74' : '#EA580C',
          background: isDark ? '#170E08' : '#FAF5F0',
          surface: isDark ? '#26170E' : '#FFFFFF',
          card: isDark ? '#352014' : '#FFFFFF',
          border: isDark ? '#522F1D' : '#E8D8CA',
          textPrimary: isDark ? '#FFF7ED' : '#381708',
          textSecondary: isDark ? '#FED7AA' : '#6B3E25',
          textMuted: isDark ? '#FB923C' : '#78716C'
        };

      case 'ROSE_PASTEL':
      default:
        return {
          primary: isDark ? '#F472B6' : '#C25975',
          primaryDark: isDark ? '#EC4899' : '#9E3C56',
          primaryLight: isDark ? '#371321' : '#FDF2F4',
          primaryContainer: isDark ? '#521B31' : '#FCE7F3',
          accent: isDark ? '#F9A8D4' : '#DB2777',
          background: isDark ? '#170E12' : '#FAF6F3',
          surface: isDark ? '#24151C' : '#FFFFFF',
          card: isDark ? '#321D27' : '#FFFFFF',
          border: isDark ? '#4A2A3A' : '#EADBD7',
          textPrimary: isDark ? '#FDF2F8' : '#2E111C',
          textSecondary: isDark ? '#FBCFE8' : '#6D354B',
          textMuted: isDark ? '#F472B6' : '#78716C'
        };
    }
  });

  // Computed signals
  public currentWeek = computed<R07Week>(() => {
    const id = this.currentWeekId();
    const weeks = this.allWeeks();
    const found = weeks.find(w => w.id === id);
    if (found) return found;
    if (weeks.length > 0) return weeks[0];
    return this.createDefaultWeek();
  });

  public currentDay = computed<DayJournal>(() => {
    const week = this.currentWeek();
    const dayIdx = this.selectedDayIndex();
    if (week && week.days && week.days[dayIdx]) {
      return week.days[dayIdx];
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return (week && week.days && week.days[0]) || this.createEmptyDay(0, todayStr);
  });

  public completedDaysCount = computed<number>(() => {
    const week = this.currentWeek();
    return (week && week.days) ? week.days.filter(d => d.completed).length : 0;
  });

  public consecutiveStreakDays = computed<number>(() => {
    const weeks = this.allWeeks();
    if (!weeks || weeks.length === 0) return 0;

    // Collect all unique completed dates (YYYY-MM-DD)
    const completedDates = new Set<string>();
    for (const w of weeks) {
      if (w.days) {
        for (const d of w.days) {
          if (d.completed && d.date) {
            completedDates.add(d.date);
          }
        }
      }
    }

    if (completedDates.size === 0) return 0;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

    let checkDate = new Date(now);
    let streak = 0;

    if (completedDates.has(todayStr)) {
      while (true) {
        const dStr = `${checkDate.getFullYear()}-${pad(checkDate.getMonth() + 1)}-${pad(checkDate.getDate())}`;
        if (completedDates.has(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else if (completedDates.has(yesterdayStr)) {
      checkDate = new Date(yesterday);
      while (true) {
        const dStr = `${checkDate.getFullYear()}-${pad(checkDate.getMonth() + 1)}-${pad(checkDate.getDate())}`;
        if (completedDates.has(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return Math.max(0, streak);
  });

  public weeklyProgressPercentage = computed<number>(() => {
    const total = 7;
    const completed = this.completedDaysCount();
    return Math.round((completed / total) * 100);
  });

  public totalTimeSpentMinutes = computed<number>(() => {
    const week = this.currentWeek();
    return week.days ? week.days.reduce((acc, d) => acc + (d.timeSpentMinutes || 0), 0) : 0;
  });

  public toggleEdition(): void {
    const next: AppEdition = this.edition() === 'female' ? 'male' : 'female';
    this.setEdition(next);
  }

  public setEdition(ed: AppEdition): void {
    this.edition.set(ed);
    this.updateUserProfile({ genderTheme: ed === 'female' ? 'female' : 'male' });
    if (ed === 'male' || ed === 'MEN') {
      this.colorPalette.set('ROYAL_BLUE');
    } else if (ed === 'female' || ed === 'WOMEN') {
      this.colorPalette.set('ROSE_PASTEL');
    }

    const currentWk = this.currentWeek();
    if (currentWk && currentWk.days) {
      const plans = (ed === 'female' || ed === 'WOMEN') ? WOMEN_DAILY_READINGS : MEN_DAILY_READINGS;
      const updatedDays = currentWk.days.map((d, i) => {
        if (!d.completed && !d.rhema && !d.reflection) {
          const plan = plans[i] || plans[0];
          return {
            ...d,
            bibleReading: { book: plan.book, chapter: plan.chapter, verses: plan.verses },
            dailyAffirmation: plan.dailyAffirmation || d.dailyAffirmation
          };
        }
        return d;
      });
      this.saveCurrentWeek({ ...currentWk, days: updatedDays });
    }

    this.saveToLocalStorage();
    const label = ed === 'female' ? 'Modo Mujer de Dios (Proverbios 31) 🌸' : 'Modo Hombre de Dios (Valientes) 🛡️';
    this.showSnackbar(`¡Activado ${label}!`);
  }

  public saveToLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(this.allWeeks()));
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(this.userProfile()));
        const currId = this.currentWeekId();
        if (currId) {
          localStorage.setItem(STORAGE_KEY_CURRENT_WEEK_ID, currId);
        }
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }
  }

  constructor() {
    this.initSystemDarkListener();
    this.loadPreferences();

    // Keep currentWeekId valid
    if (!this.currentWeekId() && this.allWeeks().length > 0) {
      this.currentWeekId.set(this.allWeeks()[0].id);
    } else if (this.allWeeks().length === 0) {
      const defaultWeek = this.createDefaultWeek();
      this.allWeeks.set([defaultWeek]);
      this.currentWeekId.set(defaultWeek.id);
    }

    // Effect: sync to local storage & Firebase when profile changes
    effect(() => {
      const profile = this.userProfile();
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
        } catch {}
      }
      if (this.firebase.isSignedIn() && profile.userId) {
        this.firebase.saveUserProfile(profile).catch(err => console.warn('Cloud sync error profile:', err));
      }
    });

    // Effect: sync preferences to local storage
    effect(() => {
      const prefs = {
        themeMode: this.themeMode(),
        colorPalette: this.colorPalette(),
        fontFamily: this.fontFamily(),
        logoSymbol: this.logoSymbol(),
        logoTheme: this.logoTheme(),
        edition: this.edition(),
        currentStreak: this.currentStreak(),
        longestStreak: this.longestStreak()
      };
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
        } catch {}
      }
    });

    // Effect: sync weeks to local storage & Firebase
    effect(() => {
      const weeks = this.allWeeks();
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(weeks));
        } catch {}
      }
    });

    // Effect: sync currentWeekId to local storage
    effect(() => {
      const id = this.currentWeekId();
      if (id && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_CURRENT_WEEK_ID, id);
        } catch {}
      }
    });

    // Effect: sync chat messages
    effect(() => {
      const chat = this.chatMessages();
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chat));
        } catch {}
      }
    });

    // Effect: sync saved verses to local storage
    effect(() => {
      const saved = this.savedVerses();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SAVED_VERSES, JSON.stringify(saved));
      }
    });

    // Effect: when user signs in, load their cloud data
    effect(() => {
      const user = this.firebase.currentUser();
      if (user) {
        this.syncWithCloud(user.uid, user.displayName, user.email);
      }
    });

    this.checkPastDaysClosure();
  }

  private initSystemDarkListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemIsDark.set(media.matches);
      media.addEventListener('change', (e) => {
        this.systemIsDark.set(e.matches);
      });
    }
  }

  private loadPreferences(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.themeMode) this.themeMode.set(p.themeMode);
        if (p.colorPalette) this.colorPalette.set(p.colorPalette);
        if (p.fontFamily) this.fontFamily.set(p.fontFamily);
        if (p.logoSymbol) this.logoSymbol.set(p.logoSymbol);
        if (p.logoTheme) this.logoTheme.set(p.logoTheme);
        if (p.edition) this.edition.set(p.edition);
        if (p.currentStreak) this.currentStreak.set(p.currentStreak);
        if (p.longestStreak) this.longestStreak.set(p.longestStreak);
      }
    } catch (e) {
      console.warn('Could not load preferences:', e);
    }
  }

  private loadInitialChat(): ChatMessage[] {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {}
      }
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: '¡La paz del Señor contigo! Soy tu asistente bíblico en Agenda R07. ¿Qué hay en tu corazón hoy? Puedes pedirme una oración guiada, reflexionar sobre una cita bíblica o explorar temas como sanar el dolor, perdón o dirección divina.',
        timestamp: Date.now() - 60000,
        scriptureRefs: ['Filipenses 4:6-7', 'Salmos 34:18']
      }
    ];
  }

  private loadInitialSavedVerses(): SavedVerse[] {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_VERSES);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
      }
    }
    return [];
  }

  private loadInitialProfile(): UserProfile {
    const isCompletedStorage = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY_ONBOARDING_DONE) === 'true';
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PROFILE) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isCompletedStorage) {
          parsed.onboardingCompleted = true;
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return {
      userId: 'local_user',
      displayName: 'Hijo/a de Dios',
      genderTheme: 'male',
      onboardingCompleted: isCompletedStorage,
      leaderName: '',
      groupName: '',
      churchName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private loadInitialWeeks(): R07Week[] {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_WEEKS) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return [this.createDefaultWeek()];
  }

  private getTodayDayIndex(): number {
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday
    return day === 0 ? 6 : day - 1; // Map to 0=Mon, ..., 6=Sun
  }

  public createEmptyDay(dayIndex: number, dateStr: string): DayJournal {
    const dayName = SPANISH_DAYS[dayIndex] || 'Lunes';
    const isFemale = this.edition() === 'female';
    const plans = isFemale ? WOMEN_DAILY_READINGS : MEN_DAILY_READINGS;
    const plan = plans[dayIndex] || plans[0];

    const defaultReading = {
      book: plan.book,
      chapter: plan.chapter,
      verses: plan.verses
    };

    return {
      dayOfWeek: dayIndex,
      dayName,
      date: dateStr,
      completed: false,
      timeSpentMinutes: 30,
      bibleReading: defaultReading,
      rhema: '',
      reflection: '',
      application: '',
      prayerSummary: '',
      dailyAffirmation: plan.dailyAffirmation || '',
      actionItem: '',
      moodRating: 5
    };
  }

  public createDefaultWeek(offsetWeeks: number = 0): R07Week {
    const now = new Date();
    // find Monday of this week
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (offsetWeeks * 7);
    const monday = new Date(now.setDate(diff));

    const pad = (n: number) => String(n).padStart(2, '0');
    const toLocalDateStr = (dt: Date) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

    const startDateStr = toLocalDateStr(monday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const endDateStr = toLocalDateStr(sunday);

    const weekNum = this.getWeekNumber(monday);
    const randomVerse = DEFAULT_WEEKLY_VERSES[Math.floor(Math.random() * DEFAULT_WEEKLY_VERSES.length)];

    const days: DayJournal[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = toLocalDateStr(d);
      days.push(this.createEmptyDay(i, dateStr));
    }

    const weekId = `week_${monday.getFullYear()}_W${weekNum}_${Date.now().toString(36)}`;

    return {
      id: weekId,
      userId: this.firebase.userUid() || 'local_user',
      weekNumber: weekNum,
      year: monday.getFullYear(),
      startDate: startDateStr,
      endDate: endDateStr,
      motto: 'Pasa Tiempo Conmigo - Intimidad y Poder en Su Presencia',
      weeklyVerse: randomVerse,
      weeklyGoals: [
        { id: '1', title: 'Completar 7 días de devocional de madrugada', category: 'espiritual', completed: false },
        { id: '2', title: 'Memorizar el versículo lema de la semana', category: 'lectura', completed: false },
        { id: '3', title: 'Orar 15 minutos diarios por mi familia y discipulado', category: 'espiritual', completed: false },
        { id: '4', title: 'Dar testimonio de fe a un amigo o compañero', category: 'servicio', completed: false }
      ],
      generalPrayerRequests: [
        { id: 'p1', request: 'Paz, salud y protección sobre mi hogar', category: 'familia', answered: false, dateCreated: startDateStr },
        { id: 'p2', request: 'Crecimiento espiritual y revelación de la Palabra', category: 'espiritual', answered: false, dateCreated: startDateStr }
      ],
      days,
      weeklyEvaluation: {
        attendanceChurch: false,
        devotionalDaysCompleted: 0,
        fastingDone: false,
        bibleChaptersRead: 7,
        personalTestimony: '',
        summaryForLeader: '',
        spiritualRating: 5
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  public async syncWithCloud(userId: string, displayName?: string | null, email?: string | null): Promise<void> {
    try {
      // 1. Sync profile
      const isCompletedStorage = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY_ONBOARDING_DONE) === 'true';
      const cloudProfile = await this.firebase.getUserProfile(userId);
      if (cloudProfile) {
        const localProf = this.userProfile();
        const merged: UserProfile = {
          ...cloudProfile,
          onboardingCompleted: isCompletedStorage || !!localProf.onboardingCompleted || !!cloudProfile.onboardingCompleted,
          genderTheme: localProf.genderTheme || cloudProfile.genderTheme || 'male'
        };
        this.userProfile.set(merged);
      } else {
        const localProf = this.userProfile();
        const updatedProf: UserProfile = {
          ...localProf,
          userId,
          displayName: displayName || localProf.displayName,
          email: email || localProf.email,
          updatedAt: new Date().toISOString()
        };
        this.userProfile.set(updatedProf);
        await this.firebase.saveUserProfile(updatedProf);
      }

      // 2. Sync weeks
      const cloudWeeks = await this.firebase.getWeeksForUser(userId);
      if (cloudWeeks && cloudWeeks.length > 0) {
        this.allWeeks.set(cloudWeeks);
        if (!cloudWeeks.some(w => w.id === this.currentWeekId())) {
          this.currentWeekId.set(cloudWeeks[0].id);
        }
      } else {
        // Upload existing local weeks to cloud
        const currentWeeks = this.allWeeks();
        for (const w of currentWeeks) {
          const cloudW = { ...w, userId };
          await this.firebase.saveWeek(cloudW);
        }
      }
    } catch (err) {
      console.warn('Sync with cloud encountered an issue:', err);
    }
  }

  // Update methods
  public updateCurrentDay(updatedDay: Partial<DayJournal>): void {
    const week = this.currentWeek();
    const dayIdx = this.selectedDayIndex();
    const updatedDays = [...(week.days || [])];

    if (!updatedDays[dayIdx]) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      updatedDays[dayIdx] = this.createEmptyDay(dayIdx, todayStr);
    }

    updatedDays[dayIdx] = {
      ...updatedDays[dayIdx],
      ...updatedDay
    };

    const completedCount = updatedDays.filter(d => d.completed).length;

    const updatedWeek: R07Week = {
      ...week,
      days: updatedDays,
      weeklyEvaluation: {
        ...(week.weeklyEvaluation || {
          attendanceChurch: false,
          fastingDone: false,
          summaryForLeader: '',
          personalTestimony: '',
          weeklyScore: 0,
          devotionalDaysCompleted: 0
        }),
        devotionalDaysCompleted: completedCount
      },
      updatedAt: new Date().toISOString()
    };

    this.saveCurrentWeek(updatedWeek);
  }

  public saveCurrentWeek(week: R07Week): void {
    this.allWeeks.update(weeks => {
      const idx = weeks.findIndex(w => w.id === week.id);
      if (idx !== -1) {
        const next = [...weeks];
        next[idx] = week;
        return next;
      }
      return [week, ...weeks];
    });

    if (this.firebase.isSignedIn() && week.userId) {
      this.firebase.saveWeek(week).catch(err => console.warn('Cloud save error:', err));
    }
  }

  public addNewWeek(): R07Week {
    const newWeek = this.createDefaultWeek();
    this.allWeeks.update(weeks => [newWeek, ...weeks]);
    this.currentWeekId.set(newWeek.id);
    localStorage.setItem(STORAGE_KEY_CURRENT_WEEK_ID, newWeek.id);
    if (this.firebase.isSignedIn()) {
      this.firebase.saveWeek(newWeek).catch(err => console.warn('Cloud save error:', err));
    }
    return newWeek;
  }

  public selectWeek(weekId: string): void {
    this.currentWeekId.set(weekId);
    localStorage.setItem(STORAGE_KEY_CURRENT_WEEK_ID, weekId);
  }

  public deleteWeek(weekId: string): void {
    const weeks = this.allWeeks();
    if (weeks.length <= 1) return; // Keep at least one week
    const filtered = weeks.filter(w => w.id !== weekId);
    this.allWeeks.set(filtered);
    if (this.currentWeekId() === weekId) {
      this.currentWeekId.set(filtered[0].id);
    }
    const uid = this.firebase.userUid();
    if (uid && this.firebase.isSignedIn()) {
      this.firebase.deleteWeek(uid, weekId).catch(err => console.warn('Cloud delete error:', err));
    }
  }

  public updateProfile(partial: Partial<UserProfile>): void {
    this.userProfile.update(prev => ({
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString()
    }));
  }

  public updateUserProfile(partial: Partial<UserProfile>): void {
    this.updateProfile(partial);
  }

  public selectDay(dayIndex: number): void {
    if (dayIndex >= 0 && dayIndex < 7) {
      this.selectedDayIndex.set(dayIndex);
    }
  }

  public setMobileTab(tab: 'chat' | 'community' | 'today' | 'bible' | 'explore'): void {
    this.activeMobileTab.set(tab);
  }

  public setThemeMode(mode: AppThemeMode): void {
    this.themeMode.set(mode);
  }

  public setPalette(palette: AppColorPalette): void {
    this.colorPalette.set(palette);
  }

  public setFontFamily(font: AppFontFamily): void {
    this.fontFamily.set(font);
  }

  public setLogoSymbol(symbol: AppLogoSymbol): void {
    this.logoSymbol.set(symbol);
  }

  public setLogoTheme(theme: AppLogoTheme): void {
    this.logoTheme.set(theme);
  }

  public addChatMessage(sender: 'user' | 'assistant', text: string, scriptureRefs?: string[], theme?: string): void {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender,
      text,
      timestamp: Date.now(),
      scriptureRefs,
      theme
    };
    this.chatMessages.update(msgs => [...msgs, newMsg]);
  }

  public clearChat(): void {
    this.chatMessages.set([]);
    this.chatMessages.set(this.loadInitialChat());
    this.showSnackbar('Conversación reiniciada.');
  }

  public showSnackbar(msg: string): void {
    this.snackbarMessage.set(msg);
    setTimeout(() => {
      if (this.snackbarMessage() === msg) {
        this.snackbarMessage.set(null);
      }
    }, 4000);
  }

  public clearSnackbar(): void {
    this.snackbarMessage.set(null);
  }

  // ─── Onboarding ────────────────────────────────────────────────────────────

  public onboardingCompleted = computed(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY_ONBOARDING_DONE) === 'true') {
      return true;
    }
    return !!this.userProfile().onboardingCompleted;
  });

  public completeOnboarding(partial: Partial<UserProfile>): void {
    const edition = partial.genderTheme === 'female' ? 'female' : 'male';
    this.edition.set(edition);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ONBOARDING_DONE, 'true');
    }
    this.userProfile.update(prev => ({
      ...prev,
      ...partial,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString()
    }));
    this.showSnackbar('¡Bienvenido a tu R07 — Pasa Tiempo Conmigo! 🕊️');
  }

  public resetAllData(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_CURRENT_WEEK_ID);
    localStorage.removeItem(STORAGE_KEY_WEEKS);
    localStorage.removeItem(STORAGE_KEY_PREFS);
    localStorage.removeItem(STORAGE_KEY_CHAT);
    localStorage.removeItem(STORAGE_KEY_SAVED_VERSES);
    localStorage.removeItem(STORAGE_KEY_ONBOARDING_DONE);
    // Reset signals to defaults
    this.userProfile.set(this.loadInitialProfile());
    this.allWeeks.set(this.loadInitialWeeks());
    this.currentWeekId.set('');
    this.chatMessages.set(this.loadInitialChat());
    this.savedVerses.set([]);
    this.edition.set('male');
    this.showSnackbar('Datos restablecidos. Comenzando de nuevo. 🙏');
  }

  // ─── Saved Verses Collection ──────────────────────────────────────────────

  public saveVerse(verse: Omit<SavedVerse, 'id' | 'savedAt'>): void {
    const existing = this.savedVerses().find(v =>
      v.book === verse.book &&
      v.chapter === verse.chapter &&
      v.verse === verse.verse &&
      v.version === verse.version
    );
    if (existing) {
      this.showSnackbar('Este versículo ya está en tus guardados ⭐');
      return;
    }
    const newEntry: SavedVerse = {
      ...verse,
      id: `sv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      savedAt: new Date().toISOString()
    };
    this.savedVerses.update(list => [newEntry, ...list]);
    this.showSnackbar(`Versículo guardado en tus favoritos ⭐`);
  }

  public removeSavedVerse(id: string): void {
    this.savedVerses.update(list => list.filter(v => v.id !== id));
    this.showSnackbar('Versículo eliminado de tus guardados');
  }

  public isVerseSaved(book: string, chapter: number, verseNum: number, version: string): boolean {
    return this.savedVerses().some(v =>
      v.book === book &&
      v.chapter === chapter &&
      v.verse === verseNum &&
      v.version === version
    );
  }

  public getTodayScripturePlan(): DailyScripturePlan | null {
    const dayIdx = this.selectedDayIndex(); // 0=Mon … 6=Sun
    const isFemale = this.edition() === 'female';
    const plans = isFemale ? WOMEN_DAILY_READINGS : MEN_DAILY_READINGS;
    return plans[dayIdx] ?? plans[0] ?? null;
  }

  public openBibleReadingForToday(): void {
    const plan = this.getTodayScripturePlan();
    if (plan) {
      let start = 1;
      let end = 999;
      if (plan.verses) {
        const parts = plan.verses.split('-').map(s => parseInt(s.trim(), 10));
        if (!isNaN(parts[0])) start = parts[0];
        if (parts.length > 1 && !isNaN(parts[1])) end = parts[1];
        else end = start;
      }
      this.highlightedVerses.set({
        book: plan.book,
        chapter: plan.chapter,
        verseStart: start,
        verseEnd: end,
        reference: plan.reference
      });
    }
    this.setMobileTab('bible');
  }

  private checkPastDaysClosure(): void {
    if (typeof window === 'undefined') return;
    const todayStr = new Date().toISOString().split('T')[0];
    const week = this.currentWeek();
    if (!week || !week.days) return;
    let changed = false;
    const updatedDays = week.days.map(d => {
      if (d.date < todayStr && !d.completed && (d.rhema || d.reflection || d.application)) {
        changed = true;
        return { ...d, completed: true };
      }
      return d;
    });
    if (changed) {
      this.saveCurrentWeek({ ...week, days: updatedDays });
    }
  }
}


