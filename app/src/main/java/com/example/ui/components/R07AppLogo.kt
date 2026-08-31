package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.AppLogoSymbol
import com.example.data.local.AppLogoTheme
import com.example.ui.theme.R07Theme

@Composable
fun R07AppLogo(
    modifier: Modifier = Modifier,
    size: Dp = 38.dp,
    logoTheme: AppLogoTheme = AppLogoTheme.DYNAMIC,
    logoSymbol: AppLogoSymbol = AppLogoSymbol.DOVE_CROSS,
    showBrandText: Boolean = false,
    subtitle: String = "AGENDA DEVOCIONAL"
) {
    val activeColors = R07Theme.colors

    val primaryColor = if (logoTheme == AppLogoTheme.DYNAMIC) {
        activeColors.primary
    } else {
        Color(logoTheme.primaryHex)
    }

    val containerColor = if (logoTheme == AppLogoTheme.DYNAMIC) {
        activeColors.primaryContainer
    } else {
        Color(logoTheme.bgHex)
    }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier.testTag("app_logo_component")
    ) {
        Box(
            modifier = Modifier
                .size(size)
                .shadow(elevation = 2.dp, shape = CircleShape)
                .clip(CircleShape)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            containerColor.copy(alpha = 0.9f),
                            primaryColor.copy(alpha = 0.25f)
                        )
                    )
                )
                .border(1.5.dp, primaryColor, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = logoSymbol.symbolChar,
                fontSize = (size.value * 0.48f).sp
            )
        }

        if (showBrandText) {
            Spacer(modifier = Modifier.width(10.dp))
            androidx.compose.foundation.layout.Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "AGENDA",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Black,
                        color = activeColors.textPrimary,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = primaryColor
                    ) {
                        Text(
                            text = "R07",
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Black,
                            fontSize = 11.sp,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                        )
                    }
                }
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.labelSmall,
                    color = activeColors.textMuted,
                    fontSize = 9.5.sp,
                    letterSpacing = 0.8.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
