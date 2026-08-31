package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.remote.AiWeeklyLeaderSummary
import com.example.ui.theme.R07Theme

@Composable
fun R07AiLeaderSummaryDialog(
    isLoading: Boolean,
    report: AiWeeklyLeaderSummary?,
    errorMessage: String?,
    weekTitle: String,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val colors = R07Theme.colors

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(28.dp))
                .testTag("ai_leader_summary_dialog"),
            color = colors.surface,
            shape = RoundedCornerShape(28.dp),
            shadowElevation = 8.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                // Top header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(colors.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(22.dp)
                            )
                        }
                        Column {
                            Text(
                                text = "Resumen Pastoral de la Semana",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = colors.textPrimary
                            )
                            Text(
                                text = "Reporte para Líder de Célula • $weekTitle",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.primary
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Cerrar",
                            tint = colors.textMuted
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                if (isLoading) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        CircularProgressIndicator(
                            color = colors.primary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Analizando tu semana y redactando resumen para tu líder...",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                    }
                } else if (errorMessage != null) {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Color(0xFFFFEBEE),
                        shape = RoundedCornerShape(16.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEF9A9A))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Aviso del Asistente",
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFC62828)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = errorMessage,
                                style = MaterialTheme.typography.bodySmall,
                                color = Color(0xFF37474F)
                            )
                        }
                    }
                } else if (report != null) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f, fill = false)
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        // Section 1: Executive summary
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = colors.primaryContainer,
                            shape = RoundedCornerShape(18.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, colors.border)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "SÍNTESIS ESPIRITUAL",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = colors.primary
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = report.executiveSummary,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = colors.textPrimary,
                                    lineHeight = 20.sp
                                )
                            }
                        }

                        // Section 2: Highlights
                        if (report.spiritualHighlights.isNotEmpty()) {
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                color = colors.surfaceVariant,
                                shape = RoundedCornerShape(18.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, colors.border)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.Star,
                                            contentDescription = null,
                                            tint = colors.primary,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "VICTORIAS & APRENDIZAJES CLAVE",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = colors.primary
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    report.spiritualHighlights.forEach { h ->
                                        Text(
                                            text = "• $h",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = colors.textPrimary,
                                            modifier = Modifier.padding(vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                        }

                        // Section 3: Prayer request summary
                        if (report.prayerRequestSummary.isNotBlank()) {
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                color = Color(0xFFEDE7F6),
                                shape = RoundedCornerShape(18.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFD1C4E9))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(
                                            imageVector = Icons.Default.Favorite,
                                            contentDescription = null,
                                            tint = Color(0xFF5E35B1),
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "ÁREA DE CRECIMIENTO / PETICIÓN",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Color(0xFF5E35B1)
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = report.prayerRequestSummary,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = Color(0xFF311B92),
                                        lineHeight = 20.sp
                                    )
                                }
                            }
                        }

                        // Section 4: Pastoral encouragement
                        if (report.pastoralEncouragement.isNotBlank()) {
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                color = Color(0xFFE8F5E9),
                                shape = RoundedCornerShape(18.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFA5D6A7))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Text(
                                        text = "PALABRA DE ALIENTO",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color(0xFF2E7D32)
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = report.pastoralEncouragement,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontStyle = FontStyle.Italic,
                                        color = Color(0xFF1B5E20),
                                        lineHeight = 20.sp
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                val fullText = """
                                    *Reporte Devocional R07 - $weekTitle*
                                    
                                    ${report.executiveSummary}
                                    
                                    *Victorias:*
                                    ${report.spiritualHighlights.joinToString("\n") { "• $it" }}
                                    
                                    *Petición de Oración:*
                                    ${report.prayerRequestSummary}
                                    
                                    *Palabra:*
                                    ${report.pastoralEncouragement}
                                """.trimIndent()
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                val clip = ClipData.newPlainText("Reporte R07", fullText)
                                clipboard.setPrimaryClip(clip)
                                Toast.makeText(context, "Copiado al portapapeles 📋", Toast.LENGTH_SHORT).show()
                            },
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Copiar", style = MaterialTheme.typography.labelMedium)
                        }

                        Button(
                            onClick = {
                                val fullText = """
                                    *Reporte Devocional R07 - $weekTitle*
                                    
                                    ${report.executiveSummary}
                                    
                                    *Victorias:*
                                    ${report.spiritualHighlights.joinToString("\n") { "• $it" }}
                                    
                                    *Petición de Oración:*
                                    ${report.prayerRequestSummary}
                                    
                                    *Palabra:*
                                    ${report.pastoralEncouragement}
                                """.trimIndent()
                                val intent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_SUBJECT, "Reporte Devocional R07 - $weekTitle")
                                    putExtra(Intent.EXTRA_TEXT, fullText)
                                }
                                context.startActivity(Intent.createChooser(intent, "Compartir resumen con mi líder"))
                            },
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            modifier = Modifier.weight(1.3f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = Color.White
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Compartir", style = MaterialTheme.typography.labelMedium, color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
