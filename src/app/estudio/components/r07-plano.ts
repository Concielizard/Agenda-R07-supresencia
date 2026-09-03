import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { R07StorageService } from '../../services/r07-storage.service';
import { EstudioService } from '../services/estudio.service';
import { calcularPlano, type NodoMapa, type Punto } from '../core/mapa';
import { TEMAS_RESALTADO, TEMA_POR_ID, type TemaResaltado } from '../models/estudio.models';

interface NodoDibujado {
  id: string;
  tipo: 'ref' | 'note' | 'tag' | 'nota';
  titulo: string;
  detalle: string;
  color: string;
  x: number;
  y: number;
}

/**
 * EL PLANO — un tablero que se edita, no una foto que se mira.
 *
 * Todo lo que hay adentro se puede tocar:
 *   · Tocar una tarjeta          -> se selecciona y aparece el panel abajo
 *   · Tirar del punto del borde  -> sale una flecha hacia otra tarjeta
 *   · Arrastrar la tarjeta       -> se mueve y ahí queda guardada
 *   · Botón ＋                    -> crea una tarjeta nueva donde estás mirando
 *   · Tocar una flecha           -> se puede etiquetar o borrar
 *
 * Lo que la app calcula (versículos, cuadernos, etiquetas) es el punto de
 * partida. Encima de eso el usuario arma lo suyo, y eso es lo que se guarda:
 * posiciones, notas propias y flechas trazadas a mano.
 *
 * Nada se mueve solo. Sin física, sin animaciones que reacomoden. Se abre
 * siempre igual.
 */
@Component({
  selector: 'r07-plano',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pantalla" [style.backgroundColor]="c().background">

      <header [style.borderColor]="c().border">
        <button type="button" class="icono"
                [style.borderColor]="c().border" [style.color]="c().textSecondary"
                (click)="cerrar.emit()" aria-label="Volver">‹</button>
        <h2 [style.color]="c().textPrimary">Mi plano</h2>
        <span class="cuenta" [style.color]="c().textMuted">{{ (zoom() * 100).toFixed(0) }}%</span>
      </header>

      <div class="lienzo" #lienzo
           (pointerdown)="fondoAbajo($event)"
           (pointermove)="fondoMovio($event)"
           (pointerup)="fondoArriba($event)"
           (pointercancel)="fondoArriba($event)">

        <div class="mundo" [style.transform]="transformacion()"
             [style.width.px]="ancho()" [style.height.px]="alto()">

          <svg class="capa" [attr.width]="ancho()" [attr.height]="alto()">
            <!-- Grupos de fondo -->
            @for (g of grupos(); track g.id) {
              <circle [attr.cx]="g.x" [attr.cy]="g.y" [attr.r]="g.r"
                      fill="none" [attr.stroke]="c().border" stroke-dasharray="3 9" />
            }

            <!-- Conexiones que salieron de tu estudio -->
            @for (a of lineasAuto(); track a.id) {
              <line [attr.x1]="a.x1" [attr.y1]="a.y1" [attr.x2]="a.x2" [attr.y2]="a.y2"
                    [attr.stroke]="c().border" stroke-width="1.2" />
            }

            <!-- Flechas que trazaste tú -->
            @for (f of flechas(); track f.id) {
              <g class="flecha" (pointerdown)="tocarFlecha($event, f.id)">
                <path [attr.d]="f.d" fill="none"
                      [attr.stroke]="flechaSel() === f.id ? c().primary : c().accent"
                      [attr.stroke-width]="flechaSel() === f.id ? 3 : 2" />
                <path [attr.d]="f.d" fill="none" stroke="transparent" stroke-width="20" />
                <polygon [attr.points]="f.punta"
                         [attr.fill]="flechaSel() === f.id ? c().primary : c().accent" />
                @if (f.etiqueta) {
                  <text [attr.x]="f.lx" [attr.y]="f.ly" [attr.fill]="c().textSecondary"
                        font-size="12" text-anchor="middle" paint-order="stroke"
                        [attr.stroke]="c().background" stroke-width="5">{{ f.etiqueta }}</text>
                }
              </g>
            }

            <!-- Flecha en curso -->
            @if (flechaEnCurso(); as d) {
              <path [attr.d]="d" fill="none" [attr.stroke]="c().primary"
                    stroke-width="2.5" stroke-dasharray="7 6" />
            }
          </svg>

          <!-- Tarjetas -->
          @for (n of nodos(); track n.id) {
            <div class="nodo"
                 [class.chico]="!detalle()"
                 [class.sel]="seleccion() === n.id"
                 [style.left.px]="n.x" [style.top.px]="n.y"
                 [style.backgroundColor]="detalle() ? c().card : 'transparent'"
                 [style.borderColor]="seleccion() === n.id ? c().primary : c().border"
                 (pointerdown)="nodoAbajo($event, n.id)">
              <span class="punto"
                    [class.cuaderno]="n.tipo === 'note'"
                    [class.tema]="n.tipo === 'tag'"
                    [style.backgroundColor]="n.color" [style.borderColor]="n.color"></span>
              <span class="etiqueta" [style.color]="c().textPrimary">{{ n.titulo }}</span>

              <!-- El tirador de conectar: solo en la tarjeta seleccionada -->
              @if (seleccion() === n.id && detalle()) {
                <span class="conector" [style.backgroundColor]="c().primary"
                      [style.borderColor]="c().card"
                      (pointerdown)="empezarFlecha($event, n.id)"
                      title="Arrastra hacia otra tarjeta para conectar"></span>
              }
            </div>
          }
        </div>

        <!-- Ayuda la primera vez -->
        @if (!nodos().length) {
          <div class="vacio" [style.color]="c().textMuted">
            <p class="grande" [style.color]="c().textPrimary">Tu plano está vacío</p>
            <p>Marca un versículo en la Biblia, o toca <b>＋</b> para escribir una tarjeta.</p>
          </div>
        }

        <!-- Botón crear -->
        <button type="button" class="crear"
                [style.backgroundColor]="c().primary"
                (click)="crearNota()" aria-label="Nueva tarjeta">＋</button>
      </div>

      <!-- ======== Panel de la tarjeta seleccionada ======== -->
      @if (nodoSel(); as n) {
        <section class="panel" [style.backgroundColor]="c().card" [style.borderColor]="c().border">
          <div class="panel-cab">
            <span class="punto" [style.backgroundColor]="n.color" [style.borderColor]="n.color"></span>
            <p class="clase" [style.color]="c().primary">{{ nombreTipo(n.tipo) }}</p>
            <button type="button" class="cerrar" [style.color]="c().textMuted"
                    (click)="limpiar()" aria-label="Cerrar">✕</button>
          </div>

          @if (n.tipo === 'nota') {
            <input class="campo" [ngModel]="n.titulo"
                   (ngModelChange)="renombrar(n.id, $event)"
                   [style.color]="c().textPrimary" [style.borderColor]="c().border"
                   placeholder="Título" />
            <textarea class="campo" rows="2" [ngModel]="n.detalle"
                      (ngModelChange)="detallar(n.id, $event)"
                      [style.color]="c().textSecondary" [style.borderColor]="c().border"
                      placeholder="Escribe aquí…"></textarea>
            <div class="colores">
              @for (t of TEMAS; track t.id) {
                <button type="button" class="color"
                        [style.backgroundColor]="t.color"
                        [style.outlineColor]="temaDe(n.id) === t.id ? c().textPrimary : 'transparent'"
                        (click)="pintar(n.id, t.id)"
                        [attr.aria-label]="t.nombre"></button>
              }
            </div>
          } @else {
            <p class="titulo" [style.color]="c().textPrimary">{{ n.titulo }}</p>
            @if (n.detalle) {
              <p class="detalle" [style.color]="c().textSecondary">«{{ n.detalle }}»</p>
            }
          }

          <div class="acciones">
            <button type="button" [style.backgroundColor]="c().primary" (click)="modoConectar()">
              {{ conectando() ? 'Toca la otra tarjeta' : 'Conectar' }}
            </button>
            @if (n.tipo === 'nota') {
              <button type="button" [style.borderColor]="c().border" [style.color]="c().textSecondary"
                      (click)="borrarNota(n.id)">Borrar</button>
            } @else {
              <button type="button" [style.borderColor]="c().border" [style.color]="c().textSecondary"
                      (click)="ocultar(n.id)">Quitar del plano</button>
            }
          </div>
        </section>
      }

      <!-- ======== Panel de la flecha seleccionada ======== -->
      @if (flechaSel(); as id) {
        <section class="panel" [style.backgroundColor]="c().card" [style.borderColor]="c().border">
          <div class="panel-cab">
            <p class="clase" [style.color]="c().primary">Conexión tuya</p>
            <button type="button" class="cerrar" [style.color]="c().textMuted"
                    (click)="flechaSel.set(null)" aria-label="Cerrar">✕</button>
          </div>
          <input class="campo" [ngModel]="etiquetaFlecha()"
                 (ngModelChange)="etiquetar(id, $event)"
                 [style.color]="c().textPrimary" [style.borderColor]="c().border"
                 placeholder="¿Qué relación es? (desarrolla, cumple, contradice…)" />
          <div class="acciones">
            <button type="button" [style.borderColor]="c().border" [style.color]="c().textSecondary"
                    (click)="borrarFlecha(id)">Borrar conexión</button>
          </div>
        </section>
      }

      <!-- ======== Barra inferior ======== -->
      @if (!nodoSel() && !flechaSel()) {
        <footer [style.borderColor]="c().border" [style.backgroundColor]="c().surface">
          <button type="button" class="icono" [style.borderColor]="c().border"
                  [style.color]="c().textPrimary" (click)="acercar(0.75)" aria-label="Alejar">−</button>
          <button type="button" class="ancho" [style.borderColor]="c().border"
                  [style.color]="c().textSecondary" (click)="encajar()">Ver todo</button>
          <button type="button" class="icono" [style.borderColor]="c().border"
                  [style.color]="c().textPrimary" (click)="acercar(1.33)" aria-label="Acercar">+</button>
          @if (hayCambios()) {
            <button type="button" class="ancho" [style.borderColor]="c().border"
                    [style.color]="c().textMuted" (click)="reordenar()">Reordenar</button>
          }
        </footer>
      }
    </div>
  `,
  styles: [`
    :host { display:block; height:100%; }
    .pantalla { display:flex; flex-direction:column; height:100%; overflow:hidden; }

    header { display:flex; align-items:center; gap:10px; padding:13px 16px;
             border-bottom:1px solid; flex:none; }
    header h2 { margin:0; flex:1; font:600 18px 'Lora', Georgia, serif; }
    .cuenta { font-size:11.5px; font-variant-numeric:tabular-nums; }
    .icono { width:42px; height:42px; border-radius:12px; border:1px solid;
             background:transparent; font-size:18px; line-height:1; cursor:pointer; }

    .lienzo { position:relative; flex:1; overflow:hidden; touch-action:none; cursor:grab; }
    .lienzo:active { cursor:grabbing; }
    .mundo { position:absolute; top:0; left:0; transform-origin:0 0; }
    .capa { position:absolute; top:0; left:0; overflow:visible; pointer-events:none; }
    .capa .flecha { pointer-events:auto; cursor:pointer; }

    .nodo {
      position:absolute; transform:translate(-50%,-50%);
      display:flex; align-items:center; gap:8px;
      max-width:190px; min-height:44px; padding:9px 13px;
      border:1px solid; border-radius:14px; cursor:grab;
      line-height:1.3; touch-action:none;
    }
    .nodo:active { cursor:grabbing; }
    .nodo.sel { box-shadow:0 6px 20px -8px rgba(0,0,0,.4); }
    .nodo.chico { flex-direction:column; gap:3px; padding:0; min-height:0;
                  max-width:112px; border-color:transparent !important; }
    .nodo.chico .etiqueta { font-size:11px; text-align:center; }

    .punto { width:10px; height:10px; border-radius:50%; flex:none; border:1.6px solid; }
    .punto.cuaderno { border-radius:3px; }
    .punto.tema { background:transparent !important; }
    .etiqueta { font:500 13px 'Plus Jakarta Sans', system-ui, sans-serif;
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

    /* El tirador de conectar: grande a propósito, se agarra con el dedo */
    .conector {
      position:absolute; right:-11px; top:calc(50% - 11px);
      width:22px; height:22px; border-radius:50%; border:2.5px solid;
      cursor:crosshair; touch-action:none;
    }
    .conector::after {
      content:''; position:absolute; inset:-10px;   /* área de toque ampliada */
    }

    .crear {
      position:absolute; right:16px; bottom:16px; z-index:5;
      width:54px; height:54px; border:0; border-radius:18px;
      color:#fff; font-size:26px; line-height:1; cursor:pointer;
      box-shadow:0 10px 24px -10px rgba(0,0,0,.5);
    }

    .vacio { position:absolute; inset:0; display:flex; flex-direction:column;
             align-items:center; justify-content:center; text-align:center;
             padding:40px 34px; gap:8px; }
    .vacio .grande { font:600 19px 'Lora', Georgia, serif; margin:0; }
    .vacio p { margin:0; font-size:14px; line-height:1.65; max-width:20rem; }

    /* ---------- Paneles ---------- */
    .panel { flex:none; border-top:1px solid; padding:14px 16px calc(16px + env(safe-area-inset-bottom));
             display:flex; flex-direction:column; gap:10px; }
    .panel-cab { display:flex; align-items:center; gap:9px; }
    .panel-cab .clase { margin:0; flex:1; font:700 10.5px 'Plus Jakarta Sans', system-ui, sans-serif;
                        letter-spacing:.13em; text-transform:uppercase; }
    .cerrar { border:0; background:transparent; font-size:16px; cursor:pointer; padding:4px 8px; }
    .panel .titulo { margin:0; font:600 17px/1.4 'Lora', Georgia, serif; }
    .panel .detalle { margin:0; font:italic 14px/1.6 'Lora', Georgia, serif; }
    .campo { width:100%; padding:11px 13px; border:1px solid; border-radius:12px;
             background:transparent; font:14.5px 'Plus Jakarta Sans', system-ui, sans-serif;
             resize:none; outline:none; }
    .colores { display:flex; gap:8px; }
    .color { width:32px; height:32px; border-radius:50%; border:0; cursor:pointer;
             outline:2.5px solid transparent; outline-offset:2px; }
    .acciones { display:flex; gap:9px; }
    .acciones button { flex:1; min-height:48px; border:1.5px solid transparent; border-radius:13px;
                       background:transparent; color:#fff;
                       font:600 14.5px 'Plus Jakarta Sans', system-ui, sans-serif; cursor:pointer; }
    .acciones button:last-child { font-weight:500; }

    footer { display:flex; gap:8px; padding:12px 16px calc(12px + env(safe-area-inset-bottom));
             border-top:1px solid; flex:none; }
    footer .ancho { flex:1; min-height:46px; border:1.5px solid; border-radius:13px;
                    background:transparent;
                    font:500 14px 'Plus Jakarta Sans', system-ui, sans-serif; cursor:pointer; }
  `],
})
export class R07PlanoComponent implements AfterViewInit {
  private readonly storage = inject(R07StorageService);
  private readonly estudio = inject(EstudioService);

  readonly c = this.storage.currentThemeColors;
  readonly cerrar = output<void>();

  readonly lienzo = viewChild<ElementRef<HTMLDivElement>>('lienzo');
  readonly TEMAS = TEMAS_RESALTADO;

  readonly zoom = signal(0.85);
  readonly seleccion = signal<string | null>(null);
  readonly flechaSel = signal<string | null>(null);
  readonly conectando = signal(false);
  readonly flechaEnCurso = signal<string | null>(null);
  readonly transformacion = signal('translate(0px,0px) scale(0.85)');

  readonly detalle = computed(() => this.zoom() >= 0.5);

  private camara = { x: 0, y: 0 };
  private punteros = new Map<number, Punto>();
  private d0 = 0;
  private z0 = 1;

  private arrastrando: string | null = null;
  private origenArrastre: Punto = { x: 0, y: 0 };
  private movio = false;
  private tirandoDe: string | null = null;

  /** Desplazamiento para que nada quede en coordenadas negativas. */
  private readonly DESPLAZA = 200;

  /* ---------------- Datos ---------------- */

  private readonly plano = computed(() => {
    const g = this.estudio.grafo();
    const ocultos = new Set(this.estudio.tablero().ocultos);
    return calcularPlano(
      g.nodos.filter((n) => !ocultos.has(n.id)),
      g.aristas.filter((a) => !ocultos.has(a.origen) && !ocultos.has(a.destino))
    );
  });

  readonly ancho = computed(() =>
    this.plano().caja.maxX - this.plano().caja.minX + this.DESPLAZA * 2
  );
  readonly alto = computed(() =>
    this.plano().caja.maxY - this.plano().caja.minY + this.DESPLAZA * 2
  );

  readonly grupos = computed(() => {
    const caja = this.plano().caja;
    return this.plano().grupos.map((g, i) => ({
      id: `g${i}`,
      x: g.cx - caja.minX + this.DESPLAZA,
      y: g.cy - caja.minY + this.DESPLAZA,
      r: g.r,
    }));
  });

  /** Posición final de un nodo: la que movió el usuario, o la calculada. */
  private posicion(id: string): Punto {
    const manual = this.estudio.tablero().posiciones[id];
    if (manual) return manual;

    const nota = this.estudio.tablero().notas.find((n) => n.id === id);
    if (nota) return { x: nota.x, y: nota.y };

    const p = this.plano().posiciones.get(id);
    const caja = this.plano().caja;
    return p
      ? { x: p.x - caja.minX + this.DESPLAZA, y: p.y - caja.minY + this.DESPLAZA }
      : { x: this.DESPLAZA, y: this.DESPLAZA };
  }

  readonly nodos = computed<NodoDibujado[]>(() => {
    const c = this.c();
    const ocultos = new Set(this.estudio.tablero().ocultos);

    const delGrafo: NodoDibujado[] = this.estudio
      .grafo()
      .nodos.filter((n: NodoMapa) => !ocultos.has(n.id))
      .map((n: NodoMapa) => {
        const p = this.posicion(n.id);
        return {
          id: n.id,
          tipo: n.tipo,
          titulo: n.titulo,
          detalle: this.detalleDe(n.id),
          color: n.tipo === 'ref' ? c.primary : n.tipo === 'note' ? c.accent : c.textMuted,
          x: p.x,
          y: p.y,
        };
      });

    const mias: NodoDibujado[] = this.estudio.tablero().notas.map((n) => {
      const p = this.posicion(n.id);
      return {
        id: n.id,
        tipo: 'nota' as const,
        titulo: n.titulo,
        detalle: n.detalle,
        color: TEMA_POR_ID.get(n.tema)?.color ?? c.primary,
        x: p.x,
        y: p.y,
      };
    });

    return [...delGrafo, ...mias];
  });

  readonly nodoSel = computed(() => {
    const id = this.seleccion();
    return id ? (this.nodos().find((n) => n.id === id) ?? null) : null;
  });

  readonly hayCambios = computed(() => {
    const t = this.estudio.tablero();
    return Object.keys(t.posiciones).length > 0 || t.ocultos.length > 0;
  });

  /** Líneas que salieron del estudio (no las tuyas). */
  readonly lineasAuto = computed(() => {
    const p = this.plano();
    const ocultos = new Set(this.estudio.tablero().ocultos);
    const out: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];

    for (const a of this.estudio.grafo().aristas) {
      if (ocultos.has(a.origen) || ocultos.has(a.destino)) continue;
      const k = `${a.origen}|${a.destino}`;
      if (!p.internas.has(k)) continue;   // entre grupos distintos ensucia
      const A = this.posicion(a.origen), B = this.posicion(a.destino);
      out.push({ id: k, x1: A.x, y1: A.y, x2: B.x, y2: B.y });
    }
    return out;
  });

  /** Flechas trazadas por el usuario, con su punta y su etiqueta. */
  readonly flechas = computed(() => {
    return this.estudio.tablero().flechas.map((f) => {
      const A = this.posicion(f.origen), B = this.posicion(f.destino);
      const dx = B.x - A.x, dy = B.y - A.y;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d, uy = dy / d;

      // Se recorta en el borde de las tarjetas para que no queden "clavadas".
      const x1 = A.x + ux * 34, y1 = A.y + uy * 24;
      const x2 = B.x - ux * 40, y2 = B.y - uy * 28;
      const mx = (x1 + x2) / 2 - uy * d * 0.10;
      const my = (y1 + y2) / 2 + ux * d * 0.10;

      const ang = Math.atan2(y2 - my, x2 - mx);
      const s = 10;
      const punta = [
        [x2, y2],
        [x2 - s * Math.cos(ang - 0.42), y2 - s * Math.sin(ang - 0.42)],
        [x2 - s * Math.cos(ang + 0.42), y2 - s * Math.sin(ang + 0.42)],
      ].map(([x, y]) => `${x},${y}`).join(' ');

      return {
        id: f.id,
        d: `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`,
        punta,
        etiqueta: f.etiqueta,
        lx: mx,
        ly: my - 8,
      };
    });
  });

  readonly etiquetaFlecha = computed(() => {
    const id = this.flechaSel();
    return this.estudio.tablero().flechas.find((f) => f.id === id)?.etiqueta ?? '';
  });

  private detalleDe(id: string): string {
    if (id.startsWith('ref:')) {
      return this.estudio.marcas().find((m) => `ref:${m.refIds[0]}` === id)?.textoCitado ?? '';
    }
    if (id.startsWith('note:')) {
      return this.estudio.cuaderno(id.replace('note:', ''))?.resumen ?? '';
    }
    return '';
  }

  /* ---------------- Ciclo de vida ---------------- */

  ngAfterViewInit(): void {
    this.centrar();
    this.lienzo()?.nativeElement.addEventListener('wheel', this.rueda, { passive: false });
  }

  /* ---------------- Cámara ---------------- */

  private aplicar(): void {
    this.transformacion.set(
      `translate(${this.camara.x}px, ${this.camara.y}px) scale(${this.zoom()})`
    );
  }

  private local(ev: PointerEvent): Punto {
    const r = this.lienzo()!.nativeElement.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  private aMundo(p: Punto): Punto {
    return { x: (p.x - this.camara.x) / this.zoom(), y: (p.y - this.camara.y) / this.zoom() };
  }

  /** Abre centrado y legible. Alejar es decisión del usuario. */
  private centrar(): void {
    const el = this.lienzo()?.nativeElement;
    if (!el) return;
    this.zoom.set(0.85);
    this.camara = {
      x: el.clientWidth / 2 - (this.ancho() / 2) * 0.85,
      y: el.clientHeight / 2 - (this.alto() / 2) * 0.85,
    };
    this.aplicar();
  }

  encajar(): void {
    const el = this.lienzo()?.nativeElement;
    if (!el) return;
    const z = Math.min(1.6, Math.max(0.12,
      Math.min((el.clientWidth - 32) / this.ancho(), (el.clientHeight - 32) / this.alto())));
    this.zoom.set(z);
    this.camara = {
      x: (el.clientWidth - this.ancho() * z) / 2,
      y: (el.clientHeight - this.alto() * z) / 2,
    };
    this.aplicar();
  }

  acercar(f: number): void {
    const el = this.lienzo()?.nativeElement;
    if (!el) return;
    const cx = el.clientWidth / 2, cy = el.clientHeight / 2;
    const nz = Math.min(2.4, Math.max(0.12, this.zoom() * f));
    const k = nz / this.zoom();
    this.camara = { x: cx - (cx - this.camara.x) * k, y: cy - (cy - this.camara.y) * k };
    this.zoom.set(nz);
    this.aplicar();
  }

  private readonly rueda = (ev: WheelEvent) => {
    ev.preventDefault();
    const r = this.lienzo()!.nativeElement.getBoundingClientRect();
    const px = ev.clientX - r.left, py = ev.clientY - r.top;
    const nz = Math.min(2.4, Math.max(0.12, this.zoom() * Math.exp(-ev.deltaY * 0.0016)));
    const k = nz / this.zoom();
    this.camara = { x: px - (px - this.camara.x) * k, y: py - (py - this.camara.y) * k };
    this.zoom.set(nz);
    this.aplicar();
  };

  /* ---------------- Gestos sobre las tarjetas ---------------- */

  nodoAbajo(ev: PointerEvent, id: string): void {
    ev.stopPropagation();
    (ev.target as HTMLElement).setPointerCapture?.(ev.pointerId);

    // Si estaba esperando el destino de una conexión, este toque lo cierra.
    if (this.conectando() && this.seleccion() && this.seleccion() !== id) {
      this.estudio.conectarEnPlano(this.seleccion()!, id);
      this.conectando.set(false);
      this.seleccion.set(id);
      return;
    }

    this.arrastrando = id;
    this.movio = false;
    this.origenArrastre = this.aMundo(this.local(ev));
  }

  empezarFlecha(ev: PointerEvent, id: string): void {
    ev.stopPropagation();
    (ev.target as HTMLElement).setPointerCapture?.(ev.pointerId);
    this.tirandoDe = id;
    this.arrastrando = null;
  }

  fondoAbajo(ev: PointerEvent): void {
    if (this.arrastrando || this.tirandoDe) return;
    this.lienzo()!.nativeElement.setPointerCapture(ev.pointerId);
    this.punteros.set(ev.pointerId, this.local(ev));
    this.movio = false;
    if (this.punteros.size === 2) {
      const [a, b] = [...this.punteros.values()];
      this.d0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      this.z0 = this.zoom();
    }
  }

  fondoMovio(ev: PointerEvent): void {
    const p = this.local(ev);

    // --- Tirando una flecha nueva ---
    if (this.tirandoDe) {
      const A = this.posicion(this.tirandoDe);
      const m = this.aMundo(p);
      this.flechaEnCurso.set(`M ${A.x} ${A.y} L ${m.x} ${m.y}`);
      return;
    }

    // --- Moviendo una tarjeta ---
    if (this.arrastrando) {
      const m = this.aMundo(p);
      const base = this.posicion(this.arrastrando);
      const dx = m.x - this.origenArrastre.x;
      const dy = m.y - this.origenArrastre.y;
      if (Math.hypot(dx, dy) > 3 / this.zoom()) this.movio = true;
      this.estudio.moverEnPlano(this.arrastrando, base.x + dx, base.y + dy);
      this.origenArrastre = m;
      return;
    }

    // --- Moviendo el plano ---
    const prev = this.punteros.get(ev.pointerId);
    if (!prev) return;
    if (Math.hypot(p.x - prev.x, p.y - prev.y) > 2) this.movio = true;

    if (this.punteros.size === 1) {
      this.camara = { x: this.camara.x + (p.x - prev.x), y: this.camara.y + (p.y - prev.y) };
      this.punteros.set(ev.pointerId, p);
    } else if (this.punteros.size === 2) {
      this.punteros.set(ev.pointerId, p);
      const [a, b] = [...this.punteros.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      const nz = Math.min(2.4, Math.max(0.12, this.z0 * (d / this.d0)));
      const k = nz / this.zoom();
      this.camara = { x: cx - (cx - this.camara.x) * k, y: cy - (cy - this.camara.y) * k };
      this.zoom.set(nz);
    }
    this.aplicar();
  }

  fondoArriba(ev: PointerEvent): void {
    const p = this.local(ev);

    // --- Se soltó una flecha: ¿cayó sobre otra tarjeta? ---
    if (this.tirandoDe) {
      const m = this.aMundo(p);
      const destino = this.nodoEn(m);
      if (destino && destino !== this.tirandoDe) {
        this.estudio.conectarEnPlano(this.tirandoDe, destino);
        navigator.vibrate?.(15);
      }
      this.tirandoDe = null;
      this.flechaEnCurso.set(null);
      return;
    }

    // --- Se soltó una tarjeta ---
    if (this.arrastrando) {
      if (!this.movio) {
        this.flechaSel.set(null);
        this.seleccion.set(this.seleccion() === this.arrastrando ? null : this.arrastrando);
      }
      this.arrastrando = null;
      return;
    }

    this.punteros.delete(ev.pointerId);
    if (!this.movio) this.limpiar();
  }

  /** Qué tarjeta hay en un punto del mundo. Zona generosa para el dedo. */
  private nodoEn(m: Punto): string | null {
    let mejor: string | null = null;
    let mejorD = Infinity;
    for (const n of this.nodos()) {
      const dx = Math.abs(n.x - m.x), dy = Math.abs(n.y - m.y);
      if (dx < 100 && dy < 30) {
        const d = dx + dy;
        if (d < mejorD) { mejor = n.id; mejorD = d; }
      }
    }
    return mejor;
  }

  tocarFlecha(ev: PointerEvent, id: string): void {
    ev.stopPropagation();
    this.seleccion.set(null);
    this.conectando.set(false);
    this.flechaSel.set(this.flechaSel() === id ? null : id);
  }

  /* ---------------- Acciones del panel ---------------- */

  limpiar(): void {
    this.seleccion.set(null);
    this.flechaSel.set(null);
    this.conectando.set(false);
  }

  crearNota(): void {
    const el = this.lienzo()?.nativeElement;
    const centro = this.aMundo({
      x: (el?.clientWidth ?? 360) / 2,
      y: (el?.clientHeight ?? 560) / 2,
    });
    const nota = this.estudio.crearNotaPlano(centro.x, centro.y);
    this.flechaSel.set(null);
    this.seleccion.set(nota.id);
  }

  renombrar(id: string, titulo: string): void {
    this.estudio.editarNotaPlano(id, { titulo });
  }

  detallar(id: string, detalle: string): void {
    this.estudio.editarNotaPlano(id, { detalle });
  }

  pintar(id: string, tema: TemaResaltado): void {
    this.estudio.editarNotaPlano(id, { tema });
  }

  temaDe(id: string): TemaResaltado | null {
    return this.estudio.tablero().notas.find((n) => n.id === id)?.tema ?? null;
  }

  borrarNota(id: string): void {
    this.estudio.borrarNotaPlano(id);
    this.limpiar();
  }

  ocultar(id: string): void {
    this.estudio.ocultarEnPlano(id);
    this.limpiar();
  }

  /** Modo «toca la otra tarjeta»: la alternativa al arrastre, para dedos. */
  modoConectar(): void {
    this.conectando.set(!this.conectando());
  }

  etiquetar(id: string, etiqueta: string): void {
    this.estudio.etiquetarFlecha(id, etiqueta);
  }

  borrarFlecha(id: string): void {
    this.estudio.borrarFlecha(id);
    this.flechaSel.set(null);
  }

  reordenar(): void {
    this.estudio.reordenarPlano();
    this.estudio.mostrarTodoEnPlano();
    this.limpiar();
    setTimeout(() => this.centrar(), 0);
  }

  nombreTipo(t: NodoDibujado['tipo']): string {
    return { ref: 'Versículo', note: 'Cuaderno', tag: 'Tema', nota: 'Tarjeta tuya' }[t];
  }
}
