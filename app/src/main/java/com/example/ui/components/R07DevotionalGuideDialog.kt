package com.example.ui.components

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
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.SelfImprovement
import androidx.compose.material.icons.filled.Spa
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.R07Theme

@Composable
fun R07DevotionalGuideDialog(
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors
    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = modifier.testTag("devotional_guide_dialog"),
        shape = RoundedCornerShape(28.dp),
        containerColor = colors.surface,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(colors.primaryContainer)
                        .border(1.5.dp, colors.borderStrong, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Spa,
                        contentDescription = null,
                        tint = colors.primary,
                        modifier = Modifier.size(22.dp)
                    )
                }
                Column {
                    Text(
                        text = "¿Cómo hacer tu R07?",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary
                    )
                    Text(
                        text = "Guía diaria «Pasa tiempo Conmigo»",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = colors.primary
                    )
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                GuideStepItem(
                    number = "1",
                    icon = Icons.Default.SelfImprovement,
                    title = "Prepara tu corazón",
                    description = "Comienza con una breve oración pidiendo al Espíritu Santo que abra tus ojos espirituales."
                )

                GuideStepItem(
                    number = "2",
                    icon = Icons.Default.MenuBook,
                    title = "Lee tu pasaje del día",
                    description = "Anota la hora y la cita bíblica. Lee con calma, meditando en lo que resalte en tu corazón."
                )

                GuideStepItem(
                    number = "3",
                    icon = Icons.Default.Favorite,
                    title = "Describe tu R07",
                    description = "Escribe en tus palabras qué te habló Dios hoy, la verdad que abrazas y cómo la aplicarás en tus decisiones."
                )

                GuideStepItem(
                    number = "4",
                    icon = Icons.Default.AutoAwesome,
                    title = "Descarga tu formato semanal",
                    description = "Al terminar los 7 días, descarga tu hoja en PDF para guardarla o compartirla con tu grupo y pastor."
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                modifier = Modifier.fillMaxWidth().testTag("close_guide_button")
            ) {
                Text("¡Comenzar mi devocional!", fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
    )
}

@Composable
private fun GuideStepItem(
    number: String,
    icon: ImageVector,
    title: String,
    description: String
) {
    val colors = R07Theme.colors
    Surface(
        shape = RoundedCornerShape(18.dp),
        color = colors.primaryContainer.copy(alpha = 0.6f),
        border = androidx.compose.foundation.BorderStroke(1.dp, colors.borderStrong),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(colors.primary),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = number,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.textSecondary,
                    fontSize = 12.sp
                )
            }
        }
    }
}

