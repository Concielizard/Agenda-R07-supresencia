package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.data.local.AppColorPalette
import com.example.data.local.AppEdition
import com.example.data.local.AppThemeMode
import com.example.ui.R07MainScreen
import com.example.ui.R07ViewModel
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val viewModel: R07ViewModel = viewModel()
            val userEdition by viewModel.userEdition.collectAsStateWithLifecycle()
            val themeMode by viewModel.themeMode.collectAsStateWithLifecycle()
            val colorPalette by viewModel.colorPalette.collectAsStateWithLifecycle()
            val fontFamily by viewModel.fontFamily.collectAsStateWithLifecycle()

            val effectiveEdition = userEdition ?: AppEdition.WOMEN
            val systemDark = isSystemInDarkTheme()
            val isDark = when (themeMode) {
                AppThemeMode.SYSTEM -> systemDark
                AppThemeMode.LIGHT -> false
                AppThemeMode.DARK -> true
            }

            MyApplicationTheme(
                edition = effectiveEdition,
                palette = colorPalette,
                fontFamily = fontFamily,
                darkTheme = isDark
            ) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    R07MainScreen(viewModel = viewModel)
                }
            }
        }
    }
}



