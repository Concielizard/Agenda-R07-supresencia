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
fun R07GroupMeetingCard(
    groupName: String,
    attendedGroup: Boolean,
    groupLearnings: String,
    groupTopics: String,
    groupFeelings: String,
    groupAbsenceReason: String,
    onAttendanceChanged: (
        attended: Boolean,
        learnings: String,
        topics: String,
        feelings: String,
        absenceReason: String
    ) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("group_meeting_card"),
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
                    Text("👥", fontSize = 18.sp)
                    Column {
                        Text(
                            text = "Reunión de Grupo de Conexión",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Black,
                            color = colors.textPrimary
                        )
                        Text(
                            text = if (groupName.isNotBlank()) groupName else "1 vez por semana con tu grupo",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.textMuted,
                            fontSize = 10.sp
                        )
                    }
                }

                Switch(
                    checked = attendedGroup,
                    onCheckedChange = { newAttended ->
                        onAttendanceChanged(
                            newAttended,
                            groupLearnings,
                            groupTopics,
                            groupFeelings,
                            groupAbsenceReason
                        )
                    },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = colors.primary
                    ),
                    modifier = Modifier.testTag("switch_attended_group")
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            if (attendedGroup) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = colors.primaryContainer.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "✅ Asististe al grupo esta semana. ¡Qué bendición crecer juntos!",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = colors.primary,
                        modifier = Modifier.padding(8.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = groupLearnings,
                    onValueChange = {
                        onAttendanceChanged(
                            attendedGroup,
                            it,
                            groupTopics,
                            groupFeelings,
                            groupAbsenceReason
                        )
                    },
                    label = { Text("¿Qué aprendiste en el grupo de conexión?", fontSize = 11.5.sp) },
                    placeholder = { Text("Escribe la enseñanza o versículo que impactó tu vida...", fontSize = 11.5.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_group_learnings"),
                    shape = RoundedCornerShape(14.dp),
                    minLines = 2,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border
                    )
                )

                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = groupTopics,
                    onValueChange = {
                        onAttendanceChanged(
                            attendedGroup,
                            groupLearnings,
                            it,
                            groupFeelings,
                            groupAbsenceReason
                        )
                    },
                    label = { Text("¿De qué hablaron o qué hicieron?", fontSize = 11.5.sp) },
                    placeholder = { Text("Tema tratado, testimonios, dinámica o tiempos de oración...", fontSize = 11.5.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_group_topics"),
                    shape = RoundedCornerShape(14.dp),
                    minLines = 2,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border
                    )
                )

                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = groupFeelings,
                    onValueChange = {
                        onAttendanceChanged(
                            attendedGroup,
                            groupLearnings,
                            groupTopics,
                            it,
                            groupAbsenceReason
                        )
                    },
                    label = { Text("¿Cómo te sentiste en el grupo?", fontSize = 11.5.sp) },
                    placeholder = { Text("En paz, acogido, renovado, animado en la fe...", fontSize = 11.5.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_group_feelings"),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border
                    )
                )
            } else {
                OutlinedTextField(
                    value = groupAbsenceReason,
                    onValueChange = {
                        onAttendanceChanged(
                            attendedGroup,
                            groupLearnings,
                            groupTopics,
                            groupFeelings,
                            it
                        )
                    },
                    label = { Text("Motivo si no pudiste asistir al grupo", fontSize = 11.5.sp) },
                    placeholder = { Text("Ej. Motivo laboral, viaje, salud... (Queda registrado para tu líder)", fontSize = 11.5.sp) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_group_absence_reason"),
                    shape = RoundedCornerShape(14.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border
                    )
                )
            }
        }
    }
}
