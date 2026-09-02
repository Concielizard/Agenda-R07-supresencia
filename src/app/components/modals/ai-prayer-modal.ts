import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { GeminiService, GuidedPrayerResult } from '../../services/gemini.service';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-ai-prayer-modal',
  imports: [CommonModule, ReactiveFormsModule],
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
              <span class="material-icons text-base">favorite</span>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Generador de Oración Guiada</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Adoración, Gratitud, Clamor y Declaración Profética
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
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold uppercase tracking-wider mb-1"
                     [style.color]="colors.primary">
                Motivo / Asunto de Oración
              </label>
              <input
                type="text"
                [formControl]="topicControl"
                placeholder="Ej. Paz en la aflicción, provisión, salud de mi familia..."
                class="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.background"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1"
                     [style.color]="colors.primary">
                Tipo de Clamor
              </label>
              <select
                [formControl]="needTypeControl"
                class="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.background"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
                <option value="Gratitud y Adoración" class="text-stone-900">Gratitud y Adoración</option>
                <option value="Sanidad Divina" class="text-stone-900">Sanidad Divina</option>
                <option value="Guerra Espiritual" class="text-stone-900">Guerra Espiritual</option>
                <option value="Provisión y Finanzas" class="text-stone-900">Provisión y Finanzas</option>
                <option value="Restauración Familiar" class="text-stone-900">Restauración Familiar</option>
                <option value="Dirección y Sabiduría" class="text-stone-900">Dirección y Sabiduría</option>
              </select>
            </div>
          </div>

          <div class="text-right">
            <button
              type="button"
              (click)="generatePrayer()"
              [disabled]="gemini.isGenerating()"
              class="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 ml-auto shadow-xs transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">{{ gemini.isGenerating() ? 'sync' : 'auto_awesome' }}</span>
              <span>{{ gemini.isGenerating() ? 'Generando oración...' : 'Generar Oración Guiada' }}</span>
            </button>
          </div>

          @if (prayerResult()) {
            <div class="rounded-2xl p-4 border space-y-3 text-xs animate-fadeSlideUp"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <h4 class="font-bold font-serif text-sm border-b pb-1.5"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.primary">
                {{ prayerResult()?.title }}
              </h4>

              <div>
                <strong class="block mb-0.5" [style.color]="colors.primary">1. Adoración al Padre:</strong>
                <p class="leading-relaxed" [style.color]="colors.textSecondary">{{ prayerResult()?.adoration }}</p>
              </div>

              <div>
                <strong class="block mb-0.5" [style.color]="colors.primary">2. Limpieza y Gracia:</strong>
                <p class="leading-relaxed" [style.color]="colors.textSecondary">{{ prayerResult()?.confessionAndGrace }}</p>
              </div>

              <div>
                <strong class="block mb-0.5" [style.color]="colors.primary">3. Acción de Gracias:</strong>
                <p class="leading-relaxed" [style.color]="colors.textSecondary">{{ prayerResult()?.thanksgiving }}</p>
              </div>

              <div>
                <strong class="block mb-0.5" [style.color]="colors.primary">4. Petición y Súplica:</strong>
                <p class="leading-relaxed" [style.color]="colors.textSecondary">{{ prayerResult()?.supplication }}</p>
              </div>

              <div class="p-3 rounded-xl border font-serif italic"
                   [style.backgroundColor]="colors.surface"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.primary">
                <strong>Declaración Final:</strong> «{{ prayerResult()?.closingDeclaration }}»
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

          @if (prayerResult()) {
            <button
              type="button"
              (click)="insertIntoCurrentDay()"
              class="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">save_as</span>
              <span>Guardar en Oración de Hoy</span>
            </button>
          }
        </div>

      </div>
    </div>
  `
})
export class AiPrayerModal {
  public gemini = inject(GeminiService);
  public storage = inject(R07StorageService);

  public close = output<void>();

  public topicControl = new FormControl('Paz, fortaleza y sabiduría en mi caminar con Cristo');
  public needTypeControl = new FormControl('Dirección y Sabiduría');
  public prayerResult = signal<GuidedPrayerResult | null>(null);

  get colors() {
    return this.storage.currentThemeColors();
  }

  public async generatePrayer(): Promise<void> {
    const topic = this.topicControl.value?.trim() || 'Sabiduría y paz';
    const needType = this.needTypeControl.value || 'Dirección';
    const res = await this.gemini.generateGuidedPrayer(topic, needType);
    this.prayerResult.set(res);
  }

  public insertIntoCurrentDay(): void {
    const res = this.prayerResult();
    if (!res) return;

    this.storage.updateCurrentDay({
      prayerSummary: `${res.adoration} ${res.supplication}`,
      dailyAffirmation: res.closingDeclaration
    });

    this.storage.showSnackbar('¡Oración guardada en tu devocional de hoy!');
    this.close.emit();
  }
}

