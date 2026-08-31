package com.example.ui.components

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.R07DayEntryEntity
import com.example.ui.theme.R07Theme

@Composable
fun R07WeeklyTableView(
    days: List<R07DayEntryEntity>,
    onDayClick: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(26.dp))
            .testTag("weekly_table_view"),
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
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(
                        imageVector = Icons.Default.TableChart,
                        contentDescription = null,
                        tint = colors.primary,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = "HOJA SEMANAL R07",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary,
                        letterSpacing = 0.5.sp
                    )
                }

                Text(
                    text = "Toca para abrir día",
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 11.sp,
                    color = colors.textMuted
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Column Header
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                color = colors.primary
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "DÍA",
                        modifier = Modifier.width(60.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 11.sp
                    )
                    Text(
                        text = "HORA",
                        modifier = Modifier.width(55.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 11.sp
                    )
                    Text(
                        text = "LECTURA",
                        modifier = Modifier.width(80.dp),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 11.sp
                    )
                    Text(
                        text = "DESCRIPCIÓN R07",
                        modifier = Modifier.weight(1f),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Table Rows
            days.sortedBy { it.dayNumber }.forEachIndexed { index, day ->
                val isEven = index % 2 == 0
                val isDone = day.isCompleted || (day.reflectionText.isNotBlank() && day.scriptureRef.isNotBlank())

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onDayClick(day.dayNumber) }
                        .testTag("table_row_day_${day.dayNumber}"),
                    color = if (isEven) colors.surface else colors.background.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Día
                        Row(
                            modifier = Modifier.width(60.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            if (isDone) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "Listo",
                                    tint = colors.accentSuccess,
                                    modifier = Modifier.size(12.dp)
                                )
                            }
                            Text(
                                text = "D${day.dayNumber}",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = if (isDone) colors.accentSuccess else colors.textPrimary,
                                fontSize = 11.sp
                            )
                        }

                        // Hora
                        Text(
                            text = if (day.timeText.isNotBlank()) day.timeText else "—",
                            modifier = Modifier.width(55.dp),
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.textSecondary,
                            fontSize = 11.sp,
                            maxLines = 1
                        )

                        // Lectura
                        Text(
                            text = if (day.scriptureRef.isNotBlank()) day.scriptureRef else "—",
                            modifier = Modifier.width(80.dp),
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            color = colors.textPrimary,
                            fontSize = 11.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        // Descripción
                        Text(
                            text = if (day.reflectionText.isNotBlank()) day.reflectionText.take(60) else "(Vacío)",
                            modifier = Modifier.weight(1f),
                            style = MaterialTheme.typography.bodySmall,
                            fontStyle = if (day.reflectionText.isBlank()) FontStyle.Italic else FontStyle.Normal,
                            color = if (day.reflectionText.isBlank()) colors.textMuted else colors.textPrimary,
                            fontSize = 11.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}
