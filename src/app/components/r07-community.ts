import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { R07StorageService } from '../services/r07-storage.service';
import { CommunityPrayer, ConnectionGroup, GroupAnnouncement, GroupPrayer } from '../models/r07.models';
import { Unsubscribe } from 'firebase/firestore';

@Component({
  selector: 'app-r07-community',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl p-5 sm:p-6 border shadow-xs mb-10 space-y-6 transition-colors duration-300 {{ storage.fontClass() }}"
         [style.backgroundColor]="colors.surface"
         [style.borderColor]="colors.border"
         [style.color]="colors.textPrimary">
      
      <!-- Top Header -->
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b"
           [style.borderColor]="colors.border">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-xl" [style.color]="colors.primary">diversity_3</span>
            <h3 class="text-base sm:text-lg font-bold tracking-tight">
              Comunidad & Grupos de Conexión
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
          } @else {
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border"
                 [style.borderColor]="colors.border"
                 [style.backgroundColor]="colors.background">
              <span class="material-icons text-sm" [style.color]="colors.primary">account_circle</span>
              <span class="truncate max-w-[110px]">{{ firebase.userDisplayName() }}</span>
              @if (firebase.isLeader()) {
                <span class="text-[9px] px-1.5 py-0.2 rounded-full uppercase font-black bg-amber-500/20 text-amber-600 dark:text-amber-400">Líder</span>
                <button
                  type="button"
                  (click)="onExitLeaderMode()"
                  title="Salir de modo líder"
                  class="ml-1 text-[10px] px-1.5 py-0.5 rounded-md border text-stone-400 hover:text-amber-500 hover:border-amber-500/50 transition cursor-pointer"
                  [style.borderColor]="colors.border">
                  ✕ Salir de Líder
                </button>
              }
            </div>
          }
        </div>
      </div>

      <!-- Main Sub-Navigation: Muro General vs Grupos de Conexión -->
      <div class="flex items-center gap-2 p-1.5 rounded-2xl border"
           [style.backgroundColor]="colors.background"
           [style.borderColor]="colors.border">
        <button
          type="button"
          (click)="activeSubTab.set('wall')"
          class="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
          [style.backgroundColor]="activeSubTab() === 'wall' ? colors.primary : 'transparent'"
          [style.color]="activeSubTab() === 'wall' ? '#ffffff' : colors.textSecondary">
          <span class="material-icons text-sm">public</span>
          <span>Muro de Oración</span>
        </button>

        <button
          type="button"
          (click)="activeSubTab.set('groups')"
          class="flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer relative"
          [style.backgroundColor]="activeSubTab() === 'groups' ? colors.primary : 'transparent'"
          [style.color]="activeSubTab() === 'groups' ? '#ffffff' : colors.textSecondary">
          <span class="material-icons text-sm">groups</span>
          <span>Grupos de Conexión</span>
          @if (firebase.activeGroup()) {
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          }
        </button>
      </div>

      @if (activeSubTab() === 'wall') {
        <div class="space-y-5 animate-fadeIn">
          <!-- Wall Top Actions & Button -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold flex items-center gap-1" [style.color]="colors.textSecondary">
              <span class="material-icons text-xs" [style.color]="colors.primary">forum</span>
              Peticiones de Fe en la Iglesia
            </span>

            <button
              type="button"
              (click)="showNewPrayerForm.set(!showNewPrayerForm())"
              class="px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">{{ showNewPrayerForm() ? 'close' : 'add' }}</span>
              <span>{{ showNewPrayerForm() ? 'Cerrar' : 'Compartir Petición' }}</span>
            </button>
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

      <!-- End Tab A: Wall -->
      </div>
      }

      <!-- ============================================================== -->
      <!-- TAB B: GRUPOS DE CONEXIÓN (CÉLULAS SU PRESENCIA)                 -->
      <!-- ============================================================== -->
      @if (activeSubTab() === 'groups') {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- CASE 1: NO ACTIVE GROUP JOINED -->
          @if (!firebase.activeGroup()) {
            <div class="space-y-5">
              
              <!-- Welcome Info Box -->
              <div class="p-4 rounded-2xl border flex items-start gap-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="p-2 rounded-xl text-white shrink-0" [style.backgroundColor]="colors.primary">
                  <span class="material-icons text-lg">connect_without_contact</span>
                </div>
                <div>
                  <h4 class="text-xs sm:text-sm font-bold mb-0.5">Espacio de Grupos de Conexión</h4>
                  <p class="text-xs leading-relaxed" [style.color]="colors.textSecondary">
                    Conéctate con tu célula, comparte los anuncios de tu líder, oren juntos en privado y lleven el termómetro de su devocional R07 semanal.
                  </p>
                </div>
              </div>

              <!-- Error banner if ultimoError is present -->
              @if (firebase.ultimoError(); as err) {
                <div class="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between animate-fadeIn">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-sm">error_outline</span>
                    <span>{{ err }}</span>
                  </div>
                  <button type="button" (click)="firebase.ultimoError.set(null)" class="text-xs font-bold hover:opacity-75 cursor-pointer">✕</button>
                </div>
              }

              <!-- Action Card 1: Unirme con Código de Grupo -->
              <div class="p-5 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.card"
                   [style.borderColor]="colors.border">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-base" [style.color]="colors.primary">pin</span>
                  <h4 class="text-xs sm:text-sm font-bold">Unirme a mi Grupo de Conexión</h4>
                </div>
                <p class="text-xs" [style.color]="colors.textSecondary">
                  Digita el código corto (ej. <strong>SP-4296</strong>) que te compartió tu líder de célula:
                </p>

                <div class="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    [ngModel]="joinCodeInput()"
                    (ngModelChange)="joinCodeInput.set($event)"
                    placeholder="Ej. SP-4296"
                    autocapitalize="characters"
                    autocomplete="off"
                    class="flex-1 min-w-[180px] px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border uppercase tracking-wider font-mono font-bold focus:outline-none focus:ring-2"
                    [style.backgroundColor]="colors.surface"
                    [style.borderColor]="colors.border"
                    [style.color]="colors.textPrimary">

                  <button
                    type="button"
                    (click)="onJoinGroup()"
                    [disabled]="!joinCodeInput().trim()"
                    class="px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    [style.backgroundColor]="colors.primary">
                    <span class="material-icons text-sm">login</span>
                    <span>Unirme al Grupo</span>
                  </button>
                </div>

                <!-- Quick suggestion hint for code format -->
                <div class="pt-2 flex items-center gap-2 text-[11px] flex-wrap" [style.color]="colors.textMuted">
                  <span>Formato:</span>
                  <span class="font-mono font-bold" [style.color]="colors.primary">SP-####</span>
                  <span>(proporcionado por tu líder de célula)</span>
                </div>
              </div>

              <!-- Action Card 2: Área de Liderazgo (Verificación y Creación de Grupos) -->
              <div class="p-5 rounded-2xl border space-y-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-base" [style.color]="colors.primary">military_tech</span>
                    <h4 class="text-xs sm:text-sm font-bold">Líderes de Grupo Su Presencia</h4>
                  </div>
                  @if (firebase.isLeader()) {
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] px-2 py-0.5 rounded-full uppercase font-black bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        👑 Rol Activo
                      </span>
                      <button
                        type="button"
                        (click)="onExitLeaderMode()"
                        title="Desactivar modo líder"
                        class="text-[10px] px-2 py-0.5 rounded-lg border font-semibold hover:opacity-80 transition cursor-pointer text-stone-400 hover:text-stone-200"
                        [style.borderColor]="colors.border">
                        Salir de Líder
                      </button>
                    </div>
                  }
                </div>

                @if (!firebase.isLeader()) {
                  <p class="text-xs" [style.color]="colors.textSecondary">
                    ¿Eres líder o colíder de célula? Valida tu credencial para crear y administrar grupos en la agenda:
                  </p>

                  <div class="flex items-center gap-2 flex-wrap">
                    <input
                      type="password"
                      [ngModel]="leaderCodeInput()"
                      (ngModelChange)="leaderCodeInput.set($event)"
                      placeholder="Clave pastoral (ej. LIDER2026)"
                      autocomplete="off"
                      class="flex-1 min-w-[180px] px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border font-mono font-bold focus:outline-none focus:ring-2"
                      [style.backgroundColor]="colors.surface"
                      [style.borderColor]="colors.border"
                      [style.color]="colors.textPrimary">

                    <button
                      type="button"
                      (click)="onVerifyLeader()"
                      [disabled]="!leaderCodeInput().trim()"
                      class="px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      [style.borderColor]="colors.border"
                      [style.color]="colors.textPrimary">
                      <span class="material-icons text-sm">verified</span>
                      <span>Validar Líder</span>
                    </button>
                  </div>
                  <span class="text-[10px]" [style.color]="colors.textMuted">
                    * Clave de verificación para prueba: <code>LIDER2026</code> o <code>SUPRESENCIA</code>
                  </span>
                } @else {
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p class="text-xs font-medium" [style.color]="colors.textSecondary">
                      Tu rol de Líder está verificado. Puedes crear una nueva célula y generar el código para tus discípulos:
                    </p>
                    <button
                      type="button"
                      (click)="showCreateGroupForm.set(!showCreateGroupForm())"
                      class="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer shrink-0"
                      [style.backgroundColor]="colors.primary">
                      <span class="material-icons text-sm">{{ showCreateGroupForm() ? 'close' : 'group_add' }}</span>
                      <span>{{ showCreateGroupForm() ? 'Cerrar' : '+ Crear Grupo de Conexión' }}</span>
                    </button>
                  </div>

                  <!-- Create Group Form -->
                  @if (showCreateGroupForm()) {
                    <form [formGroup]="createGroupForm" (ngSubmit)="onCreateGroup()"
                          class="mt-3 p-4 rounded-xl border space-y-3 animate-fadeSlideUp"
                          [style.backgroundColor]="colors.surface"
                          [style.borderColor]="colors.border">
                      <h5 class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.primary">
                        Nuevo Grupo de Conexión
                      </h5>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div class="sm:col-span-2">
                          <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Nombre del Grupo</label>
                          <input type="text" formControlName="name" placeholder="Ej. Valientes Zona Norte, Hijas de Gracia..."
                                 class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                                 [style.borderColor]="colors.border">
                        </div>
                        <div>
                          <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Día de Reunión</label>
                          <select formControlName="meetingDay" class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none" [style.borderColor]="colors.border">
                            <option value="Miércoles">Miércoles</option>
                            <option value="Jueves">Jueves</option>
                            <option value="Viernes">Viernes</option>
                            <option value="Sábado">Sábado</option>
                            <option value="Domingo">Domingo</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Hora</label>
                          <input type="text" formControlName="meetingTime" placeholder="Ej. 7:30 PM"
                                 class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                                 [style.borderColor]="colors.border">
                        </div>
                        <div class="sm:col-span-2">
                          <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Lugar o Enlace Virtual</label>
                          <input type="text" formControlName="location" placeholder="Ej. Casa de Familia / Zoom"
                                 class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                                 [style.borderColor]="colors.border">
                        </div>
                        <div class="sm:col-span-2">
                          <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Propósito / Descripción del Grupo</label>
                          <textarea formControlName="description" rows="2" placeholder="Breve visión o descripción de este grupo de conexión..."
                                 class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none resize-none"
                                 [style.borderColor]="colors.border"></textarea>
                        </div>
                      </div>

                      <div class="flex justify-end gap-2 pt-2">
                        <button type="button" (click)="showCreateGroupForm.set(false)" class="px-3 py-1.5 text-xs font-semibold hover:opacity-80">Cancelar</button>
                        <button type="submit" [disabled]="createGroupForm.invalid" class="px-4 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50" [style.backgroundColor]="colors.primary">
                          Guardar y Activar Grupo
                        </button>
                      </div>
                    </form>
                  }
                }

              </div>

            </div>
          } @else {

            <!-- CASE 2: ACTIVE GROUP VIEW -->
            <div class="space-y-5">
              
              <!-- Group Profile Header Banner -->
              <div class="p-5 rounded-2xl border space-y-3 relative overflow-hidden"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="material-icons text-xl" [style.color]="colors.primary">diversity_1</span>
                      <h4 class="text-base font-extrabold tracking-tight">{{ firebase.activeGroup()!.name }}</h4>
                    </div>
                    <p class="text-xs" [style.color]="colors.textSecondary">
                      {{ firebase.activeGroup()!.description }}
                    </p>
                  </div>

                  <!-- Group Code Badge with Copy button & Actions -->
                  <div class="flex items-center gap-2 shrink-0 flex-wrap">
                    <div class="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono font-bold text-xs"
                         [style.backgroundColor]="colors.surface"
                         [style.borderColor]="colors.border">
                      <span class="text-[10px] uppercase font-sans font-bold" [style.color]="colors.textMuted">Código:</span>
                      <span [style.color]="colors.primary">{{ firebase.activeGroup()!.code }}</span>
                      <button type="button" (click)="copyGroupCode()" title="Copiar código de invitación" class="hover:opacity-80 cursor-pointer ml-1">
                        <span class="material-icons text-xs">content_copy</span>
                      </button>
                    </div>

                    @if (isGroupLeader()) {
                      <button
                        type="button"
                        (click)="onDeleteGroup()"
                        title="Eliminar este grupo de conexión"
                        class="px-2.5 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1 transition cursor-pointer">
                        <span class="material-icons text-xs">delete_forever</span>
                        <span>Borrar Grupo</span>
                      </button>
                    }

                    @if (firebase.isLeader()) {
                      <button
                        type="button"
                        (click)="onExitLeaderMode()"
                        title="Desactivar modo líder"
                        class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer text-amber-500 hover:bg-amber-500/10"
                        [style.borderColor]="colors.border">
                        <span class="material-icons text-xs">person_remove</span>
                        <span>Salir de Líder</span>
                      </button>
                    }

                    <button
                      type="button"
                      (click)="onLeaveGroup()"
                      title="Salir de este grupo"
                      class="px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      [style.borderColor]="colors.border"
                      [style.color]="colors.textSecondary">
                      <span class="material-icons text-xs">logout</span>
                      <span>Salir</span>
                    </button>
                  </div>
                </div>

                <!-- Group Metadata Pills -->
                <div class="flex items-center gap-3 pt-2 border-t text-xs flex-wrap font-medium"
                     [style.borderColor]="colors.border"
                     [style.color]="colors.textSecondary">
                  <span class="flex items-center gap-1">
                    <span class="material-icons text-xs" [style.color]="colors.primary">person</span>
                    Líder: <strong>{{ firebase.activeGroup()!.leaderName }}</strong>
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-icons text-xs" [style.color]="colors.primary">schedule</span>
                    {{ firebase.activeGroup()!.meetingDay }} • {{ firebase.activeGroup()!.meetingTime }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-icons text-xs" [style.color]="colors.primary">place</span>
                    {{ firebase.activeGroup()!.location }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-icons text-xs" [style.color]="colors.primary">group</span>
                    {{ firebase.activeGroup()!.membersCount }} miembros
                  </span>
                </div>

              </div>

              <!-- Internal Group Tabs -->
              <div class="flex items-center gap-2 border-b pb-2 text-xs font-bold" [style.borderColor]="colors.border">
                <button
                  type="button"
                  (click)="groupInnerTab.set('announcements')"
                  class="pb-1.5 px-2 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-1"
                  [style.borderColor]="groupInnerTab() === 'announcements' ? colors.primary : 'transparent'"
                  [style.color]="groupInnerTab() === 'announcements' ? colors.primary : colors.textMuted">
                  <span class="material-icons text-sm">campaign</span>
                  <span>Avisos del Líder</span>
                </button>

                <button
                  type="button"
                  (click)="groupInnerTab.set('prayers')"
                  class="pb-1.5 px-2 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-1"
                  [style.borderColor]="groupInnerTab() === 'prayers' ? colors.primary : 'transparent'"
                  [style.color]="groupInnerTab() === 'prayers' ? colors.primary : colors.textMuted">
                  <span class="material-icons text-sm">lock</span>
                  <span>Oración del Grupo</span>
                </button>

                <button
                  type="button"
                  (click)="groupInnerTab.set('thermometer')"
                  class="pb-1.5 px-2 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-1"
                  [style.borderColor]="groupInnerTab() === 'thermometer' ? colors.primary : 'transparent'"
                  [style.color]="groupInnerTab() === 'thermometer' ? colors.primary : colors.textMuted">
                  <span class="material-icons text-sm">local_fire_department</span>
                  <span>Termómetro R07</span>
                </button>
              </div>

              <!-- SUB-VIEW 1: AVISOS DEL LÍDER -->
              @if (groupInnerTab() === 'announcements') {
                <div class="space-y-4 animate-fadeIn">
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold" [style.color]="colors.textSecondary">Muro de Anuncios y Guía Semanal</span>
                    @if (firebase.isLeader()) {
                      <button
                        type="button"
                        (click)="showGroupAnnForm.set(!showGroupAnnForm())"
                        class="px-3 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        [style.backgroundColor]="colors.primary">
                        <span class="material-icons text-xs">{{ showGroupAnnForm() ? 'close' : 'add' }}</span>
                        <span>{{ showGroupAnnForm() ? 'Cerrar' : '+ Publicar Aviso' }}</span>
                      </button>
                    }
                  </div>

                  @if (showGroupAnnForm()) {
                    <form [formGroup]="groupAnnForm" (ngSubmit)="onPostAnnouncement()"
                          class="p-4 rounded-xl border space-y-3 animate-fadeSlideUp"
                          [style.backgroundColor]="colors.background"
                          [style.borderColor]="colors.border">
                      <div>
                        <label class="block text-[11px] font-semibold mb-1">Título del Aviso</label>
                        <input type="text" formControlName="title" placeholder="Ej. Guía devocional de la semana, reunión presencial..."
                               class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                               [style.borderColor]="colors.border">
                      </div>
                      <div>
                        <label class="block text-[11px] font-semibold mb-1">Mensaje para la Célula</label>
                        <textarea rows="3" formControlName="content" placeholder="Escribe el anuncio con indicaciones..."
                                  class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none resize-none"
                                  [style.borderColor]="colors.border"></textarea>
                      </div>
                      <div class="flex justify-end gap-2">
                        <button type="button" (click)="showGroupAnnForm.set(false)" class="px-3 py-1.5 text-xs">Cancelar</button>
                        <button type="submit" [disabled]="groupAnnForm.invalid" class="px-4 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50" [style.backgroundColor]="colors.primary">
                          Publicar Aviso
                        </button>
                      </div>
                    </form>
                  }

                  <!-- Announcements list -->
                  <div class="space-y-3">
                    @for (ann of firebase.activeGroup()!.announcements || []; track ann.id) {
                      <div class="p-4 rounded-2xl border space-y-2 relative"
                           [style.backgroundColor]="ann.isImportant ? colors.primaryLight : colors.surface"
                           [style.borderColor]="colors.border">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold flex items-center gap-1.5" [style.color]="colors.primary">
                            <span class="material-icons text-sm">campaign</span>
                            {{ ann.title }}
                          </span>
                          <span class="text-[10px] font-semibold" [style.color]="colors.textMuted">{{ ann.date }}</span>
                        </div>
                        <p class="text-xs leading-relaxed" [style.color]="colors.textPrimary">{{ ann.content }}</p>
                        <div class="text-[10px] flex items-center gap-1 font-semibold" [style.color]="colors.textMuted">
                          <span>Por:</span> <strong>{{ ann.authorName }}</strong>
                        </div>
                      </div>
                    } @empty {
                      <div class="p-6 text-center text-xs border border-dashed rounded-xl" [style.color]="colors.textMuted">
                        No hay anuncios en este momento.
                      </div>
                    }
                  </div>

                </div>
              }

              <!-- SUB-VIEW 2: ORACIONES ÍNTIMAS DEL GRUPO -->
              @if (groupInnerTab() === 'prayers') {
                <div class="space-y-4 animate-fadeIn">
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold" [style.color]="colors.textSecondary">Peticiones Privadas del Grupo</span>
                    <button
                      type="button"
                      (click)="showGroupPrayerForm.set(!showGroupPrayerForm())"
                      class="px-3 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      [style.backgroundColor]="colors.primary">
                      <span class="material-icons text-xs">{{ showGroupPrayerForm() ? 'close' : 'add' }}</span>
                      <span>{{ showGroupPrayerForm() ? 'Cerrar' : '+ Petición Íntima' }}</span>
                    </button>
                  </div>

                  @if (showGroupPrayerForm()) {
                    <form [formGroup]="groupPrayerForm" (ngSubmit)="onPostGroupPrayer()"
                          class="p-4 rounded-xl border space-y-3 animate-fadeSlideUp"
                          [style.backgroundColor]="colors.background"
                          [style.borderColor]="colors.border">
                      <div>
                        <label class="block text-[11px] font-semibold mb-1">Motivo Confidencial</label>
                        <input type="text" formControlName="title" placeholder="Ej. Oración por salud personal, decisión de fe..."
                               class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none"
                               [style.borderColor]="colors.border">
                      </div>
                      <div>
                        <label class="block text-[11px] font-semibold mb-1">Detalle</label>
                        <textarea rows="3" formControlName="content" placeholder="Escribe tu motivo confidencial..."
                                  class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none resize-none"
                                  [style.borderColor]="colors.border"></textarea>
                      </div>
                      <div class="flex justify-end gap-2">
                        <button type="button" (click)="showGroupPrayerForm.set(false)" class="px-3 py-1.5 text-xs">Cancelar</button>
                        <button type="submit" [disabled]="groupPrayerForm.invalid" class="px-4 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50" [style.backgroundColor]="colors.primary">
                          Compartir con el Grupo
                        </button>
                      </div>
                    </form>
                  }

                  <!-- Group Prayers List -->
                  <div class="space-y-3">
                    @for (gp of firebase.activeGroup()!.prayerRequests || []; track gp.id) {
                      <div class="p-4 rounded-2xl border space-y-2 relative"
                           [style.backgroundColor]="colors.surface"
                           [style.borderColor]="colors.border">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold flex items-center gap-1.5" [style.color]="colors.textPrimary">
                            <span class="material-icons text-xs" [style.color]="colors.primary">lock</span>
                            {{ gp.userName }}
                          </span>
                          <div class="flex items-center gap-2">
                            <button
                              type="button"
                              (click)="onPrayForGroupPrayer(gp)"
                              class="px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 hover:opacity-80"
                              [style.backgroundColor]="colors.primaryLight"
                              [style.color]="colors.primary">
                              <span class="material-icons text-xs">volunteer_activism</span>
                              <span>{{ gp.prayerCount }} He orado</span>
                            </button>
                            @if (canDeleteGroupPrayer(gp)) {
                              <button
                                type="button"
                                (click)="onDeleteGroupPrayer(gp)"
                                title="Eliminar mi petición"
                                class="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer">
                                <span class="material-icons text-xs">delete_outline</span>
                              </button>
                            }
                          </div>
                        </div>
                        <h5 class="text-xs font-bold" [style.color]="colors.textPrimary">{{ gp.title }}</h5>
                        <p class="text-xs leading-relaxed" [style.color]="colors.textSecondary">{{ gp.content }}</p>
                      </div>
                    } @empty {
                      <div class="p-6 text-center text-xs border border-dashed rounded-xl" [style.color]="colors.textMuted">
                        Aún no hay peticiones privadas en el grupo.
                      </div>
                    }
                  </div>

                </div>
              }

              <!-- SUB-VIEW 3: TERMÓMETRO DEVOCIONAL -->
              @if (groupInnerTab() === 'thermometer') {
                <div class="p-5 rounded-2xl border space-y-4 animate-fadeIn text-center"
                     [style.backgroundColor]="colors.background"
                     [style.borderColor]="colors.border">
                  
                  <div class="inline-flex p-3 rounded-2xl text-white shadow-xs" [style.backgroundColor]="colors.primary">
                    <span class="material-icons text-3xl">local_fire_department</span>
                  </div>

                  <div>
                    <h4 class="text-sm font-extrabold mb-1">Termómetro Devocional de la Célula</h4>
                    <p class="text-xs max-w-md mx-auto" [style.color]="colors.textSecondary">
                      «El hierro con hierro se afila; y así el hombre aguza el rostro de su amigo» (Proverbios 27:17)
                    </p>
                  </div>

                  <!-- Progress Gauge -->
                  <div class="max-w-xs mx-auto space-y-2">
                    <div class="flex items-center justify-between text-xs font-bold">
                      <span>Devocional de Hoy</span>
                      <span [style.color]="colors.primary">85% Completado 🔥</span>
                    </div>
                    <div class="w-full h-3 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800">
                      <div class="h-full rounded-full transition-all duration-1000"
                           [style.width]="'85%'"
                           [style.backgroundColor]="colors.primary"></div>
                    </div>
                    <span class="text-[11px] block" [style.color]="colors.textMuted">
                      11 de 14 hermanos ya pasaron tiempo con Dios hoy
                    </span>
                  </div>

                  <!-- Weekly check indicators -->
                  <div class="pt-3 border-t flex justify-center gap-2 text-xs" [style.borderColor]="colors.border">
                    @for (d of ['L', 'M', 'M', 'J', 'V', 'S', 'D']; track $index) {
                      <div class="flex flex-col items-center gap-1">
                        <span class="text-[10px] font-bold" [style.color]="colors.textMuted">{{ d }}</span>
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                              [style.backgroundColor]="$index <= 2 ? colors.primary : colors.surface"
                              [style.color]="$index <= 2 ? '#ffffff' : colors.textMuted"
                              [style.border]="'1px solid ' + colors.border">
                          {{ $index <= 2 ? '✓' : '·' }}
                        </span>
                      </div>
                    }
                  </div>

                </div>
              }

            </div>

          }

        </div>
      }

      <!-- Modal de Confirmación In-App (sin bloqueos de window.confirm en Android) -->
      @if (confirmDialog(); as cd) {
        <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn"
             (click)="confirmDialog.set(null)">
          <div class="w-full max-w-sm rounded-2xl p-5 border shadow-2xl space-y-4"
               [style.backgroundColor]="colors.surface"
               [style.borderColor]="colors.border"
               (click)="$event.stopPropagation()">
            <div class="flex items-center gap-2">
              <span class="material-icons text-xl" [style.color]="cd.isDanger ? '#ef4444' : colors.primary">
                {{ cd.isDanger ? 'warning' : 'help_outline' }}
              </span>
              <h4 class="text-sm font-bold" [style.color]="colors.textPrimary">{{ cd.title }}</h4>
            </div>
            <p class="text-xs leading-relaxed" [style.color]="colors.textSecondary">{{ cd.message }}</p>
            <div class="flex items-center gap-2 pt-1">
              <button
                type="button"
                (click)="confirmDialog.set(null)"
                class="flex-1 py-2.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
                [style.borderColor]="colors.border"
                [style.color]="colors.textSecondary">
                Cancelar
              </button>
              <button
                type="button"
                (click)="executeConfirmAction()"
                class="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition hover:opacity-90 cursor-pointer shadow-xs"
                [style.backgroundColor]="cd.isDanger ? '#ef4444' : colors.primary">
                {{ cd.confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      }

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

  public confirmDialog = signal<{
    title: string;
    message: string;
    confirmLabel: string;
    isDanger?: boolean;
    action: () => void | Promise<void>;
  } | null>(null);

  public executeConfirmAction(): void {
    const dlg = this.confirmDialog();
    if (dlg) {
      this.confirmDialog.set(null);
      void dlg.action();
    }
  }

  // Navigation and Grupos de Conexión State
  public activeSubTab = signal<'wall' | 'groups'>('wall');
  public groupInnerTab = signal<'announcements' | 'prayers' | 'thermometer'>('announcements');
  public selectedCategory = signal<string>('todas');

  public joinCodeInput = signal<string>('');
  public leaderCodeInput = signal<string>('');
  public showCreateGroupForm = signal<boolean>(false);
  public showGroupAnnForm = signal<boolean>(false);
  public showGroupPrayerForm = signal<boolean>(false);

  public prayerForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    category: new FormControl<'salud' | 'familia' | 'finanzas' | 'espiritual' | 'misiones' | 'otro'>('salud', [Validators.required]),
    content: new FormControl('', [Validators.required, Validators.maxLength(2000)])
  });

  public createGroupForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    meetingDay: new FormControl('Jueves', [Validators.required]),
    meetingTime: new FormControl('7:30 PM', [Validators.required]),
    location: new FormControl('Presencial / Enlace Virtual', [Validators.maxLength(150)]),
    description: new FormControl('', [Validators.maxLength(300)])
  });

  public groupAnnForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(150)]),
    content: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
    isImportant: new FormControl(false)
  });

  public groupPrayerForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(150)]),
    content: new FormControl('', [Validators.required, Validators.maxLength(1000)])
  });

  public filteredPrayers = () => {
    const cat = this.selectedCategory();
    if (cat === 'todas') return this.prayersList();
    return this.prayersList().filter(p => p.category === cat);
  };

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

  public deletePrayer(prayer: CommunityPrayer): void {
    this.confirmDialog.set({
      title: '¿Eliminar petición de oración?',
      message: `¿Deseas eliminar «${prayer.title}» del muro de oración?`,
      confirmLabel: 'Eliminar',
      isDanger: true,
      action: async () => {
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
    });
  }

  // ==========================================
  // GRUPOS DE CONEXIÓN ACTIONS
  // ==========================================

  public canDeleteGroupPrayer(gp: GroupPrayer): boolean {
    const currentUid = this.firebase.userUid();
    if (currentUid && gp.userId && gp.userId === currentUid) {
      return true;
    }
    if (this.myPrayerIds().has(gp.id)) {
      return true;
    }
    return false;
  }

  public async onJoinGroup(): Promise<void> {
    if (!this.firebase.isSignedIn()) {
      this.storage.showSnackbar('Debes iniciar sesión para unirte a un grupo de conexión 🔐');
      this.storage.openAuthModal();
      return;
    }

    const code = this.joinCodeInput().trim();
    if (!code) return;

    this.firebase.ultimoError.set(null);
    const grp = await this.firebase.joinConnectionGroupByCode(code);
    if (grp) {
      this.storage.showSnackbar(`¡Te uniste con éxito a «${grp.name}»! 👥✨`);
      this.joinCodeInput.set('');
    } else {
      const err = this.firebase.ultimoError();
      if (err) {
        this.storage.showSnackbar(`Error: ${err} ⚠️`);
      } else {
        this.storage.showSnackbar('Código no encontrado. Verifica con tu líder. ⚠️');
      }
    }
  }

  public onVerifyLeader(): void {
    const code = this.leaderCodeInput().trim();
    if (!code) return;

    const ok = this.firebase.verifyLeaderCode(code);
    if (ok) {
      this.storage.showSnackbar('¡Credencial de Líder verificada con éxito! 👑');
      this.leaderCodeInput.set('');
    } else {
      this.storage.showSnackbar('Clave incorrecta. Consulta con tu pastor o líder de red. ⚠️');
    }
  }

  public async onCreateGroup(): Promise<void> {
    if (!this.firebase.isSignedIn()) {
      this.storage.showSnackbar('Debes iniciar sesión para crear un grupo de conexión 🔐');
      this.storage.openAuthModal();
      return;
    }

    if (this.createGroupForm.invalid) return;

    this.firebase.ultimoError.set(null);
    const val = this.createGroupForm.value;
    const grp = await this.firebase.createConnectionGroup({
      name: val.name!,
      meetingDay: val.meetingDay || 'Jueves',
      meetingTime: val.meetingTime || '7:30 PM',
      location: val.location || 'Presencial / Enlace Virtual',
      description: val.description || undefined
    });

    this.showCreateGroupForm.set(false);
    const err = this.firebase.ultimoError();
    if (err) {
      this.storage.showSnackbar(`Grupo creado localmente, pero falló en la nube: ${err} ⚠️`);
    } else {
      this.storage.showSnackbar(`¡Grupo «${grp.name}» creado! Tu código es ${grp.code} 🕊️`);
    }
  }

  public isGroupLeader = () => {
    const grp = this.firebase.activeGroup();
    if (!grp) return false;
    const uid = this.firebase.userUid();
    return this.firebase.isLeader() || (!!uid && grp.leaderId === uid) || grp.leaderId === 'local_leader';
  };

  public onDeleteGroup(): void {
    const grp = this.firebase.activeGroup();
    if (!grp) return;

    this.confirmDialog.set({
      title: '¿Eliminar grupo de conexión?',
      message: `¿Estás seguro de que deseas eliminar el grupo «${grp.name}» (${grp.code})? Esta acción eliminará los avisos y peticiones del grupo.`,
      confirmLabel: 'Sí, eliminar grupo',
      isDanger: true,
      action: async () => {
        const ok = await this.firebase.deleteConnectionGroup(grp.id);
        if (ok) {
          this.storage.showSnackbar(`Grupo «${grp.name}» eliminado correctamente 🗑️`);
        } else {
          this.storage.showSnackbar('No se pudo eliminar el grupo. Inténtalo de nuevo.');
        }
      }
    });
  }

  public onExitLeaderMode(): void {
    this.confirmDialog.set({
      title: '¿Salir del modo líder?',
      message: 'Tu rol pasará a miembro. Podrás volver a reactivarlo con tu clave pastoral cuando lo necesites.',
      confirmLabel: 'Salir de líder',
      isDanger: false,
      action: () => {
        this.firebase.exitLeaderRole();
        this.storage.showSnackbar('Has salido del modo líder. Rol cambiado a miembro.');
      }
    });
  }

  public onLeaveGroup(): void {
    const grp = this.firebase.activeGroup();
    this.confirmDialog.set({
      title: '¿Salir del grupo de conexión?',
      message: grp ? `Dejarás de recibir avisos de «${grp.name}». Puedes volver a unirte con el código en cualquier momento.` : '¿Deseas salir de este grupo de conexión?',
      confirmLabel: 'Salir del grupo',
      isDanger: false,
      action: () => {
        this.firebase.leaveConnectionGroup();
        this.storage.showSnackbar('Has salido del grupo de conexión.');
      }
    });
  }

  public async onPostAnnouncement(): Promise<void> {
    if (this.groupAnnForm.invalid) return;
    const val = this.groupAnnForm.value;

    await this.firebase.postGroupAnnouncement({
      title: val.title!,
      content: val.content!,
      isImportant: !!val.isImportant
    });

    this.groupAnnForm.reset({ isImportant: false });
    this.showGroupAnnForm.set(false);
    this.storage.showSnackbar('Aviso publicado para el grupo 📢');
  }

  public async onPostGroupPrayer(): Promise<void> {
    if (this.groupPrayerForm.invalid) return;
    const val = this.groupPrayerForm.value;

    await this.firebase.postGroupPrayer({
      title: val.title!,
      content: val.content!
    });

    this.groupPrayerForm.reset();
    this.showGroupPrayerForm.set(false);
    this.storage.showSnackbar('Petición compartida en privado con tu grupo 🙏');
  }

  public async onPrayForGroupPrayer(gp: GroupPrayer): Promise<void> {
    await this.firebase.incrementGroupPrayerCounter(gp.id);
    this.storage.showSnackbar('¡Te has unido en oración! 🕊️');
  }

  public onDeleteGroupPrayer(gp: GroupPrayer): void {
    this.confirmDialog.set({
      title: '¿Eliminar petición del grupo?',
      message: `¿Deseas eliminar la petición «${gp.title}» del grupo privado?`,
      confirmLabel: 'Eliminar',
      isDanger: true,
      action: async () => {
        await this.firebase.deleteGroupPrayer(gp.id);
        this.removeMyPrayerId(gp.id);
        this.storage.showSnackbar('Petición eliminada del grupo 🗑️');
      }
    });
  }

  public copyGroupCode(): void {
    const grp = this.firebase.activeGroup();
    if (!grp) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(grp.code).catch(() => {});
    }
    this.storage.showSnackbar(`Código «${grp.code}» copiado al portapapeles 📋`);
  }
}
