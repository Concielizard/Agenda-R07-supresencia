import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';

@Component({
  selector: 'app-r07-day-selector',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-stone-200/80 mb-6">
      <div class="flex items-center justify-between mb-3 px-1">
        <div class="flex items-center gap-2">
          <span class="material-icons text-purple-700 text-lg">calendar_view_week</span>
          <h2 class="text-sm sm:text-base font-bold text-stone-800 tracking-tight">
            Los 7 Días Devocionales (R07)
          </h2>
        </div>
        <span class="text-xs text-stone-500 font-medium hidden sm:inline">
          Selecciona un día para meditar y escribir tu Rhema
        </span>
      </div>

      <!-- 7 Days Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        @for (day of storage.currentWeek().days; track day.dayOfWeek; let i = $index) {
          <button
            type="button"
            (click)="storage.selectedDayIndex.set(i)"
            [class]="i === storage.selectedDayIndex() 
              ? 'ring-2 ring-purple-600 bg-purple-50/90 border-purple-300 text-purple-950 shadow-sm shadow-purple-500/10 scale-[1.02]' 
              : 'bg-stone-50/90 hover:bg-stone-100/80 border-stone-200 text-stone-700'"
            class="flex flex-col p-2.5 rounded-xl border transition-all duration-200 text-left relative group">
            
            <!-- Top Row: Day Name & Checkmark -->
            <div class="flex items-center justify-between w-full mb-1">
              <span class="text-xs font-bold uppercase tracking-wider" 
                    [class.text-purple-700]="i === storage.selectedDayIndex()"
                    [class.text-stone-600]="i !== storage.selectedDayIndex()">
                {{ day.dayName }}
              </span>
              @if (day.completed) {
                <span class="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  ✓
                </span>
              } @else {
                <span class="w-3.5 h-3.5 rounded-full border border-stone-300 group-hover:border-stone-400"></span>
              }
            </div>

            <!-- Date -->
            <div class="text-[11px] text-stone-500 font-medium mb-1.5">
              {{ formatDate(day.date) }}
            </div>

            <!-- Scripture Badge -->
            <div class="mt-auto flex items-center gap-1 text-[10px] text-stone-600 truncate font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-stone-200/60">
              <span class="material-icons text-[11px] text-amber-600">menu_book</span>
              <span class="truncate">{{ day.bibleReading.book }} {{ day.bibleReading.chapter }}:{{ day.bibleReading.verses }}</span>
            </div>

            <!-- Indicator line when active -->
            @if (i === storage.selectedDayIndex()) {
              <div class="absolute -bottom-0.5 left-4 right-4 h-1 bg-gradient-to-r from-purple-600 to-amber-500 rounded-full"></div>
            }
          </button>
        }
      </div>
    </div>
  `
})
export class R07DaySelector {
  public storage = inject(R07StorageService);

  public formatDate(isoStr: string): string {
    if (!isoStr) return '';
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return isoStr;
    } catch {
      return isoStr;
    }
  }
}
