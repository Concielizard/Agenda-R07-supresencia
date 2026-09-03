import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { R07StorageService } from '../../services/r07-storage.service';
import { EstudioService } from '../services/estudio.service';
import { R07GrafoComponent } from './r07-grafo';
import { R07CuadernoComponent } from './r07-cuaderno';
import { TEMA_POR_ID, refTitulo, type Marca } from '../models/estudio.models';

type Seccion = 'favoritos' | 'comentarios' | 'cuadernos' | 'red';

/**
 * ESTUDIO BÍBLICO — la pestaña nueva, dentro de Biblia.
 *
 * Cuatro secciones y ni una más. El orden es el del uso real:
 *
 *   ★ Favoritos    lo que marcaste rápido, sin escribir
 *   ✎ Comentarios  versículos con una nota tuya
 *   📓 Cuadernos    estudios armados con varios comentarios
 *   ◎ Conexiones   con qué se conecta cada cosa
 *
 * La búsqueda vive arriba y busca en las cuatro: el usuario no debería tener
 * que saber en cuál guardó algo para encontrarlo.
 */
@Component({
  selector: 'r07-estudio-tab',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet, R07GrafoComponent, R07CuadernoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (abrirCuaderno(); as id) {
      <r07-cuaderno [cuadernoId]="id" (cerrar)="abrirCuaderno.set(null)" />
    } @else {
    <div class="pantalla" [style.backgroundColor]="c().background">

      <!-- Buscador -->
      <div class="buscador" [style.borderColor]="c().border">
        <input
          type="search"
          [ngModel]="consulta()"
          (ngModelChange)="consulta.set($event)"
          placeholder="Buscar en tu estudio…"
          [style.backgroundColor]="c().surface"
          [style.borderColor]="c().border"
          [style.color]="c().textPrimary" />
      </div>

      <!-- Secciones -->
      <nav class="secciones">
        @for (s of SECCIONES; track s.id) {
          <button
            type="button"
            [style.backgroundColor]="seccion() === s.id ? c().primaryContainer : 'transparent'"
            [style.color]="seccion() === s.id ? c().primary : c().textMuted"
            [style.borderColor]="seccion() === s.id ? c().primary : 'transparent'"
            (click)="seccion.set(s.id)">
            <span>{{ s.icono }}</span>
            {{ s.nombre }}
            @if (conteo(s.id) > 0) { <b>{{ conteo(s.id) }}</b> }
          </button>
        }
      </nav>

      <!-- Resultados de búsqueda: pisan la sección activa -->
      @if (consulta().length >= 2) {
        <div class="lista">
          <p class="titulo-lista" [style.color]="c().textMuted">
            {{ resultados().length }} resultado(s) para «{{ consulta() }}»
          </p>
          @for (m of resultados(); track m.id) {
            <ng-container *ngTemplateOutlet="tarjeta; context: { $implicit: m }"></ng-container>
          } @empty {
            <p class="vacio" [style.color]="c().textMuted">
              No encontramos nada. Prueba con una palabra del versículo o con una etiqueta.
            </p>
          }
        </div>
      }

      @else {
        @switch (seccion()) {

          @case ('favoritos') {
            <div class="lista">
              @for (m of estudio.favoritos(); track m.id) {
                <ng-container *ngTemplateOutlet="tarjeta; context: { $implicit: m }"></ng-container>
              } @empty {
                <div class="vacio-caja">
                  <p class="grande" [style.color]="c().textPrimary">Aún no tienes favoritos</p>
                  <p [style.color]="c().textMuted">
                    En la Biblia, mantén presionado un versículo y toca <b>☆ Favorito</b>.
                  </p>
                </div>
              }
            </div>
          }

          @case ('comentarios') {
            <div class="lista">
              @if (estudio.tags().length) {
                <div class="tags-fila">
                  @for (t of estudio.tags().slice(0, 12); track t.tag) {
                    <button type="button" class="tag"
                            [style.borderColor]="tagFiltro() === t.tag ? c().primary : c().border"
                            [style.color]="tagFiltro() === t.tag ? c().primary : c().textSecondary"
                            (click)="tagFiltro.set(tagFiltro() === t.tag ? null : t.tag)">
                      #{{ t.tag }} <small>{{ t.usos }}</small>
                    </button>
                  }
                </div>
              }
              @for (m of comentariosFiltrados(); track m.id) {
                <ng-container *ngTemplateOutlet="tarjeta; context: { $implicit: m }"></ng-container>
              } @empty {
                <div class="vacio-caja">
                  <p class="grande" [style.color]="c().textPrimary">Todavía no has comentado</p>
                  <p [style.color]="c().textMuted">
                    Un comentario es una nota corta sobre un versículo. No tienes que
                    escribir mucho: una frase basta.
                  </p>
                </div>
              }
            </div>
          }

          @case ('cuadernos') {
            <div class="lista">
              <button type="button" class="nuevo"
                      [style.borderColor]="c().primary" [style.color]="c().primary"
                      (click)="crearCuaderno()">
                + Empezar un cuaderno de estudio
              </button>

              @for (cu of estudio.cuadernos(); track cu.id) {
                <article class="cuaderno" [style.backgroundColor]="c().card"
                         [style.borderColor]="c().border"
                         (click)="abrirCuaderno.set(cu.id)">
                  <span class="lomo" [style.backgroundColor]="colorTema(cu.tema)"></span>
                  <div class="cuerpo">
                    <h3 [style.color]="c().textPrimary">{{ cu.titulo }}</h3>
                    <p [style.color]="c().textMuted">
                      {{ cuentaMarcas(cu.id) }} comentario(s) ·
                      {{ cu.bloques.length }} bloque(s)
                    </p>
                    @if (cu.tags.length) {
                      <p class="mini" [style.color]="c().textSecondary">
                        @for (t of cu.tags.slice(0, 4); track t) { <span>#{{ t }}</span> }
                      </p>
                    }
                  </div>
                </article>
              } @empty {
                <div class="vacio-caja">
                  <p class="grande" [style.color]="c().textPrimary">Un cuaderno junta tus comentarios</p>
                  <p [style.color]="c().textMuted">
                    Ejemplo: reúnes lo que escribiste de Isaías 41:10, Salmos 23 y
                    Romanos 8:28, y armas un estudio sobre el temor.
                  </p>
                </div>
              }
            </div>
          }

          @case ('red') {
            <div class="red">
              <r07-grafo />
            </div>
          }
        }
      }

      <!-- Sugerencias algorítmicas (sin IA) -->
      @if (seccion() === 'comentarios' && estudio.sugerencias().length && !consulta()) {
        <div class="sugerencias" [style.backgroundColor]="c().surface" [style.borderColor]="c().border">
          <p class="rotulo" [style.color]="c().textMuted">Se parecen entre sí</p>
          @for (s of estudio.sugerencias().slice(0, 3); track s.a.id + s.b.id) {
            <p class="sug" [style.color]="c().textSecondary">
              <b [style.color]="c().textPrimary">{{ tituloDe(s.a) }}</b> y
              <b [style.color]="c().textPrimary">{{ tituloDe(s.b) }}</b>
              comparten
              @for (t of s.comunes; track t) { <em [style.color]="c().primary">#{{ t }}</em> }
            </p>
          }
        </div>
      }
    </div>

    }

    <!-- Plantilla de tarjeta de marca -->
    <ng-template #tarjeta let-m>
      <article class="marca" [style.backgroundColor]="c().card" [style.borderColor]="c().border">
        <span class="franja" [style.backgroundColor]="colorTema(m.tema)"></span>
        <div class="contenido">
          <p class="ref" [style.color]="c().primary">
            {{ tituloDe(m) }}
            <small [style.color]="c().textMuted">{{ nombreTema(m.tema) }}</small>
          </p>
          <p class="cita" [style.color]="c().textSecondary">«{{ m.textoCitado }}»</p>
          @if (m.comentario) {
            <p class="nota" [style.color]="c().textPrimary">{{ m.comentario }}</p>
          }
          @if (m.tags.length) {
            <p class="mini" [style.color]="c().textMuted">
              @for (t of m.tags; track t) { <span>#{{ t }}</span> }
            </p>
          }
        </div>
        <button type="button" class="fav" [style.color]="m.favorito ? c().primary : c().textMuted"
                (click)="estudio.alternarFavorito(m.id)"
                [attr.aria-label]="m.favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'">
          {{ m.favorito ? '★' : '☆' }}
        </button>
      </article>
    </ng-template>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .pantalla { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

    .buscador { padding: 12px 16px 10px; border-bottom: 1px solid; }
    .buscador input {
      width: 100%; min-height: 46px; padding: 0 15px; border: 1px solid; border-radius: 14px;
      font: 15px 'Plus Jakarta Sans', system-ui, sans-serif;
    }

    .secciones { display: flex; gap: 6px; padding: 12px 16px; overflow-x: auto; flex: none; }
    .secciones button {
      display: flex; align-items: center; gap: 6px; white-space: nowrap;
      min-height: 42px; padding: 0 15px; border: 1.5px solid; border-radius: 999px;
      font: 500 14px 'Plus Jakarta Sans', system-ui, sans-serif; cursor: pointer;
    }
    .secciones b { font-size: 12px; opacity: .8; }

    .lista { flex: 1; overflow-y: auto; padding: 4px 16px 24px; display: flex; flex-direction: column; gap: 10px; }
    .titulo-lista { font-size: 12.5px; margin: 4px 0 2px; }
    .red { flex: 1; position: relative; }

    .marca { display: flex; border: 1px solid; border-radius: 17px; overflow: hidden; }
    .marca .franja { width: 5px; flex: none; }
    .marca .contenido { flex: 1; padding: 13px 15px; min-width: 0; }
    .marca .ref { margin: 0 0 6px; font: 700 12.5px 'Plus Jakarta Sans', system-ui, sans-serif;
                  letter-spacing: .05em; text-transform: uppercase; }
    .marca .ref small { font-weight: 500; letter-spacing: 0; text-transform: none; margin-left: 7px; }
    .marca .cita { margin: 0 0 8px; font: italic 14.5px/1.6 'Lora', Georgia, serif; }
    .marca .nota { margin: 0; font: 14.5px/1.6 'Plus Jakarta Sans', system-ui, sans-serif; }
    .marca .fav { border: 0; background: transparent; font-size: 21px; padding: 12px 14px 0; cursor: pointer; align-self: flex-start; }

    .mini { margin: 8px 0 0; font-size: 12.5px; display: flex; gap: 8px; flex-wrap: wrap; }

    .tags-fila { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; }
    .tag { padding: 8px 13px; border: 1.5px solid; border-radius: 999px; background: transparent;
           font-size: 13px; white-space: nowrap; cursor: pointer; }
    .tag small { opacity: .6; margin-left: 3px; }

    .nuevo { min-height: 52px; border: 1.5px dashed; border-radius: 16px; background: transparent;
             font: 500 15px 'Plus Jakarta Sans', system-ui, sans-serif; cursor: pointer; }

    .cuaderno { display: flex; border: 1px solid; border-radius: 17px; overflow: hidden; cursor: pointer; }
    .cuaderno .lomo { width: 7px; flex: none; }
    .cuaderno .cuerpo { padding: 14px 16px; }
    .cuaderno h3 { margin: 0 0 4px; font: 600 17px 'Lora', Georgia, serif; }
    .cuaderno p { margin: 0; font-size: 13px; }

    .vacio-caja { padding: 44px 24px; text-align: center; }
    .vacio-caja .grande { font: 600 18px 'Lora', Georgia, serif; margin: 0 0 8px; }
    .vacio-caja p { margin: 0; font-size: 14px; line-height: 1.65; }
    .vacio { font-size: 14px; text-align: center; padding: 30px 20px; }

    .sugerencias { margin: 0 16px 16px; padding: 13px 15px; border: 1px solid; border-radius: 15px; }
    .sugerencias .rotulo { margin: 0 0 8px; font-size: 11px; letter-spacing: .1em;
                           text-transform: uppercase; font-weight: 700; }
    .sugerencias .sug { margin: 0 0 6px; font-size: 13.5px; line-height: 1.55; }
    .sugerencias em { font-style: normal; font-weight: 600; margin-left: 5px; }
  `],
})
export class R07EstudioTabComponent {
  private readonly storage = inject(R07StorageService);
  readonly estudio = inject(EstudioService);

  readonly c = this.storage.currentThemeColors;

  readonly SECCIONES: { id: Seccion; nombre: string; icono: string }[] = [
    { id: 'favoritos',   nombre: 'Favoritos',   icono: '★' },
    { id: 'comentarios', nombre: 'Comentarios', icono: '✎' },
    { id: 'cuadernos',   nombre: 'Cuadernos',   icono: '📓' },
    { id: 'red',         nombre: 'Conexiones',  icono: '◎' },
  ];

  readonly seccion = signal<Seccion>('favoritos');
  readonly consulta = signal('');
  readonly tagFiltro = signal<string | null>(null);
  readonly abrirCuaderno = signal<string | null>(null);

  readonly resultados = computed(() => this.estudio.buscar(this.consulta()));

  readonly comentariosFiltrados = computed(() => {
    const t = this.tagFiltro();
    const base = this.estudio.comentarios();
    return t ? base.filter((m) => m.tags.includes(t)) : base;
  });

  conteo(s: Seccion): number {
    const r = this.estudio.resumen();
    return { favoritos: r.favoritos, comentarios: r.comentarios, cuadernos: r.cuadernos, red: 0 }[s];
  }

  cuentaMarcas(cuadernoId: string): number {
    return this.estudio.cuaderno(cuadernoId)?.bloques.filter((b) => b.tipo === 'marca').length ?? 0;
  }

  tituloDe(m: Marca): string { return refTitulo(m.ref); }
  colorTema(t: string): string { return TEMA_POR_ID.get(t as any)?.color ?? this.c().primary; }
  nombreTema(t: string): string { return TEMA_POR_ID.get(t as any)?.nombre ?? ''; }

  async crearCuaderno(): Promise<void> {
    const c = await this.estudio.crearCuaderno();
    this.abrirCuaderno.set(c.id);
  }
}
