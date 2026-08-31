import { Injectable, signal, computed, effect } from '@angular/core';
import {
  AppColorPalette,
  AppEdition,
  AppFontFamily,
  AppLogoSymbol,
  AppLogoTheme,
  AppThemeMode,
  MEN_MOODS,
  R07CommunityEntity,
  R07DayEntryEntity,
  R07FriendEntity,
  R07Mood,
  R07PrayerPetitionEntity,
  R07WeekEntity,
  R07WeeklyGoalEntity,
  UserAccountType,
  WeekWithDays,
  WOMEN_MOODS
} from '../models/r07.models';

const STORAGE_KEYS = {
  WEEKS: 'r07_weeks_data',
  DAYS: 'r07_days_data',
  GOALS: 'r07_goals_data',
  PETITIONS: 'r07_petitions_data',
  FRIENDS: 'r07_friends_data',
  COMMUNITIES: 'r07_communities_data',
  SELECTED_WEEK_ID: 'r07_selected_week_id',
  SELECTED_DAY_NUM: 'r07_selected_day_num',
  USER_PROFILE: 'r07_user_profile',
  PREFERENCES: 'r07_preferences'
};

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

@Injectable({
  providedIn: 'root'
})
export class R07StorageService {
  // State Signals
  readonly weeks = signal<R07WeekEntity[]>([]);
  readonly days = signal<R07DayEntryEntity[]>([]);
  readonly goals = signal<R07WeeklyGoalEntity[]>([]);
  readonly petitions = signal<R07PrayerPetitionEntity[]>([]);
  readonly friends = signal<R07FriendEntity[]>([]);
  readonly communities = signal<R07CommunityEntity[]>([]);

  readonly selectedWeekId = signal<number | null>(null);
  readonly selectedDayNumber = signal<number>(1);

  // User Profile Signals
  readonly isLoggedIn = signal<boolean>(true);
  readonly authProvider = signal<string>('GOOGLE');
  readonly userName = signal<string>('Juan Santiago');
  readonly userAge = signal<string>('28');
  readonly userAvatarEmoji = signal<string>('🌸');
  readonly userEmail = signal<string>('usuario@r07.org');
  readonly userPhotoUri = signal<string>('');
  readonly userBio = signal<string>('Caminando cada día en la gracia y amor de Dios ✨');
  readonly userFriendToken = signal<string>('R07-JUAN-4819');
  readonly accountType = signal<UserAccountType>('CONNECTION_GROUP');
  readonly groupName = signal<string>('Célula Gracia & Vida');
  readonly churchName = signal<string>('Su Presencia');
  readonly leaderName = signal<string>('Pastor David');
  readonly leaderPhone = signal<string>('+57 300 123 4567');
  readonly leaderEmail = signal<string>('lider@supresencia.com');

  // Preferences Signals
  readonly edition = signal<AppEdition>('WOMEN');
  readonly themeMode = signal<AppThemeMode>('LIGHT');
  readonly colorPalette = signal<AppColorPalette>('WOMEN_PINK');
  readonly fontFamily = signal<AppFontFamily>('DEFAULT');
  readonly logoTheme = signal<AppLogoTheme>('DYNAMIC');
  readonly logoSymbol = signal<AppLogoSymbol>('DOVE_CROSS');

  // Toast / notification message
  readonly snackbarMessage = signal<string | null>(null);

  // Computed Properties
  readonly currentWeekWithDays = computed<WeekWithDays | null>(() => {
    const weekId = this.selectedWeekId();
    if (!weekId) return null;
    const week = this.weeks().find((w) => w.id === weekId);
    if (!week) return null;
    const weekDays = this.days().filter((d) => d.weekId === weekId).sort((a, b) => a.dayNumber - b.dayNumber);
    const weekGoals = this.goals().filter((g) => g.weekId === weekId);
    return { week, days: weekDays, goals: weekGoals };
  });

  readonly allWeeksWithDays = computed<WeekWithDays[]>(() => {
    return this.weeks().map((week) => ({
      week,
      days: this.days().filter((d) => d.weekId === week.id).sort((a, b) => a.dayNumber - b.dayNumber),
      goals: this.goals().filter((g) => g.weekId === week.id)
    }));
  });

  readonly availableMoods = computed<R07Mood[]>(() => {
    return this.edition() === 'MEN' ? MEN_MOODS : WOMEN_MOODS;
  });

  readonly currentThemeColors = computed(() => {
    const palette = this.colorPalette();
    const isDark = this.themeMode() === 'DARK';

    switch (palette) {
      case 'MEN_BLUE':
        return {
          primary: '#0D47A1',
          primaryDark: '#0A3880',
          primaryLight: '#E3F2FD',
          primaryContainer: '#D7E8FA',
          accent: '#1976D2',
          background: isDark ? '#0F172A' : '#F8FAFC',
          surface: isDark ? '#1E293B' : '#FFFFFF',
          border: isDark ? '#334155' : '#CBD5E1',
          textPrimary: isDark ? '#F1F5F9' : '#0F172A',
          textSecondary: isDark ? '#94A3B8' : '#475569',
          textMuted: isDark ? '#64748B' : '#64748B'
        };
      case 'OLIVE_SAGE':
        return {
          primary: '#2E6F40',
          primaryDark: '#1E4B2B',
          primaryLight: '#E8F5E9',
          primaryContainer: '#D5EBD7',
          accent: '#388E3C',
          background: isDark ? '#111815' : '#F4F7F4',
          surface: isDark ? '#1A241F' : '#FFFFFF',
          border: isDark ? '#2E3F35' : '#D1DFD3',
          textPrimary: isDark ? '#ECFDF5' : '#14291B',
          textSecondary: isDark ? '#A7F3D0' : '#3E5C46',
          textMuted: isDark ? '#6EE7B7' : '#5E7966'
        };
      case 'ROYAL_GOLD':
        return {
          primary: '#996515',
          primaryDark: '#784E10',
          primaryLight: '#FFF8E7',
          primaryContainer: '#F7E7C4',
          accent: '#D4AF37',
          background: isDark ? '#17140D' : '#FAF7F0',
          surface: isDark ? '#262013' : '#FFFFFF',
          border: isDark ? '#42371E' : '#E6DBC6',
          textPrimary: isDark ? '#FEF3C7' : '#291F0B',
          textSecondary: isDark ? '#FDE68A' : '#614E25',
          textMuted: isDark ? '#D97706' : '#7D6A3E'
        };
      case 'LAVENDER_PASTEL':
        return {
          primary: '#7E57C2',
          primaryDark: '#5E35B1',
          primaryLight: '#EDE7F6',
          primaryContainer: '#E1D5F5',
          accent: '#9575CD',
          background: isDark ? '#14111E' : '#FAF8FD',
          surface: isDark ? '#211C30' : '#FFFFFF',
          border: isDark ? '#3C3357' : '#DFD7EC',
          textPrimary: isDark ? '#F3E8FF' : '#22163A',
          textSecondary: isDark ? '#D8B4FE' : '#5C4A7B',
          textMuted: isDark ? '#A855F7' : '#7A6B97'
        };
      case 'SKY_PASTEL':
        return {
          primary: '#0288D1',
          primaryDark: '#01579B',
          primaryLight: '#E1F5FE',
          primaryContainer: '#CEECFD',
          accent: '#03A9F4',
          background: isDark ? '#0B1520' : '#F0F8FF',
          surface: isDark ? '#132333' : '#FFFFFF',
          border: isDark ? '#243C55' : '#CFE2F2',
          textPrimary: isDark ? '#E0F2FE' : '#0B2338',
          textSecondary: isDark ? '#BAE6FD' : '#315C80',
          textMuted: isDark ? '#38BDF8' : '#537C9D'
        };
      case 'TERRACOTTA':
        return {
          primary: '#A0522D',
          primaryDark: '#7C3F22',
          primaryLight: '#FBE9E7',
          primaryContainer: '#F3D4CC',
          accent: '#D87040',
          background: isDark ? '#1A110D' : '#FAF4F1',
          surface: isDark ? '#2B1B15' : '#FFFFFF',
          border: isDark ? '#4A3025' : '#E6D3C9',
          textPrimary: isDark ? '#FFEDD5' : '#30180F',
          textSecondary: isDark ? '#FED7AA' : '#6A4433',
          textMuted: isDark ? '#FB923C' : '#8A6250'
        };
      case 'WOMEN_PINK':
      default:
        return {
          primary: '#D86588',
          primaryDark: '#B43758',
          primaryLight: '#FFF0F5',
          primaryContainer: '#FCE4EC',
          accent: '#E91E63',
          background: isDark ? '#180F13' : '#FFF9FA',
          surface: isDark ? '#291720' : '#FFFFFF',
          border: isDark ? '#482736' : '#F3D5DE',
          textPrimary: isDark ? '#FDF2F8' : '#2E111C',
          textSecondary: isDark ? '#FBCFE8' : '#6D354B',
          textMuted: isDark ? '#F472B6' : '#8E566C'
        };
    }
  });

  constructor() {
    this.loadInitialData();

    // Auto-save on signal changes
    effect(() => {
      this.saveToStorage(STORAGE_KEYS.WEEKS, this.weeks());
      this.saveToStorage(STORAGE_KEYS.DAYS, this.days());
      this.saveToStorage(STORAGE_KEYS.GOALS, this.goals());
      this.saveToStorage(STORAGE_KEYS.PETITIONS, this.petitions());
      this.saveToStorage(STORAGE_KEYS.FRIENDS, this.friends());
      this.saveToStorage(STORAGE_KEYS.COMMUNITIES, this.communities());
    });

    effect(() => {
      if (this.selectedWeekId()) {
        this.saveToStorage(STORAGE_KEYS.SELECTED_WEEK_ID, this.selectedWeekId());
      }
    });

    effect(() => {
      this.saveToStorage(STORAGE_KEYS.USER_PROFILE, {
        isLoggedIn: this.isLoggedIn(),
        authProvider: this.authProvider(),
        userName: this.userName(),
        userAge: this.userAge(),
        userAvatarEmoji: this.userAvatarEmoji(),
        userEmail: this.userEmail(),
        userPhotoUri: this.userPhotoUri(),
        userBio: this.userBio(),
        userFriendToken: this.userFriendToken(),
        accountType: this.accountType(),
        groupName: this.groupName(),
        churchName: this.churchName(),
        leaderName: this.leaderName(),
        leaderPhone: this.leaderPhone(),
        leaderEmail: this.leaderEmail()
      });
    });

    effect(() => {
      this.saveToStorage(STORAGE_KEYS.PREFERENCES, {
        edition: this.edition(),
        themeMode: this.themeMode(),
        colorPalette: this.colorPalette(),
        fontFamily: this.fontFamily(),
        logoTheme: this.logoTheme(),
        logoSymbol: this.logoSymbol()
      });
    });
  }

  private loadInitialData(): void {
    try {
      const storedWeeks = this.getFromStorage<R07WeekEntity[]>(STORAGE_KEYS.WEEKS);
      const storedDays = this.getFromStorage<R07DayEntryEntity[]>(STORAGE_KEYS.DAYS);
      const storedGoals = this.getFromStorage<R07WeeklyGoalEntity[]>(STORAGE_KEYS.GOALS);
      const storedPetitions = this.getFromStorage<R07PrayerPetitionEntity[]>(STORAGE_KEYS.PETITIONS);
      const storedFriends = this.getFromStorage<R07FriendEntity[]>(STORAGE_KEYS.FRIENDS);
      const storedCommunities = this.getFromStorage<R07CommunityEntity[]>(STORAGE_KEYS.COMMUNITIES);
      const storedProfile = this.getFromStorage<any>(STORAGE_KEYS.USER_PROFILE);
      const storedPrefs = this.getFromStorage<any>(STORAGE_KEYS.PREFERENCES);
      const storedWeekId = this.getFromStorage<number>(STORAGE_KEYS.SELECTED_WEEK_ID);

      if (storedPrefs) {
        if (storedPrefs.edition) this.edition.set(storedPrefs.edition);
        if (storedPrefs.themeMode) this.themeMode.set(storedPrefs.themeMode);
        if (storedPrefs.colorPalette) this.colorPalette.set(storedPrefs.colorPalette);
        if (storedPrefs.fontFamily) this.fontFamily.set(storedPrefs.fontFamily);
        if (storedPrefs.logoTheme) this.logoTheme.set(storedPrefs.logoTheme);
        if (storedPrefs.logoSymbol) this.logoSymbol.set(storedPrefs.logoSymbol);
      }

      if (storedProfile) {
        if (storedProfile.userName) this.userName.set(storedProfile.userName);
        if (storedProfile.userAge) this.userAge.set(storedProfile.userAge);
        if (storedProfile.userAvatarEmoji) this.userAvatarEmoji.set(storedProfile.userAvatarEmoji);
        if (storedProfile.userEmail) this.userEmail.set(storedProfile.userEmail);
        if (storedProfile.userPhotoUri) this.userPhotoUri.set(storedProfile.userPhotoUri);
        if (storedProfile.userBio) this.userBio.set(storedProfile.userBio);
        if (storedProfile.userFriendToken) this.userFriendToken.set(storedProfile.userFriendToken);
        if (storedProfile.accountType) this.accountType.set(storedProfile.accountType);
        if (storedProfile.groupName) this.groupName.set(storedProfile.groupName);
        if (storedProfile.churchName) this.churchName.set(storedProfile.churchName);
        if (storedProfile.leaderName) this.leaderName.set(storedProfile.leaderName);
        if (storedProfile.leaderPhone) this.leaderPhone.set(storedProfile.leaderPhone);
        if (storedProfile.leaderEmail) this.leaderEmail.set(storedProfile.leaderEmail);
      }

      if (storedWeeks && storedWeeks.length > 0 && storedDays && storedDays.length > 0) {
        this.weeks.set(storedWeeks);
        this.days.set(storedDays);
        this.goals.set(storedGoals || []);
        this.petitions.set(storedPetitions || []);
        this.friends.set(storedFriends || []);
        this.communities.set(storedCommunities || []);

        const validId = storedWeeks.some((w) => w.id === storedWeekId) ? storedWeekId : storedWeeks[0].id;
        this.selectedWeekId.set(validId);
      } else {
        // Seed default initial week 1
        this.seedInitialWeek();
      }
    } catch (e) {
      console.warn('Error loading from storage:', e);
      this.seedInitialWeek();
    }
  }

  private seedInitialWeek(): void {
    const weekId = Date.now();
    const today = new Date();
    const startDateStr = this.formatShortDate(today);
    const end = new Date(today);
    end.setDate(today.getDate() + 6);
    const endDateStr = this.formatShortDate(end);

    const initialWeek: R07WeekEntity = {
      id: weekId,
      title: 'Semana 1',
      startDate: startDateStr,
      endDate: endDateStr,
      readingGoal: 'Salmos 23 al 27',
      isGoalCompleted: false,
      prayerAttendanceCount: 2,
      verseOfTheWeek: '«Pasa tiempo Conmigo y saciaré tu alma»',
      generalNotes: 'Iniciando con gozo mi tiempo a solas con Dios.',
      attendedGroup: true,
      groupLearnings: 'La importancia de permanecer en la vid verdadera (Juan 15).',
      groupTopics: 'Vida devocional y comunión fraternal.',
      groupFeelings: 'Renovado y bendecido por la oración en grupo.',
      groupAbsenceReason: '',
      attendedPrayerDay1: true,
      prayerDay1Date: startDateStr,
      prayerDay1Notes: 'Tiempo de clamor por la familia y paz en el corazón.',
      prayerDay1AbsenceReason: '',
      attendedPrayerDay2: false,
      prayerDay2Date: '',
      prayerDay2Notes: '',
      prayerDay2AbsenceReason: '',
      attendedSundayService: true,
      sundayServiceNotes: 'Mensaje sobre confiar plenamente en las promesas de Dios.',
      createdAt: Date.now()
    };

    const initialDays: R07DayEntryEntity[] = DAY_NAMES.map((name, index) => {
      const dDate = new Date(today);
      dDate.setDate(today.getDate() + index);
      const isFirst = index === 0;

      return {
        id: weekId + index + 1,
        weekId: weekId,
        dayNumber: index + 1,
        dayName: name,
        dateText: this.formatShortDate(dDate),
        timeText: isFirst ? '06:30 AM' : '',
        scriptureRef: isFirst ? 'Salmos 23:1-6' : '',
        reflectionText: isFirst
          ? 'El Señor es mi pastor y nada me faltará. En lugares de delicados pastos me hace descansar y renueva mis fuerzas cada día.'
          : '',
        godSpoke: isFirst ? 'Descansa en Mi provisión y fidelidad.' : '',
        actionStep: isFirst ? 'Comenzar el día orando antes de revisar el celular.' : '',
        prayerText: isFirst ? 'Señor Jesús, gracias por cuidar de mí y darme paz en todo tiempo.' : '',
        mood: isFirst ? 'En Paz' : '',
        moodEmoji: isFirst ? '🕊️' : '',
        photoUrisJson: '[]',
        isCompleted: isFirst,
        updatedAt: Date.now()
      };
    });

    const initialGoals: R07WeeklyGoalEntity[] = [
      { id: 1, weekId, title: 'Hacer el R07 los 7 días sin falta', category: 'Espiritual', isCompleted: false, createdAt: Date.now() },
      { id: 2, weekId, title: 'Asistir a los 2 tiempos de oración de la iglesia', category: 'Oración', isCompleted: true, createdAt: Date.now() },
      { id: 3, weekId, title: 'Memorizar Salmos 23:1-3', category: 'Lectura', isCompleted: false, createdAt: Date.now() }
    ];

    const initialPetitions: R07PrayerPetitionEntity[] = [
      {
        id: 1,
        title: 'Paz y provisión en el hogar',
        description: 'Clamor por bendición y salud de mis seres queridos',
        category: 'Familia',
        isAnswered: false,
        answeredDate: '',
        testimonyNote: '',
        prayerCount: 5,
        createdAt: Date.now()
      },
      {
        id: 2,
        title: 'Crecimiento en el grupo de conexión',
        description: 'Nuevas vidas alcanzadas y discipuladas en la palabra',
        category: 'Iglesia',
        isAnswered: true,
        answeredDate: 'Ayer',
        testimonyNote: 'Llegaron dos personas nuevas con un corazón receptivo.',
        prayerCount: 8,
        createdAt: Date.now()
      }
    ];

    const initialFriends: R07FriendEntity[] = [
      {
        id: 1,
        friendToken: 'R07-MARIA-2940',
        name: 'María Camila',
        avatarEmoji: '🌸',
        churchOrGroup: 'Célula Gracia',
        currentStreak: 6,
        lastDevotionalDate: 'Hoy 06:15 AM',
        prayerRequest: 'Por dirección para nuevo trabajo',
        isFavorite: true,
        connectedAt: Date.now()
      },
      {
        id: 2,
        friendToken: 'R07-MATEO-8193',
        name: 'Mateo Andrés',
        avatarEmoji: '🛡️',
        churchOrGroup: 'Jóvenes de Fe',
        currentStreak: 4,
        lastDevotionalDate: 'Ayer',
        prayerRequest: 'Por salud de mi abuela',
        isFavorite: false,
        connectedAt: Date.now()
      }
    ];

    const initialCommunities: R07CommunityEntity[] = [
      {
        id: 1,
        communityToken: 'COM-VIDA-9921',
        name: 'Célula Gracia & Vida',
        churchName: 'Su Presencia',
        leaderName: 'Pastor David',
        meetingSchedule: 'Miércoles 7:30 PM',
        description: 'Grupo de conexión semanal para orar, meditar en el R07 y crecer juntos.',
        memberCount: 9,
        isMyCommunity: true,
        createdAt: Date.now()
      }
    ];

    this.weeks.set([initialWeek]);
    this.days.set(initialDays);
    this.goals.set(initialGoals);
    this.petitions.set(initialPetitions);
    this.friends.set(initialFriends);
    this.communities.set(initialCommunities);
    this.selectedWeekId.set(weekId);
  }

  // Week Operations
  startNewWeek(title: string, startDate: string, endDate: string, readingGoal: string, verse: string): number {
    return this.createNewWeek(title, startDate, endDate, readingGoal, verse);
  }

  createNewWeek(title: string, startDate: string, endDate: string, readingGoal: string, verse: string): number {
    const weekId = Date.now();
    const newWeek: R07WeekEntity = {
      id: weekId,
      title: title.trim() || `Semana ${this.weeks().length + 1}`,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      readingGoal: readingGoal.trim(),
      isGoalCompleted: false,
      prayerAttendanceCount: 0,
      verseOfTheWeek: verse.trim() || '«Pasa tiempo Conmigo y saciaré tu alma»',
      generalNotes: '',
      attendedGroup: false,
      groupLearnings: '',
      groupTopics: '',
      groupFeelings: '',
      groupAbsenceReason: '',
      attendedPrayerDay1: false,
      prayerDay1Date: '',
      prayerDay1Notes: '',
      prayerDay1AbsenceReason: '',
      attendedPrayerDay2: false,
      prayerDay2Date: '',
      prayerDay2Notes: '',
      prayerDay2AbsenceReason: '',
      attendedSundayService: false,
      sundayServiceNotes: '',
      createdAt: Date.now()
    };

    const newDays: R07DayEntryEntity[] = DAY_NAMES.map((name, index) => ({
      id: weekId + index + 1,
      weekId: weekId,
      dayNumber: index + 1,
      dayName: name,
      dateText: `Día ${index + 1}`,
      timeText: '',
      scriptureRef: '',
      reflectionText: '',
      godSpoke: '',
      actionStep: '',
      prayerText: '',
      mood: '',
      moodEmoji: '',
      photoUrisJson: '[]',
      isCompleted: false,
      updatedAt: Date.now()
    }));

    this.weeks.update((w) => [newWeek, ...w]);
    this.days.update((d) => [...newDays, ...d]);
    this.selectedWeekId.set(weekId);
    this.selectedDayNumber.set(1);
    this.showSnackbar(`¡${newWeek.title} creada con éxito!`);
    return weekId;
  }

  selectWeek(weekId: number): void {
    this.selectedWeekId.set(weekId);
    this.selectedDayNumber.set(1);
  }

  selectDay(dayNumber: number): void {
    this.selectedDayNumber.set(dayNumber);
  }

  deleteWeek(weekId: number): void {
    this.weeks.update((w) => w.filter((x) => x.id !== weekId));
    this.days.update((d) => d.filter((x) => x.weekId !== weekId));
    this.goals.update((g) => g.filter((x) => x.weekId !== weekId));

    const remaining = this.weeks();
    if (remaining.length > 0) {
      this.selectedWeekId.set(remaining[0].id);
      this.selectedDayNumber.set(1);
    } else {
      this.selectedWeekId.set(null);
    }
    this.showSnackbar('Semana eliminada.');
  }

  updateReadingGoal(weekId: number, goal: string): void {
    this.weeks.update((weeks) =>
      weeks.map((w) => (w.id === weekId ? { ...w, readingGoal: goal } : w))
    );
  }

  updateGoalCompleted(weekId: number, completed: boolean): void {
    this.weeks.update((weeks) =>
      weeks.map((w) => (w.id === weekId ? { ...w, isGoalCompleted: completed } : w))
    );
  }

  incrementPrayerAttendance(weekId: number): void {
    this.weeks.update((weeks) =>
      weeks.map((w) => (w.id === weekId ? { ...w, prayerAttendanceCount: w.prayerAttendanceCount + 1 } : w))
    );
  }

  decrementPrayerAttendance(weekId: number): void {
    this.weeks.update((weeks) =>
      weeks.map((w) =>
        w.id === weekId ? { ...w, prayerAttendanceCount: Math.max(0, w.prayerAttendanceCount - 1) } : w
      )
    );
  }

  updateChurchPrayerAttendance(
    weekId: number,
    attended1: boolean,
    date1: string,
    notes1: string,
    reason1: string,
    attended2: boolean,
    date2: string,
    notes2: string,
    reason2: string
  ): void {
    this.weeks.update((weeks) =>
      weeks.map((w) =>
        w.id === weekId
          ? {
              ...w,
              attendedPrayerDay1: attended1,
              prayerDay1Date: date1,
              prayerDay1Notes: notes1,
              prayerDay1AbsenceReason: reason1,
              attendedPrayerDay2: attended2,
              prayerDay2Date: date2,
              prayerDay2Notes: notes2,
              prayerDay2AbsenceReason: reason2
            }
          : w
      )
    );
    this.showSnackbar('Registro de oración en la iglesia guardado.');
  }

  updateConnectionGroupInfo(
    weekId: number,
    attended: boolean,
    learnings: string,
    topics: string,
    feelings: string,
    reason: string
  ): void {
    this.weeks.update((weeks) =>
      weeks.map((w) =>
        w.id === weekId
          ? {
              ...w,
              attendedGroup: attended,
              groupLearnings: learnings,
              groupTopics: topics,
              groupFeelings: feelings,
              groupAbsenceReason: reason
            }
          : w
      )
    );
    this.showSnackbar('Notas de grupo de conexión actualizadas.');
  }

  // Day Entry Operations
  updateDayEntry(entry: R07DayEntryEntity): void {
    const isCompleted = entry.reflectionText.trim().length > 0 || entry.scriptureRef.trim().length > 0;
    const updated = { ...entry, isCompleted, updatedAt: Date.now() };

    this.days.update((days) =>
      days.map((d) => (d.id === entry.id ? updated : d))
    );
  }

  attachPhotoToDay(dayId: number, photoDataUrl: string): void {
    this.days.update((days) =>
      days.map((d) => {
        if (d.id === dayId) {
          let uris: string[] = [];
          try {
            uris = JSON.parse(d.photoUrisJson || '[]');
          } catch {
            uris = [];
          }
          uris.push(photoDataUrl);
          return { ...d, photoUrisJson: JSON.stringify(uris), updatedAt: Date.now() };
        }
        return d;
      })
    );
    this.showSnackbar('Foto de página devocional adjuntada.');
  }

  removePhotoFromDay(dayId: number, photoIndex: number): void {
    this.days.update((days) =>
      days.map((d) => {
        if (d.id === dayId) {
          let uris: string[] = [];
          try {
            uris = JSON.parse(d.photoUrisJson || '[]');
          } catch {
            uris = [];
          }
          uris.splice(photoIndex, 1);
          return { ...d, photoUrisJson: JSON.stringify(uris), updatedAt: Date.now() };
        }
        return d;
      })
    );
  }

  // Weekly Goals Operations
  addWeeklyGoal(weekId: number, title: string, category: string): void {
    const newGoal: R07WeeklyGoalEntity = {
      id: Date.now(),
      weekId,
      title: title.trim(),
      category: category.trim() || 'Espiritual',
      isCompleted: false,
      createdAt: Date.now()
    };
    this.goals.update((g) => [...g, newGoal]);
    this.showSnackbar('Meta agregada.');
  }

  toggleWeeklyGoal(goalId: number): void {
    this.goals.update((goals) =>
      goals.map((g) => (g.id === goalId ? { ...g, isCompleted: !g.isCompleted } : g))
    );
  }

  deleteWeeklyGoal(goalId: number): void {
    this.goals.update((goals) => goals.filter((g) => g.id !== goalId));
  }

  // Prayer Petitions Operations
  addPrayerPetition(title: string, description: string, category: string): void {
    const newPetition: R07PrayerPetitionEntity = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Personal',
      isAnswered: false,
      answeredDate: '',
      testimonyNote: '',
      prayerCount: 1,
      createdAt: Date.now()
    };
    this.petitions.update((p) => [newPetition, ...p]);
    this.showSnackbar('Petición de oración agregada.');
  }

  togglePrayerPetitionAnswered(petitionId: number, testimonyNote: string = ''): void {
    const today = this.formatShortDate(new Date());
    this.petitions.update((petitions) =>
      petitions.map((p) =>
        p.id === petitionId
          ? {
              ...p,
              isAnswered: !p.isAnswered,
              answeredDate: !p.isAnswered ? today : '',
              testimonyNote: !p.isAnswered ? testimonyNote.trim() : ''
            }
          : p
      )
    );
    this.showSnackbar('Estado de petición actualizado ✨');
  }

  incrementPetitionPrayerCount(petitionId: number): void {
    this.petitions.update((petitions) =>
      petitions.map((p) => (p.id === petitionId ? { ...p, prayerCount: p.prayerCount + 1 } : p))
    );
    this.showSnackbar('¡Oramos por esta petición! 🙏');
  }

  deletePrayerPetition(petitionId: number): void {
    this.petitions.update((petitions) => petitions.filter((p) => p.id !== petitionId));
  }

  // Friends & Community Operations
  addFriend(token: string, name: string, emoji: string = '🌸', group: string = 'Comunidad'): void {
    const newFriend: R07FriendEntity = {
      id: Date.now(),
      friendToken: token.trim() || `R07-${name.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      avatarEmoji: emoji,
      churchOrGroup: group.trim(),
      currentStreak: 1,
      lastDevotionalDate: 'Hoy',
      prayerRequest: 'Creciendo en fe',
      isFavorite: false,
      connectedAt: Date.now()
    };
    this.friends.update((f) => [newFriend, ...f]);
    this.showSnackbar(`¡Amigo devocional @${name} agregado!`);
  }

  // Preferences & Theming
  setEdition(edition: AppEdition): void {
    this.edition.set(edition);
    if (edition === 'MEN' && this.colorPalette() === 'WOMEN_PINK') {
      this.colorPalette.set('MEN_BLUE');
    } else if (edition === 'WOMEN' && this.colorPalette() === 'MEN_BLUE') {
      this.colorPalette.set('WOMEN_PINK');
    }
  }

  setPalette(palette: AppColorPalette): void {
    this.colorPalette.set(palette);
  }

  setThemeMode(mode: AppThemeMode): void {
    this.themeMode.set(mode);
  }

  setFontFamily(font: AppFontFamily): void {
    this.fontFamily.set(font);
  }

  setLogoTheme(logo: AppLogoTheme): void {
    this.logoTheme.set(logo);
  }

  setLogoSymbol(symbol: AppLogoSymbol): void {
    this.logoSymbol.set(symbol);
  }

  setUserProfile(data: {
    userName?: string;
    userAge?: string;
    userAvatarEmoji?: string;
    userEmail?: string;
    userPhotoUri?: string;
    userBio?: string;
    accountType?: UserAccountType;
    groupName?: string;
    churchName?: string;
    leaderName?: string;
    leaderPhone?: string;
    leaderEmail?: string;
  }): void {
    if (data.userName !== undefined) this.userName.set(data.userName.trim());
    if (data.userAge !== undefined) this.userAge.set(data.userAge.trim());
    if (data.userAvatarEmoji !== undefined) this.userAvatarEmoji.set(data.userAvatarEmoji.trim());
    if (data.userEmail !== undefined) this.userEmail.set(data.userEmail.trim());
    if (data.userPhotoUri !== undefined) this.userPhotoUri.set(data.userPhotoUri.trim());
    if (data.userBio !== undefined) this.userBio.set(data.userBio.trim());
    if (data.accountType !== undefined) this.accountType.set(data.accountType);
    if (data.groupName !== undefined) this.groupName.set(data.groupName.trim());
    if (data.churchName !== undefined) this.churchName.set(data.churchName.trim());
    if (data.leaderName !== undefined) this.leaderName.set(data.leaderName.trim());
    if (data.leaderPhone !== undefined) this.leaderPhone.set(data.leaderPhone.trim());
    if (data.leaderEmail !== undefined) this.leaderEmail.set(data.leaderEmail.trim());

    this.showSnackbar('Perfil actualizado con éxito.');
  }

  showSnackbar(msg: string): void {
    this.snackbarMessage.set(msg);
    setTimeout(() => {
      if (this.snackbarMessage() === msg) {
        this.snackbarMessage.set(null);
      }
    }, 4000);
  }

  clearSnackbar(): void {
    this.snackbarMessage.set(null);
  }

  // Storage Helpers
  private saveToStorage(key: string, data: any): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e) {
      console.warn(`Error writing to localStorage for key ${key}`, e);
    }
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
      }
    } catch (e) {
      console.warn(`Error reading from localStorage for key ${key}`, e);
    }
    return null;
  }

  private formatShortDate(date: Date): string {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }
}
