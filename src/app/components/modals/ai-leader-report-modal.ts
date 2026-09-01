import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, LeaderReportResult } from '../../services/gemini.service';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-ai-leader-report-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center">
              <span class="material-icons text-sm">summarize</span>
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">Reporte Espiritual para Líder de Célula</h3>
              <p class="text-xs text-purple-200">Síntesis inteligente de la semana devocional R07</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-purple-200 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-stone-800">
          <p class="text-stone-600">
            La inteligencia artificial analizará tus 7 días registrados, las metas cumplidas y tu lema semanal para redactar un informe claro y edificante para tu mentor o pastor.
          </p>

          @if (!report() && !gemini.isGenerating()) {
            <div class="text-center py-6">
              <button
                type="button"
                (click)="generateReport()"
                class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-md transition">
                <span class="material-icons text-sm text-amber-300">auto_awesome</span>
                <span>Generar Informe Semanal Ahora</span>
              </button>
            </div>
          }

          @if (gemini.isGenerating()) {
            <div class="py-8 text-center space-y-2 text-stone-500">
              <span class="material-icons text-3xl text-purple-600 animate-spin">sync</span>
              <p>Analizando registros devocionales y generando reporte...</p>
            </div>
          }

          @if (report()) {
            <div class="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
              <div>
                <h4 class="font-bold text-purple-900 uppercase tracking-wider text-[11px] mb-1">Resumen Ejecutivo:</h4>
                <p class="leading-relaxed bg-white p-3 rounded-lg border border-stone-200">{{ report()?.executiveSummary }}</p>
              </div>

              <div>
                <h4 class="font-bold text-emerald-900 uppercase tracking-wider text-[11px] mb-1">Fortalezas Observadas:</h4>
                <ul class="list-disc pl-4 space-y-1 text-stone-700">
                  @for (str of report()?.strengthsObserved; track str) {
                    <li>{{ str }}</li>
                  }
                </ul>
              </div>

              <div>
                <h4 class="font-bold text-amber-900 uppercase tracking-wider text-[11px] mb-1">Palabra de Ánimo:</h4>
                <p class="italic bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 text-amber-900 font-serif">
                  "{{ report()?.suggestedEncouragement }}"
                </p>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition">
            Cerrar
          </button>

          @if (report()) {
            <button
              (click)="saveReportToWeek()"
              class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition">
              <span class="material-icons text-sm">save</span>
              <span>Guardar en Evaluación Semanal</span>
            </button>
          }
        </div>

      </div>
    </div>
  `
})
export class AiLeaderReportModal {
  public gemini = inject(GeminiService);
  public storage = inject(R07StorageService);

  public close = output<void>();
  public report = signal<LeaderReportResult | null>(null);

  public async generateReport(): Promise<void> {
    const week = this.storage.currentWeek();
    const profile = this.storage.userProfile();
    const res = await this.gemini.generateLeaderReport(week, profile);
    this.report.set(res);
  }

  public saveReportToWeek(): void {
    const r = this.report();
    if (!r) return;

    const week = this.storage.currentWeek();
    this.storage.saveCurrentWeek({
      ...week,
      weeklyEvaluation: {
        ...week.weeklyEvaluation,
        summaryForLeader: `${r.executiveSummary}\n\nFortalezas:\n- ${r.strengthsObserved.join('\n- ')}\n\nÁnimo: ${r.suggestedEncouragement}`
      }
    });

    this.close.emit();
  }
}
