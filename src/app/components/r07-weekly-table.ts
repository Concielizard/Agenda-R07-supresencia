import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';
import { PdfExportService } from '../services/pdf-export.service';

@Component({
  selector: 'app-r07-weekly-table',
  imports: [CommonModule],
  template: `
    <div id="r07-weekly-table-container" class="rounded-2xl p-5 md:p-7 border shadow-sm transition-all"
         [style.backgroundColor]="colors.surface"
         [style.borderColor]="colors.border">
      
      <!-- Top Title & Quick Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b"
           [style.borderColor]="colors.border">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-xl font-bold tracking-tight" [style.color]="colors.textPrimary">
              Hoja Semanal R07 (Vista Formato Cuaderno)
            </h3>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-bold"
                  [style.backgroundColor]="colors.primaryLight"
                  [style.color]="colors.primary">
              {{ completedDaysCount }}/7 días
            </span>
          </div>
          <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
            Visualización idéntica al formato impreso. Haz clic en cualquier fila para editar el día.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            id="btn-table-ai-leader-summary"
            type="button"
            (click)="onOpenLeaderReport.emit()"
            class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-xs"
            [style.backgroundColor]="colors.primaryLight"
            [style.borderColor]="colors.border"
            [style.color]="colors.primary">
            <span class="mat-icon text-sm">psychology</span>
            <span>Reporte IA para Líder</span>
          </button>

          <button
            id="btn-table-share-whatsapp"
            type="button"
            (click)="shareWhatsApp()"
            class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer bg-emerald-600">
            <span>💬</span>
            <span>Compartir en WhatsApp</span>
          </button>

          <button
            id="btn-table-download-pdf"
            type="button"
            (click)="downloadPdf()"
            class="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-white shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            [style.backgroundColor]="colors.primary">
            <span class="mat-icon text-sm">picture_as_pdf</span>
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      <!-- Weekly Goals Summary Strip -->
      @if (goals.length > 0) {
        <div class="my-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
             [style.backgroundColor]="colors.background"
             [style.borderColor]="colors.border">
          <div class="flex items-center gap-2">
            <span class="font-bold uppercase tracking-wider" [style.color]="colors.primary">
              Metas de la semana:
            </span>
            <div class="flex items-center gap-2 flex-wrap">
              @for (g of goals; track g.id) {
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border"
                      [style.backgroundColor]="g.isCompleted ? '#ECFDF5' : 'transparent'"
                      [style.borderColor]="g.isCompleted ? '#A7F3D0' : colors.border"
                      [style.color]="g.isCompleted ? '#059669' : colors.textSecondary">
                  <span>{{ g.isCompleted ? '✓' : '○' }}</span>
                  <span>{{ g.title }}</span>
                </span>
              }
            </div>
          </div>

          <div class="font-semibold shrink-0" [style.color]="colors.textSecondary">
            Progreso: {{ completedGoalsCount }}/{{ goals.length }}
          </div>
        </div>
      }

      <!-- 7-Day Table -->
      <div class="overflow-x-auto rounded-xl border mt-4" [style.borderColor]="colors.border">
        <table class="w-full text-left text-xs border-collapse min-w-[700px]">
          <thead>
            <tr class="text-white font-bold" [style.backgroundColor]="colors.primary">
              <th class="py-3 px-3 w-28 text-center border-r border-white/20">DÍA / FECHA</th>
              <th class="py-3 px-2.5 w-20 text-center border-r border-white/20">HORA</th>
              <th class="py-3 px-2.5 w-24 text-center border-r border-white/20">ÁNIMO</th>
              <th class="py-3 px-3 w-36 border-r border-white/20">CITA BÍBLICA</th>
              <th class="py-3 px-4">DESCRIBE TU R07</th>
            </tr>
          </thead>
          <tbody class="divide-y" [style.borderColor]="colors.border">
            @for (day of days; track day.id) {
              <tr
                [id]="'table-row-day-' + day.dayNumber"
                (click)="onSelectDay(day.dayNumber)"
                class="transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                [style.backgroundColor]="day.isCompleted ? colors.surface : colors.background">
                
                <!-- Day / Date -->
                <td class="py-3 px-3 text-center border-r font-bold" [style.borderColor]="colors.border">
                  <div class="flex flex-col items-center">
                    <span class="text-xs" [style.color]="colors.textPrimary">{{ day.dayName }}</span>
                    <span class="text-[10px]" [style.color]="colors.textMuted">{{ day.dateText }}</span>
                    @if (day.isCompleted) {
                      <span class="mt-1 text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800">
                        Listo ✓
                      </span>
                    }
                  </div>
                </td>

                <!-- Time -->
                <td class="py-3 px-2 text-center border-r text-xs font-mono" [style.borderColor]="colors.border" [style.color]="colors.textSecondary">
                  {{ day.timeText || '—' }}
                </td>

                <!-- Mood -->
                <td class="py-3 px-2.5 text-center border-r" [style.borderColor]="colors.border">
                  @if (day.mood) {
                    <div class="flex flex-col items-center">
                      <span class="text-base">{{ day.moodEmoji }}</span>
                      <span class="text-[10px] font-semibold" [style.color]="colors.primary">{{ day.mood }}</span>
                    </div>
                  } @else {
                    <span class="text-xs" [style.color]="colors.textMuted">—</span>
                  }
                </td>

                <!-- Scripture -->
                <td class="py-3 px-3 border-r font-medium" [style.borderColor]="colors.border" [style.color]="colors.textPrimary">
                  {{ day.scriptureRef || '—' }}
                </td>

                <!-- Description / R07 Content -->
                <td class="py-3 px-4 leading-relaxed" [style.color]="colors.textPrimary">
                  @if (day.godSpoke || day.reflectionText || day.actionStep || day.prayerText) {
                    <div class="space-y-1">
                      @if (day.godSpoke) {
                        <p><span class="font-bold" [style.color]="colors.primary">Dios me habló:</span> {{ day.godSpoke }}</p>
                      }
                      @if (day.reflectionText) {
                        <p><span class="font-bold" [style.color]="colors.primary">Reflexión:</span> {{ day.reflectionText }}</p>
                      }
                      @if (day.actionStep) {
                        <p><span class="font-bold" [style.color]="colors.primary">Paso de acción:</span> {{ day.actionStep }}</p>
                      }
                      @if (day.prayerText) {
                        <p class="italic text-[11px]" [style.color]="colors.textSecondary">
                          <span class="font-bold not-italic" [style.color]="colors.primary">Oración:</span> {{ day.prayerText }}
                        </p>
                      }
                    </div>
                  } @else {
                    <span class="italic text-[11px]" [style.color]="colors.textMuted">
                      (Haz clic aquí para escribir el devocional de este día)
                    </span>
                  }
                </td>

              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Verse Footer -->
      <div class="mt-5 text-center text-xs italic font-medium" [style.color]="colors.primary">
        «Pasa tiempo Conmigo y saciaré tu alma» — Jeremías 31:25
      </div>

    </div>
  `
})
export class R07WeeklyTable {
  storage = inject(R07StorageService);
  pdfService = inject(PdfExportService);

  onOpenLeaderReport = output<void>();
  onOpenDayEditor = output<number>();

  get colors() {
    return this.storage.currentThemeColors();
  }

  get currentWeek() {
    return this.storage.currentWeekWithDays()?.week;
  }

  get days() {
    return this.storage.currentWeekWithDays()?.days || [];
  }

  get goals() {
    return this.storage.currentWeekWithDays()?.goals || [];
  }

  get completedDaysCount() {
    return this.days.filter((d) => d.isCompleted).length;
  }

  get completedGoalsCount() {
    return this.goals.filter((g) => g.isCompleted).length;
  }

  onSelectDay(dayNumber: number): void {
    this.storage.selectDay(dayNumber);
    this.onOpenDayEditor.emit(dayNumber);
  }

  shareWhatsApp(): void {
    if (this.currentWeek) {
      this.pdfService.shareViaWhatsApp(this.currentWeek, this.days, this.goals);
    }
  }

  downloadPdf(): void {
    if (this.currentWeek) {
      this.pdfService.downloadPdf(this.currentWeek, this.days, this.goals);
    }
  }
}
