package com.example.data.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Relation

data class R07Mood(
    val id: String,
    val name: String,
    val emoji: String,
    val subtitle: String,
    val colorHex: Long
)

val WOMEN_MOODS = listOf(
    R07Mood("agradecida", "Agradecida", "🌸", "Llena de gratitud y alabanza", 0xFFAD1457),
    R07Mood("en_paz", "En Paz", "🕊️", "Descansando en Su presencia", 0xFF00897B),
    R07Mood("gozosa", "Gozosa", "✨", "Alegre y llena de energía", 0xFFD81B60),
    R07Mood("confiada", "Confiada", "🌿", "Firme en la fe y promesas", 0xFF2E7D32),
    R07Mood("reflexiva", "Reflexiva", "💭", "Buscando sabiduría y quietud", 0xFF6A1B9A),
    R07Mood("cansada", "Cansada", "🌧️", "Agotada, pidiendo fuerzas", 0xFF455A64),
    R07Mood("afligida", "Afligida", "💔", "Necesito consuelo y gracia", 0xFFC2185B)
)

val MEN_MOODS = listOf(
    R07Mood("agradecido", "Agradecido", "🛡️", "Lleno de gratitud y victoria", 0xFF1565C0),
    R07Mood("en_paz", "En Paz", "🕊️", "Firmeza y descanso en Dios", 0xFF00695C),
    R07Mood("firme", "Firme", "⚔️", "Valiente, listo para la batalla", 0xFF0D47A1),
    R07Mood("confiado", "Confiado", "⚓", "Anclado en la roca inmutable", 0xFF2E7D32),
    R07Mood("reflexivo", "Reflexivo", "📖", "Meditando en la palabra", 0xFF4527A0),
    R07Mood("cansado", "Cansado", "🌧️", "Renovando fuerzas en el Señor", 0xFF37474F),
    R07Mood("enfocado", "Enfocado", "🎯", "Mirada puesta en el blanco", 0xFFD84315)
)

val PREDEFINED_MOODS = WOMEN_MOODS

@Entity(tableName = "r07_weeks")
data class R07WeekEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String, // e.g. "Semana 1", "Semana 25 - 31 Agosto"
    val startDate: String, // e.g. "2026-08-24" or "24 Ago"
    val endDate: String, // e.g. "2026-08-30" or "30 Ago"
    val readingGoal: String = "", // e.g. "Salmos 1 al 15"
    val isGoalCompleted: Boolean = false,
    val prayerAttendanceCount: Int = 0, // ¿Cuántas veces asistí a la oración?
    val verseOfTheWeek: String = "«Pasa tiempo Conmigo y saciaré tu alma»",
    val generalNotes: String = "",
    // Connection Group & Church Tracking
    val attendedGroup: Boolean = false,
    val groupLearnings: String = "", // ¿Qué aprendiste en el grupo?
    val groupTopics: String = "", // ¿De qué hablaron?
    val groupFeelings: String = "", // ¿Cómo te sentiste en el grupo?
    val groupAbsenceReason: String = "", // Motivo si no pudiste asistir
    val attendedPrayerDay1: Boolean = false, // Día 1 de Oración en la iglesia
    val prayerDay1Date: String = "",
    val prayerDay1Notes: String = "", // Cómo te sentiste en oración
    val prayerDay1AbsenceReason: String = "",
    val attendedPrayerDay2: Boolean = false, // Día 2 de Oración en la iglesia
    val prayerDay2Date: String = "",
    val prayerDay2Notes: String = "",
    val prayerDay2AbsenceReason: String = "",
    val attendedSundayService: Boolean = false,
    val sundayServiceNotes: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "r07_weekly_goals")
data class R07WeeklyGoalEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val weekId: Long,
    val title: String,
    val category: String = "Espiritual", // "Espiritual", "Oración", "Lectura", "Hábito", "Personal"
    val isCompleted: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "r07_day_entries")
data class R07DayEntryEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val weekId: Long,
    val dayNumber: Int, // 1 to 7
    val dayName: String, // Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo
    val dateText: String, // e.g. "25 Ago"
    val timeText: String = "", // e.g. "06:30 AM"
    val scriptureRef: String = "", // e.g. "Salmos 23:1-6"
    val reflectionText: String = "", // Describe tu R07: Lo que Dios me habló, oración, agradecimiento
    val mood: String = "", // e.g. "Agradecida", "En Paz"
    val moodEmoji: String = "", // e.g. "🌸", "🕊️"
    val photoUrisJson: String = "", // JSON list of image URIs/paths of handwritten notebook pages
    val blocksJson: String = "", // Structured devotional blocks JSON
    val isCompleted: Boolean = false,
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "r07_friends")
data class R07FriendEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val friendToken: String, // e.g. "R07-MARIA-4819"
    val name: String,
    val avatarEmoji: String = "🌸",
    val churchOrGroup: String = "Comunidad de Fe",
    val currentStreak: Int = 3, // e.g. 5 días de devocional
    val lastDevotionalDate: String = "Hoy",
    val prayerRequest: String = "Por paz y dirección de Dios en mi familia",
    val isFavorite: Boolean = false,
    val connectedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "r07_communities")
data class R07CommunityEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val communityToken: String, // e.g. "COM-VIDA-9921"
    val name: String, // e.g. "Célula Jóvenes de Gracia"
    val churchName: String = "Iglesia Central",
    val leaderName: String = "",
    val meetingSchedule: String = "Miércoles 7:30 PM",
    val description: String = "Grupo de conexión para crecer en la palabra y oración mutua",
    val memberCount: Int = 8,
    val isMyCommunity: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "r07_prayer_petitions")
data class R07PrayerPetitionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val description: String = "",
    val category: String = "Personal", // "Personal", "Familia", "Salud", "Finanzas", "Espiritual", "Iglesia", "Amigos"
    val isAnswered: Boolean = false,
    val answeredDate: String = "",
    val testimonyNote: String = "",
    val prayerCount: Int = 1,
    val createdAt: Long = System.currentTimeMillis()
)

data class WeekWithDays(
    @Embedded val week: R07WeekEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "weekId"
    )
    val days: List<R07DayEntryEntity>,
    @Relation(
        parentColumn = "id",
        entityColumn = "weekId"
    )
    val goals: List<R07WeeklyGoalEntity> = emptyList()
)

