import { Component, ChangeDetectionStrategy, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../../services/r07-storage.service';

@Component({
  selector: 'app-r07-tutorial-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div class="rounded-t-3xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh] animate-slideUp transition-colors duration-300 {{ storage.fontClass() }}"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border"
           [style.color]="colors.textPrimary">

        <!-- Mobile handle -->
        <div class="sm:hidden w-12 h-1.5 rounded-full mx-auto my-2 opacity-30 bg-current"></div>

        <!-- Header -->
        <div class="px-6 py-4 flex items-center justify-between border-b"
             [style.borderColor]="colors.border"
             [style.backgroundColor]="colors.card">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl text-white shadow-xs"
                 [style.backgroundColor]="colors.primary">
              📖
            </div>
            <div>
              <h3 class="text-base font-bold tracking-tight">Guía de Estudio Bíblico & Mi Plano</h3>
              <p class="text-xs" [style.color]="colors.textSecondary">
                Aprende a conectar la Palabra, profundizar en cuadernos y exportar en Ultra HD
              </p>
            </div>
          </div>
          <button
            type="button"
            (click)="cerrar.emit()"
            class="p-2 rounded-xl transition hover:opacity-70 cursor-pointer"
            [style.color]="colors.textMuted">
            <span class="text-lg">✕</span>
          </button>
        </div>

        <!-- Pestañas de navegación -->
        <div class="flex border-b px-4 gap-2 pt-2" [style.borderColor]="colors.border" [style.backgroundColor]="colors.card">
          <button
            type="button"
            class="pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer"
            [style.borderColor]="seccion() === 'plano' ? colors.primary : 'transparent'"
            [style.color]="seccion() === 'plano' ? colors.primary : colors.textSecondary"
            (click)="seccion.set('plano')">
            🗺️ Mi Plano & Ultra HD
          </button>
          <button
            type="button"
            class="pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer"
            [style.borderColor]="seccion() === 'cuaderno' ? colors.primary : 'transparent'"
            [style.color]="seccion() === 'cuaderno' ? colors.primary : colors.textSecondary"
            (click)="seccion.set('cuaderno')">
            📓 Cuadernos
          </button>
          <button
            type="button"
            class="pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer"
            [style.borderColor]="seccion() === 'tags' ? colors.primary : 'transparent'"
            [style.color]="seccion() === 'tags' ? colors.primary : colors.textSecondary"
            (click)="seccion.set('tags')">
            🏷️ Tags & Conexiones
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs leading-relaxed scrollbar-none">

          <!-- SECCIÓN 1: MI PLANO & ULTRA HD -->
          @if (seccion() === 'plano') {
            <div class="p-4 rounded-2xl border space-y-2"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.borderColor]="colors.border">
              <h4 class="font-bold text-sm" [style.color]="colors.primary">¿Qué es «Mi Plano»?</h4>
              <p [style.color]="colors.textSecondary">
                Es un mapa mental interactivo 2D donde tus versículos favoritos, comentarios y cuadernos se organizan visualmente en constelaciones temáticas. No es una imagen fija: tú tienes el control total.
              </p>
            </div>

            <div class="space-y-3">
              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">👆</span>
                <div>
                  <b class="text-xs block mb-1">Moverse y hacer Zoom</b>
                  <p [style.color]="colors.textSecondary">
                    Arrastra con un dedo sobre el fondo para desplazarte. Usa los botones <b>+</b> y <b>−</b> abajo, o pellizca con dos dedos para acercar o alejar el mapa. El botón <b>«Ver todo»</b> encuadra todas tus tarjetas en pantalla.
                  </p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">➕</span>
                <div>
                  <b class="text-xs block mb-1">Crear Tarjetas y Arrastrarlas</b>
                  <p [style.color]="colors.textSecondary">
                    Toca el botón flotante <b>＋</b> para crear una nota propia donde estés mirando. Mantén presionada una tarjeta para moverla a la posición que desees: allí quedará guardada de forma permanente.
                  </p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">🏹</span>
                <div>
                  <b class="text-xs block mb-1">Conectar Tarjetas con Flechas</b>
                  <p [style.color]="colors.textSecondary">
                    Al tocar una tarjeta aparece un tirador circular. Arrástralo hacia otra tarjeta para trazar una flecha. Luego toca la flecha para escribir una etiqueta (ej. <i>«cumple profecía»</i> o <i>«da fruto»</i>).
                  </p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.primary">
                <span class="text-xl">📥</span>
                <div>
                  <b class="text-xs block mb-1" [style.color]="colors.primary">Descargar en Ultra HD a tu Galería</b>
                  <p [style.color]="colors.textSecondary">
                    En la barra superior toca <b>«📥 Guardar en Galería»</b>. La app generará una imagen en resolución Ultra HD (escala 3x) sin pérdida de calidad. En iPhone podrás tocar <b>«Guardar imagen»</b> para guardarla en Fotos; en Android podrás guardarla directo en tu Galería de imágenes.
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- SECCIÓN 2: CUADERNOS DE ESTUDIO -->
          @if (seccion() === 'cuaderno') {
            <div class="p-4 rounded-2xl border space-y-2"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.borderColor]="colors.border">
              <h4 class="font-bold text-sm" [style.color]="colors.primary">¿Para qué sirve un Cuaderno de Estudio?</h4>
              <p [style.color]="colors.textSecondary">
                Un cuaderno te permite profundizar en un tema reuniendo múltiples pasajes bíblicos en una sola libreta con hoja rayada, permitiéndote redactar tus conclusiones entre versículo y versículo.
              </p>
            </div>

            <div class="space-y-3">
              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">📜</span>
                <div>
                  <b class="text-xs block mb-1">Hoja rayada adaptada a tu tema</b>
                  <p [style.color]="colors.textSecondary">
                    La libreta adopta automáticamente el tono de tu edición devocional. Todo lo que escribes cae perfectamente alineado sobre los renglones, brindando una sensación auténtica de libro de apuntes.
                  </p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">＋</span>
                <div>
                  <b class="text-xs block mb-1">Traer comentarios y versículos</b>
                  <p [style.color]="colors.textSecondary">
                    Toca el botón inferior <b>«＋ Traer comentario»</b> para incrustar pasajes que hayas marcado previamente en la Biblia. Cada comentario llega con su cita textual y su categoría de color.
                  </p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">⠿</span>
                <div>
                  <b class="text-xs block mb-1">Reordenar arrastrando (Drag & Drop)</b>
                  <p [style.color]="colors.textSecondary">
                    Cada bloque tiene una manija <b>⠿</b> en su esquina. Tócala y arrástrala hacia arriba o abajo para reorganizar el orden de tu estudio como más te guste.
                  </p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">🗑</span>
                <div>
                  <b class="text-xs block mb-1">Borrar Cuadernos</b>
                  <p [style.color]="colors.textSecondary">
                    Puedes borrar cualquier cuaderno con el icono de papelera en la barra superior o en la lista. Tus notas y versículos en la Biblia no se perderán; solo se retira la libreta.
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- SECCIÓN 3: TAGS & CONEXIONES -->
          @if (seccion() === 'tags') {
            <div class="p-4 rounded-2xl border space-y-2"
                 [style.backgroundColor]="colors.primaryLight"
                 [style.borderColor]="colors.border">
              <h4 class="font-bold text-sm" [style.color]="colors.primary">Tags Personalizados y Red de Conexiones</h4>
              <p [style.color]="colors.textSecondary">
                La Biblia no se lee de forma aislada. Con los tags puedes entrelazar versículos de Génesis a Apocalipsis que compartan una misma verdad espiritual.
              </p>
            </div>

            <div class="space-y-3">
              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">👑</span>
                <div>
                  <b class="text-xs block mb-1">Crea tus propios Tags con Emojis y Colores</b>
                  <p [style.color]="colors.textSecondary">
                    Al mantener presionado un versículo, toca <b>«＋ Crear nuevo tag»</b>. Asígnale un nombre (ej. <i>Jesús</i>, <i>Espíritu Santo</i>, <i>Pactos</i>), escoge su emoji distintivo y selecciona un color vibrante.
                  </p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">#️⃣</span>
                <div>
                  <b class="text-xs block mb-1">Pills de Enlace Rápido</b>
                  <p [style.color]="colors.textSecondary">
                    Al escribir un comentario verás pills con tus etiquetas habituales. Tócalas para sumarlas o quitarlas al instante sin tener que escribir el símbolo <b>#</b> a mano.
                  </p>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border flex gap-3 items-start"
                   [style.backgroundColor]="colors.card" [style.borderColor]="colors.border">
                <span class="text-xl">◎</span>
                <div>
                  <b class="text-xs block mb-1">Explora en la vista Conexiones</b>
                  <p [style.color]="colors.textSecondary">
                    En la sub-pestaña <b>Conexiones</b> verás tu versículo al centro con sus temas satélites en órbita. Toca cualquier satélite para ponerlo en el centro y ver qué otros pasajes se conectan con él.
                  </p>
                </div>
              </div>
            </div>
          }

        </div>

        <!-- Footer -->
        <div class="p-4 border-t flex justify-end" [style.borderColor]="colors.border" [style.backgroundColor]="colors.card">
          <button
            type="button"
            (click)="cerrar.emit()"
            class="px-5 py-2.5 rounded-xl font-bold text-white transition shadow-sm cursor-pointer text-xs"
            [style.backgroundColor]="colors.primary">
            Entendido, ¡a estudiar!
          </button>
        </div>

      </div>
    </div>
  `
})
export class R07TutorialModalComponent {
  readonly storage = inject(R07StorageService);
  readonly colors = this.storage.currentThemeColors();
  readonly cerrar = output<void>();

  readonly seccion = signal<'plano' | 'cuaderno' | 'tags'>('plano');
}
