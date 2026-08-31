import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';

@Component({
  selector: 'app-r07-day-selector',
  imports: [CommonModule],
  template: `
    <div id="r07-day-selector-bar" class="w-full mb-6 overflow-x-auto pb-2 scrollbar-thin">
      <div class="flex items-center gap-2 min-w-max">
        @for (day of weekDays; track day.id) {
          <button
            [id]="'day-pill-' + day.dayNumber"
            type="button"
            (click)="storage.selectDay(day.dayNumber)"
            class="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none relative"
            [style.backgroundColor]="storage.selectedDayNumber() === day.dayNumber ? colors.primary : colors.surface"
            [style.borderColor]="storage.selectedDayNumber() === day.dayNumber ? colors.primary : colors.border"
            [style.color]="storage.selectedDayNumber() === day.dayNumber ? '#FFFFFF' : colors.textPrimary">
            
            <!-- Number Circle -->
            <div class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                 [style.backgroundColor]="storage.selectedDayNumber() === day.dayNumber ? 'rgba(255,255,255,0.25)' : colors.primaryLight"
                 [style.color]="storage.selectedDayNumber() === day.dayNumber ? '#FFFFFF' : colors.primary">
              {{ day.dayNumber }}
            </div>

            <!-- Day Name & Status -->
            <div class="flex flex-col">
              <span class="text-xs font-bold tracking-tight leading-tight">
                {{ day.dayName }}
              </span>
              <div class="flex items-center gap-1 mt-0.5">
                @if (day.moodEmoji) {
                  <span class="text-xs">{{ day.moodEmoji }}</span>
                }
                <span class="text-[10px] opacity-80">
                  {{ day.isCompleted ? 'Completado' : 'Pendiente' }}
                </span>
              </div>
            </div>

            <!-- Completed Checkmark Badge -->
            @if (day.isCompleted) {
              <div class="ml-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                   [style.backgroundColor]="storage.selectedDayNumber() === day.dayNumber ? 'rgba(255,255,255,0.3)' : '#10B981'"
                   [style.color]="'#FFFFFF'">
                ✓
              </div>
            }

          </button>
        }
      </div>
    </div>
  `
})
export class R07DaySelector {
  storage = inject(R07StorageService);

  get colors() {
    return this.storage.currentThemeColors();
  }

  get weekDays() {
    return this.storage.currentWeekWithDays()?.days || [];
  }
}
