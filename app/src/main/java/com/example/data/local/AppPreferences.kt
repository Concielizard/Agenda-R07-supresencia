package com.example.data.local

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class AppEdition(val key: String, val displayName: String, val subtitle: String, val icon: String) {
    WOMEN("WOMEN", "Edición Mujeres", "Pasa tiempo Conmigo 🌸", "🌸"),
    MEN("MEN", "Edición Hombres", "Pasa tiempo Conmigo ⚔️", "⚔️")
}

enum class AppThemeMode(val displayName: String, val icon: String) {
    SYSTEM("Automático (Sistema)", "🌓"),
    LIGHT("Modo Claro", "☀️"),
    DARK("Modo Oscuro", "🌙")
}

enum class AppColorPalette(
    val displayName: String,
    val icon: String,
    val description: String,
    val primaryHex: Long,
    val previewBgHex: Long
) {
    WOMEN_PINK("Rosa Pastel & Crema", "🌸", "Rosado pastel puro, flor de durazno y crema suave", 0xFFD86588, 0xFFFFF2F5),
    MEN_BLUE("Azul Rey & Arena", "⚔️", "Azul marino distinguido, beige cálido y blanco impecable", 0xFF0D47A1, 0xFFF6F2EA),
    OLIVE_SAGE("Salvia & Olivo Paz", "🌿", "Verde salvia orgánico, eucalipto y calma espiritual", 0xFF2E6F40, 0xFFF2F7F4),
    ROYAL_GOLD("Oro Clásico & Marfil", "✨", "Ámbar dorado cálido, pergamino y elegancia devocional", 0xFF996515, 0xFFFAF6EE),
    LAVENDER_PASTEL("Lavanda Pastel & Lirio", "💜", "Lila y lavanda suave con fondos claros y lectura limpia", 0xFF7E57C2, 0xFFF8F4FD),
    SKY_PASTEL("Celeste Cielo & Brisa", "🌊", "Azul celeste pastel suave, armonía y frescura visual", 0xFF0288D1, 0xFFF0F8FF),
    TERRACOTTA("Terracota & Canela", "🏺", "Tierra cálida, arcilla suave y acentos miel acogedores", 0xFFA0522D, 0xFFFAF3F0)
}

enum class AppFontFamily(
    val displayName: String,
    val subtitle: String,
    val icon: String,
    val sampleVerse: String
) {
    DEFAULT("Sistema (Estándar)", "Limpia, moderna y optimizada por el sistema Android", "📱", "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."),
    SERIF("Clásica Editorial & Bíblica", "Elegancia sagrada de las Sagradas Escrituras impresas", "📖", "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."),
    SANS_SERIF("Moderna & Minimalista", "Líneas geométricas y alta claridad de lectura", "✨", "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."),
    CURSIVE("Cálida & Devocional", "Trazos humanos y acogedores para la meditación diaria", "✍️", "Lámpara es a mis pies tu palabra, y lumbrera a mi camino."),
    MONOSPACE("Estudio & Hermenéutica", "Estructura fija para análisis versículo a versículo", "🔬", "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.")
}

enum class AppLogoTheme(
    val displayName: String,
    val icon: String,
    val description: String,
    val primaryHex: Long,
    val secondaryHex: Long,
    val bgHex: Long
) {
    DYNAMIC("Sincronizado con Paleta", "🎨", "Adopta automáticamente los colores del tema actual", 0x00000000, 0x00000000, 0x00000000),
    GOLD_DIVINE("Corona de Oro & Gloria", "👑", "Dorado celestial, ámbar noble y resplandor divino", 0xFFD4AF37, 0xFF996515, 0xFFFFF8E7),
    ROSE_PASTEL("Rosa Pastel & Gracia", "🌸", "Rosado pastel puro, pétalo suave y delicadeza", 0xFFE57399, 0xFFC2185B, 0xFFFFF0F5),
    ROYAL_NAVY("Azul Rey & Fortaleza", "⚔️", "Azul marino real, sobriedad y firmeza", 0xFF1976D2, 0xFF0D47A1, 0xFFE3F2FD),
    LAVENDER_PURPLE("Lavanda & Realeza", "💜", "Lila místico, violeta espiritual y elegancia", 0xFF9575CD, 0xFF512DA8, 0xFFEDE7F6),
    EMERALD_SAGE("Olivo & Paz Eterna", "🌿", "Verde olivo, hojas de vida y serenidad", 0xFF43A047, 0xFF1B5E20, 0xFFE8F5E9),
    SKY_CYAN("Celeste Brisa Divina", "🌊", "Celeste etéreo, frescura matutina y paz", 0xFF00ACC1, 0xFF006064, 0xFFE0F7FA),
    TERRACOTTA_WARM("Terracota & Alfarero", "🏺", "Barro en manos de Dios y calidez terrenal", 0xFFD87040, 0xFF8D3214, 0xFFFBE9E7),
    BLACK_GOLD("Onix & Oro Premium", "🖤", "Minimalismo oscuro profundo con acento oro puro", 0xFFE0C068, 0xFF212121, 0xFF181818)
}

enum class AppLogoSymbol(
    val displayName: String,
    val symbolChar: String,
    val description: String
) {
    DOVE_CROSS("Paloma de Paz & Cruz", "🕊️", "Símbolo del Espíritu Santo y redención"),
    LION_JUDAH("León de Judá", "🦁", "Fuerza, realeza y victoria en Cristo"),
    OPEN_BIBLE("Palabra Viva", "📖", "Lámpara a nuestros pies y lumbrera"),
    SHIELD_FAITH("Escudo de la Fe", "🛡️", "Protección espiritual y armadura de Dios"),
    CROWN_GLORY("Corona de Gloria", "👑", "Recompensa eterna y sacerdocio real"),
    FLAME_SPIRIT("Fuego del Espíritu", "🔥", "Avivamiento, pasión y purificación"),
    HEART_GRACE("Corazón de Gracia", "💖", "Amor incondicional del Padre celestial"),
    STAR_HOPE("Estrella de Belén", "⭐", "Luz que guía en la oscuridad de la noche")
}

enum class UserAccountType(val displayName: String, val subtitle: String, val icon: String) {
    INDIVIDUAL("Personal / Individual", "Cultiva tu tiempo a solas con Dios y disciplina devocional", "👤"),
    CONNECTION_GROUP("Miembro de Grupo de Conexión & Iglesia", "Registro de grupo semanal, 2 días de oración y comunidad", "👥")
}

class AppPreferences(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("r07_app_preferences", Context.MODE_PRIVATE)

    private val _selectedEdition = MutableStateFlow(getSavedEdition())
    val selectedEdition: StateFlow<AppEdition?> = _selectedEdition.asStateFlow()

    private val _themeMode = MutableStateFlow(getSavedThemeMode())
    val themeMode: StateFlow<AppThemeMode> = _themeMode.asStateFlow()

    private val _colorPalette = MutableStateFlow(getSavedPalette())
    val colorPalette: StateFlow<AppColorPalette> = _colorPalette.asStateFlow()

    private val _fontFamily = MutableStateFlow(getSavedFontFamily())
    val fontFamily: StateFlow<AppFontFamily> = _fontFamily.asStateFlow()

    private val _logoTheme = MutableStateFlow(getSavedLogoTheme())
    val logoTheme: StateFlow<AppLogoTheme> = _logoTheme.asStateFlow()

    private val _logoSymbol = MutableStateFlow(getSavedLogoSymbol())
    val logoSymbol: StateFlow<AppLogoSymbol> = _logoSymbol.asStateFlow()

    private val _userPhotoUri = MutableStateFlow(prefs.getString(KEY_USER_PHOTO_URI, "") ?: "")
    val userPhotoUri: StateFlow<String> = _userPhotoUri.asStateFlow()

    // User Profile & Auth
    private val _isLoggedIn = MutableStateFlow(prefs.getBoolean(KEY_IS_LOGGED_IN, false))
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _authProvider = MutableStateFlow(prefs.getString(KEY_AUTH_PROVIDER, "GOOGLE") ?: "GOOGLE")
    val authProvider: StateFlow<String> = _authProvider.asStateFlow()

    private val _userFriendToken = MutableStateFlow(getOrGenerateFriendToken())
    val userFriendToken: StateFlow<String> = _userFriendToken.asStateFlow()

    private val _communityToken = MutableStateFlow(prefs.getString(KEY_COMMUNITY_TOKEN, "COM-VIDA-9921") ?: "COM-VIDA-9921")
    val communityToken: StateFlow<String> = _communityToken.asStateFlow()

    private val _userBio = MutableStateFlow(prefs.getString(KEY_USER_BIO, "Caminando cada día en la gracia y amor de Dios ✨") ?: "Caminando cada día en la gracia y amor de Dios ✨")
    val userBio: StateFlow<String> = _userBio.asStateFlow()

    private val _accountType = MutableStateFlow(getSavedAccountType())
    val accountType: StateFlow<UserAccountType> = _accountType.asStateFlow()

    private val _userName = MutableStateFlow(prefs.getString(KEY_USER_NAME, "Juan Santiago") ?: "Juan Santiago")
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _userAge = MutableStateFlow(prefs.getString(KEY_USER_AGE, "") ?: "")
    val userAge: StateFlow<String> = _userAge.asStateFlow()

    private val _userAvatarEmoji = MutableStateFlow(prefs.getString(KEY_USER_AVATAR, "✨") ?: "✨")
    val userAvatarEmoji: StateFlow<String> = _userAvatarEmoji.asStateFlow()

    private val _userEmail = MutableStateFlow(prefs.getString(KEY_USER_EMAIL, "") ?: "")
    val userEmail: StateFlow<String> = _userEmail.asStateFlow()

    private val _isGoogleConnected = MutableStateFlow(prefs.getBoolean(KEY_GOOGLE_CONNECTED, false))
    val isGoogleConnected: StateFlow<Boolean> = _isGoogleConnected.asStateFlow()

    private val _groupName = MutableStateFlow(prefs.getString(KEY_GROUP_NAME, "Grupo de Conexión") ?: "Grupo de Conexión")
    val groupName: StateFlow<String> = _groupName.asStateFlow()

    private val _churchName = MutableStateFlow(prefs.getString(KEY_CHURCH_NAME, "Mi Iglesia") ?: "Mi Iglesia")
    val churchName: StateFlow<String> = _churchName.asStateFlow()

    private val _leaderName = MutableStateFlow(prefs.getString(KEY_LEADER_NAME, "") ?: "")
    val leaderName: StateFlow<String> = _leaderName.asStateFlow()

    private val _leaderPhone = MutableStateFlow(prefs.getString(KEY_LEADER_PHONE, "") ?: "")
    val leaderPhone: StateFlow<String> = _leaderPhone.asStateFlow()

    private val _leaderEmail = MutableStateFlow(prefs.getString(KEY_LEADER_EMAIL, "") ?: "")
    val leaderEmail: StateFlow<String> = _leaderEmail.asStateFlow()

    private fun getOrGenerateFriendToken(): String {
        val existing = prefs.getString(KEY_USER_FRIEND_TOKEN, null)
        if (!existing.isNullOrBlank()) return existing
        val randomNum = (1000..9999).random()
        val token = "R07-JUAN-$randomNum"
        prefs.edit().putString(KEY_USER_FRIEND_TOKEN, token).apply()
        return token
    }

    fun generateNewFriendToken(prefixName: String = "USER"): String {
        val cleanPrefix = prefixName.trim().filter { it.isLetter() }.uppercase().take(6).ifEmpty { "R07" }
        val randomNum = (1000..9999).random()
        val newToken = "R07-$cleanPrefix-$randomNum"
        prefs.edit().putString(KEY_USER_FRIEND_TOKEN, newToken).apply()
        _userFriendToken.value = newToken
        return newToken
    }

    fun login(
        provider: String,
        name: String,
        email: String,
        avatar: String = "🌸"
    ) {
        val token = if (_userFriendToken.value.isBlank()) generateNewFriendToken(name) else _userFriendToken.value
        prefs.edit()
            .putBoolean(KEY_IS_LOGGED_IN, true)
            .putString(KEY_AUTH_PROVIDER, provider)
            .putString(KEY_USER_NAME, name.trim())
            .putString(KEY_USER_EMAIL, email.trim())
            .putString(KEY_USER_AVATAR, avatar.trim())
            .putBoolean(KEY_GOOGLE_CONNECTED, provider.equals("GOOGLE", ignoreCase = true))
            .putString(KEY_USER_FRIEND_TOKEN, token)
            .apply()

        _isLoggedIn.value = true
        _authProvider.value = provider
        _userName.value = name.trim()
        _userEmail.value = email.trim()
        _userAvatarEmoji.value = avatar.trim()
        _isGoogleConnected.value = provider.equals("GOOGLE", ignoreCase = true)
        _userFriendToken.value = token
    }

    fun logout() {
        prefs.edit()
            .putBoolean(KEY_IS_LOGGED_IN, false)
            .remove(KEY_EDITION)
            .apply()
        _isLoggedIn.value = false
        _selectedEdition.value = null
    }

    fun setCommunityInfo(name: String, church: String, token: String) {
        prefs.edit()
            .putString(KEY_GROUP_NAME, name.trim())
            .putString(KEY_CHURCH_NAME, church.trim())
            .putString(KEY_COMMUNITY_TOKEN, token.trim())
            .apply()
        _groupName.value = name.trim()
        _churchName.value = church.trim()
        _communityToken.value = token.trim()
    }

    fun setUserBio(bio: String) {
        prefs.edit().putString(KEY_USER_BIO, bio.trim()).apply()
        _userBio.value = bio.trim()
    }

    private fun getSavedAccountType(): UserAccountType {
        val raw = prefs.getString(KEY_ACCOUNT_TYPE, UserAccountType.CONNECTION_GROUP.name) ?: UserAccountType.CONNECTION_GROUP.name
        return try {
            UserAccountType.valueOf(raw)
        } catch (e: Exception) {
            UserAccountType.CONNECTION_GROUP
        }
    }

    private fun getSavedEdition(): AppEdition? {
        val raw = prefs.getString(KEY_EDITION, null) ?: return null
        return try {
            AppEdition.valueOf(raw)
        } catch (e: Exception) {
            null
        }
    }

    private fun getSavedThemeMode(): AppThemeMode {
        val raw = prefs.getString(KEY_THEME_MODE, AppThemeMode.LIGHT.name) ?: AppThemeMode.LIGHT.name
        return try {
            AppThemeMode.valueOf(raw)
        } catch (e: Exception) {
            AppThemeMode.LIGHT
        }
    }

    private fun getSavedFontFamily(): AppFontFamily {
        val raw = prefs.getString(KEY_FONT_FAMILY, AppFontFamily.DEFAULT.name) ?: AppFontFamily.DEFAULT.name
        return try {
            AppFontFamily.valueOf(raw)
        } catch (e: Exception) {
            AppFontFamily.DEFAULT
        }
    }

    private fun getSavedLogoTheme(): AppLogoTheme {
        val raw = prefs.getString(KEY_LOGO_THEME, AppLogoTheme.DYNAMIC.name) ?: AppLogoTheme.DYNAMIC.name
        return try {
            AppLogoTheme.valueOf(raw)
        } catch (e: Exception) {
            AppLogoTheme.DYNAMIC
        }
    }

    private fun getSavedLogoSymbol(): AppLogoSymbol {
        val raw = prefs.getString(KEY_LOGO_SYMBOL, AppLogoSymbol.DOVE_CROSS.name) ?: AppLogoSymbol.DOVE_CROSS.name
        return try {
            AppLogoSymbol.valueOf(raw)
        } catch (e: Exception) {
            AppLogoSymbol.DOVE_CROSS
        }
    }

    private fun getSavedPalette(): AppColorPalette {
        val raw = prefs.getString(KEY_PALETTE, null)
        if (raw != null) {
            try {
                return AppColorPalette.valueOf(raw)
            } catch (e: Exception) { }
        }
        val edition = getSavedEdition()
        return if (edition == AppEdition.MEN) AppColorPalette.MEN_BLUE else AppColorPalette.WOMEN_PINK
    }

    fun setFontFamily(fontFamily: AppFontFamily) {
        prefs.edit().putString(KEY_FONT_FAMILY, fontFamily.name).apply()
        _fontFamily.value = fontFamily
    }

    fun setLogoTheme(logoTheme: AppLogoTheme) {
        prefs.edit().putString(KEY_LOGO_THEME, logoTheme.name).apply()
        _logoTheme.value = logoTheme
    }

    fun setLogoSymbol(logoSymbol: AppLogoSymbol) {
        prefs.edit().putString(KEY_LOGO_SYMBOL, logoSymbol.name).apply()
        _logoSymbol.value = logoSymbol
    }

    fun setUserPhotoUri(uri: String) {
        prefs.edit().putString(KEY_USER_PHOTO_URI, uri.trim()).apply()
        _userPhotoUri.value = uri.trim()
    }

    fun removeUserPhotoUri() {
        prefs.edit().remove(KEY_USER_PHOTO_URI).apply()
        _userPhotoUri.value = ""
    }

    fun setAccountType(type: UserAccountType) {
        prefs.edit().putString(KEY_ACCOUNT_TYPE, type.name).apply()
        _accountType.value = type
    }

    fun setUserProfile(
        name: String,
        age: String,
        avatar: String,
        email: String,
        accountType: UserAccountType,
        groupName: String,
        churchName: String,
        isGoogleConnected: Boolean = true
    ) {
        prefs.edit()
            .putString(KEY_USER_NAME, name.trim())
            .putString(KEY_USER_AGE, age.trim())
            .putString(KEY_USER_AVATAR, avatar.trim())
            .putString(KEY_USER_EMAIL, email.trim())
            .putString(KEY_ACCOUNT_TYPE, accountType.name)
            .putString(KEY_GROUP_NAME, groupName.trim())
            .putString(KEY_CHURCH_NAME, churchName.trim())
            .putBoolean(KEY_GOOGLE_CONNECTED, isGoogleConnected)
            .apply()
        _userName.value = name.trim()
        _userAge.value = age.trim()
        _userAvatarEmoji.value = avatar.trim()
        _userEmail.value = email.trim()
        _accountType.value = accountType
        _groupName.value = groupName.trim()
        _churchName.value = churchName.trim()
        _isGoogleConnected.value = isGoogleConnected
    }

    fun setEdition(edition: AppEdition) {
        prefs.edit().putString(KEY_EDITION, edition.name).apply()
        _selectedEdition.value = edition
        // Sync default palette if not explicitly customized
        val currentPal = _colorPalette.value
        if (edition == AppEdition.MEN && currentPal == AppColorPalette.WOMEN_PINK) {
            setPalette(AppColorPalette.MEN_BLUE)
        } else if (edition == AppEdition.WOMEN && currentPal == AppColorPalette.MEN_BLUE) {
            setPalette(AppColorPalette.WOMEN_PINK)
        }
    }

    fun setThemeMode(mode: AppThemeMode) {
        prefs.edit().putString(KEY_THEME_MODE, mode.name).apply()
        _themeMode.value = mode
    }

    fun setPalette(palette: AppColorPalette) {
        prefs.edit().putString(KEY_PALETTE, palette.name).apply()
        _colorPalette.value = palette
    }

    fun setLeaderContact(name: String, phone: String, email: String) {
        prefs.edit()
            .putString(KEY_LEADER_NAME, name.trim())
            .putString(KEY_LEADER_PHONE, phone.trim())
            .putString(KEY_LEADER_EMAIL, email.trim())
            .apply()
        _leaderName.value = name.trim()
        _leaderPhone.value = phone.trim()
        _leaderEmail.value = email.trim()
    }

    fun isFirstLaunch(): Boolean {
        return !prefs.contains(KEY_EDITION)
    }

    companion object {
        private const val KEY_IS_LOGGED_IN = "key_is_logged_in"
        private const val KEY_AUTH_PROVIDER = "key_auth_provider"
        private const val KEY_USER_FRIEND_TOKEN = "key_user_friend_token"
        private const val KEY_COMMUNITY_TOKEN = "key_community_token"
        private const val KEY_USER_BIO = "key_user_bio"
        private const val KEY_EDITION = "key_user_edition"
        private const val KEY_THEME_MODE = "key_theme_mode"
        private const val KEY_PALETTE = "key_color_palette"
        private const val KEY_FONT_FAMILY = "key_font_family"
        private const val KEY_LOGO_THEME = "key_logo_theme"
        private const val KEY_LOGO_SYMBOL = "key_logo_symbol"
        private const val KEY_USER_PHOTO_URI = "key_user_photo_uri"
        private const val KEY_ACCOUNT_TYPE = "key_account_type"
        private const val KEY_USER_NAME = "key_user_name"
        private const val KEY_USER_AGE = "key_user_age"
        private const val KEY_USER_AVATAR = "key_user_avatar"
        private const val KEY_USER_EMAIL = "key_user_email"
        private const val KEY_GOOGLE_CONNECTED = "key_google_connected"
        private const val KEY_GROUP_NAME = "key_group_name"
        private const val KEY_CHURCH_NAME = "key_church_name"
        private const val KEY_LEADER_NAME = "key_leader_name"
        private const val KEY_LEADER_PHONE = "key_leader_phone"
        private const val KEY_LEADER_EMAIL = "key_leader_email"

        @Volatile
        private var INSTANCE: AppPreferences? = null

        fun getInstance(context: Context): AppPreferences {
            return INSTANCE ?: synchronized(this) {
                val instance = AppPreferences(context.applicationContext)
                INSTANCE = instance
                instance
            }
        }
    }
}
