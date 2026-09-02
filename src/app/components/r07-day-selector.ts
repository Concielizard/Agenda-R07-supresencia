import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';

@Component({
  selector: 'app-r07-day-selector',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl p-3.5 sm:p-4 border shadow-xs mb-4 transition-colors duration-300"
         [style.backgroundColor]="colors.surface"
         [style.borderColor]="colors.border">
      
      <div class="flex items-center justify-between mb-2.5 px-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold uppercase tracking-wider" [style.color]="colors.primary">
            Días de la Semana
          </span>
          <span class="text-[11px] px-2 py-0.5 rounded-full font-bold"
                [style.backgroundColor]="colors.primaryLight"
                [style.color]="colors.primary">
            {{ storage.completedDaysCount() }}/7 completados
          </span>
        </div>
        <span class="text-[11px] font-medium" [style.color]="colors.textMuted">
          Semana {{ storage.currentWeek().weekNumber }}
        </span>
      </div>

      <!-- 7 Days Bar (Horizontal scrolling on small devices, grid on larger) -->
      <div class="grid grid-cols-7 gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        @for (day of storage.currentWeek().days; track day.dayOfWeek; let i = $index) {
          <button
            type="button"
            (click)="storage.selectDay(i)"
            class="flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-200 cursor-pointer relative min-w-[44px]"
            [style.backgroundColor]="i === storage.selectedDayIndex() ? colors.primaryLight : colors.background"
            [style.borderColor]="i === storage.selectedDayIndex() ? colors.primary : colors.border"
            [style.color]="i === storage.selectedDayIndex() ? colors.primary : colors.textPrimary">
            
            <!-- Day Initial -->
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-75">
              {{ day.dayName.substring(0, 3) }}
            </span>

            <!-- Day Number / Date -->
            <span class="text-xs sm:text-sm font-extrabold my-0.5">
              {{ getDayNumber(day.date) }}
            </span>

            <!-- Completion Dot / Checkmark -->
            <div class="mt-0.5">
              @if (day.completed) {
                <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
              } @else {
                <span class="w-2 h-2 rounded-full border border-stone-300 block opacity-40"></span>
              }
            </div>

            <!-- Active indicator dot -->
            @if (i === storage.selectedDayIndex()) {
              <div class="absolute -bottom-1 w-4 h-1 rounded-full" [style.backgroundColor]="colors.primary"></div>
            }
          </button>
        }
      </div>
    </div>
  `
})
export class R07DaySelector {
  public storage = inject(R07StorageService);

  get colors() {
    return this.storage.currentThemeColors();
  }

  public getDayNumber(isoStr: string): string {
    if (!isoStr) return '';
    try {
      const parts = isoStr.split('-');
      return parts[2] || isoStr;
    } catch {
      return isoStr;
    }
  }
}

