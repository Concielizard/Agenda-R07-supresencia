import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { GeminiService, DevotionalAiResult } from '../../services/gemini.service';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-ai-devotional-modal',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div class="rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slideUp transition-colors duration-300 {{ storage.fontClass() }}"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        
        <!-- Pull handle for mobile -->
        <div class="sm:hidden w-12 h-1.5 rounded-full mx-auto my-2 opacity-30 bg-current"></div>

        <!-- Header -->
        <div class="px-6 py-4 flex items-center justify-between border-b"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs"
                 [style.backgroundColor]="colors.primary">
              <span class="material-icons text-base">auto_awesome</span>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Asistente Devocional con IA</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Genera análisis espiritual, Palabra viva y aplicación pastoral
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
        <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-none">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider mb-1.5"
                   [style.color]="colors.primary">
              Pasaje Bíblico o Tema a Meditar
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                [formControl]="passageControl"
                placeholder="Ej. Juan 15:1-8 o 'Paz en medio de la prueba'..."
                class="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.background"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
              <button
                type="button"
                (click)="generate()"
                [disabled]="gemini.isGenerating()"
                class="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                [style.backgroundColor]="colors.primary">
                <span class="material-icons text-sm">{{ gemini.isGenerating() ? 'sync' : 'auto_awesome' }}</span>
                <span>{{ gemini.isGenerating() ? 'Generando...' : 'Generar' }}</span>
              </button>
            </div>
          </div>

          @if (result()) {
            <div class="rounded-2xl p-4 border space-y-3.5 text-xs animate-fadeSlideUp"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <div>
                <h4 class="font-bold uppercase tracking-wider text-[11px] mb-1" [style.color]="colors.primary">
                  1. Palabra Viva (Lo que Dios te habló):
                </h4>
                <p class="italic p-3 rounded-xl font-serif text-sm border leading-relaxed"
                   [style.backgroundColor]="colors.surface"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.textPrimary">
                  «{{ result()?.rhema }}»
                </p>
              </div>

              <div>
                <h4 class="font-bold uppercase tracking-wider text-[11px] mb-1" [style.color]="colors.primary">
                  2. Reflexión Teológica:
                </h4>
                <p class="leading-relaxed" [style.color]="colors.textSecondary">{{ result()?.reflection }}</p>
              </div>

              <div>
                <h4 class="font-bold uppercase tracking-wider text-[11px] mb-1" [style.color]="colors.primary">
                  3. Aplicación Práctica:
                </h4>
                <p class="leading-relaxed" [style.color]="colors.textSecondary">{{ result()?.application }}</p>
              </div>

              <div>
                <h4 class="font-bold uppercase tracking-wider text-[11px] mb-1" [style.color]="colors.primary">
                  4. Oración y Declaración:
                </h4>
                <p class="leading-relaxed" [style.color]="colors.textSecondary">{{ result()?.prayerSummary }}</p>
                <div class="mt-2 p-2.5 rounded-xl font-semibold border"
                     [style.backgroundColor]="colors.surface"
                     [style.borderColor]="colors.border"
                     [style.color]="colors.primary">
                  Declaración: «{{ result()?.dailyAffirmation }}»
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-between"
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

          @if (result()) {
            <button
              type="button"
              (click)="applyToCurrentDay()"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer">
              <span class="material-icons text-sm">save_as</span>
              <span>Insertar en el Devocional de Hoy</span>
            </button>
          }
        </div>

      </div>
    </div>
  `
})
export class AiDevotionalModal {
  public gemini = inject(GeminiService);
  public storage = inject(R07StorageService);

  public close = output<void>();

  public passageControl = new FormControl('');
  public result = signal<DevotionalAiResult | null>(null);

  get colors() {
    return this.storage.currentThemeColors();
  }

  constructor() {
    const day = this.storage.currentDay();
    this.passageControl.setValue(`${day.bibleReading.book} ${day.bibleReading.chapter}:${day.bibleReading.verses}`);
  }

  public async generate(): Promise<void> {
    const query = this.passageControl.value?.trim() || 'Salmos 23';
    const profile = this.storage.userProfile();
    const day = this.storage.currentDay();
    const emotionContext = day.moodRating ? `Emoción seleccionada: nivel ${day.moodRating}/5. Reflexión previa: ${day.reflection || ''}` : '';
    
    const res = await this.gemini.generateDevotional(query, profile.genderTheme, emotionContext);
    this.result.set(res);
  }

  public applyToCurrentDay(): void {
    const res = this.result();
    if (!res) return;

    const query = this.passageControl.value?.trim() || '';
    
    // Parse book and chapter if user entered something like "Salmos 27" or "Proverbios 1:1"
    const match = query.match(/^([1-3]?\s?[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s*(\d+)?:?(\d+.*)?$/);
    const updates: any = {
      rhema: res.rhema,
      reflection: res.reflection,
      application: res.application,
      prayerSummary: res.prayerSummary,
      dailyAffirmation: res.dailyAffirmation,
      actionItem: res.actionItem
    };

    if (match && match[1]) {
      updates.bibleReading = {
        book: match[1].trim(),
        chapter: match[2] ? parseInt(match[2], 10) : 1,
        verses: match[3] ? match[3].trim() : '1-6'
      };
    }

    this.storage.updateCurrentDay(updates);
    this.storage.showSnackbar('¡Devocional aplicado exitosamente al día de hoy! 🕊️');
    this.close.emit();
  }
}

