import { Injectable, effect, inject } from '@angular/core';
import { R07StorageService } from './r07-storage.service';

/**
 * ARRANQUE: splash con versículo + precarga real + color de la barra de estado.
 *
 * Resuelve tres cosas:
 *   1. En iOS no aparecía ninguna pantalla de carga (el splash vivía dentro de
 *      <app-root> y el SSR lo pisaba). Ahora vive fuera y lo cierra este
 *      servicio cuando termina de verdad.
 *   2. En Android aparecía pero duraba un parpadeo. Ahora dura lo que dura la
 *      precarga real, con una duración MÍNIMA para que se alcance a leer el
 *      versículo (y máxima, para no aburrir).
 *   3. La franja de arriba cambiaba de color. Aquí se sincroniza el
 *      theme-color y la variable --r07-shell con la paleta activa.
 *
 * Se llama UNA vez desde app.ts:
 *
 *   private arranque = inject(ArranqueService);
 *   constructor() { void this.arranque.iniciar(); }
 */

declare global {
  interface Window {
    R07Splash?: {
      progreso: (pct: number, texto?: string) => void;
      cerrar: () => void;
    };
  }
}

/** Libros que se precargan siempre: los que abre el 90% de la gente. */
const LIBROS_CALIENTES = [19, 43, 45, 40, 20, 23, 50]; // Sal, Jn, Ro, Mt, Pr, Is, Fil

const CLAVE_PRECARGA = 'r07_biblia_precargada_v1';

@Injectable({ providedIn: 'root' })
export class ArranqueService {
  private readonly storage = inject(R07StorageService);

  private readonly MIN_MS = 1600;   // tiempo mínimo en pantalla
  private readonly MAX_MS = 6000;   // tope duro

  constructor() {
    // Cada vez que cambia la paleta o el modo claro/oscuro, se repinta
    // la barra de estado. Un effect: no hay que llamarlo a mano.
    effect(() => {
      const c = this.storage.currentThemeColors();
      this.pintarShell(c.background);
    });
  }

  async iniciar(): Promise<void> {
    const t0 = Date.now();
    const splash = typeof window !== 'undefined' ? window.R07Splash : undefined;
    const avisar = (p: number, t?: string) => splash?.progreso(p, t);

    try {
      avisar(8, 'Cargando tu agenda…');
      await this.esperar(120);

      // --- 1. ¿Ya se precargó alguna vez? ---
      const yaEsta =
        typeof localStorage !== 'undefined' &&
        localStorage.getItem(CLAVE_PRECARGA) === '1';

      if (yaEsta) {
        // Arranque normal: la Biblia ya está en la caché del Service Worker.
        avisar(60, 'Todo listo sin conexión');
        await this.esperar(220);
      } else {
        // --- 2. Primera vez: se calientan los libros más usados ---
        avisar(20, 'Descargando la Palabra…');
        let hechos = 0;
        for (const libro of LIBROS_CALIENTES) {
          await Promise.all([
            this.calentar(`/bible/rvr1960/${libro}.json`),
            this.calentar(`/bible/ntv/${libro}.json`),
          ]);
          hechos++;
          avisar(
            20 + Math.round((hechos / LIBROS_CALIENTES.length) * 55),
            `Preparando lectura sin conexión (${hechos}/${LIBROS_CALIENTES.length})`
          );
        }

        // El resto de los 66 libros se sigue cacheando EN SEGUNDO PLANO
        // (lo hace el Service Worker en su evento install). No bloqueamos.
        if (typeof localStorage !== 'undefined') {
          try { localStorage.setItem(CLAVE_PRECARGA, '1'); } catch { /* modo privado */ }
        }
      }

      // --- 3. Esperar a que el Service Worker esté activo ---
      avisar(85, 'Activando modo sin conexión…');
      await this.esperarServiceWorker(2500);

      avisar(100, 'Listo');
    } catch (err) {
      // Nunca dejar al usuario atrapado en el splash por un error de red.
      console.warn('Precarga incompleta (la app abre igual):', err);
      avisar(100, 'Listo');
    } finally {
      const transcurrido = Date.now() - t0;
      const falta = Math.max(0, this.MIN_MS - transcurrido);
      await this.esperar(Math.min(falta, this.MAX_MS));
      splash?.cerrar();
    }
  }

  /* ------------------------------------------------------------------ */

  /** Descarga y deja en caché un archivo. Falla en silencio si no hay red. */
  private async calentar(url: string): Promise<void> {
    try {
      const res = await fetch(url, { cache: 'force-cache' });
      if (res.ok) await res.arrayBuffer();
    } catch { /* sin red: el SW lo tomará después */ }
  }

  private async esperarServiceWorker(timeoutMs: number): Promise<void> {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    await Promise.race([
      navigator.serviceWorker.ready.then(() => undefined),
      this.esperar(timeoutMs),
    ]);
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /**
   * Pinta la barra de estado del sistema con el color de la app.
   * Es lo que arregla la franja negra de arriba en el iPhone.
   */
  private pintarShell(color: string): void {
    if (typeof document === 'undefined') return;

    const oscuro = this.esOscuro(color);
    if (oscuro) {
      document.documentElement.classList.remove('modo-claro');
      document.documentElement.classList.add('modo-oscuro');
    } else {
      document.documentElement.classList.remove('modo-oscuro');
      document.documentElement.classList.add('modo-claro');
    }

    document.documentElement.style.setProperty('--r07-shell', color);
    document.documentElement.style.backgroundColor = color;
    if (document.body) {
      document.body.style.backgroundColor = color;
    }

    const splash = document.getElementById('r07-splash');
    if (splash) {
      if (oscuro) {
        splash.classList.remove('modo-claro');
        splash.classList.add('modo-oscuro');
      } else {
        splash.classList.remove('modo-oscuro');
        splash.classList.add('modo-claro');
      }
    }

    const meta = document.getElementById('r07-theme-color') as HTMLMetaElement | null;
    if (meta) meta.setAttribute('content', color);

    const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleMeta) appleMeta.setAttribute('content', 'black-translucent');

    // En Android nativo, además, se pinta la barra del sistema.
    // Requiere @capacitor/status-bar; si no está, no pasa nada.
    const cap = (globalThis as unknown as { Capacitor?: any }).Capacitor;
    if (cap?.isNativePlatform?.() && cap.Plugins?.StatusBar) {
      cap.Plugins.StatusBar.setBackgroundColor({ color }).catch(() => {});
      cap.Plugins.StatusBar.setStyle({ style: oscuro ? 'DARK' : 'LIGHT' }).catch(() => {});
    }
  }

  /** Luminancia percibida: decide si el texto de la barra va claro u oscuro. */
  private esOscuro(hex: string): boolean {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return true;
    const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16));
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 140;
  }
}
