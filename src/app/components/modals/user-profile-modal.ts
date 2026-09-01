import { Component, ChangeDetectionStrategy, inject, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { R07StorageService } from '../../services/r07-storage.service';
import { UserProfile } from '../../models/r07.models';

@Component({
  selector: 'app-user-profile-modal',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <span class="material-icons text-sm">manage_accounts</span>
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">Mi Perfil Devocional R07</h3>
              <p class="text-xs text-purple-200">Personalización, Célula y Conexión en la Nube (Firebase)</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-purple-200 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          <!-- Cloud Auth Section -->
          <div class="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-stone-800 uppercase tracking-wider text-[11px]">Estado de Cuenta Firebase</span>
              <span class="flex items-center gap-1 text-[11px]" 
                    [class.text-emerald-700]="firebase.isSignedIn()" 
                    [class.text-amber-700]="!firebase.isSignedIn()">
                <span class="w-2 h-2 rounded-full" [class.bg-emerald-500]="firebase.isSignedIn()" [class.bg-amber-500]="!firebase.isSignedIn()"></span>
                {{ firebase.isSignedIn() ? 'Sincronizado con Google' : 'Modo Local / Sin Conectar' }}
              </span>
            </div>

            @if (firebase.isSignedIn()) {
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-bold text-stone-900 text-sm">{{ firebase.userDisplayName() }}</p>
                  <p class="text-stone-500 text-[11px]">{{ firebase.userEmail() }}</p>
                </div>
                <button
                  type="button"
                  (click)="firebase.logout()"
                  class="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-200 text-stone-700 font-semibold transition">
                  Cerrar Sesión
                </button>
              </div>
            } @else {
              <div class="flex items-center justify-between gap-3">
                <p class="text-stone-600 text-[11px]">Inicia sesión con tu cuenta de Google para guardar tus 7 días en la nube.</p>
                <button
                  type="button"
                  (click)="firebase.loginWithGoogle()"
                  class="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition">
                  <span class="material-icons text-sm">login</span>
                  <span>Conectar Google</span>
                </button>
              </div>
            }
          </div>

          <!-- Profile Form -->
          <form [formGroup]="profileForm" class="space-y-3.5">
            
            <div>
              <label class="block font-semibold text-stone-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                formControlName="displayName"
                class="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-purple-500">
            </div>

            <!-- Gender / Thematic Focus -->
            <div>
              <label class="block font-semibold text-stone-700 mb-1">Enfoque y Estilo Devocional</label>
              <div class="grid grid-cols-3 gap-2">
                <label 
                  [class.ring-2]="profileForm.value.genderTheme === 'female'"
                  [class.ring-purple-600]="profileForm.value.genderTheme === 'female'"
                  [class.bg-purple-50]="profileForm.value.genderTheme === 'female'"
                  class="p-2.5 rounded-xl border border-stone-200 text-center cursor-pointer hover:bg-stone-50 transition">
                  <input type="radio" value="female" formControlName="genderTheme" class="hidden">
                  <span class="material-icons text-purple-700 block mb-0.5 text-lg">spa</span>
                  <span class="font-bold text-stone-800 block text-[11px]">Mujer de Dios</span>
                  <span class="text-[9px] text-stone-500">Proverbios 31</span>
                </label>

                <label 
                  [class.ring-2]="profileForm.value.genderTheme === 'male'"
                  [class.ring-purple-600]="profileForm.value.genderTheme === 'male'"
                  [class.bg-purple-50]="profileForm.value.genderTheme === 'male'"
                  class="p-2.5 rounded-xl border border-stone-200 text-center cursor-pointer hover:bg-stone-50 transition">
                  <input type="radio" value="male" formControlName="genderTheme" class="hidden">
                  <span class="material-icons text-indigo-700 block mb-0.5 text-lg">shield</span>
                  <span class="font-bold text-stone-800 block text-[11px]">Hombre de Dios</span>
                  <span class="text-[9px] text-stone-500">Josué 1:9</span>
                </label>

                <label 
                  [class.ring-2]="profileForm.value.genderTheme === 'neutral'"
                  [class.ring-purple-600]="profileForm.value.genderTheme === 'neutral'"
                  [class.bg-purple-50]="profileForm.value.genderTheme === 'neutral'"
                  class="p-2.5 rounded-xl border border-stone-200 text-center cursor-pointer hover:bg-stone-50 transition">
                  <input type="radio" value="neutral" formControlName="genderTheme" class="hidden">
                  <span class="material-icons text-amber-600 block mb-0.5 text-lg">auto_awesome</span>
                  <span class="font-bold text-stone-800 block text-[11px]">General / Célula</span>
                  <span class="text-[9px] text-stone-500">Filipenses 4</span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-stone-700 mb-1">Nombre de la Iglesia</label>
                <input
                  type="text"
                  formControlName="churchName"
                  placeholder="Ej. Iglesia El Shaddai"
                  class="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-purple-500">
              </div>

              <div>
                <label class="block font-semibold text-stone-700 mb-1">Grupo de Conexión / Célula</label>
                <input
                  type="text"
                  formControlName="cellGroupName"
                  placeholder="Ej. Célula Gracia & Vida"
                  class="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-purple-500">
              </div>
            </div>

            <div>
              <label class="block font-semibold text-stone-700 mb-1">Nombre de tu Líder / Discipulador</label>
              <input
                type="text"
                formControlName="leaderName"
                placeholder="Ej. Pastor Juan / Hna. María"
                class="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 focus:ring-2 focus:ring-purple-500">
            </div>

          </form>

        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition">
            Cerrar
          </button>

          <button
            type="button"
            (click)="saveProfile()"
            class="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs">
            <span class="material-icons text-sm">save</span>
            <span>Guardar Perfil</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class UserProfileModal implements OnInit {
  public firebase = inject(FirebaseService);
  public storage = inject(R07StorageService);
  public close = output<void>();

  public profileForm = new FormGroup({
    displayName: new FormControl(''),
    genderTheme: new FormControl<'female' | 'male' | 'neutral' | 'general'>('female'),
    churchName: new FormControl(''),
    cellGroupName: new FormControl(''),
    leaderName: new FormControl('')
  });

  ngOnInit(): void {
    const prof = this.storage.userProfile();
    this.profileForm.patchValue({
      displayName: prof.displayName || '',
      genderTheme: prof.genderTheme || 'female',
      churchName: prof.churchName || '',
      cellGroupName: prof.cellGroupName || '',
      leaderName: prof.leaderName || ''
    });
  }

  public saveProfile(): void {
    const val = this.profileForm.value;
    this.storage.updateUserProfile({
      displayName: val.displayName || 'Hermano/a en Cristo',
      genderTheme: val.genderTheme || 'female',
      churchName: val.churchName || '',
      cellGroupName: val.cellGroupName || '',
      leaderName: val.leaderName || ''
    });
    this.close.emit();
  }
}
