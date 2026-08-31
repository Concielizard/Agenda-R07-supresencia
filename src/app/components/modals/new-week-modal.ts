import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-new-week-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="new-week-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="new-week-modal-panel" class="w-full max-w-lg flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
                 [style.backgroundColor]="colors.primary">
              🗓️
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight" [style.color]="colors.textPrimary">
                Crear Nueva Semana Devocional R07
              </h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Inicia un nuevo ciclo de 7 días "Pasa tiempo Conmigo"
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

        <!-- Form Body -->
        <div class="p-5 space-y-3.5 text-xs">
          
          <div>
            <label class="block font-bold text-[11px] mb-1" [style.color]="colors.textSecondary">
              Título de la Semana:
            </label>
            <input
              id="new-week-title"
              type="text"
              [(ngModel)]="title"
              placeholder="Ej: Semana 2: Creciendo en Fe"
              class="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-[11px] mb-1" [style.color]="colors.textSecondary">
                Fecha Inicio (Lunes):
              </label>
              <input
                id="new-week-start-date"
                type="text"
                [(ngModel)]="startDate"
                placeholder="Ej: 08 Sep"
                class="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>

            <div>
              <label class="block font-bold text-[11px] mb-1" [style.color]="colors.textSecondary">
                Fecha Fin (Domingo):
              </label>
              <input
                id="new-week-end-date"
                type="text"
                [(ngModel)]="endDate"
                placeholder="Ej: 14 Sep"
                class="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>
          </div>

          <div>
            <label class="block font-bold text-[11px] mb-1" [style.color]="colors.textSecondary">
              Meta Bíblica de la Semana:
            </label>
            <input
              id="new-week-goal"
              type="text"
              [(ngModel)]="weeklyReadingGoal"
              placeholder="Ej: Leer el libro de Filipenses completo (4 capítulos)"
              class="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
          </div>

          <div>
            <label class="block font-bold text-[11px] mb-1" [style.color]="colors.textSecondary">
              Versículo Lema de la Semana:
            </label>
            <input
              id="new-week-verse"
              type="text"
              [(ngModel)]="memoryVerse"
              placeholder="Ej: «Todo lo puedo en Cristo que me fortalece» — Filipenses 4:13"
              class="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 border-t flex items-center justify-between gap-3" [style.borderColor]="colors.border">
          <button
            type="button"
            (click)="onClose.emit()"
            class="text-xs px-3 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            Cancelar
          </button>

          <button
            id="btn-confirm-create-week"
            type="button"
            (click)="createWeek()"
            class="text-xs font-bold px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            [style.backgroundColor]="colors.primary">
            Crear Semana
          </button>
        </div>

      </div>
    </div>
  `
})
export class NewWeekModal {
  storage = inject(R07StorageService);

  onClose = output<void>();

  title = '';
  startDate = '';
  endDate = '';
  weeklyReadingGoal = 'Leer 1 capítulo diario del evangelio de Juan';
  memoryVerse = '«Pasa tiempo Conmigo y saciaré tu alma» — Jeremías 31:25';

  get colors() {
    return this.storage.currentThemeColors();
  }

  ngOnInit(): void {
    const totalWeeks = this.storage.weeks().length + 1;
    this.title = `Semana ${totalWeeks}: Pasa tiempo Conmigo`;
    const today = new Date();
    this.startDate = `${today.getDate()} ${today.toLocaleString('es-ES', { month: 'short' })}`;
    const end = new Date(today);
    end.setDate(today.getDate() + 6);
    this.endDate = `${end.getDate()} ${end.toLocaleString('es-ES', { month: 'short' })}`;
  }

  createWeek(): void {
    if (!this.title.trim()) return;
    this.storage.createNewWeek(
      this.title,
      this.startDate || 'Inicio',
      this.endDate || 'Fin',
      this.weeklyReadingGoal,
      this.memoryVerse
    );
    this.storage.showSnackbar('¡Nueva semana devocional R07 creada!');
    this.onClose.emit();
  }
}
