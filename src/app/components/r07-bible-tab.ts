import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { BibleService, BIBLE_BOOKS, BibleBook, SingleVerse } from '../services/bible.service';
import { SavedVerse } from '../models/r07.models';
import { GeminiService } from '../services/gemini.service';
import { EstudioService } from '../estudio/services/estudio.service';
import { R07MarcadorSheetComponent } from '../estudio/components/r07-marcador-sheet';
import { R07EstudioTabComponent } from '../estudio/components/r07-estudio-tab';
import { TEMA_POR_ID, type RefVersiculo } from '../estudio/models/estudio.models';

@Component({
  selector: 'app-r07-bible-tab',
  imports: [CommonModule, FormsModule, R07MarcadorSheetComponent, R07EstudioTabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto pb-2 animate-fadeIn">

      <!-- Leer / Estudio: el estudio vive DENTRO de Biblia, que es donde se busca -->
      <div class="flex gap-1.5 p-1.5 rounded-2xl mb-3" [style.backgroundColor]="colors.surface">
        @for (v of vistasBiblia; track v.id) {
          <button type="button" (click)="vistaBiblia.set(v.id)"
            class="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
            [style.backgroundColor]="vistaBiblia() === v.id ? colors.primary : 'transparent'"
            [style.color]="vistaBiblia() === v.id ? '#ffffff' : colors.textMuted">
            {{ v.nombre }}
          </button>
        }
      </div>

      @if (vistaBiblia() === 'estudio') {
        <div class="flex-1 min-h-0 rounded-3xl overflow-hidden border"
             [style.borderColor]="colors.border">
          <r07-estudio-tab />
        </div>
      } @else {
      
      <!-- Top Control Bar with Big Version Switch and Book Selector -->
      <div class="p-3.5 sm:p-4 border-b rounded-3xl mb-3 shadow-xs space-y-3"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Row 1: Book & Chapter trigger + Big Translation Switch -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          
          <!-- Book Selector Button -->
          <button
            type="button"
            (click)="toggleBookSelector()"
            class="px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 transition hover:scale-[1.02] cursor-pointer shadow-xs"
            [style.backgroundColor]="colors.primaryLight"
            [style.borderColor]="colors.border"
            [style.color]="colors.primary">
            <span class="material-icons text-base">menu_book</span>
            <span>{{ selectedBook().name }} {{ selectedChapter() }}</span>
            <span class="material-icons text-sm">{{ showBookSelector() ? 'expand_less' : 'expand_more' }}</span>
          </button>

          <!-- Big Version Toggle Switch (RVR1960 / NTV) -->
          <div class="flex items-center rounded-2xl border p-1 shadow-2xs"
               [style.borderColor]="colors.border"
               [style.backgroundColor]="colors.background">
            <button
              type="button"
              (click)="setVersion('RVR1960')"
              class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
              [style.backgroundColor]="selectedVersion() === 'RVR1960' ? colors.primary : 'transparent'"
              [style.color]="selectedVersion() === 'RVR1960' ? '#ffffff' : colors.textMuted">
              Reina Valera 1960
            </button>
            <button
              type="button"
              (click)="setVersion('NTV')"
              class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer"
              [style.backgroundColor]="selectedVersion() === 'NTV' ? colors.primary : 'transparent'"
              [style.color]="selectedVersion() === 'NTV' ? '#ffffff' : colors.textMuted">
              NTV (Viviente)
            </button>
          </div>

          <!-- Navigation Chevrons & Font Size -->
          <div class="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              (click)="prevChapter()"
              [disabled]="selectedChapter() <= 1"
              title="Capítulo anterior"
              class="w-8 h-8 rounded-xl border flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
              [style.borderColor]="colors.border"
              [style.backgroundColor]="colors.surface">
              <span class="material-icons text-sm">chevron_left</span>
            </button>

            <button
              type="button"
              (click)="nextChapter()"
              [disabled]="selectedChapter() >= selectedBook().chapters"
              title="Capítulo siguiente"
              class="w-8 h-8 rounded-xl border flex items-center justify-center transition disabled:opacity-30 cursor-pointer"
              [style.borderColor]="colors.border"
              [style.backgroundColor]="colors.surface">
              <span class="material-icons text-sm">chevron_right</span>
            </button>

            <button
              type="button"
              (click)="toggleFontSize()"
              title="Tamaño de letra"
              class="px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer"
              [style.borderColor]="colors.border"
              [style.backgroundColor]="colors.surface"
              [style.color]="colors.primary">
              {{ fontSize() === 'text-sm' ? 'A' : fontSize() === 'text-base' ? 'A+' : 'A++' }}
            </button>

            <!-- Saved Verses Button -->
            <button
              type="button"
              (click)="showSavedVerses.set(!showSavedVerses())"
              title="Mis versículos guardados"
              class="px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
              [style.borderColor]="showSavedVerses() ? colors.primary : colors.border"
              [style.backgroundColor]="showSavedVerses() ? colors.primaryLight : colors.surface"
              [style.color]="showSavedVerses() ? colors.primary : colors.textPrimary">
              <span class="material-icons text-sm" [style.color]="colors.primary">bookmark</span>
              <span class="hidden sm:inline">Guardados</span>
              <span class="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                    [style.backgroundColor]="colors.primary"
                    [style.color]="'#ffffff'">
                {{ storage.savedVerses().length }}
              </span>
            </button>
          </div>

        </div>

        <!-- Saved Verses Drawer / View -->
        @if (showSavedVerses()) {
          <div class="p-4 sm:p-5 rounded-2xl border shadow-xl space-y-4 animate-fadeIn transition-colors"
               [style.backgroundColor]="colors.card"
               [style.borderColor]="colors.border">
            <div class="flex items-center justify-between pb-3 border-b" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2">
                <span class="text-amber-500 text-base">⭐</span>
                <h3 class="text-sm sm:text-base font-extrabold tracking-tight">
                  Mis Versículos Guardados ({{ storage.savedVerses().length }})
                </h3>
              </div>
              <button
                type="button"
                (click)="showSavedVerses.set(false)"
                class="p-1 rounded-xl hover:opacity-75 cursor-pointer">
                <span class="material-icons text-base">close</span>
              </button>
            </div>

            @if (storage.savedVerses().length === 0) {
              <div class="py-8 text-center space-y-2">
                <span class="material-icons text-3xl opacity-30">bookmark_border</span>
                <p class="text-xs font-semibold" [style.color]="colors.textMuted">
                  Aún no tienes versículos guardados.
                </p>
                <p class="text-[11px] opacity-70">
                  Toca cualquier versículo mientras lees la Biblia y selecciona «Guardar en Mis Versículos» para consultarlo aquí cuando quieras.
                </p>
              </div>
            } @else {
              <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                @for (sv of storage.savedVerses(); track sv.id) {
                  <div class="p-3 rounded-xl border flex flex-col gap-2 transition hover:shadow-2xs"
                       [style.backgroundColor]="colors.surface"
                       [style.borderColor]="colors.border">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-extrabold" [style.color]="colors.primary">
                        📖 {{ sv.book }} {{ sv.chapter }}:{{ sv.verse }}
                        <span class="text-[10px] font-semibold opacity-60">({{ sv.version }})</span>
                      </span>
                      <div class="flex items-center gap-1">
                        <button
                          type="button"
                          (click)="goToSavedVerse(sv)"
                          class="px-2 py-0.5 rounded-lg text-[10px] font-bold border transition hover:opacity-80 cursor-pointer"
                          [style.borderColor]="colors.border"
                          [style.color]="colors.primary">
                          Ir al capítulo
                        </button>
                        <button
                          type="button"
                          (click)="copySavedVerse(sv)"
                          title="Copiar texto"
                          class="p-1 rounded-lg hover:opacity-75 cursor-pointer text-stone-500">
                          <span class="material-icons text-xs">content_copy</span>
                        </button>
                        <button
                          type="button"
                          (click)="storage.removeSavedVerse(sv.id)"
                          title="Eliminar de guardados"
                          class="p-1 rounded-lg hover:text-red-500 cursor-pointer text-stone-400">
                          <span class="material-icons text-xs">delete_outline</span>
                        </button>
                      </div>
                    </div>
                    <p class="text-xs leading-relaxed italic select-text font-serif" [style.color]="colors.textPrimary">
                      «{{ sv.text }}»
                    </p>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Big Expanded Book & Chapter Selector -->
        @if (showBookSelector()) {
          <div class="p-4 rounded-2xl border shadow-xl space-y-3.5 animate-fadeIn"
               [style.backgroundColor]="colors.card"
               [style.borderColor]="colors.border">
            
            <!-- Large Testament Tabs (Antiguo Testamento / Nuevo Testamento) -->
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="testamentFilter.set('Antiguo')"
                class="py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
                [style.backgroundColor]="testamentFilter() === 'Antiguo' ? colors.primary : colors.surface"
                [style.borderColor]="testamentFilter() === 'Antiguo' ? colors.primary : colors.border"
                [style.color]="testamentFilter() === 'Antiguo' ? '#ffffff' : colors.textPrimary">
                <span>📜 Antiguo Testamento (39)</span>
              </button>

              <button
                type="button"
                (click)="testamentFilter.set('Nuevo')"
                class="py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
                [style.backgroundColor]="testamentFilter() === 'Nuevo' ? colors.primary : colors.surface"
                [style.borderColor]="testamentFilter() === 'Nuevo' ? colors.primary : colors.border"
                [style.color]="testamentFilter() === 'Nuevo' ? '#ffffff' : colors.textPrimary">
                <span>✝️ Nuevo Testamento (27)</span>
              </button>
            </div>

            <!-- Search Filter Input -->
            <div>
              <input
                type="text"
                [(ngModel)]="searchFilter"
                placeholder="Buscar libro (ej. Salmos, Mateo, Proverbios, Romanos)..."
                class="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 shadow-2xs"
                [style.borderColor]="colors.border"
                [style.backgroundColor]="colors.background"
                [style.color]="colors.textPrimary">
            </div>

            <!-- Books Grid -->
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-none">
              @for (book of filteredBooks(); track book.number) {
                <button
                  type="button"
                  (click)="selectBook(book)"
                  class="px-2.5 py-2 rounded-xl border text-center text-xs font-bold truncate transition cursor-pointer hover:scale-105"
                  [style.backgroundColor]="selectedBook().number === book.number ? colors.primary : colors.surface"
                  [style.borderColor]="selectedBook().number === book.number ? colors.primary : colors.border"
                  [style.color]="selectedBook().number === book.number ? '#ffffff' : colors.textPrimary">
                  {{ book.name }}
                </button>
              }
            </div>

            <!-- Chapter Picker for selected book -->
            <div class="pt-3 border-t space-y-2" [style.borderColor]="colors.border">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold" [style.color]="colors.primary">
                  {{ selectedBook().name }} • Elige Capítulo (1 al {{ selectedBook().chapters }}):
                </span>
                <span class="text-[11px]" [style.color]="colors.textMuted">
                  {{ selectedBook().category }}
                </span>
              </div>
              <div class="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                @for (chap of chaptersList(); track chap) {
                  <button
                    type="button"
                    (click)="selectChapter(chap)"
                    class="w-9 h-9 rounded-xl border text-xs font-extrabold shrink-0 flex items-center justify-center transition cursor-pointer hover:scale-105"
                    [style.backgroundColor]="selectedChapter() === chap ? colors.primary : colors.surface"
                    [style.borderColor]="selectedChapter() === chap ? colors.primary : colors.border"
                    [style.color]="selectedChapter() === chap ? '#ffffff' : colors.textPrimary">
                    {{ chap }}
                  </button>
                }
              </div>
            </div>

          </div>
        }

      </div>

      <!-- Bible Text Reader Viewport -->
      <div class="flex-1 overflow-y-auto p-5 sm:p-7 rounded-3xl border shadow-xs leading-relaxed space-y-5 transition-colors duration-300 {{ storage.fontClass() }}"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        
        <!-- Passage Title Banner -->
        <div class="text-center pb-4 border-b space-y-1.5" [style.borderColor]="colors.border">
          <span class="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full inline-block"
                [style.backgroundColor]="colors.primaryLight"
                [style.color]="colors.primary">
            {{ selectedBook().testament }} Testamento • {{ selectedVersion() === 'RVR1960' ? 'Reina Valera 1960' : 'Nueva Traducción Viviente' }}
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
            {{ selectedBook().name }} {{ selectedChapter() }}
          </h1>
          <p class="text-xs opacity-75 italic">
            Toca cualquier versículo para guardarlo, compartirlo o asignarlo a tu devocional de hoy.
          </p>

          @if (hasHighlights()) {
            <div class="mt-2.5 px-3.5 py-1.5 rounded-2xl border inline-flex items-center gap-2 text-xs shadow-2xs"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.borderColor]="colors.border">
              <span class="font-bold text-xs flex items-center gap-1.5" [style.color]="colors.primary">
                <span class="material-icons text-sm">my_location</span>
                <span>Lectura: {{ storage.highlightedVerses()?.reference }}</span>
              </span>
              <button
                type="button"
                (click)="scrollToHighlightedIfNeeded()"
                class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-white shadow-xs cursor-pointer hover:opacity-90 transition active:scale-95 flex items-center gap-1"
                [style.backgroundColor]="colors.primary">
                <span class="material-icons text-[12px]">arrow_downward</span>
                <span>Ir al texto</span>
              </button>
              <button
                type="button"
                (click)="storage.highlightedVerses.set(null)"
                class="text-[10px] font-bold underline cursor-pointer opacity-75 hover:opacity-100 ml-1">
                Quitar marca
              </button>
            </div>
          }
        </div>

        <!-- Verses Stream -->
        @if (isLoading()) {
          <div class="py-16 text-center space-y-3">
            <span class="material-icons animate-spin text-3xl" [style.color]="colors.primary">autorenew</span>
            <p class="text-xs font-semibold" [style.color]="colors.textMuted">
              Cargando {{ selectedBook().name }} {{ selectedChapter() }} ({{ selectedVersion() }})...
            </p>
          </div>
        } @else {
          <div class="space-y-3 {{ fontSize() }}">
            @for (verse of currentVerses(); track verse.number) {
              <div
                [attr.id]="'verse-' + verse.number"
                (pointerdown)="presionoAbajo(verse.number)"
                (pointermove)="presionoMovio()"
                (pointerup)="presionoArriba(verse)"
                (pointercancel)="presionoMovio()"
                (contextmenu)="$event.preventDefault()"
                [style.borderLeftColor]="colorBorde(verse.number)"
                [style.backgroundColor]="colorFondo(verse.number)"
                class="verso-r07 group relative pl-8 pr-3 py-2.5 transition-all duration-200 rounded-r-2xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] border-l-4"
                [class.font-semibold]="isHighlighted(verse.number)"
                [class.shadow-2xs]="isHighlighted(verse.number)">
                
                @if (verse.number === storage.highlightedVerses()?.verseStart && hasHighlights()) {
                  <div class="mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-xs"
                       [style.backgroundColor]="colors.primary"
                       [style.color]="'#ffffff'">
                    <span class="material-icons text-xs">auto_awesome</span>
                    <span>Lectura de Hoy (v. {{ storage.highlightedVerses()?.verseStart }}-{{ storage.highlightedVerses()?.verseEnd }})</span>
                  </div>
                }

                <div class="relative">
                  <span class="absolute -left-6 top-0.5 text-xs font-black select-none font-serif"
                        [style.color]="isHighlighted(verse.number) ? colors.primary : colors.textMuted">
                    {{ verse.number }}
                  </span>
                  <span class="leading-relaxed select-none font-medium transition-all duration-300"
                        [style.textDecorationLine]="isVerseSaved(verse.number) ? 'underline' : 'none'"
                        [style.textDecorationColor]="isVerseSaved(verse.number) ? colors.primary : 'transparent'"
                        [style.textDecorationThickness]="isVerseSaved(verse.number) ? '2.5px' : 'auto'"
                        [style.textUnderlineOffset]="isVerseSaved(verse.number) ? '5px' : 'auto'">
                    {{ verse.text }}
                  </span>
                </div>
              </div>
            }
          </div>
        }

        <!-- Bottom Action Bar -->
        <div class="pt-6 border-t flex items-center justify-between gap-3 flex-wrap" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium" [style.color]="colors.textSecondary">
              {{ currentVerses().length }} versículos en este capítulo
            </span>
          </div>

          <button
            type="button"
            (click)="applyEntireChapterToToday()"
            class="px-4 py-2.5 rounded-2xl text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition hover:scale-105 cursor-pointer"
            [style.backgroundColor]="colors.primary">
            <span class="material-icons text-sm">edit_note</span>
            <span>Asignar Lectura a Devocional de Hoy</span>
          </button>
        </div>

      </div>

      <!-- Barra que aparece al seleccionar versículos -->
      @if (modoSeleccion()) {
        <div class="fixed left-3 right-3 z-[60] flex items-center gap-2.5 px-3 py-2.5 rounded-3xl border shadow-2xl"
             style="bottom: calc(74px + env(safe-area-inset-bottom))"
             [style.backgroundColor]="colors.card"
             [style.borderColor]="colors.border">
          <span class="flex-1 text-xs font-medium" [style.color]="colors.textSecondary">
            {{ seleccion().size }} versículo(s)
          </span>
          <button type="button" (click)="limpiarSeleccion()"
                  class="px-4 py-2.5 rounded-2xl text-sm cursor-pointer"
                  [style.color]="colors.textMuted">Cancelar</button>
          <button type="button" (click)="hojaAbierta.set(true)"
                  class="px-4 py-2.5 rounded-2xl text-sm font-bold text-white cursor-pointer"
                  [style.backgroundColor]="colors.primary">Marcar y comentar</button>
        </div>
      }

      @if (hojaAbierta() && refSeleccionada(); as refSel) {
        <r07-marcador-sheet
          [ref]="refSel"
          [texto]="textoSeleccionado()"
          (cerrar)="limpiarSeleccion()"
          (guardado)="limpiarSeleccion()" />
      }

      <!-- Interactive Verse Action Bottom Sheet Modal -->
      @if (activeVerseModal()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div class="rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl border overflow-hidden p-6 space-y-4 animate-slideUp transition-colors duration-300 {{ storage.fontClass() }}"
               [style.backgroundColor]="colors.surface"
               [style.borderColor]="colors.border"
               [style.color]="colors.textPrimary">
            
            <div class="flex items-center justify-between border-b pb-3" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2">
                <span class="text-lg">📖</span>
                <h3 class="text-base font-bold">
                  {{ selectedBook().name }} {{ selectedChapter() }}:{{ activeVerseModal()!.number }}
                </h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      [style.backgroundColor]="colors.primaryLight"
                      [style.color]="colors.primary">
                  {{ selectedVersion() }}
                </span>
              </div>
              <button (click)="activeVerseModal.set(null)" class="p-1.5 rounded-xl hover:opacity-70 cursor-pointer">
                <span class="material-icons text-base">close</span>
              </button>
            </div>

            <blockquote class="italic text-sm leading-relaxed p-3.5 rounded-2xl border font-serif"
                        [style.backgroundColor]="colors.background"
                        [style.borderColor]="colors.border">
              «{{ activeVerseModal()!.text }}»
            </blockquote>

            <!-- Actions list -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                (click)="addVerseToTodayRhema(activeVerseModal()!)"
                class="p-3 rounded-2xl text-white font-bold text-xs flex items-center gap-2 transition hover:scale-[1.02] cursor-pointer shadow-xs"
                [style.backgroundColor]="colors.primary">
                <span class="material-icons text-base">auto_fix_high</span>
                <span>Usar como Palabra Viva de Hoy</span>
              </button>

              <button
                type="button"
                (click)="toggleSaveCurrentModalVerse(activeVerseModal()!)"
                class="p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                [style.borderColor]="colors.border"
                [style.backgroundColor]="isModalVerseSaved() ? colors.primaryLight : colors.background"
                [style.color]="isModalVerseSaved() ? colors.primary : colors.textPrimary">
                <span class="material-icons text-base" [style.color]="isModalVerseSaved() ? colors.primary : '#F59E0B'">
                  {{ isModalVerseSaved() ? 'bookmark_added' : 'bookmark_border' }}
                </span>
                <span>{{ isModalVerseSaved() ? 'En Guardados (Quitar)' : 'Guardar en Mis Versículos' }}</span>
              </button>

              <button
                type="button"
                (click)="copyVerseText(activeVerseModal()!)"
                class="p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                [style.borderColor]="colors.border"
                [style.backgroundColor]="colors.background"
                [style.color]="colors.textPrimary">
                <span class="material-icons text-base text-blue-500">content_copy</span>
                <span>Copiar Versículo</span>
              </button>

              <button
                type="button"
                (click)="askAiAboutVerse(activeVerseModal()!)"
                class="p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                [style.borderColor]="colors.border"
                [style.backgroundColor]="colors.background"
                [style.color]="colors.primary">
                <span class="material-icons text-base">psychology</span>
                <span>Consultar con IA</span>
              </button>
            </div>

          </div>
        </div>
      }
      }

    </div>
  `
})
export class R07BibleTab implements OnInit {
  public storage = inject(R07StorageService);
  public bibleService = inject(BibleService);
  public gemini = inject(GeminiService);
  public estudio = inject(EstudioService);

  // ---- Leer / Estudio ----
  public vistaBiblia = signal<'lectura' | 'estudio'>('lectura');
  public vistasBiblia: { id: 'lectura' | 'estudio'; nombre: string }[] = [
    { id: 'lectura', nombre: 'Leer' },
    { id: 'estudio', nombre: 'Estudio' },
  ];

  // ---- Selección de versículos ----
  public seleccion = signal<Set<number>>(new Set<number>());
  public modoSeleccion = computed(() => this.seleccion().size > 0);
  public hojaAbierta = signal<boolean>(false);
  private temporizadorPress?: ReturnType<typeof setTimeout>;
  private huboMovimiento = false;

  public books: BibleBook[] = BIBLE_BOOKS;
  public selectedBook = signal<BibleBook>(BIBLE_BOOKS[18]); // Salmos default
  public selectedChapter = signal<number>(23);
  public selectedVersion = signal<'RVR1960' | 'NTV'>('RVR1960');
  public showBookSelector = signal<boolean>(false);
  public testamentFilter = signal<'Antiguo' | 'Nuevo'>('Antiguo');
  public searchFilter: string = '';
  public fontSize = signal<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  public isLoading = signal<boolean>(false);
  public currentVerses = signal<SingleVerse[]>([]);
  public activeVerseModal = signal<SingleVerse | null>(null);
  public showSavedVerses = signal<boolean>(false);

  get colors() {
    return this.storage.currentThemeColors();
  }

  /* ---------------- Marcado de versículos ---------------- */

  /** ID de un versículo, igual que en el modelo de estudio: "19.23.1" */
  private idDe(v: number): string {
    return `${this.selectedBook().number}.${this.selectedChapter()}.${v}`;
  }

  public colorFondo(v: number): string {
    if (this.seleccion().has(v)) return this.colors.primaryContainer;
    const marcas = this.estudio.marcasDe(this.idDe(v));
    if (marcas.length) return TEMA_POR_ID.get(marcas[0].tema)?.suave ?? 'transparent';
    return this.isHighlighted(v) ? this.colors.primaryLight : 'transparent';
  }

  public colorBorde(v: number): string {
    const marcas = this.estudio.marcasDe(this.idDe(v));
    if (marcas.length) return TEMA_POR_ID.get(marcas[0].tema)?.color ?? 'transparent';
    return this.isHighlighted(v) ? this.colors.primary : 'transparent';
  }

  /**
   * El primer versículo se elige MANTENIENDO presionado (450 ms + vibración).
   * Después, un toque simple suma o quita. Así nadie entra al modo selección
   * sin querer, que es lo que asusta a quien no es de tecnología.
   */
  private fueLongPress = false;

  public presionoAbajo(v: number): void {
    this.huboMovimiento = false;
    this.fueLongPress = false;
    if (this.modoSeleccion()) return;
    this.temporizadorPress = setTimeout(() => {
      if (this.huboMovimiento) return;
      this.fueLongPress = true;
      navigator.vibrate?.(18);
      this.alternarVersiculo(v);
    }, 450);
  }

  public presionoMovio(): void {
    this.huboMovimiento = true;
    clearTimeout(this.temporizadorPress);
  }

  public presionoArriba(verse: SingleVerse): void {
    clearTimeout(this.temporizadorPress);
    if (this.huboMovimiento) return;
    if (this.fueLongPress) {
      this.fueLongPress = false;
      return;
    }
    if (this.modoSeleccion()) this.alternarVersiculo(verse.number);
    else this.openVerseAction(verse);
  }

  public alternarVersiculo(v: number): void {
    this.seleccion.update((s) => {
      const n = new Set(s);
      if (n.has(v)) n.delete(v); else n.add(v);
      return n;
    });
  }

  public limpiarSeleccion(): void {
    this.seleccion.set(new Set<number>());
    this.hojaAbierta.set(false);
  }

  /** Rango contiguo a partir de lo seleccionado (del menor al mayor). */
  public refSeleccionada = computed<RefVersiculo | null>(() => {
    const nums = [...this.seleccion()].sort((a, b) => a - b);
    if (!nums.length) return null;
    return {
      libro: this.selectedBook().number,
      libroNombre: this.selectedBook().name,
      capitulo: this.selectedChapter(),
      versiculoIni: nums[0],
      versiculoFin: nums[nums.length - 1],
      version: this.selectedVersion(),
    };
  });

  public textoSeleccionado(): string {
    const nums = [...this.seleccion()].sort((a, b) => a - b);
    return this.currentVerses()
      .filter((x) => nums.includes(x.number))
      .map((x) => x.text)
      .join(' ');
  }

  constructor() {
    effect(() => {
      const hl = this.storage.highlightedVerses();
      const tab = this.storage.activeMobileTab();
      if (hl) {
        const found = this.bibleService.getBookByName(hl.book);
        if (found) {
          const changedBookOrChapter = this.selectedBook().number !== found.number || this.selectedChapter() !== hl.chapter;
          this.selectedBook.set(found);
          this.selectedChapter.set(hl.chapter);
          this.testamentFilter.set(found.testament);
          if (changedBookOrChapter) {
            this.loadVerses();
          } else if (tab === 'bible') {
            this.scrollToHighlightedIfNeeded();
          }
        }
      }
    }, { allowSignalWrites: true });
  }

  public isHighlighted(verseNum: number): boolean {
    const hl = this.storage.highlightedVerses();
    if (!hl) return false;
    if (hl.book !== this.selectedBook().name || hl.chapter !== this.selectedChapter()) return false;
    return verseNum >= hl.verseStart && verseNum <= hl.verseEnd;
  }

  public hasHighlights(): boolean {
    const hl = this.storage.highlightedVerses();
    if (!hl) return false;
    return hl.book === this.selectedBook().name && hl.chapter === this.selectedChapter();
  }

  public getVerseClass(verseNum: number): string {
    if (this.isHighlighted(verseNum)) {
      return 'font-semibold';
    }
    return '';
  }

  ngOnInit(): void {
    const hl = this.storage.highlightedVerses();
    if (hl) {
      const found = this.bibleService.getBookByName(hl.book);
      if (found) {
        this.selectedBook.set(found);
        this.selectedChapter.set(hl.chapter);
        this.testamentFilter.set(found.testament);
      }
    } else {
      const today = this.storage.currentDay();
      if (today && today.bibleReading && today.bibleReading.book) {
        const found = this.bibleService.getBookByName(today.bibleReading.book);
        if (found) {
          this.selectedBook.set(found);
          this.selectedChapter.set(today.bibleReading.chapter || 1);
          this.testamentFilter.set(found.testament);
        }
      }
    }
    this.loadVerses();
  }

  public toggleBookSelector(): void {
    this.showBookSelector.update(v => !v);
  }

  public filteredBooks(): BibleBook[] {
    const filter = this.searchFilter.toLowerCase().trim();
    const test = this.testamentFilter();

    return this.books.filter(b => {
      const matchText = b.name.toLowerCase().includes(filter) || b.abbreviation.toLowerCase().includes(filter);
      const matchTest = b.testament === test;
      return matchText && matchTest;
    });
  }

  public chaptersList(): number[] {
    const total = this.selectedBook().chapters;
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  public selectBook(book: BibleBook): void {
    this.selectedBook.set(book);
    this.selectedChapter.set(1);
    this.loadVerses();
  }

  public selectChapter(chapter: number): void {
    this.selectedChapter.set(chapter);
    this.showBookSelector.set(false);
    this.loadVerses();
  }

  public prevChapter(): void {
    if (this.selectedChapter() > 1) {
      this.selectedChapter.update(c => c - 1);
      this.loadVerses();
    }
  }

  public nextChapter(): void {
    if (this.selectedChapter() < this.selectedBook().chapters) {
      this.selectedChapter.update(c => c + 1);
      this.loadVerses();
    }
  }

  public setVersion(v: 'RVR1960' | 'NTV'): void {
    if (this.selectedVersion() !== v) {
      this.selectedVersion.set(v);
      this.loadVerses();
    }
  }

  public toggleFontSize(): void {
    const curr = this.fontSize();
    if (curr === 'text-sm') this.fontSize.set('text-base');
    else if (curr === 'text-base') this.fontSize.set('text-lg');
    else this.fontSize.set('text-sm');
  }

  public async loadVerses(): Promise<void> {
    this.isLoading.set(true);
    try {
      const verses = await this.bibleService.loadChapterVerses(
        this.selectedBook().number,
        this.selectedChapter(),
        this.selectedVersion()
      );
      this.currentVerses.set(verses);
    } catch (e) {
      console.error('Error loading chapter:', e);
    } finally {
      this.isLoading.set(false);
      this.scrollToHighlightedIfNeeded();
    }
  }

  public scrollToHighlightedIfNeeded(): void {
    const hl = this.storage.highlightedVerses();
    if (!hl) return;
    if (hl.book === this.selectedBook().name && hl.chapter === this.selectedChapter()) {
      const attemptScroll = (retries = 4) => {
        const el = document.getElementById(`verse-${hl.verseStart}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (retries > 0) {
          setTimeout(() => attemptScroll(retries - 1), 120);
        }
      };
      setTimeout(() => attemptScroll(), 120);
    }
  }

  public openVerseAction(verse: SingleVerse): void {
    this.activeVerseModal.set(verse);
  }

  public addVerseToTodayRhema(verse: SingleVerse): void {
    const citation = `${this.selectedBook().name} ${this.selectedChapter()}:${verse.number}`;
    const fullText = `«${verse.text}» (${citation} ${this.selectedVersion()})`;

    this.storage.updateCurrentDay({
      rhema: fullText,
      bibleReading: {
        book: this.selectedBook().name,
        chapter: this.selectedChapter(),
        verses: `${verse.number}`
      }
    });

    this.activeVerseModal.set(null);
    this.storage.showSnackbar(`¡Versículo guardado como Palabra Viva de hoy! 🕊️`);
    this.storage.setMobileTab('today');
  }

  public isVerseSaved(verseNum: number): boolean {
    return this.storage.isVerseSaved(
      this.selectedBook().name,
      this.selectedChapter(),
      verseNum,
      this.selectedVersion()
    );
  }

  public isModalVerseSaved(): boolean {
    const v = this.activeVerseModal();
    if (!v) return false;
    return this.storage.isVerseSaved(
      this.selectedBook().name,
      this.selectedChapter(),
      v.number,
      this.selectedVersion()
    );
  }

  public toggleSaveCurrentModalVerse(verse: SingleVerse): void {
    const isSaved = this.storage.isVerseSaved(
      this.selectedBook().name,
      this.selectedChapter(),
      verse.number,
      this.selectedVersion()
    );
    if (isSaved) {
      const found = this.storage.savedVerses().find(
        sv => sv.book === this.selectedBook().name &&
              sv.chapter === this.selectedChapter() &&
              sv.verse === verse.number &&
              sv.version === this.selectedVersion()
      );
      if (found) {
        this.storage.removeSavedVerse(found.id);
      }
    } else {
      this.storage.saveVerse({
        book: this.selectedBook().name,
        chapter: this.selectedChapter(),
        verse: verse.number,
        text: verse.text,
        version: this.selectedVersion()
      });
    }
    this.activeVerseModal.set(null);
  }

  public goToSavedVerse(sv: SavedVerse): void {
    const found = this.bibleService.getBookByName(sv.book);
    if (found) {
      this.selectedBook.set(found);
      this.selectedChapter.set(sv.chapter);
      this.selectedVersion.set(sv.version);
      this.showSavedVerses.set(false);
      this.loadVerses();
    }
  }

  public copySavedVerse(sv: SavedVerse): void {
    const citation = `${sv.book} ${sv.chapter}:${sv.verse} (${sv.version})`;
    const full = `«${sv.text}» — ${citation}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(full).then(() => {
        this.storage.showSnackbar('Versículo copiado al portapapeles 📋');
      }).catch(() => {});
    }
  }

  public copyVerseText(verse: SingleVerse): void {
    const citation = `${this.selectedBook().name} ${this.selectedChapter()}:${verse.number} (${this.selectedVersion()})`;
    const full = `«${verse.text}» — ${citation}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(full).then(() => {
        this.storage.showSnackbar(`Versículo copiado al portapapeles 📋`);
      }).catch(() => {});
    }
    this.activeVerseModal.set(null);
  }

  public async askAiAboutVerse(verse: SingleVerse): Promise<void> {
    const citation = `${this.selectedBook().name} ${this.selectedChapter()}:${verse.number}`;
    const prompt = `¿Qué nos enseña espiritualmente ${citation} («${verse.text}»)? ¿Cómo puedo aplicarlo a mi vida en el devocional R07?`;
    this.activeVerseModal.set(null);
    this.storage.setMobileTab('chat');
    this.storage.addChatMessage('user', prompt);
    try {
      const response = await this.gemini.askBiblicalAssistant(prompt);
      this.storage.addChatMessage('assistant', response.text, response.scriptureRefs);
    } catch {
      this.storage.addChatMessage(
        'assistant',
        `«${verse.text}» (${citation}) nos recuerda la fidelidad de Dios. Medita en esta verdad hoy.`
      );
    }
  }

  public applyEntireChapterToToday(): void {
    const ref = `${this.selectedBook().name} ${this.selectedChapter()}`;
    this.storage.updateCurrentDay({
      bibleReading: {
        book: this.selectedBook().name,
        chapter: this.selectedChapter(),
        verses: `1-${this.currentVerses().length || 1}`
      }
    });
    this.storage.setMobileTab('today');
    this.storage.showSnackbar(`Lectura de ${ref} asignada a tu devocional de Hoy 📖`);
  }
}

