import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { R07StorageService } from '../services/r07-storage.service';
import { CommunityPrayer } from '../models/r07.models';
import { Unsubscribe } from 'firebase/firestore';

@Component({
  selector: 'app-r07-community',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl p-5 sm:p-6 border shadow-xs mb-10 space-y-6 transition-colors duration-300 {{ storage.fontClass() }}"
         [style.backgroundColor]="colors.surface"
         [style.borderColor]="colors.border"
         [style.color]="colors.textPrimary">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b"
           [style.borderColor]="colors.border">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-xl" [style.color]="colors.primary">diversity_3</span>
            <h3 class="text-base sm:text-lg font-bold tracking-tight">
              Muro Comunitario de Oración e Intercesión
            </h3>
          </div>
          <p class="text-xs" [style.color]="colors.textSecondary">
            «Confesaos vuestras ofensas unos a otros, y orad unos por otros, para que seáis sanados» (Santiago 5:16)
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (!firebase.isSignedIn()) {
            <button
              type="button"
              (click)="storage.openAuthModal()"
              class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition hover:opacity-80 cursor-pointer"
              [style.borderColor]="colors.border"
              [style.color]="colors.textSecondary">
              <span class="material-icons text-sm">login</span>
              <span>Iniciar Sesión</span>
            </button>
          }

          <button
            type="button"
            (click)="showNewPrayerForm.set(!showNewPrayerForm())"
            class="px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer"
            [style.backgroundColor]="colors.primary">
            <span class="material-icons text-sm">{{ showNewPrayerForm() ? 'close' : 'add' }}</span>
            <span>{{ showNewPrayerForm() ? 'Cerrar' : 'Compartir Petición' }}</span>
          </button>
        </div>
      </div>

      <!-- New Prayer Form Collapsible -->
      @if (showNewPrayerForm()) {
        <form [formGroup]="prayerForm" (ngSubmit)="submitPrayer()"
              class="rounded-2xl p-4 sm:p-5 border space-y-4 animate-fadeSlideUp"
              [style.backgroundColor]="colors.background"
              [style.borderColor]="colors.border">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                [style.color]="colors.primary">
              <span class="material-icons text-sm">post_add</span>
              Nueva Petición para la Comunidad
            </h4>
            <span class="text-xs" [style.color]="colors.textMuted">
              Publicado como: <strong>{{ firebase.userDisplayName() }}</strong>
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">
                Título de la Petición
              </label>
              <input
                type="text"
                formControlName="title"
                placeholder="Ej. Por la salud de mi hijo, por restauración familiar..."
                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.surface"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>

            <div>
              <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">
                Categoría
              </label>
              <select
                formControlName="category"
                class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-medium"
                [style.backgroundColor]="colors.surface"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
                <option value="salud" class="text-stone-900">Salud y Sanidad</option>
                <option value="familia" class="text-stone-900">Familia y Matrimonio</option>
                <option value="finanzas" class="text-stone-900">Finanzas y Provisión</option>
                <option value="espiritual" class="text-stone-900">Crecimiento Espiritual</option>
                <option value="misiones" class="text-stone-900">Misiones y Evangelismo</option>
                <option value="otro" class="text-stone-900">Otro Motivo</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">
              Detalle del Clamor
            </label>
            <textarea
              rows="3"
              formControlName="content"
              placeholder="Explica tu motivo de oración con fe y confianza..."
              class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 resize-none leading-relaxed"
              [style.backgroundColor]="colors.surface"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              (click)="showNewPrayerForm.set(false)"
              class="px-3.5 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
              [style.borderColor]="colors.border"
              [style.backgroundColor]="colors.surface"
              [style.color]="colors.textSecondary">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="prayerForm.invalid || isSubmitting()"
              class="px-4 py-1.5 rounded-xl text-white text-xs font-bold transition flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">send</span>
              <span>{{ isSubmitting() ? 'Publicando...' : 'Publicar en el Muro' }}</span>
            </button>
          </div>
        </form>
      }

      <!-- List of Community Petitions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (item of prayersList(); track item.id) {
          <div class="p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 hover:shadow-xs"
               [style.backgroundColor]="item.answered ? '#ECFDF5' : colors.card"
               [style.borderColor]="item.answered ? '#A7F3D0' : colors.border">
            
            <div>
              <!-- Author and Category -->
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-xs font-bold flex items-center gap-1 truncate" [style.color]="colors.textPrimary">
                  <span class="material-icons text-xs" [style.color]="colors.primary">account_circle</span>
                  {{ item.userName }}
                </span>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span 
                    [class.bg-emerald-100]="item.answered" 
                    [class.text-emerald-800]="item.answered" 
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                    [style.backgroundColor]="item.answered ? '#D1FAE5' : colors.primaryLight"
                    [style.color]="item.answered ? '#065F46' : colors.primary">
                    {{ item.answered ? '¡Milagro!' : item.category }}
                  </span>
                  @if (canDeletePrayer(item)) {
                    <button
                      type="button"
                      (click)="deletePrayer(item)"
                      title="Eliminar mi petición"
                      class="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer">
                      <span class="material-icons text-sm">delete_outline</span>
                    </button>
                  }
                </div>
              </div>

              <!-- Title & Content -->
              <h4 class="text-xs sm:text-sm font-bold mb-1" [style.color]="colors.textPrimary">
                {{ item.title }}
              </h4>
              <p class="text-xs leading-relaxed line-clamp-3" [style.color]="colors.textSecondary">
                {{ item.content }}
              </p>

              @if (item.answered && item.testimony) {
                <div class="mt-2 p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-200 text-[11px] text-emerald-900 font-serif italic">
                  <strong>Testimonio:</strong> «{{ item.testimony }}»
                </div>
              }
            </div>

            <!-- Card Bottom Action: "He orado" button -->
            <div class="pt-2 border-t flex items-center justify-between text-xs"
                 [style.borderColor]="colors.border">
              <span class="text-[11px]" [style.color]="colors.textMuted">
                {{ item.prayerCount || 0 }} oraciones unidas
              </span>

              <div class="flex items-center gap-1">
                @if (firebase.userUid() === item.userId && !item.answered) {
                  <button
                    type="button"
                    (click)="markAsAnswered(item)"
                    class="px-2 py-1 rounded-lg text-amber-900 bg-amber-100 hover:bg-amber-200 text-[10px] font-bold transition cursor-pointer">
                    Testimonio
                  </button>
                }

                <button
                  type="button"
                  (click)="prayFor(item)"
                  class="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition hover:opacity-90 cursor-pointer shadow-2xs"
                  [style.backgroundColor]="colors.primaryLight"
                  [style.color]="colors.primary">
                  <span class="material-icons text-xs">volunteer_activism</span>
                  <span>He orado</span>
                </button>
              </div>
            </div>

          </div>
        } @empty {
          <div class="col-span-full p-8 text-center text-xs border border-dashed rounded-2xl"
               [style.borderColor]="colors.border"
               [style.backgroundColor]="colors.background"
               [style.color]="colors.textMuted">
            <span class="material-icons text-3xl block mb-1 opacity-50">volunteer_activism</span>
            Aún no hay peticiones comunitarias. ¡Sé el primero en compartir tu motivo de oración!
          </div>
        }
      </div>

    </div>
  `
})
export class R07Community implements OnInit, OnDestroy {
  public firebase = inject(FirebaseService);
  public storage = inject(R07StorageService);

  get colors() {
    return this.storage.currentThemeColors();
  }

  public prayersList = signal<CommunityPrayer[]>([
    {
      id: 'demo_1',
      userId: 'system',
      userName: 'Hermana Marta R.',
      title: 'Sanidad y paz para mi hogar',
      content: 'Pido oración por la salud respiratoria de mis dos hijos y por un tiempo de refrigerio espiritual en nuestra familia.',
      category: 'salud',
      prayerCount: 14,
      answered: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'demo_2',
      userId: 'system',
      userName: 'Pastor Carlos M.',
      title: 'Campamento de Jóvenes y Discipulado',
      content: 'Oremos para que el Señor toque los corazones de 50 jóvenes en el retiro R07 este fin de semana.',
      category: 'misiones',
      prayerCount: 28,
      answered: true,
      testimony: '¡Gloria a Dios! 38 jóvenes recibieron al Señor y se comprometieron con el devocional diario.',
      createdAt: new Date().toISOString()
    }
  ]);

  public showNewPrayerForm = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public myPrayerIds = signal<Set<string>>(new Set<string>());
  private unsubscribeFirestore?: Unsubscribe;

  public prayerForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    category: new FormControl<'salud' | 'familia' | 'finanzas' | 'espiritual' | 'misiones' | 'otro'>('salud', [Validators.required]),
    content: new FormControl('', [Validators.required, Validators.maxLength(2000)])
  });

  private loadMyPrayerIds(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('r07_my_prayer_ids');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            this.myPrayerIds.set(new Set(arr));
          }
        }
      } catch {}
    }
  }

  private saveMyPrayerId(id: string): void {
    const updated = new Set(this.myPrayerIds());
    updated.add(id);
    this.myPrayerIds.set(updated);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_my_prayer_ids', JSON.stringify(Array.from(updated)));
      } catch {}
    }
  }

  private removeMyPrayerId(id: string): void {
    const updated = new Set(this.myPrayerIds());
    updated.delete(id);
    this.myPrayerIds.set(updated);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_my_prayer_ids', JSON.stringify(Array.from(updated)));
      } catch {}
    }
  }

  public canDeletePrayer(prayer: CommunityPrayer): boolean {
    const currentUid = this.firebase.userUid();
    // 1. If signed in and matches user ID
    if (currentUid && prayer.userId && prayer.userId !== 'system' && prayer.userId === currentUid) {
      return true;
    }
    // 2. If it was created on this device
    if (this.myPrayerIds().has(prayer.id)) {
      return true;
    }
    return false;
  }

  ngOnInit(): void {
    this.loadMyPrayerIds();

    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('r07_community_prayers');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.prayersList.set(parsed);
          }
        }
      } catch {}
    }

    try {
      this.unsubscribeFirestore = this.firebase.listenToCommunityPrayers((prayers) => {
        if (prayers && prayers.length > 0) {
          this.prayersList.set(prayers);
          if (typeof localStorage !== 'undefined') {
            try {
              localStorage.setItem('r07_community_prayers', JSON.stringify(prayers));
            } catch {}
          }
        }
      });
    } catch {
      // Fallback
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
    }
  }

  public async submitPrayer(): Promise<void> {
    if (this.prayerForm.invalid) return;
    this.isSubmitting.set(true);

    try {
      const val = this.prayerForm.value;
      const newPrayer: CommunityPrayer = {
        id: `prayer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: this.firebase.userUid() || 'local_user',
        userName: this.firebase.userDisplayName() || this.storage.userProfile().displayName || 'Hermano/a',
        title: val.title!,
        content: val.content!,
        category: val.category || 'espiritual',
        prayerCount: 1,
        answered: false,
        createdAt: new Date().toISOString()
      };

      // 1. Add to local list immediately so it appears even offline
      this.prayersList.update(list => [newPrayer, ...list]);
      this.saveMyPrayerId(newPrayer.id);
      this.storage.showSnackbar('Petición compartida en la comunidad con éxito 🙏');

      // 2. Persist locally
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('r07_community_prayers', JSON.stringify(this.prayersList()));
        } catch {}
      }

      // 3. Sync with Firebase if online
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        await this.firebase.addCommunityPrayer({
          userId: newPrayer.userId,
          userName: newPrayer.userName,
          title: newPrayer.title,
          content: newPrayer.content,
          category: newPrayer.category
        }).catch(e => console.warn('Firebase prayer sync background failed:', e));
      }

      this.prayerForm.reset({ category: 'salud' });
      this.showNewPrayerForm.set(false);
    } catch (err) {
      console.error('Error submitting prayer:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public async prayFor(prayer: CommunityPrayer): Promise<void> {
    try {
      await this.firebase.incrementPrayerCounter(prayer.id, prayer.prayerCount || 0);
      this.prayersList.update(list => list.map(p => p.id === prayer.id ? { ...p, prayerCount: (p.prayerCount || 0) + 1 } : p));
    } catch (err) {
      console.warn('Increment error:', err);
    }
  }

  public async markAsAnswered(prayer: CommunityPrayer): Promise<void> {
    const testimony = prompt('Escribe una breve nota o testimonio de cómo Dios respondió tu oración:') || '¡Dios respondió con Su poder y fidelidad!';
    try {
      await this.firebase.markPrayerAnswered(prayer.id, testimony);
      this.prayersList.update(list => list.map(p => p.id === prayer.id ? { ...p, answered: true, testimony } : p));
    } catch (err) {
      console.warn('Answered error:', err);
    }
  }

  public async deletePrayer(prayer: CommunityPrayer): Promise<void> {
    const confirmed = confirm(`¿Deseas eliminar la petición «${prayer.title}»?`);
    if (!confirmed) return;

    // 1. Remove immediately from local list
    this.prayersList.update(list => list.filter(p => p.id !== prayer.id));
    this.removeMyPrayerId(prayer.id);
    this.storage.showSnackbar('Petición eliminada correctamente 🗑️');

    // 2. Persist locally
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_community_prayers', JSON.stringify(this.prayersList()));
      } catch {}
    }

    // 3. Delete from Firebase if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await this.firebase.deleteCommunityPrayer(prayer.id);
      } catch (err) {
        console.warn('Could not delete from Firestore:', err);
      }
    }
  }
}
