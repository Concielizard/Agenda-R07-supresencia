import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-ocr-scan-modal',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-white text-stone-950 flex items-center justify-center">
              <span class="material-icons text-sm text-amber-700">document_scanner</span>
            </div>
            <div>
              <h3 class="text-base font-bold font-serif">Escanear Foto de tu Libreta Devocional</h3>
              <p class="text-xs text-amber-100">Digitaliza tus notas manuscritas con IA</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-amber-100 hover:text-white transition p-1">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs text-stone-700">
          <p>
            Toma una fotografía o sube una imagen de tu cuaderno devocional para transcribir automáticamente la cita bíblica, el Rhema y tu aplicación a tu agenda R07.
          </p>

          <!-- Upload Drop Area -->
          <div 
            (click)="fileInput.click()"
            class="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-8 text-center bg-stone-50/60 hover:bg-amber-50/30 transition cursor-pointer space-y-3">
            <input 
              #fileInput 
              type="file" 
              accept="image/*" 
              capture="environment"
              (change)="onFileSelected($event)" 
              class="hidden">

            <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <span class="material-icons text-2xl">add_photo_alternate</span>
            </div>

            <div>
              <span class="font-bold text-stone-800 text-sm block">Haz clic para tomar foto o seleccionar imagen</span>
              <span class="text-stone-500 text-[11px]">Formatos soportados: JPG, PNG, WEBP</span>
            </div>
          </div>

          @if (previewUrl()) {
            <div class="space-y-2">
              <span class="font-bold uppercase tracking-wider text-stone-700 text-[11px] block">Vista previa de la captura:</span>
              <div class="max-h-48 rounded-xl overflow-hidden border border-stone-200 flex justify-center bg-stone-900">
                <img [src]="previewUrl()" alt="Escaneo" referrerpolicy="no-referrer" class="max-h-48 object-contain">
              </div>
            </div>
          }

          @if (isProcessing()) {
            <div class="py-4 text-center space-y-2 text-stone-600">
              <span class="material-icons text-2xl text-amber-600 animate-spin">sync</span>
              <p>Extrayendo texto y estructurando secciones R07...</p>
            </div>
          }

          @if (scannedText()) {
            <div class="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 space-y-2">
              <span class="font-bold text-emerald-900 flex items-center gap-1">
                <span class="material-icons text-xs text-emerald-600">check_circle</span>
                Texto detectado exitosamente
              </span>
              <p class="text-stone-800 text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-emerald-100">
                {{ scannedText() }}
              </p>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button (click)="close.emit()" class="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition">
            Cancelar
          </button>

          @if (scannedText()) {
            <button
              (click)="applyScannedText()"
              class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs">
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
    // Simulate smart OCR parsing with realistic R07 output
    setTimeout(() => {
      this.isProcessing.set(false);
      this.scannedText.set(
        'Rhema: "El Señor es mi luz y mi salvación; ¿de quién temeré?"\nReflexión: Dios disipa toda oscuridad y temor cuando confiamos de todo corazón en Su soberanía.\nAplicación: Orar por mis decisiones laborales y mantener una actitud llena de paz.'
      );
    }, 1500);
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

    this.close.emit();
  }
}
