package com.example.ui

import android.widget.Toast
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.SizeTransform
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
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
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Flag
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Spa
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.AppEdition
import com.example.data.local.UserAccountType
import com.example.ui.components.R07AiDevotionalDialog
import com.example.ui.components.R07AiLeaderSummaryDialog
import com.example.ui.components.R07AiPrayerGuidanceDialog
import com.example.ui.components.R07AuthOnboardingScreen
import com.example.ui.components.R07BibleSelectorDialog
import com.example.ui.components.R07AppLogo
import com.example.ui.components.R07ChurchCommunityCard
import com.example.ui.components.R07DayJournalEditor
import com.example.ui.components.R07DaySelectorBar
import com.example.ui.components.R07DevotionalGuideDialog
import com.example.ui.components.R07EditionSelectionDialog
import com.example.ui.components.R07ExportDownloadDialog
import com.example.ui.components.R07FullBibleReaderDialog
import com.example.ui.components.R07HeaderCard
import com.example.ui.components.R07HowItWorksDialog
import com.example.ui.components.R07LeaderSettingsDialog
import com.example.ui.components.R07NewWeekDialog
import com.example.ui.components.R07PrayerSectionView
import com.example.ui.components.R07ScanPhotoDialog
import com.example.ui.components.R07StartupEditionScreen
import com.example.ui.components.R07UserAvatarImage
import com.example.ui.components.R07UserProfileDialog
import com.example.ui.components.R07WeeklyGoalsCard
import com.example.ui.components.R07WeeklyTableView
import com.example.ui.theme.R07Theme
import kotlinx.coroutines.launch

enum class R07MainTab(val title: String, val order: Int, val testTag: String) {
    JOURNAL("Diario", 0, "nav_tab_journal"),
    PRAYER("Oración", 1, "nav_tab_prayer"),
    WEEKLY_TABLE("Semana", 2, "nav_tab_table"),
    GOALS("Metas", 3, "nav_tab_goals"),
    COMMUNITY("Comunidad", 4, "nav_tab_community")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun R07MainScreen(
    viewModel: R07ViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val allWeeks by viewModel.allWeeksWithDays.collectAsStateWithLifecycle()
    val currentWeekWithDays by viewModel.currentWeekWithDays.collectAsStateWithLifecycle()
    val selectedDayNumber by viewModel.selectedDayNumber.collectAsStateWithLifecycle()
    val exportUiState by viewModel.exportUiState.collectAsStateWithLifecycle()
    val scanPhotoUiState by viewModel.scanPhotoUiState.collectAsStateWithLifecycle()
    val aiInspirationState by viewModel.aiInspirationState.collectAsStateWithLifecycle()
    val aiLeaderReportState by viewModel.aiLeaderReportState.collectAsStateWithLifecycle()
    val aiPrayerGuidanceState by viewModel.aiPrayerGuidanceState.collectAsStateWithLifecycle()
    val allPrayerPetitions by viewModel.allPrayerPetitions.collectAsStateWithLifecycle()
    val snackbarMessage by viewModel.snackbarMessage.collectAsStateWithLifecycle()
    val userEdition by viewModel.userEdition.collectAsStateWithLifecycle()
    val themeMode by viewModel.themeMode.collectAsStateWithLifecycle()
    val colorPalette by viewModel.colorPalette.collectAsStateWithLifecycle()
    val fontFamily by viewModel.fontFamily.collectAsStateWithLifecycle()
    val logoTheme by viewModel.logoTheme.collectAsStateWithLifecycle()
    val logoSymbol by viewModel.logoSymbol.collectAsStateWithLifecycle()
    val userPhotoUri by viewModel.userPhotoUri.collectAsStateWithLifecycle()
    val availableMoods by viewModel.availableMoods.collectAsStateWithLifecycle()
    val bibleDownloadProgress by viewModel.bibleDownloadProgress.collectAsStateWithLifecycle()
    val rvrDownloadedCount by viewModel.rvrDownloadedCount.collectAsStateWithLifecycle()
    val ntvDownloadedCount by viewModel.ntvDownloadedCount.collectAsStateWithLifecycle()

    // Auth, Social & Church State
    val isLoggedIn by viewModel.isLoggedIn.collectAsStateWithLifecycle()
    val authProvider by viewModel.authProvider.collectAsStateWithLifecycle()
    val userFriendToken by viewModel.userFriendToken.collectAsStateWithLifecycle()
    val allFriends by viewModel.allFriends.collectAsStateWithLifecycle()
    val allCommunities by viewModel.allCommunities.collectAsStateWithLifecycle()
    val accountType by viewModel.accountType.collectAsStateWithLifecycle()
    val userName by viewModel.userName.collectAsStateWithLifecycle()
    val userAge by viewModel.userAge.collectAsStateWithLifecycle()
    val userAvatarEmoji by viewModel.userAvatarEmoji.collectAsStateWithLifecycle()
    val userEmail by viewModel.userEmail.collectAsStateWithLifecycle()
    val groupName by viewModel.groupName.collectAsStateWithLifecycle()
    val churchName by viewModel.churchName.collectAsStateWithLifecycle()
    val leaderName by viewModel.leaderName.collectAsStateWithLifecycle()
    val leaderPhone by viewModel.leaderPhone.collectAsStateWithLifecycle()
    val leaderEmail by viewModel.leaderEmail.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }

    // Dialogs state
    var showUserProfileDialog by remember { mutableStateOf(false) }
    var showHowItWorksDialog by remember { mutableStateOf(false) }
    var showNewWeekDialog by remember { mutableStateOf(false) }
    var showDeleteWeekConfirmDialog by remember { mutableStateOf(false) }
    var showGuideDialog by remember { mutableStateOf(false) }
    var showScanDialog by remember { mutableStateOf(false) }
    var showBibleDialog by remember { mutableStateOf(false) }
    var showFullBibleReaderDialog by remember { mutableStateOf(false) }
    var showEditionDialog by remember { mutableStateOf(false) }
    var showLeaderSettingsDialog by remember { mutableStateOf(false) }
    var showWeekDropdownMenu by remember { mutableStateOf(false) }

    val colors = R07Theme.colors
    val edition = R07Theme.edition

    // Horizontal Pager for smooth swipe gestures between tabs
    val pagerState = rememberPagerState(initialPage = 0, pageCount = { R07MainTab.entries.size })

    // Mandatory Authentication & Onboarding Gate
    if (!isLoggedIn || userEdition == null) {
        R07AuthOnboardingScreen(
            onGoogleSignIn = {
                viewModel.loginWithGoogle()
            },
            onAppleSignIn = {
                viewModel.loginWithApple()
            },
            onEmailSignIn = { email, pass ->
                viewModel.loginWithEmail(email, pass)
            },
            onCompleteOnboarding = { selEdition, selPalette, selAccountType, selName, selAge, selAvatar, selEmail, selGroup, selChurch, userTok, friendTok, leaderN, leaderP, leaderE ->
                viewModel.completeOnboarding(
                    name = selName,
                    age = selAge,
                    avatar = selAvatar,
                    email = selEmail,
                    accountType = selAccountType,
                    groupName = selGroup,
                    churchName = selChurch,
                    edition = selEdition,
                    palette = selPalette,
                    initialFriendToken = friendTok.takeIf { it.isNotBlank() },
                    initialCommunityToken = if (selAccountType == com.example.data.local.UserAccountType.CONNECTION_GROUP) userTok else null
                )
            }
        )
        return
    }

    LaunchedEffect(snackbarMessage) {
        snackbarMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.clearSnackbar()
        }
    }

    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .testTag("main_screen"),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // App Logo button (customizable dynamic logo)
                        R07AppLogo(
                            size = 36.dp,
                            logoTheme = logoTheme,
                            logoSymbol = logoSymbol,
                            modifier = Modifier
                                .clickable { showUserProfileDialog = true }
                                .testTag("app_logo_topbar")
                        )

                        // User Avatar button (with real photo / selfie support)
                        R07UserAvatarImage(
                            photoUri = userPhotoUri,
                            fallbackAvatar = if (userAvatarEmoji.isNotBlank()) userAvatarEmoji else edition.icon,
                            size = 36.dp,
                            isEditable = false,
                            modifier = Modifier
                                .clickable { showUserProfileDialog = true }
                                .testTag("user_avatar_button")
                        )

                        Column(
                            modifier = Modifier
                                .weight(1f, fill = false)
                                .clickable { showUserProfileDialog = true }
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = if (userName.isNotBlank()) userName else "R07 Devocional",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Black,
                                    color = colors.textPrimary,
                                    fontSize = 14.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = accountType.icon,
                                    fontSize = 11.sp
                                )
                            }
                            Text(
                                text = "«Pasa tiempo Conmigo»",
                                style = MaterialTheme.typography.labelSmall,
                                color = colors.primary,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.5.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                },
                actions = {
                    // Week Selector Pill in Top Bar (only if there are weeks)
                    if (currentWeekWithDays != null) {
                        val activeWeek = currentWeekWithDays!!.week
                        val daysDone = currentWeekWithDays!!.days.count { it.isCompleted || it.reflectionText.isNotBlank() }

                        Box {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = colors.primaryContainer.copy(alpha = 0.6f),
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { showWeekDropdownMenu = true }
                                    .testTag("top_week_dropdown_pill")
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(
                                        text = "${activeWeek.title.take(9)} ($daysDone/7)",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.primary,
                                        fontSize = 10.5.sp
                                    )
                                    Icon(
                                        imageVector = Icons.Default.KeyboardArrowDown,
                                        contentDescription = "Cambiar semana",
                                        tint = colors.primary,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }

                            DropdownMenu(
                                expanded = showWeekDropdownMenu,
                                onDismissRequest = { showWeekDropdownMenu = false },
                                modifier = Modifier.background(colors.surface)
                            ) {
                                allWeeks.forEach { weekItem ->
                                    val isSelected = weekItem.week.id == currentWeekWithDays?.week?.id
                                    val countDone = weekItem.days.count { it.isCompleted || it.reflectionText.isNotBlank() }
                                    DropdownMenuItem(
                                        text = {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(
                                                    text = weekItem.week.title,
                                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                                    color = if (isSelected) colors.primary else colors.textPrimary,
                                                    fontSize = 13.sp
                                                )
                                                Spacer(modifier = Modifier.width(8.dp))
                                                Text(
                                                    text = "$countDone/7 días",
                                                    fontSize = 11.sp,
                                                    color = colors.textMuted
                                                )
                                            }
                                        },
                                        onClick = {
                                            showWeekDropdownMenu = false
                                            viewModel.selectWeek(weekItem.week.id)
                                        }
                                    )
                                }

                                DropdownMenuItem(
                                    text = {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Default.Add, contentDescription = null, tint = colors.primary, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(6.dp))
                                            Text("+ Nueva Semana", fontWeight = FontWeight.Bold, color = colors.primary, fontSize = 12.sp)
                                        }
                                    },
                                    onClick = {
                                        showWeekDropdownMenu = false
                                        showNewWeekDialog = true
                                    }
                                )
                            }
                        }
                    }

                    // Scan Photo Button
                    IconButton(
                        onClick = { showScanDialog = true },
                        modifier = Modifier.size(34.dp).testTag("top_camera_scan_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = "Escanear papel",
                            tint = colors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Palette / Theme Customizer Button
                    IconButton(
                        onClick = { showEditionDialog = true },
                        modifier = Modifier.size(34.dp).testTag("top_edition_switch_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Palette,
                            contentDescription = "Tema",
                            tint = colors.primary,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // How It Works Guide Button
                    IconButton(
                        onClick = { showHowItWorksDialog = true },
                        modifier = Modifier.size(34.dp).testTag("guide_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.HelpOutline,
                            contentDescription = "Cómo funciona",
                            tint = colors.textSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = colors.surface
                )
            )
        },
        bottomBar = {
            // CONDITIONAL: Only show bottom navigation when the user has at least one active week
            if (currentWeekWithDays != null) {
                NavigationBar(
                    modifier = Modifier
                        .border(
                            1.dp,
                            colors.border.copy(alpha = 0.4f),
                            RoundedCornerShape(topStart = 22.dp, topEnd = 22.dp)
                        )
                        .clip(RoundedCornerShape(topStart = 22.dp, topEnd = 22.dp))
                        .testTag("bottom_navigation_bar"),
                    containerColor = colors.surface,
                    tonalElevation = 4.dp
                ) {
                    R07MainTab.entries.forEach { tab ->
                        val isSelected = pagerState.currentPage == tab.order
                        val iconVector = when (tab) {
                            R07MainTab.JOURNAL -> Icons.Default.EditNote
                            R07MainTab.PRAYER -> Icons.Default.VolunteerActivism
                            R07MainTab.WEEKLY_TABLE -> Icons.Default.TableChart
                            R07MainTab.GOALS -> Icons.Default.Flag
                            R07MainTab.COMMUNITY -> if (accountType == UserAccountType.CONNECTION_GROUP) Icons.Default.Groups else Icons.Default.VolunteerActivism
                        }

                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                coroutineScope.launch {
                                    pagerState.animateScrollToPage(tab.order)
                                }
                            },
                            icon = {
                                Icon(
                                    imageVector = iconVector,
                                    contentDescription = tab.title,
                                    modifier = Modifier.size(20.dp)
                                )
                            },
                            label = {
                                Text(
                                    text = tab.title,
                                    fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium,
                                    fontSize = 10.5.sp
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color.White,
                                selectedTextColor = colors.primary,
                                unselectedIconColor = colors.textMuted,
                                unselectedTextColor = colors.textMuted,
                                indicatorColor = colors.primary
                            ),
                            modifier = Modifier.testTag(tab.testTag)
                        )
                    }
                }
            }
        },
        containerColor = colors.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            val current = currentWeekWithDays

            if (current == null) {
                // ELEGANT WELCOME EMPTY STATE (No bottom bar shown until started)
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = colors.primaryContainer,
                            border = androidx.compose.foundation.BorderStroke(2.dp, colors.primary),
                            modifier = Modifier.size(76.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = if (userAvatarEmoji.isNotBlank()) userAvatarEmoji else edition.icon,
                                    fontSize = 36.sp
                                )
                            }
                        }

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = colors.primary.copy(alpha = 0.12f)
                        ) {
                            Text(
                                text = "AGENDA DEVOCIONAL R07",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.ExtraBold,
                                color = colors.primary,
                                letterSpacing = 1.sp,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }

                        Text(
                            text = if (userName.isNotBlank()) "¡Hola, $userName!" else "Bienvenido a tu Agenda R07",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Black,
                            color = colors.textPrimary,
                            textAlign = TextAlign.Center
                        )

                        Text(
                            text = "«Pasa tiempo Conmigo»\nInicia tu primera semana para comenzar tu diario devocional de 7 días con Dios.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = colors.textSecondary,
                            textAlign = TextAlign.Center,
                            lineHeight = 20.sp
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        // Primary Action: Start First Week
                        Button(
                            onClick = { viewModel.startFirstWeek() },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                            shape = RoundedCornerShape(18.dp),
                            modifier = Modifier
                                .fillMaxWidth(0.9f)
                                .height(52.dp)
                                .testTag("start_first_week_button")
                        ) {
                            Icon(imageVector = Icons.Default.Add, contentDescription = null, tint = Color.White)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Comenzar Semana 1 ✨",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.5.sp
                            )
                        }

                        // Secondary: How it Works Guide
                        OutlinedButton(
                            onClick = { showHowItWorksDialog = true },
                            shape = RoundedCornerShape(18.dp),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.primary),
                            modifier = Modifier
                                .fillMaxWidth(0.9f)
                                .height(48.dp)
                                .testTag("open_how_it_works_button")
                        ) {
                            Icon(imageVector = Icons.Default.HelpOutline, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "¿Cómo funciona el R07?",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }

                        // Tertiary: User Profile / Mode Settings
                        TextButton(
                            onClick = { showUserProfileDialog = true },
                            modifier = Modifier.testTag("open_profile_from_empty_button")
                        ) {
                            Text(
                                text = "Configurar mi perfil o grupo de conexión",
                                style = MaterialTheme.typography.labelMedium,
                                color = colors.textMuted
                            )
                        }
                    }
                }
            } else {
                val completedDaysCount = current.days.count { it.isCompleted || (it.reflectionText.isNotBlank() && it.scriptureRef.isNotBlank()) }

                // HORIZONTAL PAGER (Fluid swiping across all 5 sections)
                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier.fillMaxSize()
                ) { pageIndex ->
                    when (R07MainTab.entries[pageIndex]) {
                        // TAB 0: DIARIO (DAY EDITOR)
                        R07MainTab.JOURNAL -> {
                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                item {
                                    Spacer(modifier = Modifier.height(2.dp))
                                    R07HeaderCard(
                                        week = current.week,
                                        completedDaysCount = completedDaysCount,
                                        onReadingGoalChanged = { newGoal ->
                                            viewModel.updateReadingGoal(current.week.id, newGoal)
                                        },
                                        onGoalCompletedToggled = { completed ->
                                            viewModel.updateGoalCompleted(current.week.id, completed)
                                        },
                                        onIncrementPrayer = {
                                            viewModel.incrementPrayerAttendance(current.week.id, current.week.prayerAttendanceCount)
                                        },
                                        onDecrementPrayer = {
                                            viewModel.decrementPrayerAttendance(current.week.id, current.week.prayerAttendanceCount)
                                        }
                                    )
                                }

                                item {
                                    R07DaySelectorBar(
                                        days = current.days,
                                        selectedDayNumber = selectedDayNumber,
                                        onSelectDay = { viewModel.selectDay(it) }
                                    )
                                }

                                item {
                                    val activeDay = current.days.find { it.dayNumber == selectedDayNumber }
                                        ?: current.days.firstOrNull()

                                    if (activeDay != null) {
                                        AnimatedContent(
                                            targetState = activeDay.dayNumber,
                                            transitionSpec = {
                                                (fadeIn(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))).togetherWith(
                                                    fadeOut(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))
                                                )
                                            },
                                            label = "dayContentAnimation"
                                        ) { _ ->
                                            R07DayJournalEditor(
                                                day = activeDay,
                                                availableMoods = availableMoods,
                                                onDayUpdated = { updatedDay ->
                                                    viewModel.updateDayEntry(updatedDay)
                                                },
                                                onScanPhotoClicked = {
                                                    showScanDialog = true
                                                },
                                                onOpenBibleSelector = {
                                                    showBibleDialog = true
                                                },
                                                onAiInspirationClicked = {
                                                    viewModel.fetchAiDevotionalInspiration(activeDay)
                                                },
                                                onOpenPrayerGuidanceClicked = {
                                                    viewModel.openAiPrayerGuidance(activeDay)
                                                }
                                            )
                                        }
                                    }
                                }

                                item {
                                    InspirationalVerseBanner(verse = current.week.verseOfTheWeek)
                                }

                                item {
                                    Spacer(modifier = Modifier.height(16.dp))
                                }
                            }
                        }

                        // TAB 1: APARTADO ÚNICO DE ORACIÓN (CLAMOR, PETICIONES, TEMPORIZADOR, 2 DÍAS ORACIÓN Y GUÍA)
                        R07MainTab.PRAYER -> {
                            R07PrayerSectionView(
                                petitions = allPrayerPetitions,
                                weekWithDays = current,
                                onAddPetition = { title, desc, cat ->
                                    viewModel.addPrayerPetition(title, desc, cat)
                                },
                                onToggleAnswered = { petition, testimony ->
                                    viewModel.togglePrayerPetitionAnswered(petition, testimony)
                                },
                                onIncrementPrayerCount = { petition ->
                                    viewModel.incrementPetitionPrayerCount(petition)
                                },
                                onDeletePetition = { petitionId ->
                                    viewModel.deletePrayerPetition(petitionId)
                                },
                                onOpenAiPrayerGuidance = {
                                    val activeDay = current.days.find { it.dayNumber == selectedDayNumber } ?: current.days.firstOrNull()
                                    if (activeDay != null) {
                                        viewModel.openAiPrayerGuidance(activeDay)
                                    }
                                },
                                onUpdateChurchPrayerAttendance = { attended1, date1, notes1, reason1, attended2, date2, notes2, reason2 ->
                                    viewModel.updateChurchPrayerAttendance(
                                        weekId = current.week.id,
                                        attendedPrayer1 = attended1,
                                        prayer1Date = date1,
                                        prayer1Notes = notes1,
                                        prayer1AbsenceReason = reason1,
                                        attendedPrayer2 = attended2,
                                        prayer2Date = date2,
                                        prayer2Notes = notes2,
                                        prayer2AbsenceReason = reason2
                                    )
                                }
                            )
                        }

                        // TAB 2: HOJA SEMANAL (TABLE VIEW)
                        R07MainTab.WEEKLY_TABLE -> {
                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                item {
                                    Spacer(modifier = Modifier.height(2.dp))
                                    R07WeeklyTableView(
                                        days = current.days,
                                        onDayClick = { dayNum ->
                                            viewModel.selectDay(dayNum)
                                            coroutineScope.launch {
                                                pagerState.animateScrollToPage(R07MainTab.JOURNAL.order)
                                            }
                                        }
                                    )
                                }

                                item {
                                    Surface(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(20.dp))
                                            .clickable { viewModel.generateAiWeeklyReport() }
                                            .border(1.dp, colors.primary.copy(alpha = 0.3f), RoundedCornerShape(20.dp)),
                                        shape = RoundedCornerShape(20.dp),
                                        color = colors.primaryContainer.copy(alpha = 0.3f)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(14.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.AutoAwesome,
                                                    contentDescription = null,
                                                    tint = colors.primary,
                                                    modifier = Modifier.size(20.dp)
                                                )
                                                Column {
                                                    Text(
                                                        text = "Generar Reporte para mi Líder",
                                                        style = MaterialTheme.typography.labelMedium,
                                                        fontWeight = FontWeight.Bold,
                                                        color = colors.textPrimary
                                                    )
                                                    Text(
                                                        text = "Sintetiza tus 7 días en un reporte devocional de rendición de cuentas",
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = colors.textSecondary,
                                                        fontSize = 11.sp
                                                    )
                                                }
                                            }

                                            Surface(
                                                shape = RoundedCornerShape(10.dp),
                                                color = colors.primary
                                            ) {
                                                Text(
                                                    text = "Generar ✨",
                                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                                    style = MaterialTheme.typography.labelSmall,
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color.White
                                                )
                                            }
                                        }
                                    }
                                }

                                item {
                                    Surface(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(20.dp))
                                            .clickable { viewModel.exportCurrentWeekPdf(context) }
                                            .border(1.dp, colors.border.copy(alpha = 0.4f), RoundedCornerShape(20.dp)),
                                        shape = RoundedCornerShape(20.dp),
                                        color = colors.surface
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(14.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.PictureAsPdf,
                                                    contentDescription = null,
                                                    tint = colors.primary,
                                                    modifier = Modifier.size(20.dp)
                                                )
                                                Column {
                                                    Text(
                                                        text = "Exportar Formato Oficial R07 (PDF)",
                                                        style = MaterialTheme.typography.labelMedium,
                                                        fontWeight = FontWeight.Bold,
                                                        color = colors.textPrimary
                                                    )
                                                    Text(
                                                        text = "Descarga o comparte tu hoja de 7 días completa",
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = colors.textSecondary,
                                                        fontSize = 11.sp
                                                    )
                                                }
                                            }

                                            Icon(
                                                imageVector = Icons.Default.Download,
                                                contentDescription = "Descargar",
                                                tint = colors.primary,
                                                modifier = Modifier.size(20.dp)
                                            )
                                        }
                                    }
                                }

                                item {
                                    InspirationalVerseBanner(verse = current.week.verseOfTheWeek)
                                }

                                item {
                                    Spacer(modifier = Modifier.height(16.dp))
                                }
                            }
                        }

                        // TAB 3: METAS & PROGRESO
                        R07MainTab.GOALS -> {
                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                item {
                                    Spacer(modifier = Modifier.height(2.dp))
                                    R07WeeklyGoalsCard(
                                        goals = current.goals,
                                        onToggleGoal = { goal ->
                                            viewModel.toggleGoalCompletion(goal)
                                        },
                                        onAddGoal = { title, category ->
                                            viewModel.addWeeklyGoal(current.week.id, title, category)
                                        },
                                        onDeleteGoal = { goalId ->
                                            viewModel.deleteWeeklyGoal(goalId)
                                        }
                                    )
                                }

                                item {
                                    InspirationalVerseBanner(verse = current.week.verseOfTheWeek)
                                }

                                item {
                                    Spacer(modifier = Modifier.height(16.dp))
                                }
                            }
                        }

                        // TAB 4: COMUNIDAD & GRUPO DE CONEXIÓN
                        R07MainTab.COMMUNITY -> {
                            R07ChurchCommunityCard(
                                weekWithDays = current,
                                accountType = accountType,
                                groupName = if (groupName.isNotBlank()) groupName else "Grupo de Conexión",
                                churchName = if (churchName.isNotBlank()) churchName else "Iglesia",
                                userFriendToken = userFriendToken,
                                friends = allFriends,
                                communities = allCommunities,
                                onConnectFriend = { token, name, avatar ->
                                    viewModel.connectFriendByToken(token, name, avatar)
                                },
                                onRemoveFriend = { friendId ->
                                    viewModel.removeFriend(friendId)
                                },
                                onRegenerateUserToken = {
                                    viewModel.regenerateUserFriendToken()
                                },
                                onUpdateGroupAttendance = { attendedGroup, groupLearnings, groupTopics, groupFeelings, groupAbsenceReason ->
                                    viewModel.updateGroupAttendance(
                                        weekId = current.week.id,
                                        attendedGroup = attendedGroup,
                                        groupLearnings = groupLearnings,
                                        groupTopics = groupTopics,
                                        groupFeelings = groupFeelings,
                                        groupAbsenceReason = groupAbsenceReason
                                    )
                                },
                                onUpdateSundayAttendance = { attendedSunday, sundayNotes ->
                                    viewModel.updateSundayAttendance(
                                        weekId = current.week.id,
                                        attendedSunday = attendedSunday,
                                        sundayNotes = sundayNotes
                                    )
                                },
                                onOpenProfileSettings = { showUserProfileDialog = true }
                            )
                        }
                    }
                }
            }
        }
    }

    // DIALOGS

    // 1. User Profile & Account Dialog
    if (showUserProfileDialog) {
        val totalCompletedDays = allWeeks.sumOf { w -> w.days.count { it.isCompleted } }
        R07UserProfileDialog(
            currentName = userName,
            currentAge = userAge,
            currentAvatar = userAvatarEmoji,
            currentEmail = userEmail,
            currentAccountType = accountType,
            currentGroupName = groupName,
            currentChurchName = churchName,
            currentLeaderName = leaderName,
            currentLeaderPhone = leaderPhone,
            currentLeaderEmail = leaderEmail,
            totalWeeksCount = allWeeks.size,
            completedDaysTotal = totalCompletedDays,
            currentUserPhotoUri = userPhotoUri,
            authProvider = authProvider,
            userFriendToken = userFriendToken,
            onPhotoSelected = { viewModel.setUserPhotoUri(it) },
            onPhotoRemoved = { viewModel.removeUserPhotoUri() },
            onRegenerateUserToken = { viewModel.regenerateUserFriendToken() },
            onLogout = { viewModel.logout() },
            onDismiss = { showUserProfileDialog = false },
            onSaveProfile = { name, age, avatar, email, accType, grp, ch ->
                viewModel.saveUserProfile(name, age, avatar, email, accType, grp, ch)
            },
            onSaveLeaderInfo = { lName, lPhone, lEmail ->
                viewModel.saveLeaderContactInfo(lName, lPhone, lEmail)
            },
            onOpenDesignStudio = {
                showEditionDialog = true
            },
            onExportPdf = {
                if (currentWeekWithDays != null) {
                    viewModel.exportCurrentWeekPdf(context)
                } else {
                    Toast.makeText(context, "Inicia una semana para exportar tu PDF", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }

    // 2. How it works Visual Infographic Dialog
    if (showHowItWorksDialog) {
        R07HowItWorksDialog(
            onDismiss = { showHowItWorksDialog = false },
            onStartFirstWeek = {
                if (currentWeekWithDays == null) {
                    viewModel.startFirstWeek()
                }
            }
        )
    }

    // 3. Edition, Font and Palette Dialog
    if (showEditionDialog) {
        R07EditionSelectionDialog(
            currentEdition = edition,
            currentThemeMode = themeMode,
            currentColorPalette = colorPalette,
            currentFontFamily = fontFamily,
            currentLogoTheme = logoTheme,
            currentLogoSymbol = logoSymbol,
            onDismiss = { showEditionDialog = false },
            onEditionSelected = { newEdition ->
                viewModel.selectEdition(newEdition)
            },
            onThemeModeSelected = { newMode ->
                viewModel.setThemeMode(newMode)
            },
            onPaletteSelected = { newPalette ->
                viewModel.setColorPalette(newPalette)
            },
            onFontFamilySelected = { newFont ->
                viewModel.setFontFamily(newFont)
            },
            onLogoThemeSelected = { newLogoTh ->
                viewModel.setLogoTheme(newLogoTh)
            },
            onLogoSymbolSelected = { newSymbol ->
                viewModel.setLogoSymbol(newSymbol)
            }
        )
    }

    // 4. Delete Week Confirm Dialog
    if (showDeleteWeekConfirmDialog && currentWeekWithDays != null) {
        val activeWeek = currentWeekWithDays!!.week
        AlertDialog(
            onDismissRequest = { showDeleteWeekConfirmDialog = false },
            shape = RoundedCornerShape(24.dp),
            containerColor = colors.surface,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Eliminar",
                        tint = Color(0xFFC62828),
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "¿Eliminar esta Semana?",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Black,
                        color = colors.textPrimary
                    )
                }
            },
            text = {
                Text(
                    text = "Se eliminará «${activeWeek.title}» y todos los registros diarios de esta semana. ¿Deseas continuar?",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.textSecondary
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteWeekConfirmDialog = false
                        viewModel.deleteCurrentWeek(activeWeek.id)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC62828)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.testTag("confirm_delete_week_button")
                ) {
                    Text("Eliminar Semana", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showDeleteWeekConfirmDialog = false }
                ) {
                    Text("Cancelar", color = colors.textSecondary)
                }
            }
        )
    }

    // 5. New Week Dialog
    if (showNewWeekDialog) {
        val nextWeekNumber = (allWeeks.size + 1)
        R07NewWeekDialog(
            nextWeekNumber = nextWeekNumber,
            onDismiss = { showNewWeekDialog = false },
            onCreateWeek = { title, goal, verse ->
                viewModel.createNewWeek(title, goal, verse)
            }
        )
    }

    // 6. Devotional Guide Dialog
    if (showGuideDialog) {
        R07DevotionalGuideDialog(
            onDismiss = { showGuideDialog = false }
        )
    }

    // 7. AI Devotional Inspiration Dialog
    if (aiInspirationState.showDialog) {
        val activeDay = currentWeekWithDays?.days?.find { it.dayNumber == selectedDayNumber }
            ?: currentWeekWithDays?.days?.firstOrNull()

        R07AiDevotionalDialog(
            isLoading = aiInspirationState.isLoading,
            inspiration = aiInspirationState.inspiration,
            errorMessage = aiInspirationState.errorMessage,
            onApplyToJournal = {
                if (activeDay != null) {
                    viewModel.applyAiInspirationToDay(activeDay)
                }
            },
            onDismiss = {
                viewModel.dismissAiInspirationDialog()
            }
        )
    }

    // 8. AI Weekly Leader Summary Report Dialog
    if (aiLeaderReportState.showDialog && currentWeekWithDays != null) {
        R07AiLeaderSummaryDialog(
            isLoading = aiLeaderReportState.isLoading,
            report = aiLeaderReportState.report,
            errorMessage = aiLeaderReportState.errorMessage,
            weekTitle = currentWeekWithDays!!.week.title,
            onDismiss = {
                viewModel.dismissAiLeaderReportDialog()
            }
        )
    }

    // 8.5. AI Prayer Guidance Dialog
    if (aiPrayerGuidanceState.showDialog && currentWeekWithDays != null) {
        val activeDay = currentWeekWithDays!!.days.find { it.dayNumber == aiPrayerGuidanceState.dayNumber }
            ?: currentWeekWithDays!!.days.find { it.dayNumber == selectedDayNumber }
            ?: currentWeekWithDays!!.days.firstOrNull()

        R07AiPrayerGuidanceDialog(
            dayNumber = aiPrayerGuidanceState.dayNumber,
            dayName = aiPrayerGuidanceState.dayName,
            scriptureRef = aiPrayerGuidanceState.scriptureRef,
            currentMood = aiPrayerGuidanceState.currentMood,
            isLoading = aiPrayerGuidanceState.isLoading,
            prayerResponse = aiPrayerGuidanceState.response,
            errorMessage = aiPrayerGuidanceState.errorMessage,
            onGeneratePrayer = { feeling ->
                if (activeDay != null) {
                    viewModel.generatePersonalizedPrayer(activeDay, feeling)
                }
            },
            onApplyToDayPrayer = { guidedPrayer ->
                if (activeDay != null) {
                    viewModel.applyGuidedPrayerToDay(activeDay, guidedPrayer)
                }
            },
            onDismiss = {
                viewModel.dismissAiPrayerGuidanceDialog()
            }
        )
    }

    // 9. Bible Selector Dialog
    if (showBibleDialog && currentWeekWithDays != null) {
        val activeDay = currentWeekWithDays!!.days.find { it.dayNumber == selectedDayNumber }
            ?: currentWeekWithDays!!.days.firstOrNull()

        R07BibleSelectorDialog(
            onDismiss = { showBibleDialog = false },
            onOpenFullReader = {
                showBibleDialog = false
                showFullBibleReaderDialog = true
            },
            onLoadChapter = { bookNum, chap, ver, callback ->
                viewModel.loadBibleChapter(bookNum, chap, ver, callback)
            },
            onDownloadChapter = { bookNum, chap, ver ->
                viewModel.downloadSingleChapter(bookNum, chap, ver)
            },
            onVerseSelected = { verseRef, verseText, isMarkdownQuote ->
                if (activeDay != null) {
                    val updatedRef = if (activeDay.scriptureRef.isBlank()) verseRef else "${activeDay.scriptureRef}; $verseRef"
                    val updatedReflection = if (isMarkdownQuote) {
                        if (activeDay.reflectionText.isBlank()) {
                            "> \"$verseText\"\n— *$verseRef*\n\n"
                        } else {
                            "${activeDay.reflectionText}\n\n> \"$verseText\"\n— *$verseRef*\n\n"
                        }
                    } else {
                        activeDay.reflectionText
                    }
                    viewModel.updateDayEntry(
                        activeDay.copy(
                            scriptureRef = updatedRef,
                            reflectionText = updatedReflection
                        )
                    )
                    Toast.makeText(context, "Cita agregada: $verseRef 📖", Toast.LENGTH_SHORT).show()
                }
                showBibleDialog = false
            }
        )
    }

    // 10. Full Bible Reader Dialog
    if (showFullBibleReaderDialog) {
        val activeDay = currentWeekWithDays?.days?.find { it.dayNumber == selectedDayNumber }
            ?: currentWeekWithDays?.days?.firstOrNull()

        R07FullBibleReaderDialog(
            downloadProgress = bibleDownloadProgress,
            rvrDownloadedCount = rvrDownloadedCount,
            ntvDownloadedCount = ntvDownloadedCount,
            onDismiss = { showFullBibleReaderDialog = false },
            onLoadChapter = { bookNum, chap, ver, callback ->
                viewModel.loadBibleChapter(bookNum, chap, ver, callback)
            },
            onDownloadTestament = { testament, ver ->
                viewModel.downloadTestament(testament, ver)
            },
            onDownloadEntireBible = { ver ->
                viewModel.downloadEntireBible(ver)
            },
            onSelectVerseForR07 = { citation, text ->
                if (activeDay != null) {
                    val updatedRef = if (activeDay.scriptureRef.isBlank()) citation else "${activeDay.scriptureRef}; $citation"
                    val updatedReflection = if (activeDay.reflectionText.isBlank()) {
                        "> \"$text\"\n— *$citation*\n\n"
                    } else {
                        "${activeDay.reflectionText}\n\n> \"$text\"\n— *$citation*\n\n"
                    }
                    viewModel.updateDayEntry(
                        activeDay.copy(
                            scriptureRef = updatedRef,
                            reflectionText = updatedReflection
                        )
                    )
                    Toast.makeText(context, "Versículo añadido a tu R07: $citation 📖", Toast.LENGTH_SHORT).show()
                }
                showFullBibleReaderDialog = false
            }
        )
    }

    // 11. Photo Scan OCR Dialog
    if (showScanDialog) {
        R07ScanPhotoDialog(
            scanState = scanPhotoUiState,
            currentDayNumber = selectedDayNumber,
            onDismiss = {
                showScanDialog = false
                viewModel.clearScanState()
            },
            onAddPhoto = { uri ->
                viewModel.addPhotoToScanState(uri)
            },
            onRemovePhoto = { uri ->
                viewModel.removePhotoFromScanState(uri)
            },
            onProcessMultiPhotos = { uris, targetDay ->
                viewModel.processMultiPagePhotosForOcr(context, uris, targetDay)
            },
            onApplyScannedEntry = { scannedEntry, targetDay ->
                viewModel.applyScannedEntry(scannedEntry, targetDay)
                showScanDialog = false
                viewModel.clearScanState()
            }
        )
    }

    // 12. PDF Export Dialog
    if (exportUiState.showSuccessDialog && currentWeekWithDays != null) {
        R07ExportDownloadDialog(
            weekWithDays = currentWeekWithDays!!,
            exportResult = exportUiState.result,
            leaderName = leaderName,
            leaderPhone = leaderPhone,
            leaderEmail = leaderEmail,
            onDismiss = { viewModel.dismissExportDialog() }
        )
    }
}

@Composable
private fun InspirationalVerseBanner(verse: String) {
    val colors = R07Theme.colors

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, colors.border.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
            .testTag("inspirational_verse_card"),
        shape = RoundedCornerShape(20.dp),
        color = colors.surface,
        shadowElevation = 1.dp
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(text = "✨", fontSize = 18.sp)
            Column {
                Text(
                    text = verse,
                    style = MaterialTheme.typography.bodyMedium,
                    fontStyle = FontStyle.Italic,
                    fontWeight = FontWeight.Medium,
                    color = colors.textPrimary,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "«Pasa tiempo Conmigo» • R07",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = colors.primary,
                    fontSize = 10.sp
                )
            }
        }
    }
}

@Composable
private fun ResourcesHubCard(
    onOpenBible: () -> Unit,
    onOpenFullBible: () -> Unit,
    onOpenGuide: () -> Unit,
    onOpenScan: () -> Unit,
    onOpenEditionSettings: () -> Unit,
    onOpenLeaderSettings: () -> Unit,
    leaderName: String,
    onExportPdf: () -> Unit,
    onGenerateAiSummary: () -> Unit,
    onDeleteWeek: () -> Unit
) {
    val colors = R07Theme.colors

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(26.dp))
            .testTag("resources_hub_card"),
        shape = RoundedCornerShape(26.dp),
        color = colors.surface,
        shadowElevation = 2.dp
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = "CENTRO DE RECURSOS Y AJUSTES",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Black,
                color = colors.textPrimary,
                letterSpacing = 0.5.sp
            )
            Text(
                text = "Herramientas de apoyo devocional, IA y personalización",
                style = MaterialTheme.typography.bodySmall,
                color = colors.textSecondary,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Resource 1: Perfil & Comunidad
            ResourceActionTile(
                icon = Icons.Default.Person,
                title = if (leaderName.isNotBlank()) "Líder Asignado: $leaderName" else "Mi Perfil & Grupo",
                subtitle = "Nombre, edad, grupo de conexión y líder espiritual",
                onClick = onOpenLeaderSettings,
                badge = if (leaderName.isNotBlank()) "Configurado" else "Perfil"
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Resource 2: Santa Biblia Completa
            ResourceActionTile(
                icon = Icons.Default.MenuBook,
                title = "Santa Biblia Completa (66 Libros)",
                subtitle = "Reina Valera 1960 y NTV • Antiguo y Nuevo Testamento",
                onClick = onOpenFullBible,
                badge = "Leer / Descargar"
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Resource 3: Resumen con IA para Líder
            ResourceActionTile(
                icon = Icons.Default.AutoAwesome,
                title = "Resumen Pastoral con IA",
                subtitle = "Genera un reporte de rendición de cuentas para tu líder",
                onClick = onGenerateAiSummary,
                badge = "Reporte IA ✨"
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Resource 4: Personalización de Tema
            ResourceActionTile(
                icon = Icons.Default.Palette,
                title = "Personalizar Tema y Colores",
                subtitle = "Modo Claro/Oscuro, 7 Paletas Pasteles con Máxima Legibilidad",
                onClick = onOpenEditionSettings,
                badge = "Ajustar"
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Resource 5: Buscar en la Biblia
            ResourceActionTile(
                icon = Icons.Default.Search,
                title = "Buscador Rápido de Citas",
                subtitle = "Reina Valera 1960 • Nueva Traducción Viviente",
                onClick = onOpenBible,
                badge = "Citar"
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Resource 6: Escanear hoja con IA
            ResourceActionTile(
                icon = Icons.Default.CameraAlt,
                title = "Escanear Cuaderno Físico con IA",
                subtitle = "Toma fotos a tus hojas de papel para transcribirlas",
                onClick = onOpenScan,
                badge = "Escanear"
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Resource 7: Guía de Devocional R07
            ResourceActionTile(
                icon = Icons.Default.Spa,
                title = "¿Cómo hacer tu R07?",
                subtitle = "Guía paso a paso «Pasa tiempo Conmigo»",
                onClick = onOpenGuide,
                badge = "Ver Guía"
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Resource 8: Exportar PDF
            ResourceActionTile(
                icon = Icons.Default.PictureAsPdf,
                title = "Descargar Formato Semanal en PDF",
                subtitle = "Genera el reporte oficial de 7 días listo para compartir",
                onClick = onExportPdf,
                badge = "Descargar"
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Resource 9: Eliminar Semana
            ResourceActionTile(
                icon = Icons.Default.DeleteOutline,
                title = "Eliminar Semana Actual",
                subtitle = "Borrar esta semana y sus registros diarios",
                onClick = onDeleteWeek,
                badge = "Eliminar",
                isDestructive = true
            )
        }
    }
}

@Composable
private fun ResourceActionTile(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    badge: String,
    isDestructive: Boolean = false
) {
    val colors = R07Theme.colors
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = if (isDestructive) Color(0xFFFFEBEE) else colors.background.copy(alpha = 0.5f),
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .border(
                1.dp,
                if (isDestructive) Color(0xFFFFCDD2) else colors.border.copy(alpha = 0.4f),
                RoundedCornerShape(14.dp)
            )
            .clickable { onClick() }
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(if (isDestructive) Color(0xFFFFCDD2) else colors.primaryContainer)
                        .border(1.dp, if (isDestructive) Color(0xFFEF9A9A) else colors.border.copy(alpha = 0.4f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = if (isDestructive) Color(0xFFC62828) else colors.primary,
                        modifier = Modifier.size(16.dp)
                    )
                }

                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = if (isDestructive) Color(0xFFC62828) else colors.textPrimary,
                        fontSize = 13.sp
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isDestructive) Color(0xFFB71C1C) else colors.textSecondary,
                        fontSize = 10.sp
                    )
                }
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (isDestructive) Color(0xFFC62828) else colors.primary
            ) {
                Text(
                    text = badge,
                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.dp),
                    style = MaterialTheme.typography.labelSmall,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}
