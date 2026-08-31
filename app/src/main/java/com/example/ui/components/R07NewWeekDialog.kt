package com.example.ui.components

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.ui.theme.R07Theme

@Composable
fun R07NewWeekDialog(
    nextWeekNumber: Int,
    onDismiss: () -> Unit,
    onCreateWeek: (title: String, readingGoal: String, verse: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors
    var title by remember { mutableStateOf("Semana $nextWeekNumber • Pasa tiempo Conmigo") }
    var readingGoal by remember { mutableStateOf("") }
    var verse by remember { mutableStateOf("«Pasa tiempo Conmigo y saciaré tu alma»") }

    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = modifier.testTag("new_week_dialog"),
        shape = RoundedCornerShape(28.dp),
        containerColor = Color.White,
        title = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(
                    imageVector = Icons.Default.CalendarMonth,
                    contentDescription = null,
                    tint = colors.primary
                )
                Text(
                    text = "Iniciar Nueva Semana R07",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Black,
                    color = colors.textPrimary
                )
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Comienza un nuevo ciclo semanal para registrar tu devocional diario de 7 días.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.textSecondary
                )

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Nombre de la semana") },
                    placeholder = { Text("Ej. Semana $nextWeekNumber") },
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border,
                        focusedLabelColor = colors.primary,
                        unfocusedContainerColor = colors.background,
                        focusedContainerColor = Color.White
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("new_week_title_input")
                )

                OutlinedTextField(
                    value = readingGoal,
                    onValueChange = { readingGoal = it },
                    label = { Text("Meta de Lectura Bíblica") },
                    placeholder = { Text("Ej. Salmos 31 al 40, Santiago 1-5") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.MenuBook,
                            contentDescription = null,
                            tint = colors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border,
                        focusedLabelColor = colors.primary,
                        unfocusedContainerColor = colors.background,
                        focusedContainerColor = Color.White
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("new_week_goal_input")
                )

                OutlinedTextField(
                    value = verse,
                    onValueChange = { verse = it },
                    label = { Text("Versículo lema semanal") },
                    placeholder = { Text("Promesa para meditar") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = null,
                            tint = colors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border,
                        focusedLabelColor = colors.primary,
                        unfocusedContainerColor = colors.background,
                        focusedContainerColor = Color.White
                    ),
                    modifier = Modifier.fillMaxWidth().testTag("new_week_verse_input")
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onCreateWeek(title, readingGoal, verse)
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.testTag("confirm_create_week_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.size(6.dp))
                Text("Crear Semana", color = Color.White, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier.testTag("cancel_create_week_button")
            ) {
                Text("Cancelar", color = colors.textSecondary)
            }
        }
    )
}

