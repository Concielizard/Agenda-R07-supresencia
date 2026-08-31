package com.example.data.bible

import com.example.data.local.BibleDao
import com.example.data.model.BibleChapterEntity
import com.example.data.model.SingleVerseData
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

enum class BibleVersion(
    val code: String,
    val displayName: String,
    val shortName: String,
    val apiCode: String
) {
    RVR1960("RVR1960", "Reina Valera 1960", "RVR60", "RVR1960"),
    NTV("NTV", "Nueva Traducción Viviente", "NTV", "NTV")
}

data class BibleBookInfo(
    val number: Int, // 1 to 66
    val name: String,
    val testament: String, // "Antiguo Testamento" or "Nuevo Testamento"
    val category: String,
    val chaptersCount: Int,
    val abbreviation: String
)

data class BibleVerse(
    val book: String,
    val chapter: Int,
    val verse: Int,
    val text: String,
    val version: BibleVersion
) {
    val citation: String
        get() = "$book $chapter:$verse (${version.shortName})"
}

data class FullChapterData(
    val bookNumber: Int,
    val bookName: String,
    val chapter: Int,
    val testament: String,
    val version: BibleVersion,
    val verses: List<SingleVerseData>,
    val isOfflineAvailable: Boolean = true
)

object BibleService {

    private val client = OkHttpClient.Builder()
        .connectTimeout(6, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .build()

    val all66Books = listOf(
        // Antiguo Testamento (1 al 39)
        // Pentateuco
        BibleBookInfo(1, "Génesis", "Antiguo Testamento", "Pentateuco", 50, "Gén"),
        BibleBookInfo(2, "Éxodo", "Antiguo Testamento", "Pentateuco", 40, "Éxo"),
        BibleBookInfo(3, "Levítico", "Antiguo Testamento", "Pentateuco", 27, "Lev"),
        BibleBookInfo(4, "Números", "Antiguo Testamento", "Pentateuco", 36, "Núm"),
        BibleBookInfo(5, "Deuteronomio", "Antiguo Testamento", "Pentateuco", 34, "Deut"),

        // Históricos
        BibleBookInfo(6, "Josué", "Antiguo Testamento", "Históricos", 24, "Jos"),
        BibleBookInfo(7, "Jueces", "Antiguo Testamento", "Históricos", 21, "Jue"),
        BibleBookInfo(8, "Rut", "Antiguo Testamento", "Históricos", 4, "Rut"),
        BibleBookInfo(9, "1 Samuel", "Antiguo Testamento", "Históricos", 31, "1 S"),
        BibleBookInfo(10, "2 Samuel", "Antiguo Testamento", "Históricos", 24, "2 S"),
        BibleBookInfo(11, "1 Reyes", "Antiguo Testamento", "Históricos", 22, "1 R"),
        BibleBookInfo(12, "2 Reyes", "Antiguo Testamento", "Históricos", 25, "2 R"),
        BibleBookInfo(13, "1 Crónicas", "Antiguo Testamento", "Históricos", 29, "1 Cr"),
        BibleBookInfo(14, "2 Crónicas", "Antiguo Testamento", "Históricos", 36, "2 Cr"),
        BibleBookInfo(15, "Esdras", "Antiguo Testamento", "Históricos", 10, "Esd"),
        BibleBookInfo(16, "Nehemías", "Antiguo Testamento", "Históricos", 13, "Neh"),
        BibleBookInfo(17, "Ester", "Antiguo Testamento", "Históricos", 10, "Est"),

        // Poéticos y Sabiduría
        BibleBookInfo(18, "Job", "Antiguo Testamento", "Poéticos & Sabiduría", 42, "Job"),
        BibleBookInfo(19, "Salmos", "Antiguo Testamento", "Poéticos & Sabiduría", 150, "Sal"),
        BibleBookInfo(20, "Proverbios", "Antiguo Testamento", "Poéticos & Sabiduría", 31, "Prov"),
        BibleBookInfo(21, "Eclesiastés", "Antiguo Testamento", "Poéticos & Sabiduría", 12, "Ecl"),
        BibleBookInfo(22, "Cantares", "Antiguo Testamento", "Poéticos & Sabiduría", 8, "Cnt"),

        // Profetas Mayores
        BibleBookInfo(23, "Isaías", "Antiguo Testamento", "Profetas Mayores", 66, "Isa"),
        BibleBookInfo(24, "Jeremías", "Antiguo Testamento", "Profetas Mayores", 52, "Jer"),
        BibleBookInfo(25, "Lamentaciones", "Antiguo Testamento", "Profetas Mayores", 5, "Lam"),
        BibleBookInfo(26, "Ezequiel", "Antiguo Testamento", "Profetas Mayores", 48, "Ez"),
        BibleBookInfo(27, "Daniel", "Antiguo Testamento", "Profetas Mayores", 12, "Dan"),

        // Profetas Menores
        BibleBookInfo(28, "Oseas", "Antiguo Testamento", "Profetas Menores", 14, "Os"),
        BibleBookInfo(29, "Joel", "Antiguo Testamento", "Profetas Menores", 3, "Jl"),
        BibleBookInfo(30, "Amós", "Antiguo Testamento", "Profetas Menores", 9, "Am"),
        BibleBookInfo(31, "Abdías", "Antiguo Testamento", "Profetas Menores", 1, "Abd"),
        BibleBookInfo(32, "Jonás", "Antiguo Testamento", "Profetas Menores", 4, "Jon"),
        BibleBookInfo(33, "Miqueas", "Antiguo Testamento", "Profetas Menores", 7, "Miq"),
        BibleBookInfo(34, "Nahúm", "Antiguo Testamento", "Profetas Menores", 3, "Nah"),
        BibleBookInfo(35, "Habacuc", "Antiguo Testamento", "Profetas Menores", 3, "Hab"),
        BibleBookInfo(36, "Sofonías", "Antiguo Testamento", "Profetas Menores", 3, "Sof"),
        BibleBookInfo(37, "Hageo", "Antiguo Testamento", "Profetas Menores", 2, "Hag"),
        BibleBookInfo(38, "Zacarías", "Antiguo Testamento", "Profetas Menores", 14, "Zac"),
        BibleBookInfo(39, "Malaquías", "Antiguo Testamento", "Profetas Menores", 4, "Mal"),

        // Nuevo Testamento (40 al 66)
        // Evangelios
        BibleBookInfo(40, "Mateo", "Nuevo Testamento", "Evangelios", 28, "Mat"),
        BibleBookInfo(41, "Marcos", "Nuevo Testamento", "Evangelios", 16, "Mr"),
        BibleBookInfo(42, "Lucas", "Nuevo Testamento", "Evangelios", 24, "Luc"),
        BibleBookInfo(43, "Juan", "Nuevo Testamento", "Evangelios", 21, "Jn"),

        // Historia
        BibleBookInfo(44, "Hechos", "Nuevo Testamento", "Historia", 28, "Hch"),

        // Epístolas Paulinas
        BibleBookInfo(45, "Romanos", "Nuevo Testamento", "Epístolas Paulinas", 16, "Rom"),
        BibleBookInfo(46, "1 Corintios", "Nuevo Testamento", "Epístolas Paulinas", 16, "1 Co"),
        BibleBookInfo(47, "2 Corintios", "Nuevo Testamento", "Epístolas Paulinas", 13, "2 Co"),
        BibleBookInfo(48, "Gálatas", "Nuevo Testamento", "Epístolas Paulinas", 6, "Gál"),
        BibleBookInfo(49, "Efesios", "Nuevo Testamento", "Epístolas Paulinas", 6, "Ef"),
        BibleBookInfo(50, "Filipenses", "Nuevo Testamento", "Epístolas Paulinas", 4, "Fil"),
        BibleBookInfo(51, "Colosenses", "Nuevo Testamento", "Epístolas Paulinas", 4, "Col"),
        BibleBookInfo(52, "1 Tesalonicenses", "Nuevo Testamento", "Epístolas Paulinas", 5, "1 Ts"),
        BibleBookInfo(53, "2 Tesalonicenses", "Nuevo Testamento", "Epístolas Paulinas", 3, "2 Ts"),
        BibleBookInfo(54, "1 Timoteo", "Nuevo Testamento", "Epístolas Paulinas", 6, "1 Ti"),
        BibleBookInfo(55, "2 Timoteo", "Nuevo Testamento", "Epístolas Paulinas", 4, "2 Ti"),
        BibleBookInfo(56, "Tito", "Nuevo Testamento", "Epístolas Paulinas", 3, "Tit"),
        BibleBookInfo(57, "Filemón", "Nuevo Testamento", "Epístolas Paulinas", 1, "Flm"),

        // Epístolas Generales
        BibleBookInfo(58, "Hebreos", "Nuevo Testamento", "Epístolas Generales", 13, "Heb"),
        BibleBookInfo(59, "Santiago", "Nuevo Testamento", "Epístolas Generales", 5, "Stg"),
        BibleBookInfo(60, "1 Pedro", "Nuevo Testamento", "Epístolas Generales", 5, "1 P"),
        BibleBookInfo(61, "2 Pedro", "Nuevo Testamento", "Epístolas Generales", 3, "2 P"),
        BibleBookInfo(62, "1 Juan", "Nuevo Testamento", "Epístolas Generales", 5, "1 Jn"),
        BibleBookInfo(63, "2 Juan", "Nuevo Testamento", "Epístolas Generales", 1, "2 Jn"),
        BibleBookInfo(64, "3 Juan", "Nuevo Testamento", "Epístolas Generales", 1, "3 Jn"),
        BibleBookInfo(65, "Judas", "Nuevo Testamento", "Epístolas Generales", 1, "Jud"),

        // Profecía
        BibleBookInfo(66, "Apocalipsis", "Nuevo Testamento", "Profecía", 22, "Apoc")
    )

    fun getBookByNumber(number: Int): BibleBookInfo? = all66Books.find { it.number == number }
    fun getBookByName(name: String): BibleBookInfo? = all66Books.find { it.name.equals(name, ignoreCase = true) }

    // Preloaded offline verses for immediate instant display across key OT and NT scriptures
    val offlineCoreVerses = listOf(
        // Proverbios
        BibleVerse("Proverbios", 1, 7, "El principio de la sabiduría es el temor de Jehová; Los insensatos desprecian la sabiduría y la enseñanza.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 1, 7, "El temor del Señor es la base del verdadero conocimiento, pero los necios desprecian la sabiduría y la disciplina.", BibleVersion.NTV),
        BibleVerse("Proverbios", 2, 6, "Porque Jehová da la sabiduría, Y de su boca viene el conocimiento y la inteligencia.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 2, 6, "¡Pues el Señor concede sabiduría! De su boca provienen el conocimiento y el entendimiento.", BibleVersion.NTV),
        BibleVerse("Proverbios", 3, 5, "Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 3, 5, "Confía en el Señor con todo tu corazón; no dependas de tu propio entendimiento.", BibleVersion.NTV),
        BibleVerse("Proverbios", 3, 6, "Reconócelo en todos tus caminos, Y él enderezará tus veredas.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 3, 6, "Busca su voluntad en todo lo que hagas, y él te mostrará cuál camino tomar.", BibleVersion.NTV),
        BibleVerse("Proverbios", 4, 23, "Sobre toda cosa guardada, guarda tu corazón; Porque de él mana la vida.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 4, 23, "Sobre todas las cosas cuida tu corazón, porque de él mana la vida.", BibleVersion.NTV),
        BibleVerse("Proverbios", 16, 3, "Encomienda a Jehová tus obras, Y tus pensamientos serán afirmados.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 16, 3, "Pon todo lo que hagas en manos del Señor, y tus planes tendrán éxito.", BibleVersion.NTV),
        BibleVerse("Proverbios", 31, 10, "Mujer virtuosa, ¿quién la hallará? Porque su estima sobrepasa largamente a la de las piedras preciosas.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 31, 10, "¿Quién podrá encontrar una esposa virtuosa y capaz? Es más preciosa que los rubíes.", BibleVersion.NTV),
        BibleVerse("Proverbios", 31, 25, "Fuerza y honor son su vestidura; Y se ríe de lo por venir.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 31, 25, "Está vestida de fortaleza y dignidad, y se ríe sin temor al futuro.", BibleVersion.NTV),
        BibleVerse("Proverbios", 31, 30, "Engañosa es la gracia, y vana la hermosura; La mujer que teme a Jehová, ésa será alabada.", BibleVersion.RVR1960),
        BibleVerse("Proverbios", 31, 30, "El encanto es engañoso, y la belleza no perdura, pero la mujer que teme al Señor será sumamente alabada.", BibleVersion.NTV),

        // Salmos
        BibleVerse("Salmos", 23, 1, "Jehová es mi pastor; nada me faltará.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 23, 1, "El Señor es mi pastor; tengo todo lo que necesito.", BibleVersion.NTV),
        BibleVerse("Salmos", 23, 2, "En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 23, 2, "En verdes prados me deja descansar; me conduce junto a arroyos tranquilos.", BibleVersion.NTV),
        BibleVerse("Salmos", 23, 3, "Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 23, 3, "Él renueva mis fuerzas. Me guía por sendas correctas, y así da honra a su nombre.", BibleVersion.NTV),
        BibleVerse("Salmos", 27, 1, "Jehová es mi luz y mi salvación; ¿de quién temeré? Jehová es la fortaleza de mi vida; ¿de quién he de atemorizarme?", BibleVersion.RVR1960),
        BibleVerse("Salmos", 27, 1, "El Señor es mi luz y mi salvación, ¿a quién temeré? El Señor es la fortaleza de mi vida, ¿de quién tendré miedo?", BibleVersion.NTV),
        BibleVerse("Salmos", 46, 1, "Dios es nuestro amparo y fortaleza, Nuestro pronto auxilio en las tribulaciones.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 46, 1, "Dios es nuestro refugio y nuestra fuerza, siempre está dispuesto a ayudar en tiempos de dificultad.", BibleVersion.NTV),
        BibleVerse("Salmos", 91, 1, "El que habita al abrigo del Altísimo Morará bajo la sombra del Omnipotente.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 91, 1, "Los que viven al amparo del Altísimo encontrarán descanso a la sombra del Todopoderoso.", BibleVersion.NTV),
        BibleVerse("Salmos", 103, 1, "Bendice, alma mía, a Jehová, Y bendiga todo mi ser su santo nombre.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 103, 1, "¡Que todo lo que soy alabe al Señor; con todo el corazón alabaré su santo nombre!", BibleVersion.NTV),
        BibleVerse("Salmos", 119, 105, "Lámpara es a mis pies tu palabra, Y lumbrera a mi camino.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 119, 105, "Tu palabra es una lámpara que guía mis pies y una luz para mi camino.", BibleVersion.NTV),
        BibleVerse("Salmos", 121, 1, "Alzaré mis ojos a los montes; ¿De dónde vendrá mi socorro? Mi socorro viene de Jehová, Que hizo los cielos y la tierra.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 121, 1, "Levanto la vista hacia las montañas, ¿viene de allí mi ayuda? ¡Mi ayuda viene del Señor, quien hizo los cielos y la tierra!", BibleVersion.NTV),
        BibleVerse("Salmos", 139, 14, "Te alabaré; porque formidables, maravillosas son tus obras; Estoy maravillado, Y mi alma lo sabe muy bien.", BibleVersion.RVR1960),
        BibleVerse("Salmos", 139, 14, "¡Gracias por hacerme tan maravillosamente complejo! Tu fino trabajo es maravilloso, lo sé muy bien.", BibleVersion.NTV),

        // Génesis & Éxodo & Históricos
        BibleVerse("Génesis", 1, 1, "En el principio creó Dios los cielos y la tierra.", BibleVersion.RVR1960),
        BibleVerse("Génesis", 1, 1, "En el principio, Dios creó los cielos y la tierra.", BibleVersion.NTV),
        BibleVerse("Josué", 1, 9, "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.", BibleVersion.RVR1960),
        BibleVerse("Josué", 1, 9, "Mi mandato es: “¡Sé fuerte y valiente! No tengas miedo ni te desanimes, porque el Señor tu Dios está contigo dondequiera que vayas”.", BibleVersion.NTV),

        // Profetas
        BibleVerse("Isaías", 40, 31, "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.", BibleVersion.RVR1960),
        BibleVerse("Isaías", 40, 31, "Pero los que confían en el Señor encontrarán nuevas fuerzas; volarán alto, como con alas de águila. Correrán y no se cansarán; caminarán y no desmayarán.", BibleVersion.NTV),
        BibleVerse("Jeremías", 29, 11, "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.", BibleVersion.RVR1960),
        BibleVerse("Jeremías", 29, 11, "«Pues yo sé los planes que tengo para ustedes», dice el Señor. «Son planes para lo bueno y no para lo malo, para darles un futuro y una esperanza.»", BibleVersion.NTV),
        BibleVerse("Jeremías", 33, 3, "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.", BibleVersion.RVR1960),
        BibleVerse("Jeremías", 33, 3, "Pídeme y te daré a conocer secretos sorprendentes que no conoces acerca de lo que está por venir.", BibleVersion.NTV),
        BibleVerse("Lamentaciones", 3, 22, "Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad.", BibleVersion.RVR1960),
        BibleVerse("Lamentaciones", 3, 22, "¡El fiel amor del Señor nunca se acaba! Sus misericordias jamás terminan. Grande es su fidelidad; sus misericordias son nuevas cada mañana.", BibleVersion.NTV),

        // Evangelios & Epístolas
        BibleVerse("Mateo", 6, 33, "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", BibleVersion.RVR1960),
        BibleVerse("Mateo", 6, 33, "Busquen el reino de Dios por encima de todo lo demás y lleven una vida justa, y él les dará todo lo que necesiten.", BibleVersion.NTV),
        BibleVerse("Juan", 3, 16, "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", BibleVersion.RVR1960),
        BibleVerse("Juan", 3, 16, "Pues Dios amó tanto al mundo que dio a su único Hijo, para que todo el que crea en él no se pierda, sino que tenga vida eterna.", BibleVersion.NTV),
        BibleVerse("Juan", 14, 27, "La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.", BibleVersion.RVR1960),
        BibleVerse("Juan", 14, 27, "Les dejo un regalo: paz en la mente y en el corazón. Y la paz que yo doy es un regalo que el mundo no puede dar. Así que no se angustien ni tengan miedo.", BibleVersion.NTV),
        BibleVerse("Juan", 15, 5, "Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, éste lleva mucho fruto; porque separados de mí nada podéis hacer.", BibleVersion.RVR1960),
        BibleVerse("Juan", 15, 5, "Ciertamente, yo soy la vid; ustedes son las ramas. Los que permanecen en mí y yo en ellos producirán mucho fruto porque, separados de mí, no pueden hacer nada.", BibleVersion.NTV),
        BibleVerse("Romanos", 8, 28, "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.", BibleVersion.RVR1960),
        BibleVerse("Romanos", 8, 28, "Y sabemos que Dios hace que todas las cosas cooperen para el bien de quienes lo aman y son llamados según el propósito que él tiene para ellos.", BibleVersion.NTV),
        BibleVerse("Romanos", 12, 2, "No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento...", BibleVersion.RVR1960),
        BibleVerse("Romanos", 12, 2, "No imiten las conductas ni las costumbres de este mundo, más bien dejen que Dios los transforme en personas nuevas al cambiarles la manera de pensar.", BibleVersion.NTV),
        BibleVerse("Filipenses", 4, 6, "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.", BibleVersion.RVR1960),
        BibleVerse("Filipenses", 4, 6, "No se preocupen por nada; en cambio, oren por todo. Díganle a Dios lo que necesitan y denle gracias por todo lo que él ha hecho.", BibleVersion.NTV),
        BibleVerse("Filipenses", 4, 13, "Todo lo puedo en Cristo que me fortalece.", BibleVersion.RVR1960),
        BibleVerse("Filipenses", 4, 13, "Pues todo lo puedo hacer por medio de Cristo, quien me da las fuerzas.", BibleVersion.NTV),
        BibleVerse("Hebreos", 11, 1, "Es, pues, la fe la certeza de lo que se espera, la convicción de lo que no se ve.", BibleVersion.RVR1960),
        BibleVerse("Hebreos", 11, 1, "La fe demuestra la realidad de lo que esperamos; es la evidencia de las cosas que no podemos ver.", BibleVersion.NTV),
        BibleVerse("Santiago", 1, 5, "Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.", BibleVersion.RVR1960),
        BibleVerse("Santiago", 1, 5, "Si a alguno de ustedes le falta sabiduría, pídasela a Dios, y él se la dará, pues Dios da a todos generosamente sin menospreciar a nadie.", BibleVersion.NTV),
        BibleVerse("1 Pedro", 5, 7, "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.", BibleVersion.RVR1960),
        BibleVerse("1 Pedro", 5, 7, "Pongan todas sus preocupaciones y ansiedades en las manos de Dios, porque él cuida de ustedes.", BibleVersion.NTV),
        BibleVerse("Apocalipsis", 21, 4, "Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor; porque las primeras cosas pasaron.", BibleVersion.RVR1960),
        BibleVerse("Apocalipsis", 21, 4, "Él les secará toda lágrima de los ojos, y no habrá más muerte ni tristeza ni llanto ni dolor. Todas esas cosas ya no existirán más.", BibleVersion.NTV)
    )

    /**
     * Fetches a complete chapter from local Room database or downloads it from public API and saves locally.
     */
    suspend fun fetchChapterWithCache(
        bibleDao: BibleDao,
        bookNumber: Int,
        chapter: Int,
        version: BibleVersion
    ): FullChapterData = withContext(Dispatchers.IO) {
        val book = getBookByNumber(bookNumber) ?: all66Books[0]
        
        // 1. Check local Room DB first
        val cached = bibleDao.getChapter(version.code, bookNumber, chapter)
        if (cached != null && cached.versesJson.isNotBlank()) {
            val parsed = parseVersesJson(cached.versesJson)
            if (parsed.isNotEmpty()) {
                return@withContext FullChapterData(
                    bookNumber = bookNumber,
                    bookName = book.name,
                    chapter = chapter,
                    testament = book.testament,
                    version = version,
                    verses = parsed,
                    isOfflineAvailable = true
                )
            }
        }

        // 2. Fetch from online API
        val onlineVerses = downloadChapterFromRemote(bookNumber, chapter, version)
        if (onlineVerses.isNotEmpty()) {
            val json = serializeVersesToJson(onlineVerses)
            val entity = BibleChapterEntity(
                version = version.code,
                bookNumber = bookNumber,
                bookName = book.name,
                chapter = chapter,
                testament = book.testament,
                versesJson = json,
                verseCount = onlineVerses.size,
                isDownloaded = true,
                downloadedAt = System.currentTimeMillis()
            )
            bibleDao.insertChapter(entity)

            return@withContext FullChapterData(
                bookNumber = bookNumber,
                bookName = book.name,
                chapter = chapter,
                testament = book.testament,
                version = version,
                verses = onlineVerses,
                isOfflineAvailable = true
            )
        }

        // 3. Graceful offline synthesis/curation if no connection
        val fallbackVerses = generateFallbackVerses(book, chapter, version)
        return@withContext FullChapterData(
            bookNumber = bookNumber,
            bookName = book.name,
            chapter = chapter,
            testament = book.testament,
            version = version,
            verses = fallbackVerses,
            isOfflineAvailable = false
        )
    }

    private fun downloadChapterFromRemote(
        bookNumber: Int,
        chapter: Int,
        version: BibleVersion
    ): List<SingleVerseData> {
        val translationKeys = if (version == BibleVersion.RVR1960) {
            listOf("RV1960", "RVR1960")
        } else {
            listOf("NTV")
        }

        // 1. Try bolls.life public API endpoints
        for (translationKey in translationKeys) {
            try {
                val url = "https://bolls.life/get-chapter/$translationKey/$bookNumber/$chapter/"
                val request = Request.Builder().url(url).build()
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val bodyStr = response.body?.string() ?: ""
                    if (bodyStr.trim().startsWith("[")) {
                        val array = JSONArray(bodyStr)
                        val list = mutableListOf<SingleVerseData>()
                        for (i in 0 until array.length()) {
                            val obj = array.getJSONObject(i)
                            val verseNum = obj.optInt("verse", i + 1)
                            val rawText = obj.optString("text", "")
                            val cleanText = sanitizeVerseText(rawText)
                            if (cleanText.isNotBlank()) {
                                list.add(SingleVerseData(verseNum, cleanText))
                            }
                        }
                        if (list.isNotEmpty()) return list
                    }
                }
            } catch (e: Exception) {
                // Continue to next translation key
            }
        }

        // 2. Try alternative endpoint: bible-api.com
        try {
            val book = getBookByNumber(bookNumber)
            if (book != null) {
                val trans = if (version == BibleVersion.RVR1960) "rvr1960" else "ntv"
                val url = "https://bible-api.com/${book.name}+$chapter?translation=$trans"
                val request = Request.Builder().url(url).build()
                val response = client.newCall(request).execute()
                if (response.isSuccessful) {
                    val json = JSONObject(response.body?.string() ?: "")
                    val versesArr = json.optJSONArray("verses")
                    if (versesArr != null && versesArr.length() > 0) {
                        val list = mutableListOf<SingleVerseData>()
                        for (i in 0 until versesArr.length()) {
                            val vObj = versesArr.getJSONObject(i)
                            val vNum = vObj.optInt("verse", i + 1)
                            val vText = sanitizeVerseText(vObj.optString("text", ""))
                            list.add(SingleVerseData(vNum, vText))
                        }
                        if (list.isNotEmpty()) return list
                    }
                }
            }
        } catch (e: Exception) {
            // Ignored
        }

        return emptyList()
    }

    private fun sanitizeVerseText(text: String): String {
        return text
            .replace(Regex("<[^>]*>"), "") // Remove HTML tags like <i>, <b>, <pb/>
            .replace("&quot;", "\"")
            .replace("&#39;", "'")
            .replace("&amp;", "&")
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    private fun generateFallbackVerses(
        book: BibleBookInfo,
        chapter: Int,
        version: BibleVersion
    ): List<SingleVerseData> {
        val matches = offlineCoreVerses.filter {
            it.book.equals(book.name, ignoreCase = true) && it.chapter == chapter && it.version == version
        }
        if (matches.isNotEmpty()) {
            return matches.map { SingleVerseData(it.verse, it.text) }
        }

        // Return curated guide verses for prayer & meditation
        return listOf(
            SingleVerseData(1, "«Lámpara es a mis pies tu palabra, y lumbrera a mi camino.» (${book.name} $chapter, ${version.shortName})"),
            SingleVerseData(2, "«Pasa tiempo Conmigo en ${book.name} capítulo $chapter. Conéctate a internet para sincronizar la lectura completa o descarga el testamento para uso 100% offline.»")
        )
    }

    fun serializeVersesToJson(verses: List<SingleVerseData>): String {
        val array = JSONArray()
        for (v in verses) {
            val obj = JSONObject()
            obj.put("v", v.verse)
            obj.put("t", v.text)
            array.put(obj)
        }
        return array.toString()
    }

    fun parseVersesJson(json: String): List<SingleVerseData> {
        val list = mutableListOf<SingleVerseData>()
        try {
            val array = JSONArray(json)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                list.add(SingleVerseData(obj.getInt("v"), obj.getString("t")))
            }
        } catch (e: Exception) {
            // Empty
        }
        return list
    }

    fun getKnownVerseCount(bookNumber: Int, chapter: Int): Int {
        // Accurate counts for the most popular devotional chapters
        return when (bookNumber) {
            1 -> when (chapter) { 1 -> 31; 2 -> 25; 3 -> 24; 12 -> 20; 15 -> 21; 22 -> 24; else -> 28 } // Génesis
            19 -> when (chapter) { // Salmos
                1 -> 6; 23 -> 6; 27 -> 14; 34 -> 22; 46 -> 11; 51 -> 19; 63 -> 11;
                84 -> 12; 90 -> 17; 91 -> 16; 100 -> 5; 103 -> 22; 118 -> 29; 119 -> 176;
                121 -> 8; 127 -> 5; 133 -> 3; 139 -> 24; 145 -> 21; 150 -> 6;
                else -> 20
            }
            20 -> when (chapter) { // Proverbios
                1 -> 33; 2 -> 22; 3 -> 35; 4 -> 27; 5 -> 23; 6 -> 35; 10 -> 32; 16 -> 33; 31 -> 31;
                else -> 30
            }
            23 -> when (chapter) { 40 -> 31; 53 -> 12; 55 -> 13; 60 -> 22; else -> 25 } // Isaías
            24 -> when (chapter) { 29 -> 32; 33 -> 26; else -> 28 } // Jeremías
            40 -> when (chapter) { 1 -> 25; 5 -> 48; 6 -> 34; 7 -> 29; 28 -> 20; else -> 30 } // Mateo
            41 -> when (chapter) { 1 -> 45; 16 -> 20; else -> 28 } // Marcos
            42 -> when (chapter) { 1 -> 80; 2 -> 52; 10 -> 42; 15 -> 32; 24 -> 53; else -> 35 } // Lucas
            43 -> when (chapter) { 1 -> 51; 3 -> 36; 14 -> 31; 15 -> 27; 17 -> 26; 21 -> 25; else -> 30 } // Juan
            44 -> when (chapter) { 1 -> 26; 2 -> 47; 9 -> 43; 28 -> 31; else -> 32 } // Hechos
            45 -> when (chapter) { 8 -> 39; 12 -> 21; else -> 28 } // Romanos
            46 -> when (chapter) { 13 -> 13; 15 -> 58; else -> 26 } // 1 Corintios
            48 -> when (chapter) { 5 -> 26; else -> 20 } // Gálatas
            49 -> when (chapter) { 6 -> 24; else -> 22 } // Efesios
            50 -> when (chapter) { 4 -> 23; else -> 20 } // Filipenses
            58 -> when (chapter) { 11 -> 40; 12 -> 29; else -> 25 } // Hebreos
            59 -> when (chapter) { 1 -> 27; else -> 20 } // Santiago
            60 -> when (chapter) { 5 -> 14; else -> 22 } // 1 Pedro
            66 -> when (chapter) { 21 -> 27; 22 -> 21; else -> 24 } // Apocalipsis
            else -> 25
        }
    }

    suspend fun getAndCacheVerse(
        bibleDao: BibleDao?,
        bookName: String,
        chapter: Int,
        verse: Int,
        version: BibleVersion
    ): BibleVerse = withContext(Dispatchers.IO) {
        val book = getBookByName(bookName) ?: all66Books[0]
        
        // 1. Check if we already have it in Room DB
        if (bibleDao != null) {
            val cached = bibleDao.getChapter(version.code, book.number, chapter)
            if (cached != null && cached.versesJson.isNotBlank()) {
                val parsed = parseVersesJson(cached.versesJson)
                val found = parsed.find { it.verse == verse }
                if (found != null) {
                    return@withContext BibleVerse(book.name, chapter, verse, found.text, version)
                }
            }
        }

        // 2. Check offline preloaded core verses
        val exact = offlineCoreVerses.find {
            it.book.equals(book.name, ignoreCase = true) &&
                    it.chapter == chapter &&
                    it.verse == verse &&
                    it.version == version
        }
        if (exact != null) return@withContext exact

        // 3. Fetch from remote and store in Room DB
        val remoteVerses = downloadChapterFromRemote(book.number, chapter, version)
        if (remoteVerses.isNotEmpty()) {
            if (bibleDao != null) {
                val json = serializeVersesToJson(remoteVerses)
                val entity = BibleChapterEntity(
                    version = version.code,
                    bookNumber = book.number,
                    bookName = book.name,
                    chapter = chapter,
                    testament = book.testament,
                    versesJson = json,
                    verseCount = remoteVerses.size,
                    isDownloaded = true,
                    downloadedAt = System.currentTimeMillis()
                )
                bibleDao.insertChapter(entity)
            }
            val found = remoteVerses.find { it.verse == verse }
            if (found != null) {
                return@withContext BibleVerse(book.name, chapter, verse, found.text, version)
            }
        }

        // 4. Graceful fallback
        BibleVerse(
            book = book.name,
            chapter = chapter,
            verse = verse,
            text = "«Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.» (${book.name} $chapter:$verse)",
            version = version
        )
    }

    fun searchVerses(query: String, version: BibleVersion): List<BibleVerse> {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return offlineCoreVerses.filter { it.version == version }.take(15)

        return offlineCoreVerses.filter { verse ->
            verse.version == version && (
                    verse.book.lowercase().contains(q) ||
                            verse.text.lowercase().contains(q) ||
                            "${verse.book} ${verse.chapter}".lowercase().contains(q) ||
                            "${verse.book} ${verse.chapter}:${verse.verse}".lowercase().contains(q)
                    )
        }
    }

    fun getPopularTopicVerses(topic: String, version: BibleVersion): List<BibleVerse> {
        val keywords = when (topic.lowercase()) {
            "sabiduría" -> listOf("sabiduría", "conocimiento", "proverbios", "prudencia")
            "paz" -> listOf("paz", "reposo", "descanso", "amparo", "no temas")
            "fuerza" -> listOf("fuerza", "fortaleza", "valiente", "fiel", "poder")
            "amor" -> listOf("amor", "misericordia", "pastor", "fidelidad", "amó")
            "propósito" -> listOf("propósito", "planes", "camino", "voluntad")
            "mujer de dios" -> listOf("vestida", "engañosa", "hermosura", "teme", "virtuosa")
            else -> listOf("señor", "jehová", "palabra", "dios")
        }

        return offlineCoreVerses.filter { v ->
            v.version == version && keywords.any { kw ->
                v.text.lowercase().contains(kw) || v.book.lowercase().contains(kw)
            }
        }
    }
}
