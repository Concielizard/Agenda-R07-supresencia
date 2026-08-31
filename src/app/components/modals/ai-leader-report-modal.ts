import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';
import { GeminiService } from '../../services/gemini.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { AiWeeklyLeaderSummary } from '../../models/r07.models';

@Component({
  selector: 'app-ai-leader-report-modal',
  imports: [CommonModule],
  template: `
    <div id="ai-leader-report-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="ai-leader-report-modal-panel" class="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
                 [style.backgroundColor]="colors.primary">
              📊
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight" [style.color]="colors.textPrimary">
                Reporte Semanal IA para Líder de Célula
              </h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                {{ currentWeek?.title }} ({{ currentWeek?.startDate }} - {{ currentWeek?.endDate }})
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="onClose.emit()"
            class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            ✕
          </button>
        </div>

        <!-- Scrollable Report Body -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs">
          
          @if (isLoading()) {
            <div class="p-12 flex flex-col items-center justify-center text-center space-y-3">
              <span class="text-3xl animate-bounce">🧠</span>
              <p class="font-bold text-sm" [style.color]="colors.textPrimary">
                Sintetizando tu caminar espiritual de la semana...
              </p>
              <p class="text-xs max-w-sm" [style.color]="colors.textMuted">
                Analizando los 7 días de devocionales, notas de grupo de conexión y metas cumplidas.
              </p>
            </div>
          } @else if (report()) {
            <div class="space-y-4 animate-in fade-in duration-300">
              
              <!-- Executive Summary -->
              <div class="p-4 rounded-xl border"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <h4 class="font-bold text-[11px] uppercase tracking-wider mb-2" [style.color]="colors.primary">
                  1. Resumen Ejecutivo del Caminar Espiritual
                </h4>
                <p class="text-xs leading-relaxed text-justify" [style.color]="colors.textPrimary">
                  {{ report()!.executiveSummary }}
                </p>
              </div>

              <!-- Spiritual Highlights -->
              <div class="p-4 rounded-xl border"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <h4 class="font-bold text-[11px] uppercase tracking-wider mb-2" [style.color]="colors.primary">
                  2. Victorias & Aprendizajes Clave
                </h4>
                <ul class="space-y-1.5 text-xs" [style.color]="colors.textPrimary">
                  @for (item of report()!.spiritualHighlights; track item) {
                    <li class="flex items-start gap-2">
                      <span class="text-emerald-600 font-bold">✓</span>
                      <span>{{ item }}</span>
                    </li>
                  }
                </ul>
              </div>

              <!-- Prayer Request for the Next Week -->
              <div class="p-4 rounded-xl border"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <h4 class="font-bold text-[11px] uppercase tracking-wider mb-1" [style.color]="colors.primary">
                  3. Petición de Oración para la Próxima Semana
                </h4>
                <p class="text-xs leading-relaxed" [style.color]="colors.textPrimary">
                  {{ report()!.prayerRequestSummary }}
                </p>
              </div>

              <!-- Pastoral Encouragement -->
              <div class="p-4 rounded-xl border italic"
                   [style.backgroundColor]="colors.primaryLight"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.primary">
                <h4 class="font-bold text-[11px] uppercase tracking-wider mb-1 not-italic">
                  4. Palabra de Aliento Pastoral & Promesa
                </h4>
                <p class="text-xs leading-relaxed">
                  {{ report()!.pastoralEncouragement }}
                </p>
              </div>

            </div>
          }

        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t flex items-center justify-between gap-3" [style.borderColor]="colors.border">
          <button
            type="button"
            (click)="onClose.emit()"
            class="text-xs px-3 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            Cerrar
          </button>

          @if (report()) {
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="copyReportText()"
                class="text-xs font-semibold px-3.5 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
                Copiar Texto
              </button>

              <button
                id="btn-share-report-whatsapp"
                type="button"
                (click)="shareWhatsApp()"
                class="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer bg-emerald-600">
                <span>💬</span>
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class AiLeaderReportModal {
  storage = inject(R07StorageService);
  gemini = inject(GeminiService);
  pdfService = inject(PdfExportService);

  onClose = output<void>();

  isLoading = signal<boolean>(true);
  report = signal<AiWeeklyLeaderSummary | null>(null);

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

  ngOnInit(): void {
    this.generateReport();
  }

  async generateReport(): Promise<void> {
    this.isLoading.set(true);
    if (this.currentWeek) {
      const result = await this.gemini.generateWeeklyLeaderReport(
        this.currentWeek,
        this.days,
        this.goals
      );
      this.report.set(result);
    }
    this.isLoading.set(false);
  }

  copyReportText(): void {
    const rep = this.report();
    if (!rep) return;

    let text = `*REPORTE SEMANAL R07 • PASA TIEMPO CONMIGO*\n`;
    text += `👤 Discípulo: ${this.storage.userName()}\n`;
    text += `📅 Semana: ${this.currentWeek?.title} (${this.currentWeek?.startDate} - ${this.currentWeek?.endDate})\n\n`;
    text += `📖 *Resumen Ejecutivo:*\n${rep.executiveSummary}\n\n`;
    text += `✨ *Victorias Clave:*\n`;
    for (const h of rep.spiritualHighlights) {
      text += `• ${h}\n`;
    }
    text += `\n🙏 *Petición para la semana:* ${rep.prayerRequestSummary}\n\n`;
    text += `🕊️ *Palabra de Aliento:* ${rep.pastoralEncouragement}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.storage.showSnackbar('Reporte copiado al portapapeles.');
    }
  }

  shareWhatsApp(): void {
    const rep = this.report();
    if (!rep) return;

    let text = `*REPORTE DEVOCIONAL R07 PARA MI LÍDER* 🌸\n`;
    text += `👤 *Nombre:* ${this.storage.userName()}\n`;
    text += `👥 *Grupo:* ${this.storage.groupName()}\n`;
    text += `📅 *Semana:* ${this.currentWeek?.title}\n\n`;
    text += `*1. Resumen:*\n${rep.executiveSummary}\n\n`;
    text += `*2. Aprendizajes:*\n`;
    for (const h of rep.spiritualHighlights) {
      text += `• ${h}\n`;
    }
    text += `\n*3. Petición:* ${rep.prayerRequestSummary}\n\n`;
    text += `*4. Palabra:* ${rep.pastoralEncouragement}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }
}
