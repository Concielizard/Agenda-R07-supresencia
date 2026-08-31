import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from './services/r07-storage.service';
import { R07DayEntryEntity } from './models/r07.models';

// UI Components
import { R07Header } from './components/r07-header';
import { R07DaySelector } from './components/r07-day-selector';
import { R07DayJournalEditor } from './components/r07-day-journal-editor';
import { R07PrayerSection } from './components/r07-prayer-section';
import { R07WeeklyTable } from './components/r07-weekly-table';
import { R07WeeklyGoals } from './components/r07-weekly-goals';
import { R07Community } from './components/r07-community';

// Modals
import { AiDevotionalModal } from './components/modals/ai-devotional-modal';
import { AiPrayerModal } from './components/modals/ai-prayer-modal';
import { AiLeaderReportModal } from './components/modals/ai-leader-report-modal';
import { OcrScanModal } from './components/modals/ocr-scan-modal';
import { BibleReaderModal } from './components/modals/bible-reader-modal';
import { PdfExportModal } from './components/modals/pdf-export-modal';
import { UserProfileModal } from './components/modals/user-profile-modal';
import { HowItWorksModal } from './components/modals/how-it-works-modal';
import { NewWeekModal } from './components/modals/new-week-modal';

type ActiveTab = 'journal' | 'table' | 'prayer' | 'goals' | 'community';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    R07Header,
    R07DaySelector,
    R07DayJournalEditor,
    R07PrayerSection,
    R07WeeklyTable,
    R07WeeklyGoals,
    R07Community,
    AiDevotionalModal,
    AiPrayerModal,
    AiLeaderReportModal,
    OcrScanModal,
    BibleReaderModal,
    PdfExportModal,
    UserProfileModal,
    HowItWorksModal,
    NewWeekModal
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="r07-app-root"
         class="min-h-screen flex flex-col font-sans transition-colors duration-300 antialiased"
         [style.backgroundColor]="colors.background"
         [style.color]="colors.textPrimary">
      
      <!-- Top Navigation Header -->
      <app-r07-header
        (onOpenProfile)="showProfileModal.set(true)"
        (onOpenBibleReader)="openBibleReader('')"
        (onOpenPdfExport)="showPdfModal.set(true)"
        (onOpenHowItWorks)="showHowItWorksModal.set(true)"
        (onOpenNewWeek)="showNewWeekModal.set(true)">
      </app-r07-header>

      <!-- Main Container -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        <!-- Navigation Tabs Bar -->
        <nav id="r07-main-tabs" class="flex items-center gap-1.5 p-1.5 rounded-2xl border overflow-x-auto scrollbar-thin shadow-xs"
             [style.backgroundColor]="colors.surface"
             [style.borderColor]="colors.border">
          
          <button
            id="tab-journal"
            type="button"
            (click)="activeTab.set('journal')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            [style.backgroundColor]="activeTab() === 'journal' ? colors.primaryLight : 'transparent'"
            [style.color]="activeTab() === 'journal' ? colors.primary : colors.textSecondary">
            <span class="mat-icon text-sm">edit_note</span>
            <span>Devocional Diario</span>
          </button>

          <button
            id="tab-table"
            type="button"
            (click)="activeTab.set('table')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            [style.backgroundColor]="activeTab() === 'table' ? colors.primaryLight : 'transparent'"
            [style.color]="activeTab() === 'table' ? colors.primary : colors.textSecondary">
            <span class="mat-icon text-sm">table_chart</span>
            <span>Hoja Semanal 7 Días</span>
          </button>

          <button
            id="tab-prayer"
            type="button"
            (click)="activeTab.set('prayer')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            [style.backgroundColor]="activeTab() === 'prayer' ? colors.primaryLight : 'transparent'"
            [style.color]="activeTab() === 'prayer' ? colors.primary : colors.textSecondary">
            <span class="mat-icon text-sm">favorite</span>
            <span>Oración & Iglesia</span>
          </button>

          <button
            id="tab-goals"
            type="button"
            (click)="activeTab.set('goals')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            [style.backgroundColor]="activeTab() === 'goals' ? colors.primaryLight : 'transparent'"
            [style.color]="activeTab() === 'goals' ? colors.primary : colors.textSecondary">
            <span class="mat-icon text-sm">flag</span>
            <span>Metas Semanales</span>
          </button>

          <button
            id="tab-community"
            type="button"
            (click)="activeTab.set('community')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
            [style.backgroundColor]="activeTab() === 'community' ? colors.primaryLight : 'transparent'"
            [style.color]="activeTab() === 'community' ? colors.primary : colors.textSecondary">
            <span class="mat-icon text-sm">groups</span>
            <span>Amigos & Conexión</span>
          </button>

        </nav>

        <!-- Tab 1: Daily Journal (Horizontal Day Selector + 4-Part Structured Editor) -->
        @if (activeTab() === 'journal') {
          <section id="view-journal" class="space-y-4 animate-in fade-in duration-200">
            <app-r07-day-selector></app-r07-day-selector>
            
            <app-r07-day-journal-editor
              (onOpenOcrScan)="openOcrModal($event)"
              (onOpenAiInspiration)="openAiInspiration($event)"
              (onOpenAiPrayer)="openAiPrayer($event)"
              (onOpenBibleReader)="openBibleReader($event)">
            </app-r07-day-journal-editor>
          </section>
        }

        <!-- Tab 2: Weekly Full Table (Physical Workbook Grid) -->
        @if (activeTab() === 'table') {
          <section id="view-table" class="animate-in fade-in duration-200">
            <app-r07-weekly-table
              (onOpenLeaderReport)="showAiLeaderReportModal.set(true)"
              (onOpenDayEditor)="onDaySelectedFromTable($event)">
            </app-r07-weekly-table>
          </section>
        }

        <!-- Tab 3: Prayer, Quiet Time & Church Attendance -->
        @if (activeTab() === 'prayer') {
          <section id="view-prayer" class="animate-in fade-in duration-200">
            <app-r07-prayer-section></app-r07-prayer-section>
          </section>
        }

        <!-- Tab 4: Weekly Growth Goals -->
        @if (activeTab() === 'goals') {
          <section id="view-goals" class="animate-in fade-in duration-200">
            <app-r07-weekly-goals></app-r07-weekly-goals>
          </section>
        }

        <!-- Tab 5: Devotional Friends & Community -->
        @if (activeTab() === 'community') {
          <section id="view-community" class="animate-in fade-in duration-200">
            <app-r07-community></app-r07-community>
          </section>
        }

      </main>

      <!-- Footer -->
      <footer class="w-full py-6 border-t mt-12 text-center text-xs"
              [style.borderColor]="colors.border"
              [style.color]="colors.textMuted">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Remix Agenda R07 • Pasa tiempo Conmigo</span>
          <span class="italic font-serif">«El Señor es mi pastor; nada me faltará» — Salmos 23:1</span>
          <span>Su Presencia • Edición {{ storage.edition() === 'WOMEN' ? 'Mujeres 🌸' : 'Hombres ⚔️' }}</span>
        </div>
      </footer>

      <!-- Floating Snackbar / Toast Notification -->
      @if (storage.snackbarMessage()) {
        <div id="app-snackbar"
             class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom duration-300"
             [style.backgroundColor]="colors.surface"
             [style.borderColor]="colors.border"
             [style.color]="colors.textPrimary">
          <span class="mat-icon text-base" [style.color]="colors.primary">info</span>
          <span class="text-xs font-semibold">{{ storage.snackbarMessage() }}</span>
        </div>
      }

      <!-- Modals -->
      @if (showProfileModal()) {
        <app-user-profile-modal (onClose)="showProfileModal.set(false)"></app-user-profile-modal>
      }

      @if (showHowItWorksModal()) {
        <app-how-it-works-modal (onClose)="showHowItWorksModal.set(false)"></app-how-it-works-modal>
      }

      @if (showNewWeekModal()) {
        <app-new-week-modal (onClose)="showNewWeekModal.set(false)"></app-new-week-modal>
      }

      @if (showPdfModal()) {
        <app-pdf-export-modal (onClose)="showPdfModal.set(false)"></app-pdf-export-modal>
      }

      @if (showBibleModal()) {
        <app-bible-reader-modal
          [initialCitation]="bibleInitialCitation"
          (onClose)="showBibleModal.set(false)"
          (onCitationSelected)="onBibleCitationSelected($event)">
        </app-bible-reader-modal>
      }

      @if (showOcrModal()) {
        <app-ocr-scan-modal
          [targetDayNumber]="ocrTargetDayNumber"
          (onClose)="showOcrModal.set(false)">
        </app-ocr-scan-modal>
      }

      @if (showAiInspirationModal()) {
        <app-ai-devotional-modal
          [targetDay]="aiTargetDay"
          (onClose)="showAiInspirationModal.set(false)">
        </app-ai-devotional-modal>
      }

      @if (showAiPrayerModal()) {
        <app-ai-prayer-modal
          [targetDay]="aiTargetDay"
          (onClose)="showAiPrayerModal.set(false)">
        </app-ai-prayer-modal>
      }

      @if (showAiLeaderReportModal()) {
        <app-ai-leader-report-modal (onClose)="showAiLeaderReportModal.set(false)"></app-ai-leader-report-modal>
      }

    </div>
  `
})
export class App {
  storage = inject(R07StorageService);

  activeTab = signal<ActiveTab>('journal');

  // Modal display states
  showProfileModal = signal<boolean>(false);
  showHowItWorksModal = signal<boolean>(false);
  showNewWeekModal = signal<boolean>(false);
  showPdfModal = signal<boolean>(false);
  showBibleModal = signal<boolean>(false);
  showOcrModal = signal<boolean>(false);
  showAiInspirationModal = signal<boolean>(false);
  showAiPrayerModal = signal<boolean>(false);
  showAiLeaderReportModal = signal<boolean>(false);

  // Modal payload props
  bibleInitialCitation = '';
  ocrTargetDayNumber = 1;
  aiTargetDay: R07DayEntryEntity | null = null;

  get colors() {
    return this.storage.currentThemeColors();
  }

  openBibleReader(citation: string): void {
    this.bibleInitialCitation = citation;
    this.showBibleModal.set(true);
  }

  onBibleCitationSelected(citation: string): void {
    const selectedNum = this.storage.selectedDayNumber();
    const days = this.storage.currentWeekWithDays()?.days || [];
    const current = days.find((d) => d.dayNumber === selectedNum);
    if (current) {
      this.storage.updateDayEntry({ ...current, scriptureRef: citation });
    }
  }

  openOcrModal(dayNumber: number): void {
    this.ocrTargetDayNumber = dayNumber;
    this.showOcrModal.set(true);
  }

  openAiInspiration(day: R07DayEntryEntity): void {
    this.aiTargetDay = day;
    this.showAiInspirationModal.set(true);
  }

  openAiPrayer(day: R07DayEntryEntity): void {
    this.aiTargetDay = day;
    this.showAiPrayerModal.set(true);
  }

  onDaySelectedFromTable(dayNumber: number): void {
    this.storage.selectDay(dayNumber);
    this.activeTab.set('journal');
  }
}
