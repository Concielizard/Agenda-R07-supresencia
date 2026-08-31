package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.model.BibleChapterEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BibleDao {

    @Query("SELECT * FROM bible_chapters WHERE version = :version AND bookNumber = :bookNumber AND chapter = :chapter LIMIT 1")
    suspend fun getChapter(version: String, bookNumber: Int, chapter: Int): BibleChapterEntity?

    @Query("SELECT * FROM bible_chapters WHERE version = :version AND bookNumber = :bookNumber ORDER BY chapter ASC")
    fun getDownloadedChaptersForBook(version: String, bookNumber: Int): Flow<List<BibleChapterEntity>>

    @Query("SELECT COUNT(*) FROM bible_chapters WHERE version = :version")
    fun getDownloadedCountFlow(version: String): Flow<Int>

    @Query("SELECT COUNT(*) FROM bible_chapters WHERE version = :version")
    suspend fun getDownloadedCount(version: String): Int

    @Query("SELECT COUNT(*) FROM bible_chapters WHERE version = :version AND testament = :testament")
    suspend fun getDownloadedCountByTestament(version: String, testament: String): Int

    @Query("SELECT COUNT(*) FROM bible_chapters WHERE version = :version AND bookNumber = :bookNumber")
    suspend fun getDownloadedChaptersCountForBook(version: String, bookNumber: Int): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChapter(chapter: BibleChapterEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChapters(chapters: List<BibleChapterEntity>)

    @Query("DELETE FROM bible_chapters WHERE version = :version AND bookNumber = :bookNumber AND chapter = :chapter")
    suspend fun deleteChapter(version: String, bookNumber: Int, chapter: Int)

    @Query("DELETE FROM bible_chapters WHERE version = :version")
    suspend fun deleteAllForVersion(version: String)

    @Query("SELECT DISTINCT bookNumber FROM bible_chapters WHERE version = :version")
    suspend fun getDownloadedBookNumbers(version: String): List<Int>
}
