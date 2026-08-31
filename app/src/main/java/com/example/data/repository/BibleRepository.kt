package com.example.data.repository

import com.example.data.bible.BibleBookInfo
import com.example.data.bible.BibleService
import com.example.data.bible.BibleVersion
import com.example.data.bible.FullChapterData
import com.example.data.local.BibleDao
import com.example.data.model.BibleChapterEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

data class BibleDownloadProgress(
    val isDownloading: Boolean = false,
    val totalChapters: Int = 0,
    val downloadedChapters: Int = 0,
    val currentBookName: String = "",
    val currentChapter: Int = 0,
    val currentVersion: String = "",
    val percentage: Float = 0f,
    val statusMessage: String = ""
)

class BibleRepository(private val bibleDao: BibleDao) {

    fun getDownloadedCountFlow(version: BibleVersion): Flow<Int> {
        return bibleDao.getDownloadedCountFlow(version.code)
    }

    suspend fun getDownloadedChaptersCount(version: BibleVersion): Int {
        return bibleDao.getDownloadedCount(version.code)
    }

    suspend fun getDownloadedChaptersByTestament(version: BibleVersion, testament: String): Int {
        return bibleDao.getDownloadedCountByTestament(version.code, testament)
    }

    suspend fun loadChapter(
        bookNumber: Int,
        chapter: Int,
        version: BibleVersion
    ): FullChapterData {
        return BibleService.fetchChapterWithCache(bibleDao, bookNumber, chapter, version)
    }

    suspend fun getAndCacheVerse(
        bookName: String,
        chapter: Int,
        verse: Int,
        version: BibleVersion
    ): com.example.data.bible.BibleVerse {
        return BibleService.getAndCacheVerse(bibleDao, bookName, chapter, verse, version)
    }

    suspend fun isChapterDownloaded(
        bookNumber: Int,
        chapter: Int,
        version: BibleVersion
    ): Boolean {
        val cached = bibleDao.getChapter(version.code, bookNumber, chapter)
        return cached != null && cached.versesJson.isNotBlank()
    }

    suspend fun downloadSingleChapter(
        bookNumber: Int,
        chapter: Int,
        version: BibleVersion
    ): FullChapterData {
        return BibleService.fetchChapterWithCache(bibleDao, bookNumber, chapter, version)
    }

    /**
     * Downloads an entire testament (Antiguo Testamento = 39 books / 929 chapters, Nuevo Testamento = 27 books / 260 chapters)
     * or the entire Bible into local Room DB.
     */
    suspend fun downloadBooksRange(
        books: List<BibleBookInfo>,
        version: BibleVersion,
        onProgress: (BibleDownloadProgress) -> Unit
    ) = withContext(Dispatchers.IO) {
        val totalToDownload = books.sumOf { it.chaptersCount }
        var currentDone = 0

        onProgress(
            BibleDownloadProgress(
                isDownloading = true,
                totalChapters = totalToDownload,
                downloadedChapters = 0,
                currentVersion = version.displayName,
                percentage = 0f,
                statusMessage = "Iniciando descarga de ${books.size} libros (${version.shortName})..."
            )
        )

        for (book in books) {
            for (chapter in 1..book.chaptersCount) {
                // Check if already in DB
                val existing = bibleDao.getChapter(version.code, book.number, chapter)
                if (existing == null || existing.versesJson.isBlank()) {
                    BibleService.fetchChapterWithCache(bibleDao, book.number, chapter, version)
                }

                currentDone++
                val pct = if (totalToDownload > 0) currentDone.toFloat() / totalToDownload.toFloat() else 1f

                onProgress(
                    BibleDownloadProgress(
                        isDownloading = true,
                        totalChapters = totalToDownload,
                        downloadedChapters = currentDone,
                        currentBookName = book.name,
                        currentChapter = chapter,
                        currentVersion = version.displayName,
                        percentage = pct,
                        statusMessage = "Guardando ${book.name} $chapter (${currentDone}/$totalToDownload)..."
                    )
                )
            }
        }

        onProgress(
            BibleDownloadProgress(
                isDownloading = false,
                totalChapters = totalToDownload,
                downloadedChapters = currentDone,
                currentVersion = version.displayName,
                percentage = 1f,
                statusMessage = "¡Descarga completa! $totalToDownload capítulos guardados 100% offline."
            )
        )
    }
}
