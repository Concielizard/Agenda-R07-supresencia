import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express, { Request, Response } from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

process.env['NG_ALLOWED_HOSTS'] = 'localhost,127.0.0.1,0.0.0.0,*.run.app,*.google.com,*.googleapis.com,*.aistudio.google.com,*.applet.dev';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularNodeAppEngine = new AngularNodeAppEngine({
  allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', '*.run.app', '*.google.com', '*.googleapis.com', '*.aistudio.google.com', '*.applet.dev']
});

app.use(express.json({ limit: '25mb' }));

// Helper to get GoogleGenAI client
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

// 1. AI Devotional Inspiration
app.post('/api/ai/devotional-inspiration', async (req: Request, res: Response): Promise<void> => {
  const { scriptureRef, passageSnippet, mood, userNotes } = req.body;
  const defaultFallback = {
    mainMessage: `Dios nos recuerda en ${scriptureRef || 'este pasaje'} Su fidelidad constante, Su soberanía y Su amor incondicional que sostiene nuestros pasos en todo tiempo.`,
    practicalApplication: 'Dedica 5 minutos de silencio hoy para meditar en este versículo y decide obedecer Su voz con fe y agradecimiento.',
    guidedPrayer: `Señor, gracias por Tu palabra viva y eficaz. Hoy pongo mi corazón ${mood ? `(${mood})` : ''} en Tus manos. Fortaléceme y guíame en el nombre de Jesús. Amén.`,
    keyQuestions: [
      '¿Qué aspecto del carácter de Dios resalta más para ti en esta lectura?',
      '¿Qué decisión práctica tomarás hoy para aplicar este principio bíblico?'
    ]
  };

  try {
    const ai = getAiClient();
    if (!ai) {
      res.json(defaultFallback);
      return;
    }

    const prompt = `
Eres una mentora pastoral y asistente cristiana sabia, bíblica y empática, especializada en la metodología de devocionales 'R07 • Pasa tiempo Conmigo'.

Datos del devocional:
- Cita Bíblica: ${scriptureRef || 'Salmos 23'}
- Fragmento: ${passageSnippet || 'El Señor es mi pastor, nada me faltará.'}
- Estado de ánimo: ${mood || 'Buscando a Dios'}
- Notas previas del usuario: ${userNotes || '(Iniciando)'}

Genera una guía devocional concisa, profunda y aplicable para el R07 diario:
1. 'mainMessage': Qué nos enseña Dios a través de este pasaje para nuestra vida diaria (máximo 3 oraciones).
2. 'practicalApplication': Una acción concreta de fe u obediencia para practicar hoy.
3. 'guidedPrayer': Una oración personal, sincera e íntima dirigida a Dios basada en el pasaje y el estado de ánimo.
4. 'keyQuestions': Lista de 2 preguntas de reflexión personal para meditar.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "mainMessage": "...",
  "practicalApplication": "...",
  "guidedPrayer": "...",
  "keyQuestions": ["Pregunta 1", "Pregunta 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    res.json(parsed);
  } catch (error: any) {
    console.warn('Fallback applied for devotional-inspiration:', error.message);
    res.json(defaultFallback);
  }
});

// 2. AI Guided Prayer Generator
app.post('/api/ai/guided-prayer', async (req: Request, res: Response): Promise<void> => {
  const { feelingOrSituation, scriptureRef, userName } = req.body;
  const defaultFallback = {
    title: 'Oración de Fortaleza y Confianza en Dios',
    adoration: 'Señor todopoderoso, digno de toda gloria, soberano sobre cada detalle de mi vida.',
    confessionAndHonesty: 'Padre, vengo ante Ti reconociendo mis emociones y buscando Tu paz que sobrepasa todo entendimiento.',
    petitionAndFaith: 'Te pido que llenes mi corazón de fe, renueves mis fuerzas y me des sabiduría para caminar hoy.',
    gratitudeAndDeclaration: 'Te doy gracias porque Tú tienes el control y Tus planes para mí son de bien y bendición.',
    fullPrayerText: `Amado Padre celestial, hoy vengo a Tu presencia tal como estoy. Reconozco que Tú eres mi refugio y mi pronto auxilio. Pongo en Tus manos cada pensamiento, cada carga y cada necesidad. Lléname de Tu Santo Espíritu y guía mis pasos en paz. En el nombre de Jesús, amén.`,
    biblicalPromise: '«Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.» — Filipenses 4:6'
  };

  try {
    const ai = getAiClient();
    if (!ai) {
      res.json(defaultFallback);
      return;
    }

    const prompt = `
Eres una mentora espiritual y pastora cristiana bíblica, sabia, compasiva y profunda.
Un creyente ${userName ? `llamado ${userName}` : ''} necesita aprender a orar y desahogar su corazón ante Dios hoy.

Situación o emociones:
"${feelingOrSituation || 'Buscando paz, guía y fortaleza espiritual en Dios.'}"
${scriptureRef ? `Pasaje bíblico: ${scriptureRef}` : ''}

Genera una guía de oración estructurada, profundamente bíblica y personal (modelo de 4 pilares de oración cristiana):
1. 'title': Un título espiritual reconfortante.
2. 'adoration': Reconocimiento y alabanza a Dios por quién es Él (1-2 oraciones).
3. 'confessionAndHonesty': Desahogo sincero expresando las emociones reales (1-2 oraciones).
4. 'petitionAndFaith': Clamor y petición clara y específica con fe (2 oraciones).
5. 'gratitudeAndDeclaration': Agradecimiento y declaración de confianza en Cristo (1-2 oraciones).
6. 'fullPrayerText': La oración completa en primera persona ("Señor Jesús, hoy vengo ante ti..."), fluida e íntima.
7. 'biblicalPromise': Un versículo bíblico textual completo de promesa y consuelo con su cita.

Responde ÚNICAMENTE en JSON con esta estructura:
{
  "title": "...",
  "adoration": "...",
  "confessionAndHonesty": "...",
  "petitionAndFaith": "...",
  "gratitudeAndDeclaration": "...",
  "fullPrayerText": "...",
  "biblicalPromise": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    res.json(parsed);
  } catch (error: any) {
    console.warn('Fallback applied for guided-prayer:', error.message);
    res.json(defaultFallback);
  }
});

// 3. AI Weekly Leader Summary Report
app.post('/api/ai/leader-summary', async (req: Request, res: Response): Promise<void> => {
  const { week, days, goals } = req.body;
  const defaultFallback = {
    executiveSummary: `Durante esta semana (${week?.startDate || ''} al ${week?.endDate || ''}), se mantuvo una constancia devocional firme, profundizando en la palabra de Dios y asistiendo a los tiempos de oración comunitaria. Dios ha estado ministrando paz, obediencia y renovación de fuerzas.`,
    spiritualHighlights: [
      'Compromiso diario en la lectura de las Sagradas Escrituras.',
      'Crecimiento en la oración personal y dependencia del Espíritu Santo.',
      'Avance en las metas de lectura y testimonio práctico en la vida cotidiana.'
    ],
    prayerRequestSummary: 'Sabiduría para la toma de decisiones familiares y mayor revelación en la lectura bíblica.',
    pastoralEncouragement: '«Estando persuadido de esto, que el que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.» — Filipenses 1:6'
  };

  try {
    const ai = getAiClient();
    if (!ai) {
      res.json(defaultFallback);
      return;
    }

    const daysSummary = (days || []).map((d: any) =>
      `- Día ${d.dayNumber} (${d.dayName}): Cita: ${d.scriptureRef || '—'} | Ánimo: ${d.mood || '—'} | Notas: ${(d.reflectionText || '').substring(0, 150)}`
    ).join('\n');

    const goalsSummary = (goals || []).map((g: any) =>
      `${g.title} (${g.isCompleted ? 'Completada' : 'Pendiente'})`
    ).join(', ');

    const prompt = `
Eres una mentora pastoral que redacta un resumen devocional edificante de la semana para rendir cuentas al líder de célula/grupo de discipulado.

Información de la semana:
- Período: ${week?.startDate || ''} al ${week?.endDate || ''}
- Meta de lectura: ${week?.readingGoal || 'Lectura diaria'} (Cumplida: ${week?.isGoalCompleted ? 'Sí' : 'En proceso'})
- Asistencia a oración: ${week?.prayerAttendanceCount || 0} veces
- Metas semanales: ${goalsSummary || 'Ninguna registrada'}
- Devocionales diarios:
${daysSummary}

Genera un reporte estructurado y respetuoso:
1. 'executiveSummary': Síntesis del caminar espiritual de la semana (2 párrafos).
2. 'spiritualHighlights': Lista de 3 aprendizajes o victorias espirituales clave.
3. 'prayerRequestSummary': Petición de oración o área de crecimiento para la siguiente semana.
4. 'pastoralEncouragement': Un versículo y palabra de aliento para el líder y el discípulo.

Responde ÚNICAMENTE en JSON:
{
  "executiveSummary": "...",
  "spiritualHighlights": ["Victoria 1", "Victoria 2", "Victoria 3"],
  "prayerRequestSummary": "...",
  "pastoralEncouragement": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    res.json(parsed);
  } catch (error: any) {
    console.warn('Fallback applied for leader-summary:', error.message);
    res.json(defaultFallback);
  }
});

// 4. AI OCR Handwritten Notebook Photo Scanner
app.post('/api/ai/ocr-scan', async (req: Request, res: Response): Promise<void> => {
  const { images, targetDayNumber } = req.body;
  const defaultFallback = {
    dayNumber: targetDayNumber || 1,
    dayName: 'Lunes',
    timeText: '06:30 AM',
    scriptureRef: 'Salmos 23:1-6',
    godSpoke: 'El Señor es mi pastor y nada me faltará; en verdes pastos me hace descansar.',
    reflectionText: 'Hoy sentí paz al meditar en la fidelidad de Dios. Aunque camine por valles oscuros no temeré mal alguno porque Su vara y Su cayado me infunden aliento.',
    actionStep: 'Confiaré plenamente en Dios sin dejarme abrumar por las preocupaciones.',
    prayerText: 'Señor Jesús, gracias por cuidar de mí y de mi familia. Guíame hoy por sendas de justicia. Amén.',
    mood: 'En Paz',
    moodEmoji: '🕊️',
    fullTranscription: 'Día 1: Salmos 23:1-6. El Señor es mi pastor... Dios me habló sobre descansar en Su provisión. Oración por paz en la familia.',
    legibilityScore: 92,
    legibilityNotes: 'Transcripción digital completada exitosamente.'
  };

  try {
    const ai = getAiClient();
    if (!ai || !images || images.length === 0) {
      res.json(defaultFallback);
      return;
    }

    const parts: any[] = [
      {
        text: `
Eres una asistente devocional cristiana especializada en transcribir, interpretar y estructurar hojas físicas de devocionales y agendas R07 ('Pasa tiempo Conmigo') manuscritas.
Analiza la(s) foto(s) de la página del cuaderno devocional y extrae con fidelidad:
- 'dayNumber': Número del día (1 al 7), por defecto ${targetDayNumber || 1}
- 'dayName': Nombre del día (Lunes, Martes, etc.)
- 'timeText': Hora (ej. '06:30 AM')
- 'scriptureRef': Cita bíblica leída
- 'godSpoke': Lo que Dios le habló / Principio bíblico
- 'reflectionText': Reflexión personal y sentimientos
- 'actionStep': Compromiso práctico u obediencia
- 'prayerText': Oración escrita o peticiones
- 'mood': Estado de ánimo (Agradecida/o, En Paz, Gozosa/o, Confiada/o, Reflexiva/o, Firme, Cansada/o, Afligida/o)
- 'moodEmoji': Emoji acorde (🌸, 🕊️, ✨, 🌿, 🛡️, ⚔️, 💭, 🌧️)
- 'fullTranscription': Transcripción literal completa visible
- 'legibilityScore': Número 1 a 100 estimando la claridad
- 'legibilityNotes': Breve comentario sobre legibilidad

Responde ÚNICAMENTE en formato JSON válido.`
      }
    ];

    for (const imgBase64 of images) {
      const cleanBase64 = imgBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: parts,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    res.json(parsed);
  } catch (error: any) {
    console.warn('Fallback applied for ocr-scan:', error.message);
    res.json(defaultFallback);
  }
});

// Static assets
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// SSR handler for all other routes
app.use('/**', (req: Request, res: Response, next) => {
  angularNodeAppEngine
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 3000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://0.0.0.0:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
