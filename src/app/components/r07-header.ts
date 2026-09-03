import { Component, ChangeDetectionStrategy, inject, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-r07-header',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 safe-top-pad"
            [style.backgroundColor]="colors.surface + 'f2'"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 pt-2 pb-3">
        <div class="flex items-center justify-between gap-2.5">
          
          <!-- User Profile & Greeting -->
          <div class="flex items-center gap-2.5 group">
            <div class="relative cursor-pointer" (click)="openProfile.emit()" title="Ver perfil y personalización">
              <div class="w-11 h-11 rounded-2xl p-0.5 border-2 transition transform group-hover:scale-105 shadow-xs flex items-center justify-center overflow-hidden"
                   [style.borderColor]="storage.logoColorHex()"
                   [style.backgroundColor]="colors.primaryLight">
                @if (storage.userProfile().photoUri) {
                  <img [src]="storage.userProfile().photoUri" alt="Avatar" class="w-full h-full object-cover rounded-xl">
                } @else {
                  <div class="w-full h-full rounded-xl flex items-center justify-center font-extrabold text-sm text-white"
                       [style.backgroundColor]="colors.primary">
                    {{ storage.userProfile().displayName ? storage.userProfile().displayName.charAt(0).toUpperCase() : 'S' }}
                  </div>
                }
              </div>
              <!-- Small symbol badge -->
              <span class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center bg-white dark:bg-stone-900 shadow-xs border border-stone-200 dark:border-stone-700">
                {{ storage.logoSymbolIcon() }}
              </span>
            </div>

            <div class="flex flex-col">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-extrabold tracking-widest uppercase opacity-75"
                      [style.color]="storage.logoColorHex()">
                  {{ formattedDateText() }}
                </span>
              </div>

              <h2 class="text-sm sm:text-base font-extrabold tracking-tight">
                {{ greetingText() }}, {{ firstName() }}
              </h2>
            </div>
          </div>

          <!-- Right Status & Action Controls -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            
            <!-- Streak Flame Badge (🔥) -->
            <button
              type="button"
              (click)="openProfile.emit()"
              title="Tu racha devocional consecutiva"
              class="flex items-center gap-1 px-3 py-1.5 rounded-2xl border text-xs font-black transition hover:scale-105 cursor-pointer shadow-2xs"
              [style.backgroundColor]="colors.primaryLight"
              [style.borderColor]="colors.border"
              [style.color]="colors.primary">
              <span class="text-sm">🔥</span>
              <span>{{ storage.consecutiveStreakDays() }}</span>
              <span class="text-[10px] font-semibold opacity-60">días</span>
            </button>

            <!-- Notifications / Encouragement -->
            <button
              type="button"
              (click)="storage.showSnackbar('«Pasa tiempo Conmigo»: Dios renueva tus fuerzas en este día 🕊️')"
              title="Palabra de aliento"
              class="w-9 h-9 rounded-2xl border flex items-center justify-center transition hover:opacity-80 cursor-pointer"
              [style.borderColor]="colors.border"
              [style.backgroundColor]="colors.surface">
              <span class="material-icons text-base opacity-75">notifications_none</span>
            </button>

            <!-- Settings / Customizer Trigger -->
            <button
              type="button"
              (click)="openProfile.emit()"
              title="Personalización y temas"
              class="w-9 h-9 rounded-2xl border flex items-center justify-center transition hover:opacity-80 cursor-pointer"
              [style.borderColor]="colors.border"
              [style.backgroundColor]="colors.surface">
              <span class="material-icons text-base" [style.color]="colors.primary">tune</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  `
})
export class R07Header {
  public storage = inject(R07StorageService);
  public firebase = inject(FirebaseService);

  public openProfile = output<void>();
  public openHowItWorks = output<void>();
  public openPdfExport = output<void>();
  public openNewWeek = output<void>();

  get colors() {
    return this.storage.currentThemeColors();
  }

  public firstName = computed(() => {
    const name = this.storage.userProfile().displayName || 'Santiago';
    return name.split(' ')[0];
  });

  public greetingText = computed(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  public formattedDateText = computed(() => {
    const now = new Date();
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${days[now.getDay()]}, ${now.getDate()} DE ${months[now.getMonth()]}`;
  });
}
