package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.R07Theme

@Composable
fun R07SundayServiceCard(
    churchName: String,
    attendedSunday: Boolean,
    sundayNotes: String,
    onSundayAttendanceChanged: (attended: Boolean, notes: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("sunday_service_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, colors.border)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("🌟", fontSize = 18.sp)
                    Column {
                        Text(
                            text = "Servicio Dominical en Iglesia",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Black,
                            color = colors.textPrimary
                        )
                        Text(
                            text = if (churchName.isNotBlank()) churchName else "Culto y comunión dominical",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.textMuted,
                            fontSize = 10.sp
                        )
                    }
                }

                Switch(
                    checked = attendedSunday,
                    onCheckedChange = { newAttended ->
                        onSundayAttendanceChanged(newAttended, sundayNotes)
                    },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = colors.primary
                    ),
                    modifier = Modifier.testTag("switch_attended_sunday")
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            if (attendedSunday) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = colors.primaryContainer.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "⛪ Asististe al servicio dominical. ¡Gloria a Dios!",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = colors.primary,
                        modifier = Modifier.padding(8.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = sundayNotes,
                    onValueChange = { onSundayAttendanceChanged(attendedSunday, it) },
                    label = { Text("Notas clave y versículo del sermón dominical", fontSize = 11.5.sp) },
                    placeholder = { Text("Apunta el título de la prédica, citas bíblicas y la enseñanza...", fontSize = 11.5.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_sunday_notes"),
                    shape = RoundedCornerShape(14.dp),
                    minLines = 2,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border
                    )
                )
            } else {
                Text(
                    text = "Marca el interruptor si pudiste asistir al servicio presencial o en línea este domingo.",
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.textMuted,
                    fontSize = 11.sp
                )
            }
        }
    }
}
