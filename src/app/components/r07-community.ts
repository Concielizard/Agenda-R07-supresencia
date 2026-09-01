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
    <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-stone-200/90 mb-10 space-y-6">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-purple-700 text-xl">diversity_3</span>
            <h3 class="text-base sm:text-lg font-bold text-stone-800 font-serif">
              Muro Comunitario de Oración e Intercesión (Firebase)
            </h3>
          </div>
          <p class="text-xs text-stone-500">
            «Confesaos vuestras ofensas unos a otros, y orad unos por otros, para que seáis sanados» (Santiago 5:16)
          </p>
        </div>

        <div class="flex items-center gap-2">
          @if (!firebase.isSignedIn()) {
            <button
              type="button"
              (click)="firebase.loginWithGoogle()"
              class="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
              <span class="material-icons text-sm">login</span>
              <span>Iniciar con Google para orar</span>
            </button>
          } @else {
            <button
              type="button"
              (click)="showNewPrayerForm.set(!showNewPrayerForm())"
              class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition">
              <span class="material-icons text-sm">{{ showNewPrayerForm() ? 'close' : 'add' }}</span>
              <span>{{ showNewPrayerForm() ? 'Cerrar Formulario' : 'Compartir Petición' }}</span>
            </button>
          }
        </div>
      </div>

      <!-- New Prayer Form Collapsible -->
      @if (showNewPrayerForm()) {
        <form [formGroup]="prayerForm" (ngSubmit)="submitPrayer()" class="bg-stone-50 rounded-xl p-4 sm:p-5 border border-purple-200/80 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
              <span class="material-icons text-sm text-purple-700">post_add</span>
              Nueva Petición para la Comunidad
            </h4>
            <span class="text-xs text-stone-500">Publicado como: <strong>{{ firebase.userDisplayName() }}</strong></span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2">
              <label class="block text-[11px] font-semibold text-stone-600 mb-1">Título de la Petición</label>
              <input
                type="text"
                formControlName="title"
                placeholder="Ej. Por la salud de mi hijo, por restauración familiar..."
                class="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500">
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-stone-600 mb-1">Categoría</label>
              <select
                formControlName="category"
                class="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500">
                <option value="salud">Salud y Sanidad</option>
                <option value="familia">Familia y Matrimonio</option>
                <option value="finanzas">Finanzas y Provisión</option>
                <option value="espiritual">Crecimiento Espiritual</option>
                <option value="misiones">Misiones y Evangelismo</option>
                <option value="otro">Otro Motivo</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-stone-600 mb-1">Detalle del Clamor</label>
            <textarea
              rows="3"
              formControlName="content"
              placeholder="Explica tu motivo de oración con fe y confianza..."
              class="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500"></textarea>
          </div>

          <div class="flex justify-end gap-2">
            <button
              type="button"
              (click)="showNewPrayerForm.set(false)"
              class="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-100 transition">
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="prayerForm.invalid || isSubmitting()"
              class="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center gap-1">
              <span class="material-icons text-sm">send</span>
              <span>{{ isSubmitting() ? 'Publicando...' : 'Publicar en el Muro' }}</span>
            </button>
          </div>
        </form>
      }

      <!-- List of Community Petitions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (item of prayersList(); track item.id) {
          <div 
            [class.border-emerald-300]="item.answered" 
            [class.bg-emerald-50]="item.answered" 
            class="p-4 rounded-xl border border-stone-200/90 bg-stone-50/40 hover:bg-white hover:shadow-xs transition flex flex-col justify-between space-y-3">
            
            <div>
              <!-- Author and Category -->
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-xs font-bold text-stone-800 flex items-center gap-1 truncate">
                  <span class="material-icons text-xs text-purple-700">account_circle</span>
                  {{ item.userName }}
                </span>
                <span 
                  [class.bg-emerald-100]="item.answered" 
                  [class.text-emerald-800]="item.answered" 
                  [class.bg-purple-100]="!item.answered" 
                  [class.text-purple-800]="!item.answered" 
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                  {{ item.answered ? '¡Milagro!' : item.category }}
                </span>
              </div>

              <!-- Title & Content -->
              <h4 class="text-xs sm:text-sm font-bold text-stone-900 mb-1">
                {{ item.title }}
              </h4>
              <p class="text-xs text-stone-600 leading-relaxed line-clamp-3">
                {{ item.content }}
              </p>

              @if (item.answered && item.testimony) {
                <div class="mt-2 p-2 rounded-lg bg-emerald-100/70 border border-emerald-200 text-[11px] text-emerald-900 font-serif italic">
                  <strong>Testimonio:</strong> "{{ item.testimony }}"
                </div>
              }
            </div>

            <!-- Card Bottom Action: "He orado" button -->
            <div class="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
              <span class="text-[11px] text-stone-400">
                {{ item.prayerCount || 0 }} oraciones unidas
              </span>

              <div class="flex items-center gap-1">
                @if (firebase.userUid() === item.userId && !item.answered) {
                  <button
                    type="button"
                    (click)="markAsAnswered(item)"
                    class="px-2 py-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 text-[10px] font-bold transition">
                    Testimonio
                  </button>
                }

                <button
                  type="button"
                  (click)="prayFor(item)"
                  class="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-1 transition">
                  <span class="material-icons text-xs text-purple-700">volunteer_activism</span>
                  <span>He orado</span>
                </button>
              </div>
            </div>

          </div>
        } @empty {
          <div class="col-span-full p-8 text-center text-xs text-stone-400 border border-dashed rounded-xl bg-stone-50/50">
            <span class="material-icons text-3xl text-stone-300 block mb-1">volunteer_activism</span>
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
  private unsubscribeFirestore?: Unsubscribe;

  public prayerForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    category: new FormControl<'salud' | 'familia' | 'finanzas' | 'espiritual' | 'misiones' | 'otro'>('salud', [Validators.required]),
    content: new FormControl('', [Validators.required, Validators.maxLength(2000)])
  });

  ngOnInit(): void {
    try {
      this.unsubscribeFirestore = this.firebase.listenToCommunityPrayers((prayers) => {
        if (prayers && prayers.length > 0) {
          this.prayersList.set(prayers);
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
      await this.firebase.addCommunityPrayer({
        userId: this.firebase.userUid() || 'local_user',
        userName: this.firebase.userDisplayName() || this.storage.userProfile().displayName || 'Hermano/a',
        title: val.title!,
        content: val.content!,
        category: val.category || 'espiritual'
      });

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
}
