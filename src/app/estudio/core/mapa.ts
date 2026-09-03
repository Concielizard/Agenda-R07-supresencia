/**
 * Colocación del PLANO COMPLETO de conexiones.
 *
 * No hay física ni simulación: se calcula una vez, queda quieto, y el usuario
 * lo mueve si quiere. Si mueve algo, esa posición se guarda y manda sobre el
 * cálculo. Así el plano es SUYO y se abre siempre igual.
 *
 * Cómo se organiza: por temas. Cada #etiqueta arma un grupo con lo suyo
 * alrededor, y los grupos se acomodan en una rejilla ordenada, del más usado
 * al menos usado. Dentro de un grupo las líneas son radios, así que no se
 * cruzan. Es la manera más simple de que un plano con cien cosas se siga
 * entendiendo.
 */

export interface NodoMapa {
  id: string;
  tipo: 'ref' | 'note' | 'tag' | 'nota';
  titulo: string;
  /** Nº de conexiones. Lo calcula el indexador; opcional al construir. */
  grado?: number;
}

export interface AristaMapa {
  origen: string;
  destino: string;
  /** De dónde salió la relación: 'cita' | 'tag'. Informativo. */
  tipo?: string;
}

export interface Punto { x: number; y: number }

export interface PlanoCalculado {
  posiciones: Map<string, Punto>;
  /** Círculos de fondo, uno por grupo. Guía visual muy tenue. */
  grupos: { cx: number; cy: number; r: number; titulo: string }[];
  caja: { minX: number; minY: number; maxX: number; maxY: number };
  /** Aristas dentro de un mismo grupo: son las que se dibujan siempre. */
  internas: Set<string>;
}

const SEPARACION = 120;
const PASO_MIEMBRO = 92;

export function calcularPlano(
  nodos: NodoMapa[],
  aristas: AristaMapa[]
): PlanoCalculado {
  const porId = new Map(nodos.map((n) => [n.id, n]));

  const vecinos = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    let s = vecinos.get(a);
    if (!s) vecinos.set(a, (s = new Set()));
    s.add(b);
  };
  for (const e of aristas) { add(e.origen, e.destino); add(e.destino, e.origen); }

  // --- Cada cosa pertenece al grupo de su etiqueta más específica ---
  // (la de menor grado: «#romanos-8» dice más que «#fe»).
  const grupoDe = new Map<string, string>();
  for (const n of nodos) {
    if (n.tipo === 'tag') continue;
    const tags = [...(vecinos.get(n.id) ?? [])]
      .filter((v) => porId.get(v)?.tipo === 'tag')
      .sort((a, b) => (porId.get(a)!.grado ?? 0) - (porId.get(b)!.grado ?? 0));
    if (tags.length) grupoDe.set(n.id, tags[0]);
  }

  const etiquetas = nodos
    .filter((n) => n.tipo === 'tag')
    .sort((a, b) => (b.grado ?? 0) - (a.grado ?? 0) || a.titulo.localeCompare(b.titulo, 'es'));

  const miembros = new Map<string, NodoMapa[]>(etiquetas.map((t) => [t.id, []]));
  const sueltos: NodoMapa[] = [];
  for (const n of nodos) {
    if (n.tipo === 'tag') continue;
    const g = grupoDe.get(n.id);
    if (g && miembros.has(g)) miembros.get(g)!.push(n);
    else sueltos.push(n);
  }

  // Un grupo de UNA sola cosa no es un grupo: son dos puntitos perdidos.
  // Se juntan todos en un grupo general y el plano deja de verse como un
  // tablero de burbujas mínimas.
  for (const t of etiquetas) {
    const m = miembros.get(t.id) ?? [];
    if (m.length < 2) {
      sueltos.push(...m);
      miembros.set(t.id, []);
      for (const [k, v] of [...grupoDe]) if (v === t.id) grupoDe.delete(k);
    }
  }

  const radioGrupo = (cuantos: number) =>
    Math.max(140, (cuantos * PASO_MIEMBRO) / (2 * Math.PI) + 62);

  const bloques = etiquetas
    .filter((t) => (miembros.get(t.id)?.length ?? 0) > 0)
    .map((t) => ({
      titulo: t.titulo,
      tag: t,
      hijos: miembros.get(t.id)!,
      radio: radioGrupo(miembros.get(t.id)!.length),
    }));

  if (sueltos.length) {
    bloques.push({
      titulo: 'Sin tema',
      tag: null as unknown as NodoMapa,
      hijos: sueltos,
      radio: radioGrupo(sueltos.length),
    });
  }

  // --- Rejilla: tantas columnas como raíz cuadrada, para una caja cuadrada ---
  const columnas = Math.max(1, Math.round(Math.sqrt(bloques.length)));
  const anchoCol: number[] = [];
  const altoFil: number[] = [];
  bloques.forEach((b, i) => {
    const c = i % columnas, f = Math.floor(i / columnas);
    anchoCol[c] = Math.max(anchoCol[c] ?? 0, b.radio * 2 + SEPARACION);
    altoFil[f] = Math.max(altoFil[f] ?? 0, b.radio * 2 + SEPARACION);
  });

  const xCol: number[] = [];
  const yFil: number[] = [];
  let acc = 0;
  for (let c = 0; c < columnas; c++) { xCol[c] = acc + (anchoCol[c] ?? 0) / 2; acc += anchoCol[c] ?? 0; }
  acc = 0;
  for (let f = 0; f < altoFil.length; f++) { yFil[f] = acc + (altoFil[f] ?? 0) / 2; acc += altoFil[f] ?? 0; }

  const posiciones = new Map<string, Punto>();
  const grupos: PlanoCalculado['grupos'] = [];

  bloques.forEach((b, i) => {
    const cx = xCol[i % columnas];
    const cy = yFil[Math.floor(i / columnas)];

    if (b.tag) posiciones.set(b.tag.id, { x: cx, y: cy });
    grupos.push({ cx, cy, r: b.radio, titulo: b.titulo });

    // Orden estable: versículos primero, luego cuadernos, y alfabético.
    const ordenados = [...b.hijos].sort((a, z) =>
      a.tipo === z.tipo
        ? a.titulo.localeCompare(z.titulo, 'es')
        : (a.tipo === 'ref' ? 0 : 1) - (z.tipo === 'ref' ? 0 : 1)
    );
    const paso = (Math.PI * 2) / ordenados.length;
    ordenados.forEach((n, k) => {
      const ang = -Math.PI / 2 + k * paso;
      posiciones.set(n.id, {
        x: cx + Math.cos(ang) * b.radio,
        y: cy + Math.sin(ang) * b.radio,
      });
    });
  });

  // --- Aristas que se dibujan siempre: las de dentro de un grupo ---
  const internas = new Set<string>();
  for (const e of aristas) {
    const ga = grupoDe.get(e.origen) ?? e.origen;
    const gb = grupoDe.get(e.destino) ?? e.destino;
    if (ga === gb || e.origen === gb || e.destino === ga) {
      internas.add(`${e.origen}|${e.destino}`);
    }
  }

  // --- Caja envolvente ---
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of posiciones.values()) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  const caja = isFinite(minX)
    ? { minX: minX - 120, minY: minY - 90, maxX: maxX + 120, maxY: maxY + 90 }
    : { minX: -200, minY: -200, maxX: 200, maxY: 200 };

  return { posiciones, grupos, caja, internas };
}
