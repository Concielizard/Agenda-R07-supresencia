import { Component, ChangeDetectionStrategy, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { BibleService, BIBLE_BOOKS, BibleBook, SingleVerse } from '../services/bible.service';

@Component({
  selector: 'app-r07-bible-tab',
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto pb-2 animate-fadeIn">
      
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
          </div>

        </div>

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
            <div class="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 inline-flex items-center gap-2 text-xs">
              <span class="font-bold text-amber-900 dark:text-amber-200">
                ✨ Pasaje de hoy: {{ storage.highlightedVerses()?.reference }}
              </span>
              <button
                type="button"
                (click)="storage.highlightedVerses.set(null)"
                class="text-amber-800 dark:text-amber-300 text-[10px] font-bold underline cursor-pointer">
                Mostrar todos
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
          <div class="space-y-3.5 {{ fontSize() }}">
            @for (verse of currentVerses(); track verse.number) {
              <div
                (click)="openVerseAction(verse)"
                [ngClass]="getVerseClass(verse.number)"
                class="group relative pl-8 pr-3 py-2.5 transition-all duration-200 rounded-2xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] border border-transparent hover:border-amber-300/30">
                <span class="absolute left-2 top-2.5 text-xs font-black select-none font-serif"
                      [style.color]="isHighlighted(verse.number) ? '#D97706' : colors.primary">
                  {{ verse.number }}
                </span>
                <span class="leading-relaxed select-text font-medium">{{ verse.text }}</span>
                @if (isHighlighted(verse.number)) {
                  <span class="ml-2 inline-block px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                    Lectura de hoy
                  </span>
                }
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
                (click)="saveAsFavoriteVerse(activeVerseModal()!)"
                class="p-3 rounded-2xl border font-bold text-xs flex items-center gap-2 transition hover:scale-[1.02] cursor-pointer"
                [style.borderColor]="colors.border"
                [style.backgroundColor]="colors.background"
                [style.color]="colors.textPrimary">
                <span class="material-icons text-base text-amber-500">star</span>
                <span>Guardar Favorito</span>
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

    </div>
  `
})
export class R07BibleTab implements OnInit {
  public storage = inject(R07StorageService);
  public bibleService = inject(BibleService);

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

  get colors() {
    return this.storage.currentThemeColors();
  }

  constructor() {
    effect(() => {
      const hl = this.storage.highlightedVerses();
      if (hl) {
        const found = this.bibleService.getBookByName(hl.book);
        if (found) {
          this.selectedBook.set(found);
          this.selectedChapter.set(hl.chapter);
          this.testamentFilter.set(found.testament);
          this.loadVerses();
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
      return 'ring-2 ring-amber-400 bg-amber-100/70 dark:bg-amber-950/40 shadow-xs';
    }
    if (this.hasHighlights()) {
      return 'opacity-40';
    }
    return '';
  }

  ngOnInit(): void {
    const today = this.storage.currentDay();
    if (today && today.bibleReading && today.bibleReading.book) {
      const found = this.bibleService.getBookByName(today.bibleReading.book);
      if (found) {
        this.selectedBook.set(found);
        this.selectedChapter.set(today.bibleReading.chapter || 1);
        this.testamentFilter.set(found.testament);
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

  public saveAsFavoriteVerse(verse: SingleVerse): void {
    const citation = `${this.selectedBook().name} ${this.selectedChapter()}:${verse.number} (${this.selectedVersion()})`;
    this.storage.updateUserProfile({
      favoriteVerse: `${citation} — ${verse.text}`
    });
    this.activeVerseModal.set(null);
    this.storage.showSnackbar(`Versículo guardado como tu favorito ⭐`);
  }

  public copyVerseText(verse: SingleVerse): void {
    const citation = `${this.selectedBook().name} ${this.selectedChapter()}:${verse.number} (${this.selectedVersion()})`;
    const full = `«${verse.text}» — ${citation}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(full).then(() => {
        this.storage.showSnackbar(`Versículo copiado al portapapeles 📋`);
      });
    }
    this.activeVerseModal.set(null);
  }

  public askAiAboutVerse(verse: SingleVerse): void {
    const prompt = `¿Qué nos enseña espiritualmente ${this.selectedBook().name} ${this.selectedChapter()}:${verse.number} («${verse.text}»)? ¿Cómo puedo aplicarlo a mi vida en el devocional R07?`;
    this.activeVerseModal.set(null);
    this.storage.setMobileTab('chat');
    this.storage.addChatMessage('user', prompt);
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

