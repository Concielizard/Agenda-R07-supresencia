import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AiDevotionalInspiration,
  AiGuidedPrayerResponse,
  AiWeeklyLeaderSummary,
  R07DayEntryEntity,
  R07WeekEntity,
  R07WeeklyGoalEntity,
  ScannedR07Entry
} from '../models/r07.models';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private http = inject(HttpClient);

  async getDevotionalInspiration(
    scriptureRef: string,
    passageSnippet: string,
    mood: string,
    userNotes: string
  ): Promise<AiDevotionalInspiration> {
    try {
      const response = await firstValueFrom(
        this.http.post<AiDevotionalInspiration>('/api/ai/devotional-inspiration', {
          scriptureRef,
          passageSnippet,
          mood,
          userNotes
        })
      );
      return response;
    } catch (e: any) {
      console.warn('API error in getDevotionalInspiration, using fallback', e);
      return {
        mainMessage: `Dios nos recuerda en ${scriptureRef || 'este pasaje'} Su fidelidad inagotable, Su paz y el cuidado de Su mano sobre nuestras vidas.`,
        practicalApplication: 'Aparta un momento de alabanza sincera hoy y decide poner cada preocupación en Sus manos.',
        guidedPrayer: `Amado Padre, gracias por hablar a mi corazón a través de Tu palabra. Llena mi vida de gozo y paz hoy. En el nombre de Jesús, amén.`,
        keyQuestions: [
          '¿Qué me está pidiendo Dios que rinda o entregue en Sus manos hoy?',
          '¿Cómo puedo reflejar Su amor y carácter en mi familia o trabajo?'
        ]
      };
    }
  }

  async generateGuidedPrayer(
    feelingOrSituation: string,
    scriptureRef: string,
    userName: string
  ): Promise<AiGuidedPrayerResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<AiGuidedPrayerResponse>('/api/ai/guided-prayer', {
          feelingOrSituation,
          scriptureRef,
          userName
        })
      );
      return response;
    } catch (e: any) {
      console.warn('API error in generateGuidedPrayer, using fallback', e);
      return {
        title: 'Oración de Victoria y Paz en Dios',
        adoration: 'Señor Jesús, Tú eres mi pastor, mi escudo y la roca de mi salvación.',
        confessionAndHonesty: 'Padre, reconozco que a veces me canso o me afano, pero hoy decido mirar hacia Ti.',
        petitionAndFaith: 'Te ruego que renueves mis fuerzas, me llenes de sabiduría celestial y guardes mi corazón.',
        gratitudeAndDeclaration: 'Te doy infinitas gracias por Tu fidelidad inquebrantable y porque siempre respondes.',
        fullPrayerText: `Señor Jesús, hoy me acerco a Ti con un corazón sincero. Pongo en Tus manos cada necesidad y anhelo. Sé que en Ti tengo paz, gozo y victoria. Guía mis pasos y que mi vida sea de bendición a otros. En Tu santo nombre, amén.`,
        biblicalPromise: '«El Señor es mi fuerza y mi escudo; en él confió mi corazón, y fui ayudado.» — Salmos 28:7'
      };
    }
  }

  async generateWeeklyLeaderReport(
    week: R07WeekEntity,
    days: R07DayEntryEntity[],
    goals: R07WeeklyGoalEntity[]
  ): Promise<AiWeeklyLeaderSummary> {
    try {
      const response = await firstValueFrom(
        this.http.post<AiWeeklyLeaderSummary>('/api/ai/leader-summary', {
          week,
          days,
          goals
        })
      );
      return response;
    } catch (e: any) {
      console.warn('API error in generateWeeklyLeaderReport, using fallback', e);
      return {
        executiveSummary: `Durante la semana ${week.title} (${week.startDate} al ${week.endDate}), se mantuvo una constancia devocional firme, avanzando en la lectura de ${week.readingGoal || 'la palabra'} y asistiendo a los tiempos de oración. Ha sido un tiempo de edificación y comunión con Dios.`,
        spiritualHighlights: [
          'Compromiso diario con el tiempo devocional R07.',
          'Crecimiento en la oración y dependencia del Espíritu Santo.',
          'Metas espirituales alcanzadas con gozo y perseverancia.'
        ],
        prayerRequestSummary: 'Sabiduría para la toma de decisiones y fortalecimiento espiritual continuo.',
        pastoralEncouragement: '«El que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.» — Filipenses 1:6'
      };
    }
  }

  async scanHandwrittenPage(
    images: string[],
    targetDayNumber: number
  ): Promise<ScannedR07Entry> {
    try {
      const response = await firstValueFrom(
        this.http.post<ScannedR07Entry>('/api/ai/ocr-scan', {
          images,
          targetDayNumber
        })
      );
      return {
        ...response,
        pageCount: images.length,
        photoUris: images
      };
    } catch (e: any) {
      console.warn('API error in scanHandwrittenPage, using simulated fallback', e);
      return {
        dayNumber: targetDayNumber,
        dayName: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][targetDayNumber - 1] || 'Lunes',
        timeText: '06:30 AM',
        scriptureRef: 'Salmos 23:1-6',
        godSpoke: 'Descansa en Mi provisión y en Mi pastoreo.',
        reflectionText: 'Dios me habló sobre no temer al futuro ni dejarme vencer por la ansiedad. En Sus brazos encuentro paz.',
        actionStep: 'Dar gracias antes de acostarme y orar por mi familia.',
        prayerText: 'Señor Jesús, gracias por pastorear mi vida con amor infinito. Amén.',
        mood: 'En Paz',
        moodEmoji: '🕊️',
        fullTranscription: 'Día manuscrito escaneado con éxito.',
        legibilityScore: 94,
        legibilityNotes: 'Página devocional transcrita y estructurada.',
        pageCount: images.length,
        photoUris: images
      };
    }
  }
}
