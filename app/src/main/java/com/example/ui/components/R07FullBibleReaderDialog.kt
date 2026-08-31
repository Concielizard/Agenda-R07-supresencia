package com.example.ui.components

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.OfflinePin
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.bible.BibleBookInfo
import com.example.data.bible.BibleService
import com.example.data.bible.BibleVersion
import com.example.data.bible.FullChapterData
import com.example.data.model.SingleVerseData
import com.example.data.repository.BibleDownloadProgress
import com.example.ui.theme.R07Theme

@Composable
fun R07FullBibleReaderDialog(
    downloadProgress: BibleDownloadProgress,
    rvrDownloadedCount: Int,
    ntvDownloadedCount: Int,
    onDismiss: () -> Unit,
    onLoadChapter: (bookNumber: Int, chapter: Int, version: BibleVersion, onResult: (FullChapterData) -> Unit) -> Unit,
    onDownloadTestament: (testament: String, version: BibleVersion) -> Unit,
    onDownloadEntireBible: (version: BibleVersion) -> Unit,
    onSelectVerseForR07: (citation: String, verseText: String) -> Unit
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val colors = R07Theme.colors

    var selectedVersion by remember { mutableStateOf(BibleVersion.RVR1960) }
    var selectedTestament by remember { mutableStateOf("Antiguo Testamento") }
    var selectedBookNumber by remember { mutableIntStateOf(1) } // 1 = Génesis
    var selectedChapter by remember { mutableIntStateOf(1) }
    var selectedCategory by remember { mutableStateOf("Todos") }
    var fontSizeMultiplier by remember { mutableFloatStateOf(16f) }
    var showDownloadManager by remember { mutableStateOf(false) }

    var currentChapterData by remember { mutableStateOf<FullChapterData?>(null) }
    var isLoadingChapter by remember { mutableStateOf(false) }
    var selectedVerseForAction by remember { mutableStateOf<SingleVerseData?>(null) }

    // Load active chapter
    fun refreshCurrentChapter(bookNum: Int, chap: Int, ver: BibleVersion) {
        isLoadingChapter = true
        onLoadChapter(bookNum, chap, ver) { result ->
            currentChapterData = result
            isLoadingChapter = false
        }
    }

    LaunchedEffect(selectedBookNumber, selectedChapter, selectedVersion) {
        refreshCurrentChapter(selectedBookNumber, selectedChapter, selectedVersion)
    }

    val currentBook = remember(selectedBookNumber) {
        BibleService.getBookByNumber(selectedBookNumber) ?: BibleService.all66Books[0]
    }

    val filteredBooks = remember(selectedTestament, selectedCategory) {
        BibleService.all66Books.filter { book ->
            val matchTestament = book.testament == selectedTestament
            val matchCat = if (selectedCategory == "Todos") true else book.category == selectedCategory
            matchTestament && matchCat
        }
    }

    val categoriesForTestament = remember(selectedTestament) {
        val list = BibleService.all66Books
            .filter { it.testament == selectedTestament }
            .map { it.category }
            .distinct()
        listOf("Todos") + list
    }

    val downloadedCountForActiveVersion = if (selectedVersion == BibleVersion.RVR1960) rvrDownloadedCount else ntvDownloadedCount

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.97f)
                .fillMaxHeight(0.94f)
                .clip(RoundedCornerShape(24.dp))
                .border(1.5.dp, colors.borderStrong, RoundedCornerShape(24.dp))
                .testTag("full_bible_reader_dialog"),
            color = colors.surface,
            shape = RoundedCornerShape(24.dp),
            shadowElevation = 12.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Top Header Bar
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
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(colors.primaryContainer)
                                .border(1.dp, colors.borderStrong, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(22.dp)
                            )
                        }

                        Column {
                            Text(
                                text = "SANTA BIBLIA COMPLETA",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = colors.textPrimary,
                                letterSpacing = 0.5.sp
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "66 Libros (AT & NT)",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primary
                                )
                                Text(
                                    text = "•",
                                    color = colors.textSecondary
                                )
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = colors.primaryContainer.copy(alpha = 0.6f)
                                ) {
                                    Text(
                                        text = if (downloadedCountForActiveVersion >= 1189) "100% Offline ✓" else "$downloadedCountForActiveVersion/1189 cap. guardados",
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp,
                                        color = colors.primary
                                    )
                                }
                            }
                        }
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        // Offline Download Manager toggle button
                        IconButton(
                            onClick = { showDownloadManager = !showDownloadManager },
                            modifier = Modifier
                                .size(34.dp)
                                .background(if (showDownloadManager) colors.primary else colors.primaryContainer.copy(alpha = 0.5f), CircleShape)
                                .testTag("bible_download_manager_toggle_button")
                        ) {
                            Icon(
                                imageVector = if (downloadProgress.isDownloading) Icons.Default.CloudDownload else Icons.Default.OfflinePin,
                                contentDescription = "Descargas Offline",
                                tint = if (showDownloadManager) Color.White else colors.primary,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        // Close button
                        IconButton(
                            onClick = onDismiss,
                            modifier = Modifier
                                .size(34.dp)
                                .background(colors.primaryContainer.copy(alpha = 0.5f), CircleShape)
                                .testTag("close_full_bible_dialog")
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

                // Bible Version Selector (Reina Valera 1960 vs Nueva Traducción Viviente)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(colors.primaryContainer.copy(alpha = 0.35f), RoundedCornerShape(14.dp))
                        .padding(3.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    BibleVersion.values().forEach { version ->
                        val isSelected = selectedVersion == version
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) colors.primary else Color.Transparent,
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { selectedVersion = version }
                                .testTag("bible_tab_version_${version.code}")
                        ) {
                            Row(
                                modifier = Modifier.padding(vertical = 8.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = version.displayName,
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color.White else colors.textPrimary
                                )
                            }
                        }
                    }
                }

                // If Download Manager is open, show download controls
                if (showDownloadManager || downloadProgress.isDownloading) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.5.dp, colors.primary, RoundedCornerShape(16.dp)),
                        color = colors.primaryContainer.copy(alpha = 0.4f),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.CloudDownload,
                                        contentDescription = null,
                                        tint = colors.primary,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "DESCARGA DE LA BIBLIA OFFLINE",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Black,
                                        color = colors.textPrimary
                                    )
                                }
                                Text(
                                    text = selectedVersion.shortName,
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primary
                                )
                            }

                            if (downloadProgress.isDownloading) {
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = downloadProgress.statusMessage,
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primary
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                LinearProgressIndicator(
                                    progress = { downloadProgress.percentage },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(8.dp)
                                        .clip(RoundedCornerShape(4.dp)),
                                    color = colors.primary,
                                    trackColor = colors.border
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "${(downloadProgress.percentage * 100).toInt()}% (${downloadProgress.downloadedChapters} de ${downloadProgress.totalChapters} cap.)",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = colors.textSecondary
                                )
                            } else {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Descarga los 66 libros en la memoria de tu dispositivo para leerlos sin conexión a internet en tus tiempos devocionales R07.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = colors.textSecondary,
                                    lineHeight = 18.sp
                                )

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    OutlinedButton(
                                        onClick = { onDownloadTestament("Antiguo Testamento", selectedVersion) },
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text("Antiguo Test. (39)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = colors.primary)
                                    }

                                    OutlinedButton(
                                        onClick = { onDownloadTestament("Nuevo Testamento", selectedVersion) },
                                        shape = RoundedCornerShape(12.dp),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text("Nuevo Test. (27)", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = colors.primary)
                                    }
                                }

                                Spacer(modifier = Modifier.height(6.dp))

                                Button(
                                    onClick = { onDownloadEntireBible(selectedVersion) },
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.CloudDone, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Descargar Toda la Biblia (${selectedVersion.shortName})", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Testament Selector Tabs (Antiguo Testamento vs Nuevo Testamento)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val otSelected = selectedTestament == "Antiguo Testamento"
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = if (otSelected) colors.primary else colors.surface,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(14.dp))
                            .border(1.dp, if (otSelected) colors.primary else colors.border, RoundedCornerShape(14.dp))
                            .clickable {
                                selectedTestament = "Antiguo Testamento"
                                selectedCategory = "Todos"
                                selectedBookNumber = 1 // Génesis
                                selectedChapter = 1
                            }
                            .testTag("testament_tab_ot")
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Antiguo Testamento (39)",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = if (otSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (otSelected) Color.White else colors.textPrimary
                            )
                        }
                    }

                    val ntSelected = selectedTestament == "Nuevo Testamento"
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = if (ntSelected) colors.primary else colors.surface,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(14.dp))
                            .border(1.dp, if (ntSelected) colors.primary else colors.border, RoundedCornerShape(14.dp))
                            .clickable {
                                selectedTestament = "Nuevo Testamento"
                                selectedCategory = "Todos"
                                selectedBookNumber = 40 // Mateo
                                selectedChapter = 1
                            }
                            .testTag("testament_tab_nt")
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Nuevo Testamento (27)",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = if (ntSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (ntSelected) Color.White else colors.textPrimary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Category chips (Pentateuco, Históricos, Evangelios, etc.)
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(categoriesForTestament) { cat ->
                        val isCatSelected = selectedCategory == cat
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isCatSelected) colors.primaryContainer else colors.surface,
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .border(1.dp, if (isCatSelected) colors.primary else colors.border, RoundedCornerShape(12.dp))
                                .clickable {
                                    selectedCategory = cat
                                    val firstInCat = filteredBooks.firstOrNull { if (cat == "Todos") true else it.category == cat }
                                    if (firstInCat != null) {
                                        selectedBookNumber = firstInCat.number
                                        selectedChapter = 1
                                    }
                                }
                        ) {
                            Text(
                                text = cat,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = if (isCatSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isCatSelected) colors.primary else colors.textPrimary,
                                fontSize = 11.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Book Selector Strip
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(filteredBooks) { book ->
                        val isBookSelected = book.number == selectedBookNumber
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isBookSelected) colors.primary else colors.surface,
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .border(1.dp, if (isBookSelected) colors.primary else colors.border, RoundedCornerShape(12.dp))
                                .clickable {
                                    selectedBookNumber = book.number
                                    selectedChapter = 1
                                }
                                .testTag("bible_book_chip_${book.number}")
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = book.name,
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = if (isBookSelected) FontWeight.Bold else FontWeight.SemiBold,
                                    color = if (isBookSelected) Color.White else colors.textPrimary
                                )
                                Text(
                                    text = "${book.chaptersCount}",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = if (isBookSelected) Color.White.copy(alpha = 0.8f) else colors.textSecondary,
                                    fontSize = 10.sp
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Chapter Selector Numbers (1..chaptersCount)
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items((1..currentBook.chaptersCount).toList()) { chapNum ->
                        val isChapSelected = chapNum == selectedChapter
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isChapSelected) colors.primary else colors.surface,
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isChapSelected) colors.primary else colors.border),
                            modifier = Modifier
                                .size(34.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .clickable {
                                    selectedChapter = chapNum
                                }
                                .testTag("bible_chap_btn_$chapNum")
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = "$chapNum",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isChapSelected) Color.White else colors.textPrimary
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Chapter Bar with Font Size controls & Chapter Navigation
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(colors.primaryContainer.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        IconButton(
                            onClick = {
                                if (selectedChapter > 1) {
                                    selectedChapter -= 1
                                } else if (selectedBookNumber > 1) {
                                    val prevBook = BibleService.getBookByNumber(selectedBookNumber - 1)
                                    if (prevBook != null) {
                                        selectedTestament = prevBook.testament
                                        selectedBookNumber = prevBook.number
                                        selectedChapter = prevBook.chaptersCount
                                    }
                                }
                            },
                            modifier = Modifier.size(28.dp),
                            enabled = selectedBookNumber > 1 || selectedChapter > 1
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Capítulo anterior",
                                tint = colors.primary,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        Text(
                            text = "📖 ${currentBook.name} $selectedChapter",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Black,
                            color = colors.textPrimary
                        )

                        IconButton(
                            onClick = {
                                if (selectedChapter < currentBook.chaptersCount) {
                                    selectedChapter += 1
                                } else if (selectedBookNumber < 66) {
                                    val nextBook = BibleService.getBookByNumber(selectedBookNumber + 1)
                                    if (nextBook != null) {
                                        selectedTestament = nextBook.testament
                                        selectedBookNumber = nextBook.number
                                        selectedChapter = 1
                                    }
                                }
                            },
                            modifier = Modifier.size(28.dp),
                            enabled = selectedBookNumber < 66 || selectedChapter < currentBook.chaptersCount
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                                contentDescription = "Capítulo siguiente",
                                tint = colors.primary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    // Font size toggle (A- / A+)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { if (fontSizeMultiplier > 13f) fontSizeMultiplier -= 2f },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Text("A-", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = colors.textPrimary)
                        }
                        IconButton(
                            onClick = { if (fontSizeMultiplier < 26f) fontSizeMultiplier += 2f },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Text("A+", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = colors.primary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Chapter Reading Body (List of verses)
                if (isLoadingChapter) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(
                                color = colors.primary,
                                modifier = Modifier.size(36.dp)
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = "Cargando ${currentBook.name} $selectedChapter (${selectedVersion.displayName})...",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.textSecondary
                            )
                        }
                    }
                } else {
                    val verses = currentChapterData?.verses ?: emptyList()
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .background(colors.surface, RoundedCornerShape(16.dp))
                            .border(1.dp, colors.border, RoundedCornerShape(16.dp))
                            .padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(verses) { verse ->
                            val isSelected = selectedVerseForAction?.verse == verse.verse

                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) colors.primaryContainer.copy(alpha = 0.55f) else Color.Transparent,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .clickable {
                                        selectedVerseForAction = if (isSelected) null else verse
                                    }
                                    .padding(4.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(4.dp),
                                    verticalAlignment = Alignment.Top,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = if (isSelected) colors.primary else colors.primaryContainer.copy(alpha = 0.6f)
                                    ) {
                                        Text(
                                            text = "${verse.verse}",
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 11.sp,
                                            color = if (isSelected) Color.White else colors.primary
                                        )
                                    }

                                    Text(
                                        text = verse.text,
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontSize = fontSizeMultiplier.sp,
                                        lineHeight = (fontSizeMultiplier * 1.4f).sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) colors.textPrimary else colors.textPrimary
                                    )
                                }
                            }
                        }
                    }
                }

                // Selected Verse Quick Action Bar (Add to R07, Copy, etc.)
                selectedVerseForAction?.let { verse ->
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.5.dp, colors.primary, RoundedCornerShape(16.dp)),
                        shape = RoundedCornerShape(16.dp),
                        color = colors.surface
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "📖 ${currentBook.name} $selectedChapter:${verse.verse} (${selectedVersion.shortName})",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Black,
                                    color = colors.primary
                                )

                                IconButton(
                                    onClick = { selectedVerseForAction = null },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(Icons.Default.Close, contentDescription = "Deseleccionar", tint = colors.textMuted)
                                }
                            }

                            Text(
                                text = "«${verse.text}»",
                                style = MaterialTheme.typography.bodySmall,
                                fontStyle = FontStyle.Italic,
                                maxLines = 2,
                                color = colors.textSecondary
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        val citation = "${currentBook.name} $selectedChapter:${verse.verse} (${selectedVersion.shortName})"
                                        clipboardManager.setText(AnnotatedString("«${verse.text}» — $citation"))
                                        Toast.makeText(context, "Versículo copiado al portapapeles 📋", Toast.LENGTH_SHORT).show()
                                    },
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(Icons.Default.ContentCopy, contentDescription = null, tint = colors.primary, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Copiar", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = colors.primary)
                                }

                                Button(
                                    onClick = {
                                        val citation = "${currentBook.name} $selectedChapter:${verse.verse} (${selectedVersion.shortName})"
                                        onSelectVerseForR07(citation, verse.text)
                                        selectedVerseForAction = null
                                    },
                                    shape = RoundedCornerShape(12.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                                    modifier = Modifier.weight(1.4f)
                                ) {
                                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Usar en mi R07", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
