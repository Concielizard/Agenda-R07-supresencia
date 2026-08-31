import { Component, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../services/r07-storage.service';
import { R07DayEntryEntity, R07Mood } from '../models/r07.models';

@Component({
  selector: 'app-r07-day-journal-editor',
  imports: [CommonModule, FormsModule],
  template: `
    @if (currentDay) {
      <div id="r07-day-editor-card" class="w-full rounded-2xl p-5 md:p-7 shadow-sm border transition-all duration-300"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Day Header Bar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b"
             [style.borderColor]="colors.border">
          
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl shadow-inner shrink-0"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.color]="colors.primary">
              {{ currentDay.dayNumber }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xl font-bold tracking-tight" [style.color]="colors.textPrimary">
                  {{ currentDay.dayName }}
                </h3>
                <span class="text-xs px-2.5 py-0.5 rounded-full font-medium"
                      [style.backgroundColor]="currentDay.isCompleted ? '#ECFDF5' : colors.primaryLight"
                      [style.color]="currentDay.isCompleted ? '#059669' : colors.primary">
                  {{ currentDay.isCompleted ? 'Completado ✓' : 'En progreso' }}
                </span>
              </div>
              <p class="text-xs mt-0.5" [style.color]="colors.textSecondary">
                {{ currentDay.dateText }} | Registro diario R07 Pasa tiempo Conmigo
              </p>
            </div>
          </div>

          <!-- Top Helper Actions: AI & OCR Buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            
            <!-- Scan Handwritten Page Button -->
            <button
              id="btn-scan-ocr"
              type="button"
              (click)="onOpenOcrScan.emit(currentDay.dayNumber)"
              class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-xs"
              [style.backgroundColor]="colors.primaryLight"
              [style.borderColor]="colors.border"
              [style.color]="colors.primary">
              <span class="mat-icon text-sm">document_scanner</span>
              <span>Escanear Foto Manuscrita</span>
            </button>

            <!-- AI Devotional Inspiration Button -->
            <button
              id="btn-ai-inspiration"
              type="button"
              (click)="onOpenAiInspiration.emit(currentDay)"
              class="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-white shadow-sm transition-all hover:opacity-95 active:scale-95 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="mat-icon text-sm">auto_awesome</span>
              <span>Inspiración IA</span>
            </button>

            <!-- AI Guided Prayer Button -->
            <button
              id="btn-ai-prayer"
              type="button"
              (click)="onOpenAiPrayer.emit(currentDay)"
              class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              [style.backgroundColor]="colors.background"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary">
              <span class="mat-icon text-sm">favorite</span>
              <span>Guía de Oración</span>
            </button>

          </div>
        </div>

        <!-- Meta Inputs: Time, Scripture & Bible Reader -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5 pb-5 border-b"
             [style.borderColor]="colors.border">
          
          <!-- Time Input -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider mb-1.5" [style.color]="colors.textSecondary">
              Hora de tu Devocional
            </label>
            <div class="relative">
              <span class="mat-icon absolute left-3 top-2.5 text-base" [style.color]="colors.textMuted">schedule</span>
              <input
                id="day-time-input"
                type="text"
                [ngModel]="currentDay.timeText"
                (ngModelChange)="updateField('timeText', $event)"
                placeholder="Ej: 06:30 AM"
                class="w-full text-sm pl-9 pr-3 py-2 rounded-xl border bg-transparent focus:outline-none focus:ring-1"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>
          </div>

          <!-- Scripture Citation Input -->
          <div class="sm:col-span-1 lg:col-span-2">
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.textSecondary">
                Cita Bíblica Leída
              </label>
              <button
                id="btn-open-bible-reader"
                type="button"
                (click)="onOpenBibleReader.emit(currentDay.scriptureRef)"
                class="text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                [style.color]="colors.primary">
                <span class="mat-icon text-xs">menu_book</span>
                <span>Explorar la Biblia</span>
              </button>
            </div>
            <div class="relative">
              <span class="mat-icon absolute left-3 top-2.5 text-base" [style.color]="colors.textMuted">menu_book</span>
              <input
                id="day-scripture-input"
                type="text"
                [ngModel]="currentDay.scriptureRef"
                (ngModelChange)="updateField('scriptureRef', $event)"
                placeholder="Ej: Salmos 23:1-6, Juan 15:1-8, Filipenses 4:6..."
                class="w-full text-sm pl-9 pr-3 py-2 rounded-xl border bg-transparent focus:outline-none focus:ring-1"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary">
            </div>
          </div>

        </div>

        <!-- Mood Selector Carousel -->
        <div class="pt-5 pb-5 border-b" [style.borderColor]="colors.border">
          <label class="block text-xs font-bold uppercase tracking-wider mb-2.5" [style.color]="colors.textSecondary">
            ¿Cómo llegas a la presencia de Dios hoy? (Estado de Ánimo)
          </label>
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            @for (mood of storage.availableMoods(); track mood.id) {
              <button
                [id]="'mood-btn-' + mood.id"
                type="button"
                (click)="selectMood(mood)"
                class="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all shrink-0 cursor-pointer select-none"
                [style.backgroundColor]="currentDay.mood === mood.name ? colors.primaryLight : colors.background"
                [style.borderColor]="currentDay.mood === mood.name ? colors.primary : colors.border"
                [style.color]="currentDay.mood === mood.name ? colors.primary : colors.textPrimary">
                <span class="text-base">{{ mood.emoji }}</span>
                <span class="font-semibold">{{ mood.name }}</span>
              </button>
            }
          </div>
        </div>

        <!-- 4 Structured Devotional Sections (The Core of R07) -->
        <div class="space-y-5 pt-6">
          
          <!-- 1. Lo que Dios me habló -->
          <div class="p-4 rounded-xl border transition-all"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                   [style.backgroundColor]="colors.primary">
                1
              </div>
              <label class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.textPrimary">
                Lo que Dios me habló (Principio Bíblico)
              </label>
            </div>
            <textarea
              id="day-god-spoke-textarea"
              rows="3"
              [ngModel]="currentDay.godSpoke"
              (ngModelChange)="updateField('godSpoke', $event)"
              placeholder="¿Qué verdad, promesa, mandato o advertencia te reveló Dios hoy en este pasaje?"
              class="w-full text-sm p-3 rounded-lg border bg-transparent focus:outline-none focus:ring-1 resize-y leading-relaxed"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

          <!-- 2. Reflexión Personal / Describe tu R07 -->
          <div class="p-4 rounded-xl border transition-all"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                   [style.backgroundColor]="colors.primary">
                2
              </div>
              <label class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.textPrimary">
                Describe tu R07 (Reflexión Personal & Meditación)
              </label>
            </div>
            <textarea
              id="day-reflection-textarea"
              rows="4"
              [ngModel]="currentDay.reflectionText"
              (ngModelChange)="updateField('reflectionText', $event)"
              placeholder="¿Cómo se relaciona esto con lo que estás viviendo? Escribe tus reflexiones, sentimientos y meditación..."
              class="w-full text-sm p-3 rounded-lg border bg-transparent focus:outline-none focus:ring-1 resize-y leading-relaxed"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

          <!-- 3. Paso de Acción / Compromiso -->
          <div class="p-4 rounded-xl border transition-all"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                   [style.backgroundColor]="colors.primary">
                3
              </div>
              <label class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.textPrimary">
                Paso de Acción (Compromiso Práctico de Fe)
              </label>
            </div>
            <textarea
              id="day-action-step-textarea"
              rows="2"
              [ngModel]="currentDay.actionStep"
              (ngModelChange)="updateField('actionStep', $event)"
              placeholder="¿Qué acción concreta, decisión o cambio de actitud vas a practicar hoy en obediencia a Dios?"
              class="w-full text-sm p-3 rounded-lg border bg-transparent focus:outline-none focus:ring-1 resize-y leading-relaxed"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

          <!-- 4. Oración / Clamor -->
          <div class="p-4 rounded-xl border transition-all"
               [style.backgroundColor]="colors.background"
               [style.borderColor]="colors.border">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                   [style.backgroundColor]="colors.primary">
                4
              </div>
              <label class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.textPrimary">
                Oración & Clamor al Padre
              </label>
            </div>
            <textarea
              id="day-prayer-textarea"
              rows="3"
              [ngModel]="currentDay.prayerText"
              (ngModelChange)="updateField('prayerText', $event)"
              placeholder="Escribe tu oración personal respondiendo a lo que Dios te habló hoy..."
              class="w-full text-sm p-3 rounded-lg border bg-transparent focus:outline-none focus:ring-1 resize-y leading-relaxed"
              [style.borderColor]="colors.border"
              [style.color]="colors.textPrimary"></textarea>
          </div>

        </div>

        <!-- Attached Photos Section (Notebook Pages) -->
        <div class="mt-6 pt-5 border-t" [style.borderColor]="colors.border">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="mat-icon text-base" [style.color]="colors.primary">photo_library</span>
              <span class="text-xs font-bold uppercase tracking-wider" [style.color]="colors.textSecondary">
                Fotos de Cuaderno Devocional Adjuntas ({{ attachedPhotos.length }})
              </span>
            </div>

            <!-- Upload / Capture Photo Button -->
            <label class="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border cursor-pointer transition-all hover:opacity-90 active:scale-95"
                   [style.backgroundColor]="colors.primaryLight"
                   [style.borderColor]="colors.border"
                   [style.color]="colors.primary">
              <span class="mat-icon text-sm">add_a_photo</span>
              <span>Adjuntar Foto</span>
              <input
                id="photo-file-upload"
                type="file"
                accept="image/*"
                class="hidden"
                (change)="onPhotoSelected($event)">
            </label>
          </div>

          @if (attachedPhotos.length > 0) {
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              @for (photo of attachedPhotos; track $index) {
                <div class="relative group rounded-xl overflow-hidden border shadow-xs aspect-4/3 bg-black/5"
                     [style.borderColor]="colors.border">
                  <img
                    [src]="photo"
                    alt="Página Devocional Manuscrita"
                    class="w-full h-full object-cover"
                    referrerpolicy="no-referrer">
                  
                  <button
                    [id]="'btn-remove-photo-' + $index"
                    type="button"
                    (click)="storage.removePhotoFromDay(currentDay.id, $index)"
                    class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                    title="Eliminar foto">
                    ✕
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="p-4 rounded-xl border border-dashed text-center text-xs"
                 [style.borderColor]="colors.border"
                 [style.color]="colors.textMuted">
              No hay fotos de hojas físicas adjuntas para este día. Puedes subir fotos de tu cuaderno físico o escanearlas con IA.
            </div>
          }
        </div>

        <!-- Bottom Status & Actions -->
        <div class="flex items-center justify-between gap-4 mt-6 pt-5 border-t"
             [style.borderColor]="colors.border">
          <div class="text-xs" [style.color]="colors.textMuted">
            Guardado automático activo en tu dispositivo.
          </div>

          <div class="flex items-center gap-2">
            <button
              id="btn-clear-day"
              type="button"
              (click)="clearDay()"
              class="text-xs font-semibold px-3.5 py-2 rounded-xl border hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
              [style.borderColor]="colors.border"
              [style.color]="colors.textSecondary">
              Limpiar
            </button>
            <button
              id="btn-save-day"
              type="button"
              (click)="saveDay()"
              class="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="mat-icon text-sm">check</span>
              <span>Guardado</span>
            </button>
          </div>
        </div>

      </div>
    }
  `
})
export class R07DayJournalEditor {
  storage = inject(R07StorageService);

  onOpenOcrScan = output<number>();
  onOpenAiInspiration = output<R07DayEntryEntity>();
  onOpenAiPrayer = output<R07DayEntryEntity>();
  onOpenBibleReader = output<string>();

  get colors() {
    return this.storage.currentThemeColors();
  }

  get currentDay(): R07DayEntryEntity | undefined {
    const selectedNum = this.storage.selectedDayNumber();
    const days = this.storage.currentWeekWithDays()?.days || [];
    return days.find((d) => d.dayNumber === selectedNum);
  }

  get attachedPhotos(): string[] {
    if (!this.currentDay?.photoUrisJson) return [];
    try {
      return JSON.parse(this.currentDay.photoUrisJson);
    } catch {
      return [];
    }
  }

  updateField(field: keyof R07DayEntryEntity, value: string): void {
    if (!this.currentDay) return;
    const updated = { ...this.currentDay, [field]: value };
    this.storage.updateDayEntry(updated);
  }

  selectMood(mood: R07Mood): void {
    if (!this.currentDay) return;
    const updated = {
      ...this.currentDay,
      mood: mood.name,
      moodEmoji: mood.emoji
    };
    this.storage.updateDayEntry(updated);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.currentDay) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64 && this.currentDay) {
        this.storage.attachPhotoToDay(this.currentDay.id, base64);
      }
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  clearDay(): void {
    if (!this.currentDay) return;
    const cleared: R07DayEntryEntity = {
      ...this.currentDay,
      timeText: '',
      scriptureRef: '',
      reflectionText: '',
      godSpoke: '',
      actionStep: '',
      prayerText: '',
      mood: '',
      moodEmoji: '',
      photoUrisJson: '[]',
      isCompleted: false
    };
    this.storage.updateDayEntry(cleared);
    this.storage.showSnackbar('Día reiniciado.');
  }

  saveDay(): void {
    this.storage.showSnackbar('¡Devocional guardado con éxito!');
  }
}
