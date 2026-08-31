package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.SelfImprovement
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.ui.theme.R07Theme

@Composable
fun R07HowItWorksDialog(
    onDismiss: () -> Unit,
    onStartFirstWeek: () -> Unit = {}
) {
    val colors = R07Theme.colors

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.90f)
                .clip(RoundedCornerShape(28.dp))
                .border(1.5.dp, colors.borderStrong.copy(alpha = 0.5f), RoundedCornerShape(28.dp))
                .testTag("how_it_works_dialog"),
            color = colors.background,
            shape = RoundedCornerShape(28.dp),
            shadowElevation = 12.dp
        ) {
            Column(
                modifier = Modifier.fillMaxHeight()
            ) {
                // HEADER
                Surface(
                    color = colors.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(colors.primaryContainer)
                                    .border(1.dp, colors.primary, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.HelpOutline,
                                    contentDescription = null,
                                    tint = colors.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "¿CÓMO FUNCIONA EL R07?",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = colors.primary,
                                    letterSpacing = 0.8.sp
                                )
                                Text(
                                    text = "«Pasa tiempo Conmigo»",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Black,
                                    color = colors.textPrimary,
                                    fontSize = 16.sp
                                )
                            }
                        }

                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier.size(32.dp).testTag("close_how_it_works_dialog")
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

                // SCROLLABLE INFOGRAPHIC
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 18.dp, vertical = 14.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // HERO CARD
                    Surface(
                        shape = RoundedCornerShape(18.dp),
                        color = colors.primaryContainer.copy(alpha = 0.6f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary.copy(alpha = 0.3f))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "¿Qué es el R07?",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = colors.textPrimary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "El R07 es una disciplina espiritual de 7 días consecutivos para pasar tiempo a solas con Dios. Es el espacio donde escribes lo que Dios habló a tu corazón, tu oración, tu agradecimiento y tus metas.",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.textSecondary,
                                lineHeight = 17.sp
                            )
                        }
                    }

                    // STEP 1: DIARIO DE 7 DÍAS
                    HowItWorksStepCard(
                        stepNumber = "1",
                        iconEmoji = "📖",
                        title = "Encuentro Diario (Lunes a Domingo)",
                        description = "Cada día lees la porción bíblica, anotas la hora, seleccionas tu estado de ánimo y redactas tu reflexión personal o escaneas tu cuaderno físico con la cámara.",
                        tag = "Hábito Diario",
                        accentColor = colors.primary
                    )

                    // STEP 2: METAS Y VERSÍCULO DE LA SEMANA
                    HowItWorksStepCard(
                        stepNumber = "2",
                        iconEmoji = "🎯",
                        title = "Metas Semanales & Versículo Clave",
                        description = "Establece metas espirituales, lecturas bíblicas y hábitos específicos. Memoriza el versículo de la semana y mide tu avance con los checks interactivos.",
                        tag = "Enfoque & Crecimiento",
                        accentColor = colors.primary
                    )

                    // STEP 3: GRUPO DE CONEXIÓN & DÍAS DE ORACIÓN
                    HowItWorksStepCard(
                        stepNumber = "3",
                        iconEmoji = "👥",
                        title = "Comunidad & Oración en la Iglesia",
                        description = "Registra tu asistencia semanal al Grupo de Conexión (lo que aprendiste y compartiste) y a los 2 Días de Oración en la Iglesia. Consulta tu racha mensual de constancia.",
                        tag = "Comunidad & Iglesia",
                        accentColor = colors.primary
                    )

                    // STEP 4: GUÍA ASISTIDA DE ORACIÓN
                    HowItWorksStepCard(
                        stepNumber = "4",
                        iconEmoji = "🕊️",
                        title = "Guía e Inspiración para Orar",
                        description = "¿No sabes qué palabras usar? Escribe cómo te sientes y la guía bíblica te dará una base estructurada para inspirar tu oración sincera de corazón a corazón con Dios.",
                        tag = "Tiempo a Solas",
                        accentColor = colors.primary
                    )

                    // STEP 5: RECURSOS & BIBLIA
                    HowItWorksStepCard(
                        stepNumber = "5",
                        iconEmoji = "📚",
                        title = "Biblia Completa & Exportación PDF",
                        description = "Descarga versiones bíblicas (RVR1960 / NTV) para lectura sin internet, busca citas rápidamente y exporta tu reporte semanal en PDF para compartir con tu líder.",
                        tag = "Herramientas",
                        accentColor = colors.primary
                    )

                    Spacer(modifier = Modifier.height(10.dp))
                }

                // FIXED PINNED BOTTOM ACTION BAR
                HorizontalDivider(color = colors.border.copy(alpha = 0.4f))
                Surface(
                    color = colors.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
                    ) {
                        Button(
                            onClick = {
                                onDismiss()
                                onStartFirstWeek()
                            },
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("how_it_works_action_button")
                        ) {
                            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "¡Entendido! Comenzar mi R07 ✨",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun HowItWorksStepCard(
    stepNumber: String,
    iconEmoji: String,
    title: String,
    description: String,
    tag: String,
    accentColor: Color
) {
    val colors = R07Theme.colors

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, colors.border)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(colors.primaryContainer)
                    .border(1.dp, accentColor, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(text = iconEmoji, fontSize = 20.sp)
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "PASO $stepNumber",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.ExtraBold,
                        color = accentColor,
                        fontSize = 10.sp
                    )

                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = colors.primaryContainer.copy(alpha = 0.5f)
                    ) {
                        Text(
                            text = tag,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = accentColor,
                            fontSize = 9.sp,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary,
                    fontSize = 13.5.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.textSecondary,
                    fontSize = 11.5.sp,
                    lineHeight = 16.sp
                )
            }
        }
    }
}
