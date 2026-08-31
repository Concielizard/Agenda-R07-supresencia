package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.local.UserAccountType
import com.example.ui.theme.R07Theme

val AVATAR_OPTIONS = listOf("✨", "🕊️", "🌸", "🌿", "⚔️", "📖", "💎", "🛡️", "🌟")

@Composable
fun R07UserProfileDialog(
    currentName: String,
    currentAge: String,
    currentAvatar: String,
    currentEmail: String,
    currentAccountType: UserAccountType,
    currentGroupName: String,
    currentChurchName: String,
    currentLeaderName: String,
    currentLeaderPhone: String,
    currentLeaderEmail: String,
    totalWeeksCount: Int,
    completedDaysTotal: Int,
    currentUserPhotoUri: String = "",
    authProvider: String = "GOOGLE",
    userFriendToken: String = "R07-JUAN-8492",
    onPhotoSelected: (String) -> Unit = {},
    onPhotoRemoved: () -> Unit = {},
    onRegenerateUserToken: () -> Unit = {},
    onLogout: () -> Unit = {},
    onDismiss: () -> Unit,
    onSaveProfile: (
        name: String,
        age: String,
        avatar: String,
        email: String,
        accountType: UserAccountType,
        groupName: String,
        churchName: String
    ) -> Unit,
    onSaveLeaderInfo: (name: String, phone: String, email: String) -> Unit,
    onOpenDesignStudio: () -> Unit,
    onExportPdf: () -> Unit
) {
    val colors = R07Theme.colors
    val clipboardManager = androidx.compose.ui.platform.LocalClipboardManager.current
    var copiedTokenRecently by remember { mutableStateOf(false) }

    var name by remember { mutableStateOf(currentName) }
    var age by remember { mutableStateOf(currentAge) }
    var avatar by remember { mutableStateOf(if (currentAvatar.isNotBlank()) currentAvatar else "✨") }
    var email by remember { mutableStateOf(currentEmail) }
    var accountType by remember { mutableStateOf(currentAccountType) }
    var groupName by remember { mutableStateOf(currentGroupName) }
    var churchName by remember { mutableStateOf(currentChurchName) }

    var leaderName by remember { mutableStateOf(currentLeaderName) }
    var leaderPhone by remember { mutableStateOf(currentLeaderPhone) }
    var leaderEmail by remember { mutableStateOf(currentLeaderEmail) }

    var isEditingMode by remember { mutableStateOf(false) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.90f)
                .clip(RoundedCornerShape(28.dp))
                .border(1.5.dp, colors.borderStrong.copy(alpha = 0.5f), RoundedCornerShape(28.dp))
                .testTag("user_profile_dialog"),
            color = colors.background,
            shape = RoundedCornerShape(28.dp),
            shadowElevation = 10.dp
        ) {
            Column(
                modifier = Modifier.fillMaxHeight()
            ) {
                // FIXED TOP HEADER
                Surface(
                    color = colors.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            R07UserAvatarImage(
                                photoUri = currentUserPhotoUri,
                                fallbackAvatar = avatar,
                                size = 38.dp,
                                isEditable = false
                            )

                            Column {
                                Text(
                                    text = "MI CUENTA & PERFIL",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = colors.primary,
                                    letterSpacing = 0.8.sp
                                )
                                Text(
                                    text = if (name.isNotBlank()) name else "Miembro R07",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Black,
                                    color = colors.textPrimary,
                                    fontSize = 16.sp
                                )
                            }
                        }

                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier.size(32.dp).testTag("close_profile_dialog")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Cerrar",
                                tint = colors.textPrimary
                            )
                        }
                    }
                }

                HorizontalDivider(color = colors.border.copy(alpha = 0.4f))

                // SCROLLABLE CONTENT BODY
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 18.dp, vertical = 12.dp)
                        .verticalScroll(rememberScrollState()),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // ACCOUNT HERO CARD
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = colors.surface),
                        border = androidx.compose.foundation.BorderStroke(1.dp, colors.border)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            // User Photo / Selfie Avatar component
                            R07UserAvatarImage(
                                photoUri = currentUserPhotoUri,
                                fallbackAvatar = avatar,
                                size = 76.dp,
                                isEditable = true,
                                onPhotoSelected = onPhotoSelected,
                                onPhotoRemoved = onPhotoRemoved
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = if (name.isNotBlank()) name else "Nombre no definido",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = colors.textPrimary
                            )

                            if (email.isNotBlank()) {
                                Text(
                                    text = email,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = colors.textMuted
                                )
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // Mode Badge
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = colors.primary.copy(alpha = 0.15f)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(accountType.icon, fontSize = 12.sp)
                                    Text(
                                        text = accountType.displayName,
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.primary
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            // Monthly summary stats
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceEvenly
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "$totalWeeksCount",
                                        style = MaterialTheme.typography.titleLarge,
                                        fontWeight = FontWeight.Black,
                                        color = colors.primary
                                    )
                                    Text(
                                        text = "Semanas R07",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = colors.textSecondary,
                                        fontSize = 10.sp
                                    )
                                }

                                Box(
                                    modifier = Modifier
                                        .width(1.dp)
                                        .height(30.dp)
                                        .background(colors.border)
                                )

                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = "$completedDaysTotal",
                                        style = MaterialTheme.typography.titleLarge,
                                        fontWeight = FontWeight.Black,
                                        color = colors.primary
                                    )
                                    Text(
                                        text = "Días Completados",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = colors.textSecondary,
                                        fontSize = 10.sp
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // SECTION: SELECCIÓN DE MODO DE CUENTA
                    Text(
                        text = "MODO DE USO Y COMUNIDAD",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = colors.textSecondary,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Individual Option
                        val isIndividual = accountType == UserAccountType.INDIVIDUAL
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(14.dp))
                                .border(
                                    width = if (isIndividual) 2.dp else 1.dp,
                                    color = if (isIndividual) colors.primary else colors.border,
                                    shape = RoundedCornerShape(14.dp)
                                )
                                .clickable { accountType = UserAccountType.INDIVIDUAL }
                                .testTag("select_mode_individual"),
                            shape = RoundedCornerShape(14.dp),
                            color = if (isIndividual) colors.primaryContainer.copy(alpha = 0.5f) else colors.surface
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("👤", fontSize = 16.sp)
                                    Text(
                                        text = "Personal",
                                        fontWeight = FontWeight.Bold,
                                        color = if (isIndividual) colors.primary else colors.textPrimary,
                                        fontSize = 12.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Devocional y oración a solas",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = colors.textMuted,
                                    fontSize = 9.5.sp
                                )
                            }
                        }

                        // Connection Group Option
                        val isGroup = accountType == UserAccountType.CONNECTION_GROUP
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(14.dp))
                                .border(
                                    width = if (isGroup) 2.dp else 1.dp,
                                    color = if (isGroup) colors.primary else colors.border,
                                    shape = RoundedCornerShape(14.dp)
                                )
                                .clickable { accountType = UserAccountType.CONNECTION_GROUP }
                                .testTag("select_mode_group"),
                            shape = RoundedCornerShape(14.dp),
                            color = if (isGroup) colors.primaryContainer.copy(alpha = 0.5f) else colors.surface
                        ) {
                            Column(modifier = Modifier.padding(10.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("👥", fontSize = 16.sp)
                                    Text(
                                        text = "Grupo & Iglesia",
                                        fontWeight = FontWeight.Bold,
                                        color = if (isGroup) colors.primary else colors.textPrimary,
                                        fontSize = 12.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Grupo semanal y 2 oraciones",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = colors.textMuted,
                                    fontSize = 9.5.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // SECTION: DATOS PERSONALES
                    Text(
                        text = "DATOS DEL USUARIO",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = colors.textSecondary,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    // Profile Photo / Selfie Management Box
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = colors.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, colors.border),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                R07UserAvatarImage(
                                    photoUri = currentUserPhotoUri,
                                    fallbackAvatar = avatar,
                                    size = 52.dp,
                                    isEditable = true,
                                    onPhotoSelected = onPhotoSelected,
                                    onPhotoRemoved = onPhotoRemoved
                                )
                                Column {
                                    Text(
                                        text = if (currentUserPhotoUri.isNotBlank()) "Foto de Perfil Verificada ✓" else "Subir Selfie / Foto 1:1",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = if (currentUserPhotoUri.isNotBlank()) colors.accentSuccess else colors.textPrimary,
                                        fontSize = 12.5.sp
                                    )
                                    Text(
                                        text = "Toca para tomar selfie con cámara o elegir de tu galería.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = colors.textMuted,
                                        fontSize = 10.sp,
                                        lineHeight = 14.sp
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Emblema Devocional Secundario:",
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.textSecondary,
                        modifier = Modifier.fillMaxWidth(),
                        fontSize = 10.5.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))

                    // Choose avatar emojis
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        AVATAR_OPTIONS.forEach { emojiOption ->
                            val isSelected = avatar == emojiOption
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) colors.primaryContainer else colors.surface)
                                    .border(
                                        width = if (isSelected) 2.dp else 1.dp,
                                        color = if (isSelected) colors.primary else colors.border,
                                        shape = CircleShape
                                    )
                                    .clickable { avatar = emojiOption },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(emojiOption, fontSize = 14.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nombre completo", fontSize = 12.sp) },
                        placeholder = { Text("Ej. Juan Santiago", fontSize = 12.sp) },
                        modifier = Modifier.fillMaxWidth().testTag("profile_input_name"),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = colors.primary,
                            unfocusedBorderColor = colors.border,
                            focusedContainerColor = colors.surface,
                            unfocusedContainerColor = colors.surface
                        )
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = age,
                            onValueChange = { age = it },
                            label = { Text("Edad", fontSize = 12.sp) },
                            placeholder = { Text("Ej. 24", fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(0.4f).testTag("profile_input_age"),
                            shape = RoundedCornerShape(14.dp),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = colors.primary,
                                unfocusedBorderColor = colors.border,
                                focusedContainerColor = colors.surface,
                                unfocusedContainerColor = colors.surface
                            )
                        )

                        OutlinedTextField(
                            value = email,
                            onValueChange = { email = it },
                            label = { Text("Correo (opcional)", fontSize = 12.sp) },
                            placeholder = { Text("correo@ejemplo.com", fontSize = 12.sp) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            modifier = Modifier.weight(0.6f).testTag("profile_input_email"),
                            shape = RoundedCornerShape(14.dp),
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = colors.primary,
                                unfocusedBorderColor = colors.border,
                                focusedContainerColor = colors.surface,
                                unfocusedContainerColor = colors.surface
                            )
                        )
                    }

                    // IF CONNECTION GROUP: SHOW GROUP & LEADER DETAILS
                    if (accountType == UserAccountType.CONNECTION_GROUP) {
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "INFORMACIÓN DE GRUPO & IGLESIA",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black,
                            color = colors.textSecondary,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(6.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = groupName,
                                onValueChange = { groupName = it },
                                label = { Text("Nombre del Grupo", fontSize = 12.sp) },
                                placeholder = { Text("Ej. Grupo Josué 1:9", fontSize = 12.sp) },
                                modifier = Modifier.weight(1f).testTag("profile_input_group"),
                                shape = RoundedCornerShape(14.dp),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = colors.primary,
                                    unfocusedBorderColor = colors.border,
                                    focusedContainerColor = colors.surface,
                                    unfocusedContainerColor = colors.surface
                                )
                            )

                            OutlinedTextField(
                                value = churchName,
                                onValueChange = { churchName = it },
                                label = { Text("Iglesia / Sede", fontSize = 12.sp) },
                                placeholder = { Text("Ej. Sede Norte", fontSize = 12.sp) },
                                modifier = Modifier.weight(1f).testTag("profile_input_church"),
                                shape = RoundedCornerShape(14.dp),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = colors.primary,
                                    unfocusedBorderColor = colors.border,
                                    focusedContainerColor = colors.surface,
                                    unfocusedContainerColor = colors.surface
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = colors.surface),
                            border = androidx.compose.foundation.BorderStroke(1.dp, colors.border)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Shield,
                                        contentDescription = null,
                                        tint = colors.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = "Datos de tu Líder de Grupo",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = colors.textPrimary
                                    )
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                OutlinedTextField(
                                    value = leaderName,
                                    onValueChange = { leaderName = it },
                                    label = { Text("Nombre del Líder", fontSize = 11.sp) },
                                    placeholder = { Text("Ej. David Morales", fontSize = 11.sp) },
                                    modifier = Modifier.fillMaxWidth().testTag("profile_input_leader_name"),
                                    shape = RoundedCornerShape(12.dp),
                                    singleLine = true,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = colors.primary,
                                        unfocusedBorderColor = colors.border,
                                        focusedContainerColor = colors.background,
                                        unfocusedContainerColor = colors.background
                                    )
                                )

                                Spacer(modifier = Modifier.height(6.dp))

                                OutlinedTextField(
                                    value = leaderPhone,
                                    onValueChange = { leaderPhone = it },
                                    label = { Text("WhatsApp / Celular del Líder", fontSize = 11.sp) },
                                    placeholder = { Text("Ej. +57 300 123 4567", fontSize = 11.sp) },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                    modifier = Modifier.fillMaxWidth().testTag("profile_input_leader_phone"),
                                    shape = RoundedCornerShape(12.dp),
                                    singleLine = true,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = colors.primary,
                                        unfocusedBorderColor = colors.border,
                                        focusedContainerColor = colors.background,
                                        unfocusedContainerColor = colors.background
                                    )
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // SECTION: TOKEN ÚNICO DE AMIGO
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "TU IDENTIFICADOR ÚNICO DE COMUNIDAD",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = colors.textSecondary,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(6.dp))

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
                                    text = "TOKEN ÚNICO DE AMIGO:",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primary,
                                    fontSize = 9.5.sp
                                )
                                Text(
                                    text = userFriendToken,
                                    fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 14.sp,
                                    color = colors.textPrimary
                                )
                            }

                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                IconButton(
                                    onClick = {
                                        clipboardManager.setText(androidx.compose.ui.text.AnnotatedString(userFriendToken))
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

                    Spacer(modifier = Modifier.height(14.dp))

                    // QUICK ACCESS TOOLS IN PROFILE
                    Text(
                        text = "AJUSTES RÁPIDOS",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = colors.textSecondary,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                onDismiss()
                                onOpenDesignStudio()
                            },
                            modifier = Modifier.weight(1f).testTag("profile_open_theme_studio"),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.primary)
                        ) {
                            Icon(Icons.Default.Palette, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Temas & Paletas", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = {
                                onDismiss()
                                onExportPdf()
                            },
                            modifier = Modifier.weight(1f).testTag("profile_export_pdf_button"),
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.primary)
                        ) {
                            Icon(Icons.Default.PictureAsPdf, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Exportar PDF", fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // LOGOUT BUTTON
                    OutlinedButton(
                        onClick = {
                            onDismiss()
                            onLogout()
                        },
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFC62828)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFC62828).copy(alpha = 0.4f)),
                        modifier = Modifier.fillMaxWidth().testTag("profile_logout_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = null,
                            tint = Color(0xFFC62828),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Cerrar Sesión ($authProvider)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFC62828)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))
                }

                // FIXED PINNED BOTTOM ACTION BAR
                HorizontalDivider(color = colors.border.copy(alpha = 0.4f))
                Surface(
                    color = colors.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
                    ) {
                        Button(
                            onClick = {
                                onSaveProfile(
                                    name,
                                    age,
                                    avatar,
                                    email,
                                    accountType,
                                    groupName,
                                    churchName
                                )
                                if (accountType == UserAccountType.CONNECTION_GROUP) {
                                    onSaveLeaderInfo(leaderName, leaderPhone, leaderEmail)
                                }
                                onDismiss()
                            },
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("profile_save_button")
                        ) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = Color.White)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Guardar Cambios de Perfil ✨",
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
