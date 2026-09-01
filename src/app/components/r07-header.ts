import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-r07-header',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-purple-800/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          <!-- Logo & Title -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/20 text-purple-950 font-extrabold text-xl tracking-tight">
                R07
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-lg sm:text-xl font-bold tracking-tight text-white font-serif">
                    Remix Agenda R07
                  </h1>
                  <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Pasa tiempo Conmigo
                  </span>
                </div>
                <p class="text-xs text-purple-200/80">
                  Semana {{ storage.currentWeek().weekNumber }} • {{ storage.currentWeek().startDate }} al {{ storage.currentWeek().endDate }}
                </p>
              </div>
            </div>

            <!-- Mobile Quick Profile Trigger -->
            <button
              type="button"
              (click)="openProfile.emit()"
              class="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-xs font-medium hover:bg-white/20 transition">
              <span class="material-icons text-base text-amber-300">account_circle</span>
              <span class="max-w-[90px] truncate">{{ storage.userProfile().displayName || 'Perfil' }}</span>
            </button>
          </div>

          <!-- Cloud Status & Progress -->
          <div class="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            
            <!-- Firebase Cloud Sync Status Badge -->
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/25 backdrop-blur-sm border border-white/10 text-xs">
              @if (firebase.syncState() === 'syncing') {
                <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span class="text-amber-200">Sincronizando nube...</span>
              } @else if (firebase.isSignedIn()) {
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="text-emerald-200 flex items-center gap-1">
                  <span class="material-icons text-xs">cloud_done</span> Conectado a Firebase
                </span>
              } @else {
                <span class="inline-block w-2 h-2 rounded-full bg-sky-400"></span>
                <span class="text-sky-200">Almacenamiento Local</span>
              }
            </div>

            <!-- Weekly Progress Pill -->
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs">
              <span class="text-purple-200">Progreso semanal:</span>
              <div class="w-16 h-2 bg-purple-950/60 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  [style.width.%]="storage.weeklyProgressPercentage()">
                </div>
              </div>
              <span class="font-bold text-amber-300">{{ storage.completedDaysCount() }}/7</span>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                (click)="openGuide.emit()"
                title="¿Cómo funciona el método R07?"
                class="p-2 rounded-lg bg-purple-800/60 hover:bg-purple-700 text-purple-200 hover:text-white transition flex items-center text-xs gap-1">
                <span class="material-icons text-base">help_outline</span>
                <span class="hidden xl:inline">Guía R07</span>
              </button>

              <button
                type="button"
                (click)="openNewWeek.emit()"
                class="px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-800/80 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-1.5 transition border border-purple-600/40">
                <span class="material-icons text-base text-amber-300">calendar_month</span>
                <span class="hidden sm:inline">Semanas</span>
              </button>

              <button
                type="button"
                (click)="openPdf.emit()"
                class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition">
                <span class="material-icons text-base">picture_as_pdf</span>
                <span>Descargar PDF</span>
              </button>

              <!-- Profile / Auth Desktop Button -->
              <button
                type="button"
                (click)="openProfile.emit()"
                class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition border border-white/10">
                @if (firebase.userPhotoUrl()) {
                  <img [src]="firebase.userPhotoUrl()" alt="Avatar" referrerpolicy="no-referrer" class="w-5 h-5 rounded-full object-cover border border-amber-300">
                } @else {
                  <span class="material-icons text-base text-amber-300">account_circle</span>
                }
                <span class="max-w-[110px] truncate">{{ storage.userProfile().displayName }}</span>
              </button>
            </div>

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
  public openGuide = output<void>();
  public openNewWeek = output<void>();
  public openPdf = output<void>();
}
