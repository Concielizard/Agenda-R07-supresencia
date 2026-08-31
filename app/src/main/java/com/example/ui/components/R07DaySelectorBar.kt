package com.example.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.R07DayEntryEntity
import com.example.ui.theme.R07Theme

@Composable
fun R07DaySelectorBar(
    days: List<R07DayEntryEntity>,
    selectedDayNumber: Int,
    onSelectDay: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(22.dp))
            .testTag("bento_day_selector_strip"),
        shape = RoundedCornerShape(22.dp),
        color = colors.surface,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 6.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            val shortDayLabels = listOf("L", "M", "M", "J", "V", "S", "D")
            val sortedDays = days.sortedBy { it.dayNumber }

            sortedDays.forEachIndexed { index, day ->
                val isSelected = day.dayNumber == selectedDayNumber
                val dayLabel = if (index in shortDayLabels.indices) shortDayLabels[index] else day.dayName.take(1).uppercase()
                val isDayDone = day.isCompleted || (day.reflectionText.isNotBlank() && day.scriptureRef.isNotBlank())

                val pillBgColor by animateColorAsState(
                    targetValue = when {
                        isSelected -> colors.primary
                        isDayDone -> colors.accentSuccessBg
                        else -> colors.background.copy(alpha = 0.6f)
                    },
                    animationSpec = spring(dampingRatio = Spring.DampingRatioLowBouncy, stiffness = Spring.StiffnessMedium),
                    label = "pillBgColor"
                )

                val pillTextColor by animateColorAsState(
                    targetValue = when {
                        isSelected -> Color.White
                        isDayDone -> colors.accentSuccess
                        else -> colors.textPrimary
                    },
                    label = "pillTextColor"
                )

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .clickable { onSelectDay(day.dayNumber) }
                        .padding(vertical = 4.dp)
                        .testTag("day_chip_${day.dayNumber}"),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = dayLabel,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = if (isSelected) FontWeight.Black else FontWeight.Bold,
                        fontSize = 11.sp,
                        color = if (isSelected) colors.primary else if (isDayDone) colors.textPrimary else colors.textMuted
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(pillBgColor)
                            .border(
                                width = if (isSelected) 1.5.dp else if (isDayDone) 1.dp else 0.5.dp,
                                color = if (isSelected) colors.primaryDark else if (isDayDone) colors.accentSuccess else colors.border.copy(alpha = 0.4f),
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isDayDone && !isSelected) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Completado",
                                tint = colors.accentSuccess,
                                modifier = Modifier.size(16.dp)
                            )
                        } else {
                            Text(
                                text = day.dayNumber.toString(),
                                color = pillTextColor,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
