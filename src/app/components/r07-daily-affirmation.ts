import { Component, inject, computed, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';
import { R07DayEntryEntity } from '../models/r07.models';

export interface DailyAffirmationItem {
  id: string;
  dayNumber: number; // 1 to 7
  dayName: string;
  category: string;
  icon: string;
  affirmation: string;
  verseText: string;
  scriptureRef: string;
  reflectionPrompt: string;
}

export const DAILY_AFFIRMATIONS_DATA: Record<number, DailyAffirmationItem[]> = {
  1: [ // Lunes / Day 1
    {
      id: 'mon-1',
      dayNumber: 1,
      dayName: 'Lunes',
      category: 'Nuevos Comienzos & Gracia',
      icon: 'wb_sunny',
      affirmation: 'Comienzo esta semana con la certeza de que Dios ya abrió caminos de paz y propósito para mí. Sus misericordias se renuevan en esta mañana y Su favor me rodea como un escudo.',
      verseText: 'Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.',
      scriptureRef: 'Lamentaciones 3:22-23',
      reflectionPrompt: '¿Qué carga del pasado decides soltar hoy para abrazar la nueva gracia que Dios tiene para tu semana?'
    },
    {
      id: 'mon-2',
      dayNumber: 1,
      dayName: 'Lunes',
      category: 'Dirección Divina',
      icon: 'explore',
      affirmation: 'No camino en incertidumbre ni con temor; el Espíritu Santo guía cada uno de mis pasos, mis decisiones y mis conversaciones en este nuevo día.',
      verseText: 'He aquí que yo hago cosa nueva; pronto saldrá a luz; ¿no la conoceréis? Otra vez abriré camino en el desierto, y ríos en la soledad.',
      scriptureRef: 'Isaías 43:19',
      reflectionPrompt: 'Declara que Dios tiene el control de tu agenda y tus proyectos en este inicio de semana.'
    }
  ],
  2: [ // Martes / Day 2
    {
      id: 'tue-1',
      dayNumber: 2,
      dayName: 'Martes',
      category: 'Fortaleza & Valentía',
      icon: 'shield',
      affirmation: 'No hay desafío que pueda derribarme hoy, porque mi fuerza no proviene de mis capacidades humanas sino del Dios todopoderoso que habita en mí.',
      verseText: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
      scriptureRef: 'Josué 1:9',
      reflectionPrompt: 'Frente a qué situación de hoy necesitas recordar que Dios está a tu lado con poder invencible.'
    },
    {
      id: 'tue-2',
      dayNumber: 2,
      dayName: 'Martes',
      category: 'Victoria en Cristo',
      icon: 'military_tech',
      affirmation: 'En cada batalla y tarea del día soy más que vencedora por medio de Aquel que me amó. Ninguna arma forjada contra mi paz prosperará.',
      verseText: 'Antes, en todas estas cosas somos más que vencedores por medio de aquel que nos amó.',
      scriptureRef: 'Romanos 8:37',
      reflectionPrompt: 'Afirma tu identidad de victoria sobre la ansiedad, la duda o el desánimo.'
    }
  ],
  3: [ // Miércoles / Day 3
    {
      id: 'wed-1',
      dayNumber: 3,
      dayName: 'Miércoles',
      category: 'Paz & Descanso en Dios',
      icon: 'spa',
      affirmation: 'El Señor es mi Pastor y nada me faltará. Hoy elijo descansar en Su perfecta provisión; Su paz, que sobrepasa todo entendimiento, guarda mi corazón y mis pensamientos.',
      verseText: 'Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará. Confortará mi alma.',
      scriptureRef: 'Salmos 23:1-3',
      reflectionPrompt: 'Respira profundo y entrega en oración aquello que hoy te ha estado robando la quietud.'
    },
    {
      id: 'wed-2',
      dayNumber: 3,
      dayName: 'Miércoles',
      category: 'Confianza Serena',
      icon: 'volunteer_activism',
      affirmation: 'Por nada estoy afanada. En toda circunstancia presento mis peticiones ante mi Padre Celestial con acción de gracias, y descanso en Su cuidado.',
      verseText: 'Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.',
      scriptureRef: 'Filipenses 4:6',
      reflectionPrompt: 'Transforma una preocupación en una oración de gratitud por lo que Dios ya está haciendo.'
    }
  ],
  4: [ // Jueves / Day 4
    {
      id: 'thu-1',
      dayNumber: 4,
      dayName: 'Jueves',
      category: 'Sabiduría & Propósito',
      icon: 'lightbulb',
      affirmation: 'Confío en el Señor con todo mi corazón y no me apoyo en mi propia prudencia. Reconozco a Dios en todos mis caminos y Él endereza mis veredas con sabiduría celestial.',
      verseText: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
      scriptureRef: 'Proverbios 3:5-6',
      reflectionPrompt: 'Pide al Espíritu Santo claridad y discernimiento para las decisiones clave de esta jornada.'
    },
    {
      id: 'thu-2',
      dayNumber: 4,
      dayName: 'Jueves',
      category: 'Planes de Bienestar',
      icon: 'insights',
      affirmation: 'Dios tiene planes de bien, de esperanza y de un futuro bendecido para mi vida y mi familia. Ningún propósito de Dios para mí se frustrará.',
      verseText: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
      scriptureRef: 'Jeremías 29:11',
      reflectionPrompt: 'Medita en la fidelidad de Dios al guiar tu destino hacia Su buena voluntad.'
    }
  ],
  5: [ // Viernes / Day 5
    {
      id: 'fri-1',
      dayNumber: 5,
      dayName: 'Viernes',
      category: 'Gozo & Fructificación',
      icon: 'auto_stories',
      affirmation: 'Permanezco unida a la Vid verdadera, que es Cristo. Su gozo es mi fortaleza constante y todo lo que emprenda bajo Su dirección dará fruto abundante y duradero.',
      verseText: 'Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer.',
      scriptureRef: 'Juan 15:5',
      reflectionPrompt: 'Agradece por los frutos y aprendizajes que Dios te ha permitido cosechar a lo largo de esta semana.'
    },
    {
      id: 'fri-2',
      dayNumber: 5,
      dayName: 'Viernes',
      category: 'El Gozo del Señor',
      icon: 'celebration',
      affirmation: 'El gozo del Señor es mi escudo y mi motor. Termino esta semana con gratitud, alegría en el corazón y alabanza en mis labios por Su bondad inagotable.',
      verseText: 'No os entristezcáis, porque el gozo de Jehová es vuestra fuerza.',
      scriptureRef: 'Nehemías 8:10',
      reflectionPrompt: '¿Qué testimonio o bendición de esta semana te llena de mayor alegría y gratitud?'
    }
  ],
  6: [ // Sábado / Day 6
    {
      id: 'sat-1',
      dayNumber: 6,
      dayName: 'Sábado',
      category: 'Renovación & Restauración',
      icon: 'nature_people',
      affirmation: 'Al esperar en el Señor, mis fuerzas físicas, mentales y espirituales son completamente renovadas. Levanto alas como las águilas, corro sin cansarme y camino en Su plenitud.',
      verseText: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigará.',
      scriptureRef: 'Isaías 40:31',
      reflectionPrompt: 'Toma este día para descansar en el amor del Padre, nutriendo tu espíritu y reconectando con los tuyos.'
    },
    {
      id: 'sat-2',
      dayNumber: 6,
      dayName: 'Sábado',
      category: 'Hogar & Bendición Familiar',
      icon: 'home',
      affirmation: 'Mi casa, mi familia y yo decidimos servir al Señor de todo corazón. Su paz y Su presencia habitan en nuestro hogar y nos cubren en todo momento.',
      verseText: 'Pero yo y mi casa serviremos a Jehová.',
      scriptureRef: 'Josué 24:15',
      reflectionPrompt: 'Bendice tu hogar y a tus seres queridos declarando la protección y el amor de Dios sobre ellos.'
    }
  ],
  7: [ // Domingo / Day 7
    {
      id: 'sun-1',
      dayNumber: 7,
      dayName: 'Domingo',
      category: 'Adoración, Gracia & Victoria',
      icon: 'church',
      affirmation: 'Este es el día que hizo el Señor; me gozo, me alegro y celebro Su majestad en la congregación de los santos. Mi corazón rebosa de adoración a Aquel que vive para siempre.',
      verseText: 'Este es el día que hizo Jehová; nos gozaremos y alegraremos en él. Entrad por sus puertas con acción de gracias, por sus atrios con alabanza.',
      scriptureRef: 'Salmos 118:24 & Salmos 100:4',
      reflectionPrompt: 'Prepárate para adorar a Dios hoy en comunidad con un corazón abierto y expectante por Su Palabra.'
    },
    {
      id: 'sun-2',
      dayNumber: 7,
      dayName: 'Domingo',
      category: 'Amor Inquebrantable',
      icon: 'favorite',
      affirmation: 'Nada ni nadie podrá jamás separarme del amor de Dios que es en Cristo Jesús. Inicio mi reposo y adoración sabiendo que estoy eternamente segura en Sus brazos.',
      verseText: 'Por lo cual estoy seguro de que ni la muerte, ni la vida... ni ninguna otra cosa creada nos podrá separar del amor de Dios, que es en Cristo Jesús Señor nuestro.',
      scriptureRef: 'Romanos 8:38-39',
      reflectionPrompt: 'Rinde tu adoración más profunda y sincera a Dios por Su sacrificio y amor eterno.'
    }
  ]
};

@Component({
  selector: 'app-r07-daily-affirmation',
  imports: [CommonModule],
  template: `
    @if (currentAffirmation()) {
      <div
        id="r07-daily-affirmation-card"
        class="relative overflow-hidden rounded-2xl p-5 md:p-6 border transition-all duration-300 shadow-xs"
        [style.backgroundColor]="colors.background"
        [style.borderColor]="colors.border">
        
        <!-- Decorative subtle background gradient halo -->
        <div
          class="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl pointer-events-none opacity-20"
          [style.backgroundColor]="colors.primary">
        </div>

        <!-- Header: Badge & Controls -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3.5 relative z-10">
          
          <!-- Affirmation Badge -->
          <div class="flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-inner shrink-0"
              [style.backgroundColor]="colors.primaryLight"
              [style.color]="colors.primary">
              <span class="mat-icon text-base">{{ currentAffirmation()?.icon || 'auto_awesome' }}</span>
            </span>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold uppercase tracking-wider" [style.color]="colors.primary">
                  Afirmación del Día • {{ currentAffirmation()?.dayName }}
                </span>
                <span
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                  [style.backgroundColor]="colors.surface"
                  [style.borderColor]="colors.border"
                  [style.color]="colors.textSecondary">
                  {{ currentAffirmation()?.category }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-1.5 flex-wrap">
            
            <!-- Cycle/Next Affirmation Button -->
            <button
              id="btn-cycle-affirmation"
              type="button"
              (click)="cycleAffirmation()"
              class="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
              [style.borderColor]="colors.border"
              [style.color]="colors.textSecondary"
              title="Ver otra afirmación para este día">
              <span class="mat-icon text-sm">cached</span>
              <span class="hidden sm:inline">Otra Afirmación</span>
            </button>

            <!-- Read Aloud Speech Button -->
            <button
              id="btn-speak-affirmation"
              type="button"
              (click)="toggleSpeech()"
              class="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
              [style.borderColor]="colors.border"
              [style.color]="isSpeaking() ? colors.primary : colors.textSecondary"
              [title]="isSpeaking() ? 'Detener lectura' : 'Escuchar afirmación'">
              <span class="mat-icon text-sm">{{ isSpeaking() ? 'volume_off' : 'volume_up' }}</span>
              <span class="hidden sm:inline">{{ isSpeaking() ? 'Pausar' : 'Escuchar' }}</span>
            </button>

            <!-- Copy to Clipboard -->
            <button
              id="btn-copy-affirmation"
              type="button"
              (click)="copyAffirmation()"
              class="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
              [style.borderColor]="colors.border"
              [style.color]="copied() ? '#059669' : colors.textSecondary"
              title="Copiar afirmación y versículo">
              <span class="mat-icon text-sm">{{ copied() ? 'check' : 'content_copy' }}</span>
              <span>{{ copied() ? 'Copiado' : 'Copiar' }}</span>
            </button>

          </div>

        </div>

        <!-- Main Affirmation Text Box -->
        <div class="relative z-10 space-y-3">
          
          <!-- Faith Declaration Statement -->
          <div class="relative pl-3 border-l-2" [style.borderColor]="colors.primary">
            <p
              id="daily-affirmation-statement"
              class="text-base sm:text-lg font-medium leading-relaxed italic"
              [style.color]="colors.textPrimary">
              «{{ currentAffirmation()?.affirmation }}»
            </p>
          </div>

          <!-- Scripture Anchor Banner -->
          <div
            id="daily-affirmation-scripture-box"
            class="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-relaxed"
            [style.backgroundColor]="colors.surface"
            [style.borderColor]="colors.border">
            
            <div class="flex items-start gap-2 flex-1">
              <span class="mat-icon text-base shrink-0 mt-0.5" [style.color]="colors.primary">menu_book</span>
              <div>
                <p class="font-normal" [style.color]="colors.textSecondary">
                  "{{ currentAffirmation()?.verseText }}"
                </p>
                <span class="font-bold inline-block mt-1" [style.color]="colors.primary">
                  — {{ currentAffirmation()?.scriptureRef }}
                </span>
              </div>
            </div>

            <!-- Quick Apply to Journal Actions -->
            <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
              
              <!-- Apply to Reflection -->
              <button
                id="btn-apply-to-reflection"
                type="button"
                (click)="applyToReflection()"
                class="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
                [style.borderColor]="colors.border"
                [style.color]="colors.textPrimary"
                title="Insertar esta afirmación en tu reflexión del día">
                <span class="mat-icon text-xs">edit_note</span>
                <span>Usar en Reflexión</span>
              </button>

              <!-- Apply to Prayer -->
              <button
                id="btn-apply-to-prayer"
                type="button"
                (click)="applyToPrayer()"
                class="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-white shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                [style.backgroundColor]="colors.primary"
                title="Convertir esta afirmación en tu oración del día">
                <span class="mat-icon text-xs">favorite</span>
                <span>Usar en Oración</span>
              </button>

            </div>

          </div>

          <!-- Micro Reflection Prompt -->
          @if (currentAffirmation()?.reflectionPrompt) {
            <div class="flex items-center gap-2 text-xs pt-1 px-1" [style.color]="colors.textMuted">
              <span class="mat-icon text-sm" [style.color]="colors.primary">tips_and_updates</span>
              <span class="italic font-medium">
                Punto de meditación: {{ currentAffirmation()?.reflectionPrompt }}
              </span>
            </div>
          }

        </div>

      </div>
    }
  `
})
export class R07DailyAffirmation {
  storage = inject(R07StorageService);

  // Input for current active day entry
  day = input<R07DayEntryEntity | undefined>();

  // Output events to append to parent journal fields
  onApplyReflection = output<string>();
  onApplyPrayer = output<string>();

  copied = signal<boolean>(false);
  isSpeaking = signal<boolean>(false);
  currentIndex = signal<number>(0);

  get colors() {
    return this.storage.currentThemeColors();
  }

  // Determine current day affirmations based on dayNumber (1 to 7)
  dayNumber = computed(() => {
    return this.day()?.dayNumber || this.storage.selectedDayNumber() || 1;
  });

  affirmationsForDay = computed<DailyAffirmationItem[]>(() => {
    const dayNum = this.dayNumber();
    const list = DAILY_AFFIRMATIONS_DATA[dayNum] || DAILY_AFFIRMATIONS_DATA[1];
    return list;
  });

  currentAffirmation = computed<DailyAffirmationItem | null>(() => {
    const list = this.affirmationsForDay();
    if (!list || list.length === 0) return null;
    const idx = this.currentIndex() % list.length;
    return list[idx] || list[0];
  });

  cycleAffirmation(): void {
    const list = this.affirmationsForDay();
    if (list.length > 1) {
      this.currentIndex.update((prev) => (prev + 1) % list.length);
      this.storage.showSnackbar('Afirmación actualizada.');
    } else {
      this.storage.showSnackbar('Afirmación del día cargada.');
    }
  }

  copyAffirmation(): void {
    const item = this.currentAffirmation();
    if (!item) return;

    const fullText = `🌸 Afirmación del Día (${item.dayName} - ${item.category}):\n"${item.affirmation}"\n\n📖 ${item.verseText} (${item.scriptureRef})\n— R07 Pasa tiempo Conmigo`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullText).then(() => {
        this.copied.set(true);
        this.storage.showSnackbar('¡Afirmación bíblica copiada al portapapeles!');
        setTimeout(() => this.copied.set(false), 2500);
      }).catch(() => {
        this.fallbackCopy(fullText);
      });
    } else {
      this.fallbackCopy(fullText);
    }
  }

  private fallbackCopy(text: string): void {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      this.copied.set(true);
      this.storage.showSnackbar('¡Afirmación bíblica copiada al portapapeles!');
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      this.storage.showSnackbar('No se pudo copiar.');
    } finally {
      document.body.removeChild(el);
    }
  }

  toggleSpeech(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.storage.showSnackbar('Audio no soportado en este navegador.');
      return;
    }

    if (this.isSpeaking()) {
      window.speechSynthesis.cancel();
      this.isSpeaking.set(false);
      return;
    }

    const item = this.currentAffirmation();
    if (!item) return;

    window.speechSynthesis.cancel();
    const utteranceText = `Afirmación del día. ${item.affirmation}. Versículo bíblico: ${item.verseText}. ${item.scriptureRef}.`;
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;

    utterance.onend = () => {
      this.isSpeaking.set(false);
    };
    utterance.onerror = () => {
      this.isSpeaking.set(false);
    };

    this.isSpeaking.set(true);
    window.speechSynthesis.speak(utterance);
  }

  applyToReflection(): void {
    const item = this.currentAffirmation();
    if (!item) return;
    const textToInsert = `Declaración de Fe: ${item.affirmation} (${item.scriptureRef})`;
    this.onApplyReflection.emit(textToInsert);
    this.storage.showSnackbar('Afirmación añadida a tu reflexión del día.');
  }

  applyToPrayer(): void {
    const item = this.currentAffirmation();
    if (!item) return;
    const prayerSnippet = `Señor, hoy declaro y confieso: ${item.affirmation}. Gracias por Tu fidelidad revelada en ${item.scriptureRef}. Amén.`;
    this.onApplyPrayer.emit(prayerSnippet);
    this.storage.showSnackbar('Afirmación convertida en tu clamor del día.');
  }
}
