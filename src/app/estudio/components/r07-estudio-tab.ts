import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { R07StorageService } from '../../services/r07-storage.service';
import { EstudioService } from '../services/estudio.service';
import { R07GrafoComponent } from './r07-grafo';
import { R07CuadernoComponent } from './r07-cuaderno';
import { TEMA_POR_ID, refTitulo, type Marca, type CuadernoEstudio } from '../models/estudio.models';

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
    @if (cuadernoActivo(); as cu) {
      <r07-cuaderno [cuadernoId]="cu.id" (cerrar)="cerrarCuaderno()" />
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
                         (touchstart)="iniciarLongPress(cu, $event)"
                         (touchend)="cancelarLongPress()"
                         (touchmove)="onCuadernoTouchMove($event)"
                         (contextmenu)="$event.preventDefault(); abrirMenu(cu)"
                         (click)="onCuadernoClick(cu)">
                  <span class="lomo" [style.backgroundColor]="colorTema(cu.tema)"></span>
                  <div class="cuerpo">
                    <div class="cuaderno-titulo-fila">
                      <h3 [style.color]="c().textPrimary">{{ cu.titulo }}</h3>
                      <button type="button" class="btn-opciones-cuaderno"
                              (click)="$event.stopPropagation(); abrirMenu(cu)"
                              title="Opciones del cuaderno" [style.color]="c().textMuted">
                        ⋮
                      </button>
                    </div>
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

      <!-- Modales de confirmación de borrado de marca / comentario -->
      @if (marcaABorrar(); as mb) {
        <div class="modal-backdrop" (click)="marcaABorrar.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()"
               [style.backgroundColor]="c().card" [style.borderColor]="c().border">
            <h3 [style.color]="c().textPrimary">Opciones de nota y versículo</h3>
            <p [style.color]="c().textMuted">
              ¿Qué deseas hacer con la nota de <b>{{ mb.titulo }}</b>?
            </p>
            <div class="modal-botones-columna">
              @if (mb.tieneComentario) {
                <button type="button" class="btn-opcion-marca"
                        [style.borderColor]="c().border" [style.color]="c().textPrimary"
                        (click)="borrarSoloComentario(mb.id)">
                  <span>💬</span>
                  <div class="text-left">
                    <b class="block text-xs">Eliminar solo el comentario</b>
                    <span class="text-[11px] opacity-75">Conservar el versículo resaltado en la Biblia</span>
                  </div>
                </button>
              }
              <button type="button" class="btn-opcion-marca peligro"
                      (click)="confirmarBorradoMarca(mb.id)">
                <span>🗑️</span>
                <div class="text-left">
                  <b class="block text-xs">Eliminar por completo</b>
                  <span class="text-[11px] opacity-75">Quita el resaltado y la nota de tu estudio</span>
                </div>
              </button>
              <button type="button" class="btn-cancel" [style.borderColor]="c().border" [style.color]="c().textMuted" (click)="marcaABorrar.set(null)">Cancelar</button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Editar Comentario -->
      @if (marcaEditando(); as me) {
        <div class="modal-backdrop" (click)="marcaEditando.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()"
               [style.backgroundColor]="c().card" [style.borderColor]="c().border">
            <h3 [style.color]="c().textPrimary">Editar comentario</h3>
            <p class="cita-preview" [style.color]="c().textSecondary">«{{ me.textoCitado }}»</p>
            <textarea
              class="textarea-comentario"
              [ngModel]="textoComentarioEditando()"
              (ngModelChange)="textoComentarioEditando.set($event)"
              rows="3"
              [style.backgroundColor]="c().surface"
              [style.borderColor]="c().border"
              [style.color]="c().textPrimary"
              placeholder="Escribe tu nota... Puedes usar #etiquetas (ej. #amor #paz)"></textarea>
            <div class="modal-botones">
              <button type="button" class="btn-cancel" [style.borderColor]="c().border" [style.color]="c().textPrimary" (click)="marcaEditando.set(null)">Cancelar</button>
              <button type="button" class="btn-guardar-renombrar" [style.backgroundColor]="c().primary" (click)="guardarComentarioEditado()">Guardar</button>
            </div>
          </div>
        </div>
      }

      <!-- Hoja de Opciones de Cuaderno (Long-Press o ⋮) -->
      @if (cuadernoMenu(); as cu) {
        <div class="modal-backdrop" (click)="cuadernoMenu.set(null)">
          <div class="modal-sheet" (click)="$event.stopPropagation()"
               [style.backgroundColor]="c().card" [style.borderColor]="c().border">
            <div class="sheet-header" [style.borderColor]="c().border">
              <span class="lomo-mini" [style.backgroundColor]="colorTema(cu.tema)"></span>
              <h4 [style.color]="c().textPrimary">{{ cu.titulo }}</h4>
              <button type="button" class="btn-cerrar-sheet" (click)="cuadernoMenu.set(null)" [style.color]="c().textMuted">✕</button>
            </div>
            <div class="sheet-opciones">
              <button type="button" class="sheet-btn" (click)="abrirDesdeMenu(cu.id)" [style.color]="c().textPrimary">
                <span class="sheet-icono">📖</span>
                <span>Abrir cuaderno</span>
              </button>
              <button type="button" class="sheet-btn" (click)="iniciarRenombrar(cu)" [style.color]="c().textPrimary">
                <span class="sheet-icono">✏️</span>
                <span>Cambiar título</span>
              </button>
              <button type="button" class="sheet-btn peligro" (click)="pedirBorrarDesdeMenu(cu)">
                <span class="sheet-icono">🗑️</span>
                <span>Eliminar cuaderno</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Renombrar Cuaderno -->
      @if (cuadernoRenombrar(); as cr) {
        <div class="modal-backdrop" (click)="cuadernoRenombrar.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()"
               [style.backgroundColor]="c().card" [style.borderColor]="c().border">
            <h3 [style.color]="c().textPrimary">Cambiar título del cuaderno</h3>
            <input
              class="input-renombrar"
              [ngModel]="nuevoTitulo()"
              (ngModelChange)="nuevoTitulo.set($event)"
              [style.backgroundColor]="c().surface"
              [style.borderColor]="c().border"
              [style.color]="c().textPrimary"
              placeholder="Escribe el nuevo título…" />
            <div class="modal-botones">
              <button type="button" class="btn-cancel" [style.borderColor]="c().border" [style.color]="c().textPrimary" (click)="cuadernoRenombrar.set(null)">Cancelar</button>
              <button type="button" class="btn-guardar-renombrar" [style.backgroundColor]="c().primary" (click)="guardarNuevoTitulo()">Guardar</button>
            </div>
          </div>
        </div>
      }

      @if (cuadernoABorrar(); as cb) {
        <div class="modal-backdrop" (click)="cuadernoABorrar.set(null)">
          <div class="modal-box" (click)="$event.stopPropagation()"
               [style.backgroundColor]="c().card" [style.borderColor]="c().border">
            <h3 [style.color]="c().textPrimary">¿Borrar cuaderno?</h3>
            <p [style.color]="c().textMuted">
              Se eliminará «{{ cb.titulo }}». Tus comentarios y versículos resaltados seguirán a salvo.
            </p>
            <div class="modal-botones">
              <button type="button" class="btn-cancel" [style.borderColor]="c().border" [style.color]="c().textPrimary" (click)="cuadernoABorrar.set(null)">Cancelar</button>
              <button type="button" class="btn-del" (click)="confirmarBorradoCuaderno()">Borrar cuaderno</button>
            </div>
          </div>
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
        <div class="tarjeta-acciones">
          <button type="button" class="fav" [style.color]="m.favorito ? c().primary : c().textMuted"
                  (click)="estudio.alternarFavorito(m.id)"
                  [attr.aria-label]="m.favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'">
            {{ m.favorito ? '★' : '☆' }}
          </button>
          @if (m.comentario) {
            <button type="button" class="btn-editar-marca" [style.color]="c().textMuted"
                    (click)="iniciarEdicionMarca(m)"
                    title="Editar comentario">
              ✏️
            </button>
          }
          <button type="button" class="btn-borrar-marca" [style.color]="c().textMuted"
                  (click)="pedirBorrarMarca(m.id, tituloDe(m), !!m.comentario)"
                  title="Eliminar o quitar nota">
            🗑
          </button>
        </div>
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
    .red { flex: 1; min-height: 0; display: flex; flex-direction: column; position: relative; overflow: hidden; }

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
    .tarjeta-acciones { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 8px 0 0; }
    .btn-borrar-marca, .btn-editar-marca {
      width: 28px; height: 28px; border: 0; background: transparent; font-size: 13px; cursor: pointer;
      border-radius: 7px; display: flex; align-items: center; justify-content: center; opacity: .55;
    }
    .btn-editar-marca:hover { opacity: 1; }
    .btn-borrar-marca:hover { opacity: 1; color: #ef4444; }
    .cuaderno-titulo-fila { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .btn-borrar-cuaderno-item {
      width: 30px; height: 30px; border: 0; background: transparent; font-size: 14px; cursor: pointer;
      border-radius: 8px; display: flex; align-items: center; justify-content: center; opacity: .5;
    }
    .btn-borrar-cuaderno-item:hover { opacity: 1; color: #ef4444; }
    .btn-opciones-cuaderno {
      width: 32px; height: 32px; border: 0; background: transparent; font-size: 18px; cursor: pointer;
      border-radius: 8px; display: flex; align-items: center; justify-content: center; opacity: .7;
    }
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 210;
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .modal-box {
      width: min(400px, 100%); padding: 22px 20px; border: 1.5px solid; border-radius: 20px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .modal-sheet {
      width: min(420px, 92%); border: 1.5px solid; border-radius: 22px; padding: 18px 20px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .sheet-header {
      display: flex; align-items: center; gap: 10px; padding-bottom: 12px; border-bottom: 1px solid;
    }
    .lomo-mini { width: 5px; height: 22px; border-radius: 3px; }
    .sheet-header h4 { margin: 0; flex: 1; font: 700 16px 'Plus Jakarta Sans', system-ui, sans-serif; }
    .btn-cerrar-sheet { width: 28px; height: 28px; border: 0; background: transparent; font-size: 14px; cursor: pointer; }
    .sheet-opciones { display: flex; flex-direction: column; gap: 6px; }
    .sheet-btn {
      width: 100%; min-height: 46px; border: 0; background: transparent; border-radius: 12px;
      padding: 10px 14px; display: flex; align-items: center; gap: 12px; cursor: pointer;
      font: 600 14px 'Plus Jakarta Sans', system-ui, sans-serif; transition: background .15s;
    }
    .sheet-btn:active { background: rgba(128,128,128,0.15); }
    .sheet-btn.peligro { color: #ef4444; }
    .sheet-icono { font-size: 18px; }
    .input-renombrar {
      width: 100%; padding: 12px 14px; border: 1.5px solid; border-radius: 12px; font-size: 15px; outline: none; box-sizing: border-box;
    }
    .textarea-comentario {
      width: 100%; padding: 12px 14px; border: 1.5px solid; border-radius: 12px; font-size: 14px; line-height: 1.5; outline: none; resize: none; box-sizing: border-box;
    }
    .cita-preview { font: italic 13px 'Lora', Georgia, serif; margin: 0; }
    .modal-botones-columna { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
    .btn-opcion-marca {
      width: 100%; min-height: 46px; border: 1.5px solid; border-radius: 12px; background: transparent;
      padding: 10px 12px; display: flex; align-items: center; gap: 10px; cursor: pointer;
    }
    .btn-opcion-marca.peligro { border-color: rgba(239,68,68,0.4); color: #ef4444; }
    .btn-guardar-renombrar {
      flex: 1; min-height: 44px; border-radius: 12px; font: 600 14px 'Plus Jakarta Sans', system-ui, sans-serif; cursor: pointer;
      border: 0; color: #fff; font-weight: 700;
    }
    .modal-box h3 { margin: 0; font: 700 18px 'Plus Jakarta Sans', system-ui, sans-serif; }
    .modal-box p { margin: 0; font-size: 14px; line-height: 1.5; }
    .modal-botones { display: flex; gap: 10px; margin-top: 6px; }
    .modal-botones button {
      flex: 1; min-height: 44px; border-radius: 12px; font: 600 14px 'Plus Jakarta Sans', system-ui, sans-serif; cursor: pointer;
    }
    .btn-cancel { border: 1px solid; background: transparent; min-height: 44px; border-radius: 12px; font-size: 14px; cursor: pointer; }
    .btn-del { border: 0; background: #dc2626; color: #fff; }
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
  readonly marcaABorrar = signal<{ id: string; titulo: string; tieneComentario: boolean } | null>(null);
  readonly marcaEditando = signal<Marca | null>(null);
  readonly textoComentarioEditando = signal('');
  readonly cuadernoABorrar = signal<{ id: string; titulo: string } | null>(null);
  readonly cuadernoMenu = signal<CuadernoEstudio | null>(null);
  readonly cuadernoRenombrar = signal<CuadernoEstudio | null>(null);
  readonly nuevoTitulo = signal('');
  private longPressTimer?: ReturnType<typeof setTimeout>;
  private esLongPress = false;
  private touchStartX = 0;
  private touchStartY = 0;

  readonly cuadernoActivo = computed(() => {
    const id = this.abrirCuaderno();
    return id ? this.estudio.cuaderno(id) ?? null : null;
  });

  readonly resultados = computed(() => this.estudio.buscar(this.consulta()));

  readonly comentariosFiltrados = computed(() => {
    const t = this.tagFiltro();
    const base = this.estudio.comentarios();
    return t ? base.filter((m) => m.tags.includes(t)) : base;
  });

  iniciarLongPress(cu: CuadernoEstudio, ev: TouchEvent): void {
    this.esLongPress = false;
    const touch = ev.touches[0];
    if (touch) {
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }
    clearTimeout(this.longPressTimer);
    this.longPressTimer = setTimeout(() => {
      this.esLongPress = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
      this.abrirMenu(cu);
    }, 420);
  }

  onCuadernoTouchMove(ev: TouchEvent): void {
    const touch = ev.touches[0];
    if (!touch) return;
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    if (Math.hypot(dx, dy) > 10) {
      clearTimeout(this.longPressTimer);
    }
  }

  cancelarLongPress(): void {
    clearTimeout(this.longPressTimer);
  }

  onCuadernoClick(cu: CuadernoEstudio): void {
    if (this.esLongPress) {
      this.esLongPress = false;
      return;
    }
    this.abrirCuaderno.set(cu.id);
  }

  abrirMenu(cu: CuadernoEstudio): void {
    this.cuadernoMenu.set(cu);
  }

  abrirDesdeMenu(id: string): void {
    this.cuadernoMenu.set(null);
    this.abrirCuaderno.set(id);
  }

  iniciarRenombrar(cu: CuadernoEstudio): void {
    this.cuadernoMenu.set(null);
    this.nuevoTitulo.set(cu.titulo);
    this.cuadernoRenombrar.set(cu);
  }

  async guardarNuevoTitulo(): Promise<void> {
    const cr = this.cuadernoRenombrar();
    const tit = this.nuevoTitulo().trim();
    if (cr && tit) {
      await this.estudio.guardarCuaderno({ ...cr, titulo: tit });
    }
    this.cuadernoRenombrar.set(null);
  }

  pedirBorrarDesdeMenu(cu: CuadernoEstudio): void {
    this.cuadernoMenu.set(null);
    this.pedirBorrarCuaderno(cu.id, cu.titulo);
  }

  conteo(s: Seccion): number {
    const r = this.estudio.resumen();
    return { favoritos: r.favoritos, comentarios: r.comentarios, cuadernos: r.cuadernos, red: 0 }[s];
  }

  cuentaMarcas(cuadernoId: string): number {
    return this.estudio.cuaderno(cuadernoId)?.bloques.filter((b) => b.tipo === 'marca').length ?? 0;
  }

  tituloDe(m: Marca): string { return refTitulo(m.ref); }
  colorTema(t: string): string { return this.estudio.getTema(t).color; }
  nombreTema(t: string): string { return this.estudio.getTema(t).nombre; }

  pedirBorrarMarca(id: string, titulo: string, tieneComentario = false): void {
    this.marcaABorrar.set({ id, titulo, tieneComentario });
  }

  async borrarSoloComentario(id: string): Promise<void> {
    await this.estudio.comentar(id, '');
    this.marcaABorrar.set(null);
    this.storage.showSnackbar('Comentario eliminado (versículo conservado)');
  }

  async confirmarBorradoMarca(id?: string): Promise<void> {
    const targetId = id || this.marcaABorrar()?.id;
    if (!targetId) return;
    await this.estudio.borrarMarca(targetId);
    this.marcaABorrar.set(null);
    this.storage.showSnackbar('Resaltado eliminado de la Biblia');
  }

  iniciarEdicionMarca(m: Marca): void {
    this.marcaEditando.set(m);
    this.textoComentarioEditando.set(m.comentario);
  }

  async guardarComentarioEditado(): Promise<void> {
    const me = this.marcaEditando();
    if (!me) return;
    const txt = this.textoComentarioEditando().trim();
    await this.estudio.comentar(me.id, txt);
    this.marcaEditando.set(null);
    this.storage.showSnackbar('Comentario actualizado ✍️');
  }

  pedirBorrarCuaderno(id: string, titulo: string): void {
    this.cuadernoABorrar.set({ id, titulo: titulo || 'Cuaderno sin título' });
  }

  async confirmarBorradoCuaderno(): Promise<void> {
    const cb = this.cuadernoABorrar();
    if (!cb) return;
    await this.estudio.borrarCuaderno(cb.id);
    this.cuadernoABorrar.set(null);
    this.storage.showSnackbar('Cuaderno eliminado con éxito 🗑️');
  }

  async crearCuaderno(): Promise<void> {
    const c = await this.estudio.crearCuaderno();
    this.abrirCuaderno.set(c.id);
  }

  cerrarCuaderno(): void {
    this.abrirCuaderno.set(null);
    this.seccion.set('cuadernos');
  }
}
