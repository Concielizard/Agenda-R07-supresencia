package com.example.data.model

import androidx.room.Entity

@Entity(
    tableName = "bible_chapters",
    primaryKeys = ["version", "bookNumber", "chapter"]
)
data class BibleChapterEntity(
    val version: String, // "RVR1960" or "NTV"
    val bookNumber: Int, // 1 to 66
    val bookName: String, // e.g. "Génesis", "Juan"
    val chapter: Int, // e.g. 1
    val testament: String, // "Antiguo Testamento" or "Nuevo Testamento"
    val versesJson: String, // Serialized list of verses
    val verseCount: Int = 0,
    val isDownloaded: Boolean = true,
    val downloadedAt: Long = System.currentTimeMillis()
)

data class SingleVerseData(
    val verse: Int,
    val text: String
)
