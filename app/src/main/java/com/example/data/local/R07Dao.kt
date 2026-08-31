package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.example.data.model.R07CommunityEntity
import com.example.data.model.R07DayEntryEntity
import com.example.data.model.R07FriendEntity
import com.example.data.model.R07WeekEntity
import com.example.data.model.R07WeeklyGoalEntity
import com.example.data.model.WeekWithDays
import kotlinx.coroutines.flow.Flow

@Dao
interface R07Dao {

    @Transaction
    @Query("SELECT * FROM r07_weeks ORDER BY id DESC")
    fun getAllWeeksWithDays(): Flow<List<WeekWithDays>>

    @Transaction
    @Query("SELECT * FROM r07_weeks WHERE id = :weekId")
    fun getWeekWithDaysById(weekId: Long): Flow<WeekWithDays?>

    @Query("SELECT * FROM r07_weeks ORDER BY id DESC LIMIT 1")
    suspend fun getLatestWeekDirect(): R07WeekEntity?

    @Query("SELECT * FROM r07_weeks ORDER BY id DESC")
    fun getAllWeeks(): Flow<List<R07WeekEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWeek(week: R07WeekEntity): Long

    @Update
    suspend fun updateWeek(week: R07WeekEntity)

    @Query("DELETE FROM r07_weeks WHERE id = :weekId")
    suspend fun deleteWeek(weekId: Long)

    @Query("DELETE FROM r07_day_entries WHERE weekId = :weekId")
    suspend fun deleteDaysForWeek(weekId: Long)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDay(day: R07DayEntryEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDays(days: List<R07DayEntryEntity>)

    @Update
    suspend fun updateDay(day: R07DayEntryEntity)

    @Query("SELECT * FROM r07_day_entries WHERE weekId = :weekId ORDER BY dayNumber ASC")
    fun getDaysForWeek(weekId: Long): Flow<List<R07DayEntryEntity>>

    @Query("UPDATE r07_weeks SET prayerAttendanceCount = :count WHERE id = :weekId")
    suspend fun updatePrayerAttendance(weekId: Long, count: Int)

    @Query("UPDATE r07_weeks SET isGoalCompleted = :completed WHERE id = :weekId")
    suspend fun updateGoalCompleted(weekId: Long, completed: Boolean)

    @Query("UPDATE r07_weeks SET readingGoal = :goal WHERE id = :weekId")
    suspend fun updateReadingGoal(weekId: Long, goal: String)

    // Weekly Goals
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGoal(goal: R07WeeklyGoalEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGoals(goals: List<R07WeeklyGoalEntity>)

    @Update
    suspend fun updateGoal(goal: R07WeeklyGoalEntity)

    @Query("DELETE FROM r07_weekly_goals WHERE id = :goalId")
    suspend fun deleteGoal(goalId: Long)

    @Query("DELETE FROM r07_weekly_goals WHERE weekId = :weekId")
    suspend fun deleteGoalsForWeek(weekId: Long)

    @Query("SELECT * FROM r07_weekly_goals WHERE weekId = :weekId ORDER BY id ASC")
    fun getGoalsForWeek(weekId: Long): Flow<List<R07WeeklyGoalEntity>>

    // Friends by Token
    @Query("SELECT * FROM r07_friends ORDER BY connectedAt DESC")
    fun getAllFriends(): Flow<List<R07FriendEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFriend(friend: R07FriendEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFriends(friends: List<R07FriendEntity>)

    @Update
    suspend fun updateFriend(friend: R07FriendEntity)

    @Query("DELETE FROM r07_friends WHERE id = :friendId")
    suspend fun deleteFriend(friendId: Long)

    @Query("SELECT * FROM r07_friends WHERE friendToken = :token LIMIT 1")
    suspend fun getFriendByToken(token: String): R07FriendEntity?

    // Communities & Groups
    @Query("SELECT * FROM r07_communities ORDER BY isMyCommunity DESC, id DESC")
    fun getAllCommunities(): Flow<List<R07CommunityEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCommunity(community: R07CommunityEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCommunities(communities: List<R07CommunityEntity>)

    @Update
    suspend fun updateCommunity(community: R07CommunityEntity)

    @Query("DELETE FROM r07_communities WHERE id = :communityId")
    suspend fun deleteCommunity(communityId: Long)

    @Query("SELECT * FROM r07_communities WHERE communityToken = :token LIMIT 1")
    suspend fun getCommunityByToken(token: String): R07CommunityEntity?

    // Prayer Petitions
    @Query("SELECT * FROM r07_prayer_petitions ORDER BY isAnswered ASC, id DESC")
    fun getAllPrayerPetitions(): Flow<List<com.example.data.model.R07PrayerPetitionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPrayerPetition(petition: com.example.data.model.R07PrayerPetitionEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPrayerPetitions(petitions: List<com.example.data.model.R07PrayerPetitionEntity>)

    @Update
    suspend fun updatePrayerPetition(petition: com.example.data.model.R07PrayerPetitionEntity)

    @Query("DELETE FROM r07_prayer_petitions WHERE id = :petitionId")
    suspend fun deletePrayerPetition(petitionId: Long)

    @Query("UPDATE r07_prayer_petitions SET prayerCount = prayerCount + 1 WHERE id = :petitionId")
    suspend fun incrementPetitionPrayerCount(petitionId: Long)
}

