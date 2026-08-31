import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { R07FriendEntity } from '../models/r07.models';

@Component({
  selector: 'app-r07-community',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="r07-community-container" class="space-y-6">
      
      <!-- My Token & Connection Card -->
      <div class="rounded-2xl p-6 border shadow-sm transition-all"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b"
             [style.borderColor]="colors.border">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.color]="colors.primary">
              {{ storage.userAvatarEmoji() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold tracking-tight" [style.color]="colors.textPrimary">
                  {{ storage.userName() }}
                </h3>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                      [style.backgroundColor]="colors.primaryLight"
                      [style.color]="colors.primary">
                  Miembro Activo
                </span>
              </div>
              <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
                {{ storage.groupName() }} • {{ storage.churchName() }}
              </p>
            </div>
          </div>

          <!-- Friend Token Box -->
          <div class="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3.5 py-2 rounded-xl border self-start md:self-auto"
               [style.borderColor]="colors.border">
            <div>
              <span class="block text-[10px] font-bold uppercase tracking-wider" [style.color]="colors.textMuted">
                Mi Código Devocional R07
              </span>
              <span class="text-xs font-mono font-bold" [style.color]="colors.primary">
                {{ storage.userFriendToken() }}
              </span>
            </div>
            <button
              id="btn-copy-friend-token"
              type="button"
              (click)="copyMyToken()"
              class="w-7 h-7 rounded-lg border flex items-center justify-center text-xs hover:bg-black/5 active:scale-95 transition-all cursor-pointer ml-2"
              [style.borderColor]="colors.border"
              [style.color]="colors.primary"
              title="Copiar código">
              <span class="mat-icon text-sm">content_copy</span>
            </button>
          </div>
        </div>

        <!-- Leader Information Strip -->
        <div class="mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
             [style.backgroundColor]="colors.background"
             [style.borderColor]="colors.border">
          <div>
            <span class="font-bold block" [style.color]="colors.textPrimary">
              Líder de Célula: {{ storage.leaderName() }}
            </span>
            <span class="text-xs mt-0.5 block" [style.color]="colors.textSecondary">
              Contacto: {{ storage.leaderPhone() }} • {{ storage.leaderEmail() }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  [style.backgroundColor]="colors.primaryLight"
                  [style.color]="colors.primary">
              Rendición semanal activa
            </span>
          </div>
        </div>

      </div>

      <!-- Friends in Connection Section -->
      <div class="rounded-2xl p-6 border shadow-sm space-y-4"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b"
             [style.borderColor]="colors.border">
          <div>
            <h3 class="text-lg font-bold tracking-tight" [style.color]="colors.textPrimary">
              Amigos Devocionales & Grupo de Conexión
            </h3>
            <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
              Acompáñense en sus rachas devocionales y oren los unos por los otros
            </p>
          </div>

          <button
            id="btn-add-friend-toggle"
            type="button"
            (click)="showAddFriendForm.set(!showAddFriendForm())"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
            [style.backgroundColor]="colors.primary">
            <span class="mat-icon text-sm">person_add</span>
            <span>Vincular Amigo</span>
          </button>
        </div>

        <!-- Add Friend Inline Form -->
        @if (showAddFriendForm()) {
          <div class="p-4 rounded-xl border space-y-3"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <h4 class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
              Conectar con Amigo o Hermano de Grupo
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  id="new-friend-name"
                  type="text"
                  [(ngModel)]="newFriendName"
                  placeholder="Nombre de la persona"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>
              <div>
                <input
                  id="new-friend-token"
                  type="text"
                  [(ngModel)]="newFriendToken"
                  placeholder="Código R07 (ej. R07-ANA-1234)"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>
              <div>
                <input
                  id="new-friend-group"
                  type="text"
                  [(ngModel)]="newFriendGroup"
                  placeholder="Célula o Iglesia"
                  class="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
              </div>
            </div>

            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="showAddFriendForm.set(false)"
                class="text-xs px-3 py-1.5 rounded-lg border hover:bg-black/5 cursor-pointer"
                [style.borderColor]="colors.border"
                [style.color]="colors.textSecondary">
                Cancelar
              </button>
              <button
                id="btn-confirm-add-friend"
                type="button"
                (click)="saveNewFriend()"
                class="text-xs font-semibold px-4 py-1.5 rounded-lg text-white shadow-xs hover:opacity-90 cursor-pointer"
                [style.backgroundColor]="colors.primary">
                Agregar Amigo
              </button>
            </div>
          </div>
        }

        <!-- Friends List -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (friend of storage.friends(); track friend.id) {
            <div class="p-4 rounded-xl border flex items-center justify-between gap-3 transition-all"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs shrink-0"
                     [style.backgroundColor]="colors.primaryLight"
                     [style.color]="colors.primary">
                  {{ friend.avatarEmoji }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold" [style.color]="colors.textPrimary">
                      {{ friend.name }}
                    </span>
                    <span class="text-[10px] px-2 py-0.2 rounded-md font-semibold"
                          [style.backgroundColor]="colors.primaryLight"
                          [style.color]="colors.primary">
                      🔥 {{ friend.currentStreak }} días racha
                    </span>
                  </div>
                  <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
                    {{ friend.churchOrGroup }} • Último R07: {{ friend.lastDevotionalDate }}
                  </p>
                  @if (friend.prayerRequest) {
                    <p class="text-xs mt-1 italic text-emerald-700 dark:text-emerald-400">
                      Petición: "{{ friend.prayerRequest }}"
                    </p>
                  }
                </div>
              </div>

              <div class="shrink-0">
                <span class="text-xs font-mono px-2 py-1 rounded bg-black/5 dark:bg-white/5 border text-[10px]"
                      [style.borderColor]="colors.border"
                      [style.color]="colors.textMuted">
                  {{ friend.friendToken }}
                </span>
              </div>

            </div>
          } @empty {
            <div class="col-span-full p-8 text-center text-xs" [style.color]="colors.textMuted">
              No tienes amigos vinculados aún. Comparte tu código o agrega a hermanos de tu grupo de conexión.
            </div>
          }
        </div>

      </div>

    </div>
  `
})
export class R07Community {
  storage = inject(R07StorageService);

  showAddFriendForm = signal<boolean>(false);
  newFriendName = '';
  newFriendToken = '';
  newFriendGroup = 'Su Presencia';

  get colors() {
    return this.storage.currentThemeColors();
  }

  copyMyToken(): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.storage.userFriendToken());
      this.storage.showSnackbar('¡Código devocional copiado al portapapeles!');
    }
  }

  saveNewFriend(): void {
    if (!this.newFriendName.trim()) return;
    const emojis = ['🌸', '🛡️', '🕊️', '✨', '📖', '🌿'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    this.storage.addFriend(this.newFriendToken, this.newFriendName, randomEmoji, this.newFriendGroup);
    this.newFriendName = '';
    this.newFriendToken = '';
    this.showAddFriendForm.set(false);
  }
}
