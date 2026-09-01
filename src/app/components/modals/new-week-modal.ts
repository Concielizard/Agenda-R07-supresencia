import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';
import { R07Week } from '../../models/r07.models';

@Component({
  selector: 'app-new-week-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <span class="material-icons text-sm">calendar_month</span>
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">Gestión de Semanas Devocionales</h3>
              <p class="text-xs text-purple-200">Crea nuevos ciclos o consulta tus semanas anteriores</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-purple-200 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          <div class="flex items-center justify-between">
            <span class="font-bold uppercase tracking-wider text-stone-700">Tus Semanas Registradas</span>
            <button
              type="button"
              (click)="createNewWeek()"
              class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold flex items-center gap-1 shadow-xs transition">
              <span class="material-icons text-sm">add</span>
              <span>Comenzar Nueva Semana R07</span>
            </button>
          </div>

          <div class="space-y-2.5">
            @for (w of storage.allWeeks(); track w.id) {
              <div 
                [class.ring-2]="w.id === storage.currentWeekId()" 
                [class.ring-purple-600]="w.id === storage.currentWeekId()" 
                [class.bg-purple-50]="w.id === storage.currentWeekId()" 
                class="p-4 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white transition flex items-center justify-between gap-3">
                
                <div class="space-y-0.5 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-stone-900 font-serif">
                      Semana {{ w.weekNumber }} ({{ w.year }})
                    </span>
                    @if (w.id === storage.currentWeekId()) {
                      <span class="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold">
                        Activa
                      </span>
                    }
                  </div>
                  <p class="text-stone-500 text-[11px]">
                    {{ w.startDate }} al {{ w.endDate }} • Lema: "{{ w.motto }}"
                  </p>
                  <p class="text-stone-600 text-[11px]">
                    Días completados: <strong>{{ getCompletedCount(w) }} de 7</strong> • Clave: {{ w.weeklyVerse.reference }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  @if (w.id !== storage.currentWeekId()) {
                    <button
                      type="button"
                      (click)="selectWeek(w.id)"
                      class="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-purple-700 hover:text-white text-stone-700 font-semibold transition">
                      Abrir
                    </button>
                  }

                  @if (storage.allWeeks().length > 1) {
                    <button
                      type="button"
                      (click)="deleteWeek(w.id)"
                      class="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
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
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition">
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

  public createNewWeek(): void {
    this.storage.addNewWeek();
    this.close.emit();
  }

  public selectWeek(id: string): void {
    this.storage.selectWeek(id);
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
