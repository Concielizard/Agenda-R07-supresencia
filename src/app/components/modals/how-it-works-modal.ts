import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-how-it-works-modal',
  imports: [CommonModule],
  template: `
    <div id="how-it-works-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="how-it-works-modal-panel" class="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
                 [style.backgroundColor]="colors.primary">
              💡
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight" [style.color]="colors.textPrimary">
                ¿Cómo funciona el Devocional R07?
              </h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Metodología "Pasa tiempo Conmigo" — Su Presencia
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

        <!-- Scrollable Guide Content -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
          
          <div class="p-4 rounded-xl border text-center space-y-1"
               [style.backgroundColor]="colors.primaryLight"
               [style.borderColor]="colors.border"
               [style.color]="colors.primary">
            <h4 class="font-bold text-sm">«Pasa tiempo Conmigo»</h4>
            <p class="text-xs italic">
              "El secreto de una vida victoriosa no está en hacer muchas cosas para Dios, sino en pasar tiempo a solas con Él."
            </p>
          </div>

          <div class="space-y-3">
            
            <!-- Step 1 -->
            <div class="p-3.5 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      [style.backgroundColor]="colors.primary">1</span>
                <h5 class="font-bold text-xs" [style.color]="colors.textPrimary">El Lugar Secreto & la Hora</h5>
              </div>
              <p [style.color]="colors.textSecondary">
                Busca un lugar sin distracciones y define una hora fija diaria (preferiblemente en la mañana). Apaga notificaciones y prepara tu corazón con adoración.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="p-3.5 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      [style.backgroundColor]="colors.primary">2</span>
                <h5 class="font-bold text-xs" [style.color]="colors.textPrimary">Lectura Bíblica Atenta</h5>
              </div>
              <p [style.color]="colors.textSecondary">
                Lee el capítulo o pasaje del día despacio. No leas por cumplir; lee buscando escuchar la voz de Dios. Pregúntate: ¿Qué me revela este pasaje sobre Dios?
              </p>
            </div>

            <!-- Step 3 -->
            <div class="p-3.5 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      [style.backgroundColor]="colors.primary">3</span>
                <h5 class="font-bold text-xs" [style.color]="colors.textPrimary">1. Lo que Dios me habló</h5>
              </div>
              <p [style.color]="colors.textSecondary">
                Anota el principio bíblico o la verdad eterna que el Espíritu Santo resaltó en tu lectura. Es la voz de Dios hablando directamente a tu espíritu.
              </p>
            </div>

            <!-- Step 4 -->
            <div class="p-3.5 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      [style.backgroundColor]="colors.primary">4</span>
                <h5 class="font-bold text-xs" [style.color]="colors.textPrimary">2. Describe tu R07 (Reflexión)</h5>
              </div>
              <p [style.color]="colors.textSecondary">
                Medita en cómo se aplica esa verdad a tu vida cotidiana, tus emociones, tus desafíos familiares, laborales o espirituales.
              </p>
            </div>

            <!-- Step 5 -->
            <div class="p-3.5 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      [style.backgroundColor]="colors.primary">5</span>
                <h5 class="font-bold text-xs" [style.color]="colors.textPrimary">3. Paso de Acción Concreto</h5>
              </div>
              <p [style.color]="colors.textSecondary">
                La fe sin obras es muerta. Escribe un compromiso práctico que vas a realizar en las próximas 24 horas en obediencia a lo que Dios te habló.
              </p>
            </div>

            <!-- Step 6 -->
            <div class="p-3.5 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      [style.backgroundColor]="colors.primary">6</span>
                <h5 class="font-bold text-xs" [style.color]="colors.textPrimary">4. Oración & Clamor</h5>
              </div>
              <p [style.color]="colors.textSecondary">
                Responde a Dios en oración. Derrama tu corazón usando el modelo de 4 pilares: Adoración, Honestidad sincera, Petición de fe y Gratitud.
              </p>
            </div>

            <!-- Step 7 -->
            <div class="p-3.5 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      [style.backgroundColor]="colors.primary">7</span>
                <h5 class="font-bold text-xs" [style.color]="colors.textPrimary">Rendición de Cuentas & Grupo</h5>
              </div>
              <p [style.color]="colors.textSecondary">
                Al terminar la semana, comparte tu hoja R07 en PDF o resumen por WhatsApp con tu líder de célula y hermanos de grupo de conexión para crecer juntos.
              </p>
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-4 border-t flex justify-end" [style.borderColor]="colors.border">
          <button
            type="button"
            (click)="onClose.emit()"
            class="text-xs font-bold px-5 py-2 rounded-xl text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            [style.backgroundColor]="colors.primary">
            ¡Entendido, a pasar tiempo con Dios!
          </button>
        </div>

      </div>
    </div>
  `
})
export class HowItWorksModal {
  storage = inject(R07StorageService);

  onClose = output<void>();

  get colors() {
    return this.storage.currentThemeColors();
  }
}
