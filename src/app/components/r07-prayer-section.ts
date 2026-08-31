import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { R07PrayerPetitionEntity } from '../models/r07.models';

const PRAYER_CATEGORIES = ['Todas', 'Personal', 'Familia', 'Salud', 'Finanzas', 'Espiritual', 'Iglesia', 'Amigos'];

@Component({
  selector: 'app-r07-prayer-section',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="r07-prayer-section-container" class="space-y-6">
      
      <!-- Top Banner: Guided Prayer Timer / Quiet Time Launcher -->
      <div class="rounded-2xl p-6 border shadow-sm transition-all"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.color]="colors.primary">
              🕊️
            </div>
            <div>
              <h3 class="text-lg font-bold tracking-tight" [style.color]="colors.textPrimary">
                Tiempo a Solas con Dios (Lugar Secreto)
              </h3>
              <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
                Guía estructurada en 4 pasos: Adoración • Desahogo • Petición • Agradecimiento
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            @if (activePrayerStep() === 0) {
              <button
                id="btn-start-prayer-timer"
                type="button"
                (click)="startPrayerTimer()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                [style.backgroundColor]="colors.primary">
                <span class="mat-icon text-base">play_arrow</span>
                <span>Iniciar Tiempo de Oración (10 min)</span>
              </button>
            } @else {
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border bg-black/5 dark:bg-white/5"
                      [style.borderColor]="colors.border"
                      [style.color]="colors.primary">
                  ⏱️ {{ formatTimer(timerSeconds()) }}
                </span>
                <button
                  id="btn-next-prayer-step"
                  type="button"
                  (click)="nextPrayerStep()"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs cursor-pointer"
                  [style.backgroundColor]="colors.primary">
                  {{ activePrayerStep() < 4 ? 'Siguiente Paso →' : 'Finalizar ✓' }}
                </button>
                <button
                  id="btn-stop-prayer-timer"
                  type="button"
                  (click)="stopPrayerTimer()"
                  class="px-2.5 py-1.5 rounded-lg text-xs font-medium border hover:bg-black/5 cursor-pointer"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textMuted">
                  ✕
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Interactive Step Display when Timer is Active -->
        @if (activePrayerStep() > 0) {
          <div class="mt-5 p-4 rounded-xl border transition-all"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
                Paso {{ activePrayerStep() }}/4: {{ getStepTitle(activePrayerStep()) }}
              </span>
              <span class="text-xs" [style.color]="colors.textSecondary">
                {{ getStepDuration(activePrayerStep()) }}
              </span>
            </div>
            <p class="text-sm font-medium leading-relaxed" [style.color]="colors.textPrimary">
              {{ getStepDescription(activePrayerStep()) }}
            </p>
          </div>
        }
      </div>

      <!-- Prayer Petitions Section -->
      <div class="rounded-2xl p-6 border shadow-sm"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b"
             [style.borderColor]="colors.border">
          <div>
            <h3 class="text-lg font-bold tracking-tight" [style.color]="colors.textPrimary">
              Peticiones & Motivos de Oración
            </h3>
            <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
              Presenta tus clamores delante de Dios y registra Sus respuestas
            </p>
          </div>

          <button
            id="btn-new-petition"
            type="button"
            (click)="showNewPetitionForm.set(!showNewPetitionForm())"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
            [style.backgroundColor]="colors.primary">
            <span class="mat-icon text-sm">add</span>
            <span>Nueva Petición</span>
          </button>
        </div>

        <!-- Category Filters -->
        <div class="flex items-center gap-2 overflow-x-auto py-3 scrollbar-thin">
          @for (cat of categories; track cat) {
            <button
              [id]="'filter-cat-' + cat"
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

        <!-- New Petition Inline Form -->
        @if (showNewPetitionForm()) {
          <div class="p-4 rounded-xl border mb-4 mt-2 space-y-3"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <h4 class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
              Agregar Petición de Clamor
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <input
                  id="new-petition-title"
                  type="text"
                  [(ngModel)]="newTitle"
                  placeholder="Título de la petición (ej. Salud de mi mamá)"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>
              <div>
                <select
                  id="new-petition-category"
                  [(ngModel)]="newCategory"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none cursor-pointer"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
                  <option value="Personal">Personal</option>
                  <option value="Familia">Familia</option>
                  <option value="Salud">Salud</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Espiritual">Espiritual</option>
                  <option value="Iglesia">Iglesia</option>
                  <option value="Amigos">Amigos</option>
                </select>
              </div>
            </div>
            <textarea
              id="new-petition-desc"
              rows="2"
              [(ngModel)]="newDescription"
              placeholder="Detalle o versículo clave de respaldo..."
              class="w-full text-xs p-3 rounded-lg border bg-transparent focus:outline-none resize-none"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
            
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="showNewPetitionForm.set(false)"
                class="text-xs px-3 py-1.5 rounded-lg border hover:bg-black/5 cursor-pointer"
                [style.borderColor]="colors.border"
                [style.color]="colors.textSecondary">
                Cancelar
              </button>
              <button
                id="btn-save-new-petition"
                type="button"
                (click)="saveNewPetition()"
                class="text-xs font-semibold px-4 py-1.5 rounded-lg text-white shadow-xs hover:opacity-90 cursor-pointer"
                [style.backgroundColor]="colors.primary">
                Guardar Petición
              </button>
            </div>
          </div>
        }

        <!-- Petitions List -->
        <div class="space-y-3 mt-3">
          @for (petition of filteredPetitions; track petition.id) {
            <div class="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                 [style.backgroundColor]="petition.isAnswered ? '#F0FDF4' : colors.background"
                 [style.borderColor]="petition.isAnswered ? '#86EFAC' : colors.border">
              
              <div class="flex items-start gap-3">
                <button
                  [id]="'btn-toggle-answered-' + petition.id"
                  type="button"
                  (click)="toggleAnswered(petition)"
                  class="w-6 h-6 rounded-lg border flex items-center justify-center text-xs mt-0.5 shrink-0 transition-all cursor-pointer"
                  [style.backgroundColor]="petition.isAnswered ? '#10B981' : 'transparent'"
                  [style.borderColor]="petition.isAnswered ? '#10B981' : colors.border"
                  [style.color]="petition.isAnswered ? '#FFFFFF' : 'transparent'">
                  ✓
                </button>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-bold"
                          [style.color]="petition.isAnswered ? '#166534' : colors.textPrimary"
                          [class.line-through]="petition.isAnswered">
                      {{ petition.title }}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-md font-semibold"
                          [style.backgroundColor]="colors.primaryLight"
                          [style.color]="colors.primary">
                      {{ petition.category }}
                    </span>
                    @if (petition.isAnswered) {
                      <span class="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800">
                        ¡Respondida! ✨ {{ petition.answeredDate }}
                      </span>
                    }
                  </div>
                  @if (petition.description) {
                    <p class="text-xs mt-1" [style.color]="petition.isAnswered ? '#15803D' : colors.textSecondary">
                      {{ petition.description }}
                    </p>
                  }
                  @if (petition.testimonyNote) {
                    <p class="text-xs mt-1 italic text-emerald-700">
                      Testimonio: "{{ petition.testimonyNote }}"
                    </p>
                  }
                </div>
              </div>

              <!-- Actions & Prayer Counter -->
              <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  [id]="'btn-pray-counter-' + petition.id"
                  type="button"
                  (click)="storage.incrementPetitionPrayerCount(petition.id)"
                  class="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.primary"
                  title="Registrar que oraste por esta petición">
                  <span>🙏</span>
                  <span>{{ petition.prayerCount }}</span>
                </button>
                <button
                  [id]="'btn-delete-petition-' + petition.id"
                  type="button"
                  (click)="storage.deletePrayerPetition(petition.id)"
                  class="w-7 h-7 rounded-lg border flex items-center justify-center text-xs text-red-500 hover:bg-red-50 cursor-pointer"
                  [style.borderColor]="colors.border"
                  title="Eliminar">
                  ✕
                </button>
              </div>

            </div>
          } @empty {
            <div class="p-8 text-center text-xs" [style.color]="colors.textMuted">
              No hay peticiones en esta categoría. Agrega una nueva petición para comenzar a orar.
            </div>
          }
        </div>

      </div>

      <!-- Church Connection & 2-Day Church Prayer Attendance Form -->
      <div class="rounded-2xl p-6 border shadow-sm space-y-4"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <div class="pb-3 border-b" [style.borderColor]="colors.border">
          <h3 class="text-lg font-bold tracking-tight" [style.color]="colors.textPrimary">
            Grupo de Conexión & Oración en la Iglesia
          </h3>
          <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
            Rendición de cuentas semanal y asistencia a las reuniones congregacionales
          </p>
        </div>

        <!-- 2 Church Prayer Days Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Prayer Day 1 -->
          <div class="p-4 rounded-xl border"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
                Día 1 de Oración Presencial / Virtual
              </span>
              <label class="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  [ngModel]="currentWeek?.attendedPrayerDay1"
                  (ngModelChange)="onPrayer1Toggle($event)"
                  class="rounded text-emerald-600 focus:ring-0">
                <span>{{ currentWeek?.attendedPrayerDay1 ? 'Asistí ✓' : 'No asistí' }}</span>
              </label>
            </div>
            <textarea
              rows="2"
              [ngModel]="currentWeek?.prayerDay1Notes"
              (blur)="onPrayer1NotesBlur($event)"
              placeholder="Motivos de oración o notas de este tiempo..."
              class="w-full text-xs p-2.5 rounded-lg border bg-transparent focus:outline-none resize-none"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

          <!-- Prayer Day 2 -->
          <div class="p-4 rounded-xl border"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
                Día 2 de Oración Presencial / Virtual
              </span>
              <label class="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  [ngModel]="currentWeek?.attendedPrayerDay2"
                  (ngModelChange)="onPrayer2Toggle($event)"
                  class="rounded text-emerald-600 focus:ring-0">
                <span>{{ currentWeek?.attendedPrayerDay2 ? 'Asistí ✓' : 'No asistí' }}</span>
              </label>
            </div>
            <textarea
              rows="2"
              [ngModel]="currentWeek?.prayerDay2Notes"
              (blur)="onPrayer2NotesBlur($event)"
              placeholder="Motivos de oración o notas de este tiempo..."
              class="w-full text-xs p-2.5 rounded-lg border bg-transparent focus:outline-none resize-none"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

        </div>

        <!-- Connection Group Meeting Notes -->
        <div class="p-4 rounded-xl border space-y-3"
             [style.backgroundColor]="colors.background"
             [style.borderColor]="colors.border">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
              Reunión de Célula / Grupo de Conexión ({{ storage.groupName() }})
            </span>
            <label class="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                [ngModel]="currentWeek?.attendedGroup"
                (ngModelChange)="onGroupToggle($event)"
                class="rounded text-emerald-600 focus:ring-0">
              <span>{{ currentWeek?.attendedGroup ? 'Asistí al grupo ✓' : 'No asistí' }}</span>
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">
                Aprendizajes clave del grupo:
              </label>
              <textarea
                rows="2"
                [ngModel]="currentWeek?.groupLearnings"
                (blur)="onGroupLearningsBlur($event)"
                placeholder="¿Qué principio bíblico se enseñó en la reunión?"
                class="w-full text-xs p-2 rounded-lg border bg-transparent focus:outline-none resize-none"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary"></textarea>
            </div>
            <div>
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">
                Temas tratados & peticiones compartidas:
              </label>
              <textarea
                rows="2"
                [ngModel]="currentWeek?.groupTopics"
                (blur)="onGroupTopicsBlur($event)"
                placeholder="Temas de conversación y oración grupal..."
                class="w-full text-xs p-2 rounded-lg border bg-transparent focus:outline-none resize-none"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary"></textarea>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class R07PrayerSection {
  storage = inject(R07StorageService);

  categories = PRAYER_CATEGORIES;
  selectedCategory = signal<string>('Todas');
  showNewPetitionForm = signal<boolean>(false);

  newTitle = '';
  newCategory = 'Personal';
  newDescription = '';

  // Timer State
  activePrayerStep = signal<number>(0);
  timerSeconds = signal<number>(0);
  private timerInterval: any = null;

  get colors() {
    return this.storage.currentThemeColors();
  }

  get currentWeek() {
    return this.storage.currentWeekWithDays()?.week;
  }

  get filteredPetitions(): R07PrayerPetitionEntity[] {
    const all = this.storage.petitions();
    const cat = this.selectedCategory();
    if (cat === 'Todas') return all;
    return all.filter((p) => p.category === cat);
  }

  saveNewPetition(): void {
    if (!this.newTitle.trim()) return;
    this.storage.addPrayerPetition(this.newTitle, this.newDescription, this.newCategory);
    this.newTitle = '';
    this.newDescription = '';
    this.showNewPetitionForm.set(false);
  }

  toggleAnswered(petition: R07PrayerPetitionEntity): void {
    if (!petition.isAnswered) {
      const testimony = prompt('¡Gloria a Dios! Escribe un breve testimonio de cómo respondió el Señor (opcional):');
      this.storage.togglePrayerPetitionAnswered(petition.id, testimony || '');
    } else {
      this.storage.togglePrayerPetitionAnswered(petition.id);
    }
  }

  // Timer logic
  startPrayerTimer(): void {
    this.activePrayerStep.set(1);
    this.timerSeconds.set(150); // 2.5 min for step 1
    this.startTicker();
  }

  nextPrayerStep(): void {
    const current = this.activePrayerStep();
    if (current < 4) {
      this.activePrayerStep.set(current + 1);
      this.timerSeconds.set(150);
    } else {
      this.stopPrayerTimer();
      this.storage.showSnackbar('¡Tiempo de oración completado con éxito! Que la paz de Dios guarde tu corazón.');
    }
  }

  stopPrayerTimer(): void {
    this.activePrayerStep.set(0);
    this.timerSeconds.set(0);
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private startTicker(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds() > 0) {
        this.timerSeconds.update((s) => s - 1);
      }
    }, 1000);
  }

  formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1:
        return 'Adoración & Alabanza';
      case 2:
        return 'Desahogo & Honestidad';
      case 3:
        return 'Petición con Fe';
      case 4:
        return 'Agradecimiento & Declaración';
      default:
        return '';
    }
  }

  getStepDuration(step: number): string {
    return '2:30 min sugeridos';
  }

  getStepDescription(step: number): string {
    switch (step) {
      case 1:
        return 'Alaba a Dios por quién es Él: Su santidad, Su amor incondicional, Su soberanía y Su poder en tu vida.';
      case 2:
        return 'Derrama tu corazón sin máscaras delante de tu Padre celestial: confiesa tus debilidades, miedos y emociones.';
      case 3:
        return 'Presenta tus necesidades, tus metas y las vidas de otros con fe firme en el nombre de Jesús.';
      case 4:
        return 'Da gracias por la respuesta antes de verla, descansando en Sus promesas y sellando tu paz.';
      default:
        return '';
    }
  }

  // Church attendance handlers
  onPrayer1Toggle(val: boolean): void {
    if (this.currentWeek) {
      this.storage.updateChurchPrayerAttendance(
        this.currentWeek.id,
        val,
        this.currentWeek.prayerDay1Date,
        this.currentWeek.prayerDay1Notes,
        this.currentWeek.prayerDay1AbsenceReason,
        this.currentWeek.attendedPrayerDay2,
        this.currentWeek.prayerDay2Date,
        this.currentWeek.prayerDay2Notes,
        this.currentWeek.prayerDay2AbsenceReason
      );
    }
  }

  onPrayer1NotesBlur(e: Event): void {
    const val = (e.target as HTMLTextAreaElement).value;
    if (this.currentWeek) {
      this.storage.updateChurchPrayerAttendance(
        this.currentWeek.id,
        this.currentWeek.attendedPrayerDay1,
        this.currentWeek.prayerDay1Date,
        val,
        this.currentWeek.prayerDay1AbsenceReason,
        this.currentWeek.attendedPrayerDay2,
        this.currentWeek.prayerDay2Date,
        this.currentWeek.prayerDay2Notes,
        this.currentWeek.prayerDay2AbsenceReason
      );
    }
  }

  onPrayer2Toggle(val: boolean): void {
    if (this.currentWeek) {
      this.storage.updateChurchPrayerAttendance(
        this.currentWeek.id,
        this.currentWeek.attendedPrayerDay1,
        this.currentWeek.prayerDay1Date,
        this.currentWeek.prayerDay1Notes,
        this.currentWeek.prayerDay1AbsenceReason,
        val,
        this.currentWeek.prayerDay2Date,
        this.currentWeek.prayerDay2Notes,
        this.currentWeek.prayerDay2AbsenceReason
      );
    }
  }

  onPrayer2NotesBlur(e: Event): void {
    const val = (e.target as HTMLTextAreaElement).value;
    if (this.currentWeek) {
      this.storage.updateChurchPrayerAttendance(
        this.currentWeek.id,
        this.currentWeek.attendedPrayerDay1,
        this.currentWeek.prayerDay1Date,
        this.currentWeek.prayerDay1Notes,
        this.currentWeek.prayerDay1AbsenceReason,
        this.currentWeek.attendedPrayerDay2,
        this.currentWeek.prayerDay2Date,
        val,
        this.currentWeek.prayerDay2AbsenceReason
      );
    }
  }

  onGroupToggle(val: boolean): void {
    if (this.currentWeek) {
      this.storage.updateConnectionGroupInfo(
        this.currentWeek.id,
        val,
        this.currentWeek.groupLearnings,
        this.currentWeek.groupTopics,
        this.currentWeek.groupFeelings,
        this.currentWeek.groupAbsenceReason
      );
    }
  }

  onGroupLearningsBlur(e: Event): void {
    const val = (e.target as HTMLTextAreaElement).value;
    if (this.currentWeek) {
      this.storage.updateConnectionGroupInfo(
        this.currentWeek.id,
        this.currentWeek.attendedGroup,
        val,
        this.currentWeek.groupTopics,
        this.currentWeek.groupFeelings,
        this.currentWeek.groupAbsenceReason
      );
    }
  }

  onGroupTopicsBlur(e: Event): void {
    const val = (e.target as HTMLTextAreaElement).value;
    if (this.currentWeek) {
      this.storage.updateConnectionGroupInfo(
        this.currentWeek.id,
        this.currentWeek.attendedGroup,
        this.currentWeek.groupLearnings,
        val,
        this.currentWeek.groupFeelings,
        this.currentWeek.groupAbsenceReason
      );
    }
  }
}
