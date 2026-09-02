import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BibleService, BIBLE_BOOKS } from '../../services/bible.service';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-bible-reader-modal',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div class="rounded-t-3xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slideUp transition-colors duration-300 {{ storage.fontClass() }}"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">
        
        <!-- Mobile pull handle -->
        <div class="sm:hidden w-12 h-1.5 rounded-full mx-auto my-2 opacity-30 bg-current"></div>

        <!-- Header -->
        <div class="px-6 py-4 flex items-center justify-between border-b"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs"
                 [style.backgroundColor]="colors.primary">
              <span class="material-icons text-base">menu_book</span>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Lector Bíblico</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Lectura y meditación para tu devocional diario R07
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="p-2 rounded-xl transition hover:opacity-70 cursor-pointer"
            [style.color]="colors.textMuted">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Controls Bar -->
        <div class="border-b p-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
             [style.backgroundColor]="colors.background"
             [style.borderColor]="colors.border">
          <div>
            <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Libro</label>
            <select
              [formControl]="bookControl"
              (change)="onSelectionChange()"
              class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-medium"
              [style.backgroundColor]="colors.surface"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
              @for (b of bibleBooks; track b.name) {
                <option [value]="b.name" class="text-stone-900">{{ b.name }} ({{ b.testament }})</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-semibold mb-1" [style.color]="colors.textSecondary">Capítulo</label>
            <input
              type="number"
              min="1"
              max="150"
              [formControl]="chapterControl"
              (change)="onSelectionChange()"
              class="w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 font-medium"
              [style.backgroundColor]="colors.surface"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
          </div>

          <div class="flex items-end">
            <button
              type="button"
              (click)="useForCurrentDay()"
              class="w-full px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition hover:opacity-90 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">bookmark</span>
              <span>Asignar a Hoy</span>
            </button>
          </div>
        </div>

        <!-- Scripture Content -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-none"
             [style.backgroundColor]="colors.surface">
          <div class="text-center pb-3 border-b" [style.borderColor]="colors.border">
            <h2 class="text-xl font-bold font-serif tracking-wide" [style.color]="colors.textPrimary">
              {{ bookControl.value }} {{ chapterControl.value }}
            </h2>
            <p class="text-xs" [style.color]="colors.textMuted">Santa Biblia Reina-Valera 1960 & NTV</p>
          </div>

          <div class="text-sm sm:text-base leading-loose font-serif max-w-2xl mx-auto space-y-3"
               [style.color]="colors.textPrimary">
            @if (passageText()) {
              <p class="whitespace-pre-line">{{ passageText() }}</p>
            } @else {
              <div class="p-5 rounded-2xl border text-xs space-y-2"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.textPrimary">
                <p><strong>Lectura del capítulo:</strong> Medita en {{ bookControl.value }} capítulo {{ chapterControl.value }} en tu tiempo a solas con Dios.</p>
                <p class="italic" [style.color]="colors.textSecondary">
                  Al terminar la lectura, anota el versículo clave en la casilla <strong>"Palabra Viva"</strong> de tu agenda R07.
                </p>
              </div>
            }
          </div>

          <!-- Suggested Readings Quick Pill List -->
          <div class="pt-6 border-t" [style.borderColor]="colors.border">
            <span class="text-xs font-bold uppercase tracking-wider block mb-2" [style.color]="colors.primary">
              Pasajes Populares Recomendados:
            </span>
            <div class="flex flex-wrap gap-1.5">
              @for (rec of recommended; track rec.book + rec.chapter) {
                <button
                  type="button"
                  (click)="selectPassage(rec.book, rec.chapter)"
                  class="px-3 py-1 rounded-xl border text-xs font-semibold transition hover:opacity-80 cursor-pointer"
                  [style.borderColor]="colors.border"
                  [style.backgroundColor]="colors.background"
                  [style.color]="colors.textPrimary">
                  {{ rec.book }} {{ rec.chapter }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-between"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <button
            type="button"
            (click)="close.emit()"
            class="px-4 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition cursor-pointer"
            [style.borderColor]="colors.border"
            [style.backgroundColor]="colors.surface"
            [style.color]="colors.textSecondary">
            Cerrar
          </button>
          <span class="text-xs" [style.color]="colors.textMuted">
            «Lámpara es a mis pies tu palabra» (Salmos 119:105)
          </span>
        </div>

      </div>
    </div>
  `
})
export class BibleReaderModal {
  public bible = inject(BibleService);
  public storage = inject(R07StorageService);

  public close = output<void>();

  public bibleBooks = BIBLE_BOOKS;
  public recommended = [
    { book: 'Salmos', chapter: 23 },
    { book: 'Salmos', chapter: 91 },
    { book: 'Juan', chapter: 15 },
    { book: 'Romanos', chapter: 8 },
    { book: 'Filipenses', chapter: 4 },
    { book: 'Isaías', chapter: 40 }
  ];

  public bookControl = new FormControl('Salmos');
  public chapterControl = new FormControl(23);
  public passageText = signal<string | null>(null);

  get colors() {
    return this.storage.currentThemeColors();
  }

  constructor() {
    const day = this.storage.currentDay();
    if (day?.bibleReading) {
      this.bookControl.setValue(day.bibleReading.book);
      this.chapterControl.setValue(day.bibleReading.chapter);
    }
    this.onSelectionChange();
  }

  public onSelectionChange(): void {
    const book = this.bookControl.value || 'Salmos';
    const ch = Number(this.chapterControl.value) || 1;
    this.passageText.set(this.bible.getPassageText(book, ch));
  }

  public selectPassage(book: string, chapter: number): void {
    this.bookControl.setValue(book);
    this.chapterControl.setValue(chapter);
    this.onSelectionChange();
  }

  public useForCurrentDay(): void {
    const book = this.bookControl.value || 'Salmos';
    const ch = Number(this.chapterControl.value) || 1;
    this.storage.updateCurrentDay({
      bibleReading: {
        book,
        chapter: ch,
        verses: '1-6'
      }
    });
    this.storage.showSnackbar(`Lectura asignada: ${book} ${ch}`);
    this.close.emit();
  }
}

