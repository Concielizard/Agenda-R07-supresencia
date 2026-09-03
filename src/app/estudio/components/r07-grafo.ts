import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { R07StorageService } from '../../services/r07-storage.service';
import { EstudioService } from '../services/estudio.service';
import { R07PlanoComponent } from './r07-plano';

interface Vecino {
  id: string;
  titulo: string;
  tipo: 'ref' | 'note' | 'tag';
  x: number;
  y: number;
}

/**
 * CONEXIONES — cómo se ve de verdad la red del usuario.
 *
 * Una cosa en el centro. Máximo seis alrededor, cada una con su nombre
 * escrito. Un toque para entrar, una flecha para volver. Eso es todo.
 *
 * Por qué así y no un mapa completo:
 *   · Un mapa con cien puntos sin nombre asusta a quien no es técnico, y a
 *     quien sí lo es le aporta poco: no puede leer nada hasta hacer zoom.
 *   · Mostrar seis obliga a priorizar, y priorizar es lo que hace útil una
 *     vista de conexiones.
 *   · Sin física ni movimiento: se abre igual todas las veces, así que el
 *     usuario reconoce dónde estaba.
 *
 * Se dibuja con HTML y una capa de SVG para las líneas, no con canvas: el
 * texto queda escalable y accesible, y las tarjetas son botones de verdad
 * (foco de teclado, lectores de pantalla, área de toque grande). Con seis
 * elementos el DOM sobra.
 *
 * Todos los colores salen de storage.currentThemeColors(): respeta la
 * edición que el usuario eligió y el modo claro/oscuro. Ni un color a mano.
 */
@Component({
  selector: 'r07-grafo',
  standalone: true,
  imports: [R07PlanoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modo() === 'plano') {
      <r07-plano (cerrar)="modo.set('cerca')" />
    } @else {
    <div class="pantalla" [style.backgroundColor]="c().background">

      <header [style.borderColor]="c().border">
        <button
          type="button"
          class="volver"
          [disabled]="!historial().length"
          [style.borderColor]="c().border"
          [style.color]="c().textSecondary"
          (click)="volver()"
          aria-label="Volver">‹</button>
        <h2 [style.color]="c().textPrimary">Conexiones</h2>
      </header>

      @if (centro(); as actual) {
        <div class="lienzo" #lienzo>
          <svg aria-hidden="true">
            @for (v of vecinos(); track v.id) {
              <path [attr.d]="curva(v)" [attr.stroke]="c().border" />
            }
          </svg>

          <!-- Lo que estás mirando -->
          <div
            class="centro"
            [style.backgroundColor]="actual.tipo === 'ref' ? c().primaryContainer : c().card"
            [style.borderColor]="actual.tipo === 'ref' ? c().primary : c().border">
            <p class="clase" [style.color]="c().primary">{{ nombreTipo(actual.tipo) }}</p>
            <h3 [style.color]="c().textPrimary">{{ actual.titulo }}</h3>
            @if (actual.cita) {
              <p class="cita" [style.color]="c().textSecondary">«{{ actual.cita }}»</p>
            }
          </div>

          <!-- Lo que se conecta con eso -->
          @for (v of vecinos(); track v.id) {
            <button
              type="button"
              class="satelite"
              [style.left.px]="v.x"
              [style.top.px]="v.y"
              [style.backgroundColor]="c().card"
              [style.borderColor]="c().border"
              (click)="entrar(v.id)">
              <span
                class="punto"
                [class.cuaderno]="v.tipo === 'note'"
                [class.tema]="v.tipo === 'tag'"
                [style.backgroundColor]="color(v.tipo)"
                [style.borderColor]="color(v.tipo)"></span>
              <span class="texto">
                <b [style.color]="c().textPrimary">{{ v.titulo }}</b>
                <small [style.color]="c().textMuted">{{ nombreTipo(v.tipo) }}</small>
              </span>
            </button>
          }
        </div>

        <footer [style.borderColor]="c().border">
          <p [style.color]="c().textMuted">{{ pista() }}</p>
          @if (historial().length) {
            <button type="button"
                    [style.borderColor]="c().border" [style.color]="c().textSecondary"
                    (click)="alInicio()">Al inicio</button>
          }
          <!-- La salida a «volver, volver, volver»: todo junto y te mueves libre. -->
          <button type="button"
                  [style.borderColor]="c().border" [style.color]="c().textSecondary"
                  (click)="modo.set('plano')">Ver todo</button>
        </footer>
      } @else {
        <div class="vacio">
          <p class="grande" [style.color]="c().textPrimary">Todavía no hay conexiones</p>
          <p [style.color]="c().textMuted">
            Abre la Biblia, mantén presionado un versículo y escríbele un
            comentario con una etiqueta como <b>#gracia</b>. Aquí vas a ver
            con qué se conecta.
          </p>
        </div>
      }
    </div>
    }
  `,
  styles: [`
    :host { display:block; height:100%; }
    .pantalla { display:flex; flex-direction:column; height:100%; overflow:hidden; }

    header { display:flex; align-items:center; gap:10px; padding:14px 18px 12px;
             border-bottom:1px solid; flex:none; }
    header h2 { margin:0; font:600 18px 'Lora', Georgia, serif; flex:1; }
    .volver { width:38px; height:38px; border-radius:12px; border:1px solid;
              background:transparent; font-size:19px; line-height:1; cursor:pointer; }
    .volver:disabled { opacity:.3; }

    .lienzo { position:relative; flex:1; overflow:hidden; }
    .lienzo svg { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
    .lienzo path { fill:none; stroke-width:1.4; }

    .centro {
      position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
      width:min(66%, 218px); text-align:center;
      padding:19px 17px; border:1.5px solid; border-radius:22px;
    }
    .centro .clase { margin:0 0 6px; font:700 10.5px 'Plus Jakarta Sans', system-ui, sans-serif;
                     letter-spacing:.14em; text-transform:uppercase; }
    .centro h3 { margin:0 0 7px; font:600 20px/1.3 'Lora', Georgia, serif; }
    .centro .cita { margin:0; font:italic 13.5px/1.6 'Lora', Georgia, serif; }

    .satelite {
      position:absolute; transform:translate(-50%,-50%);
      display:flex; align-items:center; gap:9px;
      max-width:170px; min-width:104px; min-height:48px;
      padding:10px 13px; border:1px solid; border-radius:15px;
      text-align:left; cursor:pointer; line-height:1.35;
    }
    .satelite:active { transform:translate(-50%,-50%) scale(.97); }
    .satelite:focus-visible { outline:2px solid currentColor; outline-offset:2px; }
    .punto { width:9px; height:9px; border-radius:50%; flex:none; border:1.6px solid; }
    .punto.cuaderno { border-radius:3px; }
    .punto.tema { background:transparent !important; }
    .texto { min-width:0; }
    .texto b { display:block; font:500 14px 'Plus Jakarta Sans', system-ui, sans-serif; }
    .texto small { display:block; font-size:11.5px; white-space:nowrap; margin-top:1px; }

    footer { display:flex; align-items:center; gap:12px; padding:13px 18px;
             border-top:1px solid; flex:none; }
    footer p { margin:0; flex:1; font-size:12.5px; }
    footer button { padding:10px 15px; border:1px solid; border-radius:12px;
                    background:transparent; font-size:13.5px; cursor:pointer; }

    .vacio { flex:1; display:flex; flex-direction:column; align-items:center;
             justify-content:center; text-align:center; padding:40px 32px; gap:8px; }
    .vacio .grande { font:600 19px 'Lora', Georgia, serif; margin:0; }
    .vacio p { margin:0; font-size:14px; line-height:1.65; max-width:21rem; }

    @media (prefers-reduced-motion: reduce) { .satelite:active { transform:translate(-50%,-50%); } }
  `],
})
export class R07GrafoComponent {
  private readonly storage = inject(R07StorageService);
  private readonly estudio = inject(EstudioService);

  readonly c = this.storage.currentThemeColors;
  readonly lienzo = viewChild<ElementRef<HTMLDivElement>>('lienzo');

  /** 'cerca' = un centro y sus vecinos. 'plano' = todo el mapa. */
  readonly modo = signal<'cerca' | 'plano'>('cerca');

  /** Nodo que se está mirando. */
  readonly foco = signal<string | null>(null);
  readonly historial = signal<string[]>([]);

  /** Máximo de vecinos en pantalla. Seis es lo que se lee sin agobiar. */
  private readonly MAX = 6;

  private readonly grafo = this.estudio.grafo;

  private readonly porId = computed(() => new Map(this.grafo().nodos.map((n) => [n.id, n])));

  private readonly adyacencia = computed(() => {
    const m = new Map<string, Set<string>>();
    const add = (a: string, b: string) => {
      let s = m.get(a);
      if (!s) m.set(a, (s = new Set()));
      s.add(b);
    };
    for (const e of this.grafo().aristas) { add(e.origen, e.destino); add(e.destino, e.origen); }
    return m;
  });

  /** Si nadie eligió nada, se abre por lo más estudiado. */
  private readonly focoEfectivo = computed(() => {
    const f = this.foco();
    if (f && this.porId().has(f)) return f;
    return [...this.grafo().nodos].sort((a, b) => (b.grado ?? 0) - (a.grado ?? 0))[0]?.id ?? null;
  });

  readonly centro = computed(() => {
    const id = this.focoEfectivo();
    if (!id) return null;
    const n = this.porId().get(id);
    if (!n) return null;
    return { id, titulo: n.titulo, tipo: n.tipo as 'ref' | 'note' | 'tag', cita: this.citaDe(id) };
  });

  /**
   * Los seis vecinos más conectados, colocados en una elipse.
   * Media vuelta de desfase para que con cuatro queden en diagonal y no
   * pegados a los lados, que es donde menos espacio hay en un celular.
   */
  readonly vecinos = computed<Vecino[]>(() => {
    const id = this.focoEfectivo();
    if (!id) return [];

    const lista = [...(this.adyacencia().get(id) ?? [])]
      .map((v) => this.porId().get(v))
      .filter((n): n is NonNullable<typeof n> => !!n)
      .sort((a, b) => (b.grado ?? 0) - (a.grado ?? 0))
      .slice(0, this.MAX);

    if (!lista.length) return [];

    const el = this.lienzo()?.nativeElement;
    const W = el?.clientWidth ?? 360;
    const H = el?.clientHeight ?? 560;
    const cx = W / 2, cy = H / 2;
    const rx = Math.min(W * 0.40, 150);
    const ry = Math.min(H * 0.36, 250);

    return lista.map((n, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / lista.length + Math.PI / lista.length;
      // Radio mínimo para no pisar la tarjeta del centro (≈218×150 px).
      const necesarioX = 218 / Math.max(Math.abs(Math.cos(ang)), 0.001);
      const necesarioY = 150 / Math.max(Math.abs(Math.sin(ang)), 0.001);
      const radio = Math.max(
        Math.min(necesarioX, necesarioY),
        Math.hypot(Math.cos(ang) * rx, Math.sin(ang) * ry)
      );
      return {
        id: n.id,
        titulo: n.titulo,
        tipo: n.tipo as 'ref' | 'note' | 'tag',
        x: Math.max(90, Math.min(W - 90, cx + Math.cos(ang) * radio)),
        y: Math.max(34, Math.min(H - 34, cy + Math.sin(ang) * radio)),
      };
    });
  });

  readonly pista = computed(() => {
    const n = this.vecinos().length;
    if (!n) return 'Esto todavía no se conecta con nada.';
    return `${n} ${n === 1 ? 'conexión' : 'conexiones'}. Toca una para entrar.`;
  });

  /* ---------------- Acciones ---------------- */

  entrar(id: string): void {
    const actual = this.focoEfectivo();
    if (actual) this.historial.update((h) => [...h, actual]);
    this.foco.set(id);
  }

  volver(): void {
    const h = [...this.historial()];
    const previo = h.pop();
    if (!previo) return;
    this.historial.set(h);
    this.foco.set(previo);
  }

  alInicio(): void {
    this.historial.set([]);
    this.foco.set(null);
  }

  /** Permite que otra pantalla abra Conexiones ya centrado en algo. */
  abrirEn(id: string): void {
    this.historial.set([]);
    this.foco.set(id);
  }

  /* ---------------- Dibujo ---------------- */

  curva(v: Vecino): string {
    const el = this.lienzo()?.nativeElement;
    const cx = (el?.clientWidth ?? 360) / 2;
    const cy = (el?.clientHeight ?? 560) / 2;
    const mx = (cx + v.x) / 2, my = (cy + v.y) / 2;
    // Curvatura mínima: da suavidad sin parecer un cable.
    return `M ${cx} ${cy} Q ${mx + (v.y - cy) * 0.06} ${my - (v.x - cx) * 0.06} ${v.x} ${v.y}`;
  }

  color(tipo: 'ref' | 'note' | 'tag'): string {
    const c = this.c();
    return tipo === 'ref' ? c.primary : tipo === 'note' ? c.accent : c.textMuted;
  }

  nombreTipo(tipo: 'ref' | 'note' | 'tag'): string {
    return { ref: 'Versículo', note: 'Cuaderno de estudio', tag: 'Tema' }[tipo];
  }

  /** Texto bíblico o resumen, para que el centro diga algo y no solo el título. */
  private citaDe(id: string): string {
    if (id.startsWith('ref:')) {
      const m = this.estudio.marcas().find((x) => `ref:${x.refIds[0]}` === id);
      return m?.textoCitado ?? '';
    }
    if (id.startsWith('note:')) {
      return this.estudio.cuaderno(id.replace('note:', ''))?.resumen ?? '';
    }
    return '';
  }
}
