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
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 {{ storage.fontClass() }}">
      
      <!-- CARD 1: VERSÍCULO LEMA Y METAS ESPIRITUALES -->
      <div class="rounded-3xl p-5 sm:p-6 border shadow-xs flex flex-col justify-between transition-colors duration-300"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-icons text-xl" [style.color]="colors.primary">stars</span>
              <h3 class="text-base font-bold tracking-tight">
                Versículo Clave y Metas de la Semana
              </h3>
            </div>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  [style.backgroundColor]="colors.primaryLight"
                  [style.color]="colors.primary">
              Semana {{ storage.currentWeek().weekNumber }}
            </span>
          </div>

          <!-- Key Verse Box -->
          <div class="rounded-2xl p-4 border mb-5 relative overflow-hidden"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <span class="text-xs font-bold uppercase tracking-wider block mb-1"
                  [style.color]="colors.primary">
              Versículo para Memorizar: {{ storage.currentWeek().weeklyVerse.reference }}
            </span>
            <p class="font-serif italic text-sm leading-relaxed mb-2" [style.color]="colors.textPrimary">
              «{{ storage.currentWeek().weeklyVerse.text }}»
            </p>
            <div class="flex items-center justify-between text-[11px]" [style.color]="colors.textMuted">
              <span>Lema: {{ storage.currentWeek().motto }}</span>
            </div>
          </div>

          <!-- Weekly Goals List -->
          <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
                Metas Semanales
              </span>
              <span class="text-[11px]" [style.color]="colors.textMuted">
                {{ completedGoalsCount() }} de {{ (storage.currentWeek().weeklyGoals || []).length }} cumplidas
              </span>
            </div>

            @for (goal of (storage.currentWeek().weeklyGoals || []); track goal.id) {
              <div class="flex items-center justify-between p-2.5 rounded-2xl border transition"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <label class="flex items-center gap-2.5 cursor-pointer flex-1 mr-2">
                  <input
                    type="checkbox"
                    [checked]="goal.completed"
                    (change)="toggleGoal(goal.id)"
                    class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500">
                  <span 
                    [class.line-through]="goal.completed"
                    [class.opacity-50]="goal.completed"
                    class="text-xs sm:text-sm font-medium"
                    [style.color]="colors.textPrimary">
                    {{ goal.title }}
                  </span>
                </label>
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase"
                        [style.backgroundColor]="colors.primaryLight"
                        [style.color]="colors.primary">
                    {{ goal.category }}
                  </span>
                  <button
                    type="button"
                    (click)="deleteGoal(goal.id)"
                    class="text-stone-400 hover:text-rose-500 p-1 transition cursor-pointer">
                    <span class="material-icons text-sm">close</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Add Goal Input Form -->
        <div class="pt-3 border-t flex gap-2" [style.borderColor]="colors.border">
          <input
            type="text"
            [formControl]="newGoalControl"
            placeholder="Nueva meta (ej. Ayuno el miércoles, leer 5 capítulos)..."
            (keyup.enter)="addGoal()"
            class="flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-medium"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary">
          <button
            type="button"
            (click)="addGoal()"
            class="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
            [style.backgroundColor]="colors.primary">
            <span class="material-icons text-sm">add</span>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <!-- CARD 2: MOTIVOS DE ORACIÓN & CLAMOR -->
      <div class="rounded-3xl p-5 sm:p-6 border shadow-xs flex flex-col justify-between transition-colors duration-300"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-icons text-xl" [style.color]="colors.primary">volunteer_activism</span>
              <h3 class="text-base font-bold tracking-tight">
                Mis Motivos de Oración y Respuestas
              </h3>
            </div>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  [style.backgroundColor]="colors.primaryLight"
                  [style.color]="colors.primary">
              Clamor Diario
            </span>
          </div>

          <!-- Prayer List -->
          <div class="space-y-2 mb-4 max-h-[260px] overflow-y-auto pr-1 scrollbar-none">
            @for (item of (storage.currentWeek().generalPrayerRequests || []); track item.id) {
              <div class="p-3 rounded-2xl border transition space-y-1.5"
                   [style.backgroundColor]="item.answered ? '#ECFDF5' : colors.background"
                   [style.borderColor]="item.answered ? '#A7F3D0' : colors.border">
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="togglePrayerAnswered(item.id)"
                      [class]="item.answered ? 'bg-emerald-500 text-white' : 'border border-stone-300 text-transparent hover:border-emerald-500'"
                      class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition cursor-pointer">
                      ✓
                    </button>
                    <span 
                      [class.text-emerald-900]="item.answered"
                      [class.font-semibold]="item.answered"
                      class="text-xs sm:text-sm"
                      [style.color]="item.answered ? '#065F46' : colors.textPrimary">
                      {{ item.request }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span 
                      [class.bg-emerald-100]="item.answered" 
                      [class.text-emerald-800]="item.answered" 
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      [style.backgroundColor]="item.answered ? '#D1FAE5' : colors.primaryLight"
                      [style.color]="item.answered ? '#065F46' : colors.primary">
                      {{ item.answered ? '¡Respondida!' : item.category }}
                    </span>
                    <button
                      type="button"
                      (click)="deletePrayer(item.id)"
                      class="text-stone-400 hover:text-rose-500 p-1 transition cursor-pointer">
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
              <div class="p-6 text-center text-xs border border-dashed rounded-2xl"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.textMuted">
                No tienes peticiones registradas esta semana. ¡Anota por quién o qué estás orando!
              </div>
            }
          </div>
        </div>

        <!-- Add Prayer Input Form -->
        <div class="pt-3 border-t flex gap-2 flex-wrap sm:flex-nowrap" [style.borderColor]="colors.border">
          <input
            type="text"
            [formControl]="newPrayerControl"
            placeholder="Motivo de oración (ej. Sanidad, finanzas, familia)..."
            (keyup.enter)="addPrayer()"
            class="flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-medium"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary">
          <select
            [formControl]="newPrayerCategoryControl"
            class="px-2 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-medium"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary">
            <option value="familia" class="text-stone-900">Familia</option>
            <option value="salud" class="text-stone-900">Salud</option>
            <option value="finanzas" class="text-stone-900">Finanzas</option>
            <option value="espiritual" class="text-stone-900">Espiritual</option>
            <option value="misiones" class="text-stone-900">Misiones</option>
            <option value="otros" class="text-stone-900">Otros</option>
          </select>
          <button
            type="button"
            (click)="addPrayer()"
            class="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1 transition shadow-xs hover:opacity-90 cursor-pointer"
            [style.backgroundColor]="colors.primary">
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

  get colors() {
    return this.storage.currentThemeColors();
  }

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
