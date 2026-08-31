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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.example.data.local.UserAccountType
import com.example.data.model.R07CommunityEntity
import com.example.data.model.R07FriendEntity
import com.example.data.model.WeekWithDays
import com.example.ui.theme.R07Theme

@Composable
fun R07ChurchCommunityCard(
    weekWithDays: WeekWithDays,
    accountType: UserAccountType,
    groupName: String,
    churchName: String,
    userFriendToken: String = "R07-JUAN-8492",
    friends: List<R07FriendEntity> = emptyList(),
    communities: List<R07CommunityEntity> = emptyList(),
    onConnectFriend: (token: String, name: String, avatar: String) -> Unit = { _, _, _ -> },
    onRemoveFriend: (friendId: Long) -> Unit = {},
    onRegenerateUserToken: () -> Unit = {},
    onUpdateGroupAttendance: (
        attendedGroup: Boolean,
        groupLearnings: String,
        groupTopics: String,
        groupFeelings: String,
        groupAbsenceReason: String
    ) -> Unit = { _, _, _, _, _ -> },
    onUpdateSundayAttendance: (
        attendedSunday: Boolean,
        sundayNotes: String
    ) -> Unit = { _, _ -> },
    onOpenProfileSettings: () -> Unit = {}
) {
    val colors = R07Theme.colors
    val week = weekWithDays.week

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // TOP HEADER CARD: Community & Church Profile Overview
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, colors.border, RoundedCornerShape(22.dp))
                .testTag("church_community_header_card"),
            shape = RoundedCornerShape(22.dp),
            color = colors.surface,
            shadowElevation = 1.dp
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(colors.primaryContainer)
                                .border(1.dp, colors.primary, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (accountType == UserAccountType.CONNECTION_GROUP) "👥" else "🕊️",
                                fontSize = 20.sp
                            )
                        }

                        Column {
                            Text(
                                text = if (accountType == UserAccountType.CONNECTION_GROUP) "COMUNIDAD & GRUPO DE CONEXIÓN" else "ESPACIO COMUNITARIO Y AMIGOS",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.primary,
                                letterSpacing = 0.8.sp
                            )
                            Text(
                                text = if (accountType == UserAccountType.CONNECTION_GROUP) "$groupName • $churchName" else "Círculo de Fe R07",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = colors.textPrimary,
                                fontSize = 15.sp
                            )
                        }
                    }

                    IconButton(onClick = onOpenProfileSettings) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = "Info Perfil",
                            tint = colors.primary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Stats Badge Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val daysCompleted = weekWithDays.days.count { it.isCompleted || it.reflectionText.isNotBlank() }

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = colors.primaryContainer.copy(alpha = 0.5f),
                        modifier = Modifier.weight(1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text("🔥", fontSize = 14.sp)
                            Text(
                                text = "$daysCompleted/7 R07",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary,
                                fontSize = 11.sp
                            )
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = colors.primaryContainer.copy(alpha = 0.5f),
                        modifier = Modifier.weight(1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text("🤝", fontSize = 14.sp)
                            Text(
                                text = "${friends.size} Amigos",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary,
                                fontSize = 11.sp
                            )
                        }
                    }

                    if (accountType == UserAccountType.CONNECTION_GROUP) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (week.attendedGroup) colors.primaryContainer else colors.surface,
                            border = androidx.compose.foundation.BorderStroke(1.dp, colors.border),
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(if (week.attendedGroup) "✅" else "⏳", fontSize = 13.sp)
                                Text(
                                    text = if (week.attendedGroup) "Grupo ✓" else "Grupo pend.",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary,
                                    fontSize = 10.5.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        // MODULE 1: FRIENDS & FELLOWSHIP VIA UNIQUE TOKENS
        R07FriendsTokenCard(
            userFriendToken = userFriendToken,
            friends = friends,
            onConnectFriend = onConnectFriend,
            onRemoveFriend = onRemoveFriend,
            onRegenerateUserToken = onRegenerateUserToken
        )

        // MODULE 2: CONNECTION GROUP WEEKLY MEETING (IF GROUP/CHURCH ACCOUNT)
        if (accountType == UserAccountType.CONNECTION_GROUP) {
            R07GroupMeetingCard(
                groupName = groupName,
                attendedGroup = week.attendedGroup,
                groupLearnings = week.groupLearnings,
                groupTopics = week.groupTopics,
                groupFeelings = week.groupFeelings,
                groupAbsenceReason = week.groupAbsenceReason,
                onAttendanceChanged = { attended, learnings, topics, feelings, absenceReason ->
                    onUpdateGroupAttendance(attended, learnings, topics, feelings, absenceReason)
                }
            )

            // MODULE 3: SUNDAY SERVICE / CONGREGATIONAL GATHERING
            R07SundayServiceCard(
                churchName = churchName,
                attendedSunday = week.attendedSundayService,
                sundayNotes = week.sundayServiceNotes,
                onSundayAttendanceChanged = { attended, notes ->
                    onUpdateSundayAttendance(attended, notes)
                }
            )
        }

        // MODULE 4: CONGREGATIONAL CHANNELS & MINISTRIES
        if (communities.isNotEmpty()) {
            R07CommunityChannelsCard(
                communities = communities
            )
        }
    }
}
