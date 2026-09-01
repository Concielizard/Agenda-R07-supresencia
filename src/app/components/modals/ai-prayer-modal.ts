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
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center">
              <span class="material-icons text-sm">favorite</span>
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">Generador de Oración Guiada R07</h3>
              <p class="text-xs text-emerald-200">Oración de Adoración, Gratitud, Clamor y Declaración</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-emerald-200 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Motivo / Asunto de Oración
              </label>
              <input
                type="text"
                [formControl]="topicControl"
                placeholder="Ej. Paz en tiempos de aflicción, provisión de trabajo, salud de mi familia..."
                class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 text-stone-900 focus:ring-2 focus:ring-emerald-500">
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Tipo de Clamor
              </label>
              <select
                [formControl]="needTypeControl"
                class="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 text-stone-900 focus:ring-2 focus:ring-emerald-500">
                <option value="Gratitud y Adoración">Gratitud y Adoración</option>
                <option value="Sanidad Divina">Sanidad Divina</option>
                <option value="Guerra Espiritual">Guerra Espiritual</option>
                <option value="Provisión y Finanzas">Provisión y Finanzas</option>
                <option value="Restauración Familiar">Restauración Familiar</option>
                <option value="Dirección y Sabiduría">Dirección y Sabiduría</option>
              </select>
            </div>
          </div>

          <div class="text-right">
            <button
              type="button"
              (click)="generatePrayer()"
              [disabled]="gemini.isGenerating()"
              class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 ml-auto shadow-xs transition">
              <span class="material-icons text-sm">{{ gemini.isGenerating() ? 'sync' : 'auto_awesome' }}</span>
              <span>{{ gemini.isGenerating() ? 'Generando oración...' : 'Generar Oración Guiada' }}</span>
            </button>
          </div>

          @if (prayerResult()) {
            <div class="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/80 space-y-3 text-xs text-stone-800">
              <h4 class="font-bold text-emerald-950 font-serif text-sm border-b border-emerald-200 pb-1">
                {{ prayerResult()?.title }}
              </h4>

              <div>
                <strong class="text-purple-900 block mb-0.5">1. Adoración al Padre:</strong>
                <p class="leading-relaxed">{{ prayerResult()?.adoration }}</p>
              </div>

              <div>
                <strong class="text-blue-900 block mb-0.5">2. Limpieza y Gracia:</strong>
                <p class="leading-relaxed">{{ prayerResult()?.confessionAndGrace }}</p>
              </div>

              <div>
                <strong class="text-amber-900 block mb-0.5">3. Acción de Gracias:</strong>
                <p class="leading-relaxed">{{ prayerResult()?.thanksgiving }}</p>
              </div>

              <div>
                <strong class="text-emerald-900 block mb-0.5">4. Petición y Súplica:</strong>
                <p class="leading-relaxed">{{ prayerResult()?.supplication }}</p>
              </div>

              <div class="bg-white p-2.5 rounded-lg border border-emerald-200 font-serif italic text-emerald-950">
                <strong>Declaración Final:</strong> "{{ prayerResult()?.closingDeclaration }}"
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition">
            Cerrar
          </button>

          @if (prayerResult()) {
            <button
              (click)="insertIntoCurrentDay()"
              class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition">
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

    this.close.emit();
  }
}
