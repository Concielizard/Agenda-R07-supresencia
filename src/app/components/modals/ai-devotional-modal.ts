import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../../services/r07-storage.service';
import { GeminiService } from '../../services/gemini.service';
import { AiDevotionalInspiration, R07DayEntryEntity } from '../../models/r07.models';

@Component({
  selector: 'app-ai-devotional-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="ai-devotional-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="ai-devotional-modal-panel" class="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
                 [style.backgroundColor]="colors.primary">
              ✨
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight" [style.color]="colors.textPrimary">
                Inspiración Devocional R07 con IA
              </h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Guía pastoral para {{ targetDay()?.dayName || 'el día de hoy' }}
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

        <!-- Content Body (Scrollable) -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs">
          
          <!-- Parameters Input -->
          <div class="p-3.5 rounded-xl border space-y-2.5"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block font-bold text-[11px] mb-1" [style.color]="colors.textSecondary">
                  Cita Bíblica
                </label>
                <input
                  type="text"
                  [(ngModel)]="scriptureRef"
                  placeholder="Ej: Salmos 23:1-6"
                  class="w-full px-3 py-1.5 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>
              <div>
                <label class="block font-bold text-[11px] mb-1" [style.color]="colors.textSecondary">
                  Estado de ánimo
                </label>
                <input
                  type="text"
                  [(ngModel)]="mood"
                  placeholder="Ej: En Paz, Agradecida, Cansada..."
                  class="w-full px-3 py-1.5 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>
            </div>

            <div class="flex justify-end">
              <button
                id="btn-generate-ai-inspiration"
                type="button"
                [disabled]="isLoading()"
                (click)="generateInspiration()"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-bold shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
                [style.backgroundColor]="colors.primary">
                @if (isLoading()) {
                  <span class="inline-block animate-spin">⏳</span>
                  <span>Generando inspiración...</span>
                } @else {
                  <span>✨</span>
                  <span>Consultar Guía Pastoral IA</span>
                }
              </button>
            </div>
          </div>

          <!-- AI Results Display -->
          @if (inspiration()) {
            <div class="space-y-3.5 animate-in fade-in duration-300">
              
              <!-- 1. Mensaje Central -->
              <div class="p-4 rounded-xl border"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="font-bold text-[11px] uppercase tracking-wider" [style.color]="colors.primary">
                    1. Lo que Dios nos enseña (Principio)
                  </span>
                </div>
                <p class="text-xs leading-relaxed" [style.color]="colors.textPrimary">
                  {{ inspiration()!.mainMessage }}
                </p>
              </div>

              <!-- 2. Aplicación Práctica -->
              <div class="p-4 rounded-xl border"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="font-bold text-[11px] uppercase tracking-wider" [style.color]="colors.primary">
                    2. Paso de Acción & Fe para hoy
                  </span>
                </div>
                <p class="text-xs leading-relaxed" [style.color]="colors.textPrimary">
                  {{ inspiration()!.practicalApplication }}
                </p>
              </div>

              <!-- 3. Oración Guiada -->
              <div class="p-4 rounded-xl border"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <span class="font-bold text-[11px] uppercase tracking-wider" [style.color]="colors.primary">
                    3. Oración Íntima al Padre
                  </span>
                </div>
                <p class="text-xs italic leading-relaxed" [style.color]="colors.textPrimary">
                  "{{ inspiration()!.guidedPrayer }}"
                </p>
              </div>

              <!-- 4. Preguntas de Reflexión -->
              @if (inspiration()!.keyQuestions.length > 0) {
                <div class="p-4 rounded-xl border"
                     [style.backgroundColor]="colors.background"
                     [style.borderColor]="colors.border">
                  <div class="flex items-center gap-1.5 mb-1.5">
                    <span class="font-bold text-[11px] uppercase tracking-wider" [style.color]="colors.primary">
                      4. Preguntas para Meditar en el Silencio
                    </span>
                  </div>
                  <ul class="list-disc list-inside space-y-1 text-xs" [style.color]="colors.textPrimary">
                    @for (q of inspiration()!.keyQuestions; track q) {
                      <li>{{ q }}</li>
                    }
                  </ul>
                </div>
              }

            </div>
          }

        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t flex items-center justify-between gap-3" [style.borderColor]="colors.border">
          <button
            type="button"
            (click)="onClose.emit()"
            class="text-xs px-3 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            Cerrar
          </button>

          @if (inspiration()) {
            <button
              id="btn-apply-ai-to-day"
              type="button"
              (click)="applyToDay()"
              class="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="mat-icon text-sm">assignment_turned_in</span>
              <span>Aplicar al Devocional de Hoy</span>
            </button>
          }
        </div>

      </div>
    </div>
  `
})
export class AiDevotionalModal {
  storage = inject(R07StorageService);
  gemini = inject(GeminiService);

  targetDay = input<R07DayEntryEntity | null>(null);
  onClose = output<void>();
  onApplied = output<void>();

  scriptureRef = '';
  mood = '';
  isLoading = signal<boolean>(false);
  inspiration = signal<AiDevotionalInspiration | null>(null);

  get colors() {
    return this.storage.currentThemeColors();
  }

  ngOnInit(): void {
    const day = this.targetDay();
    if (day) {
      this.scriptureRef = day.scriptureRef || 'Salmos 23:1-6';
      this.mood = day.mood || (this.storage.edition() === 'MEN' ? 'Firme' : 'Agradecida');
      this.generateInspiration();
    }
  }

  async generateInspiration(): Promise<void> {
    this.isLoading.set(true);
    const day = this.targetDay();
    const result = await this.gemini.getDevotionalInspiration(
      this.scriptureRef,
      '',
      this.mood,
      day?.reflectionText || ''
    );
    this.inspiration.set(result);
    this.isLoading.set(false);
  }

  applyToDay(): void {
    const day = this.targetDay();
    const insp = this.inspiration();
    if (!day || !insp) return;

    const updated: R07DayEntryEntity = {
      ...day,
      scriptureRef: this.scriptureRef || day.scriptureRef,
      mood: this.mood || day.mood,
      godSpoke: insp.mainMessage,
      reflectionText: day.reflectionText ? `${day.reflectionText}\n\n${insp.mainMessage}` : insp.mainMessage,
      actionStep: insp.practicalApplication,
      prayerText: insp.guidedPrayer,
      isCompleted: true
    };

    this.storage.updateDayEntry(updated);
    this.storage.showSnackbar('¡Inspiración aplicada a tu devocional de hoy!');
    this.onApplied.emit();
    this.onClose.emit();
  }
}
