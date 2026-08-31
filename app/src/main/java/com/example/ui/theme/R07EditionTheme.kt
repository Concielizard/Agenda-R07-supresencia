package com.example.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import com.example.data.local.AppColorPalette
import com.example.data.local.AppEdition

data class R07EditionColors(
    val isDark: Boolean,
    val isMen: Boolean,
    val primary: Color,
    val primaryDark: Color,
    val primaryLight: Color,
    val primaryContainer: Color,
    val onPrimary: Color,
    val secondary: Color,
    val background: Color,
    val surface: Color,
    val surfaceVariant: Color,
    val cardBackground: Color,
    val border: Color,
    val borderStrong: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textMuted: Color,
    val badgeBackground: Color,
    val badgeText: Color,
    val tableHeaderBg: Color,
    val tableRowEvenBg: Color,
    val tableRowOddBg: Color,
    val tableDivider: Color,
    val accentSuccess: Color = Color(0xFF1B5E20),
    val accentSuccessBg: Color = Color(0xFFE8F5E9)
)

// =========================================================================
// 1. ROSA PASTEL & CREMA (Auténtico Pastel Suave, Petal Pink, Alto Contraste)
// =========================================================================
val RosaPastelLightColors = R07EditionColors(
    isDark = false,
    isMen = false,
    primary = Color(0xFFD85880), // Soft refined pastel rosewood (4.8:1 contrast on cream-rose)
    primaryDark = Color(0xFF9E2B50),
    primaryLight = Color(0xFFF08CAE),
    primaryContainer = Color(0xFFFDE7EE), // Delicate pastel blush
    onPrimary = Color.White,
    secondary = Color(0xFFE27396),
    background = Color(0xFFFFF5F8), // Pure pastel rose-cream background
    surface = Color.White,
    surfaceVariant = Color(0xFFFDEAF0),
    cardBackground = Color.White,
    border = Color(0xFFF7CCD8),
    borderStrong = Color(0xFFD85880),
    textPrimary = Color(0xFF1F1017), // Deep berry charcoal (15:1 contrast)
    textSecondary = Color(0xFF543644), // Highly legible subtext (7:1 contrast)
    textMuted = Color(0xFF7E5B6D), // 4.6:1 contrast
    badgeBackground = Color(0xFFFDE7EE),
    badgeText = Color(0xFFB83A64),
    tableHeaderBg = Color(0xFFD85880),
    tableRowEvenBg = Color.White,
    tableRowOddBg = Color(0xFFFFF7F9),
    tableDivider = Color(0xFFF7CCD8),
    accentSuccess = Color(0xFF2E7D32),
    accentSuccessBg = Color(0xFFE8F5E9)
)

val RosaPastelDarkColors = R07EditionColors(
    isDark = true,
    isMen = false,
    primary = Color(0xFFF8A4BD), // Luminous soft pastel rose (7.5:1 on dark surface)
    primaryDark = Color(0xFFD85880),
    primaryLight = Color(0xFFFFD0DE),
    primaryContainer = Color(0xFF3D1B28), // Rich deep ash-rose container
    onPrimary = Color(0xFF3E0A1D),
    secondary = Color(0xFFF48FB1),
    background = Color(0xFF160E12), // Deep berry-tinted charcoal
    surface = Color(0xFF22161C), // Elevated soft dark berry surface
    surfaceVariant = Color(0xFF2F1F27),
    cardBackground = Color(0xFF22161C),
    border = Color(0xFF4D313E),
    borderStrong = Color(0xFFF8A4BD),
    textPrimary = Color(0xFFFFF0F5), // Ultra-crisp high-contrast rose-white (14:1)
    textSecondary = Color(0xFFE1BDCC), // Soft readable lilac-rose (8.5:1)
    textMuted = Color(0xFFAD8B9B), // 4.8:1
    badgeBackground = Color(0xFF3D1B28),
    badgeText = Color(0xFFF8A4BD),
    tableHeaderBg = Color(0xFF9E2B50),
    tableRowEvenBg = Color(0xFF22161C),
    tableRowOddBg = Color(0xFF2A1C23),
    tableDivider = Color(0xFF4D313E),
    accentSuccess = Color(0xFF81C784),
    accentSuccessBg = Color(0xFF1B3820)
)

// =========================================================================
// 2. AZUL REY & ARENA (Sobrio, Distinguido, Azul Marino & Pergamino)
// =========================================================================
val MenEditionColors = R07EditionColors(
    isDark = false,
    isMen = true,
    primary = Color(0xFF0D47A1), // Royal Navy Blue
    primaryDark = Color(0xFF072B66),
    primaryLight = Color(0xFF1976D2),
    primaryContainer = Color(0xFFE3F2FD),
    onPrimary = Color.White,
    secondary = Color(0xFF1565C0),
    background = Color(0xFFF7F3EB), // Warm sand parchment background
    surface = Color.White,
    surfaceVariant = Color(0xFFECE5D8),
    cardBackground = Color.White,
    border = Color(0xFFD5C8B4),
    borderStrong = Color(0xFF0D47A1),
    textPrimary = Color(0xFF11161C), // Ebony slate text
    textSecondary = Color(0xFF344050),
    textMuted = Color(0xFF5D6D82),
    badgeBackground = Color(0xFFE3F2FD),
    badgeText = Color(0xFF0D47A1),
    tableHeaderBg = Color(0xFF0D47A1),
    tableRowEvenBg = Color.White,
    tableRowOddBg = Color(0xFFFBF8F3),
    tableDivider = Color(0xFFDFD4C4),
    accentSuccess = Color(0xFF1B5E20),
    accentSuccessBg = Color(0xFFE8F5E9)
)

val MenDarkColors = R07EditionColors(
    isDark = true,
    isMen = true,
    primary = Color(0xFF82B1FF), // Bright Royal Azure Blue
    primaryDark = Color(0xFF1565C0),
    primaryLight = Color(0xFFB3D4FF),
    primaryContainer = Color(0xFF102A4C), // Deep royal navy container
    onPrimary = Color(0xFF001B3B),
    secondary = Color(0xFF448AFF),
    background = Color(0xFF0C121B), // Deep navy night background
    surface = Color(0xFF151E2B), // Distinct blue-slate surface
    surfaceVariant = Color(0xFF202D3E),
    cardBackground = Color(0xFF151E2B),
    border = Color(0xFF2E425E),
    borderStrong = Color(0xFF82B1FF),
    textPrimary = Color(0xFFF0F4F8), // High-contrast ice white
    textSecondary = Color(0xFFBCCAD9),
    textMuted = Color(0xFF8395A8),
    badgeBackground = Color(0xFF102A4C),
    badgeText = Color(0xFF82B1FF),
    tableHeaderBg = Color(0xFF0D47A1),
    tableRowEvenBg = Color(0xFF151E2B),
    tableRowOddBg = Color(0xFF1A2535),
    tableDivider = Color(0xFF2E425E),
    accentSuccess = Color(0xFF81C784),
    accentSuccessBg = Color(0xFF1B3820)
)

// =========================================================================
// 3. SALVIA & OLIVO PAZ (Natural, Sereno, Calma Botánica)
// =========================================================================
val OliveSageLightColors = R07EditionColors(
    isDark = false,
    isMen = false,
    primary = Color(0xFF2E6F40), // Deep Olive Botanical Green
    primaryDark = Color(0xFF1B4326),
    primaryLight = Color(0xFF438A56),
    primaryContainer = Color(0xFFE2F3E7),
    onPrimary = Color.White,
    secondary = Color(0xFF388E3C),
    background = Color(0xFFF2F7F4),
    surface = Color.White,
    surfaceVariant = Color(0xFFE5EEE7),
    cardBackground = Color.White,
    border = Color(0xFFC7DBCB),
    borderStrong = Color(0xFF2E6F40),
    textPrimary = Color(0xFF0E2315),
    textSecondary = Color(0xFF284431),
    textMuted = Color(0xFF55735E),
    badgeBackground = Color(0xFFE2F3E7),
    badgeText = Color(0xFF245D35),
    tableHeaderBg = Color(0xFF2E6F40),
    tableRowEvenBg = Color.White,
    tableRowOddBg = Color(0xFFF3F8F5),
    tableDivider = Color(0xFFC7DBCB),
    accentSuccess = Color(0xFF2E7D32),
    accentSuccessBg = Color(0xFFE8F5E9)
)

val OliveSageDarkColors = R07EditionColors(
    isDark = true,
    isMen = false,
    primary = Color(0xFF81C784), // Luminous Sage Green
    primaryDark = Color(0xFF2E6F40),
    primaryLight = Color(0xFFA5D6A7),
    primaryContainer = Color(0xFF163820),
    onPrimary = Color(0xFF04210C),
    secondary = Color(0xFF66BB6A),
    background = Color(0xFF0E1611),
    surface = Color(0xFF17231B),
    surfaceVariant = Color(0xFF223126),
    cardBackground = Color(0xFF17231B),
    border = Color(0xFF2F4534),
    borderStrong = Color(0xFF81C784),
    textPrimary = Color(0xFFEBF7ED),
    textSecondary = Color(0xFFB8D4BF),
    textMuted = Color(0xFF82A68B),
    badgeBackground = Color(0xFF163820),
    badgeText = Color(0xFF81C784),
    tableHeaderBg = Color(0xFF245732),
    tableRowEvenBg = Color(0xFF17231B),
    tableRowOddBg = Color(0xFF1E2C22),
    tableDivider = Color(0xFF2F4534),
    accentSuccess = Color(0xFF81C784),
    accentSuccessBg = Color(0xFF163820)
)

// =========================================================================
// 4. ORO CLÁSICO & MARFIL (Ámbar Cálido, Pergamino Sagrado)
// =========================================================================
val RoyalGoldLightColors = R07EditionColors(
    isDark = false,
    isMen = false,
    primary = Color(0xFF996515), // Warm Gold / Amber
    primaryDark = Color(0xFF664106),
    primaryLight = Color(0xFFC58B2E),
    primaryContainer = Color(0xFFFFF4D9),
    onPrimary = Color.White,
    secondary = Color(0xFFB8860B),
    background = Color(0xFFFAF6EE),
    surface = Color.White,
    surfaceVariant = Color(0xFFF3EDE0),
    cardBackground = Color.White,
    border = Color(0xFFE2D6BE),
    borderStrong = Color(0xFF996515),
    textPrimary = Color(0xFF21180B),
    textSecondary = Color(0xFF4C3E28),
    textMuted = Color(0xFF7D6C52),
    badgeBackground = Color(0xFFFFF4D9),
    badgeText = Color(0xFF8C5B0E),
    tableHeaderBg = Color(0xFF996515),
    tableRowEvenBg = Color.White,
    tableRowOddBg = Color(0xFFFBF8F2),
    tableDivider = Color(0xFFE2D6BE),
    accentSuccess = Color(0xFF2E7D32),
    accentSuccessBg = Color(0xFFE8F5E9)
)

val RoyalGoldDarkColors = R07EditionColors(
    isDark = true,
    isMen = false,
    primary = Color(0xFFFFD54F), // Radiant Divine Gold
    primaryDark = Color(0xFF996515),
    primaryLight = Color(0xFFFFE082),
    primaryContainer = Color(0xFF382A0B),
    onPrimary = Color(0xFF332000),
    secondary = Color(0xFFFFCA28),
    background = Color(0xFF14120D),
    surface = Color(0xFF201D16),
    surfaceVariant = Color(0xFF2C271E),
    cardBackground = Color(0xFF201D16),
    border = Color(0xFF443B2C),
    borderStrong = Color(0xFFFFD54F),
    textPrimary = Color(0xFFFFF8E7),
    textSecondary = Color(0xFFDFD2BC),
    textMuted = Color(0xFFA8987E),
    badgeBackground = Color(0xFF382A0B),
    badgeText = Color(0xFFFFD54F),
    tableHeaderBg = Color(0xFF7A510E),
    tableRowEvenBg = Color(0xFF201D16),
    tableRowOddBg = Color(0xFF27231B),
    tableDivider = Color(0xFF443B2C),
    accentSuccess = Color(0xFF81C784),
    accentSuccessBg = Color(0xFF1B3820)
)

// =========================================================================
// 5. LAVANDA PASTEL & LIRIO (Etéreo, Lila Suave, Místico, NUNCA Negro Plano)
// =========================================================================
val LavenderPastelLightColors = R07EditionColors(
    isDark = false,
    isMen = false,
    primary = Color(0xFF6F42C1), // Pastel Royal Lavender
    primaryDark = Color(0xFF4A238C),
    primaryLight = Color(0xFF9B72CF),
    primaryContainer = Color(0xFFF0E8FA),
    onPrimary = Color.White,
    secondary = Color(0xFF825CB8),
    background = Color(0xFFF8F4FD),
    surface = Color.White,
    surfaceVariant = Color(0xFFEDE3F8),
    cardBackground = Color.White,
    border = Color(0xFFDACCF2),
    borderStrong = Color(0xFF6F42C1),
    textPrimary = Color(0xFF180D2B),
    textSecondary = Color(0xFF493566),
    textMuted = Color(0xFF745D94),
    badgeBackground = Color(0xFFF0E8FA),
    badgeText = Color(0xFF5D3F8C),
    tableHeaderBg = Color(0xFF6F42C1),
    tableRowEvenBg = Color.White,
    tableRowOddBg = Color(0xFFF9F6FE),
    tableDivider = Color(0xFFDACCF2),
    accentSuccess = Color(0xFF2E7D32),
    accentSuccessBg = Color(0xFFE8F5E9)
)

val LavenderPastelDarkColors = R07EditionColors(
    isDark = true,
    isMen = false,
    primary = Color(0xFFD1B3FF), // Luminous Ethereal Lavender (8:1 on deep violet)
    primaryDark = Color(0xFF7E57C2),
    primaryLight = Color(0xFFEADCFF),
    primaryContainer = Color(0xFF372454), // Rich deep violet-slate container
    onPrimary = Color(0xFF240E3E),
    secondary = Color(0xFFB388FF),
    background = Color(0xFF130E1F), // Dark mystical violet night (NOT pure black!)
    surface = Color(0xFF1E172F), // Deep lavender-slate elevated surface
    surfaceVariant = Color(0xFF2B2142),
    cardBackground = Color(0xFF1E172F),
    border = Color(0xFF483769),
    borderStrong = Color(0xFFD1B3FF),
    textPrimary = Color(0xFFF7F2FE), // Pure lavender white (15:1)
    textSecondary = Color(0xFFD3C2EB), // 9:1
    textMuted = Color(0xFFA28FB8), // 4.8:1
    badgeBackground = Color(0xFF372454),
    badgeText = Color(0xFFD1B3FF),
    tableHeaderBg = Color(0xFF5B3891),
    tableRowEvenBg = Color(0xFF1E172F),
    tableRowOddBg = Color(0xFF261D3B),
    tableDivider = Color(0xFF483769),
    accentSuccess = Color(0xFF81C784),
    accentSuccessBg = Color(0xFF1B3820)
)

// =========================================================================
// 6. CELESTE CIELO & BRISA (Cian Hielo Cristalino, Diferenciado de Azul Rey)
// =========================================================================
val SkyPastelLightColors = R07EditionColors(
    isDark = false,
    isMen = false,
    primary = Color(0xFF0288D1), // Bright Sky Cyan
    primaryDark = Color(0xFF015384),
    primaryLight = Color(0xFF29B6F6),
    primaryContainer = Color(0xFFE1F5FE),
    onPrimary = Color.White,
    secondary = Color(0xFF039BE5),
    background = Color(0xFFEFF8FC), // Fresh airy cyan-white
    surface = Color.White,
    surfaceVariant = Color(0xFFE0F1FA),
    cardBackground = Color.White,
    border = Color(0xFFB6DCF2),
    borderStrong = Color(0xFF0288D1),
    textPrimary = Color(0xFF071B26),
    textSecondary = Color(0xFF29475C),
    textMuted = Color(0xFF53748C),
    badgeBackground = Color(0xFFE1F5FE),
    badgeText = Color(0xFF026A9C),
    tableHeaderBg = Color(0xFF0288D1),
    tableRowEvenBg = Color.White,
    tableRowOddBg = Color(0xFFF3F9FD),
    tableDivider = Color(0xFFB6DCF2),
    accentSuccess = Color(0xFF2E7D32),
    accentSuccessBg = Color(0xFFE8F5E9)
)

val SkyPastelDarkColors = R07EditionColors(
    isDark = true,
    isMen = false,
    primary = Color(0xFF4DD0E1), // Luminous Arctic Cyan (Distinct from Navy Blue!)
    primaryDark = Color(0xFF00838F),
    primaryLight = Color(0xFFB2EBF2),
    primaryContainer = Color(0xFF0A313C), // Deep arctic cyan night container
    onPrimary = Color(0xFF00272E),
    secondary = Color(0xFF26C6DA),
    background = Color(0xFF0A151A), // Dark arctic teal night
    surface = Color(0xFF112129), // Cyan-tinted slate surface
    surfaceVariant = Color(0xFF1A2E38),
    cardBackground = Color(0xFF112129),
    border = Color(0xFF264350),
    borderStrong = Color(0xFF4DD0E1),
    textPrimary = Color(0xFFEAF8FA), // Ice white (14:1)
    textSecondary = Color(0xFFB0D7DF),
    textMuted = Color(0xFF7BA1AB),
    badgeBackground = Color(0xFF0A313C),
    badgeText = Color(0xFF4DD0E1),
    tableHeaderBg = Color(0xFF006978),
    tableRowEvenBg = Color(0xFF112129),
    tableRowOddBg = Color(0xFF162832),
    tableDivider = Color(0xFF264350),
    accentSuccess = Color(0xFF81C784),
    accentSuccessBg = Color(0xFF1B3820)
)

// =========================================================================
// 7. TERRACOTA & CANELA (Cálido, Acogedor, Tierra Fértil)
// =========================================================================
val TerracottaLightColors = R07EditionColors(
    isDark = false,
    isMen = false,
    primary = Color(0xFF9E472A),
    primaryDark = Color(0xFF6D2E18),
    primaryLight = Color(0xFFC46547),
    primaryContainer = Color(0xFFFCEBE3),
    onPrimary = Color.White,
    secondary = Color(0xFFA85133),
    background = Color(0xFFFAF4F0),
    surface = Color.White,
    surfaceVariant = Color(0xFFF3E7E0),
    cardBackground = Color.White,
    border = Color(0xFFE6CDBC),
    borderStrong = Color(0xFF9E472A),
    textPrimary = Color(0xFF26130C),
    textSecondary = Color(0xFF57362B),
    textMuted = Color(0xFF875E51),
    badgeBackground = Color(0xFFFCEBE3),
    badgeText = Color(0xFF8B391E),
    tableHeaderBg = Color(0xFF9E472A),
    tableRowEvenBg = Color.White,
    tableRowOddBg = Color(0xFFFAF5F2),
    tableDivider = Color(0xFFE6CDBC),
    accentSuccess = Color(0xFF2E7D32),
    accentSuccessBg = Color(0xFFE8F5E9)
)

val TerracottaDarkColors = R07EditionColors(
    isDark = true,
    isMen = false,
    primary = Color(0xFFFFAB91),
    primaryDark = Color(0xFF9E472A),
    primaryLight = Color(0xFFFFCCBC),
    primaryContainer = Color(0xFF3E190E),
    onPrimary = Color(0xFF360C00),
    secondary = Color(0xFFFF8A65),
    background = Color(0xFF18110E),
    surface = Color(0xFF241A16),
    surfaceVariant = Color(0xFF30221D),
    cardBackground = Color(0xFF241A16),
    border = Color(0xFF4A322B),
    borderStrong = Color(0xFFFFAB91),
    textPrimary = Color(0xFFFDF1ED),
    textSecondary = Color(0xFFDFC0B6),
    textMuted = Color(0xFFA6877D),
    badgeBackground = Color(0xFF3E190E),
    badgeText = Color(0xFFFFAB91),
    tableHeaderBg = Color(0xFF7A331C),
    tableRowEvenBg = Color(0xFF241A16),
    tableRowOddBg = Color(0xFF2A1E19),
    tableDivider = Color(0xFF4A322B),
    accentSuccess = Color(0xFF81C784),
    accentSuccessBg = Color(0xFF1B3820)
)

// Legacy aliases to maintain backward compatibility
val WomenEditionColors = RosaPastelLightColors
val WomenDarkColors = RosaPastelDarkColors

fun getThemeColors(palette: AppColorPalette, isDark: Boolean): R07EditionColors {
    return when (palette) {
        AppColorPalette.WOMEN_PINK -> if (isDark) RosaPastelDarkColors else RosaPastelLightColors
        AppColorPalette.MEN_BLUE -> if (isDark) MenDarkColors else MenEditionColors
        AppColorPalette.OLIVE_SAGE -> if (isDark) OliveSageDarkColors else OliveSageLightColors
        AppColorPalette.ROYAL_GOLD -> if (isDark) RoyalGoldDarkColors else RoyalGoldLightColors
        AppColorPalette.LAVENDER_PASTEL -> if (isDark) LavenderPastelDarkColors else LavenderPastelLightColors
        AppColorPalette.SKY_PASTEL -> if (isDark) SkyPastelDarkColors else SkyPastelLightColors
        AppColorPalette.TERRACOTTA -> if (isDark) TerracottaDarkColors else TerracottaLightColors
    }
}

val LocalR07Colors = staticCompositionLocalOf { RosaPastelLightColors }
val LocalAppEdition = staticCompositionLocalOf { AppEdition.WOMEN }

object R07Theme {
    val colors: R07EditionColors
        @Composable
        @ReadOnlyComposable
        get() = LocalR07Colors.current

    val edition: AppEdition
        @Composable
        @ReadOnlyComposable
        get() = LocalAppEdition.current
}



