import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../../services/r07-storage.service';
import { BibleService } from '../../services/bible.service';
import { BibleBookInfo, SingleVerseData } from '../../models/r07.models';

@Component({
  selector: 'app-bible-reader-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="bible-reader-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="bible-reader-modal-panel" class="w-full max-w-4xl h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header Bar -->
        <div class="p-4 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm shadow-sm"
                 [style.backgroundColor]="colors.primary">
              📖
            </div>
            <div>
              <h3 class="text-sm font-bold tracking-tight" [style.color]="colors.textPrimary">
                Explorador Bíblico R07
              </h3>
              <p class="text-[11px]" [style.color]="colors.textSecondary">
                {{ selectedBook.name }} {{ selectedChapter }} ({{ currentTranslation }})
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Version Switcher -->
            <select
              [(ngModel)]="currentTranslation"
              (ngModelChange)="onTranslationChange($event)"
              class="text-xs px-2.5 py-1 rounded-lg border bg-transparent font-medium cursor-pointer"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
              <option value="RVR1960">Reina-Valera 1960</option>
              <option value="NTV">Nueva Traducción Viviente</option>
            </select>

            <button
              type="button"
              (click)="onClose.emit()"
              class="w-7 h-7 rounded-lg border flex items-center justify-center text-xs hover:bg-black/5 cursor-pointer"
              [style.borderColor]="colors.border"
              [style.color]="colors.textSecondary">
              ✕
            </button>
          </div>
        </div>

        <!-- Main 2-Column Reader Layout -->
        <div class="flex-1 flex overflow-hidden">
          
          <!-- Left Sidebar: Books & Chapters Navigator -->
          <div class="w-48 sm:w-60 border-r flex flex-col overflow-hidden bg-black/2 dark:bg-white/2"
               [style.borderColor]="colors.border">
            
            <!-- Book Search -->
            <div class="p-2 border-b" [style.borderColor]="colors.border">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Buscar libro..."
                class="w-full text-xs px-2.5 py-1.5 rounded-lg border bg-transparent focus:outline-none"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>

            <!-- Books List -->
            <div class="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
              @for (book of filteredBooks; track book.number) {
                <button
                  type="button"
                  (click)="selectBook(book)"
                  class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between cursor-pointer"
                  [style.backgroundColor]="selectedBook.number === book.number ? colors.primaryLight : 'transparent'"
                  [style.color]="selectedBook.number === book.number ? colors.primary : colors.textPrimary">
                  <span>{{ book.name }}</span>
                  <span class="text-[10px] opacity-60">{{ book.chaptersCount }} cap</span>
                </button>
              }
            </div>

            <!-- Chapter Grid in Sidebar -->
            <div class="p-2 border-t max-h-36 overflow-y-auto" [style.borderColor]="colors.border">
              <span class="block text-[10px] font-bold uppercase mb-1" [style.color]="colors.textSecondary">
                Capítulos:
              </span>
              <div class="grid grid-cols-5 gap-1">
                @for (ch of chapterList; track ch) {
                  <button
                    type="button"
                    (click)="selectChapter(ch)"
                    class="h-6 rounded text-[11px] font-semibold flex items-center justify-center border transition-all cursor-pointer"
                    [style.backgroundColor]="selectedChapter === ch ? colors.primary : 'transparent'"
                    [style.borderColor]="selectedChapter === ch ? colors.primary : colors.border"
                    [style.color]="selectedChapter === ch ? '#FFFFFF' : colors.textPrimary">
                    {{ ch }}
                  </button>
                }
              </div>
            </div>

          </div>

          <!-- Right Content: Bible Chapter Text Reader -->
          <div class="flex-1 flex flex-col overflow-hidden">
            
            <!-- Chapter Title Header -->
            <div class="p-3 border-b flex items-center justify-between" [style.borderColor]="colors.border">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  [disabled]="selectedChapter <= 1"
                  (click)="selectChapter(selectedChapter - 1)"
                  class="px-2 py-1 rounded border text-xs font-bold disabled:opacity-30 cursor-pointer"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
                  ‹ Ant
                </button>
                <h4 class="text-sm font-extrabold" [style.color]="colors.primary">
                  {{ selectedBook.name }} {{ selectedChapter }}
                </h4>
                <button
                  type="button"
                  [disabled]="selectedChapter >= selectedBook.chaptersCount"
                  (click)="selectChapter(selectedChapter + 1)"
                  class="px-2 py-1 rounded border text-xs font-bold disabled:opacity-30 cursor-pointer"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textPrimary">
                  Sig ›
                </button>
              </div>

              <!-- Quick Use Citation Button -->
              <button
                id="btn-use-bible-citation"
                type="button"
                (click)="useCurrentCitation()"
                class="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-xs hover:opacity-90 active:scale-95 cursor-pointer"
                [style.backgroundColor]="colors.primary">
                <span class="mat-icon text-xs">edit_note</span>
                <span>Usar en Devocional</span>
              </button>
            </div>

            <!-- Verse Text Area (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-5 space-y-3 font-serif leading-relaxed text-sm scrollbar-thin">
              @if (isLoading()) {
                <div class="p-12 text-center text-xs" [style.color]="colors.textMuted">
                  Cargando pasaje bíblico...
                </div>
              } @else {
                <div class="space-y-2.5 text-justify" [style.color]="colors.textPrimary">
                  @for (verse of currentVerses(); track verse.verse) {
                    <p class="hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded transition-colors group">
                      <sup class="font-sans font-bold text-xs mr-1 opacity-70 group-hover:opacity-100" [style.color]="colors.primary">
                        {{ verse.verse }}
                      </sup>
                      <span>{{ verse.text }}</span>
                    </p>
                  }
                </div>
              }
            </div>

          </div>

        </div>

        <!-- Footer -->
        <div class="p-3 border-t flex items-center justify-between text-xs" [style.borderColor]="colors.border">
          <span [style.color]="colors.textMuted">
            «Toda la Escritura es inspirada por Dios y útil para enseñar» — 2 Timoteo 3:16
          </span>

          <button
            type="button"
            (click)="onClose.emit()"
            class="px-4 py-1.5 rounded-lg border hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            Cerrar
          </button>
        </div>

      </div>
    </div>
  `
})
export class BibleReaderModal {
  storage = inject(R07StorageService);
  bibleService = inject(BibleService);

  initialCitation = input<string>('');
  onClose = output<void>();
  onCitationSelected = output<string>();

  books: BibleBookInfo[] = [];
  selectedBook: BibleBookInfo = { number: 19, name: 'Salmos', testament: 'Antiguo Testamento', category: 'Poéticos', chaptersCount: 150, abbreviation: 'Sal' };
  selectedChapter = 23;
  currentTranslation = 'RVR1960';
  searchQuery = '';

  isLoading = signal<boolean>(false);
  currentVerses = signal<SingleVerseData[]>([]);

  get colors() {
    return this.storage.currentThemeColors();
  }

  get filteredBooks(): BibleBookInfo[] {
    if (!this.searchQuery.trim()) return this.books;
    const q = this.searchQuery.toLowerCase();
    return this.books.filter((b) => b.name.toLowerCase().includes(q) || b.abbreviation.toLowerCase().includes(q));
  }

  get chapterList(): number[] {
    const list: number[] = [];
    for (let i = 1; i <= this.selectedBook.chaptersCount; i++) {
      list.push(i);
    }
    return list;
  }

  ngOnInit(): void {
    this.books = this.bibleService.getBooks();
    const init = this.initialCitation();
    if (init) {
      const parsed = this.bibleService.parseCitation(init);
      const match = this.books.find((b) => b.number === parsed.bookNumber || b.name.toLowerCase().includes(parsed.bookName.toLowerCase()));
      if (match) {
        this.selectedBook = match;
        this.selectedChapter = parsed.chapter;
      }
    }
    this.loadChapterText();
  }

  async loadChapterText(): Promise<void> {
    this.isLoading.set(true);
    const ch = await this.bibleService.getChapter(this.selectedBook.number, this.selectedChapter, this.currentTranslation);
    this.currentVerses.set(ch.verses);
    this.isLoading.set(false);
  }

  selectBook(book: BibleBookInfo): void {
    this.selectedBook = book;
    this.selectedChapter = 1;
    this.loadChapterText();
  }

  selectChapter(chapter: number): void {
    this.selectedChapter = chapter;
    this.loadChapterText();
  }

  onTranslationChange(trans: string): void {
    this.currentTranslation = trans;
    this.loadChapterText();
  }

  useCurrentCitation(): void {
    const citation = `${this.selectedBook.name} ${this.selectedChapter}`;
    this.onCitationSelected.emit(citation);
    this.storage.showSnackbar(`Cita bíblica seleccionada: ${citation}`);
    this.onClose.emit();
  }
}
