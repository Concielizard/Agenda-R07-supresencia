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

const DEFAULT_GEMINI_KEY = '';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  public isGenerating = signal<boolean>(false);
  public isAiOfflineMode = signal<boolean>(false);

  private getApiKey(): string {
    if (typeof localStorage !== 'undefined') {
      const custom = localStorage.getItem('gemini_api_key');
      if (custom && custom.trim().length > 5) return custom.trim();
    }
    return DEFAULT_GEMINI_KEY;
  }

  public setApiKey(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('gemini_api_key', key.trim());
    }
  }

  /**
   * Generates a complete R07 structured devotional based on a Bible passage or theme
   */
  public async generateDevotional(
    passage: string,
    userGender: 'female' | 'male' | 'general' | 'neutral' = 'general',
    userTheme: string = ''
  ): Promise<DevotionalAiResult> {
    this.isGenerating.set(true);

    const isWoman = userGender === 'female';
    const isMan = userGender === 'male';
    const vocative = isWoman ? 'Mujer de Dios (Proverbios 31)' : isMan ? 'Hombre de Dios (Valientes)' : 'Creyente';

    const prompt = `Eres un sabio pastor y consejero bíblico de la iglesia Su Presencia en Colombia, guiando a un creyente en el método devocional R07 «Pasa tiempo Conmigo».
El usuario es: ${vocative}.
Pasaje bíblico o tema solicitado: "${passage}".
Estado del corazón o motivo: "${userTheme || 'Búsqueda de intimidad con Dios'}".

Genera un devocional R07 profundo, cristocéntrico y lleno de unción, devolviendo EXCLUSIVAMENTE un objeto JSON válido con estas 6 propiedades exactas:
{
  "rhema": "El versículo clave extraído de ${passage} con su cita y una breve revelación del Espíritu Santo.",
  "reflection": "Meditación pastoral (2-3 párrafos breves) sobre la santidad, amor y fidelidad de Dios.",
  "application": "¿Cómo obedecer y aplicar esta palabra hoy en la vida diaria, el trabajo y la familia?",
  "prayerSummary": "Una oración íntima y poderosa de clamor, gratitud y rendición.",
  "dailyAffirmation": "Una declaración profética de fe para hablar hoy en voz alta.",
  "actionItem": "Un paso práctico y concreto de fe para realizar hoy."
}`;

    try {
      const text = await this.callGeminiRaw(prompt);
      const json = this.extractJson(text);
      if (json && json.rhema) {
        return json as DevotionalAiResult;
      }
    } catch (e) {
      console.warn('Gemini API call failed, generating tailored fallback:', e);
    } finally {
      this.isGenerating.set(false);
    }

    return this.generateFallbackDevotional(passage, userGender, userTheme);
  }

  /**
   * Generates an executive spiritual progress report for discipleship leaders
   */
  public async generateLeaderReport(weekData: any, profile: any): Promise<LeaderReportResult> {
    this.isGenerating.set(true);
    const name = profile.displayName || 'Santiago';
    const daysCount = weekData.days?.filter((d: any) => d.completed).length || 0;

    const prompt = `Eres un pastor mentor de discipulado en la iglesia Su Presencia.
Genera un informe para el líder de célula sobre el devocional R07 semanal de ${name}.
Días completados: ${daysCount} de 7.
Lema: "${weekData.motto || 'Pasa tiempo Conmigo'}".

Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta estructura:
{
  "executiveSummary": "Resumen ejecutivo del progreso espiritual del discípulo esta semana.",
  "strengthsObserved": ["Fortaleza 1 observada", "Fortaleza 2 observada", "Fortaleza 3 observada"],
  "spiritualGrowthAreas": ["Área 1 para seguir profundizando", "Área 2 para seguir profundizando"],
  "suggestedEncouragement": "Mensaje de aliento pastoral cálido y bíblico para enviar al discípulo."
}`;

    try {
      const text = await this.callGeminiRaw(prompt);
      const json = this.extractJson(text);
      if (json && json.executiveSummary) {
        return json as LeaderReportResult;
      }
    } catch (e) {
      console.warn('Leader report AI failed:', e);
    } finally {
      this.isGenerating.set(false);
    }

    return this.generateFallbackLeaderReport(weekData, profile);
  }

  /**
   * Generates a structured guided prayer in the R07 model
   */
  public async generateGuidedPrayer(topic: string, needType: string): Promise<GuidedPrayerResult> {
    this.isGenerating.set(true);

    const prompt = `Genera una oración guiada en el modelo R07 Su Presencia para la siguiente necesidad:
Tema: "${topic}"
Categoría: "${needType}"

Devuelve EXCLUSIVAMENTE un objeto JSON válido con:
{
  "title": "Título inspirador de la oración",
  "adoration": "Adoración y exaltación a los atributos de Dios.",
  "confessionAndGrace": "Arrepentimiento, gracia y purificación en la sangre de Cristo.",
  "thanksgiving": "Acción de gracias por las promesas ya dadas.",
  "supplication": "Clamor específico por ${topic}.",
  "closingDeclaration": "Declaración profética final en el nombre de Jesús."
}`;

    try {
      const text = await this.callGeminiRaw(prompt);
      const json = this.extractJson(text);
      if (json && json.adoration) {
        return json as GuidedPrayerResult;
      }
    } catch (e) {
      console.warn('Guided prayer AI failed:', e);
    } finally {
      this.isGenerating.set(false);
    }

    return this.generateFallbackGuidedPrayer(topic, needType);
  }

  /**
   * Interactive Bible AI Chat powered by Gemini
   */
  public async askBiblicalAssistant(prompt: string, theme: string = 'general'): Promise<{ text: string; scriptureRefs: string[] }> {
    this.isGenerating.set(true);

    const systemPrompt = `Eres el Consejero Bíblico Inteligente de la app Agenda R07 «Pasa tiempo Conmigo» de la iglesia Su Presencia.
Responde a esta pregunta o inquietud del creyente con amor pastoral, sabiduría de las Escrituras y aliento del Espíritu Santo:
"${prompt}"

Devuelve EXCLUSIVAMENTE un objeto JSON:
{
  "text": "Tu respuesta pastoral y bíblica profunda (2 párrafos).",
  "scriptureRefs": ["Cita 1 (ej. Salmos 27:1)", "Cita 2 (ej. Filipenses 4:6)"]
}`;

    try {
      const raw = await this.callGeminiRaw(systemPrompt);
      const json = this.extractJson(raw);
      if (json && json.text) {
        return {
          text: json.text,
          scriptureRefs: Array.isArray(json.scriptureRefs) ? json.scriptureRefs : ['Salmos 119:105']
        };
      }
    } catch (e) {
      console.warn('Chat assistant AI failed:', e);
    } finally {
      this.isGenerating.set(false);
    }

    return this.generateFallbackChatResponse(prompt, theme);
  }

  private async callGeminiRaw(promptText: string): Promise<string> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.isAiOfflineMode.set(true);
      throw new Error('Dispositivo sin conexión a internet');
    }
    this.isAiOfflineMode.set(false);

    const key = this.getApiKey();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95
        }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private extractJson(rawText: string): any {
    try {
      const clean = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(clean.substring(firstBrace, lastBrace + 1));
      }
      return JSON.parse(clean);
    } catch {
      return null;
    }
  }

  private generateFallbackDevotional(passage: string, gender: string, theme: string = ''): DevotionalAiResult {
    const isWoman = gender === 'female';
    const isMan = gender === 'male';
    const vocative = isWoman ? 'hija amada' : isMan ? 'hijo amado' : 'creyente';

    return {
      rhema: `Dios te habla hoy a través de ${passage}: "El Señor es mi luz y mi salvación; ¿de quién temeré? El Señor es la fortaleza de mi vida; ¿de quién he de atemorizarme?" (Salmos 27:1). Como ${vocative}, descansa en Su provisión y paz.`,
      reflection: `Al meditar en ${passage}, el Espíritu Santo te recuerda que la verdadera intimidad no nace de un ritual, sino de un corazón rendido en el secreto. Aunque enfrentes desafíos o ${theme || 'momentos de incertidumbre'}, Su presencia te rodea como un escudo.`,
      application: `Hoy me enfocaré en entregar a Dios toda ansiedad antes de comenzar mis tareas, bendiciendo a mi familia y actuando con fe e integridad en cada decisión.`,
      prayerSummary: `Padre amado, gracias por revelarte a mi vida a través de Tu Palabra en ${passage}. Lléname hoy con Tu Santo Espíritu y enséñame a caminar en obediencia y gratitud continua. En el nombre de Jesús, amén.`,
      dailyAffirmation: isWoman 
        ? 'Soy una mujer de fe, vestida de dignidad y sabiduría; confío en el Señor y no temo al futuro.' 
        : isMan 
        ? 'Soy un hombre de Dios, sacerdote de mi hogar, valiente e íntegro; mis pasos son guiados por el Señor.'
        : 'Soy linaje escogido por Dios; Su gracia me capacita y Su favor me acompaña en este día.',
      actionItem: `Apartar 10 minutos de quietud hoy para adorar a Dios y escribir una promesa de fe de ${passage} en mi libreta.`
    };
  }

  private generateFallbackLeaderReport(weekData: any, profile: any): LeaderReportResult {
    const daysCount = weekData.days?.filter((d: any) => d.completed).length || 0;
    const name = profile.displayName || 'Santiago';

    return {
      executiveSummary: `El discípulo ${name} completó ${daysCount} de 7 días devocionales en el método R07. Demostró una notable constancia en la búsqueda diaria, registrando reflexiones profundas y compromisos prácticos de obediencia.`,
      strengthsObserved: [
        'Fidelidad y consistencia en el tiempo a solas con Dios',
        'Profundidad espiritual al extraer la Palabra Viva de cada pasaje bíblico',
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

  private generateFallbackChatResponse(prompt: string, theme: string): { text: string; scriptureRefs: string[] } {
    return {
      text: `Al meditar en tu consulta sobre "${prompt}", la Palabra de Dios nos recuerda que en Cristo tenemos sabiduría, consolación y victoria. «Lámpara es a mis pies tu palabra, y lumbrera a mi camino» (Salmos 119:105). Te animo a presentar esta situación en oración en tu devocional R07 de hoy.`,
      scriptureRefs: ['Salmos 119:105', 'Romanos 8:28', 'Jeremías 29:11']
    };
  }
}

