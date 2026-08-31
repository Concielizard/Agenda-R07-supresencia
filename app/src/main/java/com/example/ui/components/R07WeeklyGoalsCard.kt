package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.outlined.CheckCircleOutline
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.R07WeeklyGoalEntity
import com.example.ui.theme.R07Theme

@Composable
fun R07WeeklyGoalsCard(
    goals: List<R07WeeklyGoalEntity>,
    onToggleGoal: (R07WeeklyGoalEntity) -> Unit,
    onAddGoal: (String, String) -> Unit,
    onDeleteGoal: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors

    var showAddForm by remember { mutableStateOf(false) }
    var newGoalTitle by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Espiritual") }

    val categories = listOf("Espiritual", "Hábito", "Lectura", "Oración", "Personal")

    val completedCount = goals.count { it.isCompleted }
    val totalCount = goals.size
    val progressFraction by animateFloatAsState(
        targetValue = if (totalCount > 0) completedCount.toFloat() / totalCount.toFloat() else 0f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioLowBouncy, stiffness = Spring.StiffnessMedium),
        label = "goalProgress"
    )

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(26.dp))
            .testTag("weekly_goals_card"),
        shape = RoundedCornerShape(26.dp),
        color = colors.surface,
        shadowElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(
                        imageVector = Icons.Default.Flag,
                        contentDescription = "Metas semanales",
                        tint = colors.primary,
                        modifier = Modifier.size(20.dp)
                    )
                    Column {
                        Text(
                            text = "METAS Y HÁBITOS",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Black,
                            color = colors.textPrimary,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = "$completedCount de $totalCount cumplidas",
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.textSecondary,
                            fontSize = 11.sp
                        )
                    }
                }

                // Add goal button
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (showAddForm) colors.primaryContainer else colors.primary,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { showAddForm = !showAddForm }
                        .testTag("toggle_add_goal_form_button")
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = if (showAddForm) Icons.Default.Close else Icons.Default.Add,
                            contentDescription = "Agregar meta",
                            tint = if (showAddForm) colors.primary else Color.White,
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = if (showAddForm) "Cerrar" else "+ Meta",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = if (showAddForm) colors.primary else Color.White
                        )
                    }
                }
            }

            if (totalCount > 0) {
                Spacer(modifier = Modifier.height(10.dp))
                LinearProgressIndicator(
                    progress = { progressFraction },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp)),
                    color = colors.primary,
                    trackColor = colors.primaryContainer.copy(alpha = 0.4f),
                    strokeCap = StrokeCap.Round
                )
            }

            // Inline Add Form
            AnimatedVisibility(visible = showAddForm) {
                Column(modifier = Modifier.padding(top = 12.dp)) {
                    OutlinedTextField(
                        value = newGoalTitle,
                        onValueChange = { newGoalTitle = it },
                        placeholder = { Text("Ej: Leer Proverbios antes de dormir", fontSize = 12.sp, color = colors.textMuted) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("new_goal_title_input"),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = colors.primary,
                            unfocusedBorderColor = colors.border.copy(alpha = 0.5f)
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        categories.forEach { cat ->
                            val isSelected = cat == selectedCategory
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) colors.primary else colors.background,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .clickable { selectedCategory = cat }
                            ) {
                                Text(
                                    text = cat,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color.White else colors.textPrimary,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = {
                            if (newGoalTitle.isNotBlank()) {
                                onAddGoal(newGoalTitle.trim(), selectedCategory)
                                newGoalTitle = ""
                                showAddForm = false
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(40.dp).testTag("save_new_goal_button"),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary)
                    ) {
                        Text("Guardar Meta", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Goal Items List
            if (goals.isEmpty()) {
                Text(
                    text = "No tienes metas añadidas esta semana. Toca '+ Meta' para fijar tus propósitos devocionales.",
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.textMuted,
                    fontSize = 12.sp,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    goals.forEach { goal ->
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .clickable { onToggleGoal(goal) }
                                .border(1.dp, if (goal.isCompleted) colors.accentSuccess.copy(alpha = 0.3f) else colors.border.copy(alpha = 0.3f), RoundedCornerShape(14.dp)),
                            shape = RoundedCornerShape(14.dp),
                            color = if (goal.isCompleted) colors.accentSuccessBg.copy(alpha = 0.5f) else colors.background.copy(alpha = 0.5f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(
                                        imageVector = if (goal.isCompleted) Icons.Default.CheckCircle else Icons.Outlined.CheckCircleOutline,
                                        contentDescription = null,
                                        tint = if (goal.isCompleted) colors.accentSuccess else colors.textMuted,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Column {
                                        Text(
                                            text = goal.title,
                                            style = MaterialTheme.typography.bodyMedium,
                                            fontWeight = if (goal.isCompleted) FontWeight.Normal else FontWeight.SemiBold,
                                            color = if (goal.isCompleted) colors.textMuted else colors.textPrimary,
                                            textDecoration = if (goal.isCompleted) TextDecoration.LineThrough else TextDecoration.None,
                                            fontSize = 13.sp
                                        )
                                        Text(
                                            text = goal.category,
                                            style = MaterialTheme.typography.labelSmall,
                                            fontSize = 10.sp,
                                            color = colors.textMuted
                                        )
                                    }
                                }

                                IconButton(
                                    onClick = { onDeleteGoal(goal.id) },
                                    modifier = Modifier.size(24.dp).testTag("delete_goal_${goal.id}")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Borrar",
                                        tint = colors.textMuted,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
