import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { PdfExportService } from '../../services/pdf-export.service';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-pdf-export-modal',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div class="rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slideUp transition-colors duration-300 {{ storage.fontClass() }}"
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
              <span class="material-icons text-base">picture_as_pdf</span>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Exportar Agenda a PDF</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Genera tu libreta devocional lista para imprimir o compartir
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
        <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs scrollbar-none">
          <div class="p-4 rounded-2xl border space-y-2"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="flex items-center justify-between">
              <span class="font-bold" [style.color]="colors.textPrimary">Semana Seleccionada:</span>
              <span class="font-extrabold" [style.color]="colors.primary">
                Semana {{ storage.currentWeek().weekNumber }} ({{ storage.currentWeek().year }})
              </span>
            </div>
            <div class="flex items-center justify-between" [style.color]="colors.textSecondary">
              <span>Usuario:</span>
              <span class="font-medium" [style.color]="colors.textPrimary">{{ storage.userProfile().displayName }}</span>
            </div>
            <div class="flex items-center justify-between" [style.color]="colors.textSecondary">
              <span>Iglesia / Célula:</span>
              <span class="font-medium" [style.color]="colors.textPrimary">
                {{ storage.userProfile().churchName || 'Su Presencia' }} / {{ storage.userProfile().cellGroupName || 'Célula' }}
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <span class="font-bold uppercase tracking-wider block" [style.color]="colors.primary">
              Opciones del Documento
            </span>
            
            <label class="flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition hover:opacity-90"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
              <input type="checkbox" [formControl]="includeGoals" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500">
              <span [style.color]="colors.textPrimary">Incluir Metas y Motivos de Oración Semanales</span>
            </label>

            <label class="flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition hover:opacity-90"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
              <input type="checkbox" [formControl]="includeEvaluation" class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500">
              <span [style.color]="colors.textPrimary">Incluir Evaluación Semanal y Resumen para el Líder</span>
            </label>
          </div>

          <!-- Leader Contact Info Card -->
          <div class="p-3.5 rounded-2xl border flex items-center justify-between"
               [style.backgroundColor]="colors.primaryLight"
               [style.borderColor]="colors.border">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs"
                   [style.backgroundColor]="colors.primary">
                <span class="material-icons text-sm">person</span>
              </div>
              <div>
                <p class="font-bold text-xs" [style.color]="colors.textPrimary">
                  Líder: {{ storage.userProfile().leaderName || 'Sin asignar' }}
                </p>
                <p class="text-[11px] opacity-75" [style.color]="colors.textSecondary">
                  WhatsApp: {{ storage.userProfile().leaderPhone || 'No registrado' }}
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="shareToWhatsApp()"
              class="px-3 py-1.5 rounded-xl text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs hover:opacity-90 cursor-pointer bg-emerald-600">
              <span>📲</span>
              <span>Enviar WhatsApp</span>
            </button>
          </div>

          @if (isExporting()) {
            <div class="py-4 text-center space-y-2" [style.color]="colors.textSecondary">
              <span class="material-icons text-2xl animate-spin" [style.color]="colors.primary">sync</span>
              <p class="font-medium">Generando documento PDF con diseño R07...</p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-between gap-2"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <button
            type="button"
            (click)="close.emit()"
            class="px-4 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
            [style.borderColor]="colors.border"
            [style.backgroundColor]="colors.surface"
            [style.color]="colors.textSecondary">
            Cancelar
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="shareToWhatsApp()"
              class="px-3.5 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs hover:opacity-90 cursor-pointer bg-emerald-600">
              <span class="material-icons text-sm">send</span>
              <span>WhatsApp al Líder</span>
            </button>

            <button
              type="button"
              (click)="generatePdf()"
              [disabled]="isExporting()"
              class="px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">download</span>
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PdfExportModal {
  public storage = inject(R07StorageService);
  public pdfService = inject(PdfExportService);

  public close = output<void>();

  public includeGoals = new FormControl(true);
  public includeEvaluation = new FormControl(true);
  public isExporting = signal<boolean>(false);

  get colors() {
    return this.storage.currentThemeColors();
  }

  public async generatePdf(): Promise<void> {
    this.isExporting.set(true);
    try {
      await this.pdfService.exportWeekToPdf(this.storage.currentWeek(), this.storage.userProfile());
      this.storage.showSnackbar('¡PDF generado exitosamente!');
      this.close.emit();
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      this.isExporting.set(false);
    }
  }

  public shareToWhatsApp(): void {
    const profile = this.storage.userProfile();
    const week = this.storage.currentWeek();
    const completedDays = week.days.filter(d => d.completed);
    const completedCount = completedDays.length;
    const percent = Math.round((completedCount / 7) * 100);

    const phone = (profile.leaderPhone || '').replace(/[^0-9]/g, '');

    let message = `🕊️ *REPORTE DEVOCIONAL R07 — «Pasa tiempo Conmigo»*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *Discípulo:* ${profile.displayName || 'Santiago'}\n`;
    message += `⛪ *Iglesia:* ${profile.churchName || 'Su Presencia'}\n`;
    message += `👥 *Grupo:* ${profile.cellGroupName || 'Grupo de Conexión'}\n`;
    if (profile.leaderName) {
      message += `🛡️ *Líder:* ${profile.leaderName}\n`;
    }
    message += `📅 *Semana ${week.weekNumber}:* ${week.startDate} al ${week.endDate}\n`;
    message += `📊 *Cumplimiento R07:* ${completedCount}/7 días (${percent}%)\n\n`;
    message += `📋 *Detalle de los 7 Días:*\n`;

    week.days.forEach((day) => {
      const status = day.completed ? '✅ Cumplido' : '⏳ Pendiente';
      const reading = `${day.bibleReading.book} ${day.bibleReading.chapter}:${day.bibleReading.verses}`;
      message += `• *${day.dayName}:* ${status} (📖 ${reading})\n`;
      if (day.rhema) {
        message += `   _Palabra Viva:_ "${day.rhema.slice(0, 80)}${day.rhema.length > 80 ? '...' : ''}"\n`;
      }
    });

    if (week.weeklyEvaluation?.summaryForLeader) {
      message += `\n💬 *Mensaje para mi líder:* "${week.weeklyEvaluation.summaryForLeader}"\n`;
    }

    message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✨ _Generado desde Agenda R07 Su Presencia_`;

    const encoded = encodeURIComponent(message);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
    
    // Open WhatsApp
    window.open(waUrl, '_system');
    this.storage.showSnackbar('Abriendo WhatsApp para enviar reporte al líder 📲');
  }
}


