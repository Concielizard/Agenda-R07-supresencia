package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.OpenInFull
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.bible.BibleBookInfo
import com.example.data.bible.BibleService
import com.example.data.bible.BibleVerse
import com.example.data.bible.BibleVersion
import com.example.data.bible.FullChapterData
import com.example.data.model.SingleVerseData
import com.example.ui.theme.R07Theme
import kotlinx.coroutines.launch

enum class BibleSelectorTab(val title: String, val icon: String) {
    EXPLORER("Libros & Versículos", "📖"),
    SEARCH("Búsqueda & Temas", "🔍")
}

enum class VerseSelectionMode(val title: String, val icon: String) {
    SINGLE("1 Versículo", "📌"),
    RANGE("Rango (Inicio-Fin)", "↔️"),
    MULTI("Varios Versículos", "📑")
}

@Composable
fun R07BibleSelectorDialog(
    onDismiss: () -> Unit,
    onOpenFullReader: () -> Unit = {},
    onLoadChapter: (bookNumber: Int, chapter: Int, version: BibleVersion, onResult: (FullChapterData) -> Unit) -> Unit = { _, _, _, _ -> },
    onDownloadChapter: (bookNumber: Int, chapter: Int, version: BibleVersion) -> Unit = { _, _, _ -> },
    onVerseSelected: (citation: String, verseText: String, shouldAppendToReflection: Boolean) -> Unit
) {
    val colors = R07Theme.colors
    val clipboardManager = LocalClipboardManager.current
    val scope = rememberCoroutineScope()

    var selectedTab by remember { mutableStateOf(BibleSelectorTab.EXPLORER) }
    var selectedVersion by remember { mutableStateOf(BibleVersion.RVR1960) }
    var selectedTestament by remember { mutableStateOf("Antiguo Testamento") }
    var selectedBookNumber by remember { mutableIntStateOf(19) } // 19 = Salmos
    var selectedChapter by remember { mutableIntStateOf(23) } // Salmo 23
    var selectedVerseNum by remember { mutableIntStateOf(1) }

    // Multi-verse / Range mode state
    var selectionMode by remember { mutableStateOf(VerseSelectionMode.RANGE) }
    var rangeStartVerse by remember { mutableIntStateOf(1) }
    var rangeEndVerse by remember { mutableIntStateOf(6) }
    var selectedVersesSet by remember { mutableStateOf(setOf(1, 2, 3, 4, 5, 6)) }

    var searchQuery by remember { mutableStateOf("") }
    var selectedTopic by remember { mutableStateOf("Paz") }

    // Active Chapter data & verses list
    var loadedChapterData by remember { mutableStateOf<FullChapterData?>(null) }
    var isLoadingChapter by remember { mutableStateOf(false) }
    var isDownloadingCurrentChapter by remember { mutableStateOf(false) }
    var justDownloadedNotice by remember { mutableStateOf(false) }

    val currentBook = remember(selectedBookNumber) {
        BibleService.getBookByNumber(selectedBookNumber) ?: BibleService.all66Books[18] // Salmos
    }

    val booksForSelectedTestament = remember(selectedTestament) {
        BibleService.all66Books.filter { it.testament == selectedTestament }
    }

    // Function to load/download the chapter and all its verses
    fun fetchChapter(bookNum: Int, chap: Int, ver: BibleVersion, forceDownload: Boolean = false) {
        isLoadingChapter = true
        if (forceDownload) isDownloadingCurrentChapter = true

        onLoadChapter(bookNum, chap, ver) { data ->
            loadedChapterData = data
            isLoadingChapter = false
            isDownloadingCurrentChapter = false
            if (forceDownload) {
                justDownloadedNotice = true
            }
        }
    }

    // Automatically load chapter whenever book, chapter, or version changes
    LaunchedEffect(selectedBookNumber, selectedChapter, selectedVersion) {
        fetchChapter(selectedBookNumber, selectedChapter, selectedVersion)
    }

    val estimatedVerseCount = remember(selectedBookNumber, selectedChapter, loadedChapterData) {
        if (loadedChapterData != null && loadedChapterData!!.verses.isNotEmpty()) {
            loadedChapterData!!.verses.size
        } else {
            BibleService.getKnownVerseCount(selectedBookNumber, selectedChapter)
        }
    }

    // Ensure range bounds stay within valid limits
    LaunchedEffect(estimatedVerseCount) {
        if (rangeEndVerse > estimatedVerseCount) {
            rangeEndVerse = estimatedVerseCount.coerceAtLeast(1)
        }
        if (rangeStartVerse > estimatedVerseCount) {
            rangeStartVerse = 1
        }
        if (selectionMode == VerseSelectionMode.RANGE && selectedVersesSet.isEmpty()) {
            selectedVersesSet = (rangeStartVerse..rangeEndVerse).toSet()
        }
    }

    // Active selected verse list based on mode
    val activeSelectedVerseNumbers: List<Int> = remember(
        selectionMode,
        selectedVerseNum,
        rangeStartVerse,
        rangeEndVerse,
        selectedVersesSet,
        estimatedVerseCount
    ) {
        when (selectionMode) {
            VerseSelectionMode.SINGLE -> listOf(selectedVerseNum)
            VerseSelectionMode.RANGE -> {
                val start = minOf(rangeStartVerse, rangeEndVerse).coerceIn(1, estimatedVerseCount)
                val end = maxOf(rangeStartVerse, rangeEndVerse).coerceIn(1, estimatedVerseCount)
                (start..end).toList()
            }
            VerseSelectionMode.MULTI -> {
                if (selectedVersesSet.isEmpty()) listOf(selectedVerseNum)
                else selectedVersesSet.sorted()
            }
        }
    }

    // Helper to get text of a specific verse
    fun getVerseText(vNum: Int): String {
        val found = loadedChapterData?.verses?.find { it.verse == vNum }
        if (found != null && found.text.isNotBlank()) {
            return found.text
        }
        val offlineMatch = BibleService.offlineCoreVerses.find {
            it.book.equals(currentBook.name, ignoreCase = true) &&
                    it.chapter == selectedChapter &&
                    it.verse == vNum &&
                    it.version == selectedVersion
        }
        return offlineMatch?.text ?: "«Pasa tiempo Conmigo en ${currentBook.name} $selectedChapter:$vNum.»"
    }

    // Formatted citation (e.g. Salmos 23:1-6 o Juan 3:16-18)
    val currentCitation: String = remember(currentBook, selectedChapter, activeSelectedVerseNumbers, selectedVersion) {
        val vList = activeSelectedVerseNumbers
        val versePart = if (vList.size <= 1) {
            "${vList.firstOrNull() ?: 1}"
        } else {
            val isContinuous = vList.zipWithNext().all { it.second == it.first + 1 }
            if (isContinuous) {
                "${vList.first()}-${vList.last()}"
            } else {
                vList.joinToString(", ")
            }
        }
        "${currentBook.name} $selectedChapter:$versePart (${selectedVersion.shortName})"
    }

    // Combined text of all selected verses
    val combinedVersesText: String = remember(activeSelectedVerseNumbers, loadedChapterData) {
        if (activeSelectedVerseNumbers.size == 1) {
            getVerseText(activeSelectedVerseNumbers.first())
        } else {
            activeSelectedVerseNumbers.joinToString(" ") { vNum ->
                "[$vNum] ${getVerseText(vNum)}"
            }
        }
    }

    val matchingVerses = remember(searchQuery, selectedTopic, selectedVersion) {
        if (searchQuery.isNotBlank()) {
            BibleService.searchVerses(searchQuery, selectedVersion)
        } else {
            BibleService.getPopularTopicVerses(selectedTopic, selectedVersion)
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.96f)
                .fillMaxHeight(0.92f)
                .clip(RoundedCornerShape(26.dp))
                .border(1.5.dp, colors.borderStrong, RoundedCornerShape(26.dp))
                .testTag("bible_selector_dialog"),
            color = colors.surface,
            shape = RoundedCornerShape(26.dp),
            shadowElevation = 12.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .padding(16.dp)
            ) {
                // Header Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(colors.primaryContainer)
                                .border(1.dp, colors.borderStrong, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Column {
                            Text(
                                text = "SELECTOR DE VERSÍCULOS R07",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Black,
                                color = colors.textPrimary,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = "Descarga y uso ilimitado offline",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.primary,
                                fontSize = 11.sp
                            )
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        IconButton(
                            onClick = onOpenFullReader,
                            modifier = Modifier
                                .size(32.dp)
                                .background(colors.primaryContainer, CircleShape)
                                .testTag("open_full_reader_from_selector")
                        ) {
                            Icon(
                                imageVector = Icons.Default.OpenInFull,
                                contentDescription = "Lector Completo",
                                tint = colors.primary,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier
                                .size(32.dp)
                                .background(colors.primaryContainer.copy(alpha = 0.5f), CircleShape)
                                .testTag("close_bible_dialog_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Cerrar",
                                tint = colors.textPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Translation Version Switcher (RVR1960 vs NTV)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(colors.primaryContainer.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                        .padding(3.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    BibleVersion.entries.forEach { version ->
                        val isSelected = selectedVersion == version
                        val bgColor by animateColorAsState(
                            targetValue = if (isSelected) colors.primary else Color.Transparent,
                            animationSpec = spring(stiffness = Spring.StiffnessMedium),
                            label = "versionBg"
                        )
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = bgColor,
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .clickable { selectedVersion = version }
                                .testTag("bible_version_${version.code}")
                        ) {
                            Row(
                                modifier = Modifier.padding(vertical = 6.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = version.displayName,
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color.White else colors.textPrimary,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Mode Tabs (Explorar Libros vs Búsqueda Rápida)
                TabRow(
                    selectedTabIndex = selectedTab.ordinal,
                    containerColor = Color.Transparent,
                    contentColor = colors.primary,
                    indicator = { tabPositions ->
                        TabRowDefaults.SecondaryIndicator(
                            modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab.ordinal]),
                            color = colors.primary,
                            height = 2.5.dp
                        )
                    },
                    divider = {}
                ) {
                    BibleSelectorTab.entries.forEach { tab ->
                        val isSelected = selectedTab == tab
                        Tab(
                            selected = isSelected,
                            onClick = { selectedTab = tab },
                            text = {
                                Text(
                                    text = "${tab.icon} ${tab.title}",
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    fontSize = 12.sp,
                                    color = if (isSelected) colors.primary else colors.textSecondary
                                )
                            }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // TAB CONTENT
                when (selectedTab) {
                    // TAB 1: EXPLORER OF ALL 66 BOOKS, CHAPTERS & ALL VERSES
                    BibleSelectorTab.EXPLORER -> {
                        Column(modifier = Modifier.weight(1f)) {
                            // Testament Toggle Pills (Antiguo vs Nuevo)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                listOf("Antiguo Testamento", "Nuevo Testamento").forEach { testName ->
                                    val isTSelected = selectedTestament == testName
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (isTSelected) colors.primaryContainer else colors.surface,
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(10.dp))
                                            .border(
                                                1.dp,
                                                if (isTSelected) colors.primary else colors.border,
                                                RoundedCornerShape(10.dp)
                                            )
                                            .clickable {
                                                selectedTestament = testName
                                                val firstBook = BibleService.all66Books.firstOrNull { it.testament == testName }
                                                if (firstBook != null) {
                                                    selectedBookNumber = firstBook.number
                                                    selectedChapter = 1
                                                    selectedVerseNum = 1
                                                }
                                            }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(vertical = 5.dp),
                                            horizontalArrangement = Arrangement.Center
                                        ) {
                                            Text(
                                                text = if (testName == "Antiguo Testamento") "Antiguo Test. (39 Libros)" else "Nuevo Test. (27 Libros)",
                                                style = MaterialTheme.typography.labelSmall,
                                                fontWeight = if (isTSelected) FontWeight.Bold else FontWeight.Medium,
                                                color = if (isTSelected) colors.primary else colors.textPrimary,
                                                fontSize = 11.sp
                                            )
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // Books Horizontal Scroller
                            LazyRow(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                items(booksForSelectedTestament) { book ->
                                    val isBSelected = book.number == selectedBookNumber
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (isBSelected) colors.primary else colors.surface,
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(10.dp))
                                            .border(
                                                1.dp,
                                                if (isBSelected) colors.primary else colors.border,
                                                RoundedCornerShape(10.dp)
                                            )
                                            .clickable {
                                                selectedBookNumber = book.number
                                                selectedChapter = 1
                                                selectedVerseNum = 1
                                            }
                                    ) {
                                        Text(
                                            text = book.name,
                                            modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp),
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = if (isBSelected) FontWeight.Bold else FontWeight.Normal,
                                            color = if (isBSelected) Color.White else colors.textPrimary,
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // Chapters Scroller
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "CAPÍTULO DE ${currentBook.name.uppercase()}:",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.textPrimary,
                                    fontSize = 10.sp
                                )

                                Text(
                                    text = "${currentBook.chaptersCount} capítulos en total",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = colors.textSecondary,
                                    fontSize = 10.sp
                                )
                            }

                            Spacer(modifier = Modifier.height(3.dp))

                            LazyRow(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                items((1..currentBook.chaptersCount).toList()) { chapNum ->
                                    val isCSelected = chapNum == selectedChapter
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = if (isCSelected) colors.primaryContainer else colors.surface,
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .border(
                                                1.dp,
                                                if (isCSelected) colors.primary else colors.border,
                                                RoundedCornerShape(8.dp)
                                            )
                                            .clickable {
                                                selectedChapter = chapNum
                                                selectedVerseNum = 1
                                            }
                                    ) {
                                        Text(
                                            text = "Cap. $chapNum",
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = if (isCSelected) FontWeight.ExtraBold else FontWeight.Medium,
                                            color = if (isCSelected) colors.primary else colors.textPrimary,
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // SELECTION MODE SELECTOR (Single, Range, Multi)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(colors.primaryContainer.copy(alpha = 0.35f), RoundedCornerShape(10.dp))
                                    .padding(2.dp),
                                horizontalArrangement = Arrangement.spacedBy(2.dp)
                            ) {
                                VerseSelectionMode.entries.forEach { mode ->
                                    val isMSelected = selectionMode == mode
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = if (isMSelected) colors.primary else Color.Transparent,
                                        modifier = Modifier
                                            .weight(1f)
                                            .clip(RoundedCornerShape(8.dp))
                                            .clickable {
                                                selectionMode = mode
                                                if (mode == VerseSelectionMode.RANGE) {
                                                    rangeStartVerse = 1
                                                    rangeEndVerse = minOf(4, estimatedVerseCount)
                                                } else if (mode == VerseSelectionMode.MULTI && selectedVersesSet.isEmpty()) {
                                                    selectedVersesSet = setOf(1, 2, 3)
                                                }
                                            }
                                    ) {
                                        Text(
                                            text = "${mode.icon} ${mode.title}",
                                            modifier = Modifier.padding(vertical = 4.dp),
                                            textAlign = TextAlign.Center,
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = if (isMSelected) FontWeight.Bold else FontWeight.Medium,
                                            color = if (isMSelected) Color.White else colors.textPrimary,
                                            fontSize = 10.sp
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            // RANGE CONTROLS (When in Range mode)
                            if (selectionMode == VerseSelectionMode.RANGE) {
                                Surface(
                                    modifier = Modifier.fillMaxWidth(),
                                    color = colors.surface,
                                    shape = RoundedCornerShape(10.dp),
                                    border = androidx.compose.foundation.BorderStroke(1.dp, colors.border)
                                ) {
                                    Column(modifier = Modifier.padding(6.dp)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                Text(
                                                    text = "Desde V.",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    fontWeight = FontWeight.Bold,
                                                    color = colors.textPrimary,
                                                    fontSize = 11.sp
                                                )
                                                Surface(
                                                    shape = RoundedCornerShape(6.dp),
                                                    color = colors.primaryContainer.copy(alpha = 0.4f),
                                                    border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary)
                                                ) {
                                                    Row(
                                                        verticalAlignment = Alignment.CenterVertically,
                                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                                    ) {
                                                        Text(
                                                            text = "-",
                                                            modifier = Modifier
                                                                .clickable {
                                                                    if (rangeStartVerse > 1) rangeStartVerse--
                                                                }
                                                                .padding(horizontal = 4.dp),
                                                            fontWeight = FontWeight.Black,
                                                            color = colors.primary
                                                        )
                                                        Text(
                                                            text = "$rangeStartVerse",
                                                            fontWeight = FontWeight.Black,
                                                            color = colors.primary,
                                                            modifier = Modifier.padding(horizontal = 4.dp),
                                                            fontSize = 11.sp
                                                        )
                                                        Text(
                                                            text = "+",
                                                            modifier = Modifier
                                                                .clickable {
                                                                    if (rangeStartVerse < rangeEndVerse) rangeStartVerse++
                                                                }
                                                                .padding(horizontal = 4.dp),
                                                            fontWeight = FontWeight.Black,
                                                            color = colors.primary
                                                        )
                                                    }
                                                }
                                            }

                                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                                Text(
                                                    text = "Hasta V.",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    fontWeight = FontWeight.Bold,
                                                    color = colors.textPrimary,
                                                    fontSize = 11.sp
                                                )
                                                Surface(
                                                    shape = RoundedCornerShape(6.dp),
                                                    color = colors.primaryContainer.copy(alpha = 0.4f),
                                                    border = androidx.compose.foundation.BorderStroke(1.dp, colors.primary)
                                                ) {
                                                    Row(
                                                        verticalAlignment = Alignment.CenterVertically,
                                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                                    ) {
                                                        Text(
                                                            text = "-",
                                                            modifier = Modifier
                                                                .clickable {
                                                                    if (rangeEndVerse > rangeStartVerse) rangeEndVerse--
                                                                }
                                                                .padding(horizontal = 4.dp),
                                                            fontWeight = FontWeight.Black,
                                                            color = colors.primary
                                                        )
                                                        Text(
                                                            text = "$rangeEndVerse",
                                                            fontWeight = FontWeight.Black,
                                                            color = colors.primary,
                                                            modifier = Modifier.padding(horizontal = 4.dp),
                                                            fontSize = 11.sp
                                                        )
                                                        Text(
                                                            text = "+",
                                                            modifier = Modifier
                                                                .clickable {
                                                                    if (rangeEndVerse < estimatedVerseCount) rangeEndVerse++
                                                                }
                                                                .padding(horizontal = 4.dp),
                                                            fontWeight = FontWeight.Black,
                                                            color = colors.primary
                                                        )
                                                    }
                                                }
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(4.dp))

                                        // Quick Presets
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            listOf(
                                                "V. 1-3" to (1 to 3),
                                                "V. 1-5" to (1 to 5),
                                                "V. 1-10" to (1 to 10),
                                                "Todo el Cap." to (1 to estimatedVerseCount)
                                            ).forEach { (label, range) ->
                                                Surface(
                                                    shape = RoundedCornerShape(6.dp),
                                                    color = if (rangeStartVerse == range.first && rangeEndVerse == minOf(range.second, estimatedVerseCount)) colors.primaryContainer else colors.surface,
                                                    border = androidx.compose.foundation.BorderStroke(0.8.dp, colors.border),
                                                    modifier = Modifier
                                                        .weight(1f)
                                                        .clip(RoundedCornerShape(6.dp))
                                                        .clickable {
                                                            rangeStartVerse = range.first
                                                            rangeEndVerse = minOf(range.second, estimatedVerseCount)
                                                        }
                                                ) {
                                                    Text(
                                                        text = label,
                                                        modifier = Modifier.padding(vertical = 3.dp),
                                                        textAlign = TextAlign.Center,
                                                        style = MaterialTheme.typography.labelSmall,
                                                        fontWeight = FontWeight.Bold,
                                                        fontSize = 9.sp,
                                                        color = colors.primary
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                            }

                            // ALL VERSES SECTION
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "VERSÍCULOS DE ${currentBook.name.uppercase()} $selectedChapter (${activeSelectedVerseNumbers.size} sel.):",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Black,
                                        color = colors.primary,
                                        fontSize = 10.sp
                                    )

                                    if (isLoadingChapter) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(12.dp),
                                            strokeWidth = 1.5.dp,
                                            color = colors.primary
                                        )
                                    }
                                }

                                // Quick download whole chapter button
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = colors.primaryContainer,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable {
                                            onDownloadChapter(selectedBookNumber, selectedChapter, selectedVersion)
                                            fetchChapter(selectedBookNumber, selectedChapter, selectedVersion, forceDownload = true)
                                        }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.CloudDownload,
                                            contentDescription = "Descargar capítulo",
                                            tint = colors.primary,
                                            modifier = Modifier.size(12.dp)
                                        )
                                        Text(
                                            text = "Cap. Offline",
                                            style = MaterialTheme.typography.labelSmall,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = colors.primary
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            // Verses List / Grid with real-time download and selection
                            val versesToDisplay = remember(loadedChapterData, estimatedVerseCount) {
                                if (loadedChapterData != null && loadedChapterData!!.verses.isNotEmpty()) {
                                    loadedChapterData!!.verses
                                } else {
                                    (1..estimatedVerseCount).map { vNum ->
                                        SingleVerseData(vNum, "")
                                    }
                                }
                            }

                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f)
                                    .background(colors.surface, RoundedCornerShape(12.dp))
                                    .border(1.dp, colors.border, RoundedCornerShape(12.dp))
                                    .padding(6.dp),
                                verticalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                items(versesToDisplay) { verseItem ->
                                    val isVSelected = activeSelectedVerseNumbers.contains(verseItem.verse)
                                    val hasDownloadedText = verseItem.text.isNotBlank()

                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (isVSelected) colors.primaryContainer else colors.surface,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(10.dp))
                                            .border(
                                                if (isVSelected) 1.5.dp else 0.8.dp,
                                                if (isVSelected) colors.primary else colors.border,
                                                RoundedCornerShape(10.dp)
                                            )
                                            .clickable {
                                                when (selectionMode) {
                                                    VerseSelectionMode.SINGLE -> {
                                                        selectedVerseNum = verseItem.verse
                                                    }
                                                    VerseSelectionMode.RANGE -> {
                                                        if (verseItem.verse < rangeStartVerse) {
                                                            rangeStartVerse = verseItem.verse
                                                        } else {
                                                            rangeEndVerse = verseItem.verse
                                                        }
                                                    }
                                                    VerseSelectionMode.MULTI -> {
                                                        val currentSet = selectedVersesSet.toMutableSet()
                                                        if (currentSet.contains(verseItem.verse)) {
                                                            if (currentSet.size > 1) currentSet.remove(verseItem.verse)
                                                        } else {
                                                            currentSet.add(verseItem.verse)
                                                        }
                                                        selectedVersesSet = currentSet
                                                    }
                                                }
                                                // Trigger download & cache if not downloaded
                                                if (!hasDownloadedText) {
                                                    fetchChapter(selectedBookNumber, selectedChapter, selectedVersion, forceDownload = true)
                                                }
                                            }
                                            .testTag("verse_item_${verseItem.verse}")
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Row(
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                                modifier = Modifier.weight(1f)
                                            ) {
                                                // Verse Number Circle Badge
                                                Box(
                                                    modifier = Modifier
                                                        .size(24.dp)
                                                        .clip(CircleShape)
                                                        .background(if (isVSelected) colors.primary else colors.primaryContainer.copy(alpha = 0.6f)),
                                                    contentAlignment = Alignment.Center
                                                ) {
                                                    Text(
                                                        text = "${verseItem.verse}",
                                                        style = MaterialTheme.typography.labelSmall,
                                                        fontWeight = FontWeight.Black,
                                                        color = if (isVSelected) Color.White else colors.primary,
                                                        fontSize = 11.sp
                                                    )
                                                }

                                                Column(modifier = Modifier.weight(1f)) {
                                                    Text(
                                                        text = "${currentBook.name} $selectedChapter:${verseItem.verse}",
                                                        style = MaterialTheme.typography.labelMedium,
                                                        fontWeight = FontWeight.Bold,
                                                        color = if (isVSelected) colors.primary else colors.textPrimary,
                                                        fontSize = 12.sp
                                                    )

                                                    if (hasDownloadedText) {
                                                        Text(
                                                            text = verseItem.text,
                                                            style = MaterialTheme.typography.bodySmall,
                                                            color = colors.textSecondary,
                                                            maxLines = if (isVSelected) 3 else 1,
                                                            overflow = TextOverflow.Ellipsis,
                                                            fontSize = 11.sp
                                                        )
                                                    } else {
                                                        Text(
                                                            text = "Toca para descargar y guardar offline",
                                                            style = MaterialTheme.typography.bodySmall,
                                                            color = colors.textMuted,
                                                            fontSize = 10.sp,
                                                            fontStyle = FontStyle.Italic
                                                        )
                                                    }
                                                }
                                            }

                                            // Status Icon
                                            if (isVSelected) {
                                                Icon(
                                                    imageVector = Icons.Default.CheckCircle,
                                                    contentDescription = "Seleccionado",
                                                    tint = colors.primary,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            } else if (hasDownloadedText) {
                                                Icon(
                                                    imageVector = Icons.Default.CheckCircle,
                                                    contentDescription = "Guardado offline",
                                                    tint = colors.accentSuccess.copy(alpha = 0.6f),
                                                    modifier = Modifier.size(16.dp)
                                                )
                                            } else {
                                                Icon(
                                                    imageVector = Icons.Default.CloudDownload,
                                                    contentDescription = "Descargar versículo",
                                                    tint = colors.primary.copy(alpha = 0.6f),
                                                    modifier = Modifier.size(15.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // TAB 2: QUICK TOPICS & KEYWORD SEARCH
                    BibleSelectorTab.SEARCH -> {
                        Column(modifier = Modifier.weight(1f)) {
                            // Search field
                            OutlinedTextField(
                                value = searchQuery,
                                onValueChange = { searchQuery = it },
                                placeholder = {
                                    Text(
                                        "Buscar versículo o palabra (ej. Sabiduría, Paz, Jeremías 33)",
                                        color = colors.textMuted,
                                        fontSize = 12.sp
                                    )
                                },
                                leadingIcon = {
                                    Icon(
                                        imageVector = Icons.Default.Search,
                                        contentDescription = "Buscar",
                                        tint = colors.primary
                                    )
                                },
                                trailingIcon = {
                                    if (searchQuery.isNotBlank()) {
                                        IconButton(onClick = { searchQuery = "" }) {
                                            Icon(
                                                imageVector = Icons.Default.Close,
                                                contentDescription = "Limpiar",
                                                tint = colors.textMuted,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("bible_search_field"),
                                shape = RoundedCornerShape(14.dp),
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = colors.primary,
                                    unfocusedBorderColor = colors.border,
                                    focusedTextColor = colors.textPrimary,
                                    unfocusedTextColor = colors.textPrimary,
                                    focusedContainerColor = colors.surface,
                                    unfocusedContainerColor = colors.surface
                                )
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            // Topic chips
                            LazyRow(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                val topics = listOf("Paz", "Sabiduría", "Fuerza", "Amor", "Propósito", "Mujer de Dios")
                                items(topics) { topic ->
                                    val isTopicSel = selectedTopic == topic && searchQuery.isEmpty()
                                    Surface(
                                        shape = RoundedCornerShape(10.dp),
                                        color = if (isTopicSel) colors.primary else colors.surface,
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(10.dp))
                                            .clickable {
                                                selectedTopic = topic
                                                searchQuery = ""
                                            }
                                    ) {
                                        Text(
                                            text = topic,
                                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = if (isTopicSel) FontWeight.Bold else FontWeight.Medium,
                                            color = if (isTopicSel) Color.White else colors.textPrimary,
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(
                                text = "VERSÍCULOS ENCONTRADOS:",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            LazyColumn(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .weight(1f),
                                verticalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                items(matchingVerses) { verse ->
                                    val isCurrent = currentBook.name.equals(verse.book, ignoreCase = true) &&
                                            selectedChapter == verse.chapter &&
                                            selectedVerseNum == verse.verse

                                    Surface(
                                        shape = RoundedCornerShape(12.dp),
                                        color = if (isCurrent) colors.primaryContainer else colors.surface,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clip(RoundedCornerShape(12.dp))
                                            .border(
                                                if (isCurrent) 1.8.dp else 1.dp,
                                                if (isCurrent) colors.primary else colors.border,
                                                RoundedCornerShape(12.dp)
                                            )
                                            .clickable {
                                                val bInfo = BibleService.getBookByName(verse.book)
                                                if (bInfo != null) {
                                                    selectedBookNumber = bInfo.number
                                                    selectedTestament = bInfo.testament
                                                }
                                                selectedChapter = verse.chapter
                                                selectedVerseNum = verse.verse
                                                selectedTab = BibleSelectorTab.EXPLORER
                                            }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(10.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = "${verse.book} ${verse.chapter}:${verse.verse} (${verse.version.shortName})",
                                                    style = MaterialTheme.typography.labelMedium,
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (isCurrent) colors.primary else colors.textPrimary
                                                )
                                                Spacer(modifier = Modifier.height(2.dp))
                                                Text(
                                                    text = verse.text,
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = colors.textSecondary,
                                                    maxLines = 2,
                                                    fontSize = 11.sp
                                                )
                                            }
                                            if (isCurrent) {
                                                Icon(
                                                    imageVector = Icons.Default.Check,
                                                    contentDescription = "Seleccionado",
                                                    tint = colors.primary,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // ACTIVE SELECTED VERSE/PASSAGE PREVIEW CARD (with confirmation badge)
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.5.dp, colors.primary, RoundedCornerShape(16.dp)),
                    shape = RoundedCornerShape(16.dp),
                    color = colors.surface
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "📖 $currentCitation",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Black,
                                    color = colors.primary,
                                    fontSize = 13.sp
                                )

                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = colors.accentSuccess.copy(alpha = 0.15f)
                                ) {
                                    Text(
                                        text = "${activeSelectedVerseNumbers.size} v. ✓ Offline",
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp),
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.accentSuccess,
                                        fontSize = 9.sp
                                    )
                                }
                            }

                            // Copy button
                            IconButton(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString("«$combinedVersesText» — $currentCitation"))
                                },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.ContentCopy,
                                    contentDescription = "Copiar",
                                    tint = colors.primary,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = "«$combinedVersesText»",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.SemiBold,
                            fontStyle = FontStyle.Italic,
                            color = colors.textPrimary,
                            lineHeight = 16.sp,
                            fontSize = 12.sp,
                            maxLines = 4,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // ACTION BUTTONS TO INSERT INTO DEVOTIONAL / R07
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = {
                            onVerseSelected(currentCitation, combinedVersesText, false)
                        },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(42.dp)
                            .testTag("insert_citation_only_button")
                    ) {
                        Text(
                            text = "Solo Cita (${activeSelectedVerseNumbers.size} v.)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = colors.primary
                        )
                    }

                    Button(
                        onClick = {
                            onVerseSelected(currentCitation, combinedVersesText, true)
                        },
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                        modifier = Modifier
                            .weight(1.3f)
                            .height(42.dp)
                            .testTag("insert_verse_and_text_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Insertar Pasaje (${activeSelectedVerseNumbers.size} v.)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
