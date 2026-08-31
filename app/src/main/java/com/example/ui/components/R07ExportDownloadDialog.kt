package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.WeekWithDays
import com.example.ui.theme.R07Theme
import com.example.util.R07PdfExporter

@Composable
fun R07ExportDownloadDialog(
    weekWithDays: WeekWithDays,
    exportResult: R07PdfExporter.ExportResult?,
    leaderName: String = "",
    leaderPhone: String = "",
    leaderEmail: String = "",
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val colors = R07Theme.colors
    val week = weekWithDays.week
    val days = weekWithDays.days
    val goals = weekWithDays.goals

    val completedDaysCount = days.count { it.isCompleted }
    val completedGoalsCount = goals.count { it.isCompleted }

    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = modifier.testTag("export_dialog"),
        shape = RoundedCornerShape(28.dp),
        containerColor = colors.surface,
        title = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(colors.primaryContainer)
                        .border(1.5.dp, colors.borderStrong, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.PictureAsPdf,
                        contentDescription = "PDF",
                        tint = colors.primary,
                        modifier = Modifier.size(28.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "¡Tu PDF para Líder está listo!",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = colors.textPrimary,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = if (exportResult?.pageCount != null && exportResult.pageCount > 1) {
                        "Hoja R07 + ${exportResult.pageCount - 1} foto(s) de evidencia manuscrita"
                    } else {
                        "Formato semanal «Pasa tiempo Conmigo»"
                    },
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary,
                    textAlign = TextAlign.Center
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Summary Card
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, colors.border, RoundedCornerShape(20.dp)),
                    shape = RoundedCornerShape(20.dp),
                    color = colors.primaryContainer.copy(alpha = 0.5f)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Semana:",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                            Text(
                                text = "${week.startDate} - ${week.endDate}",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                        }

                        if (leaderName.isNotBlank()) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Líder de grupo:",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = colors.textSecondary
                                )
                                Text(
                                    text = leaderName,
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Días descritos:",
                                style = MaterialTheme.typography.labelMedium,
                                color = colors.textSecondary
                            )
                            Text(
                                text = "$completedDaysCount de 7 días",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.primary
                            )
                        }

                        if (exportResult?.publicPathDescription?.isNotBlank() == true) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "📁 ${exportResult.publicPathDescription}",
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.textSecondary,
                                fontSize = 10.sp
                            )
                        }
                    }
                }

                // Leader WhatsApp Share Button if phone available
                if (leaderPhone.isNotBlank()) {
                    Button(
                        onClick = {
                            if (exportResult != null) {
                                val summary = R07PdfExporter.generateFormattedTextSummary(week, days, goals, leaderName)
                                R07PdfExporter.shareToWhatsApp(context, leaderPhone, exportResult, summary)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("send_whatsapp_leader_button"),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Send,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Enviar al WhatsApp del Líder",
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                // Leader Email Share Button if email available
                if (leaderEmail.isNotBlank()) {
                    OutlinedButton(
                        onClick = {
                            if (exportResult != null) {
                                val subject = "Devocional R07 • ${week.title}"
                                val summary = R07PdfExporter.generateFormattedTextSummary(week, days, goals, leaderName)
                                R07PdfExporter.shareToEmail(context, leaderEmail, exportResult, subject, summary)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("send_email_leader_button"),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Email,
                            contentDescription = null,
                            tint = colors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Enviar al Correo del Líder",
                            fontWeight = FontWeight.Bold,
                            color = colors.primary
                        )
                    }
                }

                // Generic Share Button
                Button(
                    onClick = {
                        if (exportResult != null) {
                            R07PdfExporter.sharePdf(context, exportResult)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("share_pdf_button"),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary)
                ) {
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Compartir PDF (Otras Apps)",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                // Open PDF View Button
                FilledTonalButton(
                    onClick = {
                        if (exportResult != null) {
                            R07PdfExporter.openPdf(context, exportResult)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("open_pdf_button"),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.filledTonalButtonColors(
                        containerColor = colors.primaryContainer,
                        contentColor = colors.primary
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.OpenInNew,
                        contentDescription = null,
                        tint = colors.primary,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Abrir y Ver Archivo PDF", fontWeight = FontWeight.Bold)
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("close_export_dialog_button")
            ) {
                Text(
                    text = "Cerrar",
                    fontWeight = FontWeight.Bold,
                    color = colors.primary
                )
            }
        }
    )
}
