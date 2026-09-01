import { Injectable, signal } from '@angular/core';

export interface DevotionalAiResult {
  rhema: string;
  reflection: string;
  application: string;
  prayerSummary: string;
  dailyAffirmation: string;
  actionItem: string;
}

export interface LeaderReportResult {
  executiveSummary: string;
  strengthsObserved: string[];
  spiritualGrowthAreas: string[];
  suggestedEncouragement: string;
}

export interface GuidedPrayerResult {
  title: string;
  adoration: string;
  confessionAndGrace: string;
  thanksgiving: string;
  supplication: string;
  closingDeclaration: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  public isGenerating = signal<boolean>(false);

  /**
   * Generates a complete R07 structured devotional based on a Bible passage or theme
   */
  public async generateDevotional(passage: string, userGender: 'female' | 'male' | 'general' | 'neutral' = 'general', userTheme: string = ''): Promise<DevotionalAiResult> {
    this.isGenerating.set(true);
    try {
      const response = await fetch('/api/ai/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, userGender, userTheme })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      throw new Error('API server returned error');
    } catch {
      // Offline / Fallback generator with deeply inspiring biblical content
      return this.generateFallbackDevotional(passage, userGender);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Generates an executive spiritual progress report for discipleship leaders
   */
  public async generateLeaderReport(weekData: any, profile: any): Promise<LeaderReportResult> {
    this.isGenerating.set(true);
    try {
      const response = await fetch('/api/ai/leader-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekData, profile })
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('API error');
    } catch {
      return this.generateFallbackLeaderReport(weekData, profile);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Generates a structured guided prayer in the R07 model
   */
  public async generateGuidedPrayer(topic: string, needType: string): Promise<GuidedPrayerResult> {
    this.isGenerating.set(true);
    try {
      const response = await fetch('/api/ai/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, needType })
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('API error');
    } catch {
      return this.generateFallbackGuidedPrayer(topic, needType);
    } finally {
      this.isGenerating.set(false);
    }
  }

  /**
   * Fallback generation when offline or without API key
   */
  private generateFallbackDevotional(passage: string, gender: string): DevotionalAiResult {
    const isWoman = gender === 'female';
    const isMan = gender === 'male';
    const vocative = isWoman ? 'hija amada' : isMan ? 'hijo amado' : 'creyente';

    return {
      rhema: `Dios te dice hoy: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia" (Isaías 41:10). Esta palabra para ${passage} afirma que como ${vocative}, tu victoria está asegurada en el Señor.`,
      reflection: `Al meditar en ${passage}, comprendemos que la cercanía con Dios no depende de nuestras fuerzas humanas ni de circunstancias externas, sino de la fidelidad inmutable de Su pacto. El Espíritu Santo desea renovar nuestra mente hoy para caminar en total obediencia y deleite en Su presencia.`,
      application: `Hoy pondré en práctica esta verdad entregando a primera hora toda ansiedad, comunicándome en amor con quienes me rodean y manteniendo una actitud de gratitud continua en cada tarea diaria.`,
      prayerSummary: `Señor Jesús, gracias por hablarme con tanta ternura y poder a través de Tu Palabra. Rindo mi voluntad a Ti hoy, llena mi corazón con Tu paz y permíteme ser luz viva en medio de mi entorno. En el nombre de Jesús, amén.`,
      dailyAffirmation: isWoman 
        ? 'Soy una mujer de fe, sabia, fuerte y guiada por el Espíritu Santo. En mi casa y en mi vida reina la paz de Cristo.' 
        : isMan 
        ? 'Soy un hombre de Dios, sacerdote de mi hogar, valiente e íntegro. Mis pasos son guiados por el Señor.'
        : 'Soy linaje escogido, redimido por la gracia de Dios. Camino en victoria y propósito hoy.',
      actionItem: 'Escribir una nota o mensaje de aliento bíblico a alguien que necesite esperanza hoy.'
    };
  }

  private generateFallbackLeaderReport(weekData: any, profile: any): LeaderReportResult {
    const daysCount = weekData.days?.filter((d: any) => d.completed).length || 0;
    const name = profile.displayName || 'Discipulado';

    return {
      executiveSummary: `El discípulo ${name} completó ${daysCount} de 7 días devocionales en el método R07. Demostró una notable constancia en la búsqueda diaria, registrando reflexiones profundas y compromisos prácticos de obediencia.`,
      strengthsObserved: [
        'Fidelidad y consistencia en el tiempo a solas con Dios',
        'Profundidad espiritual al extraer la palabra Rhema de cada pasaje bíblico',
        'Disposición hacia la aplicación práctica en el hogar y servicio cristiano'
      ],
      spiritualGrowthAreas: [
        'Continuar fortaleciendo el hábito de la intercesión por peticiones misioneras',
        'Integrar más momentos de ayuno y quietud contemplativa'
      ],
      suggestedEncouragement: `¡Gran trabajo, ${name}! Tu perseverancia en el secreto dará fruto visible y duradero. Sigue adelante afirmado en las promesas de Su Palabra.`
    };
  }

  private generateFallbackGuidedPrayer(topic: string, needType: string): GuidedPrayerResult {
    return {
      title: `Oración de Fe y Victoria: ${topic}`,
      adoration: 'Padre Celestial, Rey de gloria y Señor de toda la creación, te alabo porque eres Santo, Todopoderoso y Bueno. Tu fidelidad permanece para siempre.',
      confessionAndGrace: 'Reconozco mi necesidad de Ti. Si en algo he fallado, límpiame con la sangre preciosa de Cristo y renueva un espíritu recto dentro de mí.',
      thanksgiving: 'Te doy gracias por cada respuesta que ya has preparado en el mundo espiritual, por Tu protección constante y por sostenerme en Tus brazos de amor.',
      supplication: `Hoy traigo delante de Tu trono de gracia esta necesidad: ${topic} (${needType}). Declaro que Tú tienes el control absoluto, que abres caminos donde no los hay y que derramas sanidad, paz y provisión sobreabundante.`,
      closingDeclaration: 'En el nombre poderoso de Jesús, me declaro en victoria, cubierto bajo la sombra del Omnipotente. ¡Amén y amén!'
    };
  }
}
