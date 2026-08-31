package com.example.data.remote

import com.example.BuildConfig
import com.example.data.model.R07DayEntryEntity
import com.example.data.model.R07WeekEntity
import com.example.data.model.R07WeeklyGoalEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

data class AiDevotionalInspiration(
    val mainMessage: String = "",
    val practicalApplication: String = "",
    val guidedPrayer: String = "",
    val keyQuestions: List<String> = emptyList()
)

data class AiWeeklyLeaderSummary(
    val executiveSummary: String = "",
    val spiritualHighlights: List<String> = emptyList(),
    val prayerRequestSummary: String = "",
    val pastoralEncouragement: String = ""
)

data class AiGuidedPrayerResponse(
    val title: String = "",
    val adoration: String = "",
    val confessionAndHonesty: String = "",
    val petitionAndFaith: String = "",
    val gratitudeAndDeclaration: String = "",
    val fullPrayerText: String = "",
    val biblicalPromise: String = ""
)

object GeminiDevotionalService {

    // Model name set to gemini-3.5-flash
    private const val MODEL_NAME = "gemini-3.5-flash"
    private const val BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    private val client = OkHttpClient.Builder()
        .connectTimeout(45, TimeUnit.SECONDS)
        .readTimeout(45, TimeUnit.SECONDS)
        .writeTimeout(45, TimeUnit.SECONDS)
        .build()

    private fun getApiKey(): String {
        return try {
            BuildConfig.GEMINI_API_KEY
        } catch (e: Exception) {
            ""
        }
    }

    suspend fun getDevotionalInspiration(
        scriptureRef: String,
        passageSnippet: String = "",
        mood: String = "",
        userNotes: String = ""
    ): Result<AiDevotionalInspiration> = withContext(Dispatchers.IO) {
        try {
            val apiKey = getApiKey()
            if (apiKey.isBlank() || apiKey == "MY_GEMINI_API_KEY") {
                return@withContext Result.failure(
                    IllegalStateException("Configura tu GEMINI_API_KEY en el panel de Secretos de AI Studio para activar las funciones devocionales de IA.")
                )
            }

            val prompt = """
                Eres una asistente pastoral y mentora cristiana sabia, bíblica y empática, especializada en la metodología de devocionales 'R07 • Pasa tiempo Conmigo'.
                
                Datos del devocional de hoy:
                - Cita Bíblica: ${if (scriptureRef.isNotBlank()) scriptureRef else "Salmos 23"}
                - Texto o Fragmento: ${if (passageSnippet.isNotBlank()) passageSnippet else "El Señor es mi pastor, nada me faltará."}
                - Estado de ánimo del usuario: ${if (mood.isNotBlank()) mood else "Buscando la presencia de Dios"}
                - Notas previas del usuario: ${if (userNotes.isNotBlank()) userNotes else "(Iniciando el tiempo con Dios)"}
                
                Genera una guía devocional concisa, profunda y aplicable para el R07 diario:
                1. 'mainMessage': Qué nos enseña Dios a través de este pasaje para nuestra vida diaria (máximo 3 oraciones).
                2. 'practicalApplication': Una acción concreta de fe u obediencia para practicar hoy.
                3. 'guidedPrayer': Una oración personal, sincera e íntima dirigida a Dios basada en el pasaje y el estado de ánimo.
                4. 'keyQuestions': Lista de 2 preguntas de reflexión personal para meditar.
                
                Responde ÚNICAMENTE en JSON válido con esta estructura:
                {
                  "mainMessage": "...",
                  "practicalApplication": "...",
                  "guidedPrayer": "...",
                  "keyQuestions": ["Pregunta 1", "Pregunta 2"]
                }
            """.trimIndent()

            val requestJson = JSONObject().apply {
                val contentsArray = JSONArray()
                val contentObj = JSONObject().apply {
                    val partsArray = JSONArray()
                    partsArray.put(JSONObject().apply {
                        put("text", prompt)
                    })
                    put("parts", partsArray)
                }
                contentsArray.put(contentObj)
                put("contents", contentsArray)

                put("generationConfig", JSONObject().apply {
                    put("temperature", 0.7)
                    put("responseMimeType", "application/json")
                })
            }

            val requestBody = requestJson.toString().toRequestBody("application/json".toMediaType())
            val url = "$BASE_URL/$MODEL_NAME:generateContent?key=$apiKey"

            val httpRequest = Request.Builder()
                .url(url)
                .post(requestBody)
                .build()

            val response = client.newCall(httpRequest).execute()
            val bodyString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(
                    Exception("Error de Gemini API (${response.code}): $bodyString")
                )
            }

            val responseJson = JSONObject(bodyString)
            val candidates = responseJson.optJSONArray("candidates")
            val firstCandidate = candidates?.optJSONObject(0)
            val content = firstCandidate?.optJSONObject("content")
            val parts = content?.optJSONArray("parts")
            val textOutput = parts?.optJSONObject(0)?.optString("text") ?: ""

            val cleanedJson = textOutput
                .replace("```json", "")
                .replace("```", "")
                .trim()

            val parsed = JSONObject(cleanedJson)

            val questionsList = mutableListOf<String>()
            val qArray = parsed.optJSONArray("keyQuestions")
            if (qArray != null) {
                for (i in 0 until qArray.length()) {
                    questionsList.add(qArray.optString(i))
                }
            }

            val inspiration = AiDevotionalInspiration(
                mainMessage = parsed.optString("mainMessage", ""),
                practicalApplication = parsed.optString("practicalApplication", ""),
                guidedPrayer = parsed.optString("guidedPrayer", ""),
                keyQuestions = questionsList
            )

            Result.success(inspiration)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    suspend fun generateWeeklyLeaderReport(
        week: R07WeekEntity,
        days: List<R07DayEntryEntity>,
        goals: List<R07WeeklyGoalEntity>
    ): Result<AiWeeklyLeaderSummary> = withContext(Dispatchers.IO) {
        try {
            val apiKey = getApiKey()
            if (apiKey.isBlank() || apiKey == "MY_GEMINI_API_KEY") {
                return@withContext Result.failure(
                    IllegalStateException("Configura tu GEMINI_API_KEY en el panel de Secretos de AI Studio.")
                )
            }

            val daysSummary = days.joinToString("\n") { d ->
                "- Día ${d.dayNumber} (${d.dayName}): Cita: ${d.scriptureRef} | Ánimo: ${d.mood} | Notas: ${d.reflectionText.take(120)}"
            }

            val goalsSummary = goals.joinToString(", ") { "${it.title} (${if (it.isCompleted) "Completada" else "Pendiente"})" }

            val prompt = """
                Eres una mentora pastoral que redacta un resumen devocional edificante de la semana para rendir cuentas al líder de célula/grupo de discipulado.
                
                Información de la semana:
                - Período: ${week.startDate} al ${week.endDate}
                - Meta de lectura: ${week.readingGoal} (Cumplida: ${week.isGoalCompleted})
                - Asistencia a tiempos de oración: ${week.prayerAttendanceCount} veces
                - Metas semanales: $goalsSummary
                - Devocionales diarios registrados:
                $daysSummary
                
                Genera un reporte estructurado y respetuoso:
                1. 'executiveSummary': Síntesis del caminar espiritual de la semana (2 párrafos).
                2. 'spiritualHighlights': Lista de 3 aprendizajes o victorias espirituales clave.
                3. 'prayerRequestSummary': Petición de oración o área de crecimiento para la siguiente semana.
                4. 'pastoralEncouragement': Un versículo y palabra de aliento para el líder y el discípulo.
                
                Responde ÚNICAMENTE en formato JSON:
                {
                  "executiveSummary": "...",
                  "spiritualHighlights": ["Victoria 1", "Victoria 2", "Victoria 3"],
                  "prayerRequestSummary": "...",
                  "pastoralEncouragement": "..."
                }
            """.trimIndent()

            val requestJson = JSONObject().apply {
                val contentsArray = JSONArray()
                val contentObj = JSONObject().apply {
                    val partsArray = JSONArray()
                    partsArray.put(JSONObject().apply {
                        put("text", prompt)
                    })
                    put("parts", partsArray)
                }
                contentsArray.put(contentObj)
                put("contents", contentsArray)

                put("generationConfig", JSONObject().apply {
                    put("temperature", 0.6)
                    put("responseMimeType", "application/json")
                })
            }

            val requestBody = requestJson.toString().toRequestBody("application/json".toMediaType())
            val url = "$BASE_URL/$MODEL_NAME:generateContent?key=$apiKey"

            val httpRequest = Request.Builder()
                .url(url)
                .post(requestBody)
                .build()

            val response = client.newCall(httpRequest).execute()
            val bodyString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(
                    Exception("Error de Gemini API (${response.code}): $bodyString")
                )
            }

            val responseJson = JSONObject(bodyString)
            val candidates = responseJson.optJSONArray("candidates")
            val firstCandidate = candidates?.optJSONObject(0)
            val content = firstCandidate?.optJSONObject("content")
            val parts = content?.optJSONArray("parts")
            val textOutput = parts?.optJSONObject(0)?.optString("text") ?: ""

            val cleanedJson = textOutput
                .replace("```json", "")
                .replace("```", "")
                .trim()

            val parsed = JSONObject(cleanedJson)
            val highlightsList = mutableListOf<String>()
            val hArray = parsed.optJSONArray("spiritualHighlights")
            if (hArray != null) {
                for (i in 0 until hArray.length()) {
                    highlightsList.add(hArray.optString(i))
                }
            }

            val summary = AiWeeklyLeaderSummary(
                executiveSummary = parsed.optString("executiveSummary", ""),
                spiritualHighlights = highlightsList,
                prayerRequestSummary = parsed.optString("prayerRequestSummary", ""),
                pastoralEncouragement = parsed.optString("pastoralEncouragement", "")
            )

            Result.success(summary)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    suspend fun generatePersonalizedPrayer(
        feelingOrSituation: String,
        scriptureRef: String = "",
        userName: String = ""
    ): Result<AiGuidedPrayerResponse> = withContext(Dispatchers.IO) {
        try {
            val apiKey = getApiKey()
            if (apiKey.isBlank() || apiKey == "MY_GEMINI_API_KEY") {
                return@withContext Result.failure(
                    IllegalStateException("Configura tu GEMINI_API_KEY en el panel de Secretos de AI Studio para activar la Guía de Oración con IA.")
                )
            }

            val prompt = """
                Eres una mentora espiritual y pastora cristiana bíblica, sabia, compasiva y profunda.
                Un creyente ${if (userName.isNotBlank()) "llamado $userName" else ""} necesita aprender a orar y desahogar su corazón ante Dios hoy.
                
                Situación o emociones descritas por la persona:
                "${if (feelingOrSituation.isNotBlank()) feelingOrSituation else "Buscando paz, guía y fortaleza espiritual en Dios."}"
                
                ${if (scriptureRef.isNotBlank()) "Pasaje bíblico leído en su devocional: $scriptureRef" else ""}
                
                Genera una guía de oración estructurada, profundamente bíblica y personal, basada en el modelo de 4 pilares de oración cristiana (Adoración, Desahogo sincero, Petición con fe, Agradecimiento y Promesa):
                
                1. 'title': Un título espiritual reconfortante (ej. 'Oración por paz en medio de la incertidumbre').
                2. 'adoration': Reconocimiento y alabanza a Dios por quién es Él ante esta circunstancia (1-2 oraciones).
                3. 'confessionAndHonesty': Desahogo sincero expresando las emociones reales ante Dios sin máscaras (1-2 oraciones).
                4. 'petitionAndFaith': Clamor y petición clara y específica con fe, pidiendo la intervención y dirección divina (2 oraciones).
                5. 'gratitudeAndDeclaration': Agradecimiento por la respuesta y declaración de confianza y paz en Cristo (1-2 oraciones).
                6. 'fullPrayerText': La oración completa, redactada en primera persona ("Señor Jesús, hoy vengo ante ti..."), fluida, íntima y lista para orar de corazón.
                7. 'biblicalPromise': Un versículo bíblico textual completo de promesa y consuelo adecuado para esta situación, con su cita (ej. '«No se inquieten por nada...» — Filipenses 4:6-7').
                
                Responde ÚNICAMENTE en JSON con esta estructura exacta:
                {
                  "title": "...",
                  "adoration": "...",
                  "confessionAndHonesty": "...",
                  "petitionAndFaith": "...",
                  "gratitudeAndDeclaration": "...",
                  "fullPrayerText": "...",
                  "biblicalPromise": "..."
                }
            """.trimIndent()

            val requestJson = JSONObject().apply {
                val contentsArray = JSONArray()
                val contentObj = JSONObject().apply {
                    val partsArray = JSONArray()
                    partsArray.put(JSONObject().apply {
                        put("text", prompt)
                    })
                    put("parts", partsArray)
                }
                contentsArray.put(contentObj)
                put("contents", contentsArray)

                put("generationConfig", JSONObject().apply {
                    put("temperature", 0.7)
                    put("responseMimeType", "application/json")
                })
            }

            val requestBody = requestJson.toString().toRequestBody("application/json".toMediaType())
            val url = "$BASE_URL/$MODEL_NAME:generateContent?key=$apiKey"

            val httpRequest = Request.Builder()
                .url(url)
                .post(requestBody)
                .build()

            val response = client.newCall(httpRequest).execute()
            val bodyString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(
                    Exception("Error de Gemini API (${response.code}): $bodyString")
                )
            }

            val responseJson = JSONObject(bodyString)
            val candidates = responseJson.optJSONArray("candidates")
            val firstCandidate = candidates?.optJSONObject(0)
            val content = firstCandidate?.optJSONObject("content")
            val parts = content?.optJSONArray("parts")
            val textOutput = parts?.optJSONObject(0)?.optString("text") ?: ""

            val cleanedJson = textOutput
                .replace("```json", "")
                .replace("```", "")
                .trim()

            val parsed = JSONObject(cleanedJson)

            val guidedPrayer = AiGuidedPrayerResponse(
                title = parsed.optString("title", "Guía de Oración Personalizada"),
                adoration = parsed.optString("adoration", ""),
                confessionAndHonesty = parsed.optString("confessionAndHonesty", ""),
                petitionAndFaith = parsed.optString("petitionAndFaith", ""),
                gratitudeAndDeclaration = parsed.optString("gratitudeAndDeclaration", ""),
                fullPrayerText = parsed.optString("fullPrayerText", ""),
                biblicalPromise = parsed.optString("biblicalPromise", "")
            )

            Result.success(guidedPrayer)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }
}
