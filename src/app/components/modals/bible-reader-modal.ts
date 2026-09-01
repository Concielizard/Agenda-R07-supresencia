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
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-stone-900 via-purple-950 to-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center">
              <span class="material-icons text-sm">menu_book</span>
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">Lector Bíblico Reina-Valera</h3>
              <p class="text-xs text-purple-200">Lectura y meditación para tu devocional diario R07</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-purple-200 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Controls Bar -->
        <div class="bg-stone-50 border-b border-stone-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-semibold text-stone-600 mb-1">Libro</label>
            <select
              [formControl]="bookControl"
              (change)="onSelectionChange()"
              class="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500">
              @for (b of bibleBooks; track b.name) {
                <option [value]="b.name">{{ b.name }} ({{ b.testament }})</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-stone-600 mb-1">Capítulo</label>
            <input
              type="number"
              min="1"
              max="150"
              [formControl]="chapterControl"
              (change)="onSelectionChange()"
              class="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-purple-500">
          </div>

          <div class="flex items-end">
            <button
              type="button"
              (click)="useForCurrentDay()"
              class="w-full px-3 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center justify-center gap-1 transition">
              <span class="material-icons text-sm text-amber-300">bookmark</span>
              <span>Asignar a Hoy</span>
            </button>
          </div>
        </div>

        <!-- Scripture Content -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 bg-[#fdfcf7]">
          <div class="text-center pb-3 border-b border-stone-200">
            <h2 class="text-xl font-bold font-serif text-stone-900 tracking-wide">
              {{ bookControl.value }} {{ chapterControl.value }}
            </h2>
            <p class="text-xs text-stone-500 font-sans">Santa Biblia Reina-Valera 1960</p>
          </div>

          <div class="text-stone-800 text-sm sm:text-base leading-loose font-serif max-w-2xl mx-auto space-y-3">
            @if (passageText()) {
              <p class="whitespace-pre-line">{{ passageText() }}</p>
            } @else {
              <div class="p-6 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-sans space-y-2">
                <p><strong>Lectura del capítulo:</strong> Puedes leer {{ bookControl.value }} capítulo {{ chapterControl.value }} en tu Biblia física o app favorita.</p>
                <p class="italic text-stone-600">Al terminar la lectura, anota el versículo clave en la casilla <strong>"Palabra Rhema"</strong> de tu agenda R07.</p>
              </div>
            }
          </div>

          <!-- Suggested Readings Quick Pill List -->
          <div class="pt-6 border-t border-stone-200">
            <span class="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2 font-sans">
              Pasajes Populares Recomendados:
            </span>
            <div class="flex flex-wrap gap-1.5 font-sans">
              @for (rec of recommended; track rec.book + rec.chapter) {
                <button
                  type="button"
                  (click)="selectPassage(rec.book, rec.chapter)"
                  class="px-2.5 py-1 rounded-full bg-stone-200/80 hover:bg-purple-100 hover:text-purple-900 text-stone-700 text-xs font-medium transition">
                  {{ rec.book }} {{ rec.chapter }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition">
            Cerrar
          </button>
          <span class="text-xs text-stone-500">«Lámpara es a mis pies tu palabra» (Salmos 119:105)</span>
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
    this.close.emit();
  }
}
