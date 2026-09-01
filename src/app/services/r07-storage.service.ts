import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { R07Week, DayJournal, UserProfile, SPANISH_DAYS, DEFAULT_WEEKLY_VERSES } from '../models/r07.models';
import { FirebaseService } from './firebase.service';

const STORAGE_KEY_PROFILE = 'r07_user_profile';
const STORAGE_KEY_CURRENT_WEEK_ID = 'r07_current_week_id';
const STORAGE_KEY_WEEKS = 'r07_weeks_data';

@Injectable({
  providedIn: 'root'
})
export class R07StorageService {
  private firebase = inject(FirebaseService);

  // Core reactive signals
  public userProfile = signal<UserProfile>(this.loadInitialProfile());
  public allWeeks = signal<R07Week[]>(this.loadInitialWeeks());
  public currentWeekId = signal<string>(localStorage.getItem(STORAGE_KEY_CURRENT_WEEK_ID) || '');
  public selectedDayIndex = signal<number>(this.getTodayDayIndex()); // 0 = Monday ... 6 = Sunday

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
    if (week.days && week.days[dayIdx]) {
      return week.days[dayIdx];
    }
    return week.days[0] || this.createEmptyDay(0, new Date().toISOString().split('T')[0]);
  });

  public completedDaysCount = computed<number>(() => {
    const week = this.currentWeek();
    return week.days.filter(d => d.completed).length;
  });

  public weeklyProgressPercentage = computed<number>(() => {
    const total = 7;
    const completed = this.completedDaysCount();
    return Math.round((completed / total) * 100);
  });

  public totalTimeSpentMinutes = computed<number>(() => {
    const week = this.currentWeek();
    return week.days.reduce((acc, d) => acc + (d.timeSpentMinutes || 0), 0);
  });

  constructor() {
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
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      if (this.firebase.isSignedIn() && profile.userId) {
        this.firebase.saveUserProfile(profile).catch(err => console.warn('Cloud sync error profile:', err));
      }
    });

    // Effect: sync weeks to local storage & Firebase
    effect(() => {
      const weeks = this.allWeeks();
      localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(weeks));
    });

    // Effect: when user signs in, load their cloud data
    effect(() => {
      const user = this.firebase.currentUser();
      if (user) {
        this.syncWithCloud(user.uid, user.displayName, user.email);
      }
    });
  }

  private loadInitialProfile(): UserProfile {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      userId: 'local_user',
      displayName: 'Hijo/a de Dios',
      genderTheme: 'female',
      leaderName: '',
      groupName: '',
      churchName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private loadInitialWeeks(): R07Week[] {
    const saved = localStorage.getItem(STORAGE_KEY_WEEKS);
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
    const sampleVerses = [
      { book: 'Salmos', chapter: 23, verses: '1-6' },
      { book: 'Juan', chapter: 15, verses: '1-8' },
      { book: 'Filipenses', chapter: 4, verses: '4-9' },
      { book: 'Romanos', chapter: 8, verses: '28-39' },
      { book: 'Efesios', chapter: 6, verses: '10-18' },
      { book: 'Isaías', chapter: 40, verses: '28-31' },
      { book: 'Hebreos', chapter: 11, verses: '1-6' }
    ];

    const defaultReading = sampleVerses[dayIndex] || { book: 'Salmos', chapter: 1, verses: '1-6' };

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
      dailyAffirmation: '',
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

    const startDateStr = monday.toISOString().split('T')[0];
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const endDateStr = sunday.toISOString().split('T')[0];

    const weekNum = this.getWeekNumber(monday);
    const randomVerse = DEFAULT_WEEKLY_VERSES[Math.floor(Math.random() * DEFAULT_WEEKLY_VERSES.length)];

    const days: DayJournal[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
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
      const cloudProfile = await this.firebase.getUserProfile(userId);
      if (cloudProfile) {
        this.userProfile.set(cloudProfile);
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
    const updatedDays = [...week.days];

    updatedDays[dayIdx] = {
      ...updatedDays[dayIdx],
      ...updatedDay
    };

    const completedCount = updatedDays.filter(d => d.completed).length;

    const updatedWeek: R07Week = {
      ...week,
      days: updatedDays,
      weeklyEvaluation: {
        ...week.weeklyEvaluation,
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
}
