import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';
import { R07Week } from '../../models/r07.models';

@Component({
  selector: 'app-new-week-modal',
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
              <span class="material-icons text-base">calendar_month</span>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Gestión de Semanas Devocionales</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Crea nuevos ciclos de 7 días o consulta tus semanas anteriores
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
          
          <div class="flex items-center justify-between">
            <span class="font-bold uppercase tracking-wider" [style.color]="colors.primary">
              Tus Semanas Registradas
            </span>
            <button
              type="button"
              (click)="createNewWeek()"
              class="px-3.5 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">add</span>
              <span>Comenzar Nueva Semana</span>
            </button>
          </div>

          <div class="space-y-2.5">
            @for (w of storage.allWeeks(); track w.id) {
              <div class="p-4 rounded-2xl border transition flex items-center justify-between gap-3"
                   [style.backgroundColor]="w.id === storage.currentWeekId() ? colors.primaryLight : colors.background"
                   [style.borderColor]="w.id === storage.currentWeekId() ? colors.primary : colors.border">
                
                <div class="space-y-0.5 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm font-serif" [style.color]="colors.textPrimary">
                      Semana {{ w.weekNumber }} ({{ w.year }})
                    </span>
                    @if (w.id === storage.currentWeekId()) {
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                            [style.backgroundColor]="colors.primary">
                        Activa
                      </span>
                    }
                  </div>
                  <p class="text-[11px]" [style.color]="colors.textMuted">
                    {{ w.startDate }} al {{ w.endDate }} • Lema: «{{ w.motto }}»
                  </p>
                  <p class="text-[11px]" [style.color]="colors.textSecondary">
                    Días completados: <strong>{{ getCompletedCount(w) }} de 7</strong> • Clave: {{ w.weeklyVerse.reference }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  @if (w.id !== storage.currentWeekId()) {
                    <button
                      type="button"
                      (click)="selectWeek(w.id)"
                      class="px-3 py-1.5 rounded-xl border font-bold transition hover:opacity-80 cursor-pointer"
                      [style.borderColor]="colors.border"
                      [style.backgroundColor]="colors.surface"
                      [style.color]="colors.primary">
                      Abrir
                    </button>
                  }

                  @if (storage.allWeeks().length > 1) {
                    <button
                      type="button"
                      (click)="deleteWeek(w.id)"
                      class="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Eliminar semana">
                      <span class="material-icons text-base">delete</span>
                    </button>
                  }
                </div>

              </div>
            }
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex justify-end"
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
        </div>

      </div>
    </div>
  `
})
export class NewWeekModal {
  public storage = inject(R07StorageService);
  public close = output<void>();

  get colors() {
    return this.storage.currentThemeColors();
  }

  public createNewWeek(): void {
    this.storage.addNewWeek();
    this.storage.showSnackbar('¡Nueva semana devocional iniciada!');
    this.close.emit();
  }

  public selectWeek(id: string): void {
    this.storage.selectWeek(id);
    this.storage.showSnackbar('Semana seleccionada');
    this.close.emit();
  }

  public deleteWeek(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta semana de devocional?')) {
      this.storage.deleteWeek(id);
    }
  }

  public getCompletedCount(week: R07Week): number {
    return week.days?.filter(d => d.completed).length || 0;
  }
}

