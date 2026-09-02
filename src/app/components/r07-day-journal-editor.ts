import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { BibleService, BIBLE_BOOKS } from '../services/bible.service';

@Component({
  selector: 'app-r07-day-journal-editor',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl border shadow-xs overflow-hidden mb-16 transition-colors duration-300 {{ storage.fontClass() }}"
         [style.backgroundColor]="colors.surface"
         [style.borderColor]="colors.border"
         [style.color]="colors.textPrimary">
      
      <!-- Card Top Bar: Day title & Completion status -->
      <div class="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
           [style.borderColor]="colors.border"
           [style.backgroundColor]="colors.card">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs"
               [style.backgroundColor]="colors.primary"
               style="color: #ffffff;">
            {{ storage.selectedDayIndex() + 1 }}
          </div>
          <div>
            <h3 class="text-base font-bold tracking-tight flex items-center gap-2">
              <span>{{ storage.currentDay().dayName }}</span>
              <span class="text-xs font-normal opacity-60">({{ storage.currentDay().date }})</span>
            </h3>
            <p class="text-xs" [style.color]="colors.textSecondary">
              Método R07: 4 Pasos Devocionales Diarios
            </p>
          </div>
        </div>

        <!-- Completion Toggle & Timer -->
        <div class="flex items-center gap-2">
          <!-- Time Spent Selector -->
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs"
               [style.borderColor]="colors.border"
               [style.backgroundColor]="colors.background">
            <span class="material-icons text-sm" [style.color]="colors.primary">timer</span>
            <select
              [formControl]="timeSpentControl"
              (change)="onTimeChange()"
              class="bg-transparent focus:outline-none text-xs cursor-pointer font-semibold"
              [style.color]="colors.textPrimary">
              <option value="15" class="text-stone-900">15 min</option>
              <option value="30" class="text-stone-900">30 min</option>
              <option value="45" class="text-stone-900">45 min</option>
              <option value="60" class="text-stone-900">60 min</option>
              <option value="90" class="text-stone-900">90 min</option>
            </select>
          </div>

          <!-- Mark Completed Button -->
          <button
            type="button"
            (click)="toggleCompleted()"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            [style.backgroundColor]="storage.currentDay().completed ? '#10B981' : colors.primaryLight"
            [style.color]="storage.currentDay().completed ? '#ffffff' : colors.primary"
            [style.border]="storage.currentDay().completed ? 'none' : '1px solid ' + colors.border">
            <span class="material-icons text-sm">
              {{ storage.currentDay().completed ? 'check_circle' : 'radio_button_unchecked' }}
            </span>
            <span>{{ storage.currentDay().completed ? 'Completado' : 'Marcar Hecho' }}</span>
          </button>
        </div>
      </div>

      <!-- Editor Form Body -->
      <form [formGroup]="journalForm" class="p-5 sm:p-6 space-y-5">
        
        <!-- SECTION 1: CITA BÍBLICA DEL DÍA -->
        <div class="rounded-2xl p-4 border"
             [style.backgroundColor]="colors.background"
             [style.borderColor]="colors.border">
          <div class="flex items-center justify-between mb-3">
            <label class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                   [style.color]="colors.primary">
              <span class="material-icons text-base">menu_book</span>
              1. Lectura Bíblica del Día
            </label>
            <span class="text-[11px]" [style.color]="colors.textMuted">¿Qué pasaje leíste hoy?</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Book Select -->
            <div>
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Libro</label>
              <select
                formControlName="book"
                (change)="onFieldChange()"
                class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.surface"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
                @for (b of bibleBooks; track b.name) {
                  <option [value]="b.name" class="text-stone-900">{{ b.name }} ({{ b.testament }})</option>
                }
              </select>
            </div>

            <!-- Chapter -->
            <div>
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Capítulo</label>
              <input
                type="number"
                min="1"
                max="150"
                formControlName="chapter"
                (input)="onFieldChange()"
                class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.surface"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>

            <!-- Verses -->
            <div>
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Versículos</label>
              <input
                type="text"
                formControlName="verses"
                (input)="onFieldChange()"
                placeholder="Ej. 1-6"
                class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.surface"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>
          </div>
        </div>

        <!-- SECTION 2: PALABRA RHEMA -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                   [style.color]="colors.primary">
              <span class="material-icons text-base text-amber-500">lightbulb</span>
              2. Palabra Rhema (Lo que Dios me habló)
            </label>
            <span class="text-[11px]" [style.color]="colors.textMuted">La frase o promesa viva que impactó tu espíritu</span>
          </div>
          <textarea
            rows="3"
            formControlName="rhema"
            (input)="onFieldChange()"
            placeholder="«El Señor me dijo hoy con poder: ...»"
            class="w-full p-3.5 text-xs sm:text-sm rounded-2xl border focus:outline-none focus:ring-2 leading-relaxed resize-none shadow-2xs"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary"></textarea>
        </div>

        <!-- SECTION 3: REFLEXIÓN Y MEDITACIÓN -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                   [style.color]="colors.primary">
              <span class="material-icons text-base">psychology</span>
              3. Reflexión y Meditación
            </label>
            <span class="text-[11px]" [style.color]="colors.textMuted">¿Qué significa este pasaje para tu caminar con Dios?</span>
          </div>
          <textarea
            rows="3"
            formControlName="reflection"
            (input)="onFieldChange()"
            placeholder="Medita en la lectura: lecciones espirituales, promesas para reclamar o áreas a corregir..."
            class="w-full p-3.5 text-xs sm:text-sm rounded-2xl border focus:outline-none focus:ring-2 leading-relaxed resize-none shadow-2xs"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary"></textarea>
        </div>

        <!-- SECTION 4: APLICACIÓN PRÁCTICA -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                   [style.color]="colors.primary">
              <span class="material-icons text-base text-emerald-500">task_alt</span>
              4. Aplicación Práctica a mi Vida
            </label>
            <span class="text-[11px]" [style.color]="colors.textMuted">Mi paso concreto de obediencia hoy</span>
          </div>
          <textarea
            rows="2"
            formControlName="application"
            (input)="onFieldChange()"
            placeholder="¿Qué actitud debo cambiar? ¿A quién debo perdonar o bendecir hoy?"
            class="w-full p-3.5 text-xs sm:text-sm rounded-2xl border focus:outline-none focus:ring-2 leading-relaxed resize-none shadow-2xs"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary"></textarea>
        </div>

        <!-- SECTION 5 & 6: ORACIÓN Y DECLARACIÓN -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Oración y Gratitud -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                   [style.color]="colors.primary">
              <span class="material-icons text-base text-rose-500">volunteer_activism</span>
              5. Oración y Clamor
            </label>
            <textarea
              rows="3"
              formControlName="prayerSummary"
              (input)="onFieldChange()"
              placeholder="Mi oración al Señor: gratitud, clamor y rendición..."
              class="w-full p-3 text-xs sm:text-sm rounded-2xl border focus:outline-none focus:ring-2 leading-relaxed resize-none shadow-2xs"
              [style.backgroundColor]="colors.background"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

          <!-- Declaración Profética -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                   [style.color]="colors.primary">
              <span class="material-icons text-base text-amber-500">record_voice_over</span>
              6. Declaración de Fe
            </label>
            <textarea
              rows="3"
              formControlName="dailyAffirmation"
              (input)="onFieldChange()"
              placeholder="Mi declaración de identidad (ej. 'Hoy camino en paz y gozo en Cristo')..."
              class="w-full p-3 text-xs sm:text-sm rounded-2xl border focus:outline-none focus:ring-2 leading-relaxed resize-none shadow-2xs"
              [style.backgroundColor]="colors.background"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

        </div>

        <!-- Auto-save notification pill -->
        <div class="pt-3 border-t flex items-center justify-between text-xs" [style.borderColor]="colors.border">
          <div class="flex items-center gap-1.5 font-medium" [style.color]="colors.textMuted">
            <span class="material-icons text-xs text-emerald-500">check_circle</span>
            <span>Guardado automáticamente</span>
          </div>
          <span class="font-bold text-[11px]" [style.color]="colors.primary">
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

  get colors() {
    return this.storage.currentThemeColors();
  }

  constructor() {
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

  public onFieldChange(): void {
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

