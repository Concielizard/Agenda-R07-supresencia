import { Component, ChangeDetectionStrategy, inject, signal, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../../services/r07-storage.service';

interface MoodOption {
  label: string;
  icon: string;
  rating: number;
  scripture: { book: string; chapter: number; text: string };
}

@Component({
  selector: 'app-heart-reflection-sheet',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div class="rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border overflow-hidden flex flex-col max-h-[88vh] transition-colors duration-300"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        
        <!-- Handle for mobile swipe hint -->
        <div class="pt-3 flex justify-center sm:hidden">
          <div class="w-10 h-1 rounded-full bg-stone-300 dark:bg-stone-700"></div>
        </div>

        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between"
             [style.borderColor]="colors.border">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.color]="colors.primary">
              💛
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">¿Qué hay en tu corazón hoy?</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Reflexión sincera y palabra de Dios para tu emoción
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="w-8 h-8 rounded-xl border flex items-center justify-center text-xs hover:opacity-80 transition cursor-pointer"
            [style.borderColor]="colors.border">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          <!-- Emotion / Heart State Selector -->
          <div class="space-y-2">
            <span class="font-bold uppercase tracking-wider text-[11px] block" [style.color]="colors.primary">
              ¿Cómo está tu corazón en esta mañana?
            </span>
            <div class="grid grid-cols-3 gap-2">
              @for (mood of moods; track mood.label) {
                <button
                  type="button"
                  (click)="selectMood(mood)"
                  class="p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition cursor-pointer hover:scale-105"
                  [style.backgroundColor]="selectedMoodLabel() === mood.label ? colors.primaryLight : colors.background"
                  [style.borderColor]="selectedMoodLabel() === mood.label ? colors.primary : colors.border">
                  <span class="text-xl">{{ mood.icon }}</span>
                  <span class="font-extrabold text-[11px]">{{ mood.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Suggested Biblical Comfort based on chosen emotion -->
          @if (currentMoodScripture()) {
            <div class="p-3.5 rounded-2xl border space-y-2 animate-fadeIn"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <div class="flex items-center justify-between">
                <span class="font-bold text-[10px] uppercase tracking-wider" [style.color]="colors.primary">
                  📖 Palabra de Dios para tu {{ selectedMoodLabel() }}
                </span>
                <span class="text-[10px] font-bold" [style.color]="colors.textSecondary">
                  {{ currentMoodScripture()!.book }} {{ currentMoodScripture()!.chapter }}
                </span>
              </div>
              <p class="italic text-xs font-serif leading-relaxed">
                «{{ currentMoodScripture()!.text }}»
              </p>
              <button
                type="button"
                (click)="applyScriptureToToday()"
                class="px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition hover:scale-105 cursor-pointer shadow-2xs"
                [style.backgroundColor]="colors.surface"
                [style.borderColor]="colors.border"
                [style.color]="colors.primary">
                <span class="material-icons text-xs">auto_stories</span>
                <span>Asignar este pasaje a mi Devocional de Hoy</span>
              </button>
            </div>
          }

          <!-- Free-form Heart Note -->
          <div class="space-y-1.5">
            <span class="font-bold uppercase tracking-wider text-[11px] block" [style.color]="colors.primary">
              Escribe libremente tus pensamientos o agradecimiento:
            </span>
            <textarea
              [(ngModel)]="reflectionText"
              rows="4"
              placeholder="«Señor, hoy vengo delante de Ti rindiendo mis preocupaciones, agradecido por Tu fidelidad...»"
              class="w-full p-3.5 rounded-2xl border text-xs sm:text-sm focus:outline-none focus:ring-2 resize-none shadow-xs leading-relaxed"
              [style.backgroundColor]="colors.background"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
            </textarea>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-between"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <button
            type="button"
            (click)="close.emit()"
            class="px-4 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
            [style.borderColor]="colors.border">
            Cancelar
          </button>

          <button
            type="button"
            (click)="saveHeartReflection()"
            class="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            [style.backgroundColor]="colors.primary">
            <span class="material-icons text-sm">favorite</span>
            <span>Guardar en Devocional</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class HeartReflectionSheet implements OnInit {
  public storage = inject(R07StorageService);
  public close = output<void>();

  public reflectionText: string = '';
  public selectedMoodLabel = signal<string>('Paz');
  public selectedMoodRating = signal<number>(5);
  public currentMoodScripture = signal<{ book: string; chapter: number; text: string } | null>(null);

  get colors() {
    return this.storage.currentThemeColors();
  }

  public moods: MoodOption[] = [
    { label: 'Paz', icon: '🕊️', rating: 5, scripture: { book: 'Juan', chapter: 14, text: 'La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo. (Juan 14:27)' } },
    { label: 'Gratitud', icon: '🙏', rating: 5, scripture: { book: 'Salmos', chapter: 103, text: 'Bendice, alma mía, a Jehová, y bendiga todo mi ser su santo nombre. Bendice, alma mía, a Jehová, y no olvides ninguno de sus beneficios. (Salmos 103:1-2)' } },
    { label: 'Esperanza', icon: '✨', rating: 5, scripture: { book: 'Jeremías', chapter: 29, text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis. (Jeremías 29:11)' } },
    { label: 'Ansiedad', icon: '🌧️', rating: 2, scripture: { book: 'Filipenses', chapter: 4, text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. (Filipenses 4:6)' } },
    { label: 'Cansancio', icon: '⏳', rating: 3, scripture: { book: 'Mateo', chapter: 11, text: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar. (Mateo 11:28)' } },
    { label: 'Gozo', icon: '🔥', rating: 5, scripture: { book: 'Nehemías', chapter: 8, text: 'No os entristezcáis, porque el gozo de Jehová es vuestra fuerza. (Nehemías 8:10)' } }
  ];

  ngOnInit(): void {
    const day = this.storage.currentDay();
    if (day) {
      this.reflectionText = day.reflection || '';
      const mood = this.moods.find(m => m.rating === (day.moodRating || 5)) || this.moods[0];
      this.selectMood(mood);
    } else {
      this.selectMood(this.moods[0]);
    }
  }

  public selectMood(mood: MoodOption): void {
    this.selectedMoodLabel.set(mood.label);
    this.selectedMoodRating.set(mood.rating);
    this.currentMoodScripture.set(mood.scripture);
  }

  public applyScriptureToToday(): void {
    const sc = this.currentMoodScripture();
    if (sc) {
      this.storage.updateCurrentDay({
        bibleReading: {
          book: sc.book,
          chapter: sc.chapter,
          verses: '1-6'
        },
        rhema: sc.text
      });
      this.storage.showSnackbar(`Pasaje de ${sc.book} ${sc.chapter} asignado a tu devocional de Hoy 📖`);
    }
  }

  public saveHeartReflection(): void {
    this.storage.updateCurrentDay({
      reflection: this.reflectionText,
      moodRating: this.selectedMoodRating()
    });
    this.storage.showSnackbar('Reflexión del corazón guardada en tu devocional ❤️');
    this.close.emit();
  }
}

