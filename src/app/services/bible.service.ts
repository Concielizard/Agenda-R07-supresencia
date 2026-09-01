import { Injectable } from '@angular/core';

export interface BibleBook {
  name: string;
  testament: 'Antiguo' | 'Nuevo';
  chapters: number;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Antiguo Testamento
  { name: 'Génesis', testament: 'Antiguo', chapters: 50 },
  { name: 'Éxodo', testament: 'Antiguo', chapters: 40 },
  { name: 'Levítico', testament: 'Antiguo', chapters: 27 },
  { name: 'Números', testament: 'Antiguo', chapters: 36 },
  { name: 'Deuteronomio', testament: 'Antiguo', chapters: 34 },
  { name: 'Josué', testament: 'Antiguo', chapters: 24 },
  { name: 'Jueces', testament: 'Antiguo', chapters: 21 },
  { name: 'Rut', testament: 'Antiguo', chapters: 4 },
  { name: '1 Samuel', testament: 'Antiguo', chapters: 31 },
  { name: '2 Samuel', testament: 'Antiguo', chapters: 24 },
  { name: '1 Reyes', testament: 'Antiguo', chapters: 22 },
  { name: '2 Reyes', testament: 'Antiguo', chapters: 25 },
  { name: '1 Crónicas', testament: 'Antiguo', chapters: 29 },
  { name: '2 Crónicas', testament: 'Antiguo', chapters: 36 },
  { name: 'Esdras', testament: 'Antiguo', chapters: 10 },
  { name: 'Nehemías', testament: 'Antiguo', chapters: 13 },
  { name: 'Ester', testament: 'Antiguo', chapters: 10 },
  { name: 'Job', testament: 'Antiguo', chapters: 42 },
  { name: 'Salmos', testament: 'Antiguo', chapters: 150 },
  { name: 'Proverbios', testament: 'Antiguo', chapters: 31 },
  { name: 'Eclesiastés', testament: 'Antiguo', chapters: 12 },
  { name: 'Cantares', testament: 'Antiguo', chapters: 8 },
  { name: 'Isaías', testament: 'Antiguo', chapters: 66 },
  { name: 'Jeremías', testament: 'Antiguo', chapters: 52 },
  { name: 'Lamentaciones', testament: 'Antiguo', chapters: 5 },
  { name: 'Ezequiel', testament: 'Antiguo', chapters: 48 },
  { name: 'Daniel', testament: 'Antiguo', chapters: 12 },
  { name: 'Oseas', testament: 'Antiguo', chapters: 14 },
  { name: 'Joel', testament: 'Antiguo', chapters: 3 },
  { name: 'Amós', testament: 'Antiguo', chapters: 9 },
  { name: 'Abdías', testament: 'Antiguo', chapters: 1 },
  { name: 'Jonás', testament: 'Antiguo', chapters: 4 },
  { name: 'Miqueas', testament: 'Antiguo', chapters: 7 },
  { name: 'Nahúm', testament: 'Antiguo', chapters: 3 },
  { name: 'Habacuc', testament: 'Antiguo', chapters: 3 },
  { name: 'Sofonías', testament: 'Antiguo', chapters: 3 },
  { name: 'Hageo', testament: 'Antiguo', chapters: 2 },
  { name: 'Zacarías', testament: 'Antiguo', chapters: 14 },
  { name: 'Malaquías', testament: 'Antiguo', chapters: 4 },
  // Nuevo Testamento
  { name: 'Mateo', testament: 'Nuevo', chapters: 28 },
  { name: 'Marcos', testament: 'Nuevo', chapters: 16 },
  { name: 'Lucas', testament: 'Nuevo', chapters: 24 },
  { name: 'Juan', testament: 'Nuevo', chapters: 21 },
  { name: 'Hechos', testament: 'Nuevo', chapters: 28 },
  { name: 'Romanos', testament: 'Nuevo', chapters: 16 },
  { name: '1 Corintios', testament: 'Nuevo', chapters: 16 },
  { name: '2 Corintios', testament: 'Nuevo', chapters: 13 },
  { name: 'Gálatas', testament: 'Nuevo', chapters: 6 },
  { name: 'Efesios', testament: 'Nuevo', chapters: 6 },
  { name: 'Filipenses', testament: 'Nuevo', chapters: 4 },
  { name: 'Colosenses', testament: 'Nuevo', chapters: 4 },
  { name: '1 Tesalonicenses', testament: 'Nuevo', chapters: 5 },
  { name: '2 Tesalonicenses', testament: 'Nuevo', chapters: 3 },
  { name: '1 Timoteo', testament: 'Nuevo', chapters: 6 },
  { name: '2 Timoteo', testament: 'Nuevo', chapters: 4 },
  { name: 'Tito', testament: 'Nuevo', chapters: 3 },
  { name: 'Filemón', testament: 'Nuevo', chapters: 1 },
  { name: 'Hebreos', testament: 'Nuevo', chapters: 13 },
  { name: 'Santiago', testament: 'Nuevo', chapters: 5 },
  { name: '1 Pedro', testament: 'Nuevo', chapters: 5 },
  { name: '2 Pedro', testament: 'Nuevo', chapters: 3 },
  { name: '1 Juan', testament: 'Nuevo', chapters: 5 },
  { name: '2 Juan', testament: 'Nuevo', chapters: 1 },
  { name: '3 Juan', testament: 'Nuevo', chapters: 1 },
  { name: 'Judas', testament: 'Nuevo', chapters: 1 },
  { name: 'Apocalipsis', testament: 'Nuevo', chapters: 22 }
];

const FAMOUS_PASSAGES: Record<string, string> = {
  'Salmos 23': '1 Jehová es mi pastor; nada me faltará. 2 En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará. 3 Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre. 4 Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo; tu vara y tu cayado me infundirán aliento. 5 Aderezas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa está rebosando. 6 Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa de Jehová moraré por largos días.',
  'Salmos 91': '1 El que habita al abrigo del Altísimo Morará bajo la sombra del Omnipotente. 2 Diré yo a Jehová: Esperanza mía, y castillo mío; Mi Dios, en quien confiaré. 3 Él te librará del lazo del cazador, De la peste destructora. 4 Con sus plumas te cubrirá, Y debajo de sus alas estarás seguro; Escudo y adarga es su verdad.',
  'Juan 15': '1 Yo soy la vid verdadera, y mi Padre es el labrador. 2 Todo pámpano que en mí no lleva fruto, lo quitará; y todo aquel que lleva fruto, lo limpiará, para que lleve más fruto. 3 Ya vosotros estáis limpios por la palabra que os he hablado. 4 Permaneced en mí, y yo en vosotros. Como el pámpano no puede llevar fruto por sí mismo, si no permanece en la vid, así tampoco vosotros, si no permanecéis en mí. 5 Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer.',
  'Filipenses 4': '4 Regocijaos en el Señor siempre. Otra vez digo: ¡Regocijaos! 5 Vuestra gentileza sea conocida de todos los hombres. El Señor está cerca. 6 Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias. 7 Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.',
  'Romanos 8': '28 Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados. 31 ¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros? 37 Antes, en todas estas cosas somos más que vencedores por medio de aquel que nos amó. 38 Por lo cual estoy seguro de que ni la muerte, ni la vida, ni ángeles, ni principados... nos podrá separar del amor de Dios.',
  'Isaías 40': '28 ¿No has sabido, no has oído que el Dios eterno es Jehová, el cual creó los confines de la tierra? No desfallece, ni se fatiga con cansancio, y su entendimiento no hay quien lo alcance. 29 Él da esfuerzo al cansado, y multiplica las fuerzas al que no tiene ningunas. 31 pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.'
};

@Injectable({
  providedIn: 'root'
})
export class BibleService {
  public getBooks(): BibleBook[] {
    return BIBLE_BOOKS;
  }

  public getChaptersCount(bookName: string): number {
    const book = BIBLE_BOOKS.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    return book ? book.chapters : 1;
  }

  public getPassageText(book: string, chapter: number): string | null {
    const key = `${book} ${chapter}`;
    return FAMOUS_PASSAGES[key] || null;
  }

  public getSuggestedDailyReadings(): { book: string; chapter: number; verses: string; theme: string }[] {
    return [
      { book: 'Salmos', chapter: 23, verses: '1-6', theme: 'Confianza y provisión en el Buen Pastor' },
      { book: 'Juan', chapter: 15, verses: '1-11', theme: 'Permanecer en la Vid Verdadera' },
      { book: 'Filipenses', chapter: 4, verses: '4-9', theme: 'Paz que sobrepasa todo entendimiento' },
      { book: 'Romanos', chapter: 8, verses: '31-39', theme: 'Más que vencedores en Cristo Jesús' },
      { book: 'Efesios', chapter: 6, verses: '10-18', theme: 'La armadura espiritual de Dios' },
      { book: 'Isaías', chapter: 40, verses: '28-31', theme: 'Nuevas fuerzas para los que esperan en Dios' },
      { book: 'Josué', chapter: 1, verses: '5-9', theme: 'Esfuérzate, sé valiente y medita en la Ley' }
    ];
  }
}
