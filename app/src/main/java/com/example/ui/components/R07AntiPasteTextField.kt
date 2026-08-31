package com.example.ui.components

import android.widget.Toast
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalTextToolbar
import androidx.compose.ui.platform.TextToolbar
import androidx.compose.ui.platform.TextToolbarStatus
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.R07Theme

/**
 * Text field that prevents pasting text from external apps into devotional blocks.
 * Encourages authentic, personal devotional meditation and typing.
 */
@Composable
fun R07AntiPasteTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    minLines: Int = 3,
    maxLines: Int = 10,
    singleLine: Boolean = false,
    textStyle: TextStyle = MaterialTheme.typography.bodyMedium.copy(
        fontSize = 14.sp,
        lineHeight = 22.sp,
        fontWeight = FontWeight.Medium
    ),
    onPasteBlocked: (() -> Unit)? = null
) {
    val context = LocalContext.current
    val colors = R07Theme.colors

    // Custom TextToolbar that disables clipboard paste option
    val noPasteToolbar = remember {
        object : TextToolbar {
            override val status: TextToolbarStatus = TextToolbarStatus.Hidden
            override fun hide() {}
            override fun showMenu(
                rect: Rect,
                onCopyRequested: (() -> Unit)?,
                onPasteRequested: (() -> Unit)?,
                onCutRequested: (() -> Unit)?,
                onSelectAllRequested: (() -> Unit)?
            ) {
                // By omitting onPasteRequested, the paste button is removed from context menu
            }
        }
    }

    CompositionLocalProvider(LocalTextToolbar provides noPasteToolbar) {
        OutlinedTextField(
            value = value,
            onValueChange = { newValue ->
                val lengthDiff = newValue.length - value.length
                // Detect sudden large text insertion (paste attempt)
                if (lengthDiff > 8) {
                    Toast.makeText(
                        context,
                        "✍️ Escribe tu reflexión directamente. No se permite pegar texto externo.",
                        Toast.LENGTH_SHORT
                    ).show()
                    onPasteBlocked?.invoke()
                } else {
                    onValueChange(newValue)
                }
            },
            placeholder = {
                Text(
                    text = placeholder,
                    style = textStyle.copy(
                        color = colors.textMuted,
                        fontSize = 13.sp
                    )
                )
            },
            modifier = modifier.fillMaxWidth(),
            minLines = minLines,
            maxLines = maxLines,
            singleLine = singleLine,
            textStyle = textStyle.copy(color = colors.textPrimary),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Transparent,
                unfocusedBorderColor = Color.Transparent,
                focusedContainerColor = Color.Transparent,
                unfocusedContainerColor = Color.Transparent,
                focusedTextColor = colors.textPrimary,
                unfocusedTextColor = colors.textPrimary,
                cursorColor = colors.primary
            )
        )
    }
}
