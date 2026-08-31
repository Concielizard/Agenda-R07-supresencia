import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../../services/r07-storage.service';
import { AppColorPalette, AppEdition, AppFontFamily, AppLogoSymbol } from '../../models/r07.models';

const PALETTES_LIST: { id: AppColorPalette; name: string; hex: string }[] = [
  { id: 'WOMEN_PINK', name: 'Rosa Suave', hex: '#D86588' },
  { id: 'MEN_BLUE', name: 'Azul Profundo', hex: '#1E40AF' },
  { id: 'OLIVE_SAGE', name: 'Salvia Natural', hex: '#059669' },
  { id: 'ROYAL_GOLD', name: 'Oro Real', hex: '#D97706' },
  { id: 'LAVENDER_PASTEL', name: 'Lavanda Espiritual', hex: '#7C3AED' },
  { id: 'SKY_PASTEL', name: 'Celeste Celestial', hex: '#0284C7' },
  { id: 'TERRACOTTA', name: 'Terracota Fuego', hex: '#EA580C' }
];

const SYMBOLS_LIST: { id: AppLogoSymbol; name: string; emoji: string }[] = [
  { id: 'DOVE_CROSS', name: 'Paloma (Espíritu Santo)', emoji: '🕊️' },
  { id: 'LION_JUDAH', name: 'León de Judá', emoji: '🦁' },
  { id: 'OPEN_BIBLE', name: 'Biblia Abierta', emoji: '📖' },
  { id: 'SHIELD_FAITH', name: 'Escudo de la Fe', emoji: '🛡️' },
  { id: 'CROWN_GLORY', name: 'Corona de Gloria', emoji: '👑' },
  { id: 'FLAME_SPIRIT', name: 'Fuego Santo', emoji: '🔥' },
  { id: 'HEART_GRACE', name: 'Corazón Agradecido', emoji: '💖' },
  { id: 'STAR_HOPE', name: 'Estrella de la Mañana', emoji: '✨' }
];

const TYPOGRAPHIES_LIST: { id: AppFontFamily; name: string; preview: string }[] = [
  { id: 'SERIF', name: 'Editorial Serif (Elegante)', preview: 'Pasa tiempo Conmigo' },
  { id: 'DEFAULT', name: 'Minimalist Sans (Moderna)', preview: 'Pasa tiempo Conmigo' },
  { id: 'CURSIVE', name: 'Script Devocional (Cálida)', preview: 'Pasa tiempo Conmigo' },
  { id: 'MONOSPACE', name: 'Monospace (Estructurada)', preview: 'Pasa tiempo Conmigo' }
];

const AVATAR_EMOJIS = ['🌸', '⚔️', '🕊️', '🦁', '🌿', '✨', '👑', '📖', '🛡️', '☀️', '⛰️', '🌷'];

@Component({
  selector: 'app-user-profile-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="user-profile-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="user-profile-modal-panel" class="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
                 [style.backgroundColor]="colors.primary">
              ⚙️
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight" [style.color]="colors.textPrimary">
                Personalización & Perfil Devocional
              </h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Configura tu edición, temas, paletas, tipografías y datos de iglesia
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

        <!-- Scrollable Settings Body -->
        <div class="p-5 overflow-y-auto space-y-5 text-xs">
          
          <!-- 1. Edition Selector: Mujeres vs Hombres -->
          <div class="p-4 rounded-xl border space-y-3"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <label class="block font-bold text-xs uppercase tracking-wider" [style.color]="colors.primary">
              1. Edición de Agenda R07
            </label>

            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                (click)="storage.setEdition('WOMEN')"
                class="p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left"
                [style.backgroundColor]="storage.edition() === 'WOMEN' ? colors.primaryLight : 'transparent'"
                [style.borderColor]="storage.edition() === 'WOMEN' ? colors.primary : colors.border">
                <span class="text-2xl">🌸</span>
                <div>
                  <span class="font-bold block text-xs" [style.color]="colors.textPrimary">Edición Mujeres</span>
                  <span class="text-[10px]" [style.color]="colors.textSecondary">Paleta cálida, flores, promesas</span>
                </div>
              </button>

              <button
                type="button"
                (click)="storage.setEdition('MEN')"
                class="p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left"
                [style.backgroundColor]="storage.edition() === 'MEN' ? colors.primaryLight : 'transparent'"
                [style.borderColor]="storage.edition() === 'MEN' ? colors.primary : colors.border">
                <span class="text-2xl">⚔️</span>
                <div>
                  <span class="font-bold block text-xs" [style.color]="colors.textPrimary">Edición Hombres</span>
                  <span class="text-[10px]" [style.color]="colors.textSecondary">Armadura de Dios, firmeza</span>
                </div>
              </button>
            </div>
          </div>

          <!-- 2. Color Palette Selector (7 Palettes) -->
          <div class="p-4 rounded-xl border space-y-3"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <label class="block font-bold text-xs uppercase tracking-wider" [style.color]="colors.primary">
              2. Paleta de Colores
            </label>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              @for (pal of palettes; track pal.id) {
                <button
                  type="button"
                  (click)="storage.setPalette(pal.id)"
                  class="p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer"
                  [style.backgroundColor]="storage.colorPalette() === pal.id ? colors.primaryLight : 'transparent'"
                  [style.borderColor]="storage.colorPalette() === pal.id ? colors.primary : colors.border">
                  <div class="w-4 h-4 rounded-full shadow-xs shrink-0" [style.backgroundColor]="pal.hex"></div>
                  <span class="text-xs font-semibold" [style.color]="colors.textPrimary">{{ pal.name }}</span>
                </button>
              }
            </div>
          </div>

          <!-- 3. Symbol / Logo Selector -->
          <div class="p-4 rounded-xl border space-y-3"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <label class="block font-bold text-xs uppercase tracking-wider" [style.color]="colors.primary">
              3. Símbolo Espiritual R07
            </label>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              @for (sym of symbols; track sym.id) {
                <button
                  type="button"
                  (click)="storage.setLogoSymbol(sym.id)"
                  class="p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer"
                  [style.backgroundColor]="storage.logoSymbol() === sym.id ? colors.primaryLight : 'transparent'"
                  [style.borderColor]="storage.logoSymbol() === sym.id ? colors.primary : colors.border">
                  <span class="text-lg">{{ sym.emoji }}</span>
                  <span class="text-[11px] font-medium leading-tight" [style.color]="colors.textPrimary">{{ sym.name }}</span>
                </button>
              }
            </div>
          </div>

          <!-- 4. Typography Style -->
          <div class="p-4 rounded-xl border space-y-3"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <label class="block font-bold text-xs uppercase tracking-wider" [style.color]="colors.primary">
              4. Estilo Tipográfico
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              @for (typo of typographies; track typo.id) {
                <button
                  type="button"
                  (click)="storage.setFontFamily(typo.id)"
                  class="p-3 rounded-xl border text-left transition-all cursor-pointer"
                  [style.backgroundColor]="storage.fontFamily() === typo.id ? colors.primaryLight : 'transparent'"
                  [style.borderColor]="storage.fontFamily() === typo.id ? colors.primary : colors.border">
                  <span class="font-bold text-xs block" [style.color]="colors.textPrimary">{{ typo.name }}</span>
                  <span class="text-[11px] opacity-75 mt-0.5 block italic">{{ typo.preview }}</span>
                </button>
              }
            </div>
          </div>

          <!-- 5. User Profile Info -->
          <div class="p-4 rounded-xl border space-y-3"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <label class="block font-bold text-xs uppercase tracking-wider" [style.color]="colors.primary">
              5. Datos Personales & Iglesia
            </label>

            <!-- Avatar Emoji Selector -->
            <div>
              <span class="block text-[11px] font-semibold mb-1.5" [style.color]="colors.textSecondary">
                Selecciona tu Avatar Emoji:
              </span>
              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                @for (em of avatarEmojis; track em) {
                  <button
                    type="button"
                    (click)="storage.userAvatarEmoji.set(em)"
                    class="w-9 h-9 rounded-xl border text-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    [style.backgroundColor]="storage.userAvatarEmoji() === em ? colors.primaryLight : 'transparent'"
                    [style.borderColor]="storage.userAvatarEmoji() === em ? colors.primary : colors.border">
                    {{ em }}
                  </button>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Tu Nombre:</label>
                <input
                  type="text"
                  [ngModel]="storage.userName()"
                  (ngModelChange)="storage.userName.set($event)"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

              <div>
                <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Nombre de Iglesia:</label>
                <input
                  type="text"
                  [ngModel]="storage.churchName()"
                  (ngModelChange)="storage.churchName.set($event)"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

              <div>
                <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Grupo / Célula:</label>
                <input
                  type="text"
                  [ngModel]="storage.groupName()"
                  (ngModelChange)="storage.groupName.set($event)"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

              <div>
                <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Nombre de tu Líder:</label>
                <input
                  type="text"
                  [ngModel]="storage.leaderName()"
                  (ngModelChange)="storage.leaderName.set($event)"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

              <div>
                <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">WhatsApp / Teléfono de Líder:</label>
                <input
                  type="text"
                  [ngModel]="storage.leaderPhone()"
                  (ngModelChange)="storage.leaderPhone.set($event)"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>

              <div>
                <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Correo de Líder:</label>
                <input
                  type="text"
                  [ngModel]="storage.leaderEmail()"
                  (ngModelChange)="storage.leaderEmail.set($event)"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>
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
            Guardar y Cerrar
          </button>
        </div>

      </div>
    </div>
  `
})
export class UserProfileModal {
  storage = inject(R07StorageService);

  onClose = output<void>();

  palettes = PALETTES_LIST;
  symbols = SYMBOLS_LIST;
  typographies = TYPOGRAPHIES_LIST;
  avatarEmojis = AVATAR_EMOJIS;

  get colors() {
    return this.storage.currentThemeColors();
  }
}

