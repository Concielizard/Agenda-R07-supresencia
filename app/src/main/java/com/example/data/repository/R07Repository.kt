package com.example.data.repository

import com.example.data.local.R07Dao
import com.example.data.model.R07CommunityEntity
import com.example.data.model.R07DayEntryEntity
import com.example.data.model.R07FriendEntity
import com.example.data.model.R07PrayerPetitionEntity
import com.example.data.model.R07WeekEntity
import com.example.data.model.R07WeeklyGoalEntity
import com.example.data.model.WeekWithDays
import kotlinx.coroutines.flow.Flow
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class R07Repository(private val dao: R07Dao) {

    val allWeeksWithDays: Flow<List<WeekWithDays>> = dao.getAllWeeksWithDays()
    val allFriends: Flow<List<R07FriendEntity>> = dao.getAllFriends()
    val allCommunities: Flow<List<R07CommunityEntity>> = dao.getAllCommunities()
    val allPrayerPetitions: Flow<List<R07PrayerPetitionEntity>> = dao.getAllPrayerPetitions()

    fun getWeekWithDaysById(weekId: Long): Flow<WeekWithDays?> {
        return dao.getWeekWithDaysById(weekId)
    }

    suspend fun createNewWeek(
        title: String,
        readingGoal: String,
        verse: String,
        startDateCalendar: Calendar = Calendar.getInstance()
    ): Long {
        val cal = startDateCalendar.clone() as Calendar
        val sdfFull = SimpleDateFormat("d 'de' MMMM", Locale("es", "ES"))
        val sdfShort = SimpleDateFormat("d MMM", Locale("es", "ES"))

        val startStr = sdfFull.format(cal.time)
        val endCal = cal.clone() as Calendar
        endCal.add(Calendar.DAY_OF_YEAR, 6)
        val endStr = sdfFull.format(endCal.time)

        val newWeek = R07WeekEntity(
            title = title,
            startDate = startStr,
            endDate = endStr,
            readingGoal = readingGoal,
            isGoalCompleted = false,
            prayerAttendanceCount = 0,
            verseOfTheWeek = if (verse.isNotBlank()) verse else "«Pasa tiempo Conmigo y renovaré tus fuerzas»",
            generalNotes = ""
        )

        val weekId = dao.insertWeek(newWeek)

        val dayNames = listOf("Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo")
        val days = mutableListOf<R07DayEntryEntity>()
        val dayRunner = cal.clone() as Calendar

        for (i in 0 until 7) {
            days.add(
                R07DayEntryEntity(
                    weekId = weekId,
                    dayNumber = i + 1,
                    dayName = dayNames[i],
                    dateText = sdfShort.format(dayRunner.time),
                    timeText = "07:00 AM",
                    scriptureRef = "",
                    reflectionText = "",
                    mood = "",
                    moodEmoji = "",
                    isCompleted = false
                )
            )
            dayRunner.add(Calendar.DAY_OF_YEAR, 1)
        }

        dao.insertDays(days)

        // Add 3 default starter goals for the week
        val starterGoals = listOf(
            R07WeeklyGoalEntity(
                weekId = weekId,
                title = "Completar mi R07 los 7 días",
                category = "Hábito",
                isCompleted = false
            ),
            R07WeeklyGoalEntity(
                weekId = weekId,
                title = if (readingGoal.isNotBlank()) "Avanzar en meta: $readingGoal" else "Lectura bíblica diaria",
                category = "Lectura",
                isCompleted = false
            ),
            R07WeeklyGoalEntity(
                weekId = weekId,
                title = "Asistir al grupo o tiempo de oración",
                category = "Oración",
                isCompleted = false
            )
        )
        dao.insertGoals(starterGoals)

        return weekId
    }

    suspend fun updateWeek(week: R07WeekEntity) {
        dao.updateWeek(week)
    }

    suspend fun updateDay(day: R07DayEntryEntity) {
        dao.updateDay(day)
    }

    suspend fun updatePrayerAttendance(weekId: Long, count: Int) {
        dao.updatePrayerAttendance(weekId, count.coerceAtLeast(0))
    }

    suspend fun updateGoalCompleted(weekId: Long, completed: Boolean) {
        dao.updateGoalCompleted(weekId, completed)
    }

    suspend fun updateReadingGoal(weekId: Long, goal: String) {
        dao.updateReadingGoal(weekId, goal)
    }

    suspend fun addGoal(weekId: Long, title: String, category: String = "Espiritual"): Long {
        return dao.insertGoal(
            R07WeeklyGoalEntity(
                weekId = weekId,
                title = title,
                category = category,
                isCompleted = false
            )
        )
    }

    suspend fun toggleGoalCompleted(goal: R07WeeklyGoalEntity) {
        dao.updateGoal(goal.copy(isCompleted = !goal.isCompleted))
    }

    suspend fun deleteGoal(goalId: Long) {
        dao.deleteGoal(goalId)
    }

    suspend fun deleteWeek(weekId: Long) {
        dao.deleteGoalsForWeek(weekId)
        dao.deleteDaysForWeek(weekId)
        dao.deleteWeek(weekId)
    }

    // Friends operations
    suspend fun addFriend(
        token: String,
        name: String,
        avatarEmoji: String = "🌸",
        churchOrGroup: String = "Comunidad de Fe",
        prayerRequest: String = "Orando por crecimiento espiritual y fidelidad"
    ): Long {
        val existing = dao.getFriendByToken(token.trim())
        if (existing != null) {
            return existing.id
        }
        val friend = R07FriendEntity(
            friendToken = token.trim().uppercase(),
            name = name.trim(),
            avatarEmoji = avatarEmoji,
            churchOrGroup = churchOrGroup.trim(),
            currentStreak = (1..7).random(),
            lastDevotionalDate = "Hoy",
            prayerRequest = prayerRequest.trim()
        )
        return dao.insertFriend(friend)
    }

    suspend fun removeFriend(friendId: Long) {
        dao.deleteFriend(friendId)
    }

    suspend fun updateFriend(friend: R07FriendEntity) {
        dao.updateFriend(friend)
    }

    // Community operations
    suspend fun addOrJoinCommunity(
        token: String,
        name: String,
        churchName: String,
        leaderName: String = "",
        schedule: String = "Semanal",
        description: String = ""
    ): Long {
        val existing = dao.getCommunityByToken(token.trim())
        if (existing != null) {
            dao.updateCommunity(existing.copy(isMyCommunity = true))
            return existing.id
        }
        val community = R07CommunityEntity(
            communityToken = token.trim().uppercase(),
            name = name.trim(),
            churchName = churchName.trim(),
            leaderName = leaderName.trim(),
            meetingSchedule = schedule.trim(),
            description = description.trim(),
            memberCount = (5..15).random(),
            isMyCommunity = true
        )
        return dao.insertCommunity(community)
    }

    suspend fun removeCommunity(communityId: Long) {
        dao.deleteCommunity(communityId)
    }

    // Prayer Petitions
    suspend fun addPrayerPetition(
        title: String,
        description: String = "",
        category: String = "Personal"
    ): Long {
        val petition = R07PrayerPetitionEntity(
            title = title.trim(),
            description = description.trim(),
            category = category.trim(),
            isAnswered = false,
            prayerCount = 1
        )
        return dao.insertPrayerPetition(petition)
    }

    suspend fun updatePrayerPetition(petition: R07PrayerPetitionEntity) {
        dao.updatePrayerPetition(petition)
    }

    suspend fun deletePrayerPetition(petitionId: Long) {
        dao.deletePrayerPetition(petitionId)
    }

    suspend fun togglePrayerPetitionAnswered(
        petition: R07PrayerPetitionEntity,
        testimony: String = ""
    ) {
        val sdf = SimpleDateFormat("d MMM yyyy", Locale("es", "ES"))
        val todayStr = sdf.format(System.currentTimeMillis())
        val newAnswered = !petition.isAnswered
        dao.updatePrayerPetition(
            petition.copy(
                isAnswered = newAnswered,
                answeredDate = if (newAnswered) todayStr else "",
                testimonyNote = if (newAnswered && testimony.isNotBlank()) testimony else if (newAnswered) petition.testimonyNote else ""
            )
        )
    }

    suspend fun incrementPetitionPrayerCount(petitionId: Long) {
        dao.incrementPetitionPrayerCount(petitionId)
    }
}

