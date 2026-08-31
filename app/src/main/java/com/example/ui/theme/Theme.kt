package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import com.example.data.local.AppColorPalette
import com.example.data.local.AppEdition
import com.example.data.local.AppFontFamily

@Composable
fun MyApplicationTheme(
    edition: AppEdition = AppEdition.WOMEN,
    palette: AppColorPalette = if (edition == AppEdition.MEN) AppColorPalette.MEN_BLUE else AppColorPalette.WOMEN_PINK,
    fontFamily: AppFontFamily = AppFontFamily.DEFAULT,
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val editionColors = getThemeColors(palette, darkTheme)
    val typography = getAppTypography(fontFamily)

    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = editionColors.primary,
            onPrimary = editionColors.onPrimary,
            primaryContainer = editionColors.primaryContainer,
            onPrimaryContainer = editionColors.primaryLight,
            secondary = editionColors.secondary,
            onSecondary = Color.White,
            background = editionColors.background,
            onBackground = editionColors.textPrimary,
            surface = editionColors.surface,
            onSurface = editionColors.textPrimary,
            surfaceVariant = editionColors.surfaceVariant,
            onSurfaceVariant = editionColors.textSecondary,
            outline = editionColors.border
        )
    } else {
        lightColorScheme(
            primary = editionColors.primary,
            onPrimary = editionColors.onPrimary,
            primaryContainer = editionColors.primaryContainer,
            onPrimaryContainer = editionColors.primaryDark,
            secondary = editionColors.secondary,
            onSecondary = Color.White,
            background = editionColors.background,
            onBackground = editionColors.textPrimary,
            surface = editionColors.surface,
            onSurface = editionColors.textPrimary,
            surfaceVariant = editionColors.surfaceVariant,
            onSurfaceVariant = editionColors.textSecondary,
            outline = editionColors.border
        )
    }

    CompositionLocalProvider(
        LocalAppEdition provides edition,
        LocalR07Colors provides editionColors
    ) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = typography,
            content = content
        )
    }
}

