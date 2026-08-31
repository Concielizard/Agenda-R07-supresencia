package com.example.util

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import android.widget.Toast
import androidx.core.content.FileProvider
import com.example.data.local.AppEdition
import com.example.data.model.R07DayEntryEntity
import com.example.data.model.R07WeekEntity
import com.example.data.model.R07WeeklyGoalEntity
import org.json.JSONArray
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object R07PdfExporter {

    data class ExportResult(
        val success: Boolean,
        val file: File? = null,
        val contentUri: Uri? = null,
        val publicPathDescription: String = "",
        val pageCount: Int = 1,
        val errorMessage: String? = null
    )

    fun generateR07Pdf(
        context: Context,
        week: R07WeekEntity,
        days: List<R07DayEntryEntity>,
        goals: List<R07WeeklyGoalEntity> = emptyList(),
        edition: AppEdition = AppEdition.WOMEN,
        leaderName: String = "",
        includePhotos: Boolean = true
    ): ExportResult {
        try {
            val pdfDocument = PdfDocument()
            val pageWidth = 595
            val pageHeight = 842
            var pageCounter = 1

            // Page 1: Main R07 Weekly Table Sheet
            val mainPageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageCounter).create()
            val mainPage = pdfDocument.startPage(mainPageInfo)
            drawR07Sheet(mainPage.canvas, pageWidth, pageHeight, week, days, goals, edition, leaderName)
            pdfDocument.finishPage(mainPage)

            // Additional Annex Pages: Notebook Photos
            if (includePhotos) {
                val daysWithPhotos = days.filter { it.photoUrisJson.isNotBlank() }
                for (day in daysWithPhotos) {
                    val uris = try {
                        val arr = JSONArray(day.photoUrisJson)
                        val list = mutableListOf<String>()
                        for (i in 0 until arr.length()) list.add(arr.getString(i))
                        list
                    } catch (e: Exception) {
                        emptyList<String>()
                    }

                    uris.forEachIndexed { photoIndex, uriString ->
                        val bitmap = loadBitmapFromUri(context, Uri.parse(uriString))
                        if (bitmap != null) {
                            pageCounter++
                            val photoPageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, pageCounter).create()
                            val photoPage = pdfDocument.startPage(photoPageInfo)
                            drawPhotoAnnexPage(
                                canvas = photoPage.canvas,
                                width = pageWidth,
                                height = pageHeight,
                                bitmap = bitmap,
                                day = day,
                                photoIndex = photoIndex + 1,
                                totalPhotosForDay = uris.size,
                                edition = edition
                            )
                            pdfDocument.finishPage(photoPage)
                        }
                    }
                }
            }

            // Save PDF
            val cleanTitle = week.title.replace("[^a-zA-Z0-9]".toRegex(), "_")
            val fileName = "R07_${cleanTitle}_${System.currentTimeMillis()}.pdf"
            val cacheFile = File(context.cacheDir, fileName)
            FileOutputStream(cacheFile).use { out ->
                pdfDocument.writeTo(out)
            }

            var publicDesc = "Guardado en caché de la app"
            var publicUri: Uri? = null

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val contentValues = ContentValues().apply {
                        put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                        put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    }
                    val resolver = context.contentResolver
                    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                    if (uri != null) {
                        resolver.openOutputStream(uri)?.use { outStream ->
                            cacheFile.inputStream().use { inStream ->
                                inStream.copyTo(outStream)
                            }
                        }
                        publicDesc = "Descargas / $fileName"
                        publicUri = uri
                    }
                } else {
                    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    if (downloadsDir.exists() || downloadsDir.mkdirs()) {
                        val publicFile = File(downloadsDir, fileName)
                        cacheFile.copyTo(publicFile, overwrite = true)
                        publicDesc = "Descargas / $fileName"
                    }
                }
            } catch (e: Exception) {
                publicDesc = "Listo para compartir: $fileName"
            }

            pdfDocument.close()

            val authority = "${context.packageName}.fileprovider"
            val contentUri = FileProvider.getUriForFile(context, authority, cacheFile)

            return ExportResult(
                success = true,
                file = cacheFile,
                contentUri = contentUri,
                publicPathDescription = publicDesc,
                pageCount = pageCounter
            )
        } catch (e: Exception) {
            e.printStackTrace()
            return ExportResult(
                success = false,
                errorMessage = e.localizedMessage ?: "Error al crear el reporte PDF"
            )
        }
    }

    private fun loadBitmapFromUri(context: Context, uri: Uri): Bitmap? {
        return try {
            val input: InputStream? = context.contentResolver.openInputStream(uri)
            val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeStream(input, null, options)
            input?.close()

            var sampleSize = 1
            while (options.outWidth / sampleSize > 1200 || options.outHeight / sampleSize > 1600) {
                sampleSize *= 2
            }

            val decodeInput: InputStream? = context.contentResolver.openInputStream(uri)
            val decodeOptions = BitmapFactory.Options().apply { inSampleSize = sampleSize }
            val bitmap = BitmapFactory.decodeStream(decodeInput, null, decodeOptions)
            decodeInput?.close()
            bitmap
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun drawR07Sheet(
        canvas: Canvas,
        width: Int,
        height: Int,
        week: R07WeekEntity,
        days: List<R07DayEntryEntity>,
        goals: List<R07WeeklyGoalEntity>,
        edition: AppEdition,
        leaderName: String
    ) {
        val isMen = edition == AppEdition.MEN
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        val textPaint = TextPaint(Paint.ANTI_ALIAS_FLAG)

        val primaryColor = if (isMen) Color.rgb(21, 101, 192) else Color.rgb(180, 55, 88)
        val primaryDark = if (isMen) Color.rgb(13, 71, 161) else Color.rgb(136, 14, 79)
        val primaryBg = if (isMen) Color.rgb(235, 243, 253) else Color.rgb(255, 241, 245)
        val borderColor = if (isMen) Color.rgb(187, 210, 236) else Color.rgb(222, 175, 188)
        val headerTableBg = if (isMen) Color.rgb(30, 100, 180) else Color.rgb(205, 115, 138)

        // Background
        paint.color = Color.rgb(255, 254, 252)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        // Outer Border
        paint.style = Paint.Style.STROKE
        paint.color = borderColor
        paint.strokeWidth = 2f
        canvas.drawRoundRect(RectF(20f, 20f, width - 20f, height - 20f), 12f, 12f, paint)

        // Header Background Banner
        paint.style = Paint.Style.FILL
        paint.color = primaryBg
        canvas.drawRoundRect(RectF(28f, 28f, width - 28f, 122f), 8f, 8f, paint)

        // Header Title
        paint.color = primaryDark
        paint.textSize = 18f
        paint.typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
        val titlePrefix = if (isMen) "Pasa tiempo Conmigo ⚔️" else "Pasa tiempo Conmigo 🌸"
        canvas.drawText(titlePrefix, 42f, 52f, paint)

        paint.textSize = 11f
        paint.color = Color.rgb(80, 80, 90)
        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        val editionSubtitle = if (isMen) "R07 • Agenda Devocional Semanal para Hombres" else "R07 • Agenda Devocional Semanal para Mujeres"
        canvas.drawText(editionSubtitle, 42f, 68f, paint)

        // R07 Badge
        paint.color = primaryDark
        paint.textSize = 22f
        paint.typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
        canvas.drawText("R07", width - 85f, 54f, paint)

        // Metadata grid
        paint.textSize = 8.5f
        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        paint.color = primaryDark
        canvas.drawText("FECHA:", 42f, 86f, paint)

        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        paint.color = Color.rgb(50, 40, 42)
        val dateRange = "${week.startDate} al ${week.endDate}"
        canvas.drawText(dateRange, 85f, 86f, paint)

        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        paint.color = primaryDark
        canvas.drawText("META DE LECTURA:", 42f, 102f, paint)

        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        paint.color = Color.rgb(50, 40, 42)
        val goalText = if (week.readingGoal.isNotBlank()) week.readingGoal else "Lectura diaria de la palabra"
        canvas.drawText(goalText.take(38), 140f, 102f, paint)

        // Right side info: Leader & Prayer Attendance
        val rightColX = 330f
        if (leaderName.isNotBlank()) {
            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            paint.color = primaryDark
            canvas.drawText("LÍDER:", rightColX, 86f, paint)

            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
            paint.color = Color.rgb(50, 40, 42)
            canvas.drawText(leaderName.take(25), rightColX + 45f, 86f, paint)
        } else {
            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            paint.color = primaryDark
            canvas.drawText("¿CUMPLÍ LA META?:", rightColX, 86f, paint)

            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
            paint.color = if (week.isGoalCompleted) Color.rgb(40, 130, 70) else primaryColor
            val goalStatus = if (week.isGoalCompleted) "✓ SÍ, CUMPLIDA" else "En proceso"
            canvas.drawText(goalStatus, rightColX + 95f, 86f, paint)
        }

        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        paint.color = primaryDark
        canvas.drawText("ASISTENCIA A ORACIÓN:", rightColX, 102f, paint)

        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        paint.color = primaryColor
        canvas.drawText("${week.prayerAttendanceCount} veces", rightColX + 115f, 102f, paint)

        // Goals Banner
        val goalsTop = 130f
        val goalsHeight = 36f
        paint.style = Paint.Style.FILL
        paint.color = primaryBg
        canvas.drawRoundRect(RectF(28f, goalsTop, width - 28f, goalsTop + goalsHeight), 6f, 6f, paint)

        paint.color = primaryDark
        paint.textSize = 8.5f
        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        canvas.drawText("🎯 METAS SEMANALES Y PROGRESO:", 38f, goalsTop + 14f, paint)

        paint.textSize = 7.5f
        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        paint.color = Color.rgb(60, 45, 50)

        if (goals.isNotEmpty()) {
            val completedGoalsCount = goals.count { it.isCompleted }
            val goalsSummary = goals.take(3).joinToString("   •   ") { g ->
                val check = if (g.isCompleted) "✓" else "○"
                "[$check] ${g.title}"
            }
            canvas.drawText(goalsSummary.take(105), 38f, goalsTop + 28f, paint)

            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            paint.color = primaryColor
            canvas.drawText("($completedGoalsCount/${goals.size} Logradas)", width - 110f, goalsTop + 14f, paint)
        } else {
            canvas.drawText("Semana enfocada en fidelidad en el devocional y oración diaria.", 38f, goalsTop + 28f, paint)
        }

        // Table Header
        val tableTop = 174f
        val tableLeft = 28f
        val tableRight = width - 28f
        val col1Width = 65f  // DÍA / FECHA
        val col2Width = 50f  // HORA
        val col3Width = 65f  // ÁNIMO
        val col4Width = 85f  // LECTURA
        val col5Width = tableRight - tableLeft - col1Width - col2Width - col3Width - col4Width // REFLEXIÓN

        paint.style = Paint.Style.FILL
        paint.color = headerTableBg
        canvas.drawRoundRect(RectF(tableLeft, tableTop, tableRight, tableTop + 22f), 4f, 4f, paint)

        paint.color = Color.WHITE
        paint.textSize = 8f
        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)

        canvas.drawText("DÍA / FECHA", tableLeft + 6f, tableTop + 14f, paint)
        canvas.drawText("HORA", tableLeft + col1Width + 6f, tableTop + 14f, paint)
        canvas.drawText("ÁNIMO", tableLeft + col1Width + col2Width + 6f, tableTop + 14f, paint)
        canvas.drawText("LECTURA", tableLeft + col1Width + col2Width + col3Width + 6f, tableTop + 14f, paint)
        canvas.drawText("DESCRIBE TU R07 (REFLEXIÓN & ORACIÓN)", tableLeft + col1Width + col2Width + col3Width + col4Width + 8f, tableTop + 14f, paint)

        // Table Rows - 7 days
        val availableHeightForRows = height - tableTop - 65f
        val rowHeight = availableHeightForRows / 7f
        var currentY = tableTop + 22f

        for (i in 0 until 7) {
            val day = days.getOrNull(i)
            val isEven = i % 2 == 0

            paint.style = Paint.Style.FILL
            paint.color = if (isEven) Color.WHITE else Color.rgb(250, 252, 255)
            canvas.drawRect(tableLeft, currentY, tableRight, currentY + rowHeight, paint)

            paint.style = Paint.Style.STROKE
            paint.strokeWidth = 0.6f
            paint.color = borderColor
            canvas.drawLine(tableLeft, currentY + rowHeight, tableRight, currentY + rowHeight, paint)

            canvas.drawLine(tableLeft + col1Width, currentY, tableLeft + col1Width, currentY + rowHeight, paint)
            canvas.drawLine(tableLeft + col1Width + col2Width, currentY, tableLeft + col1Width + col2Width, currentY + rowHeight, paint)
            canvas.drawLine(tableLeft + col1Width + col2Width + col3Width, currentY, tableLeft + col1Width + col2Width + col3Width, currentY + rowHeight, paint)
            canvas.drawLine(tableLeft + col1Width + col2Width + col3Width + col4Width, currentY, tableLeft + col1Width + col2Width + col3Width + col4Width, currentY + rowHeight, paint)
            canvas.drawLine(tableLeft, currentY, tableLeft, currentY + rowHeight, paint)
            canvas.drawLine(tableRight, currentY, tableRight, currentY + rowHeight, paint)

            // Content
            paint.style = Paint.Style.FILL
            paint.color = Color.rgb(50, 40, 45)

            // Col 1
            paint.textSize = 8.5f
            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            val dayTitle = if (day != null) "${day.dayNumber}. ${day.dayName.take(3)}" else "Día ${i + 1}"
            canvas.drawText(dayTitle, tableLeft + 6f, currentY + 16f, paint)

            paint.textSize = 7.5f
            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
            paint.color = Color.rgb(110, 110, 120)
            canvas.drawText(day?.dateText ?: "", tableLeft + 6f, currentY + 28f, paint)

            // Col 2
            paint.textSize = 8f
            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
            paint.color = Color.rgb(60, 50, 55)
            canvas.drawText(day?.timeText?.ifBlank { "—" } ?: "—", tableLeft + col1Width + 6f, currentY + 20f, paint)

            // Col 3
            paint.textSize = 7.5f
            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            paint.color = primaryDark
            val moodLabel = when {
                day != null && day.mood.isNotBlank() -> "${day.moodEmoji} ${day.mood}"
                else -> "—"
            }
            canvas.drawText(moodLabel.take(13), tableLeft + col1Width + col2Width + 4f, currentY + 20f, paint)

            // Col 4
            paint.textSize = 7.5f
            paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            paint.color = primaryColor
            val scriptureLabel = day?.scriptureRef?.ifBlank { "—" } ?: "—"
            if (scriptureLabel.length > 15) {
                val line1 = scriptureLabel.take(14)
                val line2 = scriptureLabel.substring(14)
                canvas.drawText(line1, tableLeft + col1Width + col2Width + col3Width + 6f, currentY + 16f, paint)
                canvas.drawText(line2, tableLeft + col1Width + col2Width + col3Width + 6f, currentY + 28f, paint)
            } else {
                canvas.drawText(scriptureLabel, tableLeft + col1Width + col2Width + col3Width + 6f, currentY + 20f, paint)
            }

            // Col 5
            val descX = tableLeft + col1Width + col2Width + col3Width + col4Width + 8f
            val descWidth = (col5Width - 16f).toInt().coerceAtLeast(50)

            textPaint.textSize = 7.5f
            textPaint.color = Color.rgb(45, 35, 40)
            textPaint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)

            val reflectionText = day?.reflectionText?.ifBlank {
                "Sin notas registradas para este día."
            } ?: "Sin notas registradas."

            val staticLayout = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                StaticLayout.Builder.obtain(reflectionText, 0, reflectionText.length, textPaint, descWidth)
                    .setAlignment(Layout.Alignment.ALIGN_NORMAL)
                    .setLineSpacing(1.5f, 1.0f)
                    .setMaxLines(4)
                    .build()
            } else {
                @Suppress("DEPRECATION")
                StaticLayout(reflectionText, textPaint, descWidth, Layout.Alignment.ALIGN_NORMAL, 1.0f, 1.5f, false)
            }

            canvas.save()
            canvas.translate(descX, currentY + 7f)
            staticLayout.draw(canvas)
            canvas.restore()

            currentY += rowHeight
        }

        // Footer
        val footerY = height - 36f
        paint.color = primaryDark
        paint.textSize = 9f
        paint.typeface = Typeface.create(Typeface.SERIF, Typeface.ITALIC)
        val footerVerse = if (week.verseOfTheWeek.isNotBlank()) week.verseOfTheWeek else "«Pasa tiempo Conmigo»"
        canvas.drawText(footerVerse.take(70), 32f, footerY, paint)

        val sdfPrint = SimpleDateFormat("d 'de' MMMM yyyy", Locale("es", "ES"))
        val datePrinted = "Generado el: ${sdfPrint.format(Date())}"
        paint.textSize = 7.5f
        paint.color = Color.rgb(130, 110, 115)
        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        canvas.drawText(datePrinted, width - 180f, footerY, paint)
    }

    private fun drawPhotoAnnexPage(
        canvas: Canvas,
        width: Int,
        height: Int,
        bitmap: Bitmap,
        day: R07DayEntryEntity,
        photoIndex: Int,
        totalPhotosForDay: Int,
        edition: AppEdition
    ) {
        val isMen = edition == AppEdition.MEN
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        val primaryDark = if (isMen) Color.rgb(13, 71, 161) else Color.rgb(136, 14, 79)
        val primaryBg = if (isMen) Color.rgb(235, 243, 253) else Color.rgb(255, 241, 245)
        val borderColor = if (isMen) Color.rgb(187, 210, 236) else Color.rgb(222, 175, 188)

        // Background
        paint.color = Color.rgb(255, 255, 255)
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        // Outer Border
        paint.style = Paint.Style.STROKE
        paint.color = borderColor
        paint.strokeWidth = 2f
        canvas.drawRoundRect(RectF(20f, 20f, width - 20f, height - 20f), 12f, 12f, paint)

        // Header Annex Banner
        paint.style = Paint.Style.FILL
        paint.color = primaryBg
        canvas.drawRoundRect(RectF(28f, 28f, width - 28f, 96f), 8f, 8f, paint)

        paint.color = primaryDark
        paint.textSize = 14f
        paint.typeface = Typeface.create(Typeface.SERIF, Typeface.BOLD)
        canvas.drawText("ANEXO • FOTOS DEL CUADERNO DEVOCIONAL", 42f, 54f, paint)

        paint.textSize = 10.5f
        paint.color = Color.rgb(60, 60, 70)
        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        val subtitle = "Día ${day.dayNumber} • ${day.dayName} (${day.dateText}) — Página $photoIndex de $totalPhotosForDay | Cita: ${day.scriptureRef.ifBlank { '—' }}"
        canvas.drawText(subtitle, 42f, 76f, paint)

        // Draw the photo in the center
        val availableW = width - 64f
        val availableH = height - 150f
        val bmpW = bitmap.width.toFloat()
        val bmpH = bitmap.height.toFloat()

        val scale = minOf(availableW / bmpW, availableH / bmpH)
        val drawW = bmpW * scale
        val drawH = bmpH * scale

        val left = 32f + (availableW - drawW) / 2f
        val top = 110f + (availableH - drawH) / 2f
        val dstRect = RectF(left, top, left + drawW, top + drawH)

        // Photo shadow / border
        paint.style = Paint.Style.STROKE
        paint.color = Color.rgb(200, 200, 200)
        paint.strokeWidth = 1f
        canvas.drawRect(dstRect, paint)

        // Draw Bitmap
        canvas.drawBitmap(bitmap, null, dstRect, null)

        // Footer
        val footerY = height - 30f
        paint.style = Paint.Style.FILL
        paint.color = Color.rgb(120, 120, 130)
        paint.textSize = 8.5f
        paint.typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        canvas.drawText("Evidencia física de devocional manuscrito para revisión del líder de grupo.", 42f, footerY, paint)
    }

    fun sharePdf(context: Context, result: ExportResult) {
        val uri = result.contentUri ?: return
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, "Mi R07 Semanal • Pasa tiempo Conmigo")
            putExtra(Intent.EXTRA_TEXT, "Te comparto mi hoja de R07 semanal «Pasa tiempo Conmigo».")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        val chooser = Intent.createChooser(intent, "Compartir archivo R07 en formato PDF")
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(chooser)
    }

    fun shareToWhatsApp(context: Context, phoneNumber: String, result: ExportResult, customMessage: String) {
        val uri = result.contentUri
        try {
            val cleanNumber = phoneNumber.replace("[^0-9+]".toRegex(), "")
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                if (cleanNumber.isNotBlank()) {
                    putExtra("jid", "$cleanNumber@s.whatsapp.net")
                }
                setPackage("com.whatsapp")
                if (uri != null) {
                    putExtra(Intent.EXTRA_STREAM, uri)
                }
                putExtra(Intent.EXTRA_TEXT, customMessage)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            // Fallback to standard chooser if WhatsApp package not directly launched
            sharePdf(context, result)
        }
    }

    fun shareToEmail(context: Context, emailAddress: String, result: ExportResult, customSubject: String, customBody: String) {
        val uri = result.contentUri
        try {
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                if (emailAddress.isNotBlank()) {
                    putExtra(Intent.EXTRA_EMAIL, arrayOf(emailAddress))
                }
                putExtra(Intent.EXTRA_SUBJECT, customSubject)
                putExtra(Intent.EXTRA_TEXT, customBody)
                if (uri != null) {
                    putExtra(Intent.EXTRA_STREAM, uri)
                }
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val chooser = Intent.createChooser(intent, "Enviar reporte R07 por Correo")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(chooser)
        } catch (e: Exception) {
            sharePdf(context, result)
        }
    }

    fun openPdf(context: Context, result: ExportResult) {
        val uri = result.contentUri ?: return
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/pdf")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            sharePdf(context, result)
        }
    }

    fun generateFormattedTextSummary(
        week: R07WeekEntity,
        days: List<R07DayEntryEntity>,
        goals: List<R07WeeklyGoalEntity> = emptyList(),
        leaderName: String = ""
    ): String {
        val sb = StringBuilder()
        sb.appendLine("🌸 *R07 • PASA TIEMPO CONMIGO* 🌸")
        sb.appendLine("📅 *Período:* ${week.startDate} al ${week.endDate}")
        if (leaderName.isNotBlank()) {
            sb.appendLine("👤 *Líder de Grupo:* $leaderName")
        }
        sb.appendLine("📖 *Meta de lectura:* ${if (week.readingGoal.isNotBlank()) week.readingGoal else "—"}")
        sb.appendLine("✨ *¿Cumplí la meta?:* ${if (week.isGoalCompleted) "✅ SÍ" else "🔄 En proceso"}")
        sb.appendLine("🙏 *Veces que asistí a oración:* ${week.prayerAttendanceCount} veces")
        sb.appendLine("🌿 *Versículo de la semana:* ${week.verseOfTheWeek}")
        sb.appendLine()

        if (goals.isNotEmpty()) {
            sb.appendLine("━━━━━━━━━━━━━━━━━━━")
            sb.appendLine("🎯 *METAS DE LA SEMANA:*")
            sb.appendLine("━━━━━━━━━━━━━━━━━━━")
            goals.forEach { g ->
                val mark = if (g.isCompleted) "✅" else "⭕"
                sb.appendLine("$mark *${g.title}* (${g.category})")
            }
            sb.appendLine("Progreso: ${goals.count { it.isCompleted }}/${goals.size} completadas")
            sb.appendLine()
        }

        sb.appendLine("━━━━━━━━━━━━━━━━━━━")
        sb.appendLine("📝 *DESCRIPCIÓN DIARIA DEL R07:*")
        sb.appendLine("━━━━━━━━━━━━━━━━━━━")

        days.sortedBy { it.dayNumber }.forEach { day ->
            sb.appendLine("📌 *Día ${day.dayNumber} • ${day.dayName} (${day.dateText})*")
            if (day.mood.isNotBlank()) sb.appendLine("💖 Ánimo: ${day.moodEmoji} ${day.mood}")
            if (day.timeText.isNotBlank()) sb.appendLine("⏰ Hora: ${day.timeText}")
            if (day.scriptureRef.isNotBlank()) sb.appendLine("📖 Lectura: ${day.scriptureRef}")
            if (day.reflectionText.isNotBlank()) {
                sb.appendLine("💬 Describe tu R07: ${day.reflectionText}")
            } else {
                sb.appendLine("💬 _(Sin notas registradas)_")
            }
            sb.appendLine()
        }

        sb.appendLine("✨ _\"Pasa tiempo Conmigo y saciaré tu alma\"_")
        return sb.toString()
    }
}
