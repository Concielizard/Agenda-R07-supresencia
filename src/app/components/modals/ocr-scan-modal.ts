import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { R07StorageService } from '../../services/r07-storage.service';
import { GeminiService } from '../../services/gemini.service';
import { R07DayEntryEntity, ScannedR07Entry } from '../../models/r07.models';

@Component({
  selector: 'app-ocr-scan-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div id="ocr-scan-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div id="ocr-scan-modal-panel" class="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        
        <!-- Header -->
        <div class="p-5 border-b flex items-center justify-between" [style.borderColor]="colors.border">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
                 [style.backgroundColor]="colors.primary">
              📸
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight" [style.color]="colors.textPrimary">
                Escáner OCR de Cuaderno Devocional Manuscrito
              </h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Transcribe y digitaliza tus hojas físicas con IA de Gemini Vision
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="onClose.emit()"
            class="w-8 h-8 rounded-lg border flex items-center justify-center text-xs hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs">
          
          <!-- Image Upload / Drop Area -->
          @if (!scannedResult()) {
            <div class="space-y-4">
              
              <!-- Drag & Drop Box -->
              <div class="p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all hover:border-solid"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.primary">
                
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                     [style.backgroundColor]="colors.primaryLight"
                     [style.color]="colors.primary">
                  📷
                </div>

                <div>
                  <p class="font-bold text-sm" [style.color]="colors.textPrimary">
                    Sube una foto de tu cuaderno devocional R07
                  </p>
                  <p class="text-xs mt-0.5" [style.color]="colors.textMuted">
                    Formatos JPG, PNG, WebP o captura directa con tu cámara
                  </p>
                </div>

                <div class="flex items-center gap-3 pt-2">
                  <label class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 cursor-pointer"
                         [style.backgroundColor]="colors.primary">
                    <span class="mat-icon text-sm">photo_camera</span>
                    <span>Seleccionar o Tomar Foto</span>
                    <input
                      id="ocr-file-input"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      (change)="onFileSelected($event)">
                  </label>

                  <button
                    id="btn-ocr-sample"
                    type="button"
                    (click)="useSamplePhoto()"
                    class="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-black/5 active:scale-95 cursor-pointer"
                    [style.borderColor]="colors.border"
                    [style.color]="colors.textPrimary">
                    Probar con Foto de Ejemplo
                  </button>
                </div>
              </div>

              <!-- Preview of Selected Image & Analyze Trigger -->
              @if (selectedImageBase64()) {
                <div class="p-4 rounded-xl border space-y-3"
                     [style.backgroundColor]="colors.background"
                     [style.borderColor]="colors.border">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs" [style.color]="colors.textPrimary">Foto lista para escanear:</span>
                    <button
                      type="button"
                      (click)="selectedImageBase64.set(null)"
                      class="text-xs text-red-500 hover:underline cursor-pointer">
                      Quitar
                    </button>
                  </div>

                  <div class="aspect-16/9 max-h-56 rounded-xl overflow-hidden border bg-black/5"
                       [style.borderColor]="colors.border">
                    <img
                      [src]="selectedImageBase64()"
                      alt="Foto cuaderno devocional"
                      class="w-full h-full object-contain"
                      referrerpolicy="no-referrer">
                  </div>

                  <div class="flex justify-end">
                    <button
                      id="btn-start-ocr-scan"
                      type="button"
                      [disabled]="isLoading()"
                      (click)="startOcrScan()"
                      class="flex items-center gap-2 px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
                      [style.backgroundColor]="colors.primary">
                      @if (isLoading()) {
                        <span class="inline-block animate-spin">⏳</span>
                        <span>Analizando trazos manuscritos con IA...</span>
                      } @else {
                        <span class="mat-icon text-sm">auto_awesome</span>
                        <span>Transcribir y Estructurar con IA</span>
                      }
                    </button>
                  </div>
                </div>
              }

            </div>
          } @else {
            
            <!-- Scanned Structured Results -->
            <div class="space-y-4 animate-in fade-in duration-300">
              
              <!-- Legibility Banner -->
              <div class="p-4 rounded-xl border flex items-center justify-between gap-3"
                   [style.backgroundColor]="colors.background"
                   [style.borderColor]="colors.border">
                <div class="flex items-center gap-2.5">
                  <span class="text-2xl">✨</span>
                  <div>
                    <h4 class="font-bold text-xs" [style.color]="colors.textPrimary">
                      Transcripción Completada (Día {{ scannedResult()!.dayNumber }} - {{ scannedResult()!.dayName }})
                    </h4>
                    <p class="text-[11px]" [style.color]="colors.textSecondary">
                      {{ scannedResult()!.legibilityNotes }}
                    </p>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="text-[10px] font-bold uppercase block text-emerald-700">Legibilidad</span>
                  <span class="text-base font-extrabold text-emerald-600">
                    {{ scannedResult()!.legibilityScore }}%
                  </span>
                </div>
              </div>

              <!-- Structured Fields Preview -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="p-3 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="font-bold text-[10px] uppercase block mb-1" [style.color]="colors.primary">Cita Bíblica:</span>
                  <p class="text-xs font-semibold" [style.color]="colors.textPrimary">{{ scannedResult()!.scriptureRef || 'No detectada' }}</p>
                </div>

                <div class="p-3 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="font-bold text-[10px] uppercase block mb-1" [style.color]="colors.primary">Estado de Ánimo:</span>
                  <p class="text-xs font-semibold" [style.color]="colors.textPrimary">{{ scannedResult()!.moodEmoji }} {{ scannedResult()!.mood }}</p>
                </div>

                <div class="md:col-span-2 p-3 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="font-bold text-[10px] uppercase block mb-1" [style.color]="colors.primary">1. Lo que Dios me habló:</span>
                  <p class="text-xs leading-relaxed" [style.color]="colors.textPrimary">{{ scannedResult()!.godSpoke }}</p>
                </div>

                <div class="md:col-span-2 p-3 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="font-bold text-[10px] uppercase block mb-1" [style.color]="colors.primary">2. Reflexión Personal / Describe tu R07:</span>
                  <p class="text-xs leading-relaxed" [style.color]="colors.textPrimary">{{ scannedResult()!.reflectionText }}</p>
                </div>

                <div class="md:col-span-2 p-3 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="font-bold text-[10px] uppercase block mb-1" [style.color]="colors.primary">3. Paso de Acción:</span>
                  <p class="text-xs leading-relaxed" [style.color]="colors.textPrimary">{{ scannedResult()!.actionStep }}</p>
                </div>

                <div class="md:col-span-2 p-3 rounded-xl border" [style.backgroundColor]="colors.background" [style.borderColor]="colors.border">
                  <span class="font-bold text-[10px] uppercase block mb-1" [style.color]="colors.primary">4. Oración:</span>
                  <p class="text-xs italic leading-relaxed" [style.color]="colors.textPrimary">{{ scannedResult()!.prayerText }}</p>
                </div>
              </div>

            </div>
          }

        </div>

        <!-- Footer Actions -->
        <div class="p-4 border-t flex items-center justify-between gap-3" [style.borderColor]="colors.border">
          <button
            type="button"
            (click)="onClose.emit()"
            class="text-xs px-3 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
            [style.borderColor]="colors.border"
            [style.color]="colors.textSecondary">
            Cerrar
          </button>

          @if (scannedResult()) {
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="scannedResult.set(null)"
                class="text-xs px-3 py-2 rounded-xl border hover:bg-black/5 cursor-pointer"
                [style.borderColor]="colors.border"
                [style.color]="colors.textSecondary">
                Volver a Escanear
              </button>

              <button
                id="btn-apply-ocr-to-day"
                type="button"
                (click)="applyScannedData()"
                class="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                [style.backgroundColor]="colors.primary">
                <span class="mat-icon text-sm">done_all</span>
                <span>Aplicar a Día {{ targetDayNumber() }}</span>
              </button>
            </div>
          }
        </div>

      </div>
    </div>
  `
})
export class OcrScanModal {
  storage = inject(R07StorageService);
  gemini = inject(GeminiService);

  targetDayNumber = input<number>(1);
  onClose = output<void>();
  onApplied = output<void>();

  selectedImageBase64 = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  scannedResult = signal<ScannedR07Entry | null>(null);

  get colors() {
    return this.storage.currentThemeColors();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImageBase64.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  useSamplePhoto(): void {
    // Generate simulated notebook canvas image
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(0, 0, 600, 400);

      ctx.strokeStyle = '#E0DCD3';
      ctx.lineWidth = 1;
      for (let y = 50; y < 400; y += 30) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(570, y);
        ctx.stroke();
      }

      ctx.fillStyle = '#2C3E50';
      ctx.font = 'bold 18px cursive';
      ctx.fillText('R07 • Pasa tiempo Conmigo (Día 1)', 50, 40);
      ctx.font = '15px cursive';
      ctx.fillText('Cita: Salmos 23:1-6 | Hora: 06:30 AM', 50, 80);
      ctx.fillText('Dios me habló: El Señor es mi pastor y nada me faltará.', 50, 140);
      ctx.fillText('Reflexión: Descanso en Su paz y no temeré.', 50, 200);
      ctx.fillText('Paso de Acción: Orar antes de revisar el celular.', 50, 260);
      ctx.fillText('Oración: Gracias Señor por Tu protección.', 50, 320);
    }
    this.selectedImageBase64.set(canvas.toDataURL('image/jpeg'));
  }

  async startOcrScan(): Promise<void> {
    const img = this.selectedImageBase64();
    if (!img) return;

    this.isLoading.set(true);
    const result = await this.gemini.scanHandwrittenPage([img], this.targetDayNumber());
    this.scannedResult.set(result);
    this.isLoading.set(false);
  }

  applyScannedData(): void {
    const res = this.scannedResult();
    const dayNum = this.targetDayNumber();
    const days = this.storage.currentWeekWithDays()?.days || [];
    const day = days.find((d) => d.dayNumber === dayNum);

    if (!res || !day) return;

    const updated: R07DayEntryEntity = {
      ...day,
      timeText: res.timeText || day.timeText || '06:30 AM',
      scriptureRef: res.scriptureRef || day.scriptureRef,
      godSpoke: res.godSpoke || day.godSpoke,
      reflectionText: res.reflectionText || day.reflectionText,
      actionStep: res.actionStep || day.actionStep,
      prayerText: res.prayerText || day.prayerText,
      mood: res.mood || day.mood || 'En Paz',
      moodEmoji: res.moodEmoji || day.moodEmoji || '🕊️',
      isCompleted: true
    };

    this.storage.updateDayEntry(updated);

    // Also attach image to day if available
    const img = this.selectedImageBase64();
    if (img) {
      this.storage.attachPhotoToDay(day.id, img);
    }

    this.storage.showSnackbar('¡Página manuscrita transcrita y aplicada a tu devocional!');
    this.onApplied.emit();
    this.onClose.emit();
  }
}
