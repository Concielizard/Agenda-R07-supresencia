import { Component, ChangeDetectionStrategy, inject, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { R07StorageService } from '../../services/r07-storage.service';
import { GeminiService } from '../../services/gemini.service';
import {
  AppColorPalette,
  AppFontFamily,
  AppLogoSymbol,
  AppLogoTheme,
  AppThemeMode,
  AppEdition
} from '../../models/r07.models';

interface FontOption {
  id: AppFontFamily;
  name: string;
  cssClass: string;
  preview: string;
  desc: string;
}

interface PaletteOption {
  id: AppColorPalette;
  name: string;
  primaryHex: string;
  accentHex: string;
  editionLabel: string;
}

interface SymbolOption {
  id: AppLogoSymbol;
  name: string;
  icon: string;
  subtitle: string;
}

interface LogoThemeOption {
  id: AppLogoTheme;
  name: string;
  hex: string;
}

@Component({
  selector: 'app-user-profile-modal',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div class="rounded-3xl max-w-2xl w-full shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-300 {{ storage.fontClass() }}"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b flex items-center justify-between"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.color]="colors.primary">
              {{ storage.logoSymbolIcon() }}
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Personalización & Perfil</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Tipografías, paletas de color, símbolo R07, nube e IA
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

        <!-- Modal Navigation Tabs -->
        <div class="flex items-center gap-1.5 px-6 pt-3 border-b text-xs font-bold overflow-x-auto scrollbar-none"
             [style.borderColor]="colors.border">
          <button
            type="button"
            (click)="activeTab.set('theme')"
            class="pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            [style.borderColor]="activeTab() === 'theme' ? colors.primary : 'transparent'"
            [style.color]="activeTab() === 'theme' ? colors.primary : colors.textMuted">
            <span class="material-icons text-sm">palette</span>
            <span>Diseño & Colores</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('profile')"
            class="pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            [style.borderColor]="activeTab() === 'profile' ? colors.primary : 'transparent'"
            [style.color]="activeTab() === 'profile' ? colors.primary : colors.textMuted">
            <span class="material-icons text-sm">person</span>
            <span>Perfil & Iglesia</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('cloud')"
            class="pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            [style.borderColor]="activeTab() === 'cloud' ? colors.primary : 'transparent'"
            [style.color]="activeTab() === 'cloud' ? colors.primary : colors.textMuted">
            <span class="material-icons text-sm">cloud_sync</span>
            <span>Nube Firebase</span>
          </button>

          <button
            type="button"
            (click)="activeTab.set('ai')"
            class="pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            [style.borderColor]="activeTab() === 'ai' ? colors.primary : 'transparent'"
            [style.color]="activeTab() === 'ai' ? colors.primary : colors.textMuted">
            <span class="material-icons text-sm text-amber-500">auto_awesome</span>
            <span>Inteligencia Artificial</span>
          </button>
        </div>

        <!-- Body Content -->
        <div class="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          <!-- TAB 1: THEME & CUSTOMIZATION -->
          @if (activeTab() === 'theme') {
            <div class="space-y-6 animate-fadeIn">
              
              <!-- 0. EDICIÓN DEVOCIONAL (Mujer Proverbios 31 vs Hombre Valientes) -->
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs uppercase tracking-wider" [style.color]="colors.primary">
                    Edición Devocional R07
                  </span>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                        [style.backgroundColor]="storage.edition() === 'female' ? '#FCE7F3' : '#DBEAFE'"
                        [style.color]="storage.edition() === 'female' ? '#BE185D' : '#1D4ED8'">
                    {{ storage.edition() === 'female' ? '🌸 Edición Femenina' : '🛡️ Edición Masculina' }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    (click)="storage.setEdition('female')"
                    class="p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                    [style.backgroundColor]="storage.edition() === 'female' ? colors.primaryLight : colors.surface"
                    [style.borderColor]="storage.edition() === 'female' ? colors.primary : colors.border">
                    <span class="text-2xl">🌸</span>
                    <span class="font-extrabold text-xs">Mujer de Dios</span>
                    <span class="text-[10px] text-stone-400">Proverbios 31 • Sabiduría & Gracia</span>
                  </button>

                  <button
                    type="button"
                    (click)="storage.setEdition('male')"
                    class="p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                    [style.backgroundColor]="storage.edition() === 'male' ? colors.primaryLight : colors.surface"
                    [style.borderColor]="storage.edition() === 'male' ? colors.primary : colors.border">
                    <span class="text-2xl">🛡️</span>
                    <span class="font-extrabold text-xs">Hombre de Dios</span>
                    <span class="text-[10px] text-stone-400">Valientes • Sacerdote & Fortaleza</span>
                  </button>
                </div>
              </div>

              <!-- 1. MODO DE PANTALLA (Oscuro, Claro, Automático) -->
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs uppercase tracking-wider" [style.color]="colors.primary">
                    1. Modo de Pantalla
                  </span>
                  <span class="text-[10px]" [style.color]="colors.textMuted">
                    {{ storage.themeMode() === 'SYSTEM' ? '(Automático con el sistema)' : '' }}
                  </span>
                </div>

                <div class="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    (click)="storage.setThemeMode('LIGHT')"
                    class="p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                    [style.backgroundColor]="storage.themeMode() === 'LIGHT' ? colors.primaryLight : colors.surface"
                    [style.borderColor]="storage.themeMode() === 'LIGHT' ? colors.primary : colors.border">
                    <span class="material-icons text-lg text-amber-500">light_mode</span>
                    <span class="font-bold text-xs">Modo Claro</span>
                  </button>

                  <button
                    type="button"
                    (click)="storage.setThemeMode('DARK')"
                    class="p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                    [style.backgroundColor]="storage.themeMode() === 'DARK' ? colors.primaryLight : colors.surface"
                    [style.borderColor]="storage.themeMode() === 'DARK' ? colors.primary : colors.border">
                    <span class="material-icons text-lg text-indigo-400">dark_mode</span>
                    <span class="font-bold text-xs">Modo Oscuro</span>
                  </button>

                  <button
                    type="button"
                    (click)="storage.setThemeMode('SYSTEM')"
                    class="p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer"
                    [style.backgroundColor]="storage.themeMode() === 'SYSTEM' ? colors.primaryLight : colors.surface"
                    [style.borderColor]="storage.themeMode() === 'SYSTEM' ? colors.primary : colors.border">
                    <span class="material-icons text-lg text-teal-500">brightness_auto</span>
                    <span class="font-bold text-xs">Automático</span>
                  </button>
                </div>
              </div>

              <!-- 2. TIPOGRAFÍAS SELECCIONABLES (6 Tipografías) -->
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <span class="font-bold text-xs uppercase tracking-wider block" [style.color]="colors.primary">
                  2. Tipografía Editorial (6 Estilos)
                </span>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  @for (font of fontOptions; track font.id) {
                    <button
                      type="button"
                      (click)="storage.setFontFamily(font.id)"
                      class="p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between"
                      [style.backgroundColor]="storage.fontFamily() === font.id ? colors.primaryLight : colors.surface"
                      [style.borderColor]="storage.fontFamily() === font.id ? colors.primary : colors.border">
                      <div class="space-y-0.5">
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-xs">{{ font.name }}</span>
                          @if (storage.fontFamily() === font.id) {
                            <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-400 text-stone-900">Activo</span>
                          }
                        </div>
                        <p class="text-[11px] opacity-75 {{ font.cssClass }}">«{{ font.preview }}»</p>
                        <span class="text-[9px] block text-stone-400">{{ font.desc }}</span>
                      </div>
                      <span class="material-icons text-sm" [style.color]="storage.fontFamily() === font.id ? colors.primary : 'transparent'">check_circle</span>
                    </button>
                  }
                </div>
              </div>

              <!-- 3. PALETAS DE COLORES (7 Paletas) -->
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <span class="font-bold text-xs uppercase tracking-wider block" [style.color]="colors.primary">
                  3. Paleta de Colores (7 Opciones)
                </span>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  @for (pal of paletteOptions; track pal.id) {
                    <button
                      type="button"
                      (click)="storage.setPalette(pal.id)"
                      class="p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between"
                      [style.backgroundColor]="storage.colorPalette() === pal.id ? colors.primaryLight : colors.surface"
                      [style.borderColor]="storage.colorPalette() === pal.id ? colors.primary : colors.border">
                      <div class="flex items-center gap-3">
                        <div class="flex items-center -space-x-1.5 shrink-0">
                          <div class="w-5 h-5 rounded-full border-2 border-white shadow-xs" [style.backgroundColor]="pal.primaryHex"></div>
                          <div class="w-5 h-5 rounded-full border-2 border-white shadow-xs" [style.backgroundColor]="pal.accentHex"></div>
                        </div>
                        <div>
                          <span class="font-bold text-xs block">{{ pal.name }}</span>
                          <span class="text-[10px]" [style.color]="colors.textMuted">{{ pal.editionLabel }}</span>
                        </div>
                      </div>
                      <span class="material-icons text-sm" [style.color]="storage.colorPalette() === pal.id ? colors.primary : 'transparent'">check_circle</span>
                    </button>
                  }
                </div>
              </div>

              <!-- 4. SÍMBOLO & LOGOTIPO AGENDA R07 (8 Símbolos) -->
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <span class="font-bold text-xs uppercase tracking-wider block" [style.color]="colors.primary">
                  4. Símbolo Espiritual R07 (8 Isotipos)
                </span>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  @for (sym of symbolOptions; track sym.id) {
                    <button
                      type="button"
                      (click)="storage.setLogoSymbol(sym.id)"
                      class="p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1"
                      [style.backgroundColor]="storage.logoSymbol() === sym.id ? colors.primaryLight : colors.surface"
                      [style.borderColor]="storage.logoSymbol() === sym.id ? colors.primary : colors.border">
                      <span class="text-2xl">{{ sym.icon }}</span>
                      <span class="font-bold text-[11px] leading-tight block">{{ sym.name }}</span>
                    </button>
                  }
                </div>
              </div>

              <!-- 5. GAMA CROMÁTICA DEL LOGO (9 Gamas) -->
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <span class="font-bold text-xs uppercase tracking-wider block" [style.color]="colors.primary">
                  5. Gama Cromática del Logotipo (9 Tonos)
                </span>

                <div class="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  @for (logo of logoThemeOptions; track logo.id) {
                    <button
                      type="button"
                      (click)="storage.setLogoTheme(logo.id)"
                      class="p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer"
                      [style.backgroundColor]="storage.logoTheme() === logo.id ? colors.primaryLight : colors.surface"
                      [style.borderColor]="storage.logoTheme() === logo.id ? colors.primary : colors.border">
                      <div class="w-4 h-4 rounded-full shadow-xs shrink-0" [style.backgroundColor]="logo.hex"></div>
                      <span class="text-[10px] font-semibold truncate">{{ logo.name }}</span>
                    </button>
                  }
                </div>
              </div>

            </div>
          }

          <!-- TAB 2: PROFILE & CHURCH INFO -->
          @if (activeTab() === 'profile') {
            <form [formGroup]="profileForm" class="space-y-4 animate-fadeIn">
              
              <!-- Avatar Photo Upload Section -->
              <div class="p-4 rounded-2xl border flex items-center gap-4"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="relative w-16 h-16 rounded-2xl border-2 overflow-hidden flex items-center justify-center shrink-0 shadow-xs"
                     [style.borderColor]="colors.primary"
                     [style.backgroundColor]="colors.primaryLight">
                  @if (photoPreview()) {
                    <img [src]="photoPreview()" alt="Avatar" class="w-full h-full object-cover">
                  } @else {
                    <span class="text-2xl font-black" [style.color]="colors.primary">
                      {{ profileForm.get('displayName')?.value?.charAt(0)?.toUpperCase() || 'S' }}
                    </span>
                  }
                </div>

                <div class="flex-1 space-y-1.5">
                  <label class="block font-bold text-xs">Foto de Perfil</label>
                  <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition hover:opacity-80 cursor-pointer shadow-2xs"
                         [style.backgroundColor]="colors.surface"
                         [style.borderColor]="colors.border"
                         [style.color]="colors.primary">
                    <span class="material-icons text-sm">photo_camera</span>
                    <span>Cambiar Foto</span>
                    <input type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden">
                  </label>
                </div>
              </div>

              <div>
                <label class="block font-semibold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  formControlName="displayName"
                  class="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2"
                  [style.backgroundColor]="colors.surface"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

              <div>
                <label class="block font-semibold mb-1">Usuario / Handle</label>
                <input
                  type="text"
                  formControlName="handle"
                  placeholder="@janty_01"
                  class="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2"
                  [style.backgroundColor]="colors.surface"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block font-semibold mb-1">Iglesia</label>
                  <input
                    type="text"
                    formControlName="churchName"
                    placeholder="Su Presencia"
                    class="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2"
                    [style.backgroundColor]="colors.surface"
                    [style.borderColor]="colors.border"
                    [style.color]="colors.textPrimary">
                </div>

                <div>
                  <label class="block font-semibold mb-1">Grupo de Conexión / Célula</label>
                  <input
                    type="text"
                    formControlName="cellGroupName"
                    placeholder="Célula Gracia & Vida"
                    class="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2"
                    [style.backgroundColor]="colors.surface"
                    [style.borderColor]="colors.border"
                    [style.color]="colors.textPrimary">
                </div>
              </div>

              <div>
                <label class="block font-semibold mb-1">Líder de Célula / Discipulador</label>
                <input
                  type="text"
                  formControlName="leaderName"
                  placeholder="Pastor David"
                  class="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2"
                  [style.backgroundColor]="colors.surface"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

              <div>
                <label class="block font-semibold mb-1">Versículo Favorito / Lema Personal</label>
                <input
                  type="text"
                  formControlName="favoriteVerse"
                  placeholder="«El que comenzó en vosotros la buena obra, la perfeccionará» — Filipenses 1:6"
                  class="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2"
                  [style.backgroundColor]="colors.surface"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

            </form>
          }

          <!-- TAB 3: CLOUD SYNC & BACKUP -->
          @if (activeTab() === 'cloud') {
            <div class="space-y-4 animate-fadeIn">
              
              <!-- Backup Local JSON (Exportar / Importar) -->
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center justify-between">
                  <span class="font-bold uppercase tracking-wider text-[11px]" [style.color]="colors.primary">
                    💾 Copia de Seguridad Offline (Tus Datos Son Tuyos)
                  </span>
                </div>
                <p class="text-xs opacity-75 leading-relaxed">
                  Tus datos nunca se pierden. Puedes descargar un archivo con todas tus semanas, notas y devocionales o restaurarlo en cualquier momento.
                </p>

                <div class="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    (click)="exportBackupJson()"
                    class="p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition hover:scale-105 cursor-pointer shadow-xs"
                    [style.backgroundColor]="colors.surface"
                    [style.borderColor]="colors.border"
                    [style.color]="colors.primary">
                    <span class="material-icons text-sm">download</span>
                    <span>Exportar Respaldo</span>
                  </button>

                  <label class="p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition hover:scale-105 cursor-pointer shadow-xs"
                         [style.backgroundColor]="colors.surface"
                         [style.borderColor]="colors.border"
                         [style.color]="colors.textPrimary">
                    <span class="material-icons text-sm">upload_file</span>
                    <span>Restaurar Datos</span>
                    <input type="file" accept=".json" (change)="importBackupJson($event)" class="hidden">
                  </label>
                </div>
              </div>

              <!-- Firebase Status Card -->
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center justify-between">
                  <span class="font-bold uppercase tracking-wider text-[11px]" [style.color]="colors.primary">
                    Estado de Sincronización Firebase
                  </span>
                  <span class="flex items-center gap-1.5 text-[11px] font-semibold"
                        [class.text-emerald-500]="firebase.isSignedIn()"
                        [class.text-amber-500]="!firebase.isSignedIn()">
                    <span class="w-2 h-2 rounded-full" [class.bg-emerald-500]="firebase.isSignedIn()" [class.bg-amber-500]="!firebase.isSignedIn()"></span>
                    {{ firebase.isSignedIn() ? 'Conectado a la Nube' : 'Modo Offline / Local' }}
                  </span>
                </div>

                @if (firebase.isSignedIn()) {
                  <div class="space-y-3 pt-2">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-bold text-sm">{{ firebase.userDisplayName() }}</p>
                        <p class="text-xs" [style.color]="colors.textMuted">{{ firebase.userEmail() }}</p>
                      </div>
                      <button
                        type="button"
                        (click)="firebase.logout()"
                        class="px-3 py-1.5 rounded-xl border hover:opacity-80 text-xs font-semibold transition cursor-pointer"
                        [style.borderColor]="colors.border">
                        Cerrar Sesión
                      </button>
                    </div>

                    <button
                      type="button"
                      (click)="manualCloudSync()"
                      [disabled]="isSyncingCloud()"
                      class="w-full py-2.5 px-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-xs transition hover:opacity-90 cursor-pointer disabled:opacity-50"
                      [style.backgroundColor]="colors.primary">
                      <span class="material-icons text-sm" [class.animate-spin]="isSyncingCloud()">sync</span>
                      <span>{{ isSyncingCloud() ? 'Sincronizando con Firebase...' : 'Respaldar Todo en la Nube Ahora' }}</span>
                    </button>
                  </div>
                } @else {
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p class="text-xs" [style.color]="colors.textSecondary">
                      Inicia sesión con Google o tu correo para respaldar tus devocionales de 7 días en la nube automáticamente.
                    </p>
                    <button
                      type="button"
                      (click)="storage.openAuthModal()"
                      class="px-4 py-2.5 rounded-xl text-white font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-sm transition cursor-pointer"
                      [style.backgroundColor]="colors.primary">
                      <span class="material-icons text-sm">login</span>
                      <span>Iniciar Sesión / Crear Cuenta</span>
                    </button>
                  </div>
                }
              </div>

              <!-- Streak & Statistics -->
              <div class="grid grid-cols-2 gap-3">
                <div class="p-4 rounded-2xl border text-center"
                     [style.backgroundColor]="colors.background"
                     [style.borderColor]="colors.border">
                  <span class="text-2xl block mb-1">🔥</span>
                  <span class="text-xl font-bold block" [style.color]="colors.primary">{{ storage.consecutiveStreakDays() }} días</span>
                  <span class="text-[10px]" [style.color]="colors.textMuted">Racha de Hoy</span>
                </div>

                <div class="p-4 rounded-2xl border text-center"
                     [style.backgroundColor]="colors.background"
                     [style.borderColor]="colors.border">
                  <span class="text-2xl block mb-1">🏆</span>
                  <span class="text-xl font-bold block" [style.color]="colors.primary">{{ storage.longestStreak() }} días</span>
                  <span class="text-[10px]" [style.color]="colors.textMuted">Tu racha récord</span>
                </div>
              </div>

            </div>
          }

          <!-- TAB 4: IA GEMINI & ASISTENTE BÍBLICO -->
          @if (activeTab() === 'ai') {
            <div class="space-y-6 animate-fadeIn">
              <div class="p-4 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs bg-amber-100 text-amber-600">
                    <span class="material-icons text-lg">auto_awesome</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-sm">Clave de API Gemini (Google AI)</h4>
                    <p class="text-[11px]" [style.color]="colors.textSecondary">
                      Potencia el Asistente Bíblico, Oraciones Guiadas, Consejería y Reportes para tu Líder.
                    </p>
                  </div>
                </div>

                <div class="space-y-2.5 pt-2">
                  <label class="block text-[11px] font-bold" [style.color]="colors.textSecondary">
                    Tu API Key de Gemini:
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      [type]="showKey() ? 'text' : 'password'"
                      [(ngModel)]="geminiApiKey"
                      name="geminiApiKeyInput"
                      placeholder="Pega aquí tu clave (AQ.Ab8...)"
                      class="flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 font-medium"
                      [style.backgroundColor]="colors.surface"
                      [style.borderColor]="colors.border"
                      [style.color]="colors.textPrimary">
                    <button
                      type="button"
                      (click)="showKey.set(!showKey())"
                      class="p-2.5 rounded-xl border text-xs cursor-pointer hover:opacity-80 transition"
                      [style.borderColor]="colors.border"
                      [style.backgroundColor]="colors.surface"
                      title="Mostrar u ocultar clave">
                      <span class="material-icons text-sm">{{ showKey() ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>

                  <div class="flex items-center justify-between gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      (click)="saveGeminiKey()"
                      class="px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer"
                      [style.backgroundColor]="colors.primary">
                      <span class="material-icons text-sm">save</span>
                      <span>Guardar Clave</span>
                    </button>

                    <button
                      type="button"
                      (click)="testGeminiAi()"
                      [disabled]="isTestingAi()"
                      class="px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition hover:opacity-80 cursor-pointer disabled:opacity-50"
                      [style.borderColor]="colors.border"
                      [style.backgroundColor]="colors.surface"
                      [style.color]="colors.primary">
                      <span class="material-icons text-sm" [class.animate-spin]="isTestingAi()">smart_toy</span>
                      <span>{{ isTestingAi() ? 'Conectando con Gemini...' : 'Probar Conexión IA' }}</span>
                    </button>
                  </div>

                  @if (aiTestResult()) {
                    <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 mt-2 leading-relaxed">
                      {{ aiTestResult() }}
                    </div>
                  }
                </div>

                <div class="p-3 rounded-xl border text-[11px] space-y-1 mt-2"
                     [style.backgroundColor]="colors.surface"
                     [style.borderColor]="colors.border"
                     [style.color]="colors.textSecondary">
                  <div class="flex items-center gap-1.5 font-bold" [style.color]="colors.primary">
                    <span class="material-icons text-xs">security</span>
                    <span>Seguridad y Privacidad:</span>
                  </div>
                  <p>
                    Tu clave API se almacena de forma privada en el almacenamiento local de tu celular (localStorage). Nunca se sube a repositorios ni a servidores externos.
                  </p>
                </div>
              </div>
            </div>
          }

        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-between gap-2"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <!-- Destructive: Reset all local data -->
          <button
            type="button"
            (click)="confirmReset()"
            class="px-3 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer flex items-center gap-1 text-red-600 border-red-200"
            title="Borrar todos los datos locales y reiniciar el onboarding">
            <span class="material-icons text-sm">logout</span>
            <span>Restablecer</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
              [style.borderColor]="colors.border">
              Cerrar
            </button>

            <button
              type="button"
              (click)="saveAndClose()"
              class="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">check</span>
              <span>Guardar Preferencias</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class UserProfileModal implements OnInit {
  public firebase = inject(FirebaseService);
  public storage = inject(R07StorageService);
  public gemini = inject(GeminiService);
  public close = output<void>();

  public activeTab = signal<'theme' | 'profile' | 'cloud' | 'ai'>('theme');
  public showKey = signal<boolean>(false);
  public isTestingAi = signal<boolean>(false);
  public isSyncingCloud = signal<boolean>(false);
  public aiTestResult = signal<string | null>(null);
  public geminiApiKey: string = typeof localStorage !== 'undefined' ? (localStorage.getItem('gemini_api_key') || '') : '';

  get colors() {
    return this.storage.currentThemeColors();
  }

  public fontOptions: FontOption[] = [
    { id: 'STANDARD', name: 'Estándar', cssClass: 'font-standard', preview: 'Pasa tiempo Conmigo', desc: 'Plus Jakarta Sans (Moderna y legible)' },
    { id: 'EDITORIAL', name: 'Clásica editorial', cssClass: 'font-editorial', preview: 'Pasa tiempo Conmigo', desc: 'Playfair Display (Serif elegante)' },
    { id: 'BIBLICAL', name: 'Bíblica', cssClass: 'font-biblical', preview: 'PASA TIEMPO CONMIGO', desc: 'Cinzel (Solemne y sagrada)' },
    { id: 'MINIMALIST', name: 'Moderna minimalista', cssClass: 'font-minimalist', preview: 'Pasa tiempo Conmigo', desc: 'Outfit (Geométrica limpia)' },
    { id: 'DEVOTIONAL', name: 'Cálida y devocional', cssClass: 'font-devotional', preview: 'Pasa tiempo Conmigo', desc: 'Lora (Fluida y reflexiva)' },
    { id: 'HERMENEUTIC', name: 'Estudio hermenéutica', cssClass: 'font-hermeneutic', preview: 'Pasa tiempo Conmigo', desc: 'Newsreader (Profunda de estudio)' }
  ];

  public paletteOptions: PaletteOption[] = [
    { id: 'ROSE_PASTEL', name: 'Rosa pastel y crema', primaryHex: '#C25975', accentHex: '#DB2777', editionLabel: 'Edición Mujeres / Suave' },
    { id: 'ROYAL_BLUE', name: 'Azul rey y arena', primaryHex: '#1E40AF', accentHex: '#2563EB', editionLabel: 'Edición Hombres / Fortaleza' },
    { id: 'SAGE_OLIVE', name: 'Salvia y olivo paz', primaryHex: '#2E6F40', accentHex: '#38A169', editionLabel: 'Serenidad & Esperanza' },
    { id: 'CLASSIC_GOLD', name: 'Oro clásico y marfil', primaryHex: '#996515', accentHex: '#D97706', editionLabel: 'Dorado Real & Gloria' },
    { id: 'LAVENDER_LILY', name: 'Lavanda pastel y lirio', primaryHex: '#6D28D9', accentHex: '#7C3AED', editionLabel: 'Unción & Devoción' },
    { id: 'SKY_BREEZE', name: 'Celeste cielo y brisa', primaryHex: '#0284C7', accentHex: '#38BDF8', editionLabel: 'Calma & Éter Celestial' },
    { id: 'TERRACOTTA_CANE', name: 'Terracota y caña', primaryHex: '#C2410C', accentHex: '#EA580C', editionLabel: 'Fuego del Altar' }
  ];

  public symbolOptions: SymbolOption[] = [
    { id: 'DOVE_CROSS', name: 'Paloma y Cruz', icon: '🕊️', subtitle: 'Espíritu Santo' },
    { id: 'LION_JUDAH', name: 'León de Judá', icon: '🦁', subtitle: 'Victoria & Poder' },
    { id: 'LIVING_WORD', name: 'Palabra Viva', icon: '📖', subtitle: 'Espada de Verdad' },
    { id: 'SHIELD_FAITH', name: 'Escudo de Fe', icon: '🛡️', subtitle: 'Protección Divina' },
    { id: 'CROWN_GLORY', name: 'Corona de Gloria', icon: '👑', subtitle: 'Reino Eterno' },
    { id: 'FLAME_SPIRIT', name: 'Fuego del Espíritu', icon: '🔥', subtitle: 'Avivamiento' },
    { id: 'HEART_GRACE', name: 'Corazón de Gracia', icon: '💖', subtitle: 'Amor & Gratitud' },
    { id: 'STAR_BETHLEHEM', name: 'Estrella de Belén', icon: '⭐', subtitle: 'Luz & Esperanza' }
  ];

  public logoThemeOptions: LogoThemeOption[] = [
    { id: 'DIVINE_GOLD', name: 'Dorado Divino', hex: '#D4AF37' },
    { id: 'COBALT_BLUE', name: 'Azul Cobalto', hex: '#1E40AF' },
    { id: 'AURORA_PINK', name: 'Rosa Aurora', hex: '#E11D48' },
    { id: 'SAGE_EMERALD', name: 'Esmeralda Salvia', hex: '#059669' },
    { id: 'SCARLET_FIRE', name: 'Fuego Carmesí', hex: '#DC2626' },
    { id: 'AMETHYST_PURPLE', name: 'Amatista Celestial', hex: '#7C3AED' },
    { id: 'ETHER_CYAN', name: 'Celeste Éter', hex: '#0284C7' },
    { id: 'TERRACOTTA_COPPER', name: 'Cobre Terracota', hex: '#C2410C' },
    { id: 'ONYX_GOLD', name: 'Negro Ónice & Oro', hex: '#292524' }
  ];

  public photoPreview = signal<string | null>(null);

  public profileForm = new FormGroup({
    displayName: new FormControl(''),
    handle: new FormControl(''),
    churchName: new FormControl(''),
    cellGroupName: new FormControl(''),
    leaderName: new FormControl(''),
    favoriteVerse: new FormControl('')
  });

  ngOnInit(): void {
    const prof = this.storage.userProfile();
    this.photoPreview.set(prof.photoUri || null);
    this.profileForm.patchValue({
      displayName: prof.displayName || 'Santiago',
      handle: prof.handle || '@janty_01',
      churchName: prof.churchName || 'Su Presencia',
      cellGroupName: prof.cellGroupName || 'Célula Gracia & Vida',
      leaderName: prof.leaderName || 'Pastor David',
      favoriteVerse: prof.favoriteVerse || '«El que comenzó en vosotros la buena obra, la perfeccionará» — Filipenses 1:6'
    });
  }

  public onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        this.photoPreview.set(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  public exportBackupJson(): void {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      userProfile: this.storage.userProfile(),
      weeks: this.storage.allWeeks(),
      currentWeekId: this.storage.currentWeekId(),
      palette: this.storage.colorPalette(),
      font: this.storage.fontFamily(),
      themeMode: this.storage.themeMode(),
      edition: this.storage.edition()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agenda_R07_Respaldo_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.storage.showSnackbar('¡Copia de seguridad descargada con éxito! 💾');
  }

  public importBackupJson(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && parsed.weeks && Array.isArray(parsed.weeks)) {
            this.storage.allWeeks.set(parsed.weeks);
            if (parsed.currentWeekId) this.storage.currentWeekId.set(parsed.currentWeekId);
            if (parsed.userProfile) this.storage.updateUserProfile(parsed.userProfile);
            if (parsed.palette) this.storage.setPalette(parsed.palette);
            if (parsed.font) this.storage.setFontFamily(parsed.font);
            if (parsed.edition) this.storage.setEdition(parsed.edition);
            this.storage.saveToLocalStorage();
            this.storage.showSnackbar('¡Respaldo restaurado exitosamente! 🎉');
            this.close.emit();
          } else {
            this.storage.showSnackbar('El archivo no contiene un formato de respaldo válido.');
          }
        } catch {
          this.storage.showSnackbar('Error al leer el archivo JSON de respaldo.');
        }
      };
      reader.readAsText(file);
    }
  }

  public saveAndClose(): void {
    const val = this.profileForm.value;
    this.storage.updateUserProfile({
      displayName: val.displayName || 'Santiago',
      handle: val.handle || '@janty_01',
      churchName: val.churchName || 'Su Presencia',
      cellGroupName: val.cellGroupName || 'Célula Gracia & Vida',
      leaderName: val.leaderName || 'Pastor David',
      favoriteVerse: val.favoriteVerse || '',
      photoUri: this.photoPreview() || undefined
    });
    this.storage.showSnackbar('Configuración y perfil guardados con éxito ✨');
    this.close.emit();
  }

  public confirmReset(): void {
    const confirmed = window.confirm(
      '⚠️ ¿Estás seguro? Esto borrará TODOS tus datos locales (semanas, diario, perfil) y reiniciará el R07 desde cero.\n\nEsta acción no se puede deshacer.'
    );
    if (confirmed) {
      this.close.emit(); // Close modal first
      this.storage.resetAllData();
    }
  }

  public saveGeminiKey(): void {
    if (!this.geminiApiKey.trim()) {
      this.storage.showSnackbar('Por favor ingresa una clave de API válida.');
      return;
    }
    this.gemini.setApiKey(this.geminiApiKey.trim());
    this.storage.showSnackbar('¡Clave de API Gemini guardada exitosamente! ✨');
  }

  public async testGeminiAi(): Promise<void> {
    this.isTestingAi.set(true);
    this.aiTestResult.set(null);
    try {
      if (this.geminiApiKey.trim()) {
        this.gemini.setApiKey(this.geminiApiKey.trim());
      }
      const res = await this.gemini.askBiblicalAssistant('Dame un versículo de fortaleza para hoy');
      this.aiTestResult.set(`✅ ¡Conexión exitosa con Gemini! Respuesta:\n\n«${res.text}»`);
    } catch (err: any) {
      this.aiTestResult.set(`❌ Error al conectar con Gemini: ${err.message || 'Verifica que tu clave API sea válida.'}`);
    } finally {
      this.isTestingAi.set(false);
    }
  }

  public async manualCloudSync(): Promise<void> {
    const uid = this.firebase.userUid();
    if (!uid) return;
    this.isSyncingCloud.set(true);
    try {
      await this.storage.syncWithCloud(uid, this.firebase.userDisplayName(), this.firebase.userEmail());
      this.storage.showSnackbar('¡Sincronización con la nube completada! ☁️');
    } catch (err: any) {
      this.storage.showSnackbar(`Error al sincronizar: ${err.message}`);
    } finally {
      this.isSyncingCloud.set(false);
    }
  }
}
