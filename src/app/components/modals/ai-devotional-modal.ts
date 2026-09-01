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
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center">
              <span class="material-icons text-sm">auto_awesome</span>
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">Asistente Devocional con IA (Gemini)</h3>
              <p class="text-xs text-purple-200">Genera análisis espiritual, palabra Rhema y aplicación práctica</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-purple-200 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Pasaje Bíblico o Tema a Meditar
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                [formControl]="passageControl"
                placeholder="Ej. Juan 15:1-8 o Filipenses 4:6-7 o 'Confianza en tiempos de prueba'"
                class="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 bg-stone-50 text-stone-900 focus:ring-2 focus:ring-purple-500">
              <button
                type="button"
                (click)="generate()"
                [disabled]="gemini.isGenerating()"
                class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition">
                <span class="material-icons text-sm">{{ gemini.isGenerating() ? 'sync' : 'sparkles' }}</span>
                <span>{{ gemini.isGenerating() ? 'Generando...' : 'Generar' }}</span>
              </button>
            </div>
          </div>

          @if (result()) {
            <div class="bg-purple-50/60 rounded-xl p-4 border border-purple-200/80 space-y-3.5 text-xs text-stone-800">
              <div>
                <h4 class="font-bold text-amber-900 uppercase tracking-wider text-[11px] mb-1">1. Palabra Rhema:</h4>
                <p class="italic bg-amber-100/50 p-2.5 rounded-lg border border-amber-200/60 text-stone-900 font-serif">
                  "{{ result()?.rhema }}"
                </p>
              </div>

              <div>
                <h4 class="font-bold text-purple-900 uppercase tracking-wider text-[11px] mb-1">2. Reflexión Teológica:</h4>
                <p class="leading-relaxed">{{ result()?.reflection }}</p>
              </div>

              <div>
                <h4 class="font-bold text-emerald-900 uppercase tracking-wider text-[11px] mb-1">3. Aplicación Práctica:</h4>
                <p class="leading-relaxed">{{ result()?.application }}</p>
              </div>

              <div>
                <h4 class="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-1">4. Oración y Declaración:</h4>
                <p class="leading-relaxed">{{ result()?.prayerSummary }}</p>
                <div class="mt-1.5 p-2 rounded bg-white text-purple-900 font-semibold border border-purple-100">
                  Declaración: "{{ result()?.dailyAffirmation }}"
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition">
            Cerrar
          </button>

          @if (result()) {
            <button
              (click)="applyToCurrentDay()"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition">
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

  constructor() {
    const day = this.storage.currentDay();
    this.passageControl.setValue(`${day.bibleReading.book} ${day.bibleReading.chapter}:${day.bibleReading.verses}`);
  }

  public async generate(): Promise<void> {
    const query = this.passageControl.value?.trim() || 'Salmos 23';
    const profile = this.storage.userProfile();
    const res = await this.gemini.generateDevotional(query, profile.genderTheme);
    this.result.set(res);
  }

  public applyToCurrentDay(): void {
    const res = this.result();
    if (!res) return;

    this.storage.updateCurrentDay({
      rhema: res.rhema,
      reflection: res.reflection,
      application: res.application,
      prayerSummary: res.prayerSummary,
      dailyAffirmation: res.dailyAffirmation,
      actionItem: res.actionItem
    });

    this.close.emit();
  }
}
