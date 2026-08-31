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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.R07FriendEntity
import com.example.ui.theme.R07Theme

@Composable
fun R07FriendsTokenCard(
    userFriendToken: String,
    friends: List<R07FriendEntity>,
    onConnectFriend: (token: String, name: String, avatar: String) -> Unit,
    onRemoveFriend: (friendId: Long) -> Unit,
    onRegenerateUserToken: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors
    val clipboardManager = LocalClipboardManager.current

    var showAddFriendDialog by remember { mutableStateOf(false) }
    var inputFriendToken by remember { mutableStateOf("") }
    var inputFriendName by remember { mutableStateOf("") }
    var inputFriendAvatar by remember { mutableStateOf("🌸") }
    var copiedTokenRecently by remember { mutableStateOf(false) }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("friends_token_card"),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = colors.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary.copy(alpha = 0.4f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header with action
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("🤝", fontSize = 20.sp)
                    Column {
                        Text(
                            text = "Amigos & Hermanos de Fe",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Black,
                            color = colors.textPrimary
                        )
                        Text(
                            text = "Conexión espiritual mediante Tokens Únicos",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.textMuted,
                            fontSize = 10.sp
                        )
                    }
                }

                Button(
                    onClick = { showAddFriendDialog = true },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                    modifier = Modifier
                        .height(34.dp)
                        .testTag("add_friend_button")
                ) {
                    Text("+ Conectar", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // User's own token banner
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = colors.primaryContainer.copy(alpha = 0.5f),
                border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary.copy(alpha = 0.3f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "TU TOKEN PARA COMPARTIR:",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary,
                            fontSize = 9.5.sp
                        )
                        Text(
                            text = userFriendToken,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Black,
                            fontSize = 14.sp,
                            color = colors.textPrimary
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        IconButton(
                            onClick = {
                                clipboardManager.setText(AnnotatedString(userFriendToken))
                                copiedTokenRecently = true
                            },
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(
                                imageVector = if (copiedTokenRecently) Icons.Default.Check else Icons.Default.ContentCopy,
                                contentDescription = "Copiar token",
                                tint = colors.primary,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        IconButton(
                            onClick = onRegenerateUserToken,
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Regenerar token",
                                tint = colors.primary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Friends list
            if (friends.isNotEmpty()) {
                Text(
                    text = "AMIGOS EN TU CÍRCULO DEVOCIONAL (${friends.size})",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = colors.textSecondary,
                    fontSize = 10.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    friends.forEach { friend ->
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = colors.background,
                            border = androidx.compose.foundation.BorderStroke(1.dp, colors.border),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(10.dp),
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
                                    Text(friend.avatarEmoji, fontSize = 18.sp)
                                }

                                Column(modifier = Modifier.weight(1f)) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = friend.name,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 13.sp,
                                            color = colors.textPrimary
                                        )
                                        Surface(
                                            shape = RoundedCornerShape(6.dp),
                                            color = colors.primary.copy(alpha = 0.15f)
                                        ) {
                                            Text(
                                                text = friend.friendToken,
                                                fontFamily = FontFamily.Monospace,
                                                fontSize = 9.5.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = colors.primary,
                                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                            )
                                        }
                                    }

                                    if (friend.prayerRequest.isNotBlank()) {
                                        Text(
                                            text = "🙏 «${friend.prayerRequest}»",
                                            style = MaterialTheme.typography.bodySmall,
                                            fontSize = 11.sp,
                                            color = colors.textSecondary,
                                            maxLines = 2
                                        )
                                    }

                                    Text(
                                        text = "${friend.churchOrGroup} • Racha: ${friend.currentStreak} días 🔥",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontSize = 9.5.sp,
                                        color = colors.textMuted
                                    )
                                }

                                IconButton(
                                    onClick = { onRemoveFriend(friend.id) },
                                    modifier = Modifier.size(28.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Desconectar",
                                        tint = Color(0xFFC62828).copy(alpha = 0.7f),
                                        modifier = Modifier.size(16.dp)
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
                        text = "Aún no tienes amigos conectados. Pulsa «+ Conectar» e ingresa el Token Único de un hermano para animarse y orar juntos.",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.textMuted,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(12.dp),
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }

    // Add friend dialog
    if (showAddFriendDialog) {
        Dialog(onDismissRequest = { showAddFriendDialog = false }) {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = colors.surface,
                border = androidx.compose.foundation.BorderStroke(1.dp, colors.border),
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxWidth(0.95f)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Conectar Amigo por Token",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        IconButton(onClick = { showAddFriendDialog = false }, modifier = Modifier.size(28.dp)) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "Cerrar", tint = colors.textPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = inputFriendToken,
                        onValueChange = { inputFriendToken = it },
                        label = { Text("Token Único del Amigo (ej. R07-ANA-4012)") },
                        placeholder = { Text("R07-XXXX-XXXX") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = inputFriendName,
                        onValueChange = { inputFriendName = it },
                        label = { Text("Nombre o Apodo del Amigo") },
                        placeholder = { Text("Ej. Ana María") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "Avatar para este amigo:",
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.textSecondary,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        listOf("🌸", "⚔️", "🕊️", "🌿", "✨", "📖").forEach { emoji ->
                            val isSelected = inputFriendAvatar == emoji
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) colors.primary else colors.background)
                                    .clickable { inputFriendAvatar = emoji },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = emoji, fontSize = 18.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    Button(
                        onClick = {
                            if (inputFriendToken.isNotBlank()) {
                                onConnectFriend(
                                    inputFriendToken.trim(),
                                    inputFriendName.ifBlank { "Amigo de Fe" }.trim(),
                                    inputFriendAvatar
                                )
                                inputFriendToken = ""
                                inputFriendName = ""
                                showAddFriendDialog = false
                            }
                        },
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Text("Conectar y Crecer Juntos ✨", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
