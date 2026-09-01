import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { R07Header } from './components/r07-header';
import { R07DaySelector } from './components/r07-day-selector';
import { R07DailyAffirmation } from './components/r07-daily-affirmation';
import { R07DayJournalEditor } from './components/r07-day-journal-editor';
import { R07WeeklyGoals } from './components/r07-weekly-goals';
import { R07WeeklyTable } from './components/r07-weekly-table';
import { R07Community } from './components/r07-community';

import { AiDevotionalModal } from './components/modals/ai-devotional-modal';
import { AiLeaderReportModal } from './components/modals/ai-leader-report-modal';
import { AiPrayerModal } from './components/modals/ai-prayer-modal';
import { BibleReaderModal } from './components/modals/bible-reader-modal';
import { HowItWorksModal } from './components/modals/how-it-works-modal';
import { NewWeekModal } from './components/modals/new-week-modal';
import { OcrScanModal } from './components/modals/ocr-scan-modal';
import { PdfExportModal } from './components/modals/pdf-export-modal';
import { UserProfileModal } from './components/modals/user-profile-modal';

import { R07StorageService } from './services/r07-storage.service';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    R07Header,
    R07DaySelector,
    R07DailyAffirmation,
    R07DayJournalEditor,
    R07WeeklyGoals,
    R07WeeklyTable,
    R07Community,
    AiDevotionalModal,
    AiLeaderReportModal,
    AiPrayerModal,
    BibleReaderModal,
    HowItWorksModal,
    NewWeekModal,
    OcrScanModal,
    PdfExportModal,
    UserProfileModal
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#faf8f5] text-stone-900 font-sans flex flex-col selection:bg-purple-200 selection:text-purple-950">
      
      <!-- Top Navigation / Application Header -->
      <app-r07-header
        (openProfile)="showProfileModal.set(true)"
        (openHowItWorks)="showHowItWorksModal.set(true)"
        (openPdfExport)="showPdfModal.set(true)"
        (openNewWeek)="showNewWeekModal.set(true)">
      </app-r07-header>

      <!-- Main Container -->
      <main class="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1">
        
        <!-- View Mode Navigation Tabs -->
        <div class="flex items-center justify-between gap-2 border-b border-stone-200/90 pb-3 mb-6 overflow-x-auto">
          <div class="flex items-center gap-1.5 sm:gap-2">
            
            <button
              type="button"
              (click)="activeView.set('journal')"
              [class]="activeView() === 'journal' 
                ? 'bg-purple-900 text-white shadow-xs' 
                : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'"
              class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition">
              <span class="material-icons text-base" [class.text-amber-300]="activeView() === 'journal'">auto_stories</span>
              <span>Devocional Diario R07</span>
            </button>

            <button
              type="button"
              (click)="activeView.set('goals')"
              [class]="activeView() === 'goals' 
                ? 'bg-purple-900 text-white shadow-xs' 
                : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'"
              class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition">
              <span class="material-icons text-base" [class.text-amber-300]="activeView() === 'goals'">flag</span>
              <span>Metas & Oración</span>
            </button>

            <button
              type="button"
              (click)="activeView.set('table')"
              [class]="activeView() === 'table' 
                ? 'bg-purple-900 text-white shadow-xs' 
                : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'"
              class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition">
              <span class="material-icons text-base" [class.text-amber-300]="activeView() === 'table'">table_chart</span>
              <span>Tabla Semanal & Líder</span>
            </button>

            <button
              type="button"
              (click)="activeView.set('community')"
              [class]="activeView() === 'community' 
                ? 'bg-purple-900 text-white shadow-xs' 
                : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'"
              class="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition relative">
              <span class="material-icons text-base" [class.text-amber-300]="activeView() === 'community'">diversity_3</span>
              <span>Muro de Oración</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

          </div>

          <!-- Quick Actions Right -->
          <div class="hidden md:flex items-center gap-2">
            <button
              type="button"
              (click)="showPdfModal.set(true)"
              class="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1 transition shadow-2xs">
              <span class="material-icons text-sm text-purple-700">picture_as_pdf</span>
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              (click)="showHowItWorksModal.set(true)"
              class="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1 transition shadow-2xs">
              <span class="material-icons text-sm text-amber-600">help_outline</span>
              <span>Guía R07</span>
            </button>
          </div>
        </div>

        <!-- TAB 1: DEVOCIONAL DIARIO -->
        @if (activeView() === 'journal') {
          <div class="space-y-6">
            <!-- 7 Days Bar -->
            <app-r07-day-selector></app-r07-day-selector>

            <!-- Prophetic Affirmation & Quick Tools -->
            <app-r07-daily-affirmation
              (openAiDevotional)="showAiDevotionalModal.set(true)"
              (openBibleReader)="showBibleModal.set(true)"
              (openOcrModal)="showOcrModal.set(true)"
              (openAiPrayer)="showAiPrayerModal.set(true)">
            </app-r07-daily-affirmation>

            <!-- Active Day Workbook Journal Editor -->
            <app-r07-day-journal-editor></app-r07-day-journal-editor>
          </div>
        }

        <!-- TAB 2: METAS Y MOTIVOS DE ORACIÓN -->
        @if (activeView() === 'goals') {
          <app-r07-weekly-goals></app-r07-weekly-goals>
        }

        <!-- TAB 3: TABLA SEMANAL Y REPORTE AL LÍDER -->
        @if (activeView() === 'table') {
          <app-r07-weekly-table
            (openAiLeaderReport)="showLeaderReportModal.set(true)">
          </app-r07-weekly-table>
        }

        <!-- TAB 4: MURO COMUNITARIO DE ORACIÓN -->
        @if (activeView() === 'community') {
          <app-r07-community></app-r07-community>
        }

      </main>

      <!-- Footer -->
      <footer class="border-t border-stone-200/80 bg-white py-6 text-center text-xs text-stone-500">
        <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-purple-900 text-amber-300 font-serif font-bold flex items-center justify-center text-xs">
              R
            </div>
            <span class="font-bold text-stone-700">Agenda Devocional R07 «Pasa tiempo Conmigo»</span>
          </div>

          <p class="text-[11px] text-stone-400">
            «Buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas» (Mateo 6:33)
          </p>

          <div class="flex items-center gap-3 text-stone-600 font-medium text-[11px]">
            <button (click)="showHowItWorksModal.set(true)" class="hover:text-purple-900">Método R07</button>
            <span>•</span>
            <button (click)="showPdfModal.set(true)" class="hover:text-purple-900">Imprimir Agenda</button>
            <span>•</span>
            <button (click)="showProfileModal.set(true)" class="hover:text-purple-900">Perfil & Célula</button>
          </div>
        </div>
      </footer>

      <!-- Modals -->
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

    </div>
  `
})
export class App {
  public storage = inject(R07StorageService);
  public firebase = inject(FirebaseService);

  public activeView = signal<'journal' | 'goals' | 'table' | 'community'>('journal');

  public showAiDevotionalModal = signal<boolean>(false);
  public showLeaderReportModal = signal<boolean>(false);
  public showAiPrayerModal = signal<boolean>(false);
  public showBibleModal = signal<boolean>(false);
  public showHowItWorksModal = signal<boolean>(false);
  public showNewWeekModal = signal<boolean>(false);
  public showOcrModal = signal<boolean>(false);
  public showPdfModal = signal<boolean>(false);
  public showProfileModal = signal<boolean>(false);
}
