import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { R07Header } from './components/r07-header';
import { R07MobileNav } from './components/r07-mobile-nav';
import { R07ChatTab } from './components/r07-chat-tab';
import { R07Community } from './components/r07-community';
import { R07DaySelector } from './components/r07-day-selector';
import { R07DailyAffirmation } from './components/r07-daily-affirmation';
import { R07DayJournalEditor } from './components/r07-day-journal-editor';
import { R07BibleTab } from './components/r07-bible-tab';
import { R07ExploreTab } from './components/r07-explore-tab';

import { AiDevotionalModal } from './components/modals/ai-devotional-modal';
import { AiLeaderReportModal } from './components/modals/ai-leader-report-modal';
import { AiPrayerModal } from './components/modals/ai-prayer-modal';
import { BibleReaderModal } from './components/modals/bible-reader-modal';
import { HowItWorksModal } from './components/modals/how-it-works-modal';
import { NewWeekModal } from './components/modals/new-week-modal';
import { OcrScanModal } from './components/modals/ocr-scan-modal';
import { PdfExportModal } from './components/modals/pdf-export-modal';
import { UserProfileModal } from './components/modals/user-profile-modal';
import { HeartReflectionSheet } from './components/modals/heart-reflection-sheet';
import { R07OnboardingModal } from './components/modals/r07-onboarding-modal';
import { AuthModal } from './components/modals/auth-modal';

import { R07StorageService } from './services/r07-storage.service';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    R07Header,
    R07MobileNav,
    R07ChatTab,
    R07Community,
    R07DaySelector,
    R07DailyAffirmation,
    R07DayJournalEditor,
    R07BibleTab,
    R07ExploreTab,
    AiDevotionalModal,
    AiLeaderReportModal,
    AiPrayerModal,
    BibleReaderModal,
    HowItWorksModal,
    NewWeekModal,
    OcrScanModal,
    PdfExportModal,
    UserProfileModal,
    HeartReflectionSheet,
    R07OnboardingModal,
    AuthModal
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col transition-colors duration-300 {{ storage.fontClass() }}"
         [style.backgroundColor]="colors.background"
         [style.color]="colors.textPrimary">
      
      <!-- Top Application Header -->
      <app-r07-header
        (openProfile)="showProfileModal.set(true)"
        (openHowItWorks)="showHowItWorksModal.set(true)"
        (openPdfExport)="showPdfModal.set(true)"
        (openNewWeek)="showNewWeekModal.set(true)">
      </app-r07-header>

      <!-- Main Mobile & Desktop Container -->
      <main class="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 flex-1 pb-24">
        
        <!-- TAB 1: 💬 CHAT ASISTENTE BÍBLICO IA -->
        @if (storage.activeMobileTab() === 'chat') {
          <app-r07-chat-tab></app-r07-chat-tab>
        }

        <!-- TAB 2: 👥 COMUNIDAD & MURO DE ORACIÓN -->
        @if (storage.activeMobileTab() === 'community') {
          <app-r07-community></app-r07-community>
        }

        <!-- TAB 3: 💛 HOY (DEVOCIONAL DIARIO R07) -->
        @if (storage.activeMobileTab() === 'today') {
          <div class="space-y-4 animate-fadeIn">
            <!-- 7 Days Bar -->
            <app-r07-day-selector></app-r07-day-selector>

            <!-- Verse of the Day & Affirmation Card -->
            <app-r07-daily-affirmation
              (openHeartReflection)="showHeartSheet.set(true)"
              (openAiDevotional)="showAiDevotionalModal.set(true)"
              (openBibleReader)="storage.setMobileTab('bible')"
              (openOcrModal)="showOcrModal.set(true)"
              (openAiPrayer)="showAiPrayerModal.set(true)">
            </app-r07-daily-affirmation>

            <!-- 4-Step Devotional Journal Editor -->
            <app-r07-day-journal-editor></app-r07-day-journal-editor>
          </div>
        }

        <!-- TAB 4: 📖 BIBLIA LECTOR INTERACTIVO (RVR1960 / NTV) -->
        @if (storage.activeMobileTab() === 'bible') {
          <app-r07-bible-tab></app-r07-bible-tab>
        }

        <!-- TAB 5: 🧭 EXPLORAR, PLANES, METAS & TABLA SEMANAL -->
        @if (storage.activeMobileTab() === 'explore') {
          <app-r07-explore-tab
            (openPdfExport)="showPdfModal.set(true)"
            (openLeaderReport)="showLeaderReportModal.set(true)">
          </app-r07-explore-tab>
        }

      </main>

      <!-- Mobile Bottom Navigation Bar (5 Tabs) -->
      <app-r07-mobile-nav></app-r07-mobile-nav>

      <!-- Global Snackbar Toast Message -->
      @if (storage.snackbarMessage(); as msg) {
        <div class="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-bold animate-fadeIn"
             [style.backgroundColor]="colors.surface"
             [style.borderColor]="colors.border"
             [style.color]="colors.textPrimary">
          <span class="text-base">{{ storage.logoSymbolIcon() }}</span>
          <span>{{ msg }}</span>
          <button
            type="button"
            (click)="storage.clearSnackbar()"
            class="ml-2 text-stone-400 hover:text-stone-600">
            ✕
          </button>
        </div>
      }

      <!-- Modals -->
      @if (showHeartSheet()) {
        <app-heart-reflection-sheet (close)="showHeartSheet.set(false)"></app-heart-reflection-sheet>
      }

      @if (showAiDevotionalModal()) {
        <app-ai-devotional-modal (close)="showAiDevotionalModal.set(false)"></app-ai-devotional-modal>
      }

      @if (showLeaderReportModal()) {
        <app-ai-leader-report-modal (close)="showLeaderReportModal.set(false)"></app-ai-leader-report-modal>
      }

      @if (showAiPrayerModal()) {
        <app-ai-prayer-modal (close)="showAiPrayerModal.set(false)"></app-ai-prayer-modal>
      }

      @if (showBibleModal()) {
        <app-bible-reader-modal (close)="showBibleModal.set(false)"></app-bible-reader-modal>
      }

      @if (showHowItWorksModal()) {
        <app-how-it-works-modal (close)="showHowItWorksModal.set(false)"></app-how-it-works-modal>
      }

      @if (showNewWeekModal()) {
        <app-new-week-modal (close)="showNewWeekModal.set(false)"></app-new-week-modal>
      }

      @if (showOcrModal()) {
        <app-ocr-scan-modal (close)="showOcrModal.set(false)"></app-ocr-scan-modal>
      }

      @if (showPdfModal()) {
        <app-pdf-export-modal (close)="showPdfModal.set(false)"></app-pdf-export-modal>
      }

      @if (showProfileModal()) {
        <app-user-profile-modal (close)="showProfileModal.set(false)"></app-user-profile-modal>
      }

      <!-- 🔐 Centralized Auth Modal -->
      @if (storage.showAuthModal()) {
        <app-auth-modal (close)="storage.closeAuthModal()"></app-auth-modal>
      }

      <!-- 🎉 ONBOARDING — shown on first launch or after reset -->
      @if (!storage.onboardingCompleted()) {
        <app-r07-onboarding-modal (complete)="onOnboardingDone()"></app-r07-onboarding-modal>
      }

    </div>
  `
})
export class App {
  public storage = inject(R07StorageService);
  public firebase = inject(FirebaseService);

  public showHeartSheet = signal<boolean>(false);
  public showAiDevotionalModal = signal<boolean>(false);
  public showLeaderReportModal = signal<boolean>(false);
  public showAiPrayerModal = signal<boolean>(false);
  public showBibleModal = signal<boolean>(false);
  public showHowItWorksModal = signal<boolean>(false);
  public showNewWeekModal = signal<boolean>(false);
  public showOcrModal = signal<boolean>(false);
  public showPdfModal = signal<boolean>(false);
  public showProfileModal = signal<boolean>(false);

  get colors() {
    return this.storage.currentThemeColors();
  }

  public onOnboardingDone(): void {
    // The onboarding modal already called storage.completeOnboarding() internally.
    // This is just a hook for any post-onboarding actions if needed.
  }
}

