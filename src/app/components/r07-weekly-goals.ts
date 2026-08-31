import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { R07WeeklyGoalEntity } from '../models/r07.models';

const GOAL_CATEGORIES = ['Todas', 'Espiritual', 'Oración', 'Lectura', 'Hábito', 'Personal'];

@Component({
  selector: 'app-r07-weekly-goals',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="r07-weekly-goals-container" class="rounded-2xl p-5 md:p-7 border shadow-sm space-y-6 transition-all"
         [style.backgroundColor]="colors.surface"
         [style.borderColor]="colors.border">
      
      <!-- Top Title & Progress Overview -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b"
           [style.borderColor]="colors.border">
        <div>
          <h3 class="text-xl font-bold tracking-tight" [style.color]="colors.textPrimary">
            Metas Semanales de Crecimiento
          </h3>
          <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
            Establece objetivos de fe, hábitos y lectura para tu semana espiritual
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-xs font-bold" [style.color]="colors.textPrimary">
              {{ completedCount }} de {{ totalCount }} completadas
            </span>
            <div class="w-32 h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-1">
              <div class="h-full rounded-full transition-all duration-500"
                   [style.backgroundColor]="colors.primary"
                   [style.width.%]="progressPercent"></div>
            </div>
          </div>

          <button
            id="btn-new-goal"
            type="button"
            (click)="showNewForm.set(!showNewForm())"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            [style.backgroundColor]="colors.primary">
            <span class="mat-icon text-sm">add</span>
            <span>Nueva Meta</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        @for (cat of categories; track cat) {
          <button
            [id]="'filter-goal-' + cat"
            type="button"
            (click)="selectedCategory.set(cat)"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 cursor-pointer"
            [style.backgroundColor]="selectedCategory() === cat ? colors.primaryLight : 'transparent'"
            [style.borderColor]="selectedCategory() === cat ? colors.primary : colors.border"
            [style.color]="selectedCategory() === cat ? colors.primary : colors.textSecondary">
            {{ cat }}
          </button>
        }
      </div>

      <!-- Add New Goal Inline Form -->
      @if (showNewForm()) {
        <div class="p-4 rounded-xl border space-y-3"
             [style.backgroundColor]="colors.background"
             [style.borderColor]="colors.border">
          <h4 class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
            Definir Nueva Meta para {{ currentWeek?.title }}
          </h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <input
                id="new-goal-title-input"
                type="text"
                [(ngModel)]="newGoalTitle"
                placeholder="Título de la meta (ej. Orar 20 min al despertar)"
                class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>
            <div>
              <select
                id="new-goal-category-select"
                [(ngModel)]="newGoalCategory"
                class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none cursor-pointer"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
                <option value="Espiritual">Espiritual</option>
                <option value="Oración">Oración</option>
                <option value="Lectura">Lectura</option>
                <option value="Hábito">Hábito</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="showNewForm.set(false)"
              class="text-xs px-3 py-1.5 rounded-lg border hover:bg-black/5 cursor-pointer"
              [style.borderColor]="colors.border"
              [style.color]="colors.textSecondary">
              Cancelar
            </button>
            <button
              id="btn-save-new-goal"
              type="button"
              (click)="saveNewGoal()"
              class="text-xs font-semibold px-4 py-1.5 rounded-lg text-white shadow-xs hover:opacity-90 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              Guardar Meta
            </button>
          </div>
        </div>
      }

      <!-- Goals List -->
      <div class="space-y-3">
        @for (goal of filteredGoals; track goal.id) {
          <div class="p-4 rounded-xl border flex items-center justify-between gap-3 transition-all"
               [style.backgroundColor]="goal.isCompleted ? '#F0FDF4' : colors.background"
               [style.borderColor]="goal.isCompleted ? '#86EFAC' : colors.border">
            
            <div class="flex items-center gap-3">
              <button
                [id]="'btn-toggle-goal-' + goal.id"
                type="button"
                (click)="storage.toggleWeeklyGoal(goal.id)"
                class="w-6 h-6 rounded-lg border flex items-center justify-center text-xs shrink-0 transition-all cursor-pointer"
                [style.backgroundColor]="goal.isCompleted ? '#10B981' : 'transparent'"
                [style.borderColor]="goal.isCompleted ? '#10B981' : colors.border"
                [style.color]="goal.isCompleted ? '#FFFFFF' : 'transparent'">
                ✓
              </button>

              <div>
                <span class="text-sm font-semibold"
                      [style.color]="goal.isCompleted ? '#166534' : colors.textPrimary"
                      [class.line-through]="goal.isCompleted">
                  {{ goal.title }}
                </span>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-[10px] px-2 py-0.2 rounded font-semibold"
                        [style.backgroundColor]="colors.primaryLight"
                        [style.color]="colors.primary">
                    {{ goal.category }}
                  </span>
                  @if (goal.isCompleted) {
                    <span class="text-[10px] text-emerald-700 font-medium">¡Completada con éxito!</span>
                  }
                </div>
              </div>
            </div>

            <button
              [id]="'btn-delete-goal-' + goal.id"
              type="button"
              (click)="storage.deleteWeeklyGoal(goal.id)"
              class="w-7 h-7 rounded-lg border flex items-center justify-center text-xs text-red-500 hover:bg-red-50 cursor-pointer shrink-0"
              [style.borderColor]="colors.border"
              title="Eliminar meta">
              ✕
            </button>
          </div>
        } @empty {
          <div class="p-8 text-center text-xs" [style.color]="colors.textMuted">
            No hay metas en esta categoría. Agrega metas para mantener tu enfoque espiritual.
          </div>
        }
      </div>

    </div>
  `
})
export class R07WeeklyGoals {
  storage = inject(R07StorageService);

  categories = GOAL_CATEGORIES;
  selectedCategory = signal<string>('Todas');
  showNewForm = signal<boolean>(false);

  newGoalTitle = '';
  newGoalCategory = 'Espiritual';

  get colors() {
    return this.storage.currentThemeColors();
  }

  get currentWeek() {
    return this.storage.currentWeekWithDays()?.week;
  }

  get allGoals(): R07WeeklyGoalEntity[] {
    return this.storage.currentWeekWithDays()?.goals || [];
  }

  get filteredGoals(): R07WeeklyGoalEntity[] {
    const cat = this.selectedCategory();
    if (cat === 'Todas') return this.allGoals;
    return this.allGoals.filter((g) => g.category === cat);
  }

  get totalCount(): number {
    return this.allGoals.length;
  }

  get completedCount(): number {
    return this.allGoals.filter((g) => g.isCompleted).length;
  }

  get progressPercent(): number {
    if (this.totalCount === 0) return 0;
    return Math.round((this.completedCount / this.totalCount) * 100);
  }

  saveNewGoal(): void {
    if (!this.newGoalTitle.trim() || !this.currentWeek) return;
    this.storage.addWeeklyGoal(this.currentWeek.id, this.newGoalTitle, this.newGoalCategory);
    this.newGoalTitle = '';
    this.showNewForm.set(false);
  }
}
