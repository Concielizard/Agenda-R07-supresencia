package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FormatQuote
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.remote.AiGuidedPrayerResponse
import com.example.ui.theme.R07Theme

data class PrayerPromptQuickChip(
    val label: String,
    val emoji: String,
    val promptText: String
)

val QUICK_PRAYER_CHIPS = listOf(
    PrayerPromptQuickChip("Ansiedad y Carga", "🌧️", "Siento ansiedad por el futuro, incertidumbre y sobrecarga en mi mente."),
    PrayerPromptQuickChip("Agradecimiento Profundo", "🌸", "Mi corazón rebosa de gratitud por las bendiciones, provisión y amor de Dios."),
    PrayerPromptQuickChip("Toma de Decisiones", "🧭", "Necesito sabiduría y dirección clara de Dios para tomar decisiones importantes."),
    PrayerPromptQuickChip("Protección y Familia", "🛡️", "Clamo por la salud, paz, unidad y protección espiritual de mi hogar y familia."),
    PrayerPromptQuickChip("Sanidad y Desánimo", "💔", "Me siento con cansancio físico y emocional, pidiendo renovación y fortaleza del Señor."),
    PrayerPromptQuickChip("Paz y Quietud", "🕊️", "Anhelo callar el ruido externo y reposar en la paz sobrenatural de Su presencia."),
    PrayerPromptQuickChip("Fuerza en la Prueba", "⚔️", "Atravieso una prueba difícil y necesito firmeza en la fe y valentía divina."),
    PrayerPromptQuickChip("Perdón y Reconciliación", "🤝", "Pido gracia para soltar ofensas, perdonar de corazón y sanar mis relaciones.")
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun R07AiPrayerGuidanceDialog(
    dayNumber: Int,
    dayName: String,
    scriptureRef: String,
    currentMood: String = "",
    isLoading: Boolean,
    prayerResponse: AiGuidedPrayerResponse?,
    errorMessage: String?,
    onGeneratePrayer: (feelingOrSituation: String) -> Unit,
    onApplyToDayPrayer: (AiGuidedPrayerResponse) -> Unit,
    onDismiss: () -> Unit
) {
    val colors = R07Theme.colors
    val context = LocalContext.current

    var feelingInput by remember {
        mutableStateOf(
            if (currentMood.isNotBlank()) "Hoy me siento $currentMood. " else ""
        )
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .clip(RoundedCornerShape(26.dp))
                .border(1.5.dp, colors.primary.copy(alpha = 0.4f), RoundedCornerShape(26.dp))
                .testTag("ai_prayer_guidance_dialog"),
            shape = RoundedCornerShape(26.dp),
            color = colors.background,
            shadowElevation = 10.dp
        ) {
            Column(modifier = Modifier.fillMaxSize()) {

                // TOP HEADER
                Surface(
                    color = colors.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 18.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(colors.primaryContainer),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.VolunteerActivism,
                                    contentDescription = null,
                                    tint = colors.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            Column {
                                Text(
                                    text = "GUÍA DE ORACIÓN CON IA",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = colors.primary,
                                    letterSpacing = 0.8.sp
                                )
                                Text(
                                    text = "Día $dayNumber ($dayName) • «Aprende a Orar»",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Black,
                                    color = colors.textPrimary,
                                    fontSize = 14.sp
                                )
                            }
                        }

                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier.size(32.dp).testTag("close_prayer_guidance_dialog")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Cerrar",
                                tint = colors.textPrimary
                            )
                        }
                    }
                }

                HorizontalDivider(color = colors.border.copy(alpha = 0.4f))

                // SCROLLABLE CONTENT BODY
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 18.dp, vertical = 12.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // INTRO & SCRIPTURE BANNER
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        color = colors.primaryContainer.copy(alpha = 0.45f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary.copy(alpha = 0.25f))
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = null,
                                    tint = colors.primary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "¿CÓMO FUNCIONA ESTA GUÍA?",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = colors.primary,
                                    fontSize = 10.5.sp
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Expresa lo que hay en tu corazón, tus dudas o tu situación actual. La IA estructurará una oración bíblica con 4 pilares esenciales para inspirar tu tiempo a solas con Dios.",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.textPrimary,
                                fontSize = 11.5.sp,
                                lineHeight = 16.sp
                            )
                            if (scriptureRef.isNotBlank()) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Icon(
                                        imageVector = Icons.Default.MenuBook,
                                        contentDescription = null,
                                        tint = colors.primary,
                                        modifier = Modifier.size(13.dp)
                                    )
                                    Text(
                                        text = "Pasaje leído hoy: $scriptureRef",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.primary,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }
                    }

                    // INPUT SECTION: "Describe tu sentir o situación"
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "1. ¿QUÉ SIENTES O QUÉ SITUACIÓN ESTÁS VIVIENDO HOY?",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black,
                            color = colors.textSecondary,
                            fontSize = 11.sp
                        )

                        OutlinedTextField(
                            value = feelingInput,
                            onValueChange = { feelingInput = it },
                            placeholder = {
                                Text(
                                    text = "Ej: Siento preocupación por mis finanzas, pero quiero aprender a confiar plenamente en la provisión de Dios...",
                                    fontSize = 12.sp,
                                    color = colors.textMuted
                                )
                            },
                            minLines = 3,
                            maxLines = 6,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("prayer_feeling_input_field"),
                            shape = RoundedCornerShape(14.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = colors.surface,
                                unfocusedContainerColor = colors.surface,
                                focusedBorderColor = colors.primary,
                                unfocusedBorderColor = colors.border
                            )
                        )

                        // Quick Chips
                        Text(
                            text = "O elige una temática rápida:",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.textMuted,
                            fontSize = 10.5.sp
                        )

                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            QUICK_PRAYER_CHIPS.forEach { chip ->
                                Surface(
                                    shape = RoundedCornerShape(10.dp),
                                    color = colors.surface,
                                    border = androidx.compose.foundation.BorderStroke(1.dp, colors.border.copy(alpha = 0.6f)),
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(10.dp))
                                        .clickable {
                                            feelingInput = if (feelingInput.isBlank()) chip.promptText else "$feelingInput ${chip.promptText}"
                                        }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Text(chip.emoji, fontSize = 12.sp)
                                        Text(
                                            text = chip.label,
                                            fontSize = 11.sp,
                                            color = colors.textPrimary,
                                            fontWeight = FontWeight.Medium
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // GENERATE BUTTON
                    Button(
                        onClick = { onGeneratePrayer(feelingInput) },
                        enabled = !isLoading && feelingInput.isNotBlank(),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("generate_guided_prayer_button")
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color.White,
                                strokeWidth = 2.5.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Estructurando oración bíblica con IA...", color = Color.White, fontWeight = FontWeight.Bold)
                        } else {
                            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (prayerResponse != null) "✨ Regenerar Nueva Guía" else "✨ Generar Guía de Oración",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.5.sp
                            )
                        }
                    }

                    // ERROR MESSAGE
                    if (errorMessage != null) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFFDE8E8),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF05252)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "⚠️ $errorMessage",
                                color = Color(0xFF9B1C1C),
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }

                    // PRAYER RESULTS CARD
                    if (prayerResponse != null) {
                        HorizontalDivider(color = colors.border.copy(alpha = 0.4f), modifier = Modifier.padding(vertical = 4.dp))

                        // Title Banner
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = colors.surface,
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, colors.primary.copy(alpha = 0.5f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = prayerResponse.title.ifBlank { "Guía de Oración Personalizada" },
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.Black,
                                        color = colors.primary,
                                        fontSize = 15.sp
                                    )

                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = colors.primaryContainer.copy(alpha = 0.7f)
                                    ) {
                                        Text(
                                            text = "4 Pilares ✓",
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = colors.primary,
                                            fontSize = 10.sp,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                        )
                                    }
                                }

                                // 4 STRUCTURED PILLARS
                                // 1. Adoration
                                if (prayerResponse.adoration.isNotBlank()) {
                                    PillarItemCard(
                                        pillarNumber = "1",
                                        title = "Alabanza & Adoración",
                                        emoji = "🌸",
                                        subtitle = "Reconociendo la soberanía de Dios",
                                        content = prayerResponse.adoration,
                                        accentColor = colors.primary
                                    )
                                }

                                // 2. Honesty & Desahogo
                                if (prayerResponse.confessionAndHonesty.isNotBlank()) {
                                    PillarItemCard(
                                        pillarNumber = "2",
                                        title = "Sinceridad & Desahogo",
                                        emoji = "💭",
                                        subtitle = "Entregando tus cargas con honestidad",
                                        content = prayerResponse.confessionAndHonesty,
                                        accentColor = Color(0xFF6A1B9A)
                                    )
                                }

                                // 3. Petition & Faith
                                if (prayerResponse.petitionAndFaith.isNotBlank()) {
                                    PillarItemCard(
                                        pillarNumber = "3",
                                        title = "Petición con Fe",
                                        emoji = "🎯",
                                        subtitle = "Clamor específico confiando en Su poder",
                                        content = prayerResponse.petitionAndFaith,
                                        accentColor = Color(0xFF1565C0)
                                    )
                                }

                                // 4. Gratitude & Promise
                                if (prayerResponse.gratitudeAndDeclaration.isNotBlank()) {
                                    PillarItemCard(
                                        pillarNumber = "4",
                                        title = "Agradecimiento & Declaración",
                                        emoji = "🕊️",
                                        subtitle = "Descansando en Su victoria",
                                        content = prayerResponse.gratitudeAndDeclaration,
                                        accentColor = Color(0xFF2E7D32)
                                    )
                                }

                                // BIBLICAL PROMISE VERSE
                                if (prayerResponse.biblicalPromise.isNotBlank()) {
                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = colors.primaryContainer.copy(alpha = 0.5f),
                                        border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary.copy(alpha = 0.3f)),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(10.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.FormatQuote,
                                                contentDescription = null,
                                                tint = colors.primary,
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Column {
                                                Text(
                                                    text = "PROMESA BÍBLICA PARA HOY",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    fontWeight = FontWeight.Black,
                                                    color = colors.primary,
                                                    fontSize = 9.5.sp
                                                )
                                                Text(
                                                    text = prayerResponse.biblicalPromise,
                                                    style = MaterialTheme.typography.bodySmall,
                                                    fontWeight = FontWeight.Medium,
                                                    fontStyle = FontStyle.Italic,
                                                    color = colors.textPrimary,
                                                    fontSize = 11.5.sp
                                                )
                                            }
                                        }
                                    }
                                }

                                // FULL PRAYER TEXT
                                if (prayerResponse.fullPrayerText.isNotBlank()) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(colors.background)
                                            .padding(12.dp),
                                        verticalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = "📜 ORACIÓN COMPLETA PARA TU DEVOCIONAL",
                                                style = MaterialTheme.typography.labelSmall,
                                                fontWeight = FontWeight.Black,
                                                color = colors.textSecondary,
                                                fontSize = 10.sp
                                            )

                                            TextButton(
                                                onClick = {
                                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                                    val clip = ClipData.newPlainText("Oración R07", prayerResponse.fullPrayerText)
                                                    clipboard.setPrimaryClip(clip)
                                                    Toast.makeText(context, "Oración copiada al portapapeles ✓", Toast.LENGTH_SHORT).show()
                                                }
                                            ) {
                                                Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(13.dp))
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text("Copiar", fontSize = 10.5.sp)
                                            }
                                        }

                                        Text(
                                            text = prayerResponse.fullPrayerText,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = colors.textPrimary,
                                            fontSize = 12.5.sp,
                                            lineHeight = 18.sp
                                        )
                                    }
                                }

                                // WISE PASTORAL NOTICE (Crucial requirement)
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = Color(0xFFFFFBEB),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFDE68A)),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier.padding(10.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Lightbulb,
                                            contentDescription = null,
                                            tint = Color(0xFFD97706),
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Text(
                                            text = "💡 Consejo: Dios conoce la verdad de tu corazón. No leas esta oración de forma mecánica ni como un rezo repetitivo; utilízala como estructura e inspiración para hablarle con sinceridad.",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Color(0xFF92400E),
                                            fontSize = 11.sp,
                                            lineHeight = 15.sp
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // FIXED PINNED BOTTOM ACTION BAR
                if (prayerResponse != null) {
                    HorizontalDivider(color = colors.border.copy(alpha = 0.4f))
                    Surface(
                        color = colors.surface,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 18.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedButton(
                                onClick = onDismiss,
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Cerrar", color = colors.textSecondary, fontWeight = FontWeight.Bold, fontSize = 12.5.sp)
                            }

                            Button(
                                onClick = {
                                    onApplyToDayPrayer(prayerResponse)
                                    onDismiss()
                                },
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                                modifier = Modifier
                                    .weight(1.6f)
                                    .testTag("apply_prayer_to_day_button")
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Aplicar a mi Diario ✓", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.5.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PillarItemCard(
    pillarNumber: String,
    title: String,
    emoji: String,
    subtitle: String,
    content: String,
    accentColor: Color
) {
    val colors = R07Theme.colors
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = colors.background,
        border = androidx.compose.foundation.BorderStroke(1.dp, colors.border.copy(alpha = 0.5f)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(emoji, fontSize = 14.sp)
                Text(
                    text = "Pilar $pillarNumber: $title",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Black,
                    color = accentColor,
                    fontSize = 12.sp
                )
            }
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = colors.textMuted,
                fontSize = 10.sp
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = content,
                style = MaterialTheme.typography.bodySmall,
                color = colors.textPrimary,
                fontSize = 11.5.sp,
                lineHeight = 16.sp
            )
        }
    }
}
