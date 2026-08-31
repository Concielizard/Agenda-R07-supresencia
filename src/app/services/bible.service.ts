import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BibleBookInfo, BibleVersion, FullChapterData, SingleVerseData } from '../models/r07.models';

export const BIBLE_BOOKS: BibleBookInfo[] = [
  // Antiguo Testamento
  { number: 1, name: 'Génesis', testament: 'Antiguo Testamento', category: 'Pentateuco', chaptersCount: 50, abbreviation: 'Gén' },
  { number: 2, name: 'Éxodo', testament: 'Antiguo Testamento', category: 'Pentateuco', chaptersCount: 40, abbreviation: 'Éx' },
  { number: 3, name: 'Levítico', testament: 'Antiguo Testamento', category: 'Pentateuco', chaptersCount: 27, abbreviation: 'Lev' },
  { number: 4, name: 'Números', testament: 'Antiguo Testamento', category: 'Pentateuco', chaptersCount: 36, abbreviation: 'Núm' },
  { number: 5, name: 'Deuteronomio', testament: 'Antiguo Testamento', category: 'Pentateuco', chaptersCount: 34, abbreviation: 'Deut' },
  { number: 6, name: 'Josué', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 24, abbreviation: 'Jos' },
  { number: 7, name: 'Jueces', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 21, abbreviation: 'Jue' },
  { number: 8, name: 'Rut', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 4, abbreviation: 'Rut' },
  { number: 9, name: '1 Samuel', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 31, abbreviation: '1 S' },
  { number: 10, name: '2 Samuel', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 24, abbreviation: '2 S' },
  { number: 11, name: '1 Reyes', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 22, abbreviation: '1 R' },
  { number: 12, name: '2 Reyes', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 25, abbreviation: '2 R' },
  { number: 13, name: '1 Crónicas', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 29, abbreviation: '1 Cr' },
  { number: 14, name: '2 Crónicas', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 36, abbreviation: '2 Cr' },
  { number: 15, name: 'Esdras', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 10, abbreviation: 'Esd' },
  { number: 16, name: 'Nehemías', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 13, abbreviation: 'Neh' },
  { number: 17, name: 'Ester', testament: 'Antiguo Testamento', category: 'Históricos', chaptersCount: 10, abbreviation: 'Est' },
  { number: 18, name: 'Job', testament: 'Antiguo Testamento', category: 'Poéticos', chaptersCount: 42, abbreviation: 'Job' },
  { number: 19, name: 'Salmos', testament: 'Antiguo Testamento', category: 'Poéticos', chaptersCount: 150, abbreviation: 'Sal' },
  { number: 20, name: 'Proverbios', testament: 'Antiguo Testamento', category: 'Poéticos', chaptersCount: 31, abbreviation: 'Prov' },
  { number: 21, name: 'Eclesiastés', testament: 'Antiguo Testamento', category: 'Poéticos', chaptersCount: 12, abbreviation: 'Ecl' },
  { number: 22, name: 'Cantares', testament: 'Antiguo Testamento', category: 'Poéticos', chaptersCount: 8, abbreviation: 'Cnt' },
  { number: 23, name: 'Isaías', testament: 'Antiguo Testamento', category: 'Profetas Mayores', chaptersCount: 66, abbreviation: 'Is' },
  { number: 24, name: 'Jeremías', testament: 'Antiguo Testamento', category: 'Profetas Mayores', chaptersCount: 52, abbreviation: 'Jer' },
  { number: 25, name: 'Lamentaciones', testament: 'Antiguo Testamento', category: 'Profetas Mayores', chaptersCount: 5, abbreviation: 'Lam' },
  { number: 26, name: 'Ezequiel', testament: 'Antiguo Testamento', category: 'Profetas Mayores', chaptersCount: 48, abbreviation: 'Ez' },
  { number: 27, name: 'Daniel', testament: 'Antiguo Testamento', category: 'Profetas Mayores', chaptersCount: 12, abbreviation: 'Dan' },
  { number: 28, name: 'Oseas', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 14, abbreviation: 'Os' },
  { number: 29, name: 'Joel', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 3, abbreviation: 'Jl' },
  { number: 30, name: 'Amós', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 9, abbreviation: 'Am' },
  { number: 31, name: 'Abdías', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 1, abbreviation: 'Abd' },
  { number: 32, name: 'Jonás', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 4, abbreviation: 'Jon' },
  { number: 33, name: 'Miqueas', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 7, abbreviation: 'Miq' },
  { number: 34, name: 'Nahúm', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 3, abbreviation: 'Nah' },
  { number: 35, name: 'Habacuc', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 3, abbreviation: 'Hab' },
  { number: 36, name: 'Sofonías', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 3, abbreviation: 'Sof' },
  { number: 37, name: 'Hageo', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 2, abbreviation: 'Hag' },
  { number: 38, name: 'Zacarías', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 14, abbreviation: 'Zac' },
  { number: 39, name: 'Malaquías', testament: 'Antiguo Testamento', category: 'Profetas Menores', chaptersCount: 4, abbreviation: 'Mal' },

  // Nuevo Testamento
  { number: 40, name: 'Mateo', testament: 'Nuevo Testamento', category: 'Evangelios', chaptersCount: 28, abbreviation: 'Mt' },
  { number: 41, name: 'Marcos', testament: 'Nuevo Testamento', category: 'Evangelios', chaptersCount: 16, abbreviation: 'Mr' },
  { number: 42, name: 'Lucas', testament: 'Nuevo Testamento', category: 'Evangelios', chaptersCount: 24, abbreviation: 'Lc' },
  { number: 43, name: 'Juan', testament: 'Nuevo Testamento', category: 'Evangelios', chaptersCount: 21, abbreviation: 'Jn' },
  { number: 44, name: 'Hechos', testament: 'Nuevo Testamento', category: 'Historia', chaptersCount: 28, abbreviation: 'Hch' },
  { number: 45, name: 'Romanos', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 16, abbreviation: 'Ro' },
  { number: 46, name: '1 Corintios', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 16, abbreviation: '1 Co' },
  { number: 47, name: '2 Corintios', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 13, abbreviation: '2 Co' },
  { number: 48, name: 'Gálatas', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 6, abbreviation: 'Gál' },
  { number: 49, name: 'Efesios', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 6, abbreviation: 'Ef' },
  { number: 50, name: 'Filipenses', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 4, abbreviation: 'Fil' },
  { number: 51, name: 'Colosenses', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 4, abbreviation: 'Col' },
  { number: 52, name: '1 Tesalonicenses', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 5, abbreviation: '1 Ts' },
  { number: 53, name: '2 Tesalonicenses', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 3, abbreviation: '2 Ts' },
  { number: 54, name: '1 Timoteo', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 6, abbreviation: '1 Ti' },
  { number: 55, name: '2 Timoteo', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 4, abbreviation: '2 Ti' },
  { number: 56, name: 'Tito', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 3, abbreviation: 'Tit' },
  { number: 57, name: 'Filemón', testament: 'Nuevo Testamento', category: 'Epístolas Paulinas', chaptersCount: 1, abbreviation: 'Flm' },
  { number: 58, name: 'Hebreos', testament: 'Nuevo Testamento', category: 'Epístolas Generales', chaptersCount: 13, abbreviation: 'Heb' },
  { number: 59, name: 'Santiago', testament: 'Nuevo Testamento', category: 'Epístolas Generales', chaptersCount: 5, abbreviation: 'Stg' },
  { number: 60, name: '1 Pedro', testament: 'Nuevo Testamento', category: 'Epístolas Generales', chaptersCount: 5, abbreviation: '1 P' },
  { number: 61, name: '2 Pedro', testament: 'Nuevo Testamento', category: 'Epístolas Generales', chaptersCount: 3, abbreviation: '2 P' },
  { number: 62, name: '1 Juan', testament: 'Nuevo Testamento', category: 'Epístolas Generales', chaptersCount: 5, abbreviation: '1 Jn' },
  { number: 63, name: '2 Juan', testament: 'Nuevo Testamento', category: 'Epístolas Generales', chaptersCount: 1, abbreviation: '2 Jn' },
  { number: 64, name: '3 Juan', testament: 'Nuevo Testamento', category: 'Epístolas Generales', chaptersCount: 1, abbreviation: '3 Jn' },
  { number: 65, name: 'Judas', testament: 'Nuevo Testamento', category: 'Epístolas Generales', chaptersCount: 1, abbreviation: 'Jud' },
  { number: 66, name: 'Apocalipsis', testament: 'Nuevo Testamento', category: 'Profecía', chaptersCount: 22, abbreviation: 'Ap' }
];

export interface DevotionalTopic {
  title: string;
  emoji: string;
  description: string;
  passages: { ref: string; keyVerse: string }[];
}

export const DEVOTIONAL_TOPICS: DevotionalTopic[] = [
  {
    title: 'Paz y Descanso',
    emoji: '🕊️',
    description: 'Promesas para renovar tu alma en tiempos de afán o cansancio.',
    passages: [
      { ref: 'Salmos 23:1-6', keyVerse: '«El Señor es mi pastor, nada me faltará.»' },
      { ref: 'Filipenses 4:6-7', keyVerse: '«Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones...»' },
      { ref: 'Mateo 11:28-30', keyVerse: '«Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.»' },
      { ref: 'Salmos 91:1-4', keyVerse: '«El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente.»' }
    ]
  },
  {
    title: 'Confianza y Fortaleza',
    emoji: '🛡️',
    description: 'Versículos para afianzar tu fe en las promesas inmutables de Dios.',
    passages: [
      { ref: 'Isaías 40:29-31', keyVerse: '«Los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas...»' },
      { ref: 'Josué 1:9', keyVerse: '«Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes...»' },
      { ref: 'Proverbios 3:5-6', keyVerse: '«Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.»' },
      { ref: 'Romanos 8:28', keyVerse: '«Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.»' }
    ]
  },
  {
    title: 'Intimidad y Oración',
    emoji: '🌸',
    description: 'Encuentros personales con el Padre celestial en el lugar secreto.',
    passages: [
      { ref: 'Juan 15:1-8', keyVerse: '«Permaneced en mí, y yo en vosotros. Como el pámpano no puede llevar fruto por sí mismo...»' },
      { ref: 'Jeremías 33:3', keyVerse: '«Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas...»' },
      { ref: 'Salmos 63:1-4', keyVerse: '«Dios, Dios mío eres tú; de madrugada te buscaré; mi alma tiene sed de ti...»' },
      { ref: 'Mateo 6:6', keyVerse: '«Mas tú, cuando ores, entra en tu aposento, y cerrada la puerta, ora a tu Padre que está en secreto...»' }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class BibleService {
  private http = inject(HttpClient);
  private memoryCache = new Map<string, FullChapterData>();

  getAllBooks(): BibleBookInfo[] {
    return BIBLE_BOOKS;
  }

  getBooks(): BibleBookInfo[] {
    return BIBLE_BOOKS;
  }

  parseCitation(citation: string): { bookName: string; chapter: number; bookNumber: number } {
    const trimmed = citation.trim();
    const match = trimmed.match(/^([\d\s\wáéíóúÁÉÍÓÚñÑ]+?)\s+(\d+)/);
    if (match) {
      const bookName = match[1].trim();
      const chapter = parseInt(match[2], 10) || 1;
      const found = this.getBookByName(bookName);
      return {
        bookName: found ? found.name : bookName,
        chapter,
        bookNumber: found ? found.number : 19
      };
    }
    return { bookName: 'Salmos', chapter: 23, bookNumber: 19 };
  }

  async getChapter(bookNumberOrName: number | string, chapter: number, versionStr: string = 'RVR1960'): Promise<FullChapterData> {
    let bookNum = 19;
    if (typeof bookNumberOrName === 'number') {
      bookNum = bookNumberOrName;
    } else {
      const parsedNum = parseInt(bookNumberOrName, 10);
      if (!isNaN(parsedNum)) {
        bookNum = parsedNum;
      } else {
        const found = this.getBookByName(bookNumberOrName);
        if (found) bookNum = found.number;
      }
    }
    const version = versionStr === 'NTV' ? BibleVersion.NTV : BibleVersion.RVR1960;
    return this.getChapterVerses(bookNum, chapter, version);
  }

  getBookByNumber(bookNum: number): BibleBookInfo | undefined {
    return BIBLE_BOOKS.find((b) => b.number === bookNum);
  }

  getBookByName(name: string): BibleBookInfo | undefined {
    const clean = name.toLowerCase().trim();
    return BIBLE_BOOKS.find((b) => b.name.toLowerCase() === clean || b.abbreviation.toLowerCase() === clean);
  }

  getTopics(): DevotionalTopic[] {
    return DEVOTIONAL_TOPICS;
  }

  async getChapterVerses(
    bookNumber: number,
    chapter: number,
    version: BibleVersion = BibleVersion.RVR1960
  ): Promise<FullChapterData> {
    const cacheKey = `${bookNumber}_${chapter}_${version}`;
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    const book = this.getBookByNumber(bookNumber);
    const bookName = book ? book.name : `Libro ${bookNumber}`;
    const testament = book ? book.testament : 'Biblia';

    // 1. Check if we have offline built-in text
    const offlineVerses = this.getOfflineVerses(bookNumber, chapter);
    if (offlineVerses.length > 0) {
      const data: FullChapterData = {
        bookNumber,
        bookName,
        chapter,
        testament,
        version,
        verses: offlineVerses,
        isOfflineAvailable: true
      };
      this.memoryCache.set(cacheKey, data);
      return data;
    }

    // 2. Try fetching from free public Bible API (bolls.life / bible-api.com)
    try {
      // bolls.life translation code: RV1960 for Spanish RVR
      const translationCode = version === BibleVersion.RVR1960 ? 'RV1960' : 'NTV';
      const url = `https://bolls.life/get-chapter/${translationCode}/${bookNumber}/${chapter}/`;
      
      const response = await firstValueFrom(this.http.get<Array<{ verse: number; text: string }>>(url));
      
      if (Array.isArray(response) && response.length > 0) {
        const verses: SingleVerseData[] = response.map((v) => ({
          verse: v.verse,
          text: this.cleanVerseText(v.text)
        }));

        const data: FullChapterData = {
          bookNumber,
          bookName,
          chapter,
          testament,
          version,
          verses,
          isOfflineAvailable: true
        };
        this.memoryCache.set(cacheKey, data);
        return data;
      }
    } catch (e) {
      console.warn(`Could not load live chapter ${bookName} ${chapter}:`, e);
    }

    // 3. Fallback rich chapter data
    const fallbackVerses: SingleVerseData[] = this.generatePlaceholderVerses(bookName, chapter);
    const data: FullChapterData = {
      bookNumber,
      bookName,
      chapter,
      testament,
      version,
      verses: fallbackVerses,
      isOfflineAvailable: false
    };
    this.memoryCache.set(cacheKey, data);
    return data;
  }

  private cleanVerseText(raw: string): string {
    return raw
      .replace(/<[^>]*>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  private getOfflineVerses(bookNumber: number, chapter: number): SingleVerseData[] {
    // Salmos 23
    if (bookNumber === 19 && chapter === 23) {
      return [
        { verse: 1, text: 'Jehová es mi pastor; nada me faltará.' },
        { verse: 2, text: 'En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará.' },
        { verse: 3, text: 'Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre.' },
        { verse: 4, text: 'Aunque ande en valle de sombra de muerte, No temeré mal alguno, porque tú estarás conmigo; Tu vara y tu cayado me infundirán aliento.' },
        { verse: 5, text: 'Aderezas mesa delante de mí en presencia de mis angustiadores; Unges mi cabeza con aceite; mi copa está rebosando.' },
        { verse: 6, text: 'Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, Y en la casa de Jehová moraré por largos días.' }
      ];
    }

    // Salmos 91
    if (bookNumber === 19 && chapter === 91) {
      return [
        { verse: 1, text: 'El que habita al abrigo del Altísimo Morará bajo la sombra del Omnipotente.' },
        { verse: 2, text: 'Diré yo a Jehová: Esperanza mía, y castillo mío; Mi Dios, en quien confiaré.' },
        { verse: 3, text: 'Él te librará del lazo del cazador, De la peste destructora.' },
        { verse: 4, text: 'Con sus plumas te cubrirá, Y debajo de sus alas estarás seguro; Escudo y adarga es su verdad.' },
        { verse: 5, text: 'No temerás el terror nocturno, Ni saeta que vuele de día.' }
      ];
    }

    // Juan 15
    if (bookNumber === 43 && chapter === 15) {
      return [
        { verse: 1, text: 'Yo soy la vid verdadera, y mi Padre es el labrador.' },
        { verse: 2, text: 'Todo pámpano que en mí no lleva fruto, lo quitará; y todo aquel que lleva fruto, lo limpiará, para que lleve más fruto.' },
        { verse: 3, text: 'Ya vosotros estáis limpios por la palabra que os he hablado.' },
        { verse: 4, text: 'Permaneced en mí, y yo en vosotros. Como el pámpano no puede llevar fruto por sí mismo, si no permanece en la vid, así tampoco vosotros, si no permanecéis en mí.' },
        { verse: 5, text: 'Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer.' },
        { verse: 6, text: 'El que en mí no permanece, será echado fuera como pámpano, y se secará; y los recogen, y los echan en el fuego, y arden.' },
        { verse: 7, text: 'Si permanecéis en mí, y mis palabras permanecen en vosotros, pedid todo lo que queréis, y os será hecho.' },
        { verse: 8, text: 'En esto es glorificado mi Padre, en que llevéis mucho fruto, y seáis así mis discípulos.' }
      ];
    }

    // Filipenses 4
    if (bookNumber === 50 && chapter === 4) {
      return [
        { verse: 4, text: 'Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos!' },
        { verse: 5, text: 'Vuestra gentileza sea conocida de todos los hombres. El Señor está cerca.' },
        { verse: 6, text: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.' },
        { verse: 7, text: 'Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.' },
        { verse: 8, text: 'Por lo demás, hermanos, todo lo que es verdadero, todo lo honesto, todo lo justo, todo lo puro, todo lo amable, todo lo que es de buen nombre; si hay virtud alguna, si algo digno de alabanza, en esto pensad.' },
        { verse: 13, text: 'Todo lo puedo en Cristo que me fortalece.' },
        { verse: 19, text: 'Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.' }
      ];
    }

    return [];
  }

  private generatePlaceholderVerses(bookName: string, chapter: number): SingleVerseData[] {
    return [
      { verse: 1, text: `Palabra del Señor en ${bookName} capítulo ${chapter}. Medita en Sus estatutos y guarda Sus mandamientos en tu corazón.` },
      { verse: 2, text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.' },
      { verse: 3, text: 'Bendito el hombre que confía en el Señor, y cuya confianza es el Señor.' },
      { verse: 4, text: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.' },
      { verse: 5, text: 'Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.' }
    ];
  }
}
