package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.data.bible.BibleService
import com.example.data.bible.BibleVersion
import com.example.data.local.AppColorPalette
import com.example.data.local.AppEdition
import com.example.data.local.AppPreferences
import com.example.data.local.AppThemeMode
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Agenda R07", appName)
  }

  @Test
  fun `verify bible has 66 canonical books`() {
    assertEquals(66, BibleService.all66Books.size)
    assertEquals("Génesis", BibleService.all66Books.first().name)
    assertEquals("Apocalipsis", BibleService.all66Books.last().name)
  }

  @Test
  fun `verify offline core verses exist for both RVR and NTV`() {
    val rvrVerses = BibleService.offlineCoreVerses.filter { it.version == BibleVersion.RVR1960 }
    val ntvVerses = BibleService.offlineCoreVerses.filter { it.version == BibleVersion.NTV }
    assertTrue(rvrVerses.isNotEmpty())
    assertTrue(ntvVerses.isNotEmpty())
  }

  @Test
  fun `verify preferences persistence for edition and theme`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val prefs = AppPreferences.getInstance(context)
    prefs.setEdition(AppEdition.MEN)
    assertEquals(AppEdition.MEN, prefs.selectedEdition.value)

    prefs.setThemeMode(AppThemeMode.DARK)
    assertEquals(AppThemeMode.DARK, prefs.themeMode.value)

    prefs.setPalette(AppColorPalette.ROYAL_GOLD)
    assertEquals(AppColorPalette.ROYAL_GOLD, prefs.colorPalette.value)
  }
}
