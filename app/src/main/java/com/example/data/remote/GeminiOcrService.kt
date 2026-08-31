package com.example.data.remote

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.util.Base64
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.util.concurrent.TimeUnit

data class ScannedR07Entry(
    val dayNumber: Int = 1,
    val dayName: String = "",
    val timeText: String = "",
    val scriptureRef: String = "",
    val godSpoke: String = "",
    val reflectionText: String = "",
    val actionStep: String = "",
    val prayerText: String = "",
    val mood: String = "",
    val moodEmoji: String = "",
    val fullTranscription: String = "",
    val legibilityScore: Int = 100, // 0 to 100
    val legibilityNotes: String = "", // Validation feedback for user
    val pageCount: Int = 1,
    val photoUris: List<String> = emptyList()
)

object GeminiOcrService {

    private const val MODEL_NAME = "gemini-3.5-flash"
    private const val BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    private val client = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    fun loadScaledBitmap(context: Context, imageUri: Uri, maxDimension: Int = 1280): Bitmap? {
        return try {
            val inputForBounds: InputStream? = context.contentResolver.openInputStream(imageUri)
            val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeStream(inputForBounds, null, options)
            inputForBounds?.close()

            var sampleSize = 1
            while (options.outWidth / sampleSize > maxDimension || options.outHeight / sampleSize > maxDimension) {
                sampleSize *= 2
            }

            val inputForDecode: InputStream? = context.contentResolver.openInputStream(imageUri)
            val decodeOptions = BitmapFactory.Options().apply { inSampleSize = sampleSize }
            val bitmap = BitmapFactory.decodeStream(inputForDecode, null, decodeOptions)
            inputForDecode?.close()
            bitmap
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun bitmapToBase64(bitmap: Bitmap): String {
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, outputStream)
        val byteArray = outputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.NO_WRAP)
    }

    suspend fun interpretMultiPageR07Photos(
        bitmaps: List<Bitmap>,
        targetDayNumber: Int = 1,
        photoUris: List<String> = emptyList()
    ): Result<ScannedR07Entry> = withContext(Dispatchers.IO) {
        try {
            if (bitmaps.isEmpty()) {
                return@withContext Result.failure(IllegalArgumentException("No se seleccionaron imágenes para transcribir."))
            }

            val apiKey = try {
                BuildConfig.GEMINI_API_KEY
            } catch (e: Exception) {
                ""
            }

            if (apiKey.isBlank() || apiKey == "MY_GEMINI_API_KEY") {
                return@withContext Result.failure(
                    IllegalStateException("Configura tu GEMINI_API_KEY en el panel de Secretos de AI Studio para interpretar tus fotos con IA.")
                )
            }

            val prompt = """
                Eres una asistente devocional cristiana especializada en transcribir, interpretar y estructurar hojas físicas de devocionales y agendas R07 ('Pasa tiempo Conmigo') escritas a mano.
                Se te proporcionan ${bitmaps.size} foto(s) de las páginas del cuaderno devocional físico del usuario.

                Instrucciones críticas:
                1. Analiza todas las imágenes en orden secuencial (Página 1, Página 2, etc.) combinando el contexto continuo.
                2. Extrae y estructura los siguientes campos con la mayor fidelidad a la caligrafía del usuario:
                   - 'dayNumber': Número del día del devocional (1 al 7). Si la hoja no lo tiene explícito, usa $targetDayNumber.
                   - 'dayName': Nombre del día (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado o Domingo).
                   - 'timeText': Hora en que se realizó el devocional (ej. '06:30 AM', '07:00 AM'). Si no aparece, sugiere una hora matutina.
                   - 'scriptureRef': Cita bíblica o versículos leídos (ej. 'Salmos 23:1-6', 'Proverbios 3:5-6').
                   - 'godSpoke': Lo que Dios le habló / Principio bíblico / Rhema extraído de las notas.
                   - 'reflectionText': La reflexión personal, sentimientos, meditación y notas principales escritas.
                   - 'actionStep': Compromiso práctico, decisión de obediencia o meta anotada.
                   - 'prayerText': Oración escrita, clamor, peticiones o agradecimiento a Dios.
                   - 'mood': Estado de ánimo reflejado en el escrito (Elige: Agradecido/a, En Paz, Gozoso/a, Confiado/a, Reflexivo/a, Firme, Cansado/a, Afligido/a).
                   - 'moodEmoji': Emoji apropiado (🌸, 🕊️, ✨, 🌿, 🛡️, ⚔️, 💭, 🌧️, 💔).
                   - 'fullTranscription': Transcripción literal limpia y completa de todo el texto visible en las páginas.
                
                3. Evaluación de Calidad y Legibilidad:
                   - 'legibilityScore': Número entero del 1 al 100 estimando qué tan clara y nítida fue la caligrafía e imagen.
                   - 'legibilityNotes': Si alguna palabra, línea o página estuvo borrosa, oscura o dudosa, explícalo con amabilidad para que el usuario pueda corregirlo con el teclado o volver a tomar la foto. Si todo fue 100% claro, indica "Caligrafía clara y completamente legible".

                4. Responde EXCLUSIVAMENTE un objeto JSON válido con este esquema:
                {
                  "dayNumber": 1,
                  "dayName": "Lunes",
                  "timeText": "06:30 AM",
                  "scriptureRef": "Salmos 23:1-6",
                  "godSpoke": "El Señor es mi pastor y suplirá toda necesidad...",
                  "reflectionText": "Hoy sentí paz al leer que aunque pase por sombras...",
                  "actionStep": "Voy a confiar plenamente y no angustiarme por el trabajo...",
                  "prayerText": "Señor, gracias por cuidar a mi familia y guiarme hoy...",
                  "mood": "En Paz",
                  "moodEmoji": "🕊️",
                  "fullTranscription": "Transcripción completa...",
                  "legibilityScore": 95,
                  "legibilityNotes": "Caligrafía clara y completamente legible"
                }
            """.trimIndent()

            val requestJson = JSONObject().apply {
                val contentsArray = JSONArray()
                val contentObj = JSONObject().apply {
                    val partsArray = JSONArray()
                    
                    // Text prompt
                    partsArray.put(JSONObject().apply {
                        put("text", prompt)
                    })

                    // Add each image page
                    bitmaps.forEach { bitmap ->
                        val base64 = bitmapToBase64(bitmap)
                        partsArray.put(JSONObject().apply {
                            put("inlineData", JSONObject().apply {
                                put("mimeType", "image/jpeg")
                                put("data", base64)
                            })
                        })
                    }

                    put("parts", partsArray)
                }
                contentsArray.put(contentObj)
                put("contents", contentsArray)

                put("generationConfig", JSONObject().apply {
                    put("temperature", 0.2)
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
            val responseBodyString = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                return@withContext Result.failure(
                    Exception("Error de Gemini (${response.code}): $responseBodyString")
                )
            }

            val responseJson = JSONObject(responseBodyString)
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

            val godSpoke = parsed.optString("godSpoke", "")
            val reflectionText = parsed.optString("reflectionText", "")
            val actionStep = parsed.optString("actionStep", "")
            val prayerText = parsed.optString("prayerText", "")

            // Combine into structured full reflection if needed
            val fullText = parsed.optString("fullTranscription", "")

            val entry = ScannedR07Entry(
                dayNumber = parsed.optInt("dayNumber", targetDayNumber).coerceIn(1, 7),
                dayName = parsed.optString("dayName", ""),
                timeText = parsed.optString("timeText", "06:30 AM"),
                scriptureRef = parsed.optString("scriptureRef", ""),
                godSpoke = godSpoke,
                reflectionText = reflectionText,
                actionStep = actionStep,
                prayerText = prayerText,
                mood = parsed.optString("mood", "En Paz"),
                moodEmoji = parsed.optString("moodEmoji", "🕊️"),
                fullTranscription = fullText,
                legibilityScore = parsed.optInt("legibilityScore", 90),
                legibilityNotes = parsed.optString("legibilityNotes", "Transcripción completada."),
                pageCount = bitmaps.size,
                photoUris = photoUris
            )

            Result.success(entry)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }

    suspend fun interpretR07Photo(
        bitmap: Bitmap,
        targetDayNumber: Int = 1
    ): Result<ScannedR07Entry> = interpretMultiPageR07Photos(listOf(bitmap), targetDayNumber)
}
