import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';
import { PdfExportService } from '../../services/pdf-export.service';

@Component({
  selector: 'app-pdf-export-modal',
  imports: [CommonModule],
  template: `
    <div id="pdf-export-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="pdf-export-modal-panel" class="w-full max-w-xl flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
                 [style.backgroundColor]="colors.primary">
              📄
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight" [style.color]="colors.textPrimary">
                Exportar & Compartir Agenda R07
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

        <!-- Options Body -->
        <div class="p-6 space-y-4 text-xs">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            <!-- Download PDF Document -->
            <button
              id="btn-export-pdf-action"
              type="button"
              (click)="downloadPdf()"
              class="p-4 rounded-xl border text-left flex flex-col justify-between hover:shadow-md active:scale-98 transition-all cursor-pointer group"
              [style.backgroundColor]="colors.background"
              [style.borderColor]="colors.border">
              <div>
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2.5"
                     [style.backgroundColor]="colors.primaryLight"
                     [style.color]="colors.primary">
                  📑
                </div>
                <h4 class="font-bold text-sm mb-1" [style.color]="colors.textPrimary">
                  Descargar Documento PDF
                </h4>
                <p class="text-[11px] leading-relaxed" [style.color]="colors.textSecondary">
                  Genera la hoja oficial en PDF tamaño carta apaisado lista para imprimir o archivar.
                </p>
              </div>
              <span class="mt-3 text-xs font-bold inline-flex items-center gap-1" [style.color]="colors.primary">
                <span>Descargar ahora</span>
                <span>→</span>
              </span>
            </button>

            <!-- Share to WhatsApp -->
            <button
              id="btn-export-whatsapp-action"
              type="button"
              (click)="shareWhatsApp()"
              class="p-4 rounded-xl border text-left flex flex-col justify-between hover:shadow-md active:scale-98 transition-all cursor-pointer group bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
              <div>
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2.5 bg-emerald-500 text-white">
                  💬
                </div>
                <h4 class="font-bold text-sm mb-1 text-emerald-900 dark:text-emerald-300">
                  Compartir en WhatsApp
                </h4>
                <p class="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
                  Envía el resumen estructurado de tus 7 días de devocionales a tu líder o grupo.
                </p>
              </div>
              <span class="mt-3 text-xs font-bold inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span>Abrir WhatsApp</span>
                <span>→</span>
              </span>
            </button>

            <!-- Copy Full Text Summary -->
            <button
              id="btn-export-clipboard-action"
              type="button"
              (click)="copyTextSummary()"
              class="p-4 rounded-xl border text-left flex flex-col justify-between hover:shadow-md active:scale-98 transition-all cursor-pointer group"
              [style.backgroundColor]="colors.background"
              [style.borderColor]="colors.border">
              <div>
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2.5"
                     [style.backgroundColor]="colors.primaryLight"
                     [style.color]="colors.primary">
                  📋
                </div>
                <h4 class="font-bold text-sm mb-1" [style.color]="colors.textPrimary">
                  Copiar Texto al Portapapeles
                </h4>
                <p class="text-[11px] leading-relaxed" [style.color]="colors.textSecondary">
                  Copia todo el contenido de la semana para pegarlo en notas, correo o chat.
                </p>
              </div>
              <span class="mt-3 text-xs font-bold inline-flex items-center gap-1" [style.color]="colors.primary">
                <span>Copiar texto</span>
                <span>→</span>
              </span>
            </button>

            <!-- Email / Leader Form -->
            <button
              id="btn-export-email-action"
              type="button"
              (click)="sendEmail()"
              class="p-4 rounded-xl border text-left flex flex-col justify-between hover:shadow-md active:scale-98 transition-all cursor-pointer group"
              [style.backgroundColor]="colors.background"
              [style.borderColor]="colors.border">
              <div>
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2.5"
                     [style.backgroundColor]="colors.primaryLight"
                     [style.color]="colors.primary">
                  ✉️
                </div>
                <h4 class="font-bold text-sm mb-1" [style.color]="colors.textPrimary">
                  Enviar por Correo a Líder
                </h4>
                <p class="text-[11px] leading-relaxed" [style.color]="colors.textSecondary">
                  Envía el reporte devocional directamente a {{ storage.leaderEmail() }}.
                </p>
              </div>
              <span class="mt-3 text-xs font-bold inline-flex items-center gap-1" [style.color]="colors.primary">
                <span>Redactar correo</span>
                <span>→</span>
              </span>
            </button>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 border-t flex justify-end" [style.borderColor]="colors.border">
          <button
            type="button"
            (click)="onClose.emit()"
            class="text-xs font-semibold px-4 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            Cerrar
          </button>
        </div>

      </div>
    </div>
  `
})
export class PdfExportModal {
  storage = inject(R07StorageService);
  pdfService = inject(PdfExportService);

  onClose = output<void>();

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

  downloadPdf(): void {
    if (this.currentWeek) {
      this.pdfService.downloadPdf(this.currentWeek, this.days, this.goals);
      this.onClose.emit();
    }
  }

  shareWhatsApp(): void {
    if (this.currentWeek) {
      this.pdfService.shareViaWhatsApp(this.currentWeek, this.days, this.goals);
      this.onClose.emit();
    }
  }

  copyTextSummary(): void {
    if (this.currentWeek) {
      const text = this.pdfService.generateTextSummary(this.currentWeek, this.days, this.goals);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(text);
        this.storage.showSnackbar('¡Resumen de la semana copiado al portapapeles!');
        this.onClose.emit();
      }
    }
  }

  sendEmail(): void {
    if (this.currentWeek) {
      const leaderEmail = this.storage.leaderEmail() || '';
      const subject = encodeURIComponent(`Devocional R07 - ${this.storage.userName()} - ${this.currentWeek.title}`);
      const body = encodeURIComponent(this.pdfService.generateTextSummary(this.currentWeek, this.days, this.goals));
      if (typeof window !== 'undefined') {
        window.location.href = `mailto:${leaderEmail}?subject=${subject}&body=${body}`;
      }
      this.onClose.emit();
    }
  }
}
