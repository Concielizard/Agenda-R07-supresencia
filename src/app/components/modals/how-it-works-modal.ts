import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-how-it-works-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              ?
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">¿Qué es el Método R07 «Pasa tiempo Conmigo»?</h3>
              <p class="text-xs text-purple-200">Estructura bíblica y disciplinaria de intimidad con Dios</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-purple-200 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5 overflow-y-auto flex-1 text-xs text-stone-700 leading-relaxed">
          <div class="bg-purple-50 p-4 rounded-xl border border-purple-200 text-purple-950 space-y-1">
            <h4 class="font-bold text-sm">El Principio de la Intimidad Diaria (R07)</h4>
            <p>
              El método R07 es una disciplina espiritual de 7 días continuos diseñada para transformar tu comunión con Dios mediante la lectura bíblica reflexiva, la extracción de la palabra Rhema (voz viva de Dios) y pasos concretos de obediencia.
            </p>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-sm text-stone-900 uppercase tracking-wider">Los 4 Pasos del Devocional Diario:</h4>
            
            <div class="flex gap-3 items-start">
              <span class="w-6 h-6 rounded-full bg-purple-700 text-white flex items-center justify-center font-bold shrink-0 text-xs">1</span>
              <div>
                <strong class="text-stone-900 block">Lectura Bíblica Atenta</strong>
                <p>Lee 1 capítulo bíblico diario con un corazón humilde y abierto a ser enseñado.</p>
              </div>
            </div>

            <div class="flex gap-3 items-start">
              <span class="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 text-xs">2</span>
              <div>
                <strong class="text-stone-900 block">Extracción de la Palabra Rhema</strong>
                <p>Identifica el versículo o frase que impactó tu espíritu hoy: es la voz de Dios hablándote directamente.</p>
              </div>
            </div>

            <div class="flex gap-3 items-start">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs">3</span>
              <div>
                <strong class="text-stone-900 block">Aplicación y Acción Concreta</strong>
                <p>La fe sin obras está muerta. Define cómo vas a cambiar tu conducta o expresar amor hoy.</p>
              </div>
            </div>

            <div class="flex gap-3 items-start">
              <span class="w-6 h-6 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold shrink-0 text-xs">4</span>
              <div>
                <strong class="text-stone-900 block">Oración y Declaración Profética</strong>
                <p>Sella el tiempo en oración de gratitud y declara con tu boca la victoria en Cristo Jesús.</p>
              </div>
            </div>
          </div>

          <div class="border-t border-stone-200 pt-3">
            <h4 class="font-bold text-sm text-stone-900 mb-1">Rendición de Cuentas al Líder:</h4>
            <p>
              Al finalizar los 7 días, exporta tu agenda en PDF o genera el resumen de discipulado con IA para compartirlo con tu líder de célula o pastor.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button (click)="close.emit()" class="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition">
            ¡Entendido! Comenzar Devocional
          </button>
        </div>

      </div>
    </div>
  `
})
export class HowItWorksModal {
  public close = output<void>();
}
