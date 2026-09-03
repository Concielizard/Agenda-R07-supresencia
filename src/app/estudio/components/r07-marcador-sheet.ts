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
  TEMAS_RESALTADO,
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

      <!-- 1. El resaltador. Lo primero y lo más grande. -->
      <p class="rotulo" [style.color]="c().textMuted">¿Qué es para ti este pasaje?</p>
      <div class="temas">
        @for (t of TEMAS; track t.id) {
          <button
            type="button"
            class="tema"
            [style.backgroundColor]="temaElegido() === t.id ? t.suave : 'transparent'"
            [style.borderColor]="temaElegido() === t.id ? t.color : c().border"
            (click)="elegirTema(t.id)">
            <span class="punto" [style.backgroundColor]="t.color"></span>
            <span class="txt">
              <b [style.color]="c().textPrimary">{{ t.emoji }} {{ t.nombre }}</b>
              <small [style.color]="c().textMuted">{{ t.proposito }}</small>
            </span>
            @if (temaElegido() === t.id) {
              <span class="check" [style.color]="t.color">✓</span>
            }
          </button>
        }
      </div>

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
      font: 15px/1.6 'Plus Jakarta Sans', system-ui, sans-serif; resize: vertical;
      margin-bottom: 10px;
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
