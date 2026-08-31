package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.model.BibleChapterEntity
import com.example.data.model.R07CommunityEntity
import com.example.data.model.R07DayEntryEntity
import com.example.data.model.R07FriendEntity
import com.example.data.model.R07PrayerPetitionEntity
import com.example.data.model.R07WeekEntity
import com.example.data.model.R07WeeklyGoalEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

@Database(
    entities = [
        R07WeekEntity::class,
        R07DayEntryEntity::class,
        R07WeeklyGoalEntity::class,
        BibleChapterEntity::class,
        R07FriendEntity::class,
        R07CommunityEntity::class,
        R07PrayerPetitionEntity::class
    ],
    version = 7,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun r07Dao(): R07Dao
    abstract fun bibleDao(): BibleDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "r07_agenda_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }

        suspend fun populateInitialData(dao: R07Dao) {
            val cal = Calendar.getInstance()
            // Find current Monday
            cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
            val sdf = SimpleDateFormat("d MMM", Locale("es", "ES"))
            val sdfFull = SimpleDateFormat("d 'de' MMMM", Locale("es", "ES"))

            val startCal = cal.clone() as Calendar
            val startDateStr = sdfFull.format(startCal.time)
            
            cal.add(Calendar.DAY_OF_YEAR, 6)
            val endDateStr = sdfFull.format(cal.time)

            val initialWeek = R07WeekEntity(
                title = "Semana 1 • Pasa tiempo Conmigo",
                startDate = startDateStr,
                endDate = endDateStr,
                readingGoal = "Salmos 23 al 30 & Proverbios 3",
                isGoalCompleted = false,
                prayerAttendanceCount = 3,
                verseOfTheWeek = "«Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.» — Jeremías 33:3",
                generalNotes = "Esta semana decido apartar mi tiempo a solas con Dios con corazón dispuesto."
            )

            val weekId = dao.insertWeek(initialWeek)

            val dayNames = listOf(
                "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"
            )
            val sampleScriptures = listOf(
                "Salmos 23:1-6",
                "Salmos 27:1-8",
                "Proverbios 3:5-8",
                "Isaías 40:29-31",
                "Filipenses 4:6-7",
                "Sofonías 3:17",
                "Salmos 103:1-5"
            )
            val sampleReflections = listOf(
                "Dios me recordó hoy que Él es mi pastor y nada me faltará. Aunque sienta incertidumbre en el trabajo y el hogar, en lugares de delicados pastos me hará descansar. Mi oración: Señor, descanso en tu fidelidad.",
                "El Señor es mi luz y mi salvación, ¿de quién temeré? Me propongo no escuchar voces de ansiedad hoy.",
                "Fíate de Jehová de todo tu corazón y no te apoyes en tu propia prudencia. Decido entregarle mis planes.",
                "",
                "",
                "",
                ""
            )
            val sampleMoods = listOf("Agradecida", "En Paz", "Confiada", "", "", "", "")
            val sampleMoodEmojis = listOf("🌸", "🕊️", "🌿", "", "", "", "")
            val sampleTimes = listOf("06:30 AM", "07:00 AM", "06:45 AM", "07:00 AM", "07:15 AM", "08:00 AM", "08:30 AM")

            val dayEntries = mutableListOf<R07DayEntryEntity>()
            val dayCal = startCal.clone() as Calendar
            for (i in 0 until 7) {
                val dayDate = sdf.format(dayCal.time)
                dayEntries.add(
                    R07DayEntryEntity(
                        weekId = weekId,
                        dayNumber = i + 1,
                        dayName = dayNames[i],
                        dateText = dayDate,
                        timeText = sampleTimes[i],
                        scriptureRef = sampleScriptures[i],
                        reflectionText = sampleReflections[i],
                        mood = sampleMoods[i],
                        moodEmoji = sampleMoodEmojis[i],
                        isCompleted = i < 2
                    )
                )
                dayCal.add(Calendar.DAY_OF_YEAR, 1)
            }

            dao.insertDays(dayEntries)

            // Seed initial weekly goals for women's devotional journey
            val initialGoals = listOf(
                R07WeeklyGoalEntity(
                    weekId = weekId,
                    title = "Completar mi R07 los 7 días sin falta",
                    category = "Hábito",
                    isCompleted = false
                ),
                R07WeeklyGoalEntity(
                    weekId = weekId,
                    title = "Asistir al menos a 3 reuniones de oración",
                    category = "Oración",
                    isCompleted = true
                ),
                R07WeeklyGoalEntity(
                    weekId = weekId,
                    title = "Memorizar Jeremías 33:3",
                    category = "Lectura",
                    isCompleted = false
                ),
                R07WeeklyGoalEntity(
                    weekId = weekId,
                    title = "Enviar un mensaje de bendición y ánimo a una hermana",
                    category = "Espiritual",
                    isCompleted = true
                )
            )
            dao.insertGoals(initialGoals)

            // Seed initial friends connected by token
            val initialFriends = listOf(
                R07FriendEntity(
                    friendToken = "R07-MARIA-7201",
                    name = "María Gómez",
                    avatarEmoji = "🌸",
                    churchOrGroup = "Célula Jóvenes de Gracia",
                    currentStreak = 5,
                    lastDevotionalDate = "Hoy 07:15 AM",
                    prayerRequest = "Paz y dirección en decisiones laborales y familiares",
                    isFavorite = true
                ),
                R07FriendEntity(
                    friendToken = "R07-DAVID-4491",
                    name = "David Salazar",
                    avatarEmoji = "⚔️",
                    churchOrGroup = "Grupo Hombres de Fe",
                    currentStreak = 4,
                    lastDevotionalDate = "Ayer 06:40 AM",
                    prayerRequest = "Sabiduría en el trabajo y salud para mis padres",
                    isFavorite = false
                ),
                R07FriendEntity(
                    friendToken = "R07-ESTHER-8832",
                    name = "Esther Morales",
                    avatarEmoji = "✨",
                    churchOrGroup = "Célula Jóvenes de Gracia",
                    currentStreak = 6,
                    lastDevotionalDate = "Hoy 06:00 AM",
                    prayerRequest = "Avivamiento espiritual en mi familia y amigos",
                    isFavorite = false
                )
            )
            dao.insertFriends(initialFriends)

            // Seed initial group/community
            val initialCommunity = R07CommunityEntity(
                communityToken = "COM-VIDA-9921",
                name = "Célula Jóvenes de Gracia",
                churchName = "Iglesia Central de Fe",
                leaderName = "Pastor Daniel & Pastora Ana",
                meetingSchedule = "Miércoles 7:30 PM",
                description = "Grupo de conexión para estudio bíblico, rendición de cuentas y oración mutua.",
                memberCount = 12,
                isMyCommunity = true
            )
            dao.insertCommunity(initialCommunity)

            // Seed initial prayer petitions
            val initialPetitions = listOf(
                R07PrayerPetitionEntity(
                    title = "Por paz, sabiduría y dirección divina en mi hogar",
                    description = "Que el Señor guarde a mi familia, llene nuestros corazones de su Espíritu y nos dé unidad.",
                    category = "Familia",
                    isAnswered = false,
                    prayerCount = 5
                ),
                R07PrayerPetitionEntity(
                    title = "Salud y pronta recuperación de mis padres",
                    description = "Clamando por sanidad completa y fortaleza física y emocional.",
                    category = "Salud",
                    isAnswered = false,
                    prayerCount = 8
                ),
                R07PrayerPetitionEntity(
                    title = "Crecimiento espiritual y fidelidad en mi devocional R07",
                    description = "Mantener un corazón dócil, constante y apasionado por Su Presencia cada mañana.",
                    category = "Espiritual",
                    isAnswered = true,
                    answeredDate = "24 Ago",
                    testimonyNote = "¡Gloria a Dios! El Señor me dio disciplina y gozo renovado para levantarme a orar y meditar en Su Palabra.",
                    prayerCount = 14
                )
            )
            dao.insertPrayerPetitions(initialPetitions)
        }
    }
}

