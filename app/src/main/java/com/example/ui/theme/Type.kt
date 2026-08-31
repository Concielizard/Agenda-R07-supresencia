package com.example.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.example.data.local.AppFontFamily

fun getComposeFontFamily(appFontFamily: AppFontFamily): FontFamily {
    return when (appFontFamily) {
        AppFontFamily.DEFAULT -> FontFamily.Default
        AppFontFamily.SERIF -> FontFamily.Serif
        AppFontFamily.SANS_SERIF -> FontFamily.SansSerif
        AppFontFamily.CURSIVE -> FontFamily.Cursive
        AppFontFamily.MONOSPACE -> FontFamily.Monospace
    }
}

fun getAppTypography(appFontFamily: AppFontFamily = AppFontFamily.DEFAULT): Typography {
    val family = getComposeFontFamily(appFontFamily)
    return Typography(
        headlineLarge = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Black,
            fontSize = 28.sp,
            lineHeight = 34.sp,
            letterSpacing = (-0.2).sp
        ),
        headlineMedium = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.ExtraBold,
            fontSize = 22.sp,
            lineHeight = 28.sp,
            letterSpacing = 0.sp
        ),
        headlineSmall = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp,
            lineHeight = 24.sp,
            letterSpacing = 0.sp
        ),
        titleLarge = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Bold,
            fontSize = 18.sp,
            lineHeight = 24.sp,
            letterSpacing = 0.1.sp
        ),
        titleMedium = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp,
            lineHeight = 21.sp,
            letterSpacing = 0.15.sp
        ),
        titleSmall = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.SemiBold,
            fontSize = 13.sp,
            lineHeight = 18.sp,
            letterSpacing = 0.1.sp
        ),
        bodyLarge = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Normal,
            fontSize = 15.sp,
            lineHeight = 22.sp,
            letterSpacing = 0.2.sp
        ),
        bodyMedium = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Normal,
            fontSize = 13.sp,
            lineHeight = 19.sp,
            letterSpacing = 0.25.sp
        ),
        bodySmall = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Normal,
            fontSize = 11.5.sp,
            lineHeight = 16.sp,
            letterSpacing = 0.3.sp
        ),
        labelLarge = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Bold,
            fontSize = 13.sp,
            lineHeight = 18.sp,
            letterSpacing = 0.4.sp
        ),
        labelMedium = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.SemiBold,
            fontSize = 11.5.sp,
            lineHeight = 16.sp,
            letterSpacing = 0.4.sp
        ),
        labelSmall = TextStyle(
            fontFamily = family,
            fontWeight = FontWeight.Medium,
            fontSize = 10.sp,
            lineHeight = 14.sp,
            letterSpacing = 0.5.sp
        )
    )
}

val Typography = getAppTypography(AppFontFamily.DEFAULT)

