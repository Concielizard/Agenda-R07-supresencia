import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, LeaderReportResult } from '../../services/gemini.service';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-ai-leader-report-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div class="rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slideUp transition-colors duration-300 {{ storage.fontClass() }}"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        
        <!-- Mobile pull handle -->
        <div class="sm:hidden w-12 h-1.5 rounded-full mx-auto my-2 opacity-30 bg-current"></div>

        <!-- Header -->
        <div class="px-6 py-4 flex items-center justify-between border-b"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs"
                 [style.backgroundColor]="colors.primary">
              <span class="material-icons text-base">summarize</span>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Reporte para Líder de Célula</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Síntesis inteligente de la semana devocional R07
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="p-2 rounded-xl transition hover:opacity-70 cursor-pointer"
            [style.color]="colors.textMuted">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs scrollbar-none" [style.color]="colors.textPrimary">
          <p [style.color]="colors.textSecondary">
            La inteligencia artificial analizará tus 7 días registrados, las metas cumplidas y tu lema semanal para redactar un informe claro y edificante para tu mentor o pastor (<strong>{{ storage.userProfile().leaderName || 'Líder de Célula' }}</strong>).
          </p>

          @if (!report() && !gemini.isGenerating()) {
            <div class="text-center py-6">
              <button
                type="button"
                (click)="generateReport()"
                class="px-5 py-3 rounded-2xl text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-md transition hover:scale-105 cursor-pointer"
                [style.backgroundColor]="colors.primary">
                <span class="material-icons text-base">auto_awesome</span>
                <span>Generar Informe Semanal Ahora</span>
              </button>
            </div>
          }

          @if (gemini.isGenerating()) {
            <div class="py-8 text-center space-y-3" [style.color]="colors.textMuted">
              <span class="material-icons text-3xl animate-spin" [style.color]="colors.primary">sync</span>
              <p class="font-medium">Analizando registros devocionales y generando síntesis pastoral...</p>
            </div>
          }

          @if (report()) {
            <div class="rounded-2xl p-4 border space-y-3.5 animate-fadeSlideUp"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <div>
                <h4 class="font-bold uppercase tracking-wider text-[11px] mb-1" [style.color]="colors.primary">
                  Resumen Ejecutivo:
                </h4>
                <p class="leading-relaxed p-3 rounded-xl border leading-relaxed"
                   [style.backgroundColor]="colors.surface"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.textPrimary">
                  {{ report()?.executiveSummary }}
                </p>
              </div>

              <div>
                <h4 class="font-bold uppercase tracking-wider text-[11px] mb-1" [style.color]="colors.primary">
                  Fortalezas Observadas:
                </h4>
                <ul class="list-disc pl-4 space-y-1" [style.color]="colors.textSecondary">
                  @for (str of report()?.strengthsObserved; track str) {
                    <li>{{ str }}</li>
                  }
                </ul>
              </div>

              <div>
                <h4 class="font-bold uppercase tracking-wider text-[11px] mb-1" [style.color]="colors.primary">
                  Palabra de Ánimo:
                </h4>
                <p class="italic p-3 rounded-xl border font-serif"
                   [style.backgroundColor]="colors.surface"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.primary">
                  «{{ report()?.suggestedEncouragement }}»
                </p>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-between gap-2 flex-wrap"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <button
            type="button"
            (click)="close.emit()"
            class="px-4 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
            [style.borderColor]="colors.border"
            [style.backgroundColor]="colors.surface"
            [style.color]="colors.textSecondary">
            Cerrar
          </button>

          @if (report()) {
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="shareWhatsApp()"
                class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer">
                <span class="material-icons text-sm">share</span>
                <span>Enviar por WhatsApp</span>
              </button>

              <button
                type="button"
                (click)="saveReportToWeek()"
                class="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer"
                [style.backgroundColor]="colors.primary">
                <span class="material-icons text-sm">save</span>
                <span>Guardar en Evaluación</span>
              </button>
            </div>
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

  get colors() {
    return this.storage.currentThemeColors();
  }

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

    this.storage.showSnackbar('¡Reporte guardado en tu evaluación semanal!');
    this.close.emit();
  }

  public shareWhatsApp(): void {
    const r = this.report();
    if (!r) return;

    const profile = this.storage.userProfile();
    const week = this.storage.currentWeek();
    const text = `🕊️ *Reporte Devocional R07 — Semana ${week.weekNumber}*\n` +
                 `👤 *Discípulo:* ${profile.displayName}\n` +
                 `👥 *Líder:* ${profile.leaderName || 'Líder'}\n\n` +
                 `📖 *Resumen:* ${r.executiveSummary}\n\n` +
                 `✨ *Fortalezas:*\n- ${r.strengthsObserved.join('\n- ')}\n\n` +
                 `🙏 *Palabra de Ánimo:* «${r.suggestedEncouragement}»`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  }
}

