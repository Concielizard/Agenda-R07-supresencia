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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.R07CommunityEntity
import com.example.ui.theme.R07Theme

@Composable
fun R07CommunityChannelsCard(
    communities: List<R07CommunityEntity>,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("community_channels_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, colors.border)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text("⛪", fontSize = 18.sp)
                Column {
                    Text(
                        text = "Canales y Grupos Congregacionales",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary
                    )
                    Text(
                        text = "Espacios de crecimiento y servicio activo",
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.textMuted,
                        fontSize = 10.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            if (communities.isNotEmpty()) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    communities.forEach { community ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = colors.background,
                            border = androidx.compose.foundation.BorderStroke(1.dp, colors.border),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
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
                                    Text("👥", fontSize = 18.sp)
                                }

                                Column(modifier = Modifier.weight(1f)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = community.name,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            color = colors.textPrimary
                                        )
                                        if (community.meetingSchedule.isNotBlank()) {
                                            Surface(
                                                shape = RoundedCornerShape(6.dp),
                                                color = colors.primary.copy(alpha = 0.12f)
                                            ) {
                                                Text(
                                                    text = community.meetingSchedule,
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = colors.primary,
                                                    fontSize = 9.5.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                                                )
                                            }
                                        }
                                    }
                                    Text(
                                        text = community.description,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = colors.textSecondary,
                                        fontSize = 11.sp,
                                        maxLines = 2
                                    )
                                    Text(
                                        text = "${community.memberCount} miembros activos • ${community.churchName}",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = colors.primary,
                                        fontSize = 9.5.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = colors.background,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Grupos comunitarios sincronizados con tu congregación local.",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.textMuted,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }
        }
    }
}
