import { Component, ChangeDetectionStrategy, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { R07StorageService } from '../services/r07-storage.service';
import { R07WeeklyTable } from './r07-weekly-table';
import { R07WeeklyGoals } from './r07-weekly-goals';

interface DevotionalPlan {
  title: string;
  tag: string;
  duration: string;
  description: string;
  verseRef: string;
  icon: string;
}

@Component({
  selector: 'app-r07-explore-tab',
  imports: [CommonModule, R07WeeklyTable, R07WeeklyGoals],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      
      <!-- Banner / Header -->
      <div class="p-6 rounded-3xl border shadow-xs space-y-2 relative overflow-hidden"
           [style.backgroundColor]="colors.surface"
           [style.borderColor]="colors.border">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                [style.backgroundColor]="colors.primaryLight"
                [style.color]="colors.primary">
            Explorar & Crecimiento
          </span>
          <span class="text-2xl">{{ storage.logoSymbolIcon() }}</span>
        </div>
        <h2 class="text-lg sm:text-xl font-bold tracking-tight">
          Planes Devocionales, Metas y Resumen Semanal
        </h2>
        <p class="text-xs sm:text-sm max-w-xl" [style.color]="colors.textSecondary">
          Herramientas para profundizar en el método R07, evaluar tu semana con tu líder y exportar tus avances.
        </p>
      </div>

      <!-- Section 1: Featured Devotional Plans -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider" [style.color]="colors.primary">
            Planes de Lectura y Oración
          </h3>
          <span class="text-xs" [style.color]="colors.textMuted">Disponibles</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          @for (plan of plans; track plan.title) {
            <div class="p-4 rounded-2xl border shadow-2xs space-y-2.5 flex flex-col justify-between transition hover:shadow-md"
                 [style.backgroundColor]="colors.surface"
                 [style.borderColor]="colors.border">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-xl">{{ plan.icon }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        [style.backgroundColor]="colors.primaryLight"
                        [style.color]="colors.primary">
                    {{ plan.duration }}
                  </span>
                </div>
                <h4 class="font-bold text-sm">{{ plan.title }}</h4>
                <p class="text-xs leading-relaxed" [style.color]="colors.textSecondary">
                  {{ plan.description }}
                </p>
              </div>

              <div class="pt-2 border-t flex items-center justify-between" [style.borderColor]="colors.border">
                <span class="text-[10px] font-semibold opacity-70">{{ plan.verseRef }}</span>
                <button
                  type="button"
                  (click)="startPlan(plan)"
                  class="px-3 py-1 rounded-xl text-xs font-bold text-white transition hover:opacity-90 cursor-pointer"
                  [style.backgroundColor]="colors.primary">
                  Comenzar
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Quick Action Buttons: PDF & Leader Report -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          (click)="openPdfExport.emit()"
          class="p-4 rounded-2xl border flex items-center gap-3 transition hover:scale-[1.01] cursor-pointer shadow-xs"
          [style.backgroundColor]="colors.surface"
          [style.borderColor]="colors.border">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-rose-600 bg-rose-50 dark:bg-rose-950/40">
            <span class="material-icons text-xl">picture_as_pdf</span>
          </div>
          <div class="text-left">
            <h4 class="font-bold text-xs sm:text-sm">Exportar PDF Membretado R07</h4>
            <p class="text-[11px]" [style.color]="colors.textSecondary">
              Genera tu hoja devocional semanal en alta resolución para imprimir o archivar.
            </p>
          </div>
        </button>

        <button
          type="button"
          (click)="openLeaderReport.emit()"
          class="p-4 rounded-2xl border flex items-center gap-3 transition hover:scale-[1.01] cursor-pointer shadow-xs"
          [style.backgroundColor]="colors.surface"
          [style.borderColor]="colors.border">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-amber-600 bg-amber-50 dark:bg-amber-950/40">
            <span class="material-icons text-xl">psychology</span>
          </div>
          <div class="text-left">
            <h4 class="font-bold text-xs sm:text-sm">Informe para Líder de Célula</h4>
            <p class="text-[11px]" [style.color]="colors.textSecondary">
              Resumen ejecutivo inteligente con IA para enviar por WhatsApp o reporte discipular.
            </p>
          </div>
        </button>
      </div>

      <!-- Section 2: 7-Day Weekly Matrix Table -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider" [style.color]="colors.primary">
          Tabla Semanal Consolidada (7 Días)
        </h3>
        <app-r07-weekly-table></app-r07-weekly-table>
      </div>

      <!-- Section 3: Goals & Prayer Items -->
      <div class="space-y-3">
        <h3 class="text-sm font-bold uppercase tracking-wider" [style.color]="colors.primary">
          Metas Espirituales y Peticiones
        </h3>
        <app-r07-weekly-goals></app-r07-weekly-goals>
      </div>

    </div>
  `
})
export class R07ExploreTab {
  public storage = inject(R07StorageService);

  public openPdfExport = output<void>();
  public openLeaderReport = output<void>();

  get colors() {
    return this.storage.currentThemeColors();
  }

  public plans: DevotionalPlan[] = [
    {
      title: 'Pasa tiempo Conmigo',
      tag: 'Oficial R07',
      duration: '7 Días',
      description: 'El plan fundacional de intimidad diaria, Palabra viva y clamor matutino.',
      verseRef: 'Salmos 63:1',
      icon: '🕊️'
    },
    {
      title: 'Hombres y Mujeres Valientes',
      tag: 'Carácter',
      duration: '7 Días',
      description: 'Fortalecimiento de la fe, integridad, sacerdocio familiar y victoria sobre la tentación.',
      verseRef: 'Josué 1:9',
      icon: '🛡️'
    },
    {
      title: 'Corazón Sanado y Restaurado',
      tag: 'Emociones',
      duration: '5 Días',
      description: 'Sanidad interior de heridas del pasado, perdón total y libertad en el Espíritu Santo.',
      verseRef: 'Salmos 34:18',
      icon: '💖'
    },
    {
      title: 'La Vid Verdadera y los Frutos',
      tag: 'Discipulado',
      duration: '7 Días',
      description: 'Permanecer conectados a Jesús para dar frutos abundantes en el hogar y la célula.',
      verseRef: 'Juan 15:5',
      icon: '🌿'
    }
  ];

  public startPlan(plan: DevotionalPlan): void {
    const week = this.storage.currentWeek();
    let motto = plan.title;
    let verseRef = plan.verseRef;
    let verseText = 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.';
    let readings: { book: string; chapter: number; verses: string }[] = [];

    if (plan.title.includes('Pasa tiempo Conmigo')) {
      verseText = 'Dios, Dios mío eres tú; de madrugada te buscaré; mi alma tiene sed de ti.';
      readings = [
        { book: 'Salmos', chapter: 63, verses: '1-8' },
        { book: 'Juan', chapter: 15, verses: '1-8' },
        { book: 'Salmos', chapter: 23, verses: '1-6' },
        { book: 'Filipenses', chapter: 4, verses: '4-9' },
        { book: 'Salmos', chapter: 91, verses: '1-16' },
        { book: 'Romanos', chapter: 8, verses: '31-39' },
        { book: 'Isaías', chapter: 40, verses: '28-31' }
      ];
    } else if (plan.title.includes('Valientes')) {
      verseText = 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes.';
      readings = [
        { book: 'Josué', chapter: 1, verses: '1-9' },
        { book: 'Efesios', chapter: 6, verses: '10-18' },
        { book: '1 Samuel', chapter: 17, verses: '40-50' },
        { book: '2 Timoteo', chapter: 1, verses: '7-14' },
        { book: 'Nehemías', chapter: 4, verses: '14-20' },
        { book: 'Hebreos', chapter: 11, verses: '1-10' },
        { book: '1 Corintios', chapter: 16, verses: '13-14' }
      ];
    } else if (plan.title.includes('Sanado')) {
      verseText = 'Cercano está Jehová a los quebrantados de corazón; y salva a los contritos de espíritu.';
      readings = [
        { book: 'Salmos', chapter: 34, verses: '1-18' },
        { book: 'Isaías', chapter: 61, verses: '1-3' },
        { book: 'Mateo', chapter: 11, verses: '28-30' },
        { book: 'Salmos', chapter: 147, verses: '1-5' },
        { book: '2 Corintios', chapter: 1, verses: '3-7' },
        { book: 'Salmos', chapter: 103, verses: '1-5' },
        { book: 'Apocalipsis', chapter: 21, verses: '1-7' }
      ];
    } else {
      verseText = 'Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto.';
      readings = [
        { book: 'Juan', chapter: 15, verses: '1-11' },
        { book: 'Gálatas', chapter: 5, verses: '22-26' },
        { book: 'Colosenses', chapter: 3, verses: '12-17' },
        { book: 'Romanos', chapter: 12, verses: '1-8' },
        { book: '1 Juan', chapter: 4, verses: '7-21' },
        { book: 'Filipenses', chapter: 2, verses: '1-11' },
        { book: 'Mateo', chapter: 5, verses: '1-16' }
      ];
    }

    const updatedDays = week.days.map((d, index) => {
      const r = readings[index] || { book: 'Salmos', chapter: index + 1, verses: '1-6' };
      return {
        ...d,
        bibleReading: r
      };
    });

    this.storage.saveCurrentWeek({
      ...week,
      motto,
      weeklyVerse: {
        reference: verseRef,
        text: verseText
      },
      days: updatedDays
    });

    this.storage.showSnackbar(`¡Plan «${plan.title}» activado para esta semana! 🕊️`);
    this.storage.setMobileTab('today');
  }
}

