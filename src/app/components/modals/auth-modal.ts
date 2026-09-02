import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-auth-modal',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div class="rounded-3xl max-w-md w-full shadow-2xl border overflow-hidden flex flex-col transition-colors duration-300 {{ storage.fontClass() }}"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        
        <!-- Header -->
        <div class="px-6 py-5 border-b flex items-center justify-between"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.color]="colors.primary">
              {{ storage.logoSymbolIcon() }}
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Cuenta & Sincronización</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                {{ isRegisterMode() ? 'Crea tu cuenta devocional' : 'Accede a tu agenda R07' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="w-8 h-8 rounded-xl border flex items-center justify-center text-xs hover:opacity-80 transition cursor-pointer"
            [style.borderColor]="colors.border">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 text-xs">
          
          <!-- Feedback Message -->
          @if (errorMessage()) {
            <div class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] leading-relaxed">
              {{ errorMessage() }}
            </div>
          }

          @if (successMessage()) {
            <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
              {{ successMessage() }}
            </div>
          }

          <!-- Google Sign-In Button -->
          <button
            type="button"
            (click)="handleGoogleLogin()"
            [disabled]="isLoading()"
            class="w-full py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2.5 transition hover:scale-[1.01] cursor-pointer shadow-xs disabled:opacity-50"
            [style.backgroundColor]="colors.background"
            [style.borderColor]="colors.border"
            [style.color]="colors.textPrimary">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>

          <div class="flex items-center gap-3 py-1">
            <div class="h-px flex-1 border-t" [style.borderColor]="colors.border"></div>
            <span class="text-[10px] uppercase tracking-wider font-semibold" [style.color]="colors.textMuted">O con tu correo</span>
            <div class="h-px flex-1 border-t" [style.borderColor]="colors.border"></div>
          </div>

          <!-- Email & Password Form -->
          <form (ngSubmit)="handleSubmit()" class="space-y-3">
            
            @if (isRegisterMode()) {
              <div>
                <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">
                  Tu Nombre
                </label>
                <input
                  type="text"
                  [(ngModel)]="name"
                  name="authName"
                  placeholder="Ej. Santiago Martínez"
                  class="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 font-medium"
                  [style.backgroundColor]="colors.background"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>
            }

            <div>
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">
                Correo Electrónico
              </label>
              <input
                type="email"
                [(ngModel)]="email"
                name="authEmail"
                placeholder="tu@correo.com"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.background"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>

            <div>
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">
                Contraseña
              </label>
              <input
                type="password"
                [(ngModel)]="password"
                name="authPassword"
                placeholder="Mínimo 6 caracteres"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.background"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>

            <button
              type="submit"
              [disabled]="isLoading() || !email || !password"
              class="w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">{{ isRegisterMode() ? 'person_add' : 'login' }}</span>
              <span>{{ isLoading() ? 'Procesando...' : (isRegisterMode() ? 'Crear Cuenta y Respaldar' : 'Iniciar Sesión') }}</span>
            </button>
          </form>

          <!-- Toggle Login / Register -->
          <div class="text-center pt-2">
            <button
              type="button"
              (click)="isRegisterMode.set(!isRegisterMode()); errorMessage.set(null)"
              class="text-xs font-bold underline transition hover:opacity-80 cursor-pointer"
              [style.color]="colors.primary">
              {{ isRegisterMode() ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Aún no tienes cuenta? Regístrate aquí' }}
            </button>
          </div>

          <!-- Offline Mode Note -->
          <div class="p-3 rounded-2xl border text-[11px] flex items-center gap-2 mt-2"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border"
               [style.color]="colors.textSecondary">
            <span class="material-icons text-base text-emerald-500 shrink-0">offline_pin</span>
            <span>Tus datos devocionales están seguros en tu celular en todo momento. La cuenta te permite respaldar en la nube y sincronizar.</span>
          </div>

        </div>

      </div>
    </div>
  `
})
export class AuthModal {
  public firebase = inject(FirebaseService);
  public storage = inject(R07StorageService);

  public close = output<void>();

  public isRegisterMode = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);

  public name: string = '';
  public email: string = '';
  public password: string = '';

  get colors() {
    return this.storage.currentThemeColors();
  }

  public async handleGoogleLogin(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.firebase.loginWithGoogle();
      this.storage.showSnackbar('¡Sesión iniciada con Google! 🕊️');
      this.close.emit();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Error al iniciar con Google. Usa correo y contraseña.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public async handleSubmit(): Promise<void> {
    if (!this.email || !this.password) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (this.isRegisterMode()) {
        await this.firebase.registerWithEmail(this.email, this.password, this.name);
        this.storage.showSnackbar('¡Cuenta creada con éxito! Bienvenido/a.');
      } else {
        await this.firebase.loginWithEmail(this.email, this.password);
        this.storage.showSnackbar('¡Sesión iniciada correctamente!');
      }
      this.close.emit();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Ocurrió un error. Verifica tus datos.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
