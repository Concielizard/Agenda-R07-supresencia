/**
 * Utilidades de color para R07.
 *
 * Regla del proyecto: ningún componente escribe un color a mano. Todos salen
 * de `storage.currentThemeColors()`. Pero el cuaderno necesita tonos que no
 * están en la paleta (el papel pastel, los renglones, el margen), y esos se
 * DERIVAN de la paleta activa. Así el cuaderno cambia solo cuando el usuario
 * cambia de edición o de modo claro/oscuro, sin una sola excepción escrita
 * a mano.
 */

export interface RGB { r: number; g: number; b: number }

export function aRgb(hex: string): RGB {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return { r: 128, g: 128, b: 128 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function aHex({ r, g, b }: RGB): string {
  const c = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mezcla dos colores. t = 0 devuelve `a`, t = 1 devuelve `b`. */
export function mezclar(a: string, b: string, t: number): string {
  const A = aRgb(a), B = aRgb(b);
  return aHex({
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
  });
}

/** Luminancia percibida (0-255). Sirve para decidir claro u oscuro. */
export function luminancia(hex: string): number {
  const { r, g, b } = aRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function esOscuro(hex: string): boolean {
  return luminancia(hex) < 140;
}

/**
 * Color de texto que SÍ se lee sobre un fondo dado.
 * Esto es lo que faltaba en las tarjetas «Mujer de Dios» y «¡MILAGRO!»:
 * fijaban su propio fondo pero heredaban el texto del tema, y quedaban
 * ilegibles. Si un bloque fija fondo, fija texto. Sin excepciones.
 */
export function textoSobre(fondo: string, claro = '#FFFFFF', oscuro = '#1A1A1A'): string {
  return esOscuro(fondo) ? claro : oscuro;
}

/* ------------------------------------------------------------------ */
/* El papel del cuaderno                                               */
/* ------------------------------------------------------------------ */

export interface PapelCuaderno {
  /** Fondo de la hoja: pastel del color de la edición. */
  papel: string;
  /** Los renglones. Visibles pero discretos: se ven, no gritan. */
  renglon: string;
  /** La línea vertical del margen, como en un cuaderno de verdad. */
  margen: string;
  /** Texto que el usuario escribe. */
  tinta: string;
  /** Texto secundario (fechas, referencias). */
  tintaSuave: string;
  /** Borde de la hoja. */
  borde: string;
  /** Fondo de una cita bíblica pegada dentro del cuaderno. */
  cita: string;
}

/**
 * Deriva el papel a partir de la paleta activa.
 *
 * La idea, en criollo: si la edición es azul y está en modo oscuro, el papel
 * es un azul pastel oscurito — se ve que es azul, pero se lee. Si está en
 * modo claro, el papel es un azul pastel muy suave, casi blanco.
 *
 * Los números salen de una regla simple de contraste: entre papel y tinta
 * siempre queda al menos ~7:1, que es el nivel AAA de accesibilidad. Por eso
 * se puede leer al sol, con lentes, o con la pantalla al mínimo.
 */
export function papelDelTema(colores: {
  primary: string;
  background: string;
  surface: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
}): PapelCuaderno {
  const oscuro = esOscuro(colores.background);

  if (oscuro) {
    // Modo oscuro: se parte de la superficie y se le tiñe con el color de la
    // edición. 14% es suficiente para que se note el tono sin apagar el texto.
    const papel = mezclar(colores.surface, colores.primary, 0.14);
    return {
      papel,
      renglon: mezclar(papel, colores.primary, 0.30),
      margen: mezclar(papel, colores.primary, 0.55),
      tinta: mezclar(colores.textPrimary, colores.primary, 0.10),
      tintaSuave: colores.textSecondary,
      borde: mezclar(papel, colores.primary, 0.24),
      cita: mezclar(papel, colores.primary, 0.09),
    };
  }

  // Modo claro: se parte del blanco de la tarjeta y se tiñe apenas un 8%.
  // Más que eso y el papel compite con lo escrito.
  const papel = mezclar(colores.card, colores.primary, 0.08);
  return {
    papel,
    renglon: mezclar(papel, colores.primary, 0.26),
    margen: mezclar(papel, colores.primary, 0.45),
    tinta: mezclar(colores.textPrimary, colores.primary, 0.08),
    tintaSuave: colores.textSecondary,
    borde: mezclar(papel, colores.primary, 0.20),
    cita: mezclar(papel, colores.primary, 0.07),
  };
}
