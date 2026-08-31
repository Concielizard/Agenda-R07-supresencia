package com.example.ui

import android.app.Application
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.bible.BibleBookInfo
import com.example.data.bible.BibleService
import com.example.data.bible.BibleVerse
import com.example.data.bible.BibleVersion
import com.example.data.bible.FullChapterData
import com.example.data.local.AppColorPalette
import com.example.data.local.AppDatabase
import com.example.data.local.AppEdition
import com.example.data.local.AppPreferences
import com.example.data.local.AppThemeMode
import com.example.data.model.MEN_MOODS
import com.example.data.model.R07CommunityEntity
import com.example.data.model.R07DayEntryEntity
import com.example.data.model.R07FriendEntity
import com.example.data.model.R07Mood
import com.example.data.model.R07PrayerPetitionEntity
import com.example.data.model.R07WeekEntity
import com.example.data.model.R07WeeklyGoalEntity
import com.example.data.model.WOMEN_MOODS
import com.example.data.model.WeekWithDays
import com.example.data.remote.AiDevotionalInspiration
import com.example.data.remote.AiGuidedPrayerResponse
import com.example.data.remote.AiWeeklyLeaderSummary
import com.example.data.remote.GeminiDevotionalService
import com.example.data.remote.GeminiOcrService
import com.example.data.remote.ScannedR07Entry
import com.example.data.repository.BibleDownloadProgress
import com.example.data.repository.BibleRepository
import com.example.data.repository.R07Repository
import com.example.util.R07PdfExporter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class ExportUiState(
    val isExporting: Boolean = false,
    val result: R07PdfExporter.ExportResult? = null,
    val showSuccessDialog: Boolean = false
)

data class ScanPhotoUiState(
    val isScanning: Boolean = false,
    val selectedUris: List<Uri> = emptyList(),
    val scannedEntry: ScannedR07Entry? = null,
    val errorMessage: String? = null,
    val showScanDialog: Boolean = false,
    val targetDayNumber: Int = 1,
    val isMultiPageConfirmed: Boolean = false
)

data class AiInspirationUiState(
    val isLoading: Boolean = false,
    val inspiration: AiDevotionalInspiration? = null,
    val errorMessage: String? = null,
    val showDialog: Boolean = false
)

data class AiLeaderReportUiState(
    val isLoading: Boolean = false,
    val report: AiWeeklyLeaderSummary? = null,
    val errorMessage: String? = null,
    val showDialog: Boolean = false
)

data class AiPrayerGuidanceUiState(
    val isLoading: Boolean = false,
    val response: AiGuidedPrayerResponse? = null,
    val feelingInput: String = "",
    val dayNumber: Int = 1,
    val dayName: String = "",
    val scriptureRef: String = "",
    val currentMood: String = "",
    val errorMessage: String? = null,
    val showDialog: Boolean = false
)

class R07ViewModel(application: Application) : AndroidViewModel(application) {

    private val preferences: AppPreferences = AppPreferences.getInstance(application)
    val userEdition: StateFlow<AppEdition?> = preferences.selectedEdition
    val themeMode: StateFlow<AppThemeMode> = preferences.themeMode
    val colorPalette: StateFlow<AppColorPalette> = preferences.colorPalette
    val fontFamily: StateFlow<com.example.data.local.AppFontFamily> = preferences.fontFamily
    val logoTheme: StateFlow<com.example.data.local.AppLogoTheme> = preferences.logoTheme
    val logoSymbol: StateFlow<com.example.data.local.AppLogoSymbol> = preferences.logoSymbol
    val userPhotoUri: StateFlow<String> = preferences.userPhotoUri

    val isLoggedIn: StateFlow<Boolean> = preferences.isLoggedIn
    val authProvider: StateFlow<String> = preferences.authProvider
    val userFriendToken: StateFlow<String> = preferences.userFriendToken
    val communityToken: StateFlow<String> = preferences.communityToken
    val userBio: StateFlow<String> = preferences.userBio

    val leaderName: StateFlow<String> = preferences.leaderName
    val leaderPhone: StateFlow<String> = preferences.leaderPhone
    val leaderEmail: StateFlow<String> = preferences.leaderEmail

    val accountType: StateFlow<com.example.data.local.UserAccountType> = preferences.accountType
    val userName: StateFlow<String> = preferences.userName
    val userAge: StateFlow<String> = preferences.userAge
    val userAvatarEmoji: StateFlow<String> = preferences.userAvatarEmoji
    val userEmail: StateFlow<String> = preferences.userEmail
    val isGoogleConnected: StateFlow<Boolean> = preferences.isGoogleConnected
    val groupName: StateFlow<String> = preferences.groupName
    val churchName: StateFlow<String> = preferences.churchName

    fun saveUserProfile(
        name: String,
        age: String,
        avatar: String,
        email: String,
        accountType: com.example.data.local.UserAccountType,
        groupName: String,
        churchName: String,
        isGoogleConnected: Boolean = true
    ) {
        preferences.setUserProfile(
            name = name,
            age = age,
            avatar = avatar,
            email = email,
            accountType = accountType,
            groupName = groupName,
            churchName = churchName,
            isGoogleConnected = isGoogleConnected
        )
        _snackbarMessage.value = "Perfil de usuario actualizado con éxito ✨"
    }

    fun saveLeaderContact(name: String, phone: String, email: String) {
        preferences.setLeaderContact(name, phone, email)
        _snackbarMessage.value = "Contacto de líder guardado ✓"
    }

    fun saveLeaderContactInfo(name: String, phone: String, email: String) {
        saveLeaderContact(name, phone, email)
    }

    fun updateChurchAttendance(
        weekId: Long,
        attendedGroup: Boolean,
        groupLearnings: String,
        groupTopics: String,
        groupFeelings: String,
        groupAbsenceReason: String,
        attendedPrayer1: Boolean,
        prayer1Date: String,
        prayer1Notes: String,
        prayer1AbsenceReason: String,
        attendedPrayer2: Boolean,
        prayer2Date: String,
        prayer2Notes: String,
        prayer2AbsenceReason: String,
        attendedSunday: Boolean,
        sundayNotes: String
    ) {
        val current = currentWeekWithDays.value ?: return
        if (current.week.id == weekId) {
            val updatedWeek = current.week.copy(
                attendedGroup = attendedGroup,
                groupLearnings = groupLearnings,
                groupTopics = groupTopics,
                groupFeelings = groupFeelings,
                groupAbsenceReason = groupAbsenceReason,
                attendedPrayerDay1 = attendedPrayer1,
                prayerDay1Date = prayer1Date,
                prayerDay1Notes = prayer1Notes,
                prayerDay1AbsenceReason = prayer1AbsenceReason,
                attendedPrayerDay2 = attendedPrayer2,
                prayerDay2Date = prayer2Date,
                prayerDay2Notes = prayer2Notes,
                prayerDay2AbsenceReason = prayer2AbsenceReason,
                attendedSundayService = attendedSunday,
                sundayServiceNotes = sundayNotes,
                prayerAttendanceCount = (if (attendedPrayer1) 1 else 0) + (if (attendedPrayer2) 1 else 0)
            )
            updateWeekDetails(updatedWeek)
            _snackbarMessage.value = "Registro de comunidad y oración guardado ✓"
        }
    }

    fun startFirstWeek() {
        createNewWeek(
            title = "Semana 1 • Pasa tiempo Conmigo",
            readingGoal = "Salmos y Proverbios",
            verse = "«Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.» — Jeremías 33:3"
        )
    }

    private val repository: R07Repository
    private val bibleRepository: BibleRepository

    val allWeeksWithDays: StateFlow<List<WeekWithDays>>
    val allFriends: StateFlow<List<R07FriendEntity>>
    val allCommunities: StateFlow<List<R07CommunityEntity>>
    val allPrayerPetitions: StateFlow<List<R07PrayerPetitionEntity>>

    private val _selectedWeekId = MutableStateFlow<Long?>(null)
    val selectedWeekId: StateFlow<Long?> = _selectedWeekId.asStateFlow()

    private val _selectedDayNumber = MutableStateFlow<Int>(1)
    val selectedDayNumber: StateFlow<Int> = _selectedDayNumber.asStateFlow()

    private val _selectedBottomTab = MutableStateFlow<Int>(0)
    val selectedBottomTab: StateFlow<Int> = _selectedBottomTab.asStateFlow()

    private val _exportUiState = MutableStateFlow(ExportUiState())
    val exportUiState: StateFlow<ExportUiState> = _exportUiState.asStateFlow()

    private val _scanUiState = MutableStateFlow(ScanPhotoUiState())
    val scanUiState: StateFlow<ScanPhotoUiState> = _scanUiState.asStateFlow()
    val scanPhotoUiState: StateFlow<ScanPhotoUiState> = _scanUiState.asStateFlow()

    // AI Devotional Inspiration State
    private val _aiInspirationState = MutableStateFlow(AiInspirationUiState())
    val aiInspirationState: StateFlow<AiInspirationUiState> = _aiInspirationState.asStateFlow()

    // AI Weekly Leader Summary Report State
    private val _aiLeaderReportState = MutableStateFlow(AiLeaderReportUiState())
    val aiLeaderReportState: StateFlow<AiLeaderReportUiState> = _aiLeaderReportState.asStateFlow()

    // AI Prayer Guidance State
    private val _aiPrayerGuidanceState = MutableStateFlow(AiPrayerGuidanceUiState())
    val aiPrayerGuidanceState: StateFlow<AiPrayerGuidanceUiState> = _aiPrayerGuidanceState.asStateFlow()

    private val _snackbarMessage = MutableStateFlow<String?>(null)
    val snackbarMessage: StateFlow<String?> = _snackbarMessage.asStateFlow()

    // Bible offline state
    private val _bibleDownloadProgress = MutableStateFlow(BibleDownloadProgress())
    val bibleDownloadProgress: StateFlow<BibleDownloadProgress> = _bibleDownloadProgress.asStateFlow()

    val rvrDownloadedCount: StateFlow<Int>
    val ntvDownloadedCount: StateFlow<Int>

    val availableMoods: StateFlow<List<R07Mood>> = preferences.selectedEdition.map { edition ->
        if (edition == AppEdition.MEN) MEN_MOODS else WOMEN_MOODS
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = WOMEN_MOODS
    )

    fun setAppEdition(edition: AppEdition) {
        preferences.setEdition(edition)
        _snackbarMessage.value = "Cambiado a: ${edition.displayName} ${edition.icon}"
    }

    fun selectEdition(edition: AppEdition) {
        setAppEdition(edition)
    }

    fun setThemeMode(mode: AppThemeMode) {
        preferences.setThemeMode(mode)
        _snackbarMessage.value = "Tema: ${mode.displayName} ${mode.icon}"
    }

    fun setColorPalette(palette: AppColorPalette) {
        preferences.setPalette(palette)
        _snackbarMessage.value = "Paleta: ${palette.displayName} ${palette.icon}"
    }

    fun setFontFamily(fontFamily: com.example.data.local.AppFontFamily) {
        preferences.setFontFamily(fontFamily)
        _snackbarMessage.value = "Tipografía: ${fontFamily.displayName} ${fontFamily.icon}"
    }

    fun setLogoTheme(logoTheme: com.example.data.local.AppLogoTheme) {
        preferences.setLogoTheme(logoTheme)
        _snackbarMessage.value = "Estilo de Logo: ${logoTheme.displayName} ${logoTheme.icon}"
    }

    fun setLogoSymbol(logoSymbol: com.example.data.local.AppLogoSymbol) {
        preferences.setLogoSymbol(logoSymbol)
        _snackbarMessage.value = "Símbolo de Logo: ${logoSymbol.displayName} ${logoSymbol.symbolChar}"
    }

    fun setUserPhotoUri(uri: String) {
        preferences.setUserPhotoUri(uri)
        _snackbarMessage.value = "Foto de perfil actualizada con éxito 📸"
    }

    fun removeUserPhotoUri() {
        preferences.removeUserPhotoUri()
        _snackbarMessage.value = "Foto de perfil eliminada"
    }

    fun selectBottomTab(tabIndex: Int) {
        _selectedBottomTab.value = tabIndex
    }

    init {
        val db = AppDatabase.getDatabase(application, viewModelScope)
        repository = R07Repository(db.r07Dao())
        bibleRepository = BibleRepository(db.bibleDao())

        allWeeksWithDays = repository.allWeeksWithDays.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        allFriends = repository.allFriends.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        allCommunities = repository.allCommunities.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        allPrayerPetitions = repository.allPrayerPetitions.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        rvrDownloadedCount = bibleRepository.getDownloadedCountFlow(BibleVersion.RVR1960).stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = 0
        )

        ntvDownloadedCount = bibleRepository.getDownloadedCountFlow(BibleVersion.NTV).stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = 0
        )
    }

    fun loginWithGoogle(
        email: String = "juansantiagogonzalezmarin@gmail.com",
        name: String = "Juan Santiago González Marín",
        avatar: String = "🌸"
    ) {
        preferences.login("GOOGLE", name, email, avatar)
        _snackbarMessage.value = "Sesión iniciada con Google ($email) ✨"
    }

    fun loginWithApple(
        email: String = "usuario.icloud@icloud.com",
        name: String = "Santiago González",
        avatar: String = "🕊️"
    ) {
        preferences.login("ICLOUD", name, email, avatar)
        _snackbarMessage.value = "Sesión iniciada con Apple / iCloud ($email) "
    }

    fun loginWithEmail(
        email: String,
        name: String = "Miembro R07",
        avatar: String = "✨"
    ) {
        preferences.login("EMAIL", name, email, avatar)
        _snackbarMessage.value = "Sesión iniciada con Correo ($email) ✓"
    }

    fun logout() {
        preferences.logout()
        _snackbarMessage.value = "Has cerrado sesión correctamente"
    }

    fun regenerateUserFriendToken(name: String = ""): String {
        val prefix = if (name.isNotBlank()) name else userName.value
        val newToken = preferences.generateNewFriendToken(prefix)
        _snackbarMessage.value = "Nuevo Token Único generado: $newToken ✓"
        return newToken
    }

    fun connectFriendByToken(
        token: String,
        name: String,
        avatarEmoji: String = "🌸",
        churchOrGroup: String = "Comunidad de Fe",
        prayerRequest: String = "Orando por crecimiento espiritual y fidelidad"
    ) {
        viewModelScope.launch(Dispatchers.IO) {
            val cleanToken = token.trim().uppercase()
            val cleanName = if (name.isNotBlank()) name.trim() else "Amigo de Fe"
            repository.addFriend(
                token = cleanToken,
                name = cleanName,
                avatarEmoji = avatarEmoji,
                churchOrGroup = churchOrGroup,
                prayerRequest = prayerRequest
            )
            withContext(Dispatchers.Main) {
                _snackbarMessage.value = "¡Amigo conectado con éxito mediante token: $cleanToken! 🤝"
            }
        }
    }

    fun removeFriend(friendId: Long) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.removeFriend(friendId)
            withContext(Dispatchers.Main) {
                _snackbarMessage.value = "Amigo desconectado"
            }
        }
    }

    fun createOrJoinCommunity(
        token: String,
        name: String,
        churchName: String,
        leaderName: String = "",
        schedule: String = "Semanal",
        description: String = ""
    ) {
        viewModelScope.launch(Dispatchers.IO) {
            val cleanToken = token.trim().uppercase()
            repository.addOrJoinCommunity(
                token = cleanToken,
                name = name,
                churchName = churchName,
                leaderName = leaderName,
                schedule = schedule,
                description = description
            )
            preferences.setCommunityInfo(name, churchName, cleanToken)
            withContext(Dispatchers.Main) {
                _snackbarMessage.value = "Comunidad «$name» configurada con Token: $cleanToken ✨"
            }
        }
    }

    fun completeOnboarding(
        name: String,
        age: String,
        avatar: String,
        email: String,
        accountType: com.example.data.local.UserAccountType,
        groupName: String,
        churchName: String,
        edition: AppEdition,
        palette: AppColorPalette,
        initialFriendToken: String? = null,
        initialCommunityToken: String? = null
    ) {
        saveUserProfile(
            name = name,
            age = age,
            avatar = avatar,
            email = email,
            accountType = accountType,
            groupName = groupName,
            churchName = churchName,
            isGoogleConnected = authProvider.value.equals("GOOGLE", ignoreCase = true)
        )
        preferences.setEdition(edition)
        preferences.setPalette(palette)

        if (!initialFriendToken.isNullOrBlank()) {
            connectFriendByToken(
                token = initialFriendToken,
                name = "Amigo de Conexión",
                avatarEmoji = if (edition == AppEdition.MEN) "⚔️" else "🌸"
            )
        }

        if (!initialCommunityToken.isNullOrBlank() && accountType == com.example.data.local.UserAccountType.CONNECTION_GROUP) {
            createOrJoinCommunity(
                token = initialCommunityToken,
                name = groupName.ifBlank { "Mi Grupo de Conexión" },
                churchName = churchName.ifBlank { "Mi Iglesia" },
                leaderName = leaderName.value
            )
        }

        _snackbarMessage.value = "¡Bienvenido/a a tu Agenda Devocional R07! ✨"
    }

    val currentWeekWithDays: StateFlow<WeekWithDays?> = combine(
        allWeeksWithDays,
        _selectedWeekId
    ) { weeks, selectedId ->
        if (selectedId != null) {
            weeks.find { it.week.id == selectedId } ?: weeks.firstOrNull()
        } else {
            weeks.firstOrNull()
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = null
    )

    fun selectWeek(weekId: Long) {
        _selectedWeekId.value = weekId
    }

    fun selectDay(dayNumber: Int) {
        _selectedDayNumber.value = dayNumber
    }

    fun updateDayEntry(day: R07DayEntryEntity) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.updateDay(day.copy(updatedAt = System.currentTimeMillis()))
        }
    }

    fun setDayMood(day: R07DayEntryEntity, mood: R07Mood) {
        viewModelScope.launch(Dispatchers.IO) {
            val updated = day.copy(
                mood = mood.name,
                moodEmoji = mood.emoji,
                updatedAt = System.currentTimeMillis()
            )
            repository.updateDay(updated)
        }
    }

    // Weekly Goals management
    fun addWeeklyGoal(weekId: Long, title: String, category: String = "Espiritual") {
        if (title.isBlank()) return
        viewModelScope.launch(Dispatchers.IO) {
            repository.addGoal(weekId, title.trim(), category)
            _snackbarMessage.value = "¡Meta agregada a tu semana! 🎯"
        }
    }

    fun toggleGoalCompleted(goal: R07WeeklyGoalEntity) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.toggleGoalCompleted(goal)
        }
    }

    fun toggleGoalCompletion(goal: R07WeeklyGoalEntity) {
        toggleGoalCompleted(goal)
    }

    fun deleteWeeklyGoal(goalId: Long) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.deleteGoal(goalId)
            _snackbarMessage.value = "Meta eliminada."
        }
    }

    fun updateGoalCompleted(weekId: Long, completed: Boolean) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.updateGoalCompleted(weekId, completed)
        }
    }

    fun updateReadingGoal(weekId: Long, goal: String) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.updateReadingGoal(weekId, goal)
        }
    }

    fun incrementPrayerAttendance(weekId: Long, currentCount: Int) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.updatePrayerAttendance(weekId, currentCount + 1)
        }
    }

    fun decrementPrayerAttendance(weekId: Long, currentCount: Int) {
        if (currentCount > 0) {
            viewModelScope.launch(Dispatchers.IO) {
                repository.updatePrayerAttendance(weekId, currentCount - 1)
            }
        }
    }

    fun setPrayerAttendance(weekId: Long, count: Int) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.updatePrayerAttendance(weekId, count)
        }
    }

    fun updateWeekDetails(week: R07WeekEntity) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.updateWeek(week)
        }
    }

    fun updateChurchPrayerAttendance(
        weekId: Long,
        attendedPrayer1: Boolean,
        prayer1Date: String,
        prayer1Notes: String,
        prayer1AbsenceReason: String,
        attendedPrayer2: Boolean,
        prayer2Date: String,
        prayer2Notes: String,
        prayer2AbsenceReason: String
    ) {
        val current = currentWeekWithDays.value ?: return
        if (current.week.id == weekId) {
            val count = (if (attendedPrayer1) 1 else 0) + (if (attendedPrayer2) 1 else 0)
            val updated = current.week.copy(
                attendedPrayerDay1 = attendedPrayer1,
                prayerDay1Date = prayer1Date,
                prayerDay1Notes = prayer1Notes,
                prayerDay1AbsenceReason = prayer1AbsenceReason,
                attendedPrayerDay2 = attendedPrayer2,
                prayerDay2Date = prayer2Date,
                prayerDay2Notes = prayer2Notes,
                prayerDay2AbsenceReason = prayer2AbsenceReason,
                prayerAttendanceCount = count
            )
            updateWeekDetails(updated)
            _snackbarMessage.value = "Asistencia a tiempos de oración guardada 🙏"
        }
    }

    fun updateGroupAttendance(
        weekId: Long,
        attendedGroup: Boolean,
        groupLearnings: String,
        groupTopics: String,
        groupFeelings: String,
        groupAbsenceReason: String
    ) {
        val current = currentWeekWithDays.value ?: return
        if (current.week.id == weekId) {
            val updated = current.week.copy(
                attendedGroup = attendedGroup,
                groupLearnings = groupLearnings,
                groupTopics = groupTopics,
                groupFeelings = groupFeelings,
                groupAbsenceReason = groupAbsenceReason
            )
            updateWeekDetails(updated)
            _snackbarMessage.value = "Registro de grupo de conexión guardado ✓"
        }
    }

    fun updateSundayAttendance(
        weekId: Long,
        attendedSunday: Boolean,
        sundayNotes: String
    ) {
        val current = currentWeekWithDays.value ?: return
        if (current.week.id == weekId) {
            val updated = current.week.copy(
                attendedSundayService = attendedSunday,
                sundayServiceNotes = sundayNotes
            )
            updateWeekDetails(updated)
            _snackbarMessage.value = "Registro de servicio dominical guardado ⛪"
        }
    }

    fun createNewWeek(title: String, readingGoal: String, verse: String) {
        viewModelScope.launch(Dispatchers.IO) {
            val newId = repository.createNewWeek(
                title = title.ifBlank { "Semana Nueva R07" },
                readingGoal = readingGoal,
                verse = verse
            )
            _selectedWeekId.value = newId
            _selectedDayNumber.value = 1
            _snackbarMessage.value = "¡Nueva semana de R07 creada con éxito! ✨"
        }
    }

    fun deleteCurrentWeek(weekId: Long) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.deleteWeek(weekId)
            _selectedWeekId.value = null
            _selectedDayNumber.value = 1
            _snackbarMessage.value = "Semana eliminada correctamente."
        }
    }

    // AI Devotional Inspiration
    fun fetchAiDevotionalInspiration(day: R07DayEntryEntity) {
        _aiInspirationState.value = AiInspirationUiState(
            isLoading = true,
            showDialog = true,
            errorMessage = null
        )

        viewModelScope.launch(Dispatchers.IO) {
            val result = GeminiDevotionalService.getDevotionalInspiration(
                scriptureRef = day.scriptureRef,
                passageSnippet = "",
                mood = if (day.moodEmoji.isNotBlank()) "${day.moodEmoji} ${day.mood}" else day.mood,
                userNotes = day.reflectionText
            )

            result.onSuccess { inspiration ->
                _aiInspirationState.value = AiInspirationUiState(
                    isLoading = false,
                    inspiration = inspiration,
                    showDialog = true
                )
            }.onFailure { error ->
                _aiInspirationState.value = AiInspirationUiState(
                    isLoading = false,
                    errorMessage = error.localizedMessage ?: "Error al conectar con la IA",
                    showDialog = true
                )
            }
        }
    }

    fun applyAiInspirationToDay(
        day: R07DayEntryEntity,
        includeMessage: Boolean = true,
        includePrayer: Boolean = true,
        includeApp: Boolean = true
    ) {
        val insp = _aiInspirationState.value.inspiration ?: return
        val currentNotes = day.reflectionText.trim()
        val additions = StringBuilder()

        if (includeMessage && insp.mainMessage.isNotBlank()) {
            additions.append("📖 Mensaje clave: ${insp.mainMessage}\n\n")
        }
        if (includeApp && insp.practicalApplication.isNotBlank()) {
            additions.append("🎯 Aplicación práctica: ${insp.practicalApplication}\n\n")
        }
        if (includePrayer && insp.guidedPrayer.isNotBlank()) {
            additions.append("🙏 Oración guiada: ${insp.guidedPrayer}\n\n")
        }

        val newText = if (currentNotes.isBlank()) {
            additions.toString().trim()
        } else {
            "$currentNotes\n\n${additions.toString().trim()}"
        }

        updateDayEntry(day.copy(reflectionText = newText, isCompleted = true))
        _aiInspirationState.value = AiInspirationUiState(showDialog = false)
        _snackbarMessage.value = "¡Inspiración de IA añadida a tu diario de hoy! ✨"
    }

    fun dismissAiInspirationDialog() {
        _aiInspirationState.value = _aiInspirationState.value.copy(showDialog = false)
    }

    // AI Weekly Leader Summary
    fun generateAiWeeklyReport() {
        val current = currentWeekWithDays.value ?: return
        _aiLeaderReportState.value = AiLeaderReportUiState(
            isLoading = true,
            showDialog = true,
            errorMessage = null
        )

        viewModelScope.launch(Dispatchers.IO) {
            val result = GeminiDevotionalService.generateWeeklyLeaderReport(
                week = current.week,
                days = current.days,
                goals = current.goals
            )

            result.onSuccess { report ->
                _aiLeaderReportState.value = AiLeaderReportUiState(
                    isLoading = false,
                    report = report,
                    showDialog = true
                )
            }.onFailure { error ->
                _aiLeaderReportState.value = AiLeaderReportUiState(
                    isLoading = false,
                    errorMessage = error.localizedMessage ?: "Error al generar reporte con IA",
                    showDialog = true
                )
            }
        }
    }

    fun dismissAiLeaderReportDialog() {
        _aiLeaderReportState.value = _aiLeaderReportState.value.copy(showDialog = false)
    }

    // AI Guided Prayer Feature
    fun openAiPrayerGuidance(day: R07DayEntryEntity, initialFeeling: String = "") {
        _aiPrayerGuidanceState.value = AiPrayerGuidanceUiState(
            showDialog = true,
            isLoading = false,
            dayNumber = day.dayNumber,
            dayName = day.dayName,
            scriptureRef = day.scriptureRef,
            currentMood = if (day.moodEmoji.isNotBlank()) "${day.moodEmoji} ${day.mood}" else day.mood,
            feelingInput = initialFeeling,
            response = null,
            errorMessage = null
        )
    }

    fun generatePersonalizedPrayer(day: R07DayEntryEntity, feelingOrSituation: String) {
        _aiPrayerGuidanceState.value = _aiPrayerGuidanceState.value.copy(
            isLoading = true,
            feelingInput = feelingOrSituation,
            errorMessage = null
        )

        viewModelScope.launch(Dispatchers.IO) {
            val result = GeminiDevotionalService.generatePersonalizedPrayer(
                feelingOrSituation = feelingOrSituation,
                scriptureRef = day.scriptureRef,
                userName = userName.value
            )

            result.onSuccess { guidedPrayer ->
                _aiPrayerGuidanceState.value = _aiPrayerGuidanceState.value.copy(
                    isLoading = false,
                    response = guidedPrayer,
                    errorMessage = null
                )
            }.onFailure { error ->
                _aiPrayerGuidanceState.value = _aiPrayerGuidanceState.value.copy(
                    isLoading = false,
                    errorMessage = error.localizedMessage ?: "Error al conectar con la IA para guiar tu oración"
                )
            }
        }
    }

    fun applyGuidedPrayerToDay(day: R07DayEntryEntity, guidedPrayer: AiGuidedPrayerResponse) {
        // Retrieve existing blocks or parse them
        val blocks = com.example.data.model.DevotionalBlock.parseBlocksFromJson(day.blocksJson, day.reflectionText).toMutableList()
        val prayerIndex = blocks.indexOfFirst { it.type == com.example.data.model.DevotionalBlockType.PRAYER }

        val prayerTextToApply = if (guidedPrayer.fullPrayerText.isNotBlank()) {
            guidedPrayer.fullPrayerText
        } else {
            "🌸 Adoración: ${guidedPrayer.adoration}\n\n💭 Desahogo: ${guidedPrayer.confessionAndHonesty}\n\n🎯 Petición: ${guidedPrayer.petitionAndFaith}\n\n🕊️ Promesa: ${guidedPrayer.gratitudeAndDeclaration}"
        }

        if (prayerIndex >= 0) {
            val existing = blocks[prayerIndex]
            val mergedText = if (existing.text.isBlank()) prayerTextToApply else "${existing.text}\n\n$prayerTextToApply"
            blocks[prayerIndex] = existing.copy(text = mergedText)
        } else {
            blocks.add(com.example.data.model.DevotionalBlock(type = com.example.data.model.DevotionalBlockType.PRAYER, text = prayerTextToApply))
        }

        val updatedBlocksJson = com.example.data.model.DevotionalBlock.serializeBlocksToJson(blocks)
        val formattedPlain = com.example.data.model.DevotionalBlock.formatBlocksToPlainText(blocks)

        val updatedDay = day.copy(
            blocksJson = updatedBlocksJson,
            reflectionText = formattedPlain,
            updatedAt = System.currentTimeMillis()
        )

        updateDayEntry(updatedDay)
        _aiPrayerGuidanceState.value = _aiPrayerGuidanceState.value.copy(showDialog = false)
        _snackbarMessage.value = "¡Guía de oración aplicada a tu devocional de hoy! 🙏✨"
    }

    fun dismissAiPrayerGuidanceDialog() {
        _aiPrayerGuidanceState.value = _aiPrayerGuidanceState.value.copy(showDialog = false)
    }

    // Photo Scan & OCR Features (Multi-Page & Legibility Validation)
    fun openPhotoScanDialog(imageUri: Uri? = null, targetDay: Int = 1) {
        val initialList = if (imageUri != null) listOf(imageUri) else emptyList()
        _scanUiState.value = ScanPhotoUiState(
            showScanDialog = true,
            selectedUris = initialList,
            targetDayNumber = targetDay,
            isMultiPageConfirmed = false,
            scannedEntry = null,
            errorMessage = null
        )
    }

    fun addPhotoUri(uri: Uri) {
        val current = _scanUiState.value.selectedUris.toMutableList()
        if (!current.contains(uri)) {
            current.add(uri)
            _scanUiState.value = _scanUiState.value.copy(
                selectedUris = current,
                errorMessage = null
            )
        }
    }

    fun addPhotoToScanState(uri: Uri) {
        addPhotoUri(uri)
    }

    fun removePhotoUri(uri: Uri) {
        val current = _scanUiState.value.selectedUris.toMutableList()
        current.remove(uri)
        _scanUiState.value = _scanUiState.value.copy(
            selectedUris = current
        )
    }

    fun removePhotoFromScanState(uri: Uri) {
        removePhotoUri(uri)
    }

    fun setMultiPageConfirmed(confirmed: Boolean) {
        _scanUiState.value = _scanUiState.value.copy(isMultiPageConfirmed = confirmed)
    }

    fun dismissPhotoScanDialog() {
        _scanUiState.value = ScanPhotoUiState(showScanDialog = false)
    }

    fun clearScanState() {
        dismissPhotoScanDialog()
    }

    fun processPhotoForOcr(context: Context, uri: Uri, targetDayNumber: Int) {
        addPhotoUri(uri)
        processMultiPagePhotosForOcr(context, listOf(uri), targetDayNumber)
    }

    fun processMultiPagePhotosForOcr(context: Context, uris: List<Uri>, targetDayNumber: Int) {
        if (uris.isEmpty()) {
            _scanUiState.value = _scanUiState.value.copy(
                errorMessage = "Por favor selecciona al menos una foto de tu cuaderno."
            )
            return
        }

        viewModelScope.launch(Dispatchers.IO) {
            _scanUiState.value = _scanUiState.value.copy(
                isScanning = true,
                selectedUris = uris,
                errorMessage = null
            )

            val bitmaps = mutableListOf<Bitmap>()
            uris.forEach { uri ->
                val bmp = GeminiOcrService.loadScaledBitmap(context, uri)
                if (bmp != null) bitmaps.add(bmp)
            }

            if (bitmaps.isEmpty()) {
                _scanUiState.value = _scanUiState.value.copy(
                    isScanning = false,
                    errorMessage = "No se pudieron cargar las fotos seleccionadas."
                )
                return@launch
            }

            val uriStrings = uris.map { it.toString() }
            val result = GeminiOcrService.interpretMultiPageR07Photos(bitmaps, targetDayNumber, uriStrings)
            result.onSuccess { entry ->
                _scanUiState.value = _scanUiState.value.copy(
                    isScanning = false,
                    scannedEntry = entry,
                    errorMessage = null
                )
            }.onFailure { err ->
                _scanUiState.value = _scanUiState.value.copy(
                    isScanning = false,
                    errorMessage = err.localizedMessage ?: "Error al interpretar las fotos con IA"
                )
            }
        }
    }

    fun applyScannedEntryToDay(entry: ScannedR07Entry, targetDayNumber: Int? = null) {
        viewModelScope.launch(Dispatchers.IO) {
            var current = currentWeekWithDays.value
            if (current == null) {
                val all = allWeeksWithDays.value
                val weekId = if (all.isNotEmpty()) all.first().week.id else repository.createNewWeek("Semana 1 • Pasa tiempo Conmigo", "Salmos y Proverbios", "«Pasa tiempo Conmigo y saciaré tu alma»")
                withContext(Dispatchers.Main) {
                    _selectedWeekId.value = weekId
                }
                current = repository.getWeekWithDaysById(weekId).firstOrNull()
            }
            val dayNum = targetDayNumber ?: if (entry.dayNumber in 1..7) entry.dayNumber else _selectedDayNumber.value
            val dayToUpdate = current?.days?.find { it.dayNumber == dayNum }
                ?: current?.days?.firstOrNull()

            if (dayToUpdate == null) {
                withContext(Dispatchers.Main) {
                    _snackbarMessage.value = "No se pudo encontrar el día $dayNum para guardar."
                }
                return@launch
            }

            // Build structured blocks & reflection text
            val structuredBlocks = mutableListOf<com.example.data.model.DevotionalBlock>()
            if (entry.godSpoke.isNotBlank()) {
                structuredBlocks.add(com.example.data.model.DevotionalBlock(type = com.example.data.model.DevotionalBlockType.GOD_SPOKE, text = entry.godSpoke))
            }
            if (entry.reflectionText.isNotBlank()) {
                structuredBlocks.add(com.example.data.model.DevotionalBlock(type = com.example.data.model.DevotionalBlockType.REFLECTION, text = entry.reflectionText))
            }
            if (entry.actionStep.isNotBlank()) {
                structuredBlocks.add(com.example.data.model.DevotionalBlock(type = com.example.data.model.DevotionalBlockType.ACTION_STEP, text = entry.actionStep))
            }
            if (entry.prayerText.isNotBlank()) {
                structuredBlocks.add(com.example.data.model.DevotionalBlock(type = com.example.data.model.DevotionalBlockType.PRAYER, text = entry.prayerText))
            }

            val blocksJson = if (structuredBlocks.isNotEmpty()) {
                com.example.data.model.DevotionalBlock.serializeBlocksToJson(structuredBlocks)
            } else dayToUpdate.blocksJson

            val plainReflection = if (structuredBlocks.isNotEmpty()) {
                com.example.data.model.DevotionalBlock.formatBlocksToPlainText(structuredBlocks)
            } else if (entry.fullTranscription.isNotBlank()) {
                entry.fullTranscription
            } else if (entry.reflectionText.isNotBlank()) {
                entry.reflectionText
            } else dayToUpdate.reflectionText

            // Serialize photo URIs into JSON
            val photoUrisJson = if (entry.photoUris.isNotEmpty()) {
                org.json.JSONArray(entry.photoUris).toString()
            } else if (_scanUiState.value.selectedUris.isNotEmpty()) {
                org.json.JSONArray(_scanUiState.value.selectedUris.map { it.toString() }).toString()
            } else dayToUpdate.photoUrisJson

            val updatedDay = dayToUpdate.copy(
                timeText = if (entry.timeText.isNotBlank()) entry.timeText else if (dayToUpdate.timeText.isNotBlank()) dayToUpdate.timeText else "07:00 AM",
                scriptureRef = if (entry.scriptureRef.isNotBlank()) entry.scriptureRef else dayToUpdate.scriptureRef,
                reflectionText = plainReflection,
                blocksJson = blocksJson,
                photoUrisJson = photoUrisJson,
                mood = if (entry.mood.isNotBlank()) entry.mood else dayToUpdate.mood,
                moodEmoji = if (entry.moodEmoji.isNotBlank()) entry.moodEmoji else dayToUpdate.moodEmoji,
                isCompleted = true,
                updatedAt = System.currentTimeMillis()
            )

            repository.updateDay(updatedDay)

            withContext(Dispatchers.Main) {
                _selectedDayNumber.value = dayToUpdate.dayNumber
                _scanUiState.value = ScanPhotoUiState(showScanDialog = false)
                _snackbarMessage.value = "¡Devocional manuscrito guardado en el Día ${dayToUpdate.dayNumber}! ✨"
            }
        }
    }

    fun applyScannedEntry(entry: ScannedR07Entry, targetDayNumber: Int? = null) {
        applyScannedEntryToDay(entry, targetDayNumber)
    }

    // Prayer Petitions management
    fun addPrayerPetition(title: String, description: String = "", category: String = "Personal") {
        viewModelScope.launch(Dispatchers.IO) {
            repository.addPrayerPetition(title, description, category)
            withContext(Dispatchers.Main) {
                _snackbarMessage.value = "Petición agregada a tu diario de oración 🙏"
            }
        }
    }

    fun togglePrayerPetitionAnswered(petition: R07PrayerPetitionEntity, testimony: String = "") {
        viewModelScope.launch(Dispatchers.IO) {
            repository.togglePrayerPetitionAnswered(petition, testimony)
            withContext(Dispatchers.Main) {
                _snackbarMessage.value = if (!petition.isAnswered) "¡Gloria a Dios! Marcada como contestada 🎉" else "Petición en oración activa 🙏"
            }
        }
    }

    fun incrementPetitionPrayerCount(petition: R07PrayerPetitionEntity) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.incrementPetitionPrayerCount(petition.id)
            withContext(Dispatchers.Main) {
                _snackbarMessage.value = "¡Oración registrada por: ${petition.title.take(24)}...! 🙏 (+1)"
            }
        }
    }

    fun deletePrayerPetition(petitionId: Long) {
        viewModelScope.launch(Dispatchers.IO) {
            repository.deletePrayerPetition(petitionId)
            withContext(Dispatchers.Main) {
                _snackbarMessage.value = "Petición eliminada"
            }
        }
    }

    // PDF Export
    fun exportCurrentWeekPdf(context: Context, onReadyToShare: Boolean = false) {
        val current = currentWeekWithDays.value ?: return
        _exportUiState.value = ExportUiState(isExporting = true)

        viewModelScope.launch(Dispatchers.IO) {
            val result = R07PdfExporter.generateR07Pdf(
                context = context,
                week = current.week,
                days = current.days,
                goals = current.goals,
                edition = userEdition.value ?: AppEdition.WOMEN,
                leaderName = leaderName.value,
                includePhotos = true
            )
            _exportUiState.value = ExportUiState(
                isExporting = false,
                result = result,
                showSuccessDialog = true
            )
            if (result.success && onReadyToShare) {
                withContext(Dispatchers.Main) {
                    R07PdfExporter.sharePdf(context, result)
                }
            }
        }
    }

    fun shareToLeaderWhatsApp(context: Context) {
        val current = currentWeekWithDays.value ?: return
        val phone = leaderPhone.value
        val result = _exportUiState.value.result
        if (result == null || !result.success) {
            exportCurrentWeekPdf(context)
            return
        }
        val summaryText = R07PdfExporter.generateFormattedTextSummary(
            week = current.week,
            days = current.days,
            goals = current.goals,
            leaderName = leaderName.value
        )
        R07PdfExporter.shareToWhatsApp(context, phone, result, summaryText)
    }

    fun shareToLeaderEmail(context: Context) {
        val current = currentWeekWithDays.value ?: return
        val email = leaderEmail.value
        val result = _exportUiState.value.result
        if (result == null || !result.success) {
            exportCurrentWeekPdf(context)
            return
        }
        val subject = "Devocional R07 Semanal • ${current.week.title}"
        val body = R07PdfExporter.generateFormattedTextSummary(
            week = current.week,
            days = current.days,
            goals = current.goals,
            leaderName = leaderName.value
        )
        R07PdfExporter.shareToEmail(context, email, result, subject, body)
    }

    fun dismissExportDialog() {
        _exportUiState.value = _exportUiState.value.copy(showSuccessDialog = false)
    }

    // Bible Operations
    fun loadBibleChapter(
        bookNumber: Int,
        chapter: Int,
        version: BibleVersion,
        onResult: (FullChapterData) -> Unit
    ) {
        viewModelScope.launch {
            val data = bibleRepository.loadChapter(bookNumber, chapter, version)
            withContext(Dispatchers.Main) {
                onResult(data)
            }
        }
    }

    fun getAndCacheBibleVerse(
        bookName: String,
        chapter: Int,
        verse: Int,
        version: BibleVersion,
        onResult: (BibleVerse) -> Unit
    ) {
        viewModelScope.launch {
            val res = bibleRepository.getAndCacheVerse(bookName, chapter, verse, version)
            withContext(Dispatchers.Main) {
                onResult(res)
            }
        }
    }

    fun downloadSingleChapter(
        bookNumber: Int,
        chapter: Int,
        version: BibleVersion,
        onResult: ((FullChapterData) -> Unit)? = null
    ) {
        viewModelScope.launch {
            val book = BibleService.getBookByNumber(bookNumber)
            val res = bibleRepository.downloadSingleChapter(bookNumber, chapter, version)
            withContext(Dispatchers.Main) {
                _snackbarMessage.value = "¡${book?.name ?: "Capítulo"} $chapter guardado para uso offline! 📖"
                onResult?.invoke(res)
            }
        }
    }

    fun downloadTestament(testament: String, version: BibleVersion) {
        if (_bibleDownloadProgress.value.isDownloading) {
            _snackbarMessage.value = "Ya hay una descarga bíblica en curso..."
            return
        }

        val books = BibleService.all66Books.filter { it.testament.equals(testament, ignoreCase = true) }
        viewModelScope.launch {
            bibleRepository.downloadBooksRange(books, version) { progress ->
                _bibleDownloadProgress.value = progress
            }
            _snackbarMessage.value = "¡$testament (${version.displayName}) guardado en tu dispositivo!"
        }
    }

    fun downloadEntireBible(version: BibleVersion) {
        if (_bibleDownloadProgress.value.isDownloading) {
            _snackbarMessage.value = "Ya hay una descarga bíblica en curso..."
            return
        }

        val allBooks = BibleService.all66Books
        viewModelScope.launch {
            bibleRepository.downloadBooksRange(allBooks, version) { progress ->
                _bibleDownloadProgress.value = progress
            }
            _snackbarMessage.value = "¡Toda la Biblia (${version.displayName}) ha sido descargada 100% offline!"
        }
    }

    fun cancelOrDismissDownloadBanner() {
        _bibleDownloadProgress.value = BibleDownloadProgress()
    }

    fun clearSnackbar() {
        _snackbarMessage.value = null
    }
}


