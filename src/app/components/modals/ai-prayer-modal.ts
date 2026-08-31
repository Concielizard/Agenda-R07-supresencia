import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../../services/r07-storage.service';
import { GeminiService } from '../../services/gemini.service';
import { AiGuidedPrayerResponse, R07DayEntryEntity } from '../../models/r07.models';

const QUICK_FEELINGS = [
  'Paz y descanso en Dios',
  'Ansiedad y afán por el futuro',
  'Gratitud por provisión y vida',
  'Cansancio y necesidad de fuerzas',
  'Dirección y sabiduría en decisiones',
  'Sanidad para mi familia',
  'Renovación espiritual y perdón'
];

@Component({
  selector: 'app-ai-prayer-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="ai-prayer-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="ai-prayer-modal-panel" class="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
                 [style.backgroundColor]="colors.primary">
              🙏
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight" [style.color]="colors.textPrimary">
                Generador de Oración Guiada con IA
              </h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Modelo de 4 pilares: Adoración, Desahogo, Petición y Agradecimiento
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="onClose.emit()"
            class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            ✕
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs">
          
          <!-- Input Form -->
          <div class="p-3.5 rounded-xl border space-y-3"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div>
              <label class="block font-bold text-[11px] mb-1.5" [style.color]="colors.textSecondary">
                ¿Qué siente tu corazón o qué situación estás viviendo hoy?
              </label>
              <input
                type="text"
                [(ngModel)]="feelingText"
                placeholder="Ej: Necesito paz ante una decisión laboral importante..."
                class="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>

            <!-- Quick Feeling Badges -->
            <div class="flex items-center gap-1.5 flex-wrap">
              @for (tag of quickTags; track tag) {
                <button
                  type="button"
                  (click)="feelingText = tag"
                  class="px-2.5 py-1 rounded-lg border text-[10px] font-medium hover:bg-black/5 cursor-pointer"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textSecondary">
                  {{ tag }}
                </button>
              }
            </div>

            <div class="flex justify-end pt-1">
              <button
                id="btn-generate-ai-prayer"
                type="button"
                [disabled]="isLoading()"
                (click)="generatePrayer()"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-bold shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
                [style.backgroundColor]="colors.primary">
                @if (isLoading()) {
                  <span class="inline-block animate-spin">⏳</span>
                  <span>Redactando oración...</span>
                } @else {
                  <span>✨</span>
                  <span>Generar Guía de Oración</span>
                }
              </button>
            </div>
          </div>

          <!-- Prayer Result Display -->
          @if (prayer()) {
            <div class="space-y-3 animate-in fade-in duration-300">
              
              <div class="p-4 rounded-xl border"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <h4 class="text-sm font-bold mb-1" [style.color]="colors.primary">
                  {{ prayer()!.title }}
                </h4>
                <p class="text-xs italic mb-3" [style.color]="colors.textSecondary">
                  {{ prayer()!.biblicalPromise }}
                </p>

                <!-- Full Prayer Text -->
                <div class="p-3.5 rounded-lg border bg-white/70 dark:bg-black/30 text-xs leading-relaxed font-serif text-justify"
                     [style.borderColor]="colors.border"
                     [style.color]="colors.textPrimary">
                  "{{ prayer()!.fullPrayerText }}"
                </div>
              </div>

              <!-- 4 Pillars Breakdown -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div class="p-3 rounded-lg border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="block font-bold text-[10px] uppercase text-emerald-700">1. Adoración</span>
                  <p class="text-[11px] mt-0.5" [style.color]="colors.textPrimary">{{ prayer()!.adoration }}</p>
                </div>

                <div class="p-3 rounded-lg border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="block font-bold text-[10px] uppercase text-purple-700">2. Desahogo</span>
                  <p class="text-[11px] mt-0.5" [style.color]="colors.textPrimary">{{ prayer()!.confessionAndHonesty }}</p>
                </div>

                <div class="p-3 rounded-lg border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="block font-bold text-[10px] uppercase text-blue-700">3. Petición</span>
                  <p class="text-[11px] mt-0.5" [style.color]="colors.textPrimary">{{ prayer()!.petitionAndFaith }}</p>
                </div>

                <div class="p-3 rounded-lg border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="block font-bold text-[10px] uppercase text-rose-700">4. Agradecimiento</span>
                  <p class="text-[11px] mt-0.5" [style.color]="colors.textPrimary">{{ prayer()!.gratitudeAndDeclaration }}</p>
                </div>
              </div>

            </div>
          }

        </div>

        <!-- Footer -->
        <div class="p-4 border-t flex items-center justify-between gap-3" [style.borderColor]="colors.border">
          <button
            type="button"
            (click)="onClose.emit()"
            class="text-xs px-3 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            Cerrar
          </button>

          @if (prayer()) {
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="copyPrayer()"
                class="text-xs font-semibold px-3 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
                Copiar Texto
              </button>
              <button
                id="btn-insert-prayer-into-day"
                type="button"
                (click)="insertIntoDay()"
                class="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                [style.backgroundColor]="colors.primary">
                <span>🙏</span>
                <span>Insertar en mi R07</span>
              </button>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class AiPrayerModal {
  storage = inject(R07StorageService);
  gemini = inject(GeminiService);

  targetDay = input<R07DayEntryEntity | null>(null);
  onClose = output<void>();
  onApplied = output<void>();

  feelingText = 'Paz y descanso en Dios';
  quickTags = QUICK_FEELINGS;
  isLoading = signal<boolean>(false);
  prayer = signal<AiGuidedPrayerResponse | null>(null);

  get colors() {
    return this.storage.currentThemeColors();
  }

  ngOnInit(): void {
    this.generatePrayer();
  }

  async generatePrayer(): Promise<void> {
    this.isLoading.set(true);
    const day = this.targetDay();
    const result = await this.gemini.generateGuidedPrayer(
      this.feelingText,
      day?.scriptureRef || '',
      this.storage.userName()
    );
    this.prayer.set(result);
    this.isLoading.set(false);
  }

  copyPrayer(): void {
    if (this.prayer() && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.prayer()!.fullPrayerText);
      this.storage.showSnackbar('Oración copiada al portapapeles.');
    }
  }

  insertIntoDay(): void {
    const day = this.targetDay();
    const p = this.prayer();
    if (!day || !p) return;

    const updated: R07DayEntryEntity = {
      ...day,
      prayerText: p.fullPrayerText,
      isCompleted: true
    };

    this.storage.updateDayEntry(updated);
    this.storage.showSnackbar('¡Oración guardada en tu devocional de hoy!');
    this.onApplied.emit();
    this.onClose.emit();
  }
}
