import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDropList, CdkDrag, CdkDragHandle, type CdkDragDrop } from '@angular/cdk/drag-drop';

import { R07StorageService } from '../../services/r07-storage.service';
import { EstudioService } from '../services/estudio.service';
import { papelDelTema } from '../core/color';
import { TEMA_POR_ID, refTitulo, type CuadernoEstudio } from '../models/estudio.models';

/**
 * EL CUADERNO.
 *
 * Un cuaderno junta varios comentarios que ya escribiste y lo que tú
 * desarrollas entre medio. Los comentarios traen sus etiquetas, así que el
 * cuaderno hereda todas: por eso un cuaderno puede tener varios temas, y por
 * esos temas se conectan entre sí los versículos que hay adentro.
 *
 * Se ve como un cuaderno de verdad: hoja rayada, margen a la izquierda, y el
 * papel en el tono pastel de la edición que el usuario eligió. Si está en
 * modo oscuro con la edición azul, el papel es un azul pastel oscurito; en
 * modo claro, el mismo azul pero casi blanco. Nunca un color escrito a mano:
 * todo sale de `papelDelTema(currentThemeColors())`.
 *
 * Guarda solo, 700 ms después de dejar de escribir. No hay botón «Guardar»:
 * en el celular la gente cierra la app y espera que su estudio esté ahí.
 */
@Component({
  selector: 'r07-cuaderno',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag, CdkDragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cuaderno(); as cu) {
      <div class="pantalla" [style.backgroundColor]="c().background">

        <!-- Cabecera -->
        <header [style.borderColor]="c().border">
          <button type="button" class="volver"
                  [style.borderColor]="c().border" [style.color]="c().textSecondary"
                  (click)="cerrar.emit()" aria-label="Volver">‹</button>
          <input
            class="titulo"
            [ngModel]="titulo()"
            (ngModelChange)="cambiarTitulo($event)"
            [style.color]="c().textPrimary"
            placeholder="Título del estudio" />
          <span class="guardado" [style.color]="c().textMuted">{{ estado() }}</span>

          <div class="header-acciones">
            <button
              type="button"
              class="btn-borrar-cuaderno"
              [style.borderColor]="c().border"
              title="Borrar este cuaderno"
              (click)="confirmarBorrar.set(true)">
              🗑
            </button>
          </div>
        </header>

        <!-- La hoja -->
        <div class="hoja-envoltura">
          <article
            class="hoja"
            [style.backgroundColor]="p().papel"
            [style.borderColor]="p().borde"
            [style.--renglon]="p().renglon"
            [style.--margen]="p().margen">

            <!-- Encabezado de la hoja: resumen y temas -->
            <div class="encabezado">
              <input
                class="resumen"
                [ngModel]="resumen()"
                (ngModelChange)="cambiarResumen($event)"
                [style.color]="p().tintaSuave"
                placeholder="¿De qué trata este estudio? (una línea)" />

              @if (cu.tags.length) {
                <div class="temas">
                  @for (t of cu.tags; track t) {
                    <span class="tema"
                          [style.borderColor]="p().margen"
                          [style.color]="p().tinta">#{{ t }}</span>
                  }
                </div>
              }
            </div>

            <!-- Bloques: comentarios traídos y texto tuyo, con Drag & Drop -->
            <div class="bloques-lista" cdkDropList (cdkDropListDropped)="soltarBloque($event)">
            @for (b of cu.bloques; track $index; let i = $index) {

              @if (b.tipo === 'marca') {
                @if (marca(b.marcaId); as m) {
                  <div class="cita" cdkDrag [style.backgroundColor]="p().cita" [style.borderColor]="colorTema(m.tema)">
                    <div class="cita-cab">
                      <span class="manija-drag" cdkDragHandle title="Arrastra para mover bloque" [style.color]="p().tintaSuave">⠿</span>
                      <span class="franja" [style.backgroundColor]="colorTema(m.tema)"></span>
                      <b [style.color]="p().tinta">{{ tituloRef(m) }}</b>
                      <small [style.color]="p().tintaSuave">{{ nombreTema(m.tema) }}</small>
                      <span class="acciones-bloque">
                        <button type="button" (click)="subir(i)" [disabled]="i === 0"
                                [style.color]="p().tintaSuave" aria-label="Subir">↑</button>
                        <button type="button" (click)="bajar(i)" [disabled]="i === cu.bloques.length - 1"
                                [style.color]="p().tintaSuave" aria-label="Bajar">↓</button>
                        <button type="button" (click)="quitar(i)"
                                [style.color]="p().tintaSuave" aria-label="Quitar del cuaderno">✕</button>
                      </span>
                    </div>
                    <p class="versiculo" [style.color]="p().tinta">«{{ m.textoCitado }}»</p>
                    @if (m.comentario) {
                      <p class="comentario" [style.color]="p().tinta">{{ m.comentario }}</p>
                    }
                  </div>
                }
              }

              @else {
                <div class="parrafo" cdkDrag>
                  <div class="parrafo-cab">
                    <span class="manija-drag" cdkDragHandle title="Arrastra para mover bloque" [style.color]="p().tintaSuave">⠿</span>
                    <span class="acciones-bloque suelto">
                      <button type="button" (click)="subir(i)" [disabled]="i === 0"
                              [style.color]="p().tintaSuave" aria-label="Subir">↑</button>
                      <button type="button" (click)="bajar(i)" [disabled]="i === cu.bloques.length - 1"
                              [style.color]="p().tintaSuave" aria-label="Bajar">↓</button>
                      <button type="button" (click)="quitar(i)"
                              [style.color]="p().tintaSuave" aria-label="Borrar párrafo">✕</button>
                    </span>
                  </div>
                  <textarea
                    [ngModel]="b.texto"
                    (ngModelChange)="cambiarTexto(i, $event)"
                    [style.color]="p().tinta"
                    rows="1"
                    (input)="crecer($event)"
                    placeholder="Escribe aquí lo que entendiste…"></textarea>
                </div>
              }
            } @empty {
              <p class="vacio" [style.color]="p().tintaSuave">
                Este cuaderno está en blanco. Trae un comentario que ya hiciste,
                o empieza a escribir.
              </p>
            }
            </div>
          </article>
        </div>

        <!-- Barra de acciones -->
        <footer [style.borderColor]="c().border" [style.backgroundColor]="c().surface">
          <button type="button" class="accion"
                  [style.borderColor]="c().border" [style.color]="c().textPrimary"
                  (click)="agregarParrafo()">✎ Escribir</button>
          <button type="button" class="accion principal"
                  [style.backgroundColor]="c().primary"
                  (click)="abrirSelector.set(true)">＋ Traer comentario</button>
        </footer>

        <!-- Modal de confirmación para borrar cuaderno -->
        @if (confirmarBorrar()) {
          <div class="modal" (click)="confirmarBorrar.set(false)">
            <div class="panel-confirmar" (click)="$event.stopPropagation()"
                 [style.backgroundColor]="c().card" [style.borderColor]="c().border">
              <h3 [style.color]="c().textPrimary">¿Borrar este cuaderno?</h3>
              <p [style.color]="c().textMuted">
                Se eliminará el cuaderno «{{ cu.titulo || 'Sin título' }}».
                Tus versículos resaltados y comentarios seguirán a salvo en tu estudio.
              </p>
              <div class="acciones-confirmar">
                <button type="button" class="btn-cancelar"
                        [style.borderColor]="c().border" [style.color]="c().textPrimary"
                        (click)="confirmarBorrar.set(false)">
                  Cancelar
                </button>
                <button type="button" class="btn-peligro"
                        (click)="borrarEsteCuaderno()">
                  Sí, borrar cuaderno
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Selector de comentarios -->
        @if (abrirSelector()) {
          <div class="modal" (click)="abrirSelector.set(false)">
            <div class="panel" (click)="$event.stopPropagation()"
                 [style.backgroundColor]="c().card" [style.borderColor]="c().border">
              <input
                class="buscar"
                [ngModel]="busqueda()"
                (ngModelChange)="busqueda.set($event)"
                [style.color]="c().textPrimary"
                [style.borderColor]="c().border"
                placeholder="Buscar entre tus comentarios…" />
              <ul>
                @for (m of disponibles(); track m.id) {
                  <li (click)="traer(m.id)" [style.borderColor]="c().border">
                    <span class="franja" [style.backgroundColor]="colorTema(m.tema)"></span>
                    <span class="detalle">
                      <b [style.color]="c().textPrimary">{{ tituloRef(m) }}</b>
                      <small [style.color]="c().textMuted">{{ m.comentario || m.textoCitado }}</small>
                    </span>
                  </li>
                } @empty {
                  <li class="nada" [style.color]="c().textMuted">
                    No hay comentarios para traer. Marca un versículo en la Biblia primero.
                  </li>
                }
              </ul>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="pantalla flex items-center justify-center p-6" [style.backgroundColor]="c().background">
        <!-- Si el cuaderno fue eliminado o cerrado, retorna de inmediato sin pantalla en blanco -->
        <ng-container>{{ cerrar.emit() }}</ng-container>
      </div>
    }
  `,
  styles: [`
    :host { display:block; height:100%; }
    .pantalla { display:flex; flex-direction:column; height:100%; overflow:hidden; }

    header { display:flex; align-items:center; gap:10px; padding:13px 16px;
             border-bottom:1px solid; flex:none; }
    .volver { width:38px; height:38px; border-radius:12px; border:1px solid;
              background:transparent; font-size:19px; line-height:1; cursor:pointer; flex:none; }
    .titulo { flex:1; min-width:0; border:0; background:transparent; outline:none;
              font:600 18px 'Lora', Georgia, serif; }
    .guardado { font-size:11px; white-space:nowrap; }

    /* ---------- La hoja ---------- */
    .hoja-envoltura { flex:1; overflow-y:auto; padding:16px 14px 28px; }

    .hoja {
      border:1px solid; border-radius:14px; overflow:hidden;
      /* Renglones cada 32 px. La hoja entera se apoya en esta rejilla, así que
         todo lo escrito cae sobre una línea, como en un cuaderno de verdad. */
      background-image:repeating-linear-gradient(
        to bottom,
        transparent 0,
        transparent 31px,
        var(--renglon) 31px,
        var(--renglon) 32px
      );
      background-position:0 12px;
      padding:14px 16px 26px 46px;
      position:relative;
      box-shadow:0 8px 22px -14px rgba(0,0,0,.35);
    }
    /* El margen: la línea vertical de la izquierda. */
    .hoja::before {
      content:''; position:absolute; top:0; bottom:0; left:32px;
      width:1.5px; background:var(--margen); opacity:.75;
    }

    .encabezado { margin-bottom:14px; }
    .resumen {
      width:100%; border:0; background:transparent; outline:none;
      font:italic 14px/32px 'Lora', Georgia, serif;
    }
    .temas { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
    .tema { font-size:12px; padding:3px 10px; border:1px solid; border-radius:999px; }

    /* Cita traída: una tarjeta pegada sobre la hoja */
    .cita {
      border:1px solid; border-left-width:3px; border-radius:10px;
      padding:11px 13px; margin:0 0 14px;
    }
    .cita-cab { display:flex; align-items:center; gap:8px; margin-bottom:7px; flex-wrap:wrap; }
    .cita-cab b { font:700 12.5px 'Plus Jakarta Sans', system-ui, sans-serif;
                  letter-spacing:.04em; }
    .cita-cab small { font-size:11.5px; }
    .franja { width:9px; height:9px; border-radius:50%; flex:none; }
    .versiculo { margin:0 0 7px; font:italic 15px/1.7 'Lora', Georgia, serif; }
    .comentario { margin:0; font:15px/1.75 'Plus Jakarta Sans', system-ui, sans-serif; }

    /* Párrafo escrito por el usuario: cae exacto sobre los renglones */
    .parrafo { position:relative; margin:0 0 8px; }
    .parrafo textarea {
      width:100%; border:0; background:transparent; outline:none; resize:none;
      font:16px/32px 'Lora', Georgia, serif; padding:0; overflow:hidden;
      display:block;
    }

    .acciones-bloque { display:flex; gap:2px; margin-left:auto; }
    .acciones-bloque button {
      width:28px; height:28px; border:0; background:transparent;
      font-size:13px; cursor:pointer; border-radius:7px; opacity:.55;
    }
    .acciones-bloque button:hover { opacity:1; }
    .acciones-bloque button:disabled { opacity:.2; cursor:default; }
    .acciones-bloque.suelto {
      position:absolute; right:0; top:0; opacity:0; transition:opacity .15s;
    }
    .parrafo:hover .acciones-bloque.suelto,
    .parrafo:focus-within .acciones-bloque.suelto { opacity:1; }

    .vacio { font:italic 14px/32px 'Lora', Georgia, serif; margin:0; }

    /* ---------- Barra inferior ---------- */
    footer { display:flex; gap:9px; padding:12px 16px calc(12px + env(safe-area-inset-bottom));
             border-top:1px solid; flex:none; }
    .accion { flex:1; min-height:48px; border:1.5px solid; border-radius:14px;
              background:transparent; font:500 14.5px 'Plus Jakarta Sans', system-ui, sans-serif;
              cursor:pointer; }
    .accion.principal { border-color:transparent; color:#fff; font-weight:600; }

    /* ---------- Selector ---------- */
    .modal { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:200;
             display:flex; align-items:flex-end; justify-content:center; }
    .panel { width:min(520px,100%); max-height:76dvh; border:1px solid;
             border-radius:22px 22px 0 0; overflow:hidden; display:flex; flex-direction:column;
             padding-bottom:env(safe-area-inset-bottom); }
    .buscar { border:0; border-bottom:1px solid; background:transparent; outline:none;
              padding:16px 18px; font-size:15.5px; flex:none; }
    .panel ul { margin:0; padding:8px; list-style:none; overflow-y:auto; }
    .panel li { display:flex; align-items:flex-start; gap:11px; padding:12px;
                border-radius:12px; cursor:pointer; }
    .panel li:hover { border:1px solid; margin:-1px; }
    .panel .detalle { min-width:0; }
    .panel .detalle b { display:block; font:700 13px 'Plus Jakarta Sans', system-ui, sans-serif; }
    .panel .detalle small { display:block; font-size:13px; margin-top:2px;
                            overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .panel li.nada { cursor:default; font-size:14px; line-height:1.6; }
    .header-acciones { display: flex; align-items: center; gap: 6px; }
    .btn-borrar-cuaderno {
      width: 36px; height: 36px; border: 1px solid; border-radius: 10px; background: transparent;
      font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: .75;
    }
    .btn-borrar-cuaderno:hover { opacity: 1; color: #ef4444; border-color: #ef4444; }
    .manija-drag {
      cursor: grab; padding: 2px 6px; font-size: 16px; opacity: .4; user-select: none;
      display: flex; align-items: center; justify-content: center;
    }
    .manija-drag:active { cursor: grabbing; opacity: 1; }
    .parrafo-cab { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .panel-confirmar {
      width: min(420px, 92%); padding: 22px 20px; border: 1.5px solid; border-radius: 20px;
      margin: auto; display: flex; flex-direction: column; gap: 12px;
    }
    .panel-confirmar h3 { margin: 0; font: 700 18px 'Plus Jakarta Sans', system-ui, sans-serif; }
    .panel-confirmar p { margin: 0; font-size: 14px; line-height: 1.5; }
    .acciones-confirmar { display: flex; gap: 10px; margin-top: 8px; }
    .acciones-confirmar button {
      flex: 1; min-height: 44px; border-radius: 12px; font: 600 14px 'Plus Jakarta Sans', system-ui, sans-serif; cursor: pointer;
    }
    .btn-cancelar { border: 1px solid; background: transparent; }
    .btn-peligro { border: 0; background: #dc2626; color: #fff; }

    @media (prefers-reduced-motion: reduce) { * { transition:none !important; } }
  `],
})
export class R07CuadernoComponent {
  private readonly storage = inject(R07StorageService);
  private readonly estudio = inject(EstudioService);

  readonly cuadernoId = input.required<string>();
  readonly cerrar = output<void>();

  readonly c = this.storage.currentThemeColors;
  /** El papel, derivado de la paleta activa. Cambia solo con el tema. */
  readonly p = computed(() => papelDelTema(this.c()));

  readonly cuaderno = computed(() => this.estudio.cuaderno(this.cuadernoId()));

  readonly titulo = signal('');
  readonly resumen = signal('');
  readonly estado = signal('');
  readonly abrirSelector = signal(false);
  readonly busqueda = signal('');
  readonly confirmarBorrar = signal(false);

  private guardando?: ReturnType<typeof setTimeout>;

  /** Comentarios que todavía no están en este cuaderno. */
  readonly disponibles = computed(() => {
    const cu = this.cuaderno();
    if (!cu) return [];
    const yaEstan = new Set(
      cu.bloques.filter((b) => b.tipo === 'marca').map((b) => (b as { marcaId: string }).marcaId)
    );
    const q = this.busqueda().trim().toLowerCase();
    return this.estudio
      .marcas()
      .filter((m) => !yaEstan.has(m.id))
      .filter(
        (m) =>
          !q ||
          m.comentario.toLowerCase().includes(q) ||
          m.textoCitado.toLowerCase().includes(q) ||
          refTitulo(m.ref).toLowerCase().includes(q)
      )
      .slice(0, 40);
  });

  constructor() {
    effect(() => {
      const cu = this.cuaderno();
      if (!cu || this.guardando) return;
      this.titulo.set(cu.titulo);
      this.resumen.set(cu.resumen);
    });
  }

  /* ---------------- Lectura ---------------- */

  marca(id: string) { return this.estudio.marca(id); }
  tituloRef(m: { ref: Parameters<typeof refTitulo>[0] }) { return refTitulo(m.ref); }
  colorTema(t: string) { return this.estudio.getTema(t).color; }
  nombreTema(t: string) { return this.estudio.getTema(t).nombre; }

  soltarBloque(event: CdkDragDrop<any>): void {
    if (event.previousIndex === event.currentIndex) return;
    const id = this.cuadernoId();
    if (!id) return;
    void this.estudio.moverBloque(id, event.previousIndex, event.currentIndex);
  }

  async borrarEsteCuaderno(): Promise<void> {
    const id = this.cuadernoId();
    if (!id) return;
    this.confirmarBorrar.set(false);
    this.cerrar.emit();
    await this.estudio.borrarCuaderno(id);
    this.storage.showSnackbar('Cuaderno eliminado con éxito 🗑️');
  }

  /* ---------------- Escritura ---------------- */

  cambiarTitulo(v: string): void { this.titulo.set(v); this.guardar(); }
  cambiarResumen(v: string): void { this.resumen.set(v); this.guardar(); }

  cambiarTexto(i: number, texto: string): void {
    const cu = this.cuaderno();
    if (!cu) return;
    const bloques = [...cu.bloques];
    bloques[i] = { tipo: 'texto', texto };
    this.aplicar({ ...cu, bloques });
  }

  agregarParrafo(): void {
    const cu = this.cuaderno();
    if (!cu) return;
    this.aplicar({ ...cu, bloques: [...cu.bloques, { tipo: 'texto', texto: '' }] });
  }

  async traer(marcaId: string): Promise<void> {
    await this.estudio.agregarMarcaACuaderno(this.cuadernoId(), marcaId);
    this.abrirSelector.set(false);
    this.busqueda.set('');
  }

  subir(i: number): void { this.mover(i, i - 1); }
  bajar(i: number): void { this.mover(i, i + 1); }

  private mover(desde: number, hasta: number): void {
    const cu = this.cuaderno();
    if (!cu || hasta < 0 || hasta >= cu.bloques.length) return;
    const bloques = [...cu.bloques];
    const [b] = bloques.splice(desde, 1);
    bloques.splice(hasta, 0, b);
    this.aplicar({ ...cu, bloques });
  }

  quitar(i: number): void {
    const cu = this.cuaderno();
    if (!cu) return;
    // Quitar del cuaderno NO borra el comentario: sigue en su sección.
    this.aplicar({ ...cu, bloques: cu.bloques.filter((_, k) => k !== i) });
  }

  /** El textarea crece con el texto, en múltiplos del renglón (32 px). */
  crecer(ev: Event): void {
    const el = ev.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.ceil(el.scrollHeight / 32) * 32 + 'px';
  }

  /* ---------------- Guardado ---------------- */

  private aplicar(cu: CuadernoEstudio): void {
    void this.estudio.guardarCuaderno(cu);
    this.marcarGuardado();
  }

  private guardar(): void {
    clearTimeout(this.guardando);
    this.estado.set('Escribiendo…');
    this.guardando = setTimeout(() => {
      const cu = this.cuaderno();
      if (cu) {
        void this.estudio.guardarCuaderno({
          ...cu,
          titulo: this.titulo(),
          resumen: this.resumen(),
        });
      }
      this.guardando = undefined;
      this.marcarGuardado();
    }, 700);
  }

  private marcarGuardado(): void {
    this.estado.set('Guardado');
    setTimeout(() => this.estado.set(''), 1600);
  }
}
