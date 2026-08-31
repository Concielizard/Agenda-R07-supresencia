package com.example.ui.components

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.local.AppColorPalette
import com.example.data.local.AppEdition
import com.example.data.local.UserAccountType
import com.example.ui.theme.R07EditionColors
import com.example.ui.theme.getThemeColors

val EXTENDED_AVATARS = listOf(
    "🌸", "⚔️", "🕊️", "🌿", "✨", "📖",
    "🛡️", "💎", "👑", "🕯️", "🌅", "🦁",
    "🌾", "⛵", "🪴", "⛪", "🤍", "🌟"
)

enum class OnboardingStep(val title: String, val stepNumber: Int) {
    AUTH_GATE("Registro e Inicio de Sesión", 1),
    PROFILE_SETUP("Perfil y Token Único", 2),
    ACCOUNT_TYPE("Enfoque de Cuenta", 3),
    COMMUNITY_SETUP("Comunidad y Estilo", 4)
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun R07AuthOnboardingScreen(
    onGoogleSignIn: () -> Unit = {},
    onAppleSignIn: () -> Unit = {},
    onEmailSignIn: (String, String) -> Unit = { _, _ -> },
    onCompleteOnboarding: (
        edition: AppEdition,
        palette: AppColorPalette,
        accountType: UserAccountType,
        name: String,
        age: String,
        avatar: String,
        email: String,
        groupName: String,
        churchName: String,
        userToken: String,
        friendTokenToConnect: String,
        leaderName: String,
        leaderPhone: String,
        leaderEmail: String
    ) -> Unit,
    modifier: Modifier = Modifier
) {
    val clipboardManager = LocalClipboardManager.current
    var currentStep by remember { mutableStateOf(OnboardingStep.AUTH_GATE) }

    // Auth State
    var authProvider by remember { mutableStateOf("GOOGLE") }
    var userEmail by remember { mutableStateOf("juansantiagogonzalezmarin@gmail.com") }
    var userName by remember { mutableStateOf("Juan Santiago González Marín") }
    var userAge by remember { mutableStateOf("26") }
    var userAvatar by remember { mutableStateOf("🌸") }
    var userBio by remember { mutableStateOf("Caminando cada día en la gracia de Dios ✨") }
    var userFriendToken by remember { mutableStateOf("R07-JUAN-8492") }

    // Account & Community State
    var selectedAccountType by remember { mutableStateOf(UserAccountType.INDIVIDUAL) }
    var isCreatingCommunity by remember { mutableStateOf(true) }
    var groupName by remember { mutableStateOf("Célula Jóvenes de Gracia") }
    var churchName by remember { mutableStateOf("Iglesia Central de Fe") }
    var communityToken by remember { mutableStateOf("COM-VIDA-9921") }
    var friendTokenToConnect by remember { mutableStateOf("") }

    // Edition & Style State
    var selectedEdition by remember { mutableStateOf(AppEdition.WOMEN) }
    var selectedPalette by remember { mutableStateOf(AppColorPalette.WOMEN_PINK) }

    // Dialog state for Google / Custom account quick selector
    var showGoogleAccountPicker by remember { mutableStateOf(false) }
    var showAppleAccountPicker by remember { mutableStateOf(false) }
    var showEmailAuthDialog by remember { mutableStateOf(false) }

    val activeColors = getThemeColors(selectedPalette, false)

    Surface(
        modifier = modifier
            .fillMaxSize()
            .testTag("r07_auth_onboarding_screen"),
        color = Color(0xFFFAF7F5)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // STEP PROGRESS INDICATOR
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (currentStep != OnboardingStep.AUTH_GATE) {
                    IconButton(
                        onClick = {
                            currentStep = when (currentStep) {
                                OnboardingStep.PROFILE_SETUP -> OnboardingStep.AUTH_GATE
                                OnboardingStep.ACCOUNT_TYPE -> OnboardingStep.PROFILE_SETUP
                                OnboardingStep.COMMUNITY_SETUP -> OnboardingStep.ACCOUNT_TYPE
                                else -> OnboardingStep.AUTH_GATE
                            }
                        },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = activeColors.primary
                        )
                    }
                } else {
                    Spacer(modifier = Modifier.size(36.dp))
                }

                // Step dots
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OnboardingStep.entries.forEach { step ->
                        val isActive = step == currentStep
                        val isDone = step.stepNumber < currentStep.stepNumber
                        Box(
                            modifier = Modifier
                                .height(6.dp)
                                .width(if (isActive) 24.dp else 8.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(
                                    when {
                                        isActive -> activeColors.primary
                                        isDone -> activeColors.primary.copy(alpha = 0.4f)
                                        else -> Color(0xFFD6CEC7)
                                    }
                                )
                        )
                    }
                }

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = activeColors.primary.copy(alpha = 0.12f)
                ) {
                    Text(
                        text = "Paso ${currentStep.stepNumber} de 4",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = activeColors.primary,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            AnimatedContent(
                targetState = currentStep,
                transitionSpec = {
                    if (targetState.stepNumber > initialState.stepNumber) {
                        slideInHorizontally { it } + fadeIn() togetherWith slideOutHorizontally { -it } + fadeOut()
                    } else {
                        slideInHorizontally { -it } + fadeIn() togetherWith slideOutHorizontally { it } + fadeOut()
                    }
                },
                label = "onboarding_step_content"
            ) { step ->
                when (step) {
                    OnboardingStep.AUTH_GATE -> {
                        AuthGateContent(
                            onSelectGoogle = {
                                showGoogleAccountPicker = true
                            },
                            onSelectApple = {
                                showAppleAccountPicker = true
                            },
                            onSelectEmail = {
                                showEmailAuthDialog = true
                            },
                            activeColors = activeColors
                        )
                    }

                    OnboardingStep.PROFILE_SETUP -> {
                        ProfileSetupContent(
                            authProvider = authProvider,
                            userEmail = userEmail,
                            userName = userName,
                            onNameChange = {
                                userName = it
                                val prefix = it.trim().filter { c -> c.isLetter() }.uppercase().take(5).ifEmpty { "JUAN" }
                                val randomNum = (1000..9999).random()
                                userFriendToken = "R07-$prefix-$randomNum"
                            },
                            userAge = userAge,
                            onAgeChange = { userAge = it },
                            userAvatar = userAvatar,
                            onAvatarChange = { userAvatar = it },
                            userBio = userBio,
                            onBioChange = { userBio = it },
                            userFriendToken = userFriendToken,
                            onRegenerateToken = {
                                val prefix = userName.trim().filter { c -> c.isLetter() }.uppercase().take(5).ifEmpty { "JUAN" }
                                val randomNum = (1000..9999).random()
                                userFriendToken = "R07-$prefix-$randomNum"
                            },
                            onCopyToken = {
                                clipboardManager.setText(AnnotatedString(userFriendToken))
                            },
                            onNext = {
                                if (userName.isBlank()) userName = "Juan Santiago"
                                currentStep = OnboardingStep.ACCOUNT_TYPE
                            },
                            activeColors = activeColors
                        )
                    }

                    OnboardingStep.ACCOUNT_TYPE -> {
                        AccountTypeSelectionContent(
                            selectedType = selectedAccountType,
                            onSelectType = { selectedAccountType = it },
                            onNext = {
                                currentStep = OnboardingStep.COMMUNITY_SETUP
                            },
                            activeColors = activeColors
                        )
                    }

                    OnboardingStep.COMMUNITY_SETUP -> {
                        CommunityAndStyleContent(
                            accountType = selectedAccountType,
                            isCreatingCommunity = isCreatingCommunity,
                            onToggleCreatingCommunity = { isCreatingCommunity = it },
                            groupName = groupName,
                            onGroupNameChange = { groupName = it },
                            churchName = churchName,
                            onChurchNameChange = { churchName = it },
                            communityToken = communityToken,
                            onCommunityTokenChange = { communityToken = it },
                            onRegenerateCommunityToken = {
                                val prefix = groupName.trim().filter { c -> c.isLetter() }.uppercase().take(4).ifEmpty { "VIDA" }
                                val randomNum = (1000..9999).random()
                                communityToken = "COM-$prefix-$randomNum"
                            },
                            friendTokenToConnect = friendTokenToConnect,
                            onFriendTokenChange = { friendTokenToConnect = it },
                            selectedEdition = selectedEdition,
                            onSelectEdition = { edition ->
                                selectedEdition = edition
                                userAvatar = if (edition == AppEdition.MEN) "⚔️" else "🌸"
                                selectedPalette = if (edition == AppEdition.MEN) AppColorPalette.MEN_BLUE else AppColorPalette.WOMEN_PINK
                            },
                            selectedPalette = selectedPalette,
                            onSelectPalette = { selectedPalette = it },
                            onFinish = {
                                onCompleteOnboarding(
                                    selectedEdition,
                                    selectedPalette,
                                    selectedAccountType,
                                    userName.ifBlank { "Juan Santiago" },
                                    userAge,
                                    userAvatar,
                                    userEmail,
                                    groupName,
                                    churchName,
                                    userFriendToken,
                                    friendTokenToConnect,
                                    "",
                                    "",
                                    ""
                                )
                            },
                            activeColors = activeColors
                        )
                    }
                }
            }
        }
    }

    // GOOGLE ACCOUNT PICKER DIALOG
    if (showGoogleAccountPicker) {
        Dialog(onDismissRequest = { showGoogleAccountPicker = false }) {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .border(1.dp, Color(0xFFE2DCD5), RoundedCornerShape(24.dp))
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFE8F0FE)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "G", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color(0xFF4285F4))
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Acceder con Google",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF202124)
                    )
                    Text(
                        text = "Selecciona tu cuenta de Google para sincronizar tu agenda devocional R07.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF5F6368),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp, bottom = 18.dp)
                    )

                    // Pre-detected Account (e.g. Santiago)
                    Card(
                        onClick = {
                            authProvider = "GOOGLE"
                            userEmail = "juansantiagogonzalezmarin@gmail.com"
                            userName = "Juan Santiago González Marín"
                            userAvatar = "🌸"
                            userFriendToken = "R07-JUAN-${(1000..9999).random()}"
                            showGoogleAccountPicker = false
                            onGoogleSignIn()
                            currentStep = OnboardingStep.PROFILE_SETUP
                        },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8F9FA)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFDADCE0)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF1A73E8)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "J", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                            }
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Juan Santiago González Marín",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = Color(0xFF202124)
                                )
                                Text(
                                    text = "juansantiagogonzalezmarin@gmail.com",
                                    fontSize = 12.sp,
                                    color = Color(0xFF5F6368)
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF1A73E8),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Another Account Option
                    OutlinedButton(
                        onClick = {
                            authProvider = "GOOGLE"
                            userEmail = "usuario.devocional@gmail.com"
                            userName = "Hermano/a en Cristo"
                            userAvatar = "✨"
                            userFriendToken = "R07-FE-${(1000..9999).random()}"
                            showGoogleAccountPicker = false
                            onGoogleSignIn()
                            currentStep = OnboardingStep.PROFILE_SETUP
                        },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(imageVector = Icons.Default.PersonAdd, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Usar otra cuenta de Google", fontSize = 13.sp)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "🔒 Autenticación 100% segura. Tus datos se resguardan conforme a las políticas de privacidad.",
                        style = MaterialTheme.typography.labelSmall,
                        fontSize = 10.sp,
                        color = Color(0xFF70757A),
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }

    // APPLE / ICLOUD DIALOG
    if (showAppleAccountPicker) {
        Dialog(onDismissRequest = { showAppleAccountPicker = false }) {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .border(1.dp, Color(0xFFE2DCD5), RoundedCornerShape(24.dp))
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(Color.Black),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "", fontSize = 28.sp, color = Color.White)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Continuar con Apple / iCloud",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1D1D1F)
                    )
                    Text(
                        text = "Ingresa con tu Apple ID o cuenta de iCloud para proteger tu tiempo devocional.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF6E6E73),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp, bottom = 18.dp)
                    )

                    Button(
                        onClick = {
                            authProvider = "ICLOUD"
                            userEmail = "usuario.icloud@icloud.com"
                            userName = "Santiago González"
                            userAvatar = "🕊️"
                            userFriendToken = "R07-APPLE-${(1000..9999).random()}"
                            showAppleAccountPicker = false
                            onAppleSignIn()
                            currentStep = OnboardingStep.PROFILE_SETUP
                        },
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Black, contentColor = Color.White),
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Text("Iniciar con Apple ID (iCloud)", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    // EMAIL AUTH DIALOG
    if (showEmailAuthDialog) {
        var emailInput by remember { mutableStateOf("") }
        var nameInput by remember { mutableStateOf("") }

        Dialog(onDismissRequest = { showEmailAuthDialog = false }) {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .border(1.dp, Color(0xFFE2DCD5), RoundedCornerShape(24.dp))
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Email,
                        contentDescription = null,
                        tint = activeColors.primary,
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "Registro por Correo",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = activeColors.textPrimary
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = nameInput,
                        onValueChange = { nameInput = it },
                        label = { Text("Tu Nombre Completo") },
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = emailInput,
                        onValueChange = { emailInput = it },
                        label = { Text("Correo Electrónico") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    Button(
                        onClick = {
                            authProvider = "EMAIL"
                            userEmail = emailInput.ifBlank { "miembro@r07agenda.org" }
                            userName = nameInput.ifBlank { "Miembro R07" }
                            userAvatar = "✨"
                            val prefix = nameInput.trim().filter { c -> c.isLetter() }.uppercase().take(5).ifEmpty { "FE" }
                            userFriendToken = "R07-$prefix-${(1000..9999).random()}"
                            onEmailSignIn(userEmail, "dummy_pass")
                            showEmailAuthDialog = false
                            currentStep = OnboardingStep.PROFILE_SETUP
                        },
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = activeColors.primary),
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Text("Continuar Registro", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// -----------------------------------------------------------------------------------------
// STEP 1: AUTH GATE (Obligatorio)
// -----------------------------------------------------------------------------------------
@Composable
private fun AuthGateContent(
    onSelectGoogle: () -> Unit,
    onSelectApple: () -> Unit,
    onSelectEmail: () -> Unit,
    activeColors: R07EditionColors
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // EMBLEM BADGE
        Surface(
            shape = RoundedCornerShape(26.dp),
            color = activeColors.surface,
            border = androidx.compose.foundation.BorderStroke(1.5.dp, activeColors.borderStrong.copy(alpha = 0.5f)),
            shadowElevation = 6.dp,
            modifier = Modifier.padding(bottom = 16.dp)
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                R07AppLogo(
                    size = 72.dp
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "AGENDA DEVOCIONAL R07",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Black,
                    color = activeColors.primary,
                    letterSpacing = 1.sp
                )

                Text(
                    text = "«Pasa tiempo Conmigo» • 7 Días",
                    style = MaterialTheme.typography.bodyMedium,
                    fontStyle = FontStyle.Italic,
                    fontWeight = FontWeight.Medium,
                    color = activeColors.textSecondary
                )
            }
        }

        Text(
            text = "Bienvenido a tu Espacio Devocional",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.ExtraBold,
            color = activeColors.textPrimary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Para comenzar y sincronizar tus metas, notas devocionales y comunidad, ingresa con tu cuenta:",
            style = MaterialTheme.typography.bodyMedium,
            color = activeColors.textSecondary,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 10.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        // GOOGLE SIGN IN BUTTON
        Card(
            onClick = onSelectGoogle,
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF4285F4).copy(alpha = 0.4f)),
            elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("auth_google_button")
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFE8F0FE)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "G", fontSize = 22.sp, fontWeight = FontWeight.Black, color = Color(0xFF4285F4))
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Continuar con Google",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color(0xFF202124)
                    )
                    Text(
                        text = "Acceso rápido y seguro con tu cuenta de Google",
                        fontSize = 11.5.sp,
                        color = Color(0xFF5F6368)
                    )
                }
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = Color(0xFF4285F4),
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // APPLE / ICLOUD BUTTON
        Card(
            onClick = onSelectApple,
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, Color.Black.copy(alpha = 0.3f)),
            elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("auth_apple_button")
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 18.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(Color.Black),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "", fontSize = 20.sp, color = Color.White)
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Continuar con Apple / iCloud",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = Color(0xFF1D1D1F)
                    )
                    Text(
                        text = "Inicia con tu ID de Apple o iCloud",
                        fontSize = 11.5.sp,
                        color = Color(0xFF6E6E73)
                    )
                }
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = Color.Black,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // EMAIL ALTERNATIVE
        OutlinedButton(
            onClick = onSelectEmail,
            shape = RoundedCornerShape(18.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, activeColors.borderStrong),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("auth_email_button")
        ) {
            Icon(
                imageVector = Icons.Default.Email,
                contentDescription = null,
                tint = activeColors.textSecondary,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Ingresar con Correo Electrónico",
                fontWeight = FontWeight.SemiBold,
                color = activeColors.textPrimary,
                fontSize = 14.sp
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // TRUST FOOTER
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Security,
                contentDescription = null,
                tint = activeColors.primary,
                modifier = Modifier.size(16.dp)
            )
            Text(
                text = "Tus reflexiones y oraciones privadas se guardan de forma segura.",
                style = MaterialTheme.typography.labelSmall,
                fontSize = 11.sp,
                color = activeColors.textSecondary
            )
        }
    }
}

// -----------------------------------------------------------------------------------------
// STEP 2: PROFILE SETUP & UNIQUE TOKEN
// -----------------------------------------------------------------------------------------
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ProfileSetupContent(
    authProvider: String,
    userEmail: String,
    userName: String,
    onNameChange: (String) -> Unit,
    userAge: String,
    onAgeChange: (String) -> Unit,
    userAvatar: String,
    onAvatarChange: (String) -> Unit,
    userBio: String,
    onBioChange: (String) -> Unit,
    userFriendToken: String,
    onRegenerateToken: () -> Unit,
    onCopyToken: () -> Unit,
    onNext: () -> Unit,
    activeColors: R07EditionColors
) {
    var copiedRecently by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Connected Account Banner
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color(0xFFE6F4EA),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF34A853).copy(alpha = 0.4f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = Color(0xFF137333),
                    modifier = Modifier.size(20.dp)
                )
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Cuenta Vinculada con Éxito",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = Color(0xFF137333)
                    )
                    Text(
                        text = "$authProvider • $userEmail",
                        fontSize = 11.sp,
                        color = Color(0xFF3C4043)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Configura tu Perfil & Foto",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.ExtraBold,
            color = activeColors.textPrimary
        )

        Text(
            text = "Personaliza cómo te verán tus amigos y hermanos de grupo.",
            style = MaterialTheme.typography.bodySmall,
            color = activeColors.textSecondary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(18.dp))

        // Selected Avatar Large Preview
        Box(
            modifier = Modifier
                .size(76.dp)
                .clip(CircleShape)
                .background(activeColors.primary.copy(alpha = 0.15f))
                .border(2.5.dp, activeColors.primary, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(text = userAvatar, fontSize = 38.sp)
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = "Elige tu avatar o foto de perfil:",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = activeColors.textSecondary
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Avatar selector grid
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            maxItemsInEachRow = 6
        ) {
            EXTENDED_AVATARS.forEach { emoji ->
                val isSelected = userAvatar == emoji
                Box(
                    modifier = Modifier
                        .padding(4.dp)
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(if (isSelected) activeColors.primary else activeColors.surface)
                        .border(
                            width = if (isSelected) 2.dp else 1.dp,
                            color = if (isSelected) activeColors.primary else activeColors.borderStrong,
                            shape = CircleShape
                        )
                        .clickable { onAvatarChange(emoji) },
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = emoji, fontSize = 22.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Name & Age fields
        OutlinedTextField(
            value = userName,
            onValueChange = onNameChange,
            label = { Text("Nombre Completo *") },
            placeholder = { Text("Ej: Juan Santiago González") },
            singleLine = true,
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = activeColors.primary,
                unfocusedBorderColor = activeColors.borderStrong
            ),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("onboarding_name_input")
        )

        Spacer(modifier = Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(
                value = userAge,
                onValueChange = onAgeChange,
                label = { Text("Edad (opcional)") },
                placeholder = { Text("Ej: 26") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.weight(0.4f)
            )

            OutlinedTextField(
                value = userBio,
                onValueChange = onBioChange,
                label = { Text("Lema o Versículo Favorito") },
                placeholder = { Text("Caminando en gracia...") },
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier.weight(0.6f)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // UNIQUE FRIEND TOKEN CARD
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = activeColors.surface),
            border = androidx.compose.foundation.BorderStroke(1.5.dp, activeColors.primary.copy(alpha = 0.5f)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Key,
                            contentDescription = null,
                            tint = activeColors.primary,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "TU TOKEN ÚNICO DE AMIGO",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black,
                            color = activeColors.primary,
                            letterSpacing = 0.8.sp
                        )
                    }

                    IconButton(
                        onClick = onRegenerateToken,
                        modifier = Modifier.size(30.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Regenerar Token",
                            tint = activeColors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = activeColors.background,
                    border = androidx.compose.foundation.BorderStroke(1.dp, activeColors.borderStrong),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = userFriendToken,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                            fontWeight = FontWeight.Black,
                            fontSize = 17.sp,
                            color = activeColors.textPrimary,
                            letterSpacing = 1.sp
                        )

                        Button(
                            onClick = {
                                onCopyToken()
                                copiedRecently = true
                            },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (copiedRecently) Color(0xFF34A853) else activeColors.primary
                            ),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Icon(
                                imageVector = if (copiedRecently) Icons.Default.Check else Icons.Default.ContentCopy,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (copiedRecently) "¡Copiado!" else "Copiar",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "💡 Tus amigos y hermanos del grupo usarán este token para conectarse contigo, compartir peticiones y animarse en su racha de oración.",
                    style = MaterialTheme.typography.bodySmall,
                    fontSize = 11.5.sp,
                    color = activeColors.textSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = onNext,
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = activeColors.primary),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("profile_next_button")
        ) {
            Text("Continuar a Enfoque de Cuenta", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Spacer(modifier = Modifier.width(8.dp))
            Icon(imageVector = Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null)
        }
    }
}

// -----------------------------------------------------------------------------------------
// STEP 3: ACCOUNT TYPE (Personal vs Grupo de Iglesia)
// -----------------------------------------------------------------------------------------
@Composable
private fun AccountTypeSelectionContent(
    selectedType: UserAccountType,
    onSelectType: (UserAccountType) -> Unit,
    onNext: () -> Unit,
    activeColors: R07EditionColors
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "¿Cómo usarás tu Agenda R07?",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.ExtraBold,
            color = activeColors.textPrimary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Elige tu modalidad principal. Podrás conectar amigos y comunidad en ambas opciones.",
            style = MaterialTheme.typography.bodySmall,
            color = activeColors.textSecondary,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 12.dp)
        )

        Spacer(modifier = Modifier.height(20.dp))

        // OPTION 1: PERSONAL / INDIVIDUAL
        val isPersonal = selectedType == UserAccountType.INDIVIDUAL
        Card(
            onClick = { onSelectType(UserAccountType.INDIVIDUAL) },
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (isPersonal) activeColors.surface else Color.White
            ),
            border = androidx.compose.foundation.BorderStroke(
                width = if (isPersonal) 2.dp else 1.dp,
                color = if (isPersonal) activeColors.primary else activeColors.borderStrong
            ),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("account_type_personal")
        ) {
            Column(
                modifier = Modifier.padding(18.dp)
            ) {
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
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(if (isPersonal) activeColors.primary else Color(0xFFEDE7F6)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "🌿", fontSize = 22.sp)
                        }
                        Column {
                            Text(
                                text = "Personal / Crecimiento Individual",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = if (isPersonal) activeColors.primary else activeColors.textPrimary
                            )
                            Text(
                                text = "Tiempo a solas con Dios",
                                fontSize = 11.5.sp,
                                color = activeColors.textSecondary
                            )
                        }
                    }

                    Icon(
                        imageVector = if (isPersonal) Icons.Default.CheckCircle else Icons.Default.Check,
                        contentDescription = null,
                        tint = if (isPersonal) activeColors.primary else Color.LightGray,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "• Enfoque en tus 7 días de devocional, metas personales de lectura bíblica y diario de oración.",
                    style = MaterialTheme.typography.bodySmall,
                    color = activeColors.textSecondary,
                    fontSize = 12.sp
                )
                Text(
                    text = "• Podrás conectar amigos usando sus Tokens Únicos para orar juntos.",
                    style = MaterialTheme.typography.bodySmall,
                    color = activeColors.textSecondary,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // OPTION 2: GRUPO DE CONEXIÓN / IGLESIA
        val isGroup = selectedType == UserAccountType.CONNECTION_GROUP
        Card(
            onClick = { onSelectType(UserAccountType.CONNECTION_GROUP) },
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (isGroup) activeColors.surface else Color.White
            ),
            border = androidx.compose.foundation.BorderStroke(
                width = if (isGroup) 2.dp else 1.dp,
                color = if (isGroup) activeColors.primary else activeColors.borderStrong
            ),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("account_type_group")
        ) {
            Column(
                modifier = Modifier.padding(18.dp)
            ) {
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
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(if (isGroup) activeColors.primary else Color(0xFFE8F5E9)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "⛪", fontSize = 22.sp)
                        }
                        Column {
                            Text(
                                text = "Grupo de Conexión & Iglesia",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = if (isGroup) activeColors.primary else activeColors.textPrimary
                            )
                            Text(
                                text = "Células, Jóvenes & Congregación",
                                fontSize = 11.5.sp,
                                color = activeColors.textSecondary
                            )
                        }
                    }

                    Icon(
                        imageVector = if (isGroup) Icons.Default.CheckCircle else Icons.Default.Check,
                        contentDescription = null,
                        tint = if (isGroup) activeColors.primary else Color.LightGray,
                        modifier = Modifier.size(24.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "• Incluye registro de asistencia a reunión de grupo, 2 días de oración comunitaria y servicio dominical.",
                    style = MaterialTheme.typography.bodySmall,
                    color = activeColors.textSecondary,
                    fontSize = 12.sp
                )
                Text(
                    text = "• Permite crear o unirte a una Comunidad con Token de Grupo y enviar reporte al líder.",
                    style = MaterialTheme.typography.bodySmall,
                    color = activeColors.textSecondary,
                    fontSize = 12.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        Button(
            onClick = onNext,
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = activeColors.primary),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .testTag("account_type_next_button")
        ) {
            Text("Continuar a Comunidad & Estilo", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Spacer(modifier = Modifier.width(8.dp))
            Icon(imageVector = Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null)
        }
    }
}

// -----------------------------------------------------------------------------------------
// STEP 4: COMMUNITY & STYLE
// -----------------------------------------------------------------------------------------
@Composable
private fun CommunityAndStyleContent(
    accountType: UserAccountType,
    isCreatingCommunity: Boolean,
    onToggleCreatingCommunity: (Boolean) -> Unit,
    groupName: String,
    onGroupNameChange: (String) -> Unit,
    churchName: String,
    onChurchNameChange: (String) -> Unit,
    communityToken: String,
    onCommunityTokenChange: (String) -> Unit,
    onRegenerateCommunityToken: () -> Unit,
    friendTokenToConnect: String,
    onFriendTokenChange: (String) -> Unit,
    selectedEdition: AppEdition,
    onSelectEdition: (AppEdition) -> Unit,
    selectedPalette: AppColorPalette,
    onSelectPalette: (AppColorPalette) -> Unit,
    onFinish: () -> Unit,
    activeColors: R07EditionColors
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Comunidad & Edición R07",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.ExtraBold,
            color = activeColors.textPrimary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Último paso: conecta tu comunidad y elige el estilo visual de tu devocional.",
            style = MaterialTheme.typography.bodySmall,
            color = activeColors.textSecondary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        // SECTION: COMMUNITY OR FRIENDS
        if (accountType == UserAccountType.CONNECTION_GROUP) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = activeColors.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, activeColors.borderStrong),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "GRUPO DE CONEXIÓN / IGLESIA",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black,
                            color = activeColors.primary,
                            letterSpacing = 0.8.sp
                        )

                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            FilterChip(
                                selected = isCreatingCommunity,
                                onClick = { onToggleCreatingCommunity(true) },
                                label = { Text("Crear Grupo", fontSize = 11.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = activeColors.primary,
                                    selectedLabelColor = Color.White
                                )
                            )
                            FilterChip(
                                selected = !isCreatingCommunity,
                                onClick = { onToggleCreatingCommunity(false) },
                                label = { Text("Unirme con Token", fontSize = 11.sp) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = activeColors.primary,
                                    selectedLabelColor = Color.White
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    if (isCreatingCommunity) {
                        OutlinedTextField(
                            value = groupName,
                            onValueChange = onGroupNameChange,
                            label = { Text("Nombre del Grupo / Célula") },
                            placeholder = { Text("Ej: Célula Jóvenes de Gracia") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = churchName,
                            onValueChange = onChurchNameChange,
                            label = { Text("Nombre de la Iglesia / Congregación") },
                            placeholder = { Text("Ej: Iglesia Central de Fe") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Token de Grupo: $communityToken",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = activeColors.primary
                            )
                            IconButton(onClick = onRegenerateCommunityToken, modifier = Modifier.size(28.dp)) {
                                Icon(imageVector = Icons.Default.Refresh, contentDescription = null, tint = activeColors.primary, modifier = Modifier.size(16.dp))
                            }
                        }
                    } else {
                        OutlinedTextField(
                            value = communityToken,
                            onValueChange = onCommunityTokenChange,
                            label = { Text("Ingresa el Token de Grupo (ej. COM-VIDA-9921)") },
                            placeholder = { Text("COM-XXXX-XXXX") },
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        } else {
            // PERSONAL FRIEND TOKEN INPUT
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = activeColors.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, activeColors.borderStrong),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "¿TIENES EL TOKEN DE UN AMIGO? (Opcional)",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = activeColors.primary,
                        letterSpacing = 0.8.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Ingresa el token único de un amigo o hermano para conectarse de inmediato:",
                        style = MaterialTheme.typography.bodySmall,
                        color = activeColors.textSecondary,
                        fontSize = 11.5.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = friendTokenToConnect,
                        onValueChange = onFriendTokenChange,
                        placeholder = { Text("Ej: R07-MARIA-7201") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // SECTION: EDICIÓN (Mujeres 🌸 vs Hombres ⚔️)
        Text(
            text = "SELECCIONA TU EDICIÓN DEVOCIONAL",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = activeColors.textSecondary,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            AppEdition.entries.forEach { edition ->
                val isSelected = selectedEdition == edition
                Card(
                    onClick = { onSelectEdition(edition) },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) activeColors.primary.copy(alpha = 0.15f) else Color.White
                    ),
                    border = androidx.compose.foundation.BorderStroke(
                        width = if (isSelected) 2.dp else 1.dp,
                        color = if (isSelected) activeColors.primary else activeColors.borderStrong
                    ),
                    modifier = Modifier
                        .weight(1f)
                        .testTag("edition_option_${edition.name.lowercase()}")
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = edition.icon, fontSize = 28.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = edition.displayName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = activeColors.textPrimary
                        )
                        Text(
                            text = if (edition == AppEdition.WOMEN) "Tonos Rosas & Flores" else "Tonos Azules & Fuerza",
                            fontSize = 10.sp,
                            color = activeColors.textSecondary,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // COLOR PALETTES
        Text(
            text = "PALETA DE COLOR",
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Black,
            color = activeColors.textSecondary,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            AppColorPalette.entries.take(4).forEach { pal ->
                val isPalSelected = selectedPalette == pal
                FilterChip(
                    selected = isPalSelected,
                    onClick = { onSelectPalette(pal) },
                    label = {
                        Text(text = "${pal.icon} ${pal.displayName}", fontSize = 11.sp, fontWeight = if (isPalSelected) FontWeight.Bold else FontWeight.Normal)
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = activeColors.primary,
                        selectedLabelColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // FINAL COMPLETE BUTTON
        Button(
            onClick = onFinish,
            shape = RoundedCornerShape(18.dp),
            colors = ButtonDefaults.buttonColors(containerColor = activeColors.primary),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .testTag("complete_onboarding_final_button")
        ) {
            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null)
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "¡Completar Registro y Entrar a R07! ✨",
                fontWeight = FontWeight.Black,
                fontSize = 15.sp
            )
        }
    }
}
