import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { BibleService, BIBLE_BOOKS } from '../services/bible.service';

@Component({
  selector: 'app-r07-day-journal-editor',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-stone-200/90 overflow-hidden mb-8">
      
      <!-- Card Top Bar: Day title & Completion status -->
      <div class="bg-gradient-to-r from-stone-900 via-purple-950 to-stone-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-sm shadow-xs">
            {{ storage.selectedDayIndex() + 1 }}
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold tracking-tight font-serif flex items-center gap-2">
              <span>{{ storage.currentDay().dayName }}</span>
              <span class="text-xs font-sans font-normal text-purple-300">({{ storage.currentDay().date }})</span>
            </h3>
            <p class="text-xs text-purple-200/80">
              Método R07: Lee, Medita, Escucha la Palabra Rhema y Aplica
            </p>
          </div>
        </div>

        <!-- Completion Toggle & Timer -->
        <div class="flex items-center gap-3">
          <!-- Time Spent Selector -->
          <div class="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg text-xs border border-white/10">
            <span class="material-icons text-sm text-amber-300">timer</span>
            <select
              [formControl]="timeSpentControl"
              (change)="onTimeChange()"
              class="bg-transparent text-white focus:outline-hidden text-xs cursor-pointer">
              <option value="15" class="text-stone-900">15 min</option>
              <option value="30" class="text-stone-900">30 min</option>
              <option value="45" class="text-stone-900">45 min</option>
              <option value="60" class="text-stone-900">60 min</option>
              <option value="90" class="text-stone-900">90 min+</option>
            </select>
          </div>

          <!-- Mark Completed Button -->
          <button
            type="button"
            (click)="toggleCompleted()"
            [class]="storage.currentDay().completed 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs' 
              : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition">
            <span class="material-icons text-sm">
              {{ storage.currentDay().completed ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <span>{{ storage.currentDay().completed ? 'Completado' : 'Marcar Hecho' }}</span>
          </button>
        </div>
      </div>

      <!-- Editor Form Body -->
      <form [formGroup]="journalForm" class="p-5 sm:p-6 space-y-6">
        
        <!-- SECTION 1: CITA BÍBLICA DEL DÍA -->
        <div class="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
          <div class="flex items-center justify-between mb-3">
            <label class="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <span class="material-icons text-base text-purple-700">menu_book</span>
              1. Lectura Bíblica del Día
            </label>
            <span class="text-[11px] text-stone-500">¿Qué libro y capítulo leíste hoy?</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Book Select -->
            <div>
              <label class="block text-[11px] font-semibold text-stone-600 mb-1">Libro de la Biblia</label>
              <select
                formControlName="book"
                (change)="onFieldBlur()"
                class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                @for (b of bibleBooks; track b.name) {
                  <option [value]="b.name">{{ b.name }} ({{ b.testament }})</option>
                }
              </select>
            </div>

            <!-- Chapter -->
            <div>
              <label class="block text-[11px] font-semibold text-stone-600 mb-1">Capítulo</label>
              <input
                type="number"
                min="1"
                max="150"
                formControlName="chapter"
                (blur)="onFieldBlur()"
                class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej. 15">
            </div>

            <!-- Verses -->
            <div>
              <label class="block text-[11px] font-semibold text-stone-600 mb-1">Versículos</label>
              <input
                type="text"
                formControlName="verses"
                (blur)="onFieldBlur()"
                class="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej. 1-8 o 5, 7-10">
            </div>
          </div>
        </div>

        <!-- SECTION 2: PALABRA RHEMA -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span class="material-icons text-base text-amber-600">lightbulb</span>
              2. Palabra Rhema (Lo que Dios me habló hoy)
            </label>
            <span class="text-[11px] text-stone-500">El versículo o frase clave que tocó tu espíritu</span>
          </div>
          <div class="relative">
            <textarea
              rows="3"
              formControlName="rhema"
              (blur)="onFieldBlur()"
              placeholder="Escribe la palabra viva que Dios trajo con poder a tu vida hoy..."
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-amber-300/80 bg-amber-50/30 text-stone-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition leading-relaxed"></textarea>
          </div>
        </div>

        <!-- SECTION 3: REFLEXIÓN Y MEDITACIÓN -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <span class="material-icons text-base text-purple-700">psychology</span>
              3. Reflexión y Meditación Personal
            </label>
            <span class="text-[11px] text-stone-500">¿Qué te enseña este pasaje sobre el carácter de Dios y tu vida?</span>
          </div>
          <textarea
            rows="3"
            formControlName="reflection"
            (blur)="onFieldBlur()"
            placeholder="Medita en la lectura: lecciones espirituales, promesas para reclamar o advertencias a cuidar..."
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition leading-relaxed"></textarea>
        </div>

        <!-- SECTION 4: APLICACIÓN PRÁCTICA -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <span class="material-icons text-base text-emerald-600">task_alt</span>
              4. Aplicación Práctica a mi Vida
            </label>
            <span class="text-[11px] text-stone-500">¿Cómo pongo en obra esta palabra en mi hogar, trabajo o ministerio?</span>
          </div>
          <textarea
            rows="2"
            formControlName="application"
            (blur)="onFieldBlur()"
            placeholder="¿Qué actitud debo cambiar? ¿A quién debo perdonar o bendecir hoy?"
            class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition leading-relaxed"></textarea>
        </div>

        <!-- SECTION 5 & 6: ORACIÓN Y DECLARACIÓN (2-COLUMN GRID) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Oración del Día -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <span class="material-icons text-base text-purple-600">volunteer_activism</span>
                5. Oración y Gratitud
              </label>
            </div>
            <textarea
              rows="3"
              formControlName="prayerSummary"
              (blur)="onFieldBlur()"
              placeholder="Mi oración al Señor: agradecimiento, rendición y petición sincera..."
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition leading-relaxed"></textarea>
          </div>

          <!-- Declaración Profética y Acción de Obediencia -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <span class="material-icons text-base text-amber-600">record_voice_over</span>
                6. Declaración y Acción de Fe
              </label>
            </div>
            <textarea
              rows="3"
              formControlName="dailyAffirmation"
              (blur)="onFieldBlur()"
              placeholder="Mi declaración profética del día (ej. 'Hoy camino en paz y ninguna arma forjada prosperará')..."
              class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition leading-relaxed"></textarea>
          </div>

        </div>

        <!-- Footer Notice -->
        <div class="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div class="flex items-center gap-1">
            <span class="material-icons text-xs text-emerald-600">verified</span>
            <span>Cambios guardados automáticamente en tu agenda y sincronizados</span>
          </div>
          <span class="font-medium text-purple-900">
            Día {{ storage.selectedDayIndex() + 1 }} de 7 • {{ storage.currentDay().dayName }}
          </span>
        </div>

      </form>
    </div>
  `
})
export class R07DayJournalEditor {
  public storage = inject(R07StorageService);
  public bible = inject(BibleService);

  public bibleBooks = BIBLE_BOOKS;

  public journalForm = new FormGroup({
    book: new FormControl('Salmos'),
    chapter: new FormControl(23),
    verses: new FormControl('1-6'),
    rhema: new FormControl(''),
    reflection: new FormControl(''),
    application: new FormControl(''),
    prayerSummary: new FormControl(''),
    dailyAffirmation: new FormControl(''),
    actionItem: new FormControl('')
  });

  public timeSpentControl = new FormControl(30);

  constructor() {
    // Populate form whenever the selected day changes
    effect(() => {
      const day = this.storage.currentDay();
      if (day) {
        this.journalForm.patchValue({
          book: day.bibleReading?.book || 'Salmos',
          chapter: day.bibleReading?.chapter || 1,
          verses: day.bibleReading?.verses || '1-6',
          rhema: day.rhema || '',
          reflection: day.reflection || '',
          application: day.application || '',
          prayerSummary: day.prayerSummary || '',
          dailyAffirmation: day.dailyAffirmation || '',
          actionItem: day.actionItem || ''
        }, { emitEvent: false });

        this.timeSpentControl.setValue(day.timeSpentMinutes || 30, { emitEvent: false });
      }
    });
  }

  public onFieldBlur(): void {
    const val = this.journalForm.value;
    this.storage.updateCurrentDay({
      bibleReading: {
        book: val.book || 'Salmos',
        chapter: Number(val.chapter) || 1,
        verses: val.verses || '1-6'
      },
      rhema: val.rhema || '',
      reflection: val.reflection || '',
      application: val.application || '',
      prayerSummary: val.prayerSummary || '',
      dailyAffirmation: val.dailyAffirmation || '',
      actionItem: val.actionItem || ''
    });
  }

  public onTimeChange(): void {
    const minutes = Number(this.timeSpentControl.value) || 30;
    this.storage.updateCurrentDay({ timeSpentMinutes: minutes });
  }

  public toggleCompleted(): void {
    const current = this.storage.currentDay().completed;
    this.storage.updateCurrentDay({ completed: !current });
  }
}
