import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-how-it-works-modal',
  imports: [CommonModule],
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
              <span class="material-icons text-base">help_outline</span>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">¿Qué es el Método R07 «Pasa tiempo Conmigo»?</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Estructura bíblica de intimidad y crecimiento espiritual
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
        <div class="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs leading-relaxed scrollbar-none"
             [style.color]="colors.textPrimary">
          
          <div class="p-4 rounded-2xl border space-y-1.5"
               [style.backgroundColor]="colors.primaryLight"
               [style.borderColor]="colors.border">
            <h4 class="font-bold text-sm" [style.color]="colors.primary">
              El Principio de la Intimidad Diaria (R07)
            </h4>
            <p [style.color]="colors.textPrimary">
              El método R07 es una disciplina espiritual de 7 días continuos diseñada para transformar tu comunión con Dios mediante la lectura bíblica reflexiva, la extracción de la Palabra Viva (voz de Dios a tu corazón) y pasos concretos de obediencia diaria.
            </p>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-xs uppercase tracking-wider" [style.color]="colors.primary">
              Los 4 Pasos del Devocional Diario:
            </h4>
            
            <div class="flex gap-3 items-start p-3 rounded-2xl border"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <span class="w-7 h-7 rounded-xl text-white flex items-center justify-center font-bold shrink-0 text-xs"
                    [style.backgroundColor]="colors.primary">1</span>
              <div>
                <strong class="block text-xs mb-0.5">Lectura Bíblica Atenta</strong>
                <p [style.color]="colors.textSecondary">Lee 1 pasaje o capítulo bíblico diario con un corazón humilde y abierto a ser enseñado por el Espíritu Santo.</p>
              </div>
            </div>

            <div class="flex gap-3 items-start p-3 rounded-2xl border"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <span class="w-7 h-7 rounded-xl text-white flex items-center justify-center font-bold shrink-0 text-xs bg-amber-500">2</span>
              <div>
                <strong class="block text-xs mb-0.5">Extracción de la Palabra Viva</strong>
                <p [style.color]="colors.textSecondary">Identifica el versículo o frase que impactó tu espíritu hoy: es la voz viva de Dios hablándote directamente a tu situación.</p>
              </div>
            </div>

            <div class="flex gap-3 items-start p-3 rounded-2xl border"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <span class="w-7 h-7 rounded-xl text-white flex items-center justify-center font-bold shrink-0 text-xs bg-emerald-600">3</span>
              <div>
                <strong class="block text-xs mb-0.5">Aplicación y Acción Concreta</strong>
                <p [style.color]="colors.textSecondary">La fe sin obras es muerta. Define un paso concreto de obediencia: a quién perdonar, qué actitud cambiar o cómo bendecir hoy.</p>
              </div>
            </div>

            <div class="flex gap-3 items-start p-3 rounded-2xl border"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <span class="w-7 h-7 rounded-xl text-white flex items-center justify-center font-bold shrink-0 text-xs"
                    [style.backgroundColor]="colors.primary">4</span>
              <div>
                <strong class="block text-xs mb-0.5">Oración y Declaración Profética</strong>
                <p [style.color]="colors.textSecondary">Sella tu tiempo en oración de gratitud y declara con tu boca las promesas divinas para tu hogar y tu llamado.</p>
              </div>
            </div>
          </div>

          <div class="border-t pt-3" [style.borderColor]="colors.border">
            <h4 class="font-bold text-xs uppercase tracking-wider mb-1" [style.color]="colors.primary">
              Rendición de Cuentas al Líder:
            </h4>
            <p [style.color]="colors.textSecondary">
              Al finalizar los 7 días, exporta tu agenda en PDF membretado o genera el resumen con IA para compartirlo por WhatsApp con tu mentor o líder de célula Su Presencia.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex justify-end"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <button
            type="button"
            (click)="close.emit()"
            class="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition hover:opacity-90 shadow-xs cursor-pointer"
            [style.backgroundColor]="colors.primary">
            ¡Entendido! Comenzar Devocional
          </button>
        </div>

      </div>
    </div>
  `
})
export class HowItWorksModal {
  public storage = inject(R07StorageService);
  public close = output<void>();

  get colors() {
    return this.storage.currentThemeColors();
  }
}

