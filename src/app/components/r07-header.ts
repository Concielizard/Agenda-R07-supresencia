import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';

@Component({
  selector: 'app-r07-header',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="r07-header-container" class="w-full rounded-2xl p-5 md:p-6 mb-6 shadow-sm border transition-all duration-300"
         [style.backgroundColor]="colors.surface"
         [style.borderColor]="colors.border">
      
      <!-- Top Row: Title, Week Selector & Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b"
           [style.borderColor]="colors.border">
        
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner"
               [style.backgroundColor]="colors.primaryLight"
               [style.color]="colors.primary">
            @if (storage.edition() === 'MEN') {
              ⚔️
            } @else {
              🌸
            }
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold tracking-tight" [style.color]="colors.textPrimary">
                {{ currentWeek?.title || 'Mi Semana R07' }}
              </h2>
              <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                    [style.backgroundColor]="colors.primaryLight"
                    [style.color]="colors.primary">
                {{ storage.edition() === 'MEN' ? 'Edición Hombres' : 'Edición Mujeres' }}
              </span>
            </div>
            <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
              {{ currentWeek?.startDate }} — {{ currentWeek?.endDate }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Week Selector Dropdown -->
          @if (storage.weeks().length > 1) {
            <select
              id="week-selector-select"
              [ngModel]="storage.selectedWeekId()"
              (ngModelChange)="storage.selectWeek($event)"
              class="text-xs font-semibold px-3 py-2 rounded-xl border bg-transparent cursor-pointer focus:outline-none"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
              @for (w of storage.weeks(); track w.id) {
                <option [value]="w.id">{{ w.title }} ({{ w.startDate }})</option>
              }
            </select>
          }

          <!-- New Week Button -->
          <button
            id="btn-new-week"
            type="button"
            (click)="onOpenNewWeek.emit()"
            class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:opacity-90 active:scale-95"
            [style.backgroundColor]="colors.primaryLight"
            [style.borderColor]="colors.border"
            [style.color]="colors.primary">
            <span class="mat-icon text-sm">add_circle</span>
            <span>Nueva Semana</span>
          </button>

          <!-- Export PDF Button -->
          <button
            id="btn-export-pdf"
            type="button"
            (click)="onOpenPdfExport.emit()"
            class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white shadow-sm transition-all hover:opacity-95 active:scale-95"
            [style.backgroundColor]="colors.primary">
            <span class="mat-icon text-sm">picture_as_pdf</span>
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <!-- Bottom Row: Reading Goal & Prayer Attendance Counter -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        
        <!-- Reading Goal Card -->
        <div class="p-3.5 rounded-xl border flex flex-col justify-between"
             [style.backgroundColor]="colors.background"
             [style.borderColor]="colors.border">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5">
              <span class="mat-icon text-base" [style.color]="colors.primary">menu_book</span>
              <span class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.textSecondary">
                Meta de Lectura de la Semana
              </span>
            </div>
            <label class="flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none" [style.color]="colors.textPrimary">
              <input
                id="goal-completed-checkbox"
                type="checkbox"
                [ngModel]="currentWeek?.isGoalCompleted"
                (ngModelChange)="toggleGoalCompleted($event)"
                class="rounded w-4 h-4 text-emerald-600 focus:ring-0 cursor-pointer">
              <span>{{ currentWeek?.isGoalCompleted ? '¡Cumplida! 🎉' : 'En proceso' }}</span>
            </label>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="reading-goal-input"
              type="text"
              [ngModel]="currentWeek?.readingGoal"
              (blur)="onReadingGoalBlur($event)"
              placeholder="Ej: Salmos 23 al 27 o Romanos 8..."
              class="w-full text-sm px-3 py-1.5 rounded-lg border bg-transparent focus:outline-none focus:ring-1"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
          </div>
        </div>

        <!-- Prayer Attendance Counter Card -->
        <div class="p-3.5 rounded-xl border flex items-center justify-between gap-3"
             [style.backgroundColor]="colors.background"
             [style.borderColor]="colors.border">
          <div>
            <div class="flex items-center gap-1.5 mb-1">
              <span class="mat-icon text-base" [style.color]="colors.primary">church</span>
              <span class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.textSecondary">
                Asistencia a Tiempos de Oración
              </span>
            </div>
            <p class="text-xs" [style.color]="colors.textMuted">
              Tiempos presenciales o virtuales en tu iglesia
            </p>
          </div>

          <div class="flex items-center gap-2 bg-white/70 dark:bg-black/30 p-1.5 rounded-xl border"
               [style.borderColor]="colors.border">
            <button
              id="btn-decrement-prayer"
              type="button"
              (click)="storage.decrementPrayerAttendance(currentWeek?.id || 0)"
              class="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all hover:bg-black/5 active:scale-95"
              [style.color]="colors.textPrimary">
              —
            </button>
            <span id="prayer-count-display" class="font-extrabold text-base min-w-[24px] text-center" [style.color]="colors.primary">
              {{ currentWeek?.prayerAttendanceCount || 0 }}
            </span>
            <button
              id="btn-increment-prayer"
              type="button"
              (click)="storage.incrementPrayerAttendance(currentWeek?.id || 0)"
              class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
              [style.backgroundColor]="colors.primary">
              +
            </button>
          </div>
        </div>

      </div>

      <!-- Verse of the Week Banner -->
      @if (currentWeek?.verseOfTheWeek) {
        <div class="mt-3 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs italic"
             [style.backgroundColor]="colors.primaryLight"
             [style.color]="colors.primary">
          <div class="flex items-center gap-2">
            <span class="mat-icon text-sm">auto_awesome</span>
            <span>{{ currentWeek?.verseOfTheWeek }}</span>
          </div>
          <button
            id="btn-ai-leader-report-quick"
            type="button"
            (click)="onOpenLeaderReport.emit()"
            class="hidden sm:inline-flex items-center gap-1 font-semibold not-italic hover:underline cursor-pointer">
            <span class="mat-icon text-xs">psychology</span>
            <span>Reporte IA para Líder</span>
          </button>
        </div>
      }

    </div>
  `
})
export class R07Header {
  storage = inject(R07StorageService);

  onOpenNewWeek = output<void>();
  onOpenPdfExport = output<void>();
  onOpenLeaderReport = output<void>();

  get colors() {
    return this.storage.currentThemeColors();
  }

  get currentWeek() {
    return this.storage.currentWeekWithDays()?.week;
  }

  toggleGoalCompleted(completed: boolean): void {
    if (this.currentWeek) {
      this.storage.updateGoalCompleted(this.currentWeek.id, completed);
    }
  }

  onReadingGoalBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.currentWeek) {
      this.storage.updateReadingGoal(this.currentWeek.id, input.value);
    }
  }
}
