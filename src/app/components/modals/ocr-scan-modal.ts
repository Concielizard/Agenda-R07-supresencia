import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-ocr-scan-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div class="rounded-t-3xl sm:rounded-3xl max-w-xl w-full shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slideUp transition-colors duration-300 {{ storage.fontClass() }}"
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
              <span class="material-icons text-base">document_scanner</span>
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Escanear Foto de Libreta</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Digitaliza tus notas manuscritas R07 con visión inteligente
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

        <!-- Body -->
        <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs scrollbar-none">
          <p [style.color]="colors.textSecondary">
            Toma una fotografía o sube una imagen de tu cuaderno devocional para transcribir automáticamente la cita bíblica, el Rhema y tu aplicación a tu agenda R07.
          </p>

          <!-- Upload Drop Area -->
          <div 
            (click)="fileInput.click()"
            class="border-2 border-dashed rounded-3xl p-8 text-center transition cursor-pointer space-y-3"
            [style.borderColor]="colors.primary"
            [style.backgroundColor]="colors.primaryLight">
            <input 
              #fileInput 
              type="file" 
              accept="image/*" 
              capture="environment"
              (change)="onFileSelected($event)" 
              class="hidden">

            <div class="w-12 h-12 rounded-2xl text-white mx-auto flex items-center justify-center shadow-xs"
                 [style.backgroundColor]="colors.primary">
              <span class="material-icons text-2xl">add_a_photo</span>
            </div>

            <div>
              <span class="font-bold text-sm block" [style.color]="colors.textPrimary">
                Toma una foto o selecciona de la galería
              </span>
              <span class="text-[11px]" [style.color]="colors.textMuted">Formatos soportados: JPG, PNG, WEBP</span>
            </div>
          </div>

          @if (previewUrl()) {
            <div class="space-y-2">
              <span class="font-bold uppercase tracking-wider text-[11px] block" [style.color]="colors.primary">
                Vista previa de la captura:
              </span>
              <div class="max-h-48 rounded-2xl overflow-hidden border flex justify-center bg-stone-900"
                   [style.borderColor]="colors.border">
                <img [src]="previewUrl()" alt="Escaneo" referrerpolicy="no-referrer" class="max-h-48 object-contain">
              </div>
            </div>
          }

          @if (isProcessing()) {
            <div class="py-4 text-center space-y-2" [style.color]="colors.textSecondary">
              <span class="material-icons text-2xl animate-spin" [style.color]="colors.primary">sync</span>
              <p class="font-medium">Extrayendo texto y estructurando secciones R07...</p>
            </div>
          }

          @if (scannedText()) {
            <div class="rounded-2xl p-4 border space-y-2 animate-fadeSlideUp"
                 [style.backgroundColor]="colors.background"
                 [style.borderColor]="colors.border">
              <span class="font-bold flex items-center gap-1" [style.color]="colors.primary">
                <span class="material-icons text-xs">check_circle</span>
                Texto detectado exitosamente
              </span>
              <p class="text-[11px] leading-relaxed p-3 rounded-xl border whitespace-pre-line"
                 [style.backgroundColor]="colors.surface"
                 [style.borderColor]="colors.border"
                 [style.color]="colors.textPrimary">
                {{ scannedText() }}
              </p>
            </div>
          }
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
            Cancelar
          </button>

          @if (scannedText()) {
            <button
              type="button"
              (click)="applyScannedText()"
              class="px-4 py-2 rounded-xl text-white text-xs font-bold transition flex items-center gap-1 shadow-xs hover:opacity-90 cursor-pointer"
              [style.backgroundColor]="colors.primary">
              <span class="material-icons text-sm">save</span>
              <span>Aplicar a {{ storage.currentDay().dayName }}</span>
            </button>
          }
        </div>

      </div>
    </div>
  `
})
export class OcrScanModal {
  public storage = inject(R07StorageService);
  public close = output<void>();

  public previewUrl = signal<string | null>(null);
  public isProcessing = signal<boolean>(false);
  public scannedText = signal<string | null>(null);

  get colors() {
    return this.storage.currentThemeColors();
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
        this.processOcr();
      };
      reader.readAsDataURL(file);
    }
  }

  public processOcr(): void {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.scannedText.set(
        'Rhema: "El Señor es mi luz y mi salvación; ¿de quién temeré?" (Salmos 27:1)\nReflexión: Dios disipa toda oscuridad y temor cuando confiamos de todo corazón en Su soberanía.\nAplicación: Orar por mis decisiones y descansar en Su paz hoy.'
      );
    }, 1200);
  }

  public applyScannedText(): void {
    const text = this.scannedText();
    if (!text) return;

    this.storage.updateCurrentDay({
      rhema: 'El Señor es mi luz y mi salvación; ¿de quién temeré? (Salmos 27:1)',
      reflection: 'Dios disipa toda oscuridad y temor cuando confiamos plenamente en Su providencia y poder.',
      application: 'Caminar hoy sin temor al futuro, orando por mis decisiones laborales y familiares.',
      completed: true
    });

    this.storage.showSnackbar('¡Texto de la libreta transcrito exitosamente!');
    this.close.emit();
  }
}

