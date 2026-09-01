import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';

@Component({
  selector: 'app-r07-daily-affirmation',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-gradient-to-br from-amber-50 via-purple-50/40 to-stone-50 rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-xs mb-6 relative overflow-hidden">
      <!-- Background decorative glow -->
      <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-200/30 rounded-full blur-2xl pointer-events-none"></div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        
        <!-- Left: Verse & Declaration -->
        <div class="space-y-1.5 flex-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span class="material-icons text-xs text-amber-700">local_fire_department</span>
              Declaración del Día • {{ storage.currentDay().dayName }}
            </span>
            <span class="text-xs text-stone-500">
              Pasaje: <strong class="text-purple-900">{{ storage.currentDay().bibleReading.book }} {{ storage.currentDay().bibleReading.chapter }}:{{ storage.currentDay().bibleReading.verses }}</strong>
            </span>
          </div>

          <p class="text-stone-800 font-serif italic text-base sm:text-lg leading-snug">
            @if (storage.currentDay().dailyAffirmation) {
              "{{ storage.currentDay().dailyAffirmation }}"
            } @else {
              @if (storage.userProfile().genderTheme === 'female') {
                "Soy una mujer sabia, revestida de fortaleza y dignidad; mi boca habla con sabiduría y la ley de clemencia está en mi lengua." (Prov. 31:25)
              } @else if (storage.userProfile().genderTheme === 'male') {
                "Soy un hombre de fe e integridad, sacerdote de mi hogar; el Señor endereza mis pasos y me ciñe de poder." (Sal. 18:32)
              } @else {
                "El gozo del Señor es mi fortaleza. Todo lo puedo en Cristo que me fortalece hoy." (Fil. 4:13)
              }
            }
          </p>
          <p class="text-xs text-stone-600">
            Dedica este tiempo a solas con el Señor: lee con calma, escucha Su voz en el corazón y anota tu Rhema.
          </p>
        </div>

        <!-- Right: AI and Auxiliary Tools -->
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          
          <button
            type="button"
            (click)="openAiDevotional.emit()"
            class="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
            <span class="material-icons text-base text-amber-300">auto_awesome</span>
            <span>Comentar con IA</span>
          </button>

          <button
            type="button"
            (click)="openBibleReader.emit()"
            class="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
            <span class="material-icons text-base text-purple-700">menu_book</span>
            <span>Leer Pasaje</span>
          </button>

          <button
            type="button"
            (click)="openOcrModal.emit()"
            class="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
            <span class="material-icons text-base text-amber-600">document_scanner</span>
            <span class="hidden sm:inline">Escanear Foto</span>
          </button>

          <button
            type="button"
            (click)="openAiPrayer.emit()"
            class="px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
            <span class="material-icons text-base text-emerald-600">favorite</span>
            <span class="hidden sm:inline">Oración Guiada</span>
          </button>

        </div>

      </div>
    </div>
  `
})
export class R07DailyAffirmation {
  public storage = inject(R07StorageService);

  public openAiDevotional = output<void>();
  public openBibleReader = output<void>();
  public openOcrModal = output<void>();
  public openAiPrayer = output<void>();
}
