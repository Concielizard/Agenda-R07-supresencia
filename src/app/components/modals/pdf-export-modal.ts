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
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <span class="material-icons text-sm">picture_as_pdf</span>
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">Exportar Agenda R07 a PDF</h3>
              <p class="text-xs text-purple-200">Genera tu libreta devocional lista para imprimir o compartir</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-purple-200 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-stone-700">
          <div class="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-stone-800">Semana Seleccionada:</span>
              <span class="text-purple-900 font-bold">Semana {{ storage.currentWeek().weekNumber }} ({{ storage.currentWeek().year }})</span>
            </div>
            <div class="flex items-center justify-between text-stone-600">
              <span>Usuario:</span>
              <span>{{ storage.userProfile().displayName }}</span>
            </div>
            <div class="flex items-center justify-between text-stone-600">
              <span>Iglesia / Célula:</span>
              <span>{{ storage.userProfile().churchName || 'Mi Iglesia' }} / {{ storage.userProfile().cellGroupName || 'Célula' }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <span class="font-bold uppercase tracking-wider text-stone-700 block">Opciones del Documento</span>
            
            <label class="flex items-center gap-2.5 p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <input type="checkbox" [formControl]="includeGoals" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500">
              <span>Incluir Metas y Motivos de Oración Semanales</span>
            </label>

            <label class="flex items-center gap-2.5 p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
              <input type="checkbox" [formControl]="includeEvaluation" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500">
              <span>Incluir Evaluación Semanal y Resumen para el Líder</span>
            </label>
          </div>

          @if (isExporting()) {
            <div class="py-4 text-center space-y-2 text-stone-600">
              <span class="material-icons text-2xl text-purple-600 animate-spin">sync</span>
              <p>Generando documento PDF de alta calidad...</p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition">
            Cancelar
          </button>

          <button
            type="button"
            (click)="generatePdf()"
            [disabled]="isExporting()"
            class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
            <span class="material-icons text-sm">download</span>
            <span>Descargar PDF</span>
          </button>
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

  public async generatePdf(): Promise<void> {
    this.isExporting.set(true);
    try {
      await this.pdfService.exportWeekToPdf(this.storage.currentWeek(), this.storage.userProfile());
      this.close.emit();
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      this.isExporting.set(false);
    }
  }
}
