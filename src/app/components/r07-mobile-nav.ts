import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';

interface NavTab {
  id: 'chat' | 'community' | 'today' | 'bible' | 'explore';
  label: string;
  icon: string;
  badge?: boolean;
}

@Component({
  selector: 'app-r07-mobile-nav',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl pb-safe transition-colors duration-300 shadow-lg"
         [style.backgroundColor]="colors.surface + 'fa'"
         [style.borderColor]="colors.border"
         [style.color]="colors.textPrimary">
      <div class="max-w-md mx-auto px-2 py-1 flex items-center justify-around">
        @for (tab of tabs; track tab.id) {
          <button
            type="button"
            (click)="storage.setMobileTab(tab.id)"
            class="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative cursor-pointer"
            [style.backgroundColor]="storage.activeMobileTab() === tab.id && tab.id !== 'today' ? colors.primaryLight : 'transparent'"
            [style.color]="storage.activeMobileTab() === tab.id ? colors.primary : colors.textMuted">
            
            <!-- Central button for 'Hoy' Tab -->
            @if (tab.id === 'today') {
              <div class="w-11 h-11 -mt-3.5 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200"
                   [style.backgroundColor]="storage.activeMobileTab() === 'today' ? colors.primary : colors.primaryLight"
                   [style.color]="storage.activeMobileTab() === 'today' ? '#ffffff' : colors.primary"
                   [class.ring-2]="storage.activeMobileTab() === 'today'"
                   [class.ring-amber-400]="storage.activeMobileTab() === 'today'"
                   [class.scale-105]="storage.activeMobileTab() === 'today'">
                <span class="material-icons text-2xl">auto_stories</span>
              </div>
              <span class="text-[10px] mt-0.5"
                    [class.font-black]="storage.activeMobileTab() === 'today'"
                    [class.font-medium]="storage.activeMobileTab() !== 'today'"
                    [style.color]="storage.activeMobileTab() === 'today' ? colors.primary : colors.textMuted">
                {{ tab.label }}
              </span>
            } @else {
              <div class="relative">
                <span class="material-icons text-xl transition-transform"
                      [class.scale-110]="storage.activeMobileTab() === tab.id"
                      [style.color]="storage.activeMobileTab() === tab.id ? colors.primary : colors.textMuted">
                  {{ tab.icon }}
                </span>
                @if (tab.badge) {
                  <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
                }
              </div>
              <span class="text-[10px] mt-0.5 tracking-tight"
                    [class.font-black]="storage.activeMobileTab() === tab.id"
                    [class.font-medium]="storage.activeMobileTab() !== tab.id"
                    [style.color]="storage.activeMobileTab() === tab.id ? colors.primary : colors.textMuted">
                {{ tab.label }}
              </span>
            }

            <!-- Distinct Active Indicator Bar / Pill -->
            @if (storage.activeMobileTab() === tab.id) {
              <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                   [style.backgroundColor]="colors.primary"></div>
            }
          </button>
        }
      </div>
    </nav>
  `
})
export class R07MobileNav {
  public storage = inject(R07StorageService);

  get colors() {
    return this.storage.currentThemeColors();
  }

  public tabs: NavTab[] = [
    { id: 'chat', label: 'Chat', icon: 'chat_bubble_outline' },
    { id: 'community', label: 'Comunidad', icon: 'diversity_3', badge: true },
    { id: 'today', label: 'Hoy', icon: 'auto_stories' },
    { id: 'bible', label: 'Biblia', icon: 'menu_book' },
    { id: 'explore', label: 'Explorar', icon: 'explore' }
  ];
}
