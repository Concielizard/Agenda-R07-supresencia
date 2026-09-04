import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { R07StorageService } from '../../services/r07-storage.service';
import { EstudioService } from '../services/estudio.service';
import {
  EMOJIS_SUGERIDOS,
  COLORES_SUGERIDOS,
  TEMAS_RESALTADO,
  type DefinicionTema,
  type Marca,
  type RefVersiculo,
  type TemaResaltado,
  refTitulo,
} from '../models/estudio.models';

/**
 * HOJA DE MARCADO — lo que sube desde abajo cuando mantienes presionado
 * uno o varios versículos.
 *
 * Diseñada para que la abuela de alguien la use:
 *   · Un solo gesto para lo más común: tocar un color y listo. Ya quedó.
 *   · El comentario es OPCIONAL y está más abajo. No obliga a escribir.
 *   · Los colores tienen NOMBRE («Promesa», «Consuelo»), no son solo colores.
 *   · Botones de 48 px de alto: se aciertan con el dedo, sin lentes.
 *   · Nada de iconos sin texto. Cada acción dice lo que hace.
 */
@Component({
  selector: 'r07-marcador-sheet',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fondo" (click)="cerrar.emit()"></div>

    <section
      class="hoja"
      [style.backgroundColor]="c().card"
      [style.borderColor]="c().border"
      role="dialog"
      aria-label="Marcar versículo">

      <div class="asa" [style.backgroundColor]="c().border"></div>

      <!-- Qué se va a marcar -->
      <header>
        <p class="ref" [style.color]="c().primary">{{ titulo() }}</p>
        <p class="texto" [style.color]="c().textSecondary">{{ recorte() }}</p>
      </header>

      <!-- 1. El resaltador y tags personalizados. -->
      <div class="encabezado-temas">
        <p class="rotulo" [style.color]="c().textMuted">¿Qué es para ti este pasaje?</p>
        <button
          type="button"
          class="btn-toggle-crear"
          [style.color]="c().primary"
          [style.borderColor]="c().border"
          (click)="alternarCrearTag()">
          {{ mostrarCrearTag() ? (idTagEditando() ? '✕ Cancelar edición' : '✕ Cancelar') : '＋ Crear nuevo tag' }}
        </button>
      </div>

      <!-- Creador y Editor de tags personalizados -->
      @if (mostrarCrearTag()) {
        <div class="caja-crear-tag" [style.backgroundColor]="c().surface" [style.borderColor]="c().primary">
          <p class="crear-sub" [style.color]="c().textPrimary">
            <b>{{ idTagEditando() ? '✏️ Modifica tu tag de estudio' : 'Crea tu propio tag de estudio' }}</b>
            <span class="text-xs block opacity-80 mt-0.5">
              {{ idTagEditando() ? 'Cambia el nombre, emoji o color distintivo' : '(ej. Jesús, Profecía, Guerra Espiritual)' }}
            </span>
          </p>

          <input
            type="text"
            class="input-nombre-tag"
            [ngModel]="nuevoTagNombre()"
            (ngModelChange)="nuevoTagNombre.set($event)"
            [style.color]="c().textPrimary"
            [style.borderColor]="c().border"
            placeholder="Nombre del tag…" />

          <!-- Emojis sugeridos -->
          <div class="fila-picker">
            <span class="etiqueta-picker" [style.color]="c().textMuted">Emoji:</span>
            <div class="scroll-emojis">
              @for (em of emojisDisponibles; track em) {
                <button
                  type="button"
                  class="btn-pick-emoji"
                  [class.sel]="nuevoTagEmoji() === em"
                  [style.borderColor]="nuevoTagEmoji() === em ? c().primary : 'transparent'"
                  (click)="nuevoTagEmoji.set(em)">
                  {{ em }}
                </button>
              }
            </div>
          </div>

          <!-- Colores sugeridos -->
          <div class="fila-picker">
            <span class="etiqueta-picker" [style.color]="c().textMuted">Color:</span>
            <div class="scroll-colores">
              @for (col of coloresDisponibles; track col) {
                <button
                  type="button"
                  class="btn-pick-color"
                  [style.backgroundColor]="col"
                  [class.sel]="nuevoTagColor() === col"
                  (click)="nuevoTagColor.set(col)">
                  @if (nuevoTagColor() === col) { <span class="check-col">✓</span> }
                </button>
              }
            </div>
          </div>

          <!-- Vista previa y botones -->
          <div class="fila-guardar-tag">
            <div class="preview-tag" [style.backgroundColor]="nuevoTagSuave()" [style.borderColor]="nuevoTagColor()">
              <span class="punto" [style.backgroundColor]="nuevoTagColor()"></span>
              <span [style.color]="c().textPrimary">{{ nuevoTagEmoji() }} {{ nuevoTagNombre() || 'Mi tag' }}</span>
            </div>
            @if (idTagEditando()) {
              <button
                type="button"
                class="btn-cancelar-tag"
                [style.borderColor]="c().border"
                [style.color]="c().textSecondary"
                (click)="cancelarEdicionTag()">
                Cancelar
              </button>
            }
            <button
              type="button"
              class="btn-guardar-custom-tag"
              [disabled]="!nuevoTagNombre().trim()"
              [style.backgroundColor]="nuevoTagNombre().trim() ? c().primary : c().border"
              (click)="guardarTag()">
              {{ idTagEditando() ? 'Guardar cambios' : 'Guardar tag' }}
            </button>
          </div>
        </div>
      }

      <div class="temas">
        @for (t of todosLosTemas(); track t.id) {
          <div
            class="tema"
            [style.backgroundColor]="temaElegido() === t.id ? t.suave : 'transparent'"
            [style.borderColor]="temaElegido() === t.id ? t.color : c().border"
            (click)="elegirTema(t.id)">
            <span class="punto" [style.backgroundColor]="t.color"></span>
            <span class="txt">
              <b [style.color]="c().textPrimary">{{ t.emoji }} {{ t.nombre }}</b>
              <small [style.color]="c().textMuted">{{ t.proposito }}</small>
            </span>

            @if (t.esPersonalizado) {
              <div class="acciones-tag-custom" (click)="$event.stopPropagation()">
                <button
                  type="button"
                  class="btn-tag-accion"
                  [style.borderColor]="c().border"
                  [style.color]="c().textSecondary"
                  title="Editar tag"
                  (click)="iniciarEditarTag(t, $event)">
                  ✏️
                </button>
                <button
                  type="button"
                  class="btn-tag-accion"
                  [style.borderColor]="c().border"
                  [style.color]="c().textMuted"
                  title="Borrar tag"
                  (click)="pedirBorrarTag(t, $event)">
                  🗑
                </button>
              </div>
            }

            @if (temaElegido() === t.id) {
              <span class="check" [style.color]="t.color">✓</span>
            }
          </div>
        }
      </div>

      <!-- Modal Confirmar Borrar Tag -->
      @if (tagParaBorrar(); as tb) {
        <div class="modal-confirmar-backdrop" (click)="tagParaBorrar.set(null)">
          <div class="modal-confirmar-caja" [style.backgroundColor]="c().surface" [style.borderColor]="c().border" (click)="$event.stopPropagation()">
            <div class="modal-confirmar-header">
              <span class="text-3xl">{{ tb.emoji }}</span>
              <div>
                <h4 class="font-bold text-sm" [style.color]="c().textPrimary">¿Eliminar el tag «{{ tb.nombre }}»?</h4>
                <p class="text-xs" [style.color]="c().textMuted">Tus versículos marcados no se perderán; pasarán automáticamente al color base.</p>
              </div>
            </div>
            <div class="modal-confirmar-botones">
              <button
                type="button"
                class="btn-modal-cancelar"
                [style.borderColor]="c().border"
                [style.color]="c().textSecondary"
                (click)="tagParaBorrar.set(null)">
                Cancelar
              </button>
              <button
                type="button"
                class="btn-modal-borrar"
                (click)="confirmarBorrarTag(tb.id)">
                Eliminar tag
              </button>
            </div>
          </div>
        </div>
      }

      <!-- 2. Comentario, opcional -->
      @if (temaElegido()) {
        <p class="rotulo" [style.color]="c().textMuted">
          Comentario <span class="opc">(opcional)</span>
        </p>
        <textarea
          rows="3"
          [ngModel]="comentario()"
          (ngModelChange)="comentario.set($event)"
          [style.backgroundColor]="c().surface"
          [style.borderColor]="c().border"
          [style.color]="c().textPrimary"
          placeholder="¿Qué te dijo Dios aquí? Escribe #gracia o #fe para agrupar por tema."></textarea>

        <!-- Etiquetas sugeridas para enlazar información con un toque -->
        @if (estudio.tags().length) {
          <div class="tags-para-enlazar">
            <span class="subrotulo" [style.color]="c().textMuted">Enlazar con tus tags existentes:</span>
            <div class="scroll-tags-pills">
              @for (t of estudio.tags(); track t.tag) {
                <button
                  type="button"
                  class="pill-tag-enlace"
                  [class.activo]="tieneTag(t.tag)"
                  [style.borderColor]="tieneTag(t.tag) ? c().primary : c().border"
                  [style.color]="tieneTag(t.tag) ? c().primary : c().textSecondary"
                  (click)="alternarTagEnComentario(t.tag)">
                  #{{ t.tag }}
                </button>
              }
            </div>
          </div>
        }

        @if (tagsDetectadas().length) {
          <div class="tags">
            @for (t of tagsDetectadas(); track t) {
              <span class="tag" [style.borderColor]="c().primary" [style.color]="c().primary">#{{ t }}</span>
            }
          </div>
        }
      }

      <!-- 3. Acciones -->
      <div class="acciones">
        <button
          type="button"
          class="fav"
          [style.borderColor]="esFavorito() ? c().primary : c().border"
          [style.color]="esFavorito() ? c().primary : c().textSecondary"
          (click)="favorito.set(!favorito())">
          {{ esFavorito() ? '★' : '☆' }} Favorito
        </button>

        <button
          type="button"
          class="copiar"
          [style.borderColor]="c().border"
          [style.color]="c().textSecondary"
          (click)="copiar()">
          {{ copiado() ? '✓ Copiado' : 'Copiar' }}
        </button>
      </div>

      <button
        type="button"
        class="guardar"
        [disabled]="!temaElegido()"
        [style.backgroundColor]="temaElegido() ? c().primary : c().border"
        (click)="guardar()">
        Guardar en mi estudio
      </button>

      <!-- 4. Llevar a un cuaderno: aparece solo si ya hay comentario -->
      @if (temaElegido() && comentario().trim()) {
        <details class="cuadernos">
          <summary [style.color]="c().textSecondary">Llevarlo a un cuaderno de estudio</summary>
          <div class="lista">
            @for (cu of estudio.cuadernos(); track cu.id) {
              <button type="button"
                      [style.borderColor]="cuadernoElegido() === cu.id ? c().primary : c().border"
                      [style.color]="c().textPrimary"
                      (click)="cuadernoElegido.set(cuadernoElegido() === cu.id ? null : cu.id)">
                {{ cu.titulo }}
              </button>
            }
            <button type="button" class="nuevo"
                    [style.borderColor]="c().primary" [style.color]="c().primary"
                    (click)="nuevoCuaderno()">+ Cuaderno nuevo</button>
          </div>
        </details>
      }
    </section>
  `,
  styles: [`
    :host { position: fixed; inset: 0; z-index: 200; display: block; }
    .fondo { position: absolute; inset: 0; background: rgba(0,0,0,.5); }

    .hoja {
      position: absolute; left: 0; right: 0; bottom: 0;
      max-height: 88dvh; overflow-y: auto;
      padding: 10px 20px calc(24px + env(safe-area-inset-bottom));
      border-top: 1px solid; border-radius: 26px 26px 0 0;
      animation: subir .28s cubic-bezier(.22,1,.36,1);
    }
    @keyframes subir { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce) { .hoja { animation: none; } }

    .asa { width: 44px; height: 4px; border-radius: 99px; margin: 0 auto 16px; }

    header { margin-bottom: 20px; }
    .ref { margin: 0 0 5px; font: 700 13px/1 'Plus Jakarta Sans', system-ui, sans-serif;
           letter-spacing: .08em; text-transform: uppercase; }
    .texto { margin: 0; font: italic 15px/1.6 'Lora', Georgia, serif; }

    .rotulo { margin: 0 0 9px; font-size: 12.5px; font-weight: 600;
              letter-spacing: .05em; text-transform: uppercase; }
    .rotulo .opc { font-weight: 400; text-transform: none; letter-spacing: 0; }

    .encabezado-temas { display: flex; align-items: center; justify-content: space-between; margin-bottom: 9px; }
    .btn-toggle-crear {
      padding: 6px 12px; border: 1px solid; border-radius: 999px; background: transparent;
      font: 600 12px 'Plus Jakarta Sans', system-ui, sans-serif; cursor: pointer;
    }
    .caja-crear-tag {
      padding: 14px; border: 1.5px solid; border-radius: 18px; margin-bottom: 16px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .crear-sub { margin: 0; font-size: 13px; line-height: 1.4; }
    .input-nombre-tag {
      width: 100%; padding: 10px 12px; border: 1px solid; border-radius: 12px;
      background: transparent; font-size: 16px;
      -webkit-user-select: text !important; user-select: text !important;
      touch-action: manipulation;
    }
    .fila-picker { display: flex; align-items: center; gap: 8px; }
    .etiqueta-picker { font-size: 12px; font-weight: 600; min-width: 40px; }
    .scroll-emojis, .scroll-colores {
      display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none;
    }
    .scroll-emojis::-webkit-scrollbar, .scroll-colores::-webkit-scrollbar { display: none; }
    .btn-pick-emoji {
      width: 34px; height: 34px; border-radius: 10px; border: 2px solid; background: transparent;
      font-size: 17px; display: flex; align-items: center; justify-content: center; flex: none; cursor: pointer;
    }
    .btn-pick-color {
      width: 28px; height: 28px; border-radius: 50%; border: 0; flex: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700;
    }
    .btn-pick-color.sel { transform: scale(1.15); box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor; }
    .fila-guardar-tag { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 4px; }
    .preview-tag {
      display: flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid;
      border-radius: 999px; font-size: 13px; font-weight: 600; flex: 1; min-width: 0;
    }
    .btn-guardar-custom-tag {
      padding: 9px 15px; border: 0; border-radius: 12px; color: #fff; font: 600 13px 'Plus Jakarta Sans', system-ui, sans-serif;
      cursor: pointer; flex: none;
    }
    .btn-guardar-custom-tag:disabled { opacity: .5; cursor: default; }
    .tags-para-enlazar { margin-bottom: 12px; }
    .subrotulo { font-size: 11.5px; font-weight: 600; display: block; margin-bottom: 6px; }
    .scroll-tags-pills { display: flex; flex-wrap: wrap; gap: 6px; }
    .pill-tag-enlace {
      padding: 5px 11px; border: 1px solid; border-radius: 999px; background: transparent;
      font-size: 12px; font-weight: 600; cursor: pointer;
    }
    .pill-tag-enlace.activo { font-weight: 700; }

    .temas { display: flex; flex-direction: column; gap: 7px; margin-bottom: 20px; }
    .tema {
      display: flex; align-items: center; gap: 12px; width: 100%;
      min-height: 56px; padding: 10px 14px;
      border: 1.5px solid; border-radius: 15px; background: transparent;
      text-align: left; cursor: pointer;
    }
    .tema .punto { width: 14px; height: 14px; border-radius: 50%; flex: none; }
    .tema .txt { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .tema b { font: 600 15px 'Plus Jakarta Sans', system-ui, sans-serif; }
    .tema small { font-size: 12.5px; }
    .tema .check { font-size: 19px; font-weight: 700; }

    textarea {
      width: 100%; padding: 13px 15px; border: 1px solid; border-radius: 14px;
      font: 16px/1.6 'Plus Jakarta Sans', system-ui, sans-serif; resize: vertical;
      margin-bottom: 10px;
      -webkit-user-select: text !important; user-select: text !important;
      touch-action: manipulation;
    }
    textarea:focus { outline: 2px solid currentColor; outline-offset: 1px; }

    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
    .tag { padding: 5px 11px; border: 1px solid; border-radius: 999px; font-size: 12.5px; }

    .acciones { display: flex; gap: 9px; margin: 4px 0 12px; }
    .acciones button {
      flex: 1; min-height: 48px; border: 1.5px solid; border-radius: 14px;
      background: transparent; font: 500 14.5px 'Plus Jakarta Sans', system-ui, sans-serif;
      cursor: pointer;
    }

    .guardar {
      width: 100%; min-height: 54px; border: 0; border-radius: 16px; color: #fff;
      font: 700 16px 'Plus Jakarta Sans', system-ui, sans-serif; cursor: pointer;
    }
    .guardar:disabled { opacity: .55; cursor: default; }

    .acciones-tag-custom { display: flex; align-items: center; gap: 6px; }
    .btn-tag-accion {
      width: 32px; height: 32px; border-radius: 9px; border: 1.5px solid;
      display: flex; align-items: center; justify-content: center;
      background: transparent; cursor: pointer; font-size: 13.5px;
      transition: transform 0.15s;
    }
    .btn-tag-accion:hover { transform: scale(1.08); }
    .btn-cancelar-tag {
      padding: 8px 13px; border: 1.5px solid; border-radius: 12px;
      background: transparent; font: 600 12.5px 'Plus Jakarta Sans', system-ui, sans-serif;
      cursor: pointer; flex: none;
    }

    .modal-confirmar-backdrop {
      position: fixed; inset: 0; z-index: 100;
      background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .modal-confirmar-caja {
      width: 100%; max-width: 380px; border: 1.5px solid; border-radius: 20px;
      padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); display: flex;
      flex-direction: column; gap: 14px;
    }
    .modal-confirmar-header { display: flex; align-items: flex-start; gap: 12px; }
    .modal-confirmar-header h4 { margin: 0 0 4px; }
    .modal-confirmar-header p { margin: 0; line-height: 1.4; }
    .modal-confirmar-botones { display: flex; justify-content: flex-end; gap: 8px; }
    .btn-modal-cancelar {
      padding: 8px 14px; border: 1.5px solid; border-radius: 10px;
      background: transparent; font-size: 12.5px; font-weight: 600; cursor: pointer;
    }
    .btn-modal-borrar {
      padding: 8px 16px; border: 0; border-radius: 10px;
      background: #dc2626; color: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer;
    }

    .cuadernos { margin-top: 16px; }
    .cuadernos summary { font-size: 14px; cursor: pointer; padding: 8px 0; }
    .cuadernos .lista { display: flex; flex-wrap: wrap; gap: 7px; padding-top: 10px; }
    .cuadernos .lista button {
      padding: 10px 14px; border: 1.5px solid; border-radius: 12px;
      background: transparent; font-size: 14px; cursor: pointer;
    }
  `],
})
export class R07MarcadorSheetComponent {
  private readonly storage = inject(R07StorageService);
  readonly estudio = inject(EstudioService);

  readonly c = this.storage.currentThemeColors;
  readonly TEMAS = TEMAS_RESALTADO;
  readonly todosLosTemas = this.estudio.todosLosTemas;
  readonly emojisDisponibles = EMOJIS_SUGERIDOS;
  readonly coloresDisponibles = COLORES_SUGERIDOS;

  readonly mostrarCrearTag = signal(false);
  readonly idTagEditando = signal<string | null>(null);
  readonly tagParaBorrar = signal<DefinicionTema | null>(null);
  readonly nuevoTagNombre = signal('');
  readonly nuevoTagEmoji = signal('👑');
  readonly nuevoTagColor = signal('#3B82F6');

  readonly nuevoTagSuave = computed(() => {
    const hex = this.nuevoTagColor();
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return 'rgba(59,130,246,0.16)';
    const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16));
    return `rgba(${r},${g},${b},0.16)`;
  });

  /** Rango que se está marcando (uno o varios versículos). */
  readonly ref = input.required<RefVersiculo>();
  /** Texto bíblico completo del rango. */
  readonly texto = input.required<string>();
  /** Marca existente, si se está editando en vez de creando. */
  readonly existente = input<Marca | null>(null);

  readonly cerrar = output<void>();
  readonly guardado = output<Marca>();

  readonly temaElegido = signal<TemaResaltado | null>(null);
  readonly comentario = signal('');
  readonly favorito = signal(false);
  readonly cuadernoElegido = signal<string | null>(null);
  readonly copiado = signal(false);

  readonly titulo = computed(() => refTitulo(this.ref()));
  readonly recorte = computed(() => {
    const t = this.texto();
    return t.length > 200 ? t.slice(0, 199) + '…' : t;
  });
  readonly esFavorito = computed(() => this.favorito());
  readonly tagsDetectadas = computed(() => {
    const re = /#([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ][\wáéíóúüñ\-\/]*)/g;
    const out: string[] = [];
    for (let m; (m = re.exec(this.comentario())); ) out.push(m[1].toLowerCase());
    return [...new Set(out)];
  });

  tieneTag(tag: string): boolean {
    return this.tagsDetectadas().includes(tag.toLowerCase());
  }

  alternarTagEnComentario(tag: string): void {
    const actual = this.comentario();
    const hashtag = `#${tag}`;
    if (this.tieneTag(tag)) {
      const regex = new RegExp(`\\s*${hashtag}\\b`, 'gi');
      this.comentario.set(actual.replace(regex, '').trim());
    } else {
      this.comentario.set(actual ? `${actual.trim()} ${hashtag}` : hashtag);
    }
  }

  alternarCrearTag(): void {
    if (this.mostrarCrearTag()) {
      this.cancelarEdicionTag();
    } else {
      this.idTagEditando.set(null);
      this.nuevoTagNombre.set('');
      this.mostrarCrearTag.set(true);
    }
  }

  iniciarEditarTag(t: DefinicionTema, ev: Event): void {
    ev.stopPropagation();
    this.idTagEditando.set(t.id);
    this.nuevoTagNombre.set(t.nombre);
    this.nuevoTagEmoji.set(t.emoji);
    this.nuevoTagColor.set(t.color);
    this.mostrarCrearTag.set(true);
  }

  cancelarEdicionTag(): void {
    this.idTagEditando.set(null);
    this.nuevoTagNombre.set('');
    this.mostrarCrearTag.set(false);
  }

  pedirBorrarTag(t: DefinicionTema, ev: Event): void {
    ev.stopPropagation();
    this.tagParaBorrar.set(t);
  }

  async confirmarBorrarTag(id: string): Promise<void> {
    await this.estudio.borrarTemaPersonalizado(id);
    if (this.temaElegido() === id) {
      this.temaElegido.set('amor');
    }
    if (this.idTagEditando() === id) {
      this.cancelarEdicionTag();
    }
    this.tagParaBorrar.set(null);
  }

  async guardarTag(): Promise<void> {
    const nom = this.nuevoTagNombre().trim();
    if (!nom) return;
    const idEd = this.idTagEditando();
    if (idEd) {
      const actualizado = await this.estudio.actualizarTemaPersonalizado(idEd, {
        nombre: nom,
        emoji: this.nuevoTagEmoji(),
        color: this.nuevoTagColor(),
        proposito: 'Tag personalizado de estudio',
      });
      if (actualizado) {
        this.temaElegido.set(actualizado.id);
      }
    } else {
      const creado = await this.estudio.crearTemaPersonalizado({
        nombre: nom,
        emoji: this.nuevoTagEmoji(),
        color: this.nuevoTagColor(),
        proposito: 'Tag personalizado de estudio',
      });
      this.temaElegido.set(creado.id);
    }
    this.cancelarEdicionTag();
  }

  constructor() {
    // Si viene una marca existente, se precargan sus valores.
    queueMicrotask(() => {
      const e = this.existente();
      if (!e) return;
      this.temaElegido.set(e.tema);
      this.comentario.set(e.comentario);
      this.favorito.set(e.favorito);
    });
  }

  elegirTema(t: TemaResaltado): void {
    this.temaElegido.set(this.temaElegido() === t ? null : t);
    // Vibración corta: confirma el toque sin necesidad de mirar.
    navigator.vibrate?.(12);
  }

  async copiar(): Promise<void> {
    const txt = `«${this.texto()}»\n— ${this.titulo()} (${this.ref().version})`;
    try {
      await navigator.clipboard.writeText(txt);
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2000);
    } catch {
      this.copiado.set(false);
    }
  }

  async nuevoCuaderno(): Promise<void> {
    const c = await this.estudio.crearCuaderno(this.titulo());
    this.cuadernoElegido.set(c.id);
  }

  async guardar(): Promise<void> {
    const tema = this.temaElegido();
    if (!tema) return;

    const marca = await this.estudio.resaltar(this.ref(), this.texto(), tema);

    if (this.comentario().trim()) {
      await this.estudio.comentar(marca.id, this.comentario().trim());
    }
    if (this.favorito() !== marca.favorito) {
      await this.estudio.alternarFavorito(marca.id);
    }
    const cuad = this.cuadernoElegido();
    if (cuad) {
      await this.estudio.agregarMarcaACuaderno(cuad, marca.id);
    }

    navigator.vibrate?.([10, 40, 10]);
    this.guardado.emit(this.estudio.marca(marca.id) ?? marca);
    this.cerrar.emit();
  }
}
