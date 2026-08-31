package com.example

import com.example.data.bible.BibleService
import com.example.data.model.SingleVerseData
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleUnitTest {
  @Test
  fun addition_isCorrect() {
    assertEquals(4, 2 + 2)
  }

  @Test
  fun verify66BibleBooksCountAndStructure() {
    val allBooks = BibleService.all66Books
    assertEquals("Should have exactly 66 Bible books", 66, allBooks.size)

    val otBooks = allBooks.filter { it.testament == "Antiguo Testamento" }
    val ntBooks = allBooks.filter { it.testament == "Nuevo Testamento" }

    assertEquals("Antiguo Testamento must have 39 books", 39, otBooks.size)
    assertEquals("Nuevo Testamento must have 27 books", 27, ntBooks.size)

    assertEquals("First book is Génesis", "Génesis", allBooks.first().name)
    assertEquals("Last book is Apocalipsis", "Apocalipsis", allBooks.last().name)
    assertEquals("Book 40 is Mateo", "Mateo", BibleService.getBookByNumber(40)?.name)
  }

  @Test
  fun verifyJsonSerializationAndParsing() {
    val sampleVerses = listOf(
      SingleVerseData(1, "En el principio creó Dios los cielos y la tierra."),
      SingleVerseData(2, "Y la tierra estaba desordenada y vacía...")
    )
    val json = BibleService.serializeVersesToJson(sampleVerses)
    val parsed = BibleService.parseVersesJson(json)

    assertEquals(2, parsed.size)
    assertEquals(1, parsed[0].verse)
    assertEquals("En el principio creó Dios los cielos y la tierra.", parsed[0].text)
  }
}
