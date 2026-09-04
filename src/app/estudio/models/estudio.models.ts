/**
 * Modelo del Estudio Bíblico de R07.
 *
 * Tres piezas, y la diferencia entre ellas es lo que mantiene la app simple:
 *
 *   FAVORITO   → «este versículo me gustó». Un toque. Sin texto.
 *   COMENTARIO → «este versículo me dijo algo». Resaltado + una nota corta.
 *   CUADERNO   → «quiero entender esto a fondo». Varios comentarios juntos,
 *                ordenados, con lo que TÚ escribes entre medio.
 *
 * Un comentario nunca obliga a abrir un cuaderno. Un cuaderno se arma
 * arrastrando comentarios que ya existían. Esa es toda la jerarquía.
 */

/** Los 7 temas base de resaltado + IDs dinámicos para tags personalizados del usuario. */
export type TemaResaltado =
  | 'ROYAL_BLUE'
  | 'SAGE_OLIVE'
  | 'CLASSIC_GOLD'
  | 'LAVENDER_LILY'
  | 'SKY_BREEZE'
  | 'TERRACOTTA_CANE'
  | 'ROSE_PASTEL'
  | (string & {});

export interface DefinicionTema {
  id: string;
  /** Nombre que ve el usuario. Habla de la VIDA o del tema teológico/personal. */
  nombre: string;
  /** Para qué sirve, en una línea. Aparece bajo el nombre en el selector. */
  proposito: string;
  color: string;      // color del subrayado
  suave: string;      // fondo del versículo resaltado
  emoji: string;
  esPersonalizado?: boolean;
}

/** Emojis bíblicos y devocionales sugeridos para crear nuevos tags */
export const EMOJIS_SUGERIDOS = [
  '👑', '🔥', '🕊️', '📜', '⚔️', '🛡️', '💎', '🐑',
  '🍞', '🩸', '🌿', '💡', '✝️', '⚓', '🎺', '⭐'
];

/** Colores vibrantes y armónicos sugeridos para tags */
export const COLORES_SUGERIDOS = [
  '#3B82F6', '#22C55E', '#D4AF37', '#A78BFA',
  '#38BDF8', '#FB923C', '#F472B6', '#EF4444',
  '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4'
];

/**
 * Los nombres son intencionales: una persona mayor no busca "el azul",
 * busca "la promesa". El color es la consecuencia, no la etiqueta.
 */
export const TEMAS_RESALTADO: DefinicionTema[] = [
  { id: 'ROYAL_BLUE',      nombre: 'Promesa',    proposito: 'Dios se comprometió a algo',      color: '#3B82F6', suave: 'rgba(59,130,246,0.16)',  emoji: '🕊️' },
  { id: 'SAGE_OLIVE',      nombre: 'Mandato',    proposito: 'Algo que debo obedecer',           color: '#22C55E', suave: 'rgba(34,197,94,0.16)',   emoji: '🌿' },
  { id: 'CLASSIC_GOLD',    nombre: 'Quién es Él',proposito: 'Revela el carácter de Dios',       color: '#D4AF37', suave: 'rgba(212,175,55,0.18)',  emoji: '👑' },
  { id: 'LAVENDER_LILY',   nombre: 'Oración',    proposito: 'Lo quiero orar hoy',               color: '#A78BFA', suave: 'rgba(167,139,250,0.16)', emoji: '🙏' },
  { id: 'SKY_BREEZE',      nombre: 'Consuelo',   proposito: 'Me sostuvo en un momento difícil', color: '#38BDF8', suave: 'rgba(56,189,248,0.16)',  emoji: '💧' },
  { id: 'TERRACOTTA_CANE', nombre: 'Advertencia',proposito: 'Un llamado de atención',           color: '#FB923C', suave: 'rgba(251,146,60,0.16)',  emoji: '🔥' },
  { id: 'ROSE_PASTEL',     nombre: 'Amor',       proposito: 'Habla del amor de Dios o al prójimo', color: '#F472B6', suave: 'rgba(244,114,182,0.16)', emoji: '❤️' },
];

export const TEMA_POR_ID = new Map(TEMAS_RESALTADO.map((t) => [t.id, t]));

/* ------------------------------------------------------------------ */

/** Referencia a un rango de versículos: "Isaías 41:10" o "Romanos 8:38-39". */
export interface RefVersiculo {
  /** Número de libro 1-66, igual que en BIBLE_BOOKS del proyecto. */
  libro: number;
  libroNombre: string;
  capitulo: number;
  versiculoIni: number;
  versiculoFin: number;
  version: 'RVR1960' | 'NTV';
}

/** ID canónico y estable: "43.3.16" (Juan 3:16). Sin tildes, sin versión. */
export function refId(r: Pick<RefVersiculo, 'libro' | 'capitulo' | 'versiculoIni'>): string {
  return `${r.libro}.${r.capitulo}.${r.versiculoIni}`;
}

export function refTitulo(r: RefVersiculo): string {
  return r.versiculoFin > r.versiculoIni
    ? `${r.libroNombre} ${r.capitulo}:${r.versiculoIni}-${r.versiculoFin}`
    : `${r.libroNombre} ${r.capitulo}:${r.versiculoIni}`;
}

/* ------------------------------------------------------------------ */

/**
 * MARCA: un resaltado sobre uno o varios versículos, con comentario opcional.
 * Es la unidad atómica del estudio. Todo lo demás se construye con esto.
 */
export interface Marca {
  id: string;
  /** IDs de cada versículo cubierto: ["23.41.10"] o varios si es rango. */
  refIds: string[];
  ref: RefVersiculo;
  /** Texto bíblico congelado en el momento de marcar, para no depender del
   *  archivo si algún día cambia la versión. */
  textoCitado: string;

  tema: TemaResaltado;
  /** Nota del usuario. Vacío = solo resaltado, sin comentario. */
  comentario: string;
  /** Etiquetas escritas con # dentro del comentario, ya extraídas. */
  tags: string[];
  /** true = además aparece en "Favoritos". */
  favorito: boolean;

  /** Cuadernos donde se usó esta marca. Un comentario puede vivir en varios. */
  cuadernos: string[];

  creado: number;
  actualizado: number;
}

/* ------------------------------------------------------------------ */

/** Bloque dentro de un cuaderno: o una marca traída, o texto tuyo. */
export type BloqueCuaderno =
  | { tipo: 'marca'; marcaId: string }
  | { tipo: 'texto'; texto: string };

/**
 * CUADERNO: el estudio a fondo. Trae comentarios que ya hiciste y les pones
 * tu desarrollo entre medio.
 */
export interface CuadernoEstudio {
  id: string;
  titulo: string;
  /** Una línea que dice de qué trata. Aparece en la lista. */
  resumen: string;
  bloques: BloqueCuaderno[];
  /** Etiquetas del cuaderno completo (además de las de cada marca). */
  tags: string[];
  /** Color del lomo en la lista. Usa los mismos 7 temas. */
  tema: TemaResaltado;
  creado: number;
  actualizado: number;
}

/* ------------------------------------------------------------------ */

/** Extrae #etiquetas de un texto. Igual criterio en toda la app. */
export function extraerTags(texto: string): string[] {
  const re = /(?:^|[\s(>[])#([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ][\wáéíóúüñÁÉÍÓÚÜÑ\-\/]*)/g;
  const out = new Set<string>();
  for (let m; (m = re.exec(texto)); ) {
    const t = m[1]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (t) out.add(t);
  }
  return [...out];
}

export function marcaVacia(ref: RefVersiculo, texto: string, tema: TemaResaltado): Marca {
  const ahora = Date.now();
  const ids: string[] = [];
  for (let v = ref.versiculoIni; v <= ref.versiculoFin; v++) {
    ids.push(`${ref.libro}.${ref.capitulo}.${v}`);
  }
  return {
    id: `m_${ahora.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    refIds: ids,
    ref,
    textoCitado: texto,
    tema,
    comentario: '',
    tags: [],
    favorito: false,
    cuadernos: [],
    creado: ahora,
    actualizado: ahora,
  };
}

export function cuadernoVacio(titulo = 'Estudio sin título'): CuadernoEstudio {
  const ahora = Date.now();
  return {
    id: `c_${ahora.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    titulo,
    resumen: '',
    bloques: [],
    tags: [],
    tema: 'CLASSIC_GOLD',
    creado: ahora,
    actualizado: ahora,
  };
}

/* ------------------------------------------------------------------ */
/* EL PLANO — lo que el usuario arma a mano                            */
/* ------------------------------------------------------------------ */

/**
 * El plano no es solo una foto del estudio: es un tablero que se edita.
 * Sobre lo que la app calcula (versículos, cuadernos, etiquetas), el usuario
 * puede mover las cosas de sitio, escribir notas nuevas y trazar sus propias
 * flechas. Eso es lo que se guarda aquí.
 */

/** Una tarjeta que el usuario creó a mano, no salió de un versículo. */
export interface NotaPlano {
  id: string;            // "nota:xxxx"
  titulo: string;
  detalle: string;
  tema: TemaResaltado;
  x: number;
  y: number;
  creado: number;
}

/** Una flecha que el usuario trazó a mano entre dos tarjetas. */
export interface FlechaPlano {
  id: string;
  origen: string;        // id de nodo (ref:… / note:… / tag:… / nota:…)
  destino: string;
  etiqueta: string;      // "desarrolla", "contradice", "cumple"… vacío si no puso
  creado: number;
}

/** Todo lo que el usuario cambió en el plano. Un solo documento. */
export interface Tablero {
  /** Posiciones movidas a mano. Mandan sobre el cálculo automático. */
  posiciones: Record<string, { x: number; y: number }>;
  notas: NotaPlano[];
  flechas: FlechaPlano[];
  /** Nodos automáticos que el usuario escondió del plano. */
  ocultos: string[];
  actualizado: number;
}

export function tableroVacio(): Tablero {
  return { posiciones: {}, notas: [], flechas: [], ocultos: [], actualizado: Date.now() };
}

export function notaPlanoNueva(x: number, y: number): NotaPlano {
  const ahora = Date.now();
  return {
    id: `nota:${ahora.toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    titulo: 'Nota nueva',
    detalle: '',
    tema: 'CLASSIC_GOLD',
    x,
    y,
    creado: ahora,
  };
}
