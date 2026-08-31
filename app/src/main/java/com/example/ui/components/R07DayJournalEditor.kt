package com.example.ui.components

import android.net.Uri
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.SizeTransform
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Mood
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material.icons.outlined.CheckCircleOutline
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.DevotionalBlock
import com.example.data.model.DevotionalBlockType
import com.example.data.model.R07DayEntryEntity
import com.example.data.model.R07Mood
import com.example.ui.theme.R07Theme
import org.json.JSONArray

enum class DevotionalStep(val stepNumber: Int, val title: String, val subtitle: String, val iconEmoji: String) {
    ENCOUNTER(1, "Encuentro & Lectura", "Hora, cita bíblica y estado del corazón", "📖"),
    VOICE_OF_GOD(2, "Voz de Dios", "Lo que Dios te habló y reflexión personal", "🕊️"),
    COMMITMENT_PRAYER(3, "Compromiso & Oración", "Aplicación práctica y clamor a Dios", "🙏"),
    EVIDENCE_SUMMARY(4, "Cuaderno & Resumen", "Fotos manuscritas y confirmación", "✨")
}

@Composable
fun R07DayJournalEditor(
    day: R07DayEntryEntity,
    availableMoods: List<R07Mood>,
    onDayUpdated: (R07DayEntryEntity) -> Unit,
    onScanPhotoClicked: () -> Unit,
    onOpenBibleSelector: () -> Unit,
    onAiInspirationClicked: () -> Unit = {},
    onOpenPrayerGuidanceClicked: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors

    var timeInput by remember(day.id, day.timeText) { mutableStateOf(day.timeText) }
    var scriptureInput by remember(day.id, day.scriptureRef) { mutableStateOf(day.scriptureRef) }
    var selectedMood by remember(day.id, day.mood) { mutableStateOf(day.mood) }
    var selectedMoodEmoji by remember(day.id, day.moodEmoji) { mutableStateOf(day.moodEmoji) }
    var isCompleted by remember(day.id, day.isCompleted) { mutableStateOf(day.isCompleted) }

    // Current Step index (0 to 3)
    var currentStepIndex by remember(day.id) { mutableIntStateOf(0) }
    var isSteppedMode by remember { mutableStateOf(true) }

    // Parse devotional blocks
    var blocks by remember(day.id, day.blocksJson, day.reflectionText) {
        mutableStateOf(DevotionalBlock.parseBlocksFromJson(day.blocksJson, day.reflectionText))
    }

    var showAddBlockMenu by remember { mutableStateOf(false) }

    // Parse attached physical photo URIs
    val photoUris = remember(day.photoUrisJson) {
        if (day.photoUrisJson.isBlank()) emptyList()
        else {
            try {
                val arr = JSONArray(day.photoUrisJson)
                val list = mutableListOf<String>()
                for (i in 0 until arr.length()) list.add(arr.getString(i))
                list
            } catch (e: Exception) {
                emptyList()
            }
        }
    }

    fun syncAndSave(updatedBlocks: List<DevotionalBlock>, newCompleted: Boolean = isCompleted) {
        blocks = updatedBlocks
        val blocksJson = DevotionalBlock.serializeBlocksToJson(updatedBlocks)
        val plainReflection = DevotionalBlock.formatBlocksToPlainText(updatedBlocks)
        onDayUpdated(
            day.copy(
                timeText = timeInput,
                scriptureRef = scriptureInput,
                mood = selectedMood,
                moodEmoji = selectedMoodEmoji,
                reflectionText = plainReflection,
                blocksJson = blocksJson,
                isCompleted = newCompleted
            )
        )
    }

    val animatedProgress by animateFloatAsState(
        targetValue = (currentStepIndex + 1) / 4f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioLowBouncy, stiffness = Spring.StiffnessMedium),
        label = "stepProgress"
    )

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(26.dp))
            .testTag("day_journal_card_${day.dayNumber}"),
        shape = RoundedCornerShape(26.dp),
        color = colors.surface,
        shadowElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(18.dp)) {

            // Top Header: Day title + Mode Toggle + Complete Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "DÍA ${day.dayNumber} • ${day.dayName.uppercase()}",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Black,
                        color = colors.primary,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = if (day.dateText.isNotBlank()) day.dateText else "Devocional Personal",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = colors.textPrimary
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Mode Toggle: Stepped vs Full
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = colors.primaryContainer.copy(alpha = 0.6f),
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { isSteppedMode = !isSteppedMode }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = if (isSteppedMode) Icons.Default.ViewAgenda else Icons.Default.EditNote,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(13.dp)
                            )
                            Text(
                                text = if (isSteppedMode) "Pasos" else "Todo",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.primary,
                                fontSize = 11.sp
                            )
                        }
                    }

                    // Completion Status Badge
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isCompleted) colors.accentSuccessBg else colors.background,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .border(
                                1.dp,
                                if (isCompleted) colors.accentSuccess else colors.border.copy(alpha = 0.5f),
                                RoundedCornerShape(12.dp)
                            )
                            .clickable {
                                isCompleted = !isCompleted
                                syncAndSave(blocks, isCompleted)
                            }
                            .testTag("toggle_day_complete_${day.dayNumber}")
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = if (isCompleted) Icons.Default.CheckCircle else Icons.Outlined.CheckCircleOutline,
                                contentDescription = null,
                                tint = if (isCompleted) colors.accentSuccess else colors.textMuted,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = if (isCompleted) "Listo ✓" else "Pendiente",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                color = if (isCompleted) colors.accentSuccess else colors.textSecondary
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            if (isSteppedMode) {
                // STEPPED WIZARD MODE
                val currentStep = DevotionalStep.entries[currentStepIndex]

                // Step Progress Indicator
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(text = currentStep.iconEmoji, fontSize = 15.sp)
                            Text(
                                text = "Paso ${currentStep.stepNumber} de 4: ${currentStep.title}",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                        }
                        Text(
                            text = "${(animatedProgress * 100).toInt()}%",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary,
                            fontSize = 11.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    LinearProgressIndicator(
                        progress = { animatedProgress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp)
                            .clip(RoundedCornerShape(2.dp)),
                        color = colors.primary,
                        trackColor = colors.primaryContainer.copy(alpha = 0.5f),
                        strokeCap = StrokeCap.Round
                    )

                    // Step Pills for quick tapping
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        DevotionalStep.entries.forEachIndexed { idx, step ->
                            val isCurrent = idx == currentStepIndex
                            val isDone = idx < currentStepIndex
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { currentStepIndex = idx },
                                color = if (isCurrent) colors.primary else if (isDone) colors.primaryContainer else colors.background.copy(alpha = 0.6f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier.padding(vertical = 4.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "${step.iconEmoji} P${step.stepNumber}",
                                        fontSize = 10.sp,
                                        fontWeight = if (isCurrent) FontWeight.Black else FontWeight.Bold,
                                        color = if (isCurrent) Color.White else if (isDone) colors.primary else colors.textMuted
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Animated step content with slide & fade
                AnimatedContent(
                    targetState = currentStepIndex,
                    transitionSpec = {
                        if (targetState > initialState) {
                            (slideInHorizontally { width -> width } + fadeIn()).togetherWith(
                                slideOutHorizontally { width -> -width } + fadeOut()
                            )
                        } else {
                            (slideInHorizontally { width -> -width } + fadeIn()).togetherWith(
                                slideOutHorizontally { width -> width } + fadeOut()
                            )
                        }.using(SizeTransform(clip = false))
                    },
                    label = "stepContentAnimation"
                ) { stepIdx ->
                    when (DevotionalStep.entries[stepIdx]) {
                        // PASO 1: ENCUENTRO Y LECTURA
                        DevotionalStep.ENCOUNTER -> {
                            StepOneEncounterContent(
                                timeInput = timeInput,
                                onTimeChanged = {
                                    timeInput = it
                                    onDayUpdated(day.copy(timeText = it))
                                },
                                scriptureInput = scriptureInput,
                                onScriptureChanged = {
                                    scriptureInput = it
                                    onDayUpdated(day.copy(scriptureRef = it))
                                },
                                selectedMood = selectedMood,
                                selectedMoodEmoji = selectedMoodEmoji,
                                availableMoods = availableMoods,
                                onMoodSelected = { moodName, emoji ->
                                    selectedMood = moodName
                                    selectedMoodEmoji = emoji
                                    onDayUpdated(day.copy(mood = moodName, moodEmoji = emoji))
                                },
                                onOpenBible = onOpenBibleSelector
                            )
                        }

                        // PASO 2: VOZ DE DIOS (REFLEXION)
                        DevotionalStep.VOICE_OF_GOD -> {
                            StepTwoVoiceOfGodContent(
                                blocks = blocks,
                                onBlocksUpdated = { updated ->
                                    syncAndSave(updated)
                                },
                                onAiInspiration = onAiInspirationClicked
                            )
                        }

                        // PASO 3: COMPROMISO Y ORACION
                        DevotionalStep.COMMITMENT_PRAYER -> {
                            StepThreeCommitmentContent(
                                blocks = blocks,
                                onBlocksUpdated = { updated ->
                                    syncAndSave(updated)
                                },
                                onOpenPrayerGuidance = onOpenPrayerGuidanceClicked,
                                showAddBlockMenu = showAddBlockMenu,
                                onToggleAddBlockMenu = { showAddBlockMenu = it }
                            )
                        }

                        // PASO 4: EVIDENCIA & RESUMEN
                        DevotionalStep.EVIDENCE_SUMMARY -> {
                            StepFourEvidenceSummaryContent(
                                day = day,
                                photoUris = photoUris,
                                scriptureText = scriptureInput,
                                timeText = timeInput,
                                moodText = "$selectedMoodEmoji $selectedMood",
                                isCompleted = isCompleted,
                                onToggleComplete = {
                                    isCompleted = !isCompleted
                                    syncAndSave(blocks, isCompleted)
                                },
                                onScanClicked = onScanPhotoClicked
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Bottom Navigation controls: [← Anterior] and [Siguiente →]
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (currentStepIndex > 0) {
                        OutlinedButton(
                            onClick = { currentStepIndex-- },
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.height(42.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = colors.textPrimary
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Anterior", color = colors.textPrimary, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        }
                    } else {
                        Spacer(modifier = Modifier.width(1.dp))
                    }

                    if (currentStepIndex < 3) {
                        Button(
                            onClick = { currentStepIndex++ },
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            modifier = Modifier.height(42.dp)
                        ) {
                            Text("Siguiente", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = Color.White
                            )
                        }
                    } else {
                        Button(
                            onClick = {
                                isCompleted = true
                                syncAndSave(blocks, newCompleted = true)
                            },
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            modifier = Modifier
                                .height(42.dp)
                                .testTag("save_journal_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = Color.White
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Completar Día ✨", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }
            } else {
                // ALL-IN-ONE COMPACT MINIMALIST MODE
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    StepOneEncounterContent(
                        timeInput = timeInput,
                        onTimeChanged = {
                            timeInput = it
                            onDayUpdated(day.copy(timeText = it))
                        },
                        scriptureInput = scriptureInput,
                        onScriptureChanged = {
                            scriptureInput = it
                            onDayUpdated(day.copy(scriptureRef = it))
                        },
                        selectedMood = selectedMood,
                        selectedMoodEmoji = selectedMoodEmoji,
                        availableMoods = availableMoods,
                        onMoodSelected = { moodName, emoji ->
                            selectedMood = moodName
                            selectedMoodEmoji = emoji
                            onDayUpdated(day.copy(mood = moodName, moodEmoji = emoji))
                        },
                        onOpenBible = onOpenBibleSelector
                    )

                    StepTwoVoiceOfGodContent(
                        blocks = blocks,
                        onBlocksUpdated = { updated ->
                            syncAndSave(updated)
                        },
                        onAiInspiration = onAiInspirationClicked
                    )

                    StepThreeCommitmentContent(
                        blocks = blocks,
                        onBlocksUpdated = { updated ->
                            syncAndSave(updated)
                        },
                        onOpenPrayerGuidance = onOpenPrayerGuidanceClicked,
                        showAddBlockMenu = showAddBlockMenu,
                        onToggleAddBlockMenu = { showAddBlockMenu = it }
                    )

                    StepFourEvidenceSummaryContent(
                        day = day,
                        photoUris = photoUris,
                        scriptureText = scriptureInput,
                        timeText = timeInput,
                        moodText = "$selectedMoodEmoji $selectedMood",
                        isCompleted = isCompleted,
                        onToggleComplete = {
                            isCompleted = !isCompleted
                            syncAndSave(blocks, isCompleted)
                        },
                        onScanClicked = onScanPhotoClicked
                    )

                    Button(
                        onClick = {
                            isCompleted = true
                            syncAndSave(blocks, newCompleted = true)
                        },
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .testTag("save_journal_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Guardar Día Devocional", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------------------------------------------
// STEP SUBCOMPONENTS (Clean, Minimalist, Elegant)
// -------------------------------------------------------------------------------------------------

@Composable
private fun StepOneEncounterContent(
    timeInput: String,
    onTimeChanged: (String) -> Unit,
    scriptureInput: String,
    onScriptureChanged: (String) -> Unit,
    selectedMood: String,
    selectedMoodEmoji: String,
    availableMoods: List<R07Mood>,
    onMoodSelected: (String, String) -> Unit,
    onOpenBible: () -> Unit
) {
    val colors = R07Theme.colors

    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        // PROMINENT BIBLE VERSE SELECTOR HERO CARD (First item in devotional flow)
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .border(1.5.dp, colors.primary.copy(alpha = 0.7f), RoundedCornerShape(18.dp))
                .clickable { onOpenBible() }
                .testTag("open_bible_selector_hero_card"),
            shape = RoundedCornerShape(18.dp),
            color = colors.primaryContainer.copy(alpha = 0.45f)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(colors.primary),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        Column {
                            Text(
                                text = "PASAJE BÍBLICO DE HOY",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Black,
                                color = colors.primary,
                                fontSize = 11.sp,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = if (scriptureInput.isNotBlank()) scriptureInput else "Toca para explorar y descargar versículo",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary,
                                fontSize = 13.sp
                            )
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = colors.primary
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = if (scriptureInput.isNotBlank()) "Cambiar 📖" else "Explorar 📖",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 11.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Quick Popular Devotional Verses Horizontal Chips
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    val quickVerses = listOf(
                        "Salmo 23:1",
                        "Juan 3:16",
                        "Proverbios 3:5-6",
                        "Mateo 6:33",
                        "Filipenses 4:13",
                        "Romanos 8:28",
                        "Isaías 40:31",
                        "Jeremías 33:3"
                    )
                    quickVerses.forEach { suggestion ->
                        val isSelected = scriptureInput.contains(suggestion, ignoreCase = true)
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (isSelected) colors.primary else colors.surface,
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .border(
                                    1.dp,
                                    if (isSelected) colors.primary else colors.border,
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable { onScriptureChanged(suggestion) }
                        ) {
                            Text(
                                text = suggestion,
                                fontSize = 10.5.sp,
                                color = if (isSelected) Color.White else colors.textPrimary,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }

        // Scripture and Time Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Scripture
            OutlinedTextField(
                value = scriptureInput,
                onValueChange = onScriptureChanged,
                label = { Text("Pasaje Bíblico", fontSize = 12.sp) },
                placeholder = { Text("Ej. Juan 3:16", color = colors.textMuted, fontSize = 12.sp) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.MenuBook,
                        contentDescription = "Lectura",
                        tint = colors.primary,
                        modifier = Modifier.size(16.dp)
                    )
                },
                trailingIcon = {
                    IconButton(
                        onClick = onOpenBible,
                        modifier = Modifier.size(28.dp).testTag("trailing_bible_picker_icon")
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "Buscar cita",
                            tint = colors.primary,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                },
                modifier = Modifier
                    .weight(1.3f)
                    .testTag("scripture_input_field"),
                shape = RoundedCornerShape(14.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = colors.primary,
                    unfocusedBorderColor = colors.border.copy(alpha = 0.5f),
                    focusedContainerColor = colors.surface,
                    unfocusedContainerColor = colors.surface
                )
            )

            // Time
            OutlinedTextField(
                value = timeInput,
                onValueChange = onTimeChanged,
                label = { Text("Hora", fontSize = 12.sp) },
                placeholder = { Text("06:30 AM", color = colors.textMuted, fontSize = 12.sp) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.AccessTime,
                        contentDescription = "Hora",
                        tint = colors.primary,
                        modifier = Modifier.size(16.dp)
                    )
                },
                modifier = Modifier
                    .weight(0.9f)
                    .testTag("time_input_field"),
                shape = RoundedCornerShape(14.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = colors.primary,
                    unfocusedBorderColor = colors.border.copy(alpha = 0.5f),
                    focusedContainerColor = colors.surface,
                    unfocusedContainerColor = colors.surface
                )
            )
        }

        // Mood Selector
        Column {
            Text(
                text = "¿CÓMO LLEGAS AL DEVOCIONAL?",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = colors.textSecondary,
                fontSize = 10.sp,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                availableMoods.forEach { mood ->
                    val isCurrent = selectedMood.equals(mood.name, ignoreCase = true)
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (isCurrent) colors.primary else colors.background,
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { onMoodSelected(mood.name, mood.emoji) }
                            .testTag("mood_chip_${mood.name}")
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 9.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(text = mood.emoji, fontSize = 13.sp)
                            Text(
                                text = mood.name,
                                fontSize = 11.sp,
                                fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Medium,
                                color = if (isCurrent) Color.White else colors.textPrimary
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StepTwoVoiceOfGodContent(
    blocks: List<DevotionalBlock>,
    onBlocksUpdated: (List<DevotionalBlock>) -> Unit,
    onAiInspiration: () -> Unit
) {
    val colors = R07Theme.colors
    val godSpokeBlock = blocks.find { it.type == DevotionalBlockType.GOD_SPOKE }
        ?: DevotionalBlock(type = DevotionalBlockType.GOD_SPOKE)

    val reflectionBlock = blocks.find { it.type == DevotionalBlockType.REFLECTION }
        ?: DevotionalBlock(type = DevotionalBlockType.REFLECTION)

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // AI Inspiration Bar
        Surface(
            shape = RoundedCornerShape(14.dp),
            color = colors.primaryContainer.copy(alpha = 0.4f),
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .clickable { onAiInspiration() }
                .testTag("open_ai_inspiration_button")
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = colors.primary,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "¿Dudas con el pasaje? Pide guía a Gemini IA",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.primary,
                        fontSize = 11.sp
                    )
                }
                Text(
                    text = "Inspiración ✨",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary,
                    fontSize = 11.sp
                )
            }
        }

        // 1. Lo que Dios me habló Block
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            color = colors.surface
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "🕊️", fontSize = 15.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "LO QUE DIOS ME HABLÓ",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary,
                        letterSpacing = 0.5.sp
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                R07AntiPasteTextField(
                    value = godSpokeBlock.text,
                    onValueChange = { newText ->
                        val updated = blocks.toMutableList()
                        val idx = updated.indexOfFirst { it.type == DevotionalBlockType.GOD_SPOKE }
                        if (idx >= 0) updated[idx] = godSpokeBlock.copy(text = newText)
                        else updated.add(godSpokeBlock.copy(text = newText))
                        onBlocksUpdated(updated)
                    },
                    placeholder = "¿Qué principio, mandato o promesa sentiste que Dios te reveló hoy?",
                    minLines = 3,
                    maxLines = 8,
                    modifier = Modifier.testTag("block_text_field_${godSpokeBlock.id}")
                )
            }
        }

        // 2. Mi Reflexión Personal Block
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            color = colors.surface
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "💡", fontSize = 15.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "REFLEXIÓN PERSONAL",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary,
                        letterSpacing = 0.5.sp
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                R07AntiPasteTextField(
                    value = reflectionBlock.text,
                    onValueChange = { newText ->
                        val updated = blocks.toMutableList()
                        val idx = updated.indexOfFirst { it.type == DevotionalBlockType.REFLECTION }
                        if (idx >= 0) updated[idx] = reflectionBlock.copy(text = newText)
                        else updated.add(reflectionBlock.copy(text = newText))
                        onBlocksUpdated(updated)
                    },
                    placeholder = "¿Cómo se relaciona esta verdad con tu vida y situaciones actuales?",
                    minLines = 3,
                    maxLines = 8,
                    modifier = Modifier.testTag("block_text_field_${reflectionBlock.id}")
                )
            }
        }
    }
}

@Composable
private fun StepThreeCommitmentContent(
    blocks: List<DevotionalBlock>,
    onBlocksUpdated: (List<DevotionalBlock>) -> Unit,
    onOpenPrayerGuidance: () -> Unit = {},
    showAddBlockMenu: Boolean,
    onToggleAddBlockMenu: (Boolean) -> Unit
) {
    val colors = R07Theme.colors

    val actionStepBlock = blocks.find { it.type == DevotionalBlockType.ACTION_STEP }
        ?: DevotionalBlock(type = DevotionalBlockType.ACTION_STEP)

    val prayerBlock = blocks.find { it.type == DevotionalBlockType.PRAYER }
        ?: DevotionalBlock(type = DevotionalBlockType.PRAYER)

    val extraBlocks = blocks.filter {
        it.type != DevotionalBlockType.GOD_SPOKE &&
        it.type != DevotionalBlockType.REFLECTION &&
        it.type != DevotionalBlockType.ACTION_STEP &&
        it.type != DevotionalBlockType.PRAYER
    }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // AI PRAYER GUIDANCE HERO CARD
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = colors.primaryContainer.copy(alpha = 0.5f),
            border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary.copy(alpha = 0.35f)),
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .clickable { onOpenPrayerGuidance() }
                .testTag("open_ai_prayer_guidance_card")
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 11.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(colors.primary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(17.dp)
                        )
                    }

                    Column {
                        Text(
                            text = "GUÍA DE ORACIÓN CON IA",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.ExtraBold,
                            color = colors.primary,
                            fontSize = 11.sp,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = "¿No sabes cómo orar hoy? Describe tu sentir y recibe una oración bíblica estructurada.",
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.textPrimary,
                            fontSize = 11.sp,
                            lineHeight = 15.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.width(8.dp))

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = colors.primary
                ) {
                    Text(
                        text = "✨ Guiar",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 11.5.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }
            }
        }

        // 1. Compromiso Práctico (ACTION_STEP)
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            color = colors.surface
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = "🎯", fontSize = 15.sp)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "MI COMPROMISO DE HOY",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary,
                        letterSpacing = 0.5.sp
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                R07AntiPasteTextField(
                    value = actionStepBlock.text,
                    onValueChange = { newText ->
                        val updated = blocks.toMutableList()
                        val idx = updated.indexOfFirst { it.type == DevotionalBlockType.ACTION_STEP }
                        if (idx >= 0) updated[idx] = actionStepBlock.copy(text = newText)
                        else updated.add(actionStepBlock.copy(text = newText))
                        onBlocksUpdated(updated)
                    },
                    placeholder = "¿Qué decisión u obediencia práctica vas a tomar el día de hoy?",
                    minLines = 2,
                    maxLines = 6,
                    modifier = Modifier.testTag("block_text_field_${actionStepBlock.id}")
                )
            }
        }

        // 2. Oración Personal
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            color = colors.surface
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "🙏", fontSize = 15.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "ORACIÓN",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Black,
                            color = colors.textPrimary,
                            letterSpacing = 0.5.sp
                        )
                    }

                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { onOpenPrayerGuidance() }
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                            .testTag("open_prayer_guidance_text_button"),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = colors.primary, modifier = Modifier.size(13.dp))
                        Text("Aprende a Orar ✨", color = colors.primary, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
                R07AntiPasteTextField(
                    value = prayerBlock.text,
                    onValueChange = { newText ->
                        val updated = blocks.toMutableList()
                        val idx = updated.indexOfFirst { it.type == DevotionalBlockType.PRAYER }
                        if (idx >= 0) updated[idx] = prayerBlock.copy(text = newText)
                        else updated.add(prayerBlock.copy(text = newText))
                        onBlocksUpdated(updated)
                    },
                    placeholder = "Escribe tu oración a Dios respondiendo a su mensaje...",
                    minLines = 2,
                    maxLines = 6,
                    modifier = Modifier.testTag("block_text_field_${prayerBlock.id}")
                )
            }
        }

        // Extra blocks
        extraBlocks.forEach { block ->
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                color = colors.surface
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = block.type.iconEmoji, fontSize = 15.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = block.displayTitle.uppercase(),
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                        }

                        IconButton(
                            onClick = {
                                val updated = blocks.toMutableList().apply { remove(block) }
                                onBlocksUpdated(updated)
                            },
                            modifier = Modifier.size(22.dp)
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Eliminar", tint = colors.textMuted, modifier = Modifier.size(14.dp))
                        }
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    R07AntiPasteTextField(
                        value = block.text,
                        onValueChange = { newText ->
                            val updated = blocks.toMutableList()
                            val idx = updated.indexOf(block)
                            if (idx >= 0) updated[idx] = block.copy(text = newText)
                            onBlocksUpdated(updated)
                        },
                        placeholder = block.type.placeholder,
                        minLines = 2,
                        maxLines = 6
                    )
                }
            }
        }

        // Add custom block dropdown trigger
        Box {
            OutlinedButton(
                onClick = { onToggleAddBlockMenu(true) },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = colors.primary, modifier = Modifier.size(14.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("+ Añadir bloque opcional (Gratitud, Cita clave)", fontSize = 12.sp, color = colors.primary, fontWeight = FontWeight.SemiBold)
            }

            DropdownMenu(
                expanded = showAddBlockMenu,
                onDismissRequest = { onToggleAddBlockMenu(false) },
                modifier = Modifier.background(colors.surface)
            ) {
                listOf(
                    DevotionalBlockType.KEY_VERSE,
                    DevotionalBlockType.GRATITUDE,
                    DevotionalBlockType.SPIRITUAL_VICTORY,
                    DevotionalBlockType.DAILY_CHALLENGE
                ).forEach { type ->
                    DropdownMenuItem(
                        text = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(text = type.iconEmoji, fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = type.defaultTitle, fontSize = 12.sp, color = colors.textPrimary)
                            }
                        },
                        onClick = {
                            onToggleAddBlockMenu(false)
                            val newBlock = DevotionalBlock(type = type)
                            onBlocksUpdated(blocks + newBlock)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun StepFourEvidenceSummaryContent(
    day: R07DayEntryEntity,
    photoUris: List<String>,
    scriptureText: String,
    timeText: String,
    moodText: String,
    isCompleted: Boolean,
    onToggleComplete: () -> Unit,
    onScanClicked: () -> Unit
) {
    val colors = R07Theme.colors

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Physical notebook photo evidence card
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            color = colors.surface
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "📸", fontSize = 15.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "FOTOS DEL CUADERNO FÍSICO (${photoUris.size})",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = colors.primaryContainer,
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .clickable { onScanClicked() }
                            .testTag("scan_paper_r07_button")
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "Escanear / Subir",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.primary
                            )
                        }
                    }
                }

                if (photoUris.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        photoUris.forEachIndexed { index, uriStr ->
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                            ) {
                                AsyncImage(
                                    model = uriStr,
                                    contentDescription = "Foto ${index + 1}",
                                    modifier = Modifier.matchParentSize(),
                                    contentScale = ContentScale.Crop
                                )
                            }
                        }
                    }
                } else {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Opcional: Sube las fotos de tu libreta para anexarlas al reporte semanal de tu líder.",
                        style = MaterialTheme.typography.bodySmall,
                        fontSize = 11.sp,
                        color = colors.textMuted
                    )
                }
            }
        }

        // Summary review card
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, colors.primary.copy(alpha = 0.3f), RoundedCornerShape(16.dp)),
            shape = RoundedCornerShape(16.dp),
            color = colors.primaryContainer.copy(alpha = 0.3f)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = "RESUMEN DEL DÍA",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Black,
                    color = colors.primary,
                    letterSpacing = 0.5.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(text = "Lectura:", fontSize = 12.sp, color = colors.textSecondary)
                    Text(text = if (scriptureText.isNotBlank()) scriptureText else "Sin registrar", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(text = "Hora:", fontSize = 12.sp, color = colors.textSecondary)
                    Text(text = if (timeText.isNotBlank()) timeText else "Sin registrar", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                }

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(text = "Estado:", fontSize = 12.sp, color = colors.textSecondary)
                    Text(text = if (moodText.isNotBlank()) moodText else "Normal", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.textPrimary)
                }
            }
        }
    }
}
