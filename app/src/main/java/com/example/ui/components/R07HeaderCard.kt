package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.R07WeekEntity
import com.example.ui.theme.R07Theme

@Composable
fun R07HeaderCard(
    week: R07WeekEntity,
    completedDaysCount: Int,
    onReadingGoalChanged: (String) -> Unit,
    onGoalCompletedToggled: (Boolean) -> Unit,
    onIncrementPrayer: () -> Unit,
    onDecrementPrayer: () -> Unit,
    onExportClicked: () -> Unit = {},
    onNewWeekClicked: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors
    var isEditingGoal by remember { mutableStateOf(false) }
    var tempGoalText by remember(week.readingGoal) {
        mutableStateOf(if (week.readingGoal.isBlank()) "Proverbios 1 al 10 • Meta de sabiduría" else week.readingGoal)
    }

    val progressFraction by animateFloatAsState(
        targetValue = (completedDaysCount / 7f).coerceIn(0f, 1f),
        animationSpec = spring(dampingRatio = Spring.DampingRatioLowBouncy, stiffness = Spring.StiffnessMedium),
        label = "progress"
    )

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(26.dp))
            .testTag("header_card"),
        shape = RoundedCornerShape(26.dp),
        color = colors.surface,
        shadowElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(18.dp)) {

            // Top Header: Week Title & Dates + Overall Progress
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = week.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary
                    )
                    Text(
                        text = "${week.startDate} — ${week.endDate}",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.textSecondary,
                        fontSize = 11.sp
                    )
                }

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = colors.primaryContainer.copy(alpha = 0.6f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = "$completedDaysCount/7 Días",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary,
                            fontSize = 11.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Progress Bar
            LinearProgressIndicator(
                progress = { progressFraction },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(5.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = colors.primary,
                trackColor = colors.primaryContainer.copy(alpha = 0.4f),
                strokeCap = StrokeCap.Round
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Bento 2-stat row: 1. Oración, 2. Meta de Lectura
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Stat 1: Prayer attendance
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .border(1.dp, colors.border.copy(alpha = 0.4f), RoundedCornerShape(18.dp)),
                    shape = RoundedCornerShape(18.dp),
                    color = colors.background.copy(alpha = 0.5f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(
                                imageVector = Icons.Default.LocalFireDepartment,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(18.dp)
                            )
                            Column {
                                Text(
                                    text = "${week.prayerAttendanceCount} ${if (week.prayerAttendanceCount == 1) "Oración" else "Oraciones"}",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary,
                                    fontSize = 12.sp
                                )
                                Text(
                                    text = "Asistencia",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = colors.textMuted,
                                    fontSize = 10.sp
                                )
                            }
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = onDecrementPrayer,
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(Icons.Default.Remove, contentDescription = "Menos", tint = colors.textSecondary, modifier = Modifier.size(12.dp))
                            }
                            IconButton(
                                onClick = onIncrementPrayer,
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "Más", tint = colors.primary, modifier = Modifier.size(12.dp))
                            }
                        }
                    }
                }

                // Stat 2: Reading goal
                Surface(
                    modifier = Modifier
                        .weight(1.2f)
                        .clip(RoundedCornerShape(18.dp))
                        .clickable { isEditingGoal = !isEditingGoal }
                        .border(1.dp, colors.border.copy(alpha = 0.4f), RoundedCornerShape(18.dp)),
                    shape = RoundedCornerShape(18.dp),
                    color = colors.background.copy(alpha = 0.5f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(18.dp)
                            )
                            Column {
                                Text(
                                    text = if (week.readingGoal.isNotBlank()) week.readingGoal else "Meta de lectura",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary,
                                    maxLines = 1,
                                    fontSize = 12.sp
                                )
                                Text(
                                    text = if (week.isGoalCompleted) "Cumplida ✓" else "En progreso",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (week.isGoalCompleted) colors.accentSuccess else colors.textMuted,
                                    fontSize = 10.sp
                                )
                            }
                        }

                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Editar",
                            tint = colors.textMuted,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            // Inline Goal Edit Dialog/Form if opened
            AnimatedVisibility(visible = isEditingGoal) {
                Column(modifier = Modifier.padding(top = 10.dp)) {
                    OutlinedTextField(
                        value = tempGoalText,
                        onValueChange = { tempGoalText = it },
                        label = { Text("Meta de lectura de la semana", fontSize = 11.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true,
                        trailingIcon = {
                            IconButton(onClick = {
                                onReadingGoalChanged(tempGoalText)
                                isEditingGoal = false
                            }) {
                                Icon(Icons.Default.Check, contentDescription = "Guardar", tint = colors.primary)
                            }
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = colors.primary,
                            unfocusedBorderColor = colors.border.copy(alpha = 0.5f)
                        )
                    )
                }
            }
        }
    }
}
