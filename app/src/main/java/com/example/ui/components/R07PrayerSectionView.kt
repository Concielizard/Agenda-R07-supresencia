package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SelfImprovement
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material.icons.outlined.CheckCircleOutline
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material3.AlertDialog
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
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.model.R07PrayerPetitionEntity
import com.example.data.model.WeekWithDays
import com.example.ui.theme.R07Theme
import kotlinx.coroutines.delay

val PRAYER_CATEGORIES = listOf(
    "Todas",
    "En Clamor 🙏",
    "Respondidas 🎉",
    "Personal",
    "Familia",
    "Salud",
    "Finanzas",
    "Espiritual",
    "Iglesia",
    "Amigos"
)

@Composable
fun R07PrayerSectionView(
    petitions: List<R07PrayerPetitionEntity>,
    weekWithDays: WeekWithDays?,
    onAddPetition: (title: String, description: String, category: String) -> Unit,
    onToggleAnswered: (petition: R07PrayerPetitionEntity, testimony: String) -> Unit,
    onIncrementPrayerCount: (petition: R07PrayerPetitionEntity) -> Unit,
    onDeletePetition: (petitionId: Long) -> Unit,
    onOpenAiPrayerGuidance: () -> Unit,
    onUpdateChurchPrayerAttendance: (
        attendedPrayer1: Boolean,
        prayer1Date: String,
        prayer1Notes: String,
        prayer1AbsenceReason: String,
        attendedPrayer2: Boolean,
        prayer2Date: String,
        prayer2Notes: String,
        prayer2AbsenceReason: String
    ) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = R07Theme.colors
    var selectedCategoryFilter by remember { mutableStateOf("Todas") }
    var showAddDialog by remember { mutableStateOf(false) }
    var showTestimonyDialogForPetition by remember { mutableStateOf<R07PrayerPetitionEntity?>(null) }
    var petitionToDelete by remember { mutableStateOf<R07PrayerPetitionEntity?>(null) }

    // Prayer Timer State
    var isTimerRunning by remember { mutableStateOf(false) }
    var timerSeconds by remember { mutableIntStateOf(0) }
    var showTimerCard by remember { mutableStateOf(false) }

    LaunchedEffect(isTimerRunning) {
        while (isTimerRunning) {
            delay(1000L)
            timerSeconds++
        }
    }

    // Congregational Prayer Attendance State
    val week = weekWithDays?.week
    var attendedPrayer1 by remember(week?.id, week?.attendedPrayerDay1) { mutableStateOf(week?.attendedPrayerDay1 ?: false) }
    var prayer1Date by remember(week?.id, week?.prayerDay1Date) { mutableStateOf(week?.prayerDay1Date?.ifBlank { "Martes Oración" } ?: "Martes Oración") }
    var prayer1Notes by remember(week?.id, week?.prayerDay1Notes) { mutableStateOf(week?.prayerDay1Notes ?: "") }
    var prayer1AbsenceReason by remember(week?.id, week?.prayerDay1AbsenceReason) { mutableStateOf(week?.prayerDay1AbsenceReason ?: "") }

    var attendedPrayer2 by remember(week?.id, week?.attendedPrayerDay2) { mutableStateOf(week?.attendedPrayerDay2 ?: false) }
    var prayer2Date by remember(week?.id, week?.prayerDay2Date) { mutableStateOf(week?.prayerDay2Date?.ifBlank { "Jueves Oración" } ?: "Jueves Oración") }
    var prayer2Notes by remember(week?.id, week?.prayerDay2Notes) { mutableStateOf(week?.prayerDay2Notes ?: "") }
    var prayer2AbsenceReason by remember(week?.id, week?.prayerDay2AbsenceReason) { mutableStateOf(week?.prayerDay2AbsenceReason ?: "") }

    fun syncPrayerAttendance() {
        onUpdateChurchPrayerAttendance(
            attendedPrayer1,
            prayer1Date,
            prayer1Notes,
            prayer1AbsenceReason,
            attendedPrayer2,
            prayer2Date,
            prayer2Notes,
            prayer2AbsenceReason
        )
    }

    val activePetitions = petitions.filter { !it.isAnswered }
    val answeredPetitions = petitions.filter { it.isAnswered }

    val filteredPetitions = remember(petitions, selectedCategoryFilter) {
        when (selectedCategoryFilter) {
            "Todas" -> petitions
            "En Clamor 🙏" -> petitions.filter { !it.isAnswered }
            "Respondidas 🎉" -> petitions.filter { it.isAnswered }
            else -> petitions.filter { it.category.equals(selectedCategoryFilter, ignoreCase = true) }
        }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // TOP HERO CARD: Prayer Overview & Stats
        item {
            Spacer(modifier = Modifier.height(2.dp))
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(26.dp))
                    .testTag("prayer_section_hero_card"),
                shape = RoundedCornerShape(26.dp),
                color = colors.surface,
                shadowElevation = 2.dp
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(colors.primaryContainer),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.VolunteerActivism,
                                    contentDescription = null,
                                    tint = colors.primary,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                            Column {
                                Text(
                                    text = "CUADERNO & TIEMPOS DE ORACIÓN",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Black,
                                    color = colors.primary,
                                    letterSpacing = 0.5.sp
                                )
                                Text(
                                    text = "Clamor, Peticiones y Testimonios",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary
                                )
                            }
                        }

                        IconButton(
                            onClick = { showTimerCard = !showTimerCard },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Timer,
                                contentDescription = "Cronómetro",
                                tint = if (showTimerCard || isTimerRunning) colors.primary else colors.textMuted
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Metrics Strip: Active | Answered | Church Prayer
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Metric 1: Active
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            color = colors.primaryContainer.copy(alpha = 0.5f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary.copy(alpha = 0.3f))
                        ) {
                            Column(
                                modifier = Modifier.padding(10.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "${activePetitions.size}",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Black,
                                    color = colors.primary
                                )
                                Text(
                                    text = "En Clamor 🙏",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary,
                                    fontSize = 10.5.sp
                                )
                            }
                        }

                        // Metric 2: Answered
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            color = Color(0xFFE8F5E9),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF81C784))
                        ) {
                            Column(
                                modifier = Modifier.padding(10.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "${answeredPetitions.size}",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFF2E7D32)
                                )
                                Text(
                                    text = "¡Respondidas! 🎉",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF2E7D32),
                                    fontSize = 10.5.sp
                                )
                            }
                        }

                        // Metric 3: Congregational Attendance
                        val churchPrayerCount = (if (attendedPrayer1) 1 else 0) + (if (attendedPrayer2) 1 else 0)
                        Surface(
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(14.dp),
                            color = colors.background,
                            border = androidx.compose.foundation.BorderStroke(1.dp, colors.border.copy(alpha = 0.6f))
                        ) {
                            Column(
                                modifier = Modifier.padding(10.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "$churchPrayerCount / 2",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Black,
                                    color = colors.textPrimary
                                )
                                Text(
                                    text = "En Iglesia ⛪",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textSecondary,
                                    fontSize = 10.5.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Primary Action Buttons: [+ Nueva Petición] & [Guía IA 🕊️]
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { showAddDialog = true },
                            modifier = Modifier
                                .weight(1.2f)
                                .height(46.dp)
                                .testTag("add_prayer_petition_button"),
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Add, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Nueva Petición", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                        }

                        OutlinedButton(
                            onClick = onOpenAiPrayerGuidance,
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp)
                                .testTag("open_ai_prayer_guidance_button"),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.primary)
                        ) {
                            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, tint = colors.primary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Guía IA 🕊️", fontWeight = FontWeight.Bold, fontSize = 12.5.sp)
                        }
                    }
                }
            }
        }

        // PRAYER TIMER CARD (Collapsible)
        if (showTimerCard || isTimerRunning) {
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, colors.primary.copy(alpha = 0.4f), RoundedCornerShape(20.dp)),
                    shape = RoundedCornerShape(20.dp),
                    color = colors.primaryContainer.copy(alpha = 0.35f)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(colors.primary),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (isTimerRunning) Icons.Default.SelfImprovement else Icons.Default.Timer,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                            Column {
                                val mins = timerSeconds / 60
                                val secs = timerSeconds % 60
                                val timeFormatted = String.format("%02d:%02d", mins, secs)

                                Text(
                                    text = "TIEMPO A SOLAS CON DIOS",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primary,
                                    fontSize = 10.5.sp
                                )
                                Text(
                                    text = timeFormatted,
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Black,
                                    color = colors.textPrimary
                                )
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                            Button(
                                onClick = { isTimerRunning = !isTimerRunning },
                                colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.height(36.dp)
                            ) {
                                Icon(
                                    imageVector = if (isTimerRunning) Icons.Default.Pause else Icons.Default.PlayArrow,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                    tint = Color.White
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(if (isTimerRunning) "Pausar" else "Orar", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                            }

                            if (timerSeconds > 0) {
                                IconButton(
                                    onClick = {
                                        isTimerRunning = false
                                        timerSeconds = 0
                                    },
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Icon(imageVector = Icons.Default.Refresh, contentDescription = "Reiniciar", tint = colors.textMuted)
                                }
                            }
                        }
                    }
                }
            }
        }

        // CONGREGATIONAL PRAYER SCHEDULE CARD (2 Tiempos de Oración Congregacional de la Semana)
        if (weekWithDays != null) {
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(22.dp))
                        .testTag("church_prayer_attendance_card"),
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
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("⛪", fontSize = 16.sp)
                                Column {
                                    Text(
                                        text = "TIEMPOS DE ORACIÓN CONGREGACIONAL",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Black,
                                        color = colors.textPrimary,
                                        letterSpacing = 0.5.sp
                                    )
                                    Text(
                                        text = "2 tiempos de clamor en la iglesia durante la semana",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = colors.textSecondary,
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (attendedPrayer1 && attendedPrayer2) colors.accentSuccessBg else colors.primaryContainer
                            ) {
                                Text(
                                    text = if (attendedPrayer1 && attendedPrayer2) "¡2 de 2 Cumplidos! ✨" else "${(if (attendedPrayer1) 1 else 0) + (if (attendedPrayer2) 1 else 0)} / 2",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = if (attendedPrayer1 && attendedPrayer2) colors.accentSuccess else colors.primary,
                                    fontSize = 11.sp,
                                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Tiempo 1
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = if (attendedPrayer1) colors.primaryContainer.copy(alpha = 0.35f) else colors.background,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (attendedPrayer1) colors.primary.copy(alpha = 0.4f) else colors.border.copy(alpha = 0.4f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "🕊️ Tiempo de Oración 1",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = colors.textPrimary
                                        )
                                        Text(
                                            text = prayer1Date,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = colors.textSecondary,
                                            fontSize = 11.sp
                                        )
                                    }

                                    Switch(
                                        checked = attendedPrayer1,
                                        onCheckedChange = {
                                            attendedPrayer1 = it
                                            syncPrayerAttendance()
                                        },
                                        colors = SwitchDefaults.colors(
                                            checkedThumbColor = Color.White,
                                            checkedTrackColor = colors.primary
                                        )
                                    )
                                }

                                if (attendedPrayer1) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    OutlinedTextField(
                                        value = prayer1Notes,
                                        onValueChange = {
                                            prayer1Notes = it
                                            syncPrayerAttendance()
                                        },
                                        label = { Text("¿Por qué clamaron y cómo fue tu tiempo con Dios?", fontSize = 11.sp) },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(10.dp),
                                        minLines = 2,
                                        maxLines = 3,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedContainerColor = colors.surface,
                                            unfocusedContainerColor = colors.surface,
                                            focusedTextColor = colors.textPrimary,
                                            unfocusedTextColor = colors.textPrimary,
                                            focusedBorderColor = colors.primary,
                                            unfocusedBorderColor = colors.border
                                        )
                                    )
                                } else {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    OutlinedTextField(
                                        value = prayer1AbsenceReason,
                                        onValueChange = {
                                            prayer1AbsenceReason = it
                                            syncPrayerAttendance()
                                        },
                                        placeholder = { Text("Motivo si no pudiste asistir (opcional)", fontSize = 11.sp, color = colors.textMuted) },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(10.dp),
                                        singleLine = true,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedContainerColor = colors.surface,
                                            unfocusedContainerColor = colors.surface,
                                            focusedTextColor = colors.textPrimary,
                                            unfocusedTextColor = colors.textPrimary,
                                            focusedBorderColor = colors.primary,
                                            unfocusedBorderColor = colors.border
                                        )
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Tiempo 2
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = if (attendedPrayer2) colors.primaryContainer.copy(alpha = 0.35f) else colors.background,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (attendedPrayer2) colors.primary.copy(alpha = 0.4f) else colors.border.copy(alpha = 0.4f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "🕊️ Tiempo de Oración 2",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = colors.textPrimary
                                        )
                                        Text(
                                            text = prayer2Date,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = colors.textSecondary,
                                            fontSize = 11.sp
                                        )
                                    }

                                    Switch(
                                        checked = attendedPrayer2,
                                        onCheckedChange = {
                                            attendedPrayer2 = it
                                            syncPrayerAttendance()
                                        },
                                        colors = SwitchDefaults.colors(
                                            checkedThumbColor = Color.White,
                                            checkedTrackColor = colors.primary
                                        )
                                    )
                                }

                                if (attendedPrayer2) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    OutlinedTextField(
                                        value = prayer2Notes,
                                        onValueChange = {
                                            prayer2Notes = it
                                            syncPrayerAttendance()
                                        },
                                        label = { Text("¿Por qué clamaron y cómo fue tu tiempo con Dios?", fontSize = 11.sp) },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(10.dp),
                                        minLines = 2,
                                        maxLines = 3,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedContainerColor = colors.surface,
                                            unfocusedContainerColor = colors.surface,
                                            focusedTextColor = colors.textPrimary,
                                            unfocusedTextColor = colors.textPrimary,
                                            focusedBorderColor = colors.primary,
                                            unfocusedBorderColor = colors.border
                                        )
                                    )
                                } else {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    OutlinedTextField(
                                        value = prayer2AbsenceReason,
                                        onValueChange = {
                                            prayer2AbsenceReason = it
                                            syncPrayerAttendance()
                                        },
                                        placeholder = { Text("Motivo si no pudiste asistir (opcional)", fontSize = 11.sp, color = colors.textMuted) },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(10.dp),
                                        singleLine = true,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedContainerColor = colors.surface,
                                            unfocusedContainerColor = colors.surface,
                                            focusedTextColor = colors.textPrimary,
                                            unfocusedTextColor = colors.textPrimary,
                                            focusedBorderColor = colors.primary,
                                            unfocusedBorderColor = colors.border
                                        )
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // CATEGORY FILTER CHIPS
        item {
            Column {
                Text(
                    text = "PETICIONES Y MOTIVOS DE CLAMOR",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Black,
                    color = colors.textPrimary,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    PRAYER_CATEGORIES.forEach { cat ->
                        val isSelected = selectedCategoryFilter == cat
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedCategoryFilter = cat },
                            label = {
                                Text(
                                    text = cat,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = colors.primary,
                                selectedLabelColor = Color.White,
                                containerColor = colors.surface,
                                labelColor = colors.textPrimary
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = isSelected,
                                borderColor = colors.border.copy(alpha = 0.5f),
                                selectedBorderColor = colors.primary
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }
            }
        }

        // LIST OF PETITIONS
        if (filteredPetitions.isEmpty()) {
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                        .border(1.dp, colors.border.copy(alpha = 0.4f), RoundedCornerShape(20.dp)),
                    shape = RoundedCornerShape(20.dp),
                    color = colors.surface
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(text = "🕊️", fontSize = 36.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "No hay peticiones en este filtro",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = colors.textPrimary
                        )
                        Text(
                            text = "«Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá.» — Mateo 7:7",
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.textSecondary,
                            textAlign = TextAlign.Center,
                            fontStyle = FontStyle.Italic,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                        Spacer(modifier = Modifier.height(14.dp))
                        Button(
                            onClick = { showAddDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Add, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Agregar Primera Petición 🙏", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.5.sp)
                        }
                    }
                }
            }
        } else {
            items(filteredPetitions, key = { it.id }) { petition ->
                PrayerPetitionCard(
                    petition = petition,
                    onToggleAnswered = {
                        if (!petition.isAnswered) {
                            showTestimonyDialogForPetition = petition
                        } else {
                            onToggleAnswered(petition, "")
                        }
                    },
                    onIncrementCount = { onIncrementPrayerCount(petition) },
                    onDelete = { petitionToDelete = petition }
                )
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    // DIALOG 1: ADD NEW PRAYER PETITION
    if (showAddDialog) {
        AddPrayerPetitionDialog(
            onDismiss = { showAddDialog = false },
            onConfirm = { title, desc, cat ->
                onAddPetition(title, desc, cat)
                showAddDialog = false
            }
        )
    }

    // DIALOG 2: RECORD TESTIMONY WHEN MARKING ANSWERED
    if (showTestimonyDialogForPetition != null) {
        val pet = showTestimonyDialogForPetition!!
        RecordTestimonyDialog(
            petitionTitle = pet.title,
            onDismiss = { showTestimonyDialogForPetition = null },
            onConfirm = { testimony ->
                onToggleAnswered(pet, testimony)
                showTestimonyDialogForPetition = null
            }
        )
    }

    // DIALOG 3: CONFIRM DELETE
    if (petitionToDelete != null) {
        val pet = petitionToDelete!!
        AlertDialog(
            onDismissRequest = { petitionToDelete = null },
            shape = RoundedCornerShape(22.dp),
            containerColor = colors.surface,
            title = {
                Text(
                    text = "¿Eliminar esta petición?",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
            },
            text = {
                Text(
                    text = "«${pet.title}»",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.textSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        onDeletePetition(pet.id)
                        petitionToDelete = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Eliminar", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { petitionToDelete = null }) {
                    Text("Cancelar", color = colors.textSecondary)
                }
            }
        )
    }
}

@Composable
private fun PrayerPetitionCard(
    petition: R07PrayerPetitionEntity,
    onToggleAnswered: () -> Unit,
    onIncrementCount: () -> Unit,
    onDelete: () -> Unit
) {
    val colors = R07Theme.colors
    val isAnswered = petition.isAnswered

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .border(
                1.dp,
                if (isAnswered) Color(0xFF81C784) else colors.border.copy(alpha = 0.5f),
                RoundedCornerShape(20.dp)
            )
            .animateContentSize()
            .testTag("prayer_petition_card_${petition.id}"),
        shape = RoundedCornerShape(20.dp),
        color = if (isAnswered) colors.primaryContainer.copy(alpha = 0.45f) else colors.surface,
        shadowElevation = 1.dp
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Card Header: Category Chip + Answered Badge + Delete
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    // Category Badge
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = colors.primaryContainer.copy(alpha = 0.6f)
                    ) {
                        Text(
                            text = petition.category.uppercase(),
                            modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 9.5.sp,
                            color = colors.primary
                        )
                    }

                    if (isAnswered) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF2E7D32)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(3.dp)
                            ) {
                                Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(11.dp))
                                Text(
                                    text = "¡DIOS RESPONDIÓ! 🎉",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 9.5.sp
                                )
                            }
                        }
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Eliminar petición",
                            tint = colors.textMuted,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Title
            Text(
                text = petition.title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary,
                fontSize = 14.5.sp
            )

            // Description / Specific details
            if (petition.description.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = petition.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.textSecondary,
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }

            // Testimony section if answered
            if (isAnswered && petition.testimonyNote.isNotBlank()) {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = colors.surface,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFA5D6A7)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("✨", fontSize = 13.sp)
                            Text(
                                text = "Testimonio (${petition.answeredDate.ifBlank { "Gloria a Dios" }}):",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF2E7D32)
                            )
                        }
                        Spacer(modifier = Modifier.height(3.dp))
                        Text(
                            text = petition.testimonyNote,
                            style = MaterialTheme.typography.bodySmall,
                            color = colors.textPrimary,
                            fontSize = 11.5.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            HorizontalDivider(color = colors.border.copy(alpha = 0.3f), thickness = 0.8.dp)
            Spacer(modifier = Modifier.height(8.dp))

            // Bottom Actions: [Oré por esto hoy +1] & [Marcar Respondida]
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Prayed today counter button
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = colors.primaryContainer.copy(alpha = 0.35f),
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .clickable(onClick = onIncrementCount)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text("🙏", fontSize = 11.sp)
                        Text(
                            text = "Oré por esto hoy: ${petition.prayerCount}",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = colors.primary,
                            fontSize = 10.5.sp
                        )
                    }
                }

                // Toggle Answered button
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = if (isAnswered) Color(0xFFE8F5E9) else colors.primaryContainer.copy(alpha = 0.35f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, if (isAnswered) Color(0xFF81C784) else colors.primary.copy(alpha = 0.3f)),
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .clickable(onClick = onToggleAnswered)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            imageVector = if (isAnswered) Icons.Default.CheckCircle else Icons.Default.Favorite,
                            contentDescription = null,
                            tint = if (isAnswered) Color(0xFF2E7D32) else colors.primary,
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = if (isAnswered) "Respondida" else "Marcar Respondida",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (isAnswered) Color(0xFF2E7D32) else colors.primary,
                            fontSize = 10.5.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AddPrayerPetitionDialog(
    onDismiss: () -> Unit,
    onConfirm: (title: String, description: String, category: String) -> Unit
) {
    val colors = R07Theme.colors
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Personal") }

    val categories = listOf("Personal", "Familia", "Salud", "Finanzas", "Espiritual", "Iglesia", "Amigos")

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .clip(RoundedCornerShape(26.dp))
                .border(1.5.dp, colors.borderStrong, RoundedCornerShape(26.dp))
                .testTag("add_prayer_petition_dialog"),
            shape = RoundedCornerShape(26.dp),
            color = colors.surface,
            shadowElevation = 8.dp
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("🙏", fontSize = 20.sp)
                        Text(
                            text = "NUEVA PETICIÓN DE ORACIÓN",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Black,
                            color = colors.textPrimary
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Cerrar", tint = colors.textPrimary)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Title Input
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Motivo / Petición Principal") },
                    placeholder = { Text("Ej. Dirección de Dios en mi nuevo trabajo", color = colors.textMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = colors.surface,
                        unfocusedContainerColor = colors.surface,
                        focusedTextColor = colors.textPrimary,
                        unfocusedTextColor = colors.textPrimary,
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border
                    )
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Description Input
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Detalles y promesa bíblica (opcional)") },
                    placeholder = { Text("Detalla tu clamor y escribe un versículo de fe...", color = colors.textMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    minLines = 3,
                    maxLines = 5,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = colors.surface,
                        unfocusedContainerColor = colors.surface,
                        focusedTextColor = colors.textPrimary,
                        unfocusedTextColor = colors.textPrimary,
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Category Chips
                Text(
                    text = "Categoría:",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = colors.textPrimary
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    categories.forEach { cat ->
                        val isSel = selectedCategory == cat
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSel) colors.primary else colors.primaryContainer,
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .clickable { selectedCategory = cat }
                        ) {
                            Text(
                                text = cat,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                fontSize = 11.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSel) Color.White else colors.textPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Save Button
                Button(
                    onClick = {
                        if (title.isNotBlank()) {
                            onConfirm(title.trim(), description.trim(), selectedCategory)
                        }
                    },
                    enabled = title.isNotBlank(),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("confirm_add_prayer_petition_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Guardar Petición en Mi Diario 🙏", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
private fun RecordTestimonyDialog(
    petitionTitle: String,
    onDismiss: () -> Unit,
    onConfirm: (testimony: String) -> Unit
) {
    val colors = R07Theme.colors
    var testimony by remember { mutableStateOf("") }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .clip(RoundedCornerShape(26.dp))
                .border(1.5.dp, Color(0xFF81C784), RoundedCornerShape(26.dp)),
            shape = RoundedCornerShape(26.dp),
            color = colors.surface,
            shadowElevation = 8.dp
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("🎉", fontSize = 22.sp)
                        Text(
                            text = "¡DIOS RESPONDIÓ TU ORACIÓN!",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF2E7D32)
                        )
                    }
                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Cerrar", tint = colors.textPrimary)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = colors.primaryContainer.copy(alpha = 0.4f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Petición: $petitionTitle",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.textPrimary,
                        modifier = Modifier.padding(10.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = testimony,
                    onValueChange = { testimony = it },
                    label = { Text("Escribe tu Testimonio") },
                    placeholder = { Text("¿Cómo respondió Dios? Escribe aquí tu testimonio para recordar Su fidelidad...", color = colors.textMuted) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    minLines = 3,
                    maxLines = 5,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = colors.surface,
                        unfocusedContainerColor = colors.surface,
                        focusedTextColor = colors.textPrimary,
                        unfocusedTextColor = colors.textPrimary,
                        focusedBorderColor = colors.primary,
                        unfocusedBorderColor = colors.border
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = { onConfirm(testimony.trim()) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32)),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("¡Celebrar y Guardar Testimonio! 🎉", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
            }
        }
    }
}
