import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';

@Component({
  selector: 'app-r07-weekly-table',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 mb-10">
      
      <!-- SECTION 1: MATRIZ RESUMEN DE LOS 7 DÍAS -->
      <div class="bg-white rounded-2xl shadow-sm border border-stone-200/90 overflow-hidden">
        <div class="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-bold text-stone-800 font-serif flex items-center gap-2">
              <span class="material-icons text-purple-700 text-lg">grid_on</span>
              <span>Tabla General Semanal (7 Días R07)</span>
            </h3>
            <p class="text-xs text-stone-500">
              Vista condensada de tu intimidad con Dios en la semana {{ storage.currentWeek().weekNumber }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
              Total tiempo: {{ storage.totalTimeSpentMinutes() }} min
            </span>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-stone-700">
            <thead class="bg-stone-50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200/80">
              <tr>
                <th class="px-4 py-3">Día</th>
                <th class="px-4 py-3">Fecha</th>
                <th class="px-4 py-3">Pasaje Bíblico</th>
                <th class="px-4 py-3">Palabra Rhema</th>
                <th class="px-4 py-3">Aplicación Práctica</th>
                <th class="px-4 py-3 text-center">Estado</th>
                <th class="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              @for (day of storage.currentWeek().days; track day.dayOfWeek; let i = $index) {
                <tr 
                  (click)="storage.selectedDayIndex.set(i)" 
                  [class.bg-purple-50]="i === storage.selectedDayIndex()" 
                  class="hover:bg-stone-50 transition cursor-pointer group">
                  
                  <td class="px-4 py-3.5 font-bold text-purple-950 flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-stone-200 group-hover:bg-purple-200 text-stone-700 group-hover:text-purple-900 flex items-center justify-center text-[10px]">
                      {{ i + 1 }}
                    </span>
                    <span>{{ day.dayName }}</span>
                  </td>

                  <td class="px-4 py-3.5 text-stone-500 whitespace-nowrap">
                    {{ day.date }}
                  </td>

                  <td class="px-4 py-3.5 whitespace-nowrap font-medium text-stone-800">
                    <span class="inline-flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      <span class="material-icons text-[11px] text-amber-600">book</span>
                      {{ day.bibleReading.book }} {{ day.bibleReading.chapter }}:{{ day.bibleReading.verses }}
                    </span>
                  </td>

                  <td class="px-4 py-3.5 max-w-[220px] truncate text-stone-600">
                    {{ day.rhema || '— Sin registro —' }}
                  </td>

                  <td class="px-4 py-3.5 max-w-[200px] truncate text-stone-600">
                    {{ day.application || '— Sin registro —' }}
                  </td>

                  <td class="px-4 py-3.5 text-center whitespace-nowrap">
                    @if (day.completed) {
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <span class="material-icons text-[11px]">done</span> Cumplido
                      </span>
                    } @else {
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                        Pendiente
                      </span>
                    }
                  </td>

                  <td class="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      (click)="storage.selectedDayIndex.set(i); $event.stopPropagation()"
                      class="text-xs font-semibold text-purple-700 hover:text-purple-900 underline">
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
      <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/90 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <h3 class="text-base font-bold text-stone-800 font-serif flex items-center gap-2">
              <span class="material-icons text-amber-600 text-lg">fact_check</span>
              <span>Evaluación Semanal y Reporte de Discipulado</span>
            </h3>
            <p class="text-xs text-stone-500">
              Rendición de cuentas para tu mentor/líder de célula ({{ storage.userProfile().leaderName || 'Sin asignar' }})
            </p>
          </div>

          <button
            type="button"
            (click)="openAiLeaderReport.emit()"
            class="px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
            <span class="material-icons text-sm text-amber-300">auto_awesome</span>
            <span>Generar Reporte con IA</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Checkbox: Asistencia a Iglesia / Célula -->
          <label class="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-stone-100/50 transition">
            <input
              type="checkbox"
              [checked]="storage.currentWeek().weeklyEvaluation?.attendanceChurch"
              (change)="toggleAttendance()"
              class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500">
            <div>
              <span class="text-xs font-bold text-stone-800 block">Asistencia a Reunión</span>
              <span class="text-[11px] text-stone-500">Asistí a la iglesia o grupo de conexión</span>
            </div>
          </label>

          <!-- Checkbox: Ayuno Realizado -->
          <label class="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-stone-100/50 transition">
            <input
              type="checkbox"
              [checked]="storage.currentWeek().weeklyEvaluation?.fastingDone"
              (change)="toggleFasting()"
              class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500">
            <div>
              <span class="text-xs font-bold text-stone-800 block">Día de Ayuno</span>
              <span class="text-[11px] text-stone-500">Dediqué un tiempo de ayuno espiritual</span>
            </div>
          </label>

          <!-- Stat: Capítulos Leídos -->
          <div class="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-stone-800 block">Capítulos Bíblicos</span>
              <span class="text-[11px] text-stone-500">Leídos durante toda la semana</span>
            </div>
            <span class="text-lg font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-lg">
              7+
            </span>
          </div>
        </div>

        <!-- Testimonio Personal -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <span class="material-icons text-base text-amber-600">campaign</span>
            Mi Testimonio o Victoria de la Semana
          </label>
          <textarea
            rows="2"
            [value]="storage.currentWeek().weeklyEvaluation?.personalTestimony || ''"
            (blur)="updateTestimony($any($event.target).value)"
            placeholder="¿Qué hizo Dios en tu vida, familia o trabajo esta semana?..."
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition leading-relaxed"></textarea>
        </div>

        <!-- Resumen para el Líder -->
        <div class="space-y-1.5">
          <label class="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <span class="material-icons text-base text-purple-700">summarize</span>
            Resumen / Comentarios para mi Mentor o Líder
          </label>
          <textarea
            rows="3"
            [value]="storage.currentWeek().weeklyEvaluation?.summaryForLeader || ''"
            (blur)="updateLeaderSummary($any($event.target).value)"
            placeholder="Escribe un resumen o haz clic en 'Generar Reporte con IA' para una síntesis espiritual automática..."
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition leading-relaxed"></textarea>
        </div>

      </div>

    </div>
  `
})
export class R07WeeklyTable {
  public storage = inject(R07StorageService);
  public openAiLeaderReport = output<void>();

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
