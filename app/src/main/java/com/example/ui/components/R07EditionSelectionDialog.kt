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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FormatColorFill
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.local.AppColorPalette
import com.example.data.local.AppEdition
import com.example.data.local.AppFontFamily
import com.example.data.local.AppLogoSymbol
import com.example.data.local.AppLogoTheme
import com.example.data.local.AppThemeMode
import com.example.data.local.UserAccountType
import com.example.ui.theme.getComposeFontFamily
import com.example.ui.theme.getThemeColors

@Composable
fun R07StartupEditionScreen(
    onCompleteOnboarding: (
        edition: AppEdition,
        palette: AppColorPalette,
        accountType: UserAccountType,
        name: String,
        age: String,
        avatar: String,
        email: String,
        groupName: String,
        churchName: String
    ) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedEdition by remember { mutableStateOf(AppEdition.WOMEN) }
    var selectedPalette by remember { mutableStateOf(AppColorPalette.WOMEN_PINK) }
    var selectedAccountType by remember { mutableStateOf(UserAccountType.INDIVIDUAL) }
    var name by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var avatar by remember { mutableStateOf("🌸") }
    var email by remember { mutableStateOf("") }
    var groupName by remember { mutableStateOf("") }
    var churchName by remember { mutableStateOf("") }

    val activeColors = getThemeColors(selectedPalette, false)

    Surface(
        modifier = modifier
            .fillMaxSize()
            .testTag("edition_startup_screen"),
        color = Color(0xFFFAF7F5)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            // BRAND BADGE
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFF1E293B),
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "AGENDA DEVOCIONAL R07",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        letterSpacing = 1.sp
                    )
                }
            }

            Text(
                text = "Pasa tiempo Conmigo",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black,
                color = Color(0xFF111111),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Personaliza tu perfil, enfoque espiritual y paleta de colores para comenzar tus 7 días con Dios.",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF555555),
                textAlign = TextAlign.Center,
                lineHeight = 18.sp,
                modifier = Modifier.padding(horizontal = 10.dp)
            )

            Spacer(modifier = Modifier.height(20.dp))

            // STEP 1: ACCOUNT TYPE SELECTOR
            Text(
                text = "1. SELECCIONA TU MODO DE USO",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Black,
                color = Color(0xFF333333),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val isIndiv = selectedAccountType == UserAccountType.INDIVIDUAL
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .border(
                            width = if (isIndiv) 2.dp else 1.dp,
                            color = if (isIndiv) activeColors.primary else Color(0xFFDCD6CD),
                            shape = RoundedCornerShape(16.dp)
                        )
                        .clickable { selectedAccountType = UserAccountType.INDIVIDUAL }
                        .testTag("startup_mode_individual"),
                    shape = RoundedCornerShape(16.dp),
                    color = if (isIndiv) activeColors.primaryContainer.copy(alpha = 0.6f) else Color.White
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("👤", fontSize = 18.sp)
                            Text(
                                text = "Personal",
                                fontWeight = FontWeight.Bold,
                                color = if (isIndiv) activeColors.primary else Color(0xFF111111),
                                fontSize = 13.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Devocional y oración personal a solas.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF555555),
                            fontSize = 10.5.sp
                        )
                    }
                }

                val isGroup = selectedAccountType == UserAccountType.CONNECTION_GROUP
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .border(
                            width = if (isGroup) 2.dp else 1.dp,
                            color = if (isGroup) activeColors.primary else Color(0xFFDCD6CD),
                            shape = RoundedCornerShape(16.dp)
                        )
                        .clickable { selectedAccountType = UserAccountType.CONNECTION_GROUP }
                        .testTag("startup_mode_group"),
                    shape = RoundedCornerShape(16.dp),
                    color = if (isGroup) activeColors.primaryContainer.copy(alpha = 0.6f) else Color.White
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("👥", fontSize = 18.sp)
                            Text(
                                text = "Grupo e Iglesia",
                                fontWeight = FontWeight.Bold,
                                color = if (isGroup) activeColors.primary else Color(0xFF111111),
                                fontSize = 13.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "1 grupo semanal y 2 oraciones en iglesia.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF555555),
                            fontSize = 10.5.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // STEP 2: PROFILE DETAILS
            Text(
                text = "2. TU INFORMACIÓN Y PERFIL",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Black,
                color = Color(0xFF333333),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(6.dp))

            // Choose avatar emojis
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                AVATAR_OPTIONS.forEach { emojiOption ->
                    val isSelected = avatar == emojiOption
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(if (isSelected) activeColors.primaryContainer else Color.White)
                            .border(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = if (isSelected) activeColors.primary else Color(0xFFDCD6CD),
                                shape = CircleShape
                            )
                            .clickable { avatar = emojiOption },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(emojiOption, fontSize = 15.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Tu nombre", fontSize = 12.sp) },
                placeholder = { Text("Ej. María / Juan", fontSize = 12.sp) },
                modifier = Modifier.fillMaxWidth().testTag("startup_input_name"),
                shape = RoundedCornerShape(14.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = activeColors.primary,
                    unfocusedBorderColor = Color(0xFFDCD6CD),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White
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
                    placeholder = { Text("Ej. 25", fontSize = 12.sp) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.weight(0.4f).testTag("startup_input_age"),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = activeColors.primary,
                        unfocusedBorderColor = Color(0xFFDCD6CD),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Correo (opcional)", fontSize = 12.sp) },
                    placeholder = { Text("tu@correo.com", fontSize = 12.sp) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier.weight(0.6f).testTag("startup_input_email"),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = activeColors.primary,
                        unfocusedBorderColor = Color(0xFFDCD6CD),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
            }

            if (selectedAccountType == UserAccountType.CONNECTION_GROUP) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = groupName,
                        onValueChange = { groupName = it },
                        label = { Text("Nombre Grupo", fontSize = 11.sp) },
                        placeholder = { Text("Ej. Conexión Vida", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f).testTag("startup_input_group"),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = activeColors.primary,
                            unfocusedBorderColor = Color(0xFFDCD6CD),
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = churchName,
                        onValueChange = { churchName = it },
                        label = { Text("Iglesia", fontSize = 11.sp) },
                        placeholder = { Text("Ej. Sede Central", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f).testTag("startup_input_church"),
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = activeColors.primary,
                            unfocusedBorderColor = Color(0xFFDCD6CD),
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // STEP 3: EDITIONS AND COLOR PALETTE
            Text(
                text = "3. VERSIÓN & PALETA DE COLOR",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Black,
                color = Color(0xFF333333),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // WOMEN
                val isWomen = selectedEdition == AppEdition.WOMEN
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .border(
                            width = if (isWomen) 2.dp else 1.dp,
                            color = if (isWomen) Color(0xFFC25975) else Color(0xFFDCD6CD),
                            shape = RoundedCornerShape(16.dp)
                        )
                        .clickable {
                            selectedEdition = AppEdition.WOMEN
                            selectedPalette = AppColorPalette.WOMEN_PINK
                            avatar = "🌸"
                        }
                        .testTag("startup_edition_women"),
                    shape = RoundedCornerShape(16.dp),
                    color = if (isWomen) Color(0xFFFFF4F6) else Color.White
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("🌸", fontSize = 18.sp)
                            Text("Mujeres", fontWeight = FontWeight.Bold, color = if (isWomen) Color(0xFFC25975) else Color(0xFF111111), fontSize = 13.sp)
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text("Rosado Pastel & Crema", style = MaterialTheme.typography.labelSmall, color = Color(0xFFB03F5E), fontSize = 10.sp)
                    }
                }

                // MEN
                val isMen = selectedEdition == AppEdition.MEN
                Surface(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .border(
                            width = if (isMen) 2.dp else 1.dp,
                            color = if (isMen) Color(0xFF0D47A1) else Color(0xFFDCD6CD),
                            shape = RoundedCornerShape(16.dp)
                        )
                        .clickable {
                            selectedEdition = AppEdition.MEN
                            selectedPalette = AppColorPalette.MEN_BLUE
                            avatar = "⚔️"
                        }
                        .testTag("startup_edition_men"),
                    shape = RoundedCornerShape(16.dp),
                    color = if (isMen) Color(0xFFF2F7FC) else Color.White
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("⚔️", fontSize = 18.sp)
                            Text("Hombres", fontWeight = FontWeight.Bold, color = if (isMen) Color(0xFF0D47A1) else Color(0xFF111111), fontSize = 13.sp)
                        }
                        Spacer(modifier = Modifier.height(2.dp))
                        Text("Azul Rey & Arena", style = MaterialTheme.typography.labelSmall, color = Color(0xFF0D47A1), fontSize = 10.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // START BUTTON
            Button(
                onClick = {
                    val finalName = if (name.isNotBlank()) name else (if (selectedEdition == AppEdition.WOMEN) "Hermana en la Fe" else "Hermano de Fe")
                    onCompleteOnboarding(
                        selectedEdition,
                        selectedPalette,
                        selectedAccountType,
                        finalName,
                        age,
                        avatar,
                        email,
                        groupName,
                        churchName
                    )
                },
                shape = RoundedCornerShape(18.dp),
                colors = ButtonDefaults.buttonColors(containerColor = activeColors.primary),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("confirm_edition_button")
            ) {
                Text(
                    text = "Comenzar mi R07 «Pasa tiempo Conmigo» ✨",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun R07EditionSelectionDialog(
    currentEdition: AppEdition,
    currentThemeMode: AppThemeMode = AppThemeMode.LIGHT,
    currentColorPalette: AppColorPalette = AppColorPalette.WOMEN_PINK,
    currentFontFamily: AppFontFamily = AppFontFamily.DEFAULT,
    currentLogoTheme: AppLogoTheme = AppLogoTheme.DYNAMIC,
    currentLogoSymbol: AppLogoSymbol = AppLogoSymbol.DOVE_CROSS,
    onDismiss: () -> Unit,
    onEditionSelected: (AppEdition) -> Unit,
    onThemeModeSelected: (AppThemeMode) -> Unit = {},
    onPaletteSelected: (AppColorPalette) -> Unit = {},
    onFontFamilySelected: (AppFontFamily) -> Unit = {},
    onLogoThemeSelected: (AppLogoTheme) -> Unit = {},
    onLogoSymbolSelected: (AppLogoSymbol) -> Unit = {}
) {
    var selectedEdition by remember(currentEdition) { mutableStateOf(currentEdition) }
    var selectedThemeMode by remember(currentThemeMode) { mutableStateOf(currentThemeMode) }
    var selectedPalette by remember(currentColorPalette) { mutableStateOf(currentColorPalette) }
    var selectedFontFamily by remember(currentFontFamily) { mutableStateOf(currentFontFamily) }
    var selectedLogoTheme by remember(currentLogoTheme) { mutableStateOf(currentLogoTheme) }
    var selectedLogoSymbol by remember(currentLogoSymbol) { mutableStateOf(currentLogoSymbol) }

    // Live preview colors based on current selection
    val isDark = selectedThemeMode == AppThemeMode.DARK
    val activeColors = getThemeColors(selectedPalette, isDark)

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.92f)
                .clip(RoundedCornerShape(28.dp))
                .border(1.5.dp, activeColors.borderStrong.copy(alpha = 0.5f), RoundedCornerShape(28.dp))
                .testTag("edition_selection_dialog"),
            shape = RoundedCornerShape(28.dp),
            color = activeColors.background,
            shadowElevation = 12.dp
        ) {
            Column(
                modifier = Modifier.fillMaxHeight()
            ) {
                // FIXED TOP HEADER
                Surface(
                    color = activeColors.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 18.dp, vertical = 14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            R07AppLogo(
                                size = 38.dp,
                                logoTheme = selectedLogoTheme,
                                logoSymbol = selectedLogoSymbol
                            )
                            Column {
                                Text(
                                    text = "ESTUDIO DE DISEÑO R07",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = activeColors.primary,
                                    letterSpacing = 0.8.sp
                                )
                                Text(
                                    text = "Personalización Premium & Tipografía",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Black,
                                    color = activeColors.textPrimary,
                                    fontSize = 14.sp
                                )
                            }
                        }

                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier.size(32.dp).testTag("close_edition_dialog")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Cerrar",
                                tint = activeColors.textPrimary
                            )
                        }
                    }
                }

                HorizontalDivider(color = activeColors.border.copy(alpha = 0.4f))

                // SCROLLABLE BODY
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 18.dp, vertical = 12.dp)
                        .verticalScroll(rememberScrollState()),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // SECTION 1: MODO CLARO / OSCURO / SISTEMA
                    Text(
                        text = "1. MODO DE VISUALIZACIÓN (CONTRASTE WCAG)",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = activeColors.textSecondary,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        AppThemeMode.entries.forEach { mode ->
                            val isModeSelected = selectedThemeMode == mode
                            FilterChip(
                                selected = isModeSelected,
                                onClick = { selectedThemeMode = mode },
                                label = {
                                    Text(
                                        text = "${mode.icon} ${mode.displayName}",
                                        fontWeight = if (isModeSelected) FontWeight.Bold else FontWeight.Medium,
                                        fontSize = 11.sp
                                    )
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = activeColors.primary,
                                    selectedLabelColor = Color.White,
                                    containerColor = activeColors.surface,
                                    labelColor = activeColors.textPrimary
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f).testTag("theme_mode_${mode.name.lowercase()}")
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // SECTION 2: TIPOGRAFÍA & FUENTE DEVOCIONAL
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "2. TIPOGRAFÍA DEVOCIONAL",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black,
                            color = activeColors.textSecondary
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = activeColors.primary.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = selectedFontFamily.displayName,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = activeColors.primary,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                fontSize = 10.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Font preview card
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = activeColors.primaryContainer.copy(alpha = 0.4f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, activeColors.primary.copy(alpha = 0.3f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "MUESTRA DE LECTURA BÍBLICA (Salmo 119:105):",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = activeColors.primary,
                                fontSize = 9.5.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "«Lámpara es a mis pies tu palabra, y lumbrera a mi camino.»",
                                fontFamily = getComposeFontFamily(selectedFontFamily),
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.Medium,
                                color = activeColors.textPrimary,
                                fontStyle = FontStyle.Italic,
                                lineHeight = 19.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Font selector list
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        AppFontFamily.entries.forEach { fontOption ->
                            val isFontSelected = selectedFontFamily == fontOption
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .border(
                                        width = if (isFontSelected) 1.5.dp else 1.dp,
                                        color = if (isFontSelected) activeColors.primary else activeColors.border,
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .clickable { selectedFontFamily = fontOption }
                                    .testTag("font_family_card_${fontOption.name.lowercase()}"),
                                shape = RoundedCornerShape(12.dp),
                                color = if (isFontSelected) activeColors.primaryContainer.copy(alpha = 0.5f) else activeColors.surface
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        Text(fontOption.icon, fontSize = 16.sp)
                                        Column {
                                            Text(
                                                text = fontOption.displayName,
                                                fontFamily = getComposeFontFamily(fontOption),
                                                fontWeight = FontWeight.Bold,
                                                color = activeColors.textPrimary,
                                                fontSize = 12.5.sp
                                            )
                                            Text(
                                                text = fontOption.subtitle,
                                                style = MaterialTheme.typography.bodySmall,
                                                color = activeColors.textSecondary,
                                                fontSize = 10.sp
                                            )
                                        }
                                    }

                                    if (isFontSelected) {
                                        Surface(
                                            shape = CircleShape,
                                            color = activeColors.primary,
                                            modifier = Modifier.size(20.dp)
                                        ) {
                                            Box(contentAlignment = Alignment.Center) {
                                                Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(13.dp))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // SECTION 3: PALETAS DE COLOR PREMIUM
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "3. PALETAS DE COLOR DISPONIBLES",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black,
                            color = activeColors.textSecondary
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = activeColors.primary.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "${AppColorPalette.entries.size} estilos",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = activeColors.primary,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        AppColorPalette.entries.forEach { palette ->
                            val isSelected = selectedPalette == palette
                            val previewTheme = getThemeColors(palette, isDark)

                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(16.dp))
                                    .border(
                                        width = if (isSelected) 2.dp else 1.dp,
                                        color = if (isSelected) previewTheme.primary else activeColors.border,
                                        shape = RoundedCornerShape(16.dp)
                                    )
                                    .clickable { selectedPalette = palette }
                                    .testTag("palette_card_${palette.name.lowercase()}"),
                                shape = RoundedCornerShape(16.dp),
                                color = if (isSelected) previewTheme.background else activeColors.surface,
                                shadowElevation = if (isSelected) 2.dp else 0.dp
                            ) {
                                Column(modifier = Modifier.padding(12.dp)) {
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
                                                    .size(36.dp)
                                                    .clip(CircleShape)
                                                    .background(previewTheme.primaryContainer)
                                                    .border(1.dp, previewTheme.primary, CircleShape),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(palette.icon, fontSize = 17.sp)
                                            }

                                            Column {
                                                Text(
                                                    text = palette.displayName,
                                                    style = MaterialTheme.typography.titleSmall,
                                                    fontWeight = FontWeight.Bold,
                                                    color = previewTheme.textPrimary,
                                                    fontSize = 13.sp
                                                )
                                                Text(
                                                    text = palette.description,
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = previewTheme.textSecondary,
                                                    fontSize = 10.5.sp
                                                )
                                            }
                                        }

                                        if (isSelected) {
                                            Surface(
                                                shape = CircleShape,
                                                color = previewTheme.primary,
                                                modifier = Modifier.size(24.dp)
                                            ) {
                                                Box(contentAlignment = Alignment.Center) {
                                                    Icon(
                                                        imageVector = Icons.Default.Check,
                                                        contentDescription = "Activo",
                                                        tint = Color.White,
                                                        modifier = Modifier.size(16.dp)
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // SECTION 4: PERSONALIZACIÓN DEL LOGOTIPO & BRANDING
                    Text(
                        text = "4. PERSONALIZACIÓN DEL LOGOTIPO & SÍMBOLO",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = activeColors.textSecondary,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    // Live Logo Preview Box
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = activeColors.surface,
                        border = androidx.compose.foundation.BorderStroke(1.dp, activeColors.border),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            R07AppLogo(
                                size = 46.dp,
                                logoTheme = selectedLogoTheme,
                                logoSymbol = selectedLogoSymbol,
                                showBrandText = true,
                                subtitle = "VISTA PREVIA DE TU LOGO"
                            )
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = activeColors.primaryContainer.copy(alpha = 0.6f)
                            ) {
                                Text(
                                    text = "${selectedLogoTheme.displayName.take(12)}...",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = activeColors.primary,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Símbolos Devocionales
                    Text(
                        text = "Símbolo Espiritual Central:",
                        style = MaterialTheme.typography.labelSmall,
                        color = activeColors.textSecondary,
                        modifier = Modifier.fillMaxWidth(),
                        fontSize = 11.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        AppLogoSymbol.entries.forEach { symbol ->
                            val isSymbolSelected = selectedLogoSymbol == symbol
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSymbolSelected) activeColors.primary else activeColors.surface,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSymbolSelected) activeColors.primary else activeColors.border
                                ),
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .clickable { selectedLogoSymbol = symbol }
                                    .testTag("logo_symbol_${symbol.name.lowercase()}")
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(symbol.symbolChar, fontSize = 15.sp)
                                    Text(
                                        text = symbol.displayName,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSymbolSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSymbolSelected) Color.White else activeColors.textPrimary
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Temas de Color del Logotipo
                    Text(
                        text = "Gama Cromática del Logo:",
                        style = MaterialTheme.typography.labelSmall,
                        color = activeColors.textSecondary,
                        modifier = Modifier.fillMaxWidth(),
                        fontSize = 11.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        AppLogoTheme.entries.forEach { logoTh ->
                            val isThSelected = selectedLogoTheme == logoTh
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isThSelected) activeColors.primaryContainer.copy(alpha = 0.5f) else activeColors.surface,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isThSelected) activeColors.primary else activeColors.border
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .clickable { selectedLogoTheme = logoTh }
                                    .testTag("logo_theme_${logoTh.name.lowercase()}")
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Text(logoTh.icon, fontSize = 15.sp)
                                        Text(
                                            text = logoTh.displayName,
                                            fontWeight = if (isThSelected) FontWeight.Bold else FontWeight.Medium,
                                            fontSize = 11.5.sp,
                                            color = activeColors.textPrimary
                                        )
                                    }
                                    if (isThSelected) {
                                        Icon(Icons.Default.Check, contentDescription = null, tint = activeColors.primary, modifier = Modifier.size(15.dp))
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                }

                // FIXED PINNED BOTTOM ACTION BAR
                HorizontalDivider(color = activeColors.border.copy(alpha = 0.4f))
                Surface(
                    color = activeColors.surface,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)
                    ) {
                        Button(
                            onClick = {
                                onEditionSelected(selectedEdition)
                                onThemeModeSelected(selectedThemeMode)
                                onPaletteSelected(selectedPalette)
                                onFontFamilySelected(selectedFontFamily)
                                onLogoThemeSelected(selectedLogoTheme)
                                onLogoSymbolSelected(selectedLogoSymbol)
                                onDismiss()
                            },
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = activeColors.primary),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp)
                                .testTag("save_selected_edition_button")
                        ) {
                            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Aplicar Diseño & Guardar ✨",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}
