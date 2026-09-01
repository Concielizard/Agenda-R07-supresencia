import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { WeeklyGoal, PrayerItem } from '../models/r07.models';

@Component({
  selector: 'app-r07-weekly-goals',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      <!-- CARD 1: VERSÍCULO LEMA Y METAS ESPIRITUALES -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/90 flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-icons text-amber-600 text-xl">stars</span>
              <h3 class="text-base font-bold text-stone-800 font-serif">
                Versículo Clave y Metas de la Semana
              </h3>
            </div>
            <span class="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Semana {{ storage.currentWeek().weekNumber }}
            </span>
          </div>

          <!-- Key Verse Box -->
          <div class="bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-amber-500/5 rounded-xl p-4 border border-amber-200/80 mb-5 relative">
            <span class="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
              Versículo para Memorizar: {{ storage.currentWeek().weeklyVerse.reference }}
            </span>
            <p class="text-stone-800 font-serif italic text-sm leading-relaxed mb-2">
              "{{ storage.currentWeek().weeklyVerse.text }}"
            </p>
            <div class="flex items-center justify-between text-[11px] text-stone-500">
              <span>Lema: {{ storage.currentWeek().motto }}</span>
            </div>
          </div>

          <!-- Weekly Goals List -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-stone-700">Metas Semanales</span>
              <span class="text-[11px] text-stone-500">
                {{ completedGoalsCount() }} de {{ storage.currentWeek().weeklyGoals.length }} cumplidas
              </span>
            </div>

            @for (goal of storage.currentWeek().weeklyGoals; track goal.id) {
              <div class="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 hover:border-stone-200 bg-stone-50/60 transition">
                <label class="flex items-center gap-2.5 cursor-pointer flex-1 mr-2">
                  <input
                    type="checkbox"
                    [checked]="goal.completed"
                    (change)="toggleGoal(goal.id)"
                    class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500">
                  <span 
                    [class.line-through]="goal.completed"
                    [class.text-stone-400]="goal.completed"
                    class="text-xs sm:text-sm text-stone-800 font-medium">
                    {{ goal.title }}
                  </span>
                </label>
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-stone-200/80 text-stone-600">
                    {{ goal.category }}
                  </span>
                  <button
                    type="button"
                    (click)="deleteGoal(goal.id)"
                    class="text-stone-400 hover:text-rose-500 p-1 transition">
                    <span class="material-icons text-sm">close</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Add Goal Input Form -->
        <div class="pt-3 border-t border-stone-100 flex gap-2">
          <input
            type="text"
            [formControl]="newGoalControl"
            placeholder="Nueva meta (ej. Ayuno el miércoles, leer 5 capítulos)..."
            (keyup.enter)="addGoal()"
            class="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-800 focus:ring-2 focus:ring-purple-500 focus:bg-white transition">
          <button
            type="button"
            (click)="addGoal()"
            class="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1 transition">
            <span class="material-icons text-sm">add</span>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <!-- CARD 2: MOTIVOS DE ORACIÓN & CLAMOR -->
      <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/90 flex flex-col justify-between">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-icons text-purple-700 text-xl">volunteer_activism</span>
              <h3 class="text-base font-bold text-stone-800 font-serif">
                Mis Motivos de Oración y Respuestas
              </h3>
            </div>
            <span class="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Clamor Diario
            </span>
          </div>

          <!-- Prayer List -->
          <div class="space-y-2 mb-4 max-h-[260px] overflow-y-auto pr-1">
            @for (item of storage.currentWeek().generalPrayerRequests; track item.id) {
              <div 
                [class.bg-emerald-50]="item.answered"
                [class.border-emerald-200]="item.answered"
                class="p-3 rounded-xl border border-stone-200 bg-stone-50/50 transition space-y-1.5">
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="togglePrayerAnswered(item.id)"
                      [class]="item.answered ? 'bg-emerald-500 text-white' : 'border border-stone-300 text-transparent hover:border-emerald-500'"
                      class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition">
                      ✓
                    </button>
                    <span 
                      [class.text-emerald-900]="item.answered"
                      [class.font-semibold]="item.answered"
                      class="text-xs sm:text-sm text-stone-800">
                      {{ item.request }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span 
                      [class]="item.answered ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {{ item.answered ? '¡Respondida!' : item.category }}
                    </span>
                    <button
                      type="button"
                      (click)="deletePrayer(item.id)"
                      class="text-stone-400 hover:text-rose-500 p-1 transition">
                      <span class="material-icons text-sm">close</span>
                    </button>
                  </div>
                </div>

                @if (item.answered && item.answerNote) {
                  <p class="text-[11px] text-emerald-700 italic pl-6">
                    Testimonio: {{ item.answerNote }}
                  </p>
                }
              </div>
            } @empty {
              <div class="p-6 text-center text-xs text-stone-400 border border-dashed rounded-xl">
                No tienes peticiones registradas esta semana. ¡Anota por quién o qué estás orando!
              </div>
            }
          </div>
        </div>

        <!-- Add Prayer Input Form -->
        <div class="pt-3 border-t border-stone-100 flex gap-2">
          <input
            type="text"
            [formControl]="newPrayerControl"
            placeholder="Motivo de oración (ej. Sanidad de mi madre, trabajo, conversión)..."
            (keyup.enter)="addPrayer()"
            class="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-800 focus:ring-2 focus:ring-purple-500 focus:bg-white transition">
          <select
            [formControl]="newPrayerCategoryControl"
            class="px-2 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-700">
            <option value="familia">Familia</option>
            <option value="salud">Salud</option>
            <option value="finanzas">Finanzas</option>
            <option value="espiritual">Espiritual</option>
            <option value="misiones">Misiones</option>
            <option value="otros">Otros</option>
          </select>
          <button
            type="button"
            (click)="addPrayer()"
            class="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1 transition">
            <span class="material-icons text-sm">add</span>
            <span>Añadir</span>
          </button>
        </div>
      </div>

    </div>
  `
})
export class R07WeeklyGoals {
  public storage = inject(R07StorageService);

  public newGoalControl = new FormControl('');
  public newPrayerControl = new FormControl('');
  public newPrayerCategoryControl = new FormControl<'familia' | 'salud' | 'finanzas' | 'espiritual' | 'misiones' | 'otros'>('familia');

  public completedGoalsCount = () => {
    return this.storage.currentWeek().weeklyGoals?.filter(g => g.completed).length || 0;
  };

  public toggleGoal(goalId: string): void {
    const week = this.storage.currentWeek();
    const updatedGoals = week.weeklyGoals.map(g => {
      if (g.id === goalId) {
        return { ...g, completed: !g.completed };
      }
      return g;
    });
    this.storage.saveCurrentWeek({ ...week, weeklyGoals: updatedGoals });
  }

  public addGoal(): void {
    const title = this.newGoalControl.value?.trim();
    if (!title) return;

    const week = this.storage.currentWeek();
    const newGoal: WeeklyGoal = {
      id: `g_${Date.now()}`,
      title,
      category: 'espiritual',
      completed: false
    };

    this.storage.saveCurrentWeek({
      ...week,
      weeklyGoals: [...(week.weeklyGoals || []), newGoal]
    });
    this.newGoalControl.setValue('');
  }

  public deleteGoal(goalId: string): void {
    const week = this.storage.currentWeek();
    this.storage.saveCurrentWeek({
      ...week,
      weeklyGoals: week.weeklyGoals.filter(g => g.id !== goalId)
    });
  }

  public togglePrayerAnswered(prayerId: string): void {
    const week = this.storage.currentWeek();
    const updated = week.generalPrayerRequests.map(p => {
      if (p.id === prayerId) {
        const nextState = !p.answered;
        return {
          ...p,
          answered: nextState,
          answerDate: nextState ? new Date().toISOString().split('T')[0] : undefined,
          answerNote: nextState ? '¡Dios respondió con fidelidad y gracia!' : undefined
        };
      }
      return p;
    });
    this.storage.saveCurrentWeek({ ...week, generalPrayerRequests: updated });
  }

  public addPrayer(): void {
    const text = this.newPrayerControl.value?.trim();
    if (!text) return;

    const week = this.storage.currentWeek();
    const newPrayer: PrayerItem = {
      id: `p_${Date.now()}`,
      request: text,
      category: this.newPrayerCategoryControl.value || 'familia',
      answered: false,
      dateCreated: new Date().toISOString().split('T')[0]
    };

    this.storage.saveCurrentWeek({
      ...week,
      generalPrayerRequests: [...(week.generalPrayerRequests || []), newPrayer]
    });
    this.newPrayerControl.setValue('');
  }

  public deletePrayer(prayerId: string): void {
    const week = this.storage.currentWeek();
    this.storage.saveCurrentWeek({
      ...week,
      generalPrayerRequests: week.generalPrayerRequests.filter(p => p.id !== prayerId)
    });
  }
}
