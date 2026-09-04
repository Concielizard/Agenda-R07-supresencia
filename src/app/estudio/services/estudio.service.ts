import { Injectable, computed, inject, signal } from '@angular/core';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

import { FirebaseService } from '../../services/firebase.service';
import {
  type CuadernoEstudio,
  type DefinicionTema,
  type FlechaPlano,
  type Marca,
  type NotaPlano,
  type RefVersiculo,
  type Tablero,
  type TemaResaltado,
  TEMAS_RESALTADO,
  cuadernoVacio,
  extraerTags,
  marcaVacia,
  notaPlanoNueva,
  refTitulo,
  tableroVacio,
} from '../models/estudio.models';
import type { AristaMapa, NodoMapa } from '../core/mapa';

const CLAVE_MARCAS = 'r07_estudio_marcas_v1';
const CLAVE_CUADERNOS = 'r07_estudio_cuadernos_v1';
const CLAVE_TABLERO = 'r07_estudio_tablero_v1';
const CLAVE_TEMAS_CUSTOM = 'r07_estudio_temas_custom_v1';

/**
 * Servicio del Estudio Bíblico.
 *
 * Sigue exactamente el patrón que ya usa el proyecto: signals + localStorage
 * como fuente inmediata, y Firestore como respaldo que se sincroniza cuando
 * hay sesión. NO usa @angular/fire (el proyecto usa el SDK de firebase
 * directo), así no hay que añadir dependencias.
 *
 * Regla que se respeta en todo el archivo: la app NUNCA espera a la nube para
 * pintar. Si no hay internet, el estudio funciona igual.
 */
@Injectable({ providedIn: 'root' })
export class EstudioService {
  private readonly fb = inject(FirebaseService);

  readonly marcas = signal<Marca[]>(this.leerLocal<Marca>(CLAVE_MARCAS));
  readonly cuadernos = signal<CuadernoEstudio[]>(this.leerLocal<CuadernoEstudio>(CLAVE_CUADERNOS));

  /** Lo que el usuario armó a mano en el plano: posiciones, notas y flechas. */
  readonly tablero = signal<Tablero>(this.leerTablero());

  /** Tags y categorías personalizadas creadas por el usuario con emoji y color. */
  readonly temasPersonalizados = signal<DefinicionTema[]>(this.leerLocal<DefinicionTema>(CLAVE_TEMAS_CUSTOM));

  /** Controla la visibilidad del modal de guía y tutorial interactivo. */
  readonly mostrarGuia = signal<boolean>(false);

  readonly todosLosTemas = computed<DefinicionTema[]>(() => [
    ...TEMAS_RESALTADO,
    ...this.temasPersonalizados(),
  ]);

  readonly temaPorId = computed(() => {
    const m = new Map<string, DefinicionTema>();
    for (const t of this.todosLosTemas()) m.set(t.id, t);
    return m;
  });

  public getTema(id: string): DefinicionTema {
    return this.temaPorId().get(id) ?? TEMAS_RESALTADO[0];
  }

  async crearTemaPersonalizado(datos: {
    nombre: string;
    emoji: string;
    color: string;
    proposito?: string;
  }): Promise<DefinicionTema> {
    const hex = datos.color.trim();
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const suave = this.hexASuave(hex);
    const nuevo: DefinicionTema = {
      id,
      nombre: datos.nombre.trim(),
      emoji: datos.emoji.trim() || '🏷️',
      color: hex,
      suave,
      proposito: datos.proposito?.trim() || 'Tag personalizado de estudio',
      esPersonalizado: true,
    };
    this.temasPersonalizados.update((l) => [...l, nuevo]);
    this.persistirTemas();
    await this.subirANube('temas_personalizados', nuevo.id, nuevo);
    return nuevo;
  }

  async actualizarTemaPersonalizado(
    id: string,
    datos: {
      nombre: string;
      emoji: string;
      color: string;
      proposito?: string;
    }
  ): Promise<DefinicionTema | null> {
    const hex = datos.color.trim();
    const suave = this.hexASuave(hex);
    let temaActualizado: DefinicionTema | null = null;
    this.temasPersonalizados.update((lista) =>
      lista.map((t) => {
        if (t.id === id) {
          temaActualizado = {
            ...t,
            nombre: datos.nombre.trim(),
            emoji: datos.emoji.trim() || '🏷️',
            color: hex,
            suave,
            proposito: datos.proposito?.trim() || t.proposito,
          };
          return temaActualizado;
        }
        return t;
      })
    );
    this.persistirTemas();
    if (temaActualizado) {
      await this.subirANube('temas_personalizados', id, temaActualizado);
    }
    return temaActualizado;
  }

  async borrarTemaPersonalizado(id: string): Promise<void> {
    this.temasPersonalizados.update((l) => l.filter((t) => t.id !== id));
    this.persistirTemas();
    // Si alguna marca tenía este tema, la reasignamos al tema por defecto amor
    this.marcas.update((lista) =>
      lista.map((m) => (m.tema === id ? { ...m, tema: 'amor', actualizado: Date.now() } : m))
    );
    this.persistir();
    await this.borrarEnNube('temas_personalizados', id);
  }

  private hexASuave(hex: string): string {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return 'rgba(59,130,246,0.16)';
    const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16));
    return `rgba(${r},${g},${b},0.16)`;
  }

  private persistirTemas(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CLAVE_TEMAS_CUSTOM, JSON.stringify(this.temasPersonalizados()));
    } catch {}
  }

  /* ------------------------------------------------------------------ */
  /* Consultas                                                           */
  /* ------------------------------------------------------------------ */

  /** Índice versículo -> marcas, para pintar el capítulo abierto. */
  readonly marcasPorVersiculo = computed(() => {
    const m = new Map<string, Marca[]>();
    for (const marca of this.marcas()) {
      for (const id of marca.refIds) {
        const arr = m.get(id) ?? [];
        arr.push(marca);
        m.set(id, arr);
      }
    }
    return m;
  });

  readonly favoritos = computed(() =>
    this.marcas()
      .filter((m) => m.favorito)
      .sort((a, b) => b.actualizado - a.actualizado)
  );

  /** Solo las que tienen texto: la pestaña "Comentarios". */
  readonly comentarios = computed(() =>
    this.marcas()
      .filter((m) => m.comentario.trim().length > 0)
      .sort((a, b) => b.actualizado - a.actualizado)
  );

  readonly tags = computed(() => {
    const cuenta = new Map<string, number>();
    for (const m of this.marcas()) for (const t of m.tags) cuenta.set(t, (cuenta.get(t) ?? 0) + 1);
    for (const c of this.cuadernos()) for (const t of c.tags) cuenta.set(t, (cuenta.get(t) ?? 0) + 1);
    return [...cuenta.entries()]
      .map(([tag, usos]) => ({ tag, usos }))
      .sort((a, b) => b.usos - a.usos || a.tag.localeCompare(b.tag, 'es'));
  });

  readonly resumen = computed(() => ({
    marcas: this.marcas().length,
    comentarios: this.comentarios().length,
    favoritos: this.favoritos().length,
    cuadernos: this.cuadernos().length,
    tags: this.tags().length,
  }));

  marcasDe(versiculoId: string): Marca[] {
    return this.marcasPorVersiculo().get(versiculoId) ?? [];
  }

  marca(id: string): Marca | undefined {
    return this.marcas().find((m) => m.id === id);
  }

  cuaderno(id: string): CuadernoEstudio | undefined {
    return this.cuadernos().find((c) => c.id === id);
  }

  /** Búsqueda simple sobre el texto bíblico y tus comentarios. */
  buscar(consulta: string): Marca[] {
    const q = consulta.trim().toLowerCase();
    if (q.length < 2) return [];
    return this.marcas().filter(
      (m) =>
        m.comentario.toLowerCase().includes(q) ||
        m.textoCitado.toLowerCase().includes(q) ||
        refTitulo(m.ref).toLowerCase().includes(q) ||
        m.tags.some((t) => t.includes(q))
    );
  }

  /* ------------------------------------------------------------------ */
  /* Marcas                                                              */
  /* ------------------------------------------------------------------ */

  /** Resalta un rango. Si ya existía una marca igual, cambia su tema. */
  async resaltar(ref: RefVersiculo, texto: string, tema: TemaResaltado): Promise<Marca> {
    const existente = this.marcas().find(
      (m) =>
        m.ref.libro === ref.libro &&
        m.ref.capitulo === ref.capitulo &&
        m.ref.versiculoIni === ref.versiculoIni &&
        m.ref.versiculoFin === ref.versiculoFin
    );

    if (existente) {
      const actualizada = { ...existente, tema, actualizado: Date.now() };
      await this.guardarMarca(actualizada);
      return actualizada;
    }

    const nueva = marcaVacia(ref, texto, tema);
    await this.guardarMarca(nueva);
    return nueva;
  }

  async comentar(marcaId: string, comentario: string): Promise<void> {
    const m = this.marca(marcaId);
    if (!m) return;
    await this.guardarMarca({
      ...m,
      comentario,
      tags: extraerTags(comentario),
      actualizado: Date.now(),
    });
  }

  async alternarFavorito(marcaId: string): Promise<void> {
    const m = this.marca(marcaId);
    if (!m) return;
    await this.guardarMarca({ ...m, favorito: !m.favorito, actualizado: Date.now() });
  }

  async borrarMarca(marcaId: string): Promise<void> {
    this.marcas.update((lista) => lista.filter((m) => m.id !== marcaId));
    // Se quita también de los cuadernos que la usaban.
    this.cuadernos.update((lista) =>
      lista.map((c) => ({
        ...c,
        bloques: c.bloques.filter((b) => b.tipo !== 'marca' || b.marcaId !== marcaId),
      }))
    );
    this.persistir();
    await this.borrarEnNube('marcas', marcaId);
  }

  private async guardarMarca(m: Marca): Promise<void> {
    this.marcas.update((lista) => {
      const i = lista.findIndex((x) => x.id === m.id);
      if (i < 0) return [m, ...lista];
      const copia = [...lista];
      copia[i] = m;
      return copia;
    });
    this.persistir();
    await this.subirANube('marcas', m.id, m);
  }

  /* ------------------------------------------------------------------ */
  /* Cuadernos                                                           */
  /* ------------------------------------------------------------------ */

  async crearCuaderno(titulo?: string): Promise<CuadernoEstudio> {
    const c = cuadernoVacio(titulo);
    this.cuadernos.update((l) => [c, ...l]);
    this.persistir();
    await this.subirANube('cuadernos', c.id, c);
    return c;
  }

  async guardarCuaderno(c: CuadernoEstudio): Promise<void> {
    const actualizado = { ...c, tags: this.tagsDeCuaderno(c), actualizado: Date.now() };
    this.cuadernos.update((l) => {
      const i = l.findIndex((x) => x.id === c.id);
      if (i < 0) return [actualizado, ...l];
      const copia = [...l];
      copia[i] = actualizado;
      return copia;
    });
    this.persistir();
    await this.subirANube('cuadernos', c.id, actualizado);
  }

  async borrarCuaderno(id: string): Promise<void> {
    this.cuadernos.update((l) => l.filter((c) => c.id !== id));
    this.marcas.update((l) =>
      l.map((m) => ({ ...m, cuadernos: m.cuadernos.filter((x) => x !== id) }))
    );
    this.persistir();
    await this.borrarEnNube('cuadernos', id);
  }

  /** Trae un comentario existente a un cuaderno. Es la acción central. */
  async agregarMarcaACuaderno(cuadernoId: string, marcaId: string): Promise<void> {
    const c = this.cuaderno(cuadernoId);
    const m = this.marca(marcaId);
    if (!c || !m) return;
    if (c.bloques.some((b) => b.tipo === 'marca' && b.marcaId === marcaId)) return;

    await this.guardarCuaderno({ ...c, bloques: [...c.bloques, { tipo: 'marca', marcaId }] });
    await this.guardarMarca({ ...m, cuadernos: [...new Set([...m.cuadernos, cuadernoId])] });
  }

  async agregarTextoACuaderno(cuadernoId: string, texto: string): Promise<void> {
    const c = this.cuaderno(cuadernoId);
    if (!c) return;
    await this.guardarCuaderno({ ...c, bloques: [...c.bloques, { tipo: 'texto', texto }] });
  }

  /** Reordena los bloques (arrastrar dentro del cuaderno). */
  async moverBloque(cuadernoId: string, desde: number, hasta: number): Promise<void> {
    const c = this.cuaderno(cuadernoId);
    if (!c) return;
    const bloques = [...c.bloques];
    const [b] = bloques.splice(desde, 1);
    bloques.splice(hasta, 0, b);
    await this.guardarCuaderno({ ...c, bloques });
  }

  private tagsDeCuaderno(c: CuadernoEstudio): string[] {
    const t = new Set<string>();
    for (const b of c.bloques) {
      if (b.tipo === 'texto') for (const x of extraerTags(b.texto)) t.add(x);
      else for (const x of this.marca(b.marcaId)?.tags ?? []) t.add(x);
    }
    for (const x of extraerTags(c.resumen)) t.add(x);
    return [...t];
  }

  /* ------------------------------------------------------------------ */
  /* Grafo — SIN IA, puro algoritmo                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Construye el grafo a partir de lo que YA escribiste. Nada de IA:
   *
   *   versículo ──cita──▶ cuaderno      (el cuaderno usa ese versículo)
   *   marca     ──tag───▶ etiqueta      (la etiqueta que escribiste con #)
   *   cuaderno  ──tag───▶ etiqueta
   *
   * Un versículo y un cuaderno quedan conectados porque TÚ trajiste ese
   * comentario a ese cuaderno. Dos versículos quedan cerca porque comparten
   * etiqueta. Es determinista y explicable: si preguntas "¿por qué están
   * unidos?", siempre hay una respuesta concreta.
   */
  readonly grafo = computed<{ nodos: NodoMapa[]; aristas: AristaMapa[] }>(() => {
    const nodos = new Map<string, NodoMapa>();
    const aristas: AristaMapa[] = [];
    const vistas = new Set<string>();

    const poner = (n: NodoMapa) => { if (!nodos.has(n.id)) nodos.set(n.id, n); };
    const unir = (o: string, d: string, tipo: string) => {
      const k = `${o}|${d}`;
      if (o === d || vistas.has(k)) return;
      vistas.add(k);
      aristas.push({ origen: o, destino: d, tipo });
    };

    // 1. Versículos marcados y sus etiquetas
    for (const m of this.marcas()) {
      const idRef = `ref:${m.refIds[0]}`;
      poner({ id: idRef, tipo: 'ref', titulo: refTitulo(m.ref) });
      for (const t of m.tags) {
        poner({ id: `tag:${t}`, tipo: 'tag', titulo: `#${t}` });
        unir(idRef, `tag:${t}`, 'tag');
      }
    }

    // 2. Cuadernos: se conectan con cada versículo que usan
    for (const c of this.cuadernos()) {
      const idC = `note:${c.id}`;
      poner({ id: idC, tipo: 'note', titulo: c.titulo });

      for (const b of c.bloques) {
        if (b.tipo !== 'marca') continue;
        const m = this.marca(b.marcaId);
        if (!m) continue;
        const idRef = `ref:${m.refIds[0]}`;
        poner({ id: idRef, tipo: 'ref', titulo: refTitulo(m.ref) });
        unir(idRef, idC, 'cita');
      }

      for (const t of c.tags) {
        poner({ id: `tag:${t}`, tipo: 'tag', titulo: `#${t}` });
        unir(idC, `tag:${t}`, 'tag');
      }
    }

    // 3. Grado — define el tamaño del círculo
    const grados = new Map<string, number>();
    for (const a of aristas) {
      grados.set(a.origen, (grados.get(a.origen) ?? 0) + 1);
      grados.set(a.destino, (grados.get(a.destino) ?? 0) + 1);
    }
    for (const [id, n] of nodos) n.grado = grados.get(id) ?? 0;

    return { nodos: [...nodos.values()], aristas };
  });

  /**
   * Sugerencias de conexión, también sin IA: dos versículos que comparten
   * dos o más etiquetas y todavía no están en un mismo cuaderno.
   * Es el "¿ya viste que esto se parece?" barato y explicable.
   */
  readonly sugerencias = computed(() => {
    const marcas = this.marcas().filter((m) => m.tags.length >= 2);
    const out: { a: Marca; b: Marca; comunes: string[] }[] = [];

    for (let i = 0; i < marcas.length; i++) {
      for (let j = i + 1; j < marcas.length; j++) {
        const a = marcas[i], b = marcas[j];
        const comunes = a.tags.filter((t) => b.tags.includes(t));
        if (comunes.length < 2) continue;
        const juntos = a.cuadernos.some((c) => b.cuadernos.includes(c));
        if (juntos) continue;
        out.push({ a, b, comunes });
      }
    }
    return out.sort((x, y) => y.comunes.length - x.comunes.length).slice(0, 12);
  });

  /* ------------------------------------------------------------------ */
  /* EL PLANO — todo lo que el usuario edita a mano                      */
  /* ------------------------------------------------------------------ */

  /** Mueve una tarjeta y deja esa posición fija. */
  moverEnPlano(id: string, x: number, y: number): void {
    this.cambiarTablero((t) => ({ ...t, posiciones: { ...t.posiciones, [id]: { x, y } } }));
  }

  /** Crea una tarjeta nueva escrita por el usuario. */
  crearNotaPlano(x: number, y: number): NotaPlano {
    const nota = notaPlanoNueva(x, y);
    this.cambiarTablero((t) => ({ ...t, notas: [...t.notas, nota] }));
    return nota;
  }

  editarNotaPlano(id: string, cambios: Partial<NotaPlano>): void {
    this.cambiarTablero((t) => ({
      ...t,
      notas: t.notas.map((n) => (n.id === id ? { ...n, ...cambios } : n)),
    }));
  }

  borrarNotaPlano(id: string): void {
    this.cambiarTablero((t) => ({
      ...t,
      notas: t.notas.filter((n) => n.id !== id),
      flechas: t.flechas.filter((f) => f.origen !== id && f.destino !== id),
    }));
  }

  /** Traza una flecha a mano entre dos tarjetas. */
  conectarEnPlano(origen: string, destino: string, etiqueta = ''): void {
    if (origen === destino) return;
    const ya = this.tablero().flechas.some(
      (f) => (f.origen === origen && f.destino === destino) ||
             (f.origen === destino && f.destino === origen)
    );
    if (ya) return;
    const flecha: FlechaPlano = {
      id: `f_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      origen, destino, etiqueta, creado: Date.now(),
    };
    this.cambiarTablero((t) => ({ ...t, flechas: [...t.flechas, flecha] }));
  }

  etiquetarFlecha(id: string, etiqueta: string): void {
    this.cambiarTablero((t) => ({
      ...t,
      flechas: t.flechas.map((f) => (f.id === id ? { ...f, etiqueta } : f)),
    }));
  }

  borrarFlecha(id: string): void {
    this.cambiarTablero((t) => ({ ...t, flechas: t.flechas.filter((f) => f.id !== id) }));
  }

  /** Esconder algo del plano NO lo borra del estudio: solo deja de dibujarse. */
  ocultarEnPlano(id: string): void {
    this.cambiarTablero((t) => ({ ...t, ocultos: [...new Set([...t.ocultos, id])] }));
  }

  mostrarTodoEnPlano(): void {
    this.cambiarTablero((t) => ({ ...t, ocultos: [] }));
  }

  /** Devuelve el plano al orden calculado, sin borrar notas ni flechas. */
  reordenarPlano(): void {
    this.cambiarTablero((t) => ({ ...t, posiciones: {} }));
  }

  private cambiarTablero(fn: (t: Tablero) => Tablero): void {
    const nuevo = { ...fn(this.tablero()), actualizado: Date.now() };
    this.tablero.set(nuevo);
    this.persistir();
    void this.subirTablero(nuevo);
  }

  /* ------------------------------------------------------------------ */
  /* Persistencia                                                        */
  /* ------------------------------------------------------------------ */

  private leerTablero(): Tablero {
    if (typeof localStorage === 'undefined') return tableroVacio();
    try {
      const raw = localStorage.getItem(CLAVE_TABLERO);
      return raw ? { ...tableroVacio(), ...(JSON.parse(raw) as Tablero) } : tableroVacio();
    } catch {
      return tableroVacio();
    }
  }

  private leerLocal<T>(clave: string): T[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(clave);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  private persistir(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(CLAVE_MARCAS, JSON.stringify(this.marcas()));
      localStorage.setItem(CLAVE_CUADERNOS, JSON.stringify(this.cuadernos()));
      localStorage.setItem(CLAVE_TABLERO, JSON.stringify(this.tablero()));
    } catch (e) {
      console.warn('No se pudo guardar el estudio en local:', e);
    }
  }

  private async subirANube(coleccion: 'marcas' | 'cuadernos' | 'temas_personalizados', id: string, datos: unknown): Promise<void> {
    const uid = this.fb.userUid();
    if (!uid) return; // sin sesión: solo local, y está bien
    try {
      await setDoc(doc(this.fb.db, `users/${uid}/${coleccion}/${id}`), datos as any);
    } catch (e) {
      // A diferencia del bug de grupos, aquí SÍ se avisa: un error silencioso
      // es lo que hizo que los grupos parecieran funcionar sin funcionar.
      console.warn(`[R07] No se pudo sincronizar ${coleccion}/${id}:`, e);
      this.fb.syncState.set('error');
    }
  }

  private async subirTablero(t: Tablero): Promise<void> {
    const uid = this.fb.userUid();
    if (!uid) return;
    try {
      await setDoc(doc(this.fb.db, `users/${uid}/tablero/principal`), t as any);
    } catch (e) {
      console.warn('[R07] No se pudo sincronizar el plano:', e);
      this.fb.syncState.set('error');
    }
  }

  private async borrarEnNube(coleccion: 'marcas' | 'cuadernos' | 'temas_personalizados', id: string): Promise<void> {
    const uid = this.fb.userUid();
    if (!uid) return;
    try {
      await deleteDoc(doc(this.fb.db, `users/${uid}/${coleccion}/${id}`));
    } catch (e) {
      console.warn(`[R07] No se pudo borrar ${coleccion}/${id}:`, e);
    }
  }

  /** Se llama al iniciar sesión: fusiona lo local con lo que hay en la nube. */
  async sincronizar(): Promise<void> {
    const uid = this.fb.userUid();
    if (!uid) return;

    try {
      const [snapM, snapC] = await Promise.all([
        getDocs(collection(this.fb.db, `users/${uid}/marcas`)),
        getDocs(collection(this.fb.db, `users/${uid}/cuadernos`)),
      ]);

      // Fusión por 'actualizado': gana la versión más reciente. Nunca se
      // borra nada por sincronizar.
      const fusionar = <T extends { id: string; actualizado: number }>(
        local: T[],
        remoto: T[]
      ): T[] => {
        const mapa = new Map(local.map((x) => [x.id, x]));
        for (const r of remoto) {
          const l = mapa.get(r.id);
          if (!l || r.actualizado > l.actualizado) mapa.set(r.id, r);
        }
        return [...mapa.values()];
      };

      this.marcas.set(
        fusionar(this.marcas(), snapM.docs.map((d) => d.data() as Marca))
          .sort((a, b) => b.actualizado - a.actualizado)
      );
      this.cuadernos.set(
        fusionar(this.cuadernos(), snapC.docs.map((d) => d.data() as CuadernoEstudio))
          .sort((a, b) => b.actualizado - a.actualizado)
      );
      this.persistir();

      // Y se sube lo que solo existía en el teléfono.
      for (const m of this.marcas()) await this.subirANube('marcas', m.id, m);
      for (const c of this.cuadernos()) await this.subirANube('cuadernos', c.id, c);
      await this.subirTablero(this.tablero());
    } catch (e) {
      console.warn('[R07] Sincronización de estudio incompleta:', e);
    }
  }
}
