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
    <nav class="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-lg pb-safe transition-colors duration-300"
         [style.backgroundColor]="colors.surface + 'fa'"
         [style.borderColor]="colors.border"
         [style.color]="colors.textPrimary">
      <div class="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
        @for (tab of tabs; track tab.id) {
          <button
            type="button"
            (click)="storage.setMobileTab(tab.id)"
            class="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 relative cursor-pointer group"
            [style.color]="storage.activeMobileTab() === tab.id ? colors.primary : colors.textMuted">
            
            <!-- Central Highlight for 'Hoy' Tab -->
            @if (tab.id === 'today') {
              <div class="w-11 h-11 -mt-4 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                   [style.backgroundColor]="colors.primary"
                   style="color: #ffffff;">
                <span class="material-icons text-2xl">auto_stories</span>
              </div>
              <span class="text-[10px] font-bold mt-1" [style.color]="colors.primary">
                {{ tab.label }}
              </span>
            } @else {
              <div class="relative">
                <span class="material-icons text-xl transition-transform group-hover:scale-110">
                  {{ tab.icon }}
                </span>
                @if (tab.badge) {
                  <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
                }
              </div>
              <span class="text-[10px] font-semibold mt-0.5 tracking-tight">
                {{ tab.label }}
              </span>
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
