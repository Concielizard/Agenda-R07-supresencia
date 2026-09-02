import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';

@Component({
  selector: 'app-r07-weekly-table',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 mb-10 {{ storage.fontClass() }}">
      
      <!-- SECTION 1: MATRIZ RESUMEN DE LOS 7 DÍAS -->
      <div class="rounded-3xl border shadow-xs overflow-hidden transition-colors duration-300"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        <div class="p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2"
             [style.borderColor]="colors.border">
          <div>
            <h3 class="text-base font-bold tracking-tight flex items-center gap-2">
              <span class="material-icons text-lg" [style.color]="colors.primary">grid_on</span>
              <span>Tabla General Semanal (7 Días R07)</span>
            </h3>
            <p class="text-xs" [style.color]="colors.textSecondary">
              Vista condensada de tu intimidad con Dios en la semana {{ storage.currentWeek().weekNumber }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold px-3 py-1 rounded-full"
                  [style.backgroundColor]="colors.primaryLight"
                  [style.color]="colors.primary">
              Total tiempo: {{ storage.totalTimeSpentMinutes() }} min
            </span>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs" [style.color]="colors.textPrimary">
            <thead class="text-[11px] font-bold uppercase tracking-wider border-b"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.textMuted">
              <tr>
                <th class="px-4 py-3">Día</th>
                <th class="px-4 py-3">Fecha</th>
                <th class="px-4 py-3">Pasaje Bíblico</th>
                <th class="px-4 py-3">Palabra Viva</th>
                <th class="px-4 py-3">Aplicación Práctica</th>
                <th class="px-4 py-3 text-center">Estado</th>
                <th class="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y" [style.borderColor]="colors.border">
              @for (day of storage.currentWeek().days; track day.dayOfWeek; let i = $index) {
                <tr 
                  (click)="storage.selectDay(i)" 
                  class="transition cursor-pointer group"
                  [style.backgroundColor]="i === storage.selectedDayIndex() ? colors.primaryLight : 'transparent'">
                  
                  <td class="px-4 py-3.5 font-bold flex items-center gap-2"
                      [style.color]="colors.textPrimary">
                    <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          [style.backgroundColor]="i === storage.selectedDayIndex() ? colors.primary : colors.background"
                          [style.color]="i === storage.selectedDayIndex() ? '#ffffff' : colors.textPrimary">
                      {{ i + 1 }}
                    </span>
                    <span>{{ day.dayName }}</span>
                  </td>

                  <td class="px-4 py-3.5 whitespace-nowrap" [style.color]="colors.textMuted">
                    {{ day.date }}
                  </td>

                  <td class="px-4 py-3.5 whitespace-nowrap font-medium">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border"
                          [style.backgroundColor]="colors.background"
                          [style.borderColor]="colors.border"
                          [style.color]="colors.primary">
                      <span class="material-icons text-[11px]">menu_book</span>
                      {{ day.bibleReading.book }} {{ day.bibleReading.chapter }}:{{ day.bibleReading.verses }}
                    </span>
                  </td>

                  <td class="px-4 py-3.5 max-w-[220px] truncate" [style.color]="colors.textSecondary">
                    {{ day.rhema || '— Sin registro —' }}
                  </td>

                  <td class="px-4 py-3.5 max-w-[200px] truncate" [style.color]="colors.textSecondary">
                    {{ day.application || '— Sin registro —' }}
                  </td>

                  <td class="px-4 py-3.5 text-center whitespace-nowrap">
                    @if (day.completed) {
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <span class="material-icons text-[11px]">done</span> Cumplido
                      </span>
                    } @else {
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                            [style.backgroundColor]="colors.background"
                            [style.borderColor]="colors.border"
                            [style.color]="colors.textMuted">
                        Pendiente
                      </span>
                    }
                  </td>

                  <td class="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      (click)="storage.selectDay(i); storage.setMobileTab('today'); $event.stopPropagation()"
                      class="text-xs font-bold transition hover:opacity-80 cursor-pointer"
                      [style.color]="colors.primary">
                      Editar
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 2: EVALUACIÓN SEMANAL & REPORTE AL LÍDER -->
      <div class="rounded-3xl p-5 sm:p-6 border shadow-xs space-y-5 transition-colors duration-300"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b"
             [style.borderColor]="colors.border">
          <div>
            <h3 class="text-base font-bold tracking-tight flex items-center gap-2">
              <span class="material-icons text-lg" [style.color]="colors.primary">fact_check</span>
              <span>Evaluación Semanal y Reporte de Discipulado</span>
            </h3>
            <p class="text-xs" [style.color]="colors.textSecondary">
              Rendición de cuentas para tu mentor/líder de célula ({{ storage.userProfile().leaderName || 'Sin asignar' }})
            </p>
          </div>

          <button
            type="button"
            (click)="openAiLeaderReport.emit()"
            class="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer"
            [style.backgroundColor]="colors.primary">
            <span class="material-icons text-sm">auto_awesome</span>
            <span>Generar Reporte con IA</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Checkbox: Asistencia a Iglesia / Célula -->
          <label class="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition hover:opacity-90"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
            <input
              type="checkbox"
              [checked]="storage.currentWeek().weeklyEvaluation.attendanceChurch"
              (change)="toggleAttendance()"
              class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500">
            <div>
              <span class="text-xs font-bold block" [style.color]="colors.textPrimary">Asistencia a Reunión</span>
              <span class="text-[11px]" [style.color]="colors.textMuted">Asistí a la iglesia o grupo de conexión</span>
            </div>
          </label>

          <!-- Checkbox: Ayuno Realizado -->
          <label class="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition hover:opacity-90"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
            <input
              type="checkbox"
              [checked]="storage.currentWeek().weeklyEvaluation.fastingDone"
              (change)="toggleFasting()"
              class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500">
            <div>
              <span class="text-xs font-bold block" [style.color]="colors.textPrimary">Día de Ayuno</span>
              <span class="text-[11px]" [style.color]="colors.textMuted">Dediqué un tiempo de ayuno espiritual</span>
            </div>
          </label>

          <!-- Stat: Capítulos Leídos -->
          <div class="p-3 rounded-2xl border flex items-center justify-between"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div>
              <span class="text-xs font-bold block" [style.color]="colors.textPrimary">Capítulos Bíblicos</span>
              <span class="text-[11px]" [style.color]="colors.textMuted">Leídos durante toda la semana</span>
            </div>
            <span class="text-base font-extrabold px-3 py-1 rounded-xl"
                  [style.backgroundColor]="colors.primaryLight"
                  [style.color]="colors.primary">
              7+
            </span>
          </div>
        </div>

        <!-- Testimonio Personal -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                 [style.color]="colors.primary">
            <span class="material-icons text-base">campaign</span>
            Mi Testimonio o Victoria de la Semana
          </label>
          <textarea
            rows="2"
            [value]="storage.currentWeek().weeklyEvaluation.personalTestimony || ''"
            (blur)="updateTestimony($any($event.target).value)"
            placeholder="¿Qué hizo Dios en tu vida, familia o trabajo esta semana?..."
            class="w-full p-3 text-xs sm:text-sm rounded-2xl border focus:outline-none focus:ring-2 resize-none leading-relaxed"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary"></textarea>
        </div>

        <!-- Resumen para el Líder -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                 [style.color]="colors.primary">
            <span class="material-icons text-base">summarize</span>
            Resumen / Comentarios para mi Mentor o Líder
          </label>
          <textarea
            rows="3"
            [value]="storage.currentWeek().weeklyEvaluation.summaryForLeader || ''"
            (blur)="updateLeaderSummary($any($event.target).value)"
            placeholder="Escribe un resumen o haz clic en 'Generar Reporte con IA' para una síntesis espiritual automática..."
            class="w-full p-3 text-xs sm:text-sm rounded-2xl border focus:outline-none focus:ring-2 resize-none leading-relaxed"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary"></textarea>
        </div>

      </div>

    </div>
  `
})
export class R07WeeklyTable {
  public storage = inject(R07StorageService);
  public openAiLeaderReport = output<void>();

  get colors() {
    return this.storage.currentThemeColors();
  }

  public toggleAttendance(): void {
    const week = this.storage.currentWeek();
    const current = week.weeklyEvaluation?.attendanceChurch || false;
    this.storage.saveCurrentWeek({
      ...week,
      weeklyEvaluation: {
        ...week.weeklyEvaluation,
        attendanceChurch: !current
      }
    });
  }

  public toggleFasting(): void {
    const week = this.storage.currentWeek();
    const current = week.weeklyEvaluation?.fastingDone || false;
    this.storage.saveCurrentWeek({
      ...week,
      weeklyEvaluation: {
        ...week.weeklyEvaluation,
        fastingDone: !current
      }
    });
  }

  public updateTestimony(val: string): void {
    const week = this.storage.currentWeek();
    this.storage.saveCurrentWeek({
      ...week,
      weeklyEvaluation: {
        ...week.weeklyEvaluation,
        personalTestimony: val
      }
    });
  }

  public updateLeaderSummary(val: string): void {
    const week = this.storage.currentWeek();
    this.storage.saveCurrentWeek({
      ...week,
      weeklyEvaluation: {
        ...week.weeklyEvaluation,
        summaryForLeader: val
      }
    });
  }
}
