import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../../services/r07-storage.service';
import { AppEdition } from '../../models/r07.models';

@Component({
  selector: 'app-r07-onboarding-modal',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div class="w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        
        <!-- Top Wizard Header -->
        <div class="px-6 pt-6 pb-4 border-b flex items-center justify-between"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.color]="colors.primary">
              {{ currentStepIcon() }}
            </div>
            <div>
              <span class="text-[10px] font-extrabold uppercase tracking-widest" [style.color]="colors.primary">
                Paso {{ currentStep() }} de 4 • Bienvenida R07
              </span>
              <h2 class="text-base sm:text-lg font-black tracking-tight">
                {{ stepTitles[currentStep() - 1] }}
              </h2>
            </div>
          </div>
        </div>

        <!-- Progress Indicators -->
        <div class="w-full bg-stone-100 dark:bg-stone-800 h-1.5">
          <div class="h-full transition-all duration-300"
               [style.backgroundColor]="colors.primary"
               [style.width]="(currentStep() * 25) + '%'"></div>
        </div>

        <!-- Wizard Step Body -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">

          <!-- PASO 1: EDICIÓN & LLAMADO -->
          @if (currentStep() === 1) {
            <div class="space-y-4 animate-fadeIn">
              <div class="text-center space-y-1">
                <h3 class="text-base font-bold">¿Cómo deseas vivir tu experiencia devocional?</h3>
                <p class="text-xs" [style.color]="colors.textSecondary">
                  Selecciona tu edición para personalizar tus declaraciones diarias, promesas bíblicas y paleta cromática.
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <!-- Modo Mujer de Dios -->
                <button
                  type="button"
                  (click)="selectedEdition.set('female')"
                  class="p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 cursor-pointer"
                  [style.borderColor]="selectedEdition() === 'female' ? '#BE185D' : colors.border"
                  [style.backgroundColor]="selectedEdition() === 'female' ? '#FDF2F8' : colors.surface">
                  <div class="flex items-center justify-between">
                    <span class="text-2xl">🌸</span>
                    @if (selectedEdition() === 'female') {
                      <span class="material-icons text-base text-rose-600">check_circle</span>
                    }
                  </div>
                  <div>
                    <h4 class="font-extrabold text-sm text-rose-900">Mujer de Dios</h4>
                    <p class="text-[11px] text-rose-700 mt-0.5">Edición Proverbios 31: Sabiduría, gracia, vestidura de dignidad y paz para el hogar.</p>
                  </div>
                </button>

                <!-- Modo Hombre de Dios -->
                <button
                  type="button"
                  (click)="selectedEdition.set('male')"
                  class="p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 cursor-pointer"
                  [style.borderColor]="selectedEdition() === 'male' ? '#1D4ED8' : colors.border"
                  [style.backgroundColor]="selectedEdition() === 'male' ? '#EFF6FF' : colors.surface">
                  <div class="flex items-center justify-between">
                    <span class="text-2xl">🛡️</span>
                    @if (selectedEdition() === 'male') {
                      <span class="material-icons text-base text-blue-600">check_circle</span>
                    }
                  </div>
                  <div>
                    <h4 class="font-extrabold text-sm text-blue-900">Hombre de Dios</h4>
                    <p class="text-[11px] text-blue-700 mt-0.5">Edición Valientes: Sacerdocio del hogar, esfuerzo, valentía y fe inquebrantable.</p>
                  </div>
                </button>
              </div>

              <!-- Enfoque de Cuenta -->
              <div class="pt-3 border-t space-y-2" [style.borderColor]="colors.border">
                <label class="font-bold text-xs uppercase tracking-wider block" [style.color]="colors.textPrimary">
                  Tipo de Uso / Enfoque:
                </label>
                <div class="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    (click)="selectedAccountType.set('GROUP')"
                    class="p-3 rounded-xl border text-left transition cursor-pointer"
                    [style.borderColor]="selectedAccountType() === 'GROUP' ? colors.primary : colors.border"
                    [style.backgroundColor]="selectedAccountType() === 'GROUP' ? colors.primaryLight : colors.surface">
                    <div class="font-bold text-xs flex items-center gap-1">
                      <span>👥</span>
                      <span>Grupo de Conexión</span>
                    </div>
                    <p class="text-[10px] opacity-75 mt-0.5">Célula / Iglesia con reportes para líder</p>
                  </button>

                  <button
                    type="button"
                    (click)="selectedAccountType.set('INDIVIDUAL')"
                    class="p-3 rounded-xl border text-left transition cursor-pointer"
                    [style.borderColor]="selectedAccountType() === 'INDIVIDUAL' ? colors.primary : colors.border"
                    [style.backgroundColor]="selectedAccountType() === 'INDIVIDUAL' ? colors.primaryLight : colors.surface">
                    <div class="font-bold text-xs flex items-center gap-1">
                      <span>👤</span>
                      <span>Uso Personal</span>
                    </div>
                    <p class="text-[10px] opacity-75 mt-0.5">Devocional individual a tu ritmo</p>
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- PASO 2: TU IDENTIDAD -->
          @if (currentStep() === 2) {
            <div class="space-y-4 animate-fadeIn">
              <div class="text-center space-y-1">
                <h3 class="text-base font-bold">Preséntate ante el Señor</h3>
                <p class="text-xs" [style.color]="colors.textSecondary">
                  Configura tu nombre, foto de perfil y alias para tus devocionales y reportes.
                </p>
              </div>

              <!-- Photo / Avatar Selector -->
              <div class="flex flex-col items-center gap-3 pt-2">
                <div class="relative">
                  <div class="w-20 h-20 rounded-3xl border-2 overflow-hidden flex items-center justify-center shadow-md text-3xl"
                       [style.borderColor]="colors.primary"
                       [style.backgroundColor]="colors.primaryLight">
                    @if (photoUri()) {
                      <img [src]="photoUri()" alt="Foto" class="w-full h-full object-cover">
                    } @else {
                      <span>{{ selectedAvatar() }}</span>
                    }
                  </div>
                  
                  <label class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-stone-700 transition">
                    <span class="material-icons text-sm">photo_camera</span>
                    <input type="file" accept="image/*" (change)="onPhotoSelected($event)" class="hidden">
                  </label>
                </div>

                <!-- Quick emoji avatars -->
                <div class="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
                  @for (av of avatarOptions; track av) {
                    <button
                      type="button"
                      (click)="selectEmojiAvatar(av)"
                      class="w-8 h-8 rounded-xl border text-sm flex items-center justify-center hover:scale-110 transition cursor-pointer"
                      [style.borderColor]="selectedAvatar() === av && !photoUri() ? colors.primary : colors.border"
                      [style.backgroundColor]="selectedAvatar() === av && !photoUri() ? colors.primaryLight : colors.surface">
                      {{ av }}
                    </button>
                  }
                </div>
              </div>

              <!-- Inputs -->
              <div class="space-y-3 pt-2">
                <div>
                  <label class="font-bold text-xs block mb-1">Tu Nombre Completo *</label>
                  <input
                    type="text"
                    [(ngModel)]="displayName"
                    placeholder="Ej. Santiago Martínez"
                    class="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2"
                    [style.backgroundColor]="colors.background"
                    [style.borderColor]="colors.border"
                    [style.color]="colors.textPrimary">
                </div>

                <div>
                  <label class="font-bold text-xs block mb-1">Usuario / Alias</label>
                  <input
                    type="text"
                    [(ngModel)]="userHandle"
                    placeholder="Ej. yanti01"
                    class="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2"
                    [style.backgroundColor]="colors.background"
                    [style.borderColor]="colors.border"
                    [style.color]="colors.textPrimary">
                </div>
              </div>
            </div>
          }

          <!-- PASO 3: IGLESIA Y LÍDER DE GRUPO -->
          @if (currentStep() === 3) {
            <div class="space-y-4 animate-fadeIn">
              <div class="text-center space-y-1">
                <h3 class="text-base font-bold">
                  {{ selectedAccountType() === 'GROUP' ? 'Tu Comunidad y Mentores' : 'Tu Iglesia y Entorno Espiritual' }}
                </h3>
                <p class="text-xs" [style.color]="colors.textSecondary">
                  {{ selectedAccountType() === 'GROUP'
                     ? 'Conéctate con tu iglesia y facilita el envío de tus reportes de 7 días a tu líder.'
                     : 'Registra tu congregación para tu devocional personal.' }}
                </p>
              </div>

              <div class="space-y-3 pt-2">
                <div>
                  <label class="font-bold text-xs block mb-1">
                    Iglesia {{ selectedAccountType() === 'INDIVIDUAL' ? '(Opcional)' : '' }}
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="churchName"
                    placeholder="Ej. Su Presencia"
                    class="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2"
                    [style.backgroundColor]="colors.background"
                    [style.borderColor]="colors.border"
                    [style.color]="colors.textPrimary">
                </div>

                @if (selectedAccountType() === 'GROUP') {
                  <div>
                    <label class="font-bold text-xs block mb-1">Grupo de Conexión / Célula</label>
                    <input
                      type="text"
                      [(ngModel)]="groupName"
                      placeholder="Ej. Valientes Jóvenes"
                      class="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2"
                      [style.backgroundColor]="colors.background"
                      [style.borderColor]="colors.border"
                      [style.color]="colors.textPrimary">
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label class="font-bold text-xs block mb-1">Nombre de tu Líder</label>
                      <input
                        type="text"
                        [(ngModel)]="leaderName"
                        placeholder="Ej. David Gómez"
                        class="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2"
                        [style.backgroundColor]="colors.background"
                        [style.borderColor]="colors.border"
                        [style.color]="colors.textPrimary">
                    </div>

                    <div>
                      <label class="font-bold text-xs block mb-1">WhatsApp / Teléfono Líder</label>
                      <input
                        type="tel"
                        [(ngModel)]="leaderPhone"
                        placeholder="Ej. +573001234567"
                        class="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2"
                        [style.backgroundColor]="colors.background"
                        [style.borderColor]="colors.border"
                        [style.color]="colors.textPrimary">
                    </div>
                  </div>
                } @else {
                  <div class="p-3 rounded-2xl border text-xs flex items-center gap-2.5 opacity-90"
                       [style.backgroundColor]="colors.primaryLight"
                       [style.borderColor]="colors.border">
                    <span class="text-xl">👤</span>
                    <div>
                      <p class="font-bold" [style.color]="colors.primary">Modo Devocional Personal</p>
                      <p class="text-[11px]" [style.color]="colors.textSecondary">
                        No requieres grupo de conexión ni líder. Tus datos son 100% tuyos y privados en tu celular.
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- PASO 4: ¿CÓMO ESTÁ TU CORAZÓN HOY? -->
          @if (currentStep() === 4) {
            <div class="space-y-4 animate-fadeIn">
              <div class="text-center space-y-1">
                <h3 class="text-base font-bold">¿Cómo está tu corazón en este momento?</h3>
                <p class="text-xs" [style.color]="colors.textSecondary">
                  Adaptaremos tu lectura bíblica y reflexiones de hoy según tu necesidad espiritual actual.
                </p>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                @for (mood of moodOptions; track mood.id) {
                  <button
                    type="button"
                    (click)="selectedMood.set(mood.id)"
                    class="p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer hover:scale-105"
                    [style.borderColor]="selectedMood() === mood.id ? colors.primary : colors.border"
                    [style.backgroundColor]="selectedMood() === mood.id ? colors.primaryLight : colors.surface">
                    <span class="text-2xl">{{ mood.emoji }}</span>
                    <span class="font-extrabold text-xs" [style.color]="colors.textPrimary">{{ mood.label }}</span>
                    <span class="text-[9px] opacity-75" [style.color]="colors.textSecondary">{{ mood.desc }}</span>
                  </button>
                }
              </div>

              <div class="p-3.5 rounded-2xl border text-xs space-y-1"
                   [style.backgroundColor]="colors.card"
                   [style.borderColor]="colors.border">
                <div class="font-bold flex items-center gap-1.5" [style.color]="colors.primary">
                  <span>🕊️</span>
                  <span>Promesa del Señor para hoy:</span>
                </div>
                <p class="italic text-[11px]" [style.color]="colors.textSecondary">
                  «Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar. Llevad mi yugo sobre vosotros y aprended de mí.» (Mateo 11:28-29)
                </p>
              </div>
            </div>
          }

        </div>

        <!-- Wizard Navigation Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-between"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          
          @if (currentStep() > 1) {
            <button
              type="button"
              (click)="prevStep()"
              class="px-4 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
              [style.borderColor]="colors.border"
              [style.backgroundColor]="colors.surface"
              [style.color]="colors.textSecondary">
              Atrás
            </button>
          } @else {
            <div></div>
          }

          @if (currentStep() < 4) {
            <button
              type="button"
              (click)="nextStep()"
              class="px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition hover:scale-105 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span>Siguiente</span>
              <span class="material-icons text-sm">arrow_forward</span>
            </button>
          } @else {
            <button
              type="button"
              (click)="finishOnboarding()"
              class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 shadow-md transition hover:scale-105 cursor-pointer">
              <span>¡Comenzar mi Tiempo con Dios! 🕊️</span>
            </button>
          }

        </div>

      </div>
    </div>
  `
})
export class R07OnboardingModal {
  public storage = inject(R07StorageService);
  public complete = output<void>();

  public currentStep = signal<number>(1);
  public selectedEdition = signal<AppEdition>('male');
  public selectedAccountType = signal<'GROUP' | 'INDIVIDUAL'>('GROUP');
  public displayName: string = '';
  public userHandle: string = 'yanti01';
  public churchName: string = 'Su Presencia';
  public groupName: string = 'Grupo de Conexión Valientes';
  public leaderName: string = '';
  public leaderPhone: string = '';
  public photoUri = signal<string>('');
  public selectedAvatar = signal<string>('🦁');
  public selectedMood = signal<string>('paz');

  public stepTitles = [
    'Elige tu Edición y Modo',
    'Configura tu Identidad',
    'Tu Iglesia y Líder',
    '¿Qué hay en tu Corazón Hoy?'
  ];

  public avatarOptions = ['🦁', '🕊️', '🛡️', '🌸', '👑', '⚔️', '📖', '✨', '🤍'];

  public moodOptions = [
    { id: 'paz', emoji: '🕊️', label: 'Paz', desc: 'En reposo con Dios' },
    { id: 'gratitud', emoji: '🙌', label: 'Gratitud', desc: 'Agradecido de corazón' },
    { id: 'busqueda', emoji: '🔥', label: 'Búsqueda', desc: 'Hambriento de Su voz' },
    { id: 'ansiedad', emoji: '🌿', label: 'Ansiedad', desc: 'Necesito Su calma' },
    { id: 'cansancio', emoji: '⚡', label: 'Cansancio', desc: 'Renovando fuerzas' },
    { id: 'direccion', emoji: '🧭', label: 'Dirección', desc: 'Buscando sabiduría' }
  ];

  get colors() {
    return this.storage.currentThemeColors();
  }

  constructor() {
    const p = this.storage.userProfile();
    this.displayName = p.displayName || '';
    this.userHandle = p.handle || 'yanti01';
    this.churchName = p.churchName || 'Su Presencia';
    this.groupName = p.groupName || 'Grupo de Conexión';
    this.leaderName = p.leaderName || '';
    this.leaderPhone = p.leaderPhone || '';
    if (p.photoUri) this.photoUri.set(p.photoUri);
    if (p.avatarEmoji) this.selectedAvatar.set(p.avatarEmoji);
    this.selectedEdition.set(this.storage.edition());
  }

  public currentStepIcon(): string {
    switch (this.currentStep()) {
      case 1: return this.selectedEdition() === 'female' ? '🌸' : '🛡️';
      case 2: return '👤';
      case 3: return '⛪';
      case 4: return '💛';
      default: return '✨';
    }
  }

  public selectEmojiAvatar(av: string): void {
    this.selectedAvatar.set(av);
    this.photoUri.set('');
  }

  public onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.photoUri.set(result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  public nextStep(): void {
    if (this.currentStep() === 1) {
      this.storage.setEdition(this.selectedEdition());
    }
    this.currentStep.update(s => Math.min(s + 1, 4));
  }

  public prevStep(): void {
    this.currentStep.update(s => Math.max(s - 1, 1));
  }

  public finishOnboarding(): void {
    const finalName = this.displayName.trim() || 'Hijo de Dios';
    const isIndividual = this.selectedAccountType() === 'INDIVIDUAL';

    this.storage.completeOnboarding({
      displayName: finalName,
      handle: this.userHandle.trim() || 'yanti01',
      churchName: this.churchName.trim() || 'Su Presencia',
      groupName: isIndividual ? 'Devocional Personal' : (this.groupName.trim() || 'Grupo de Conexión'),
      leaderName: isIndividual ? '' : (this.leaderName.trim() || 'Líder'),
      leaderPhone: isIndividual ? '' : this.leaderPhone.trim(),
      accountType: this.selectedAccountType(),
      photoUri: this.photoUri(),
      avatarEmoji: this.selectedAvatar(),
      genderTheme: this.selectedEdition() === 'female' ? 'female' : 'male',
      currentMood: this.selectedMood()
    });

    this.complete.emit();
  }
}
