package com.example.data.model

import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

enum class DevotionalBlockType(
    val defaultTitle: String,
    val iconEmoji: String,
    val placeholder: String,
    val isDeletable: Boolean
) {
    GOD_SPOKE(
        defaultTitle = "¿Qué me habló Dios hoy? (Rhema)",
        iconEmoji = "📖",
        placeholder = "¿Qué principio, verdad o palabra clave te reveló el Señor hoy?",
        isDeletable = false
    ),
    REFLECTION(
        defaultTitle = "Mi Reflexión & Lo que sentí",
        iconEmoji = "💬",
        placeholder = "Describe cómo recibiste esta palabra en tu corazón y tus emociones...",
        isDeletable = false
    ),
    ACTION_STEP(
        defaultTitle = "Mi Compromiso & Acción práctica",
        iconEmoji = "⚡",
        placeholder = "¿Qué decisión u obediencia práctica vas a tomar el día de hoy?",
        isDeletable = false
    ),
    PRAYER(
        defaultTitle = "Mi Oración & Clamor al Padre",
        iconEmoji = "🙏",
        placeholder = "Tu oración personal, peticiones de fe, clamor y gratitud al Señor...",
        isDeletable = false
    ),
    KEY_VERSE(
        defaultTitle = "Versículo Clave",
        iconEmoji = "🕊️",
        placeholder = "Cita o texto bíblico especial que guardas en tu corazón...",
        isDeletable = true
    ),
    DAILY_CHALLENGE(
        defaultTitle = "Meta / Desafío del Día",
        iconEmoji = "🎯",
        placeholder = "Un reto espiritual o de servicio para cumplir hoy...",
        isDeletable = true
    ),
    GRATITUDE(
        defaultTitle = "Agradecimiento Especial",
        iconEmoji = "💖",
        placeholder = "3 cosas específicas por las que alabo y doy gracias hoy...",
        isDeletable = true
    ),
    SPIRITUAL_VICTORY(
        defaultTitle = "Victoria / Batalla Espiritual",
        iconEmoji = "⚔️",
        placeholder = "Testimonio o fortaleza ganada en el Señor hoy...",
        isDeletable = true
    ),
    PERSONAL_NOTE(
        defaultTitle = "Nota Personal",
        iconEmoji = "📝",
        placeholder = "Apuntes adicionales de tu tiempo a solas con Dios...",
        isDeletable = true
    )
}

data class DevotionalBlock(
    val id: String = UUID.randomUUID().toString(),
    val type: DevotionalBlockType,
    val customTitle: String = "",
    val text: String = ""
) {
    val displayTitle: String
        get() = customTitle.ifBlank { type.defaultTitle }

    companion object {
        fun createDefaultBlocks(): List<DevotionalBlock> {
            return listOf(
                DevotionalBlock(type = DevotionalBlockType.GOD_SPOKE),
                DevotionalBlock(type = DevotionalBlockType.REFLECTION),
                DevotionalBlock(type = DevotionalBlockType.ACTION_STEP),
                DevotionalBlock(type = DevotionalBlockType.PRAYER)
            )
        }

        fun parseBlocksFromJson(json: String, fallbackText: String = ""): List<DevotionalBlock> {
            if (json.isNotBlank()) {
                try {
                    val array = JSONArray(json)
                    val list = mutableListOf<DevotionalBlock>()
                    for (i in 0 until array.length()) {
                        val obj = array.getJSONObject(i)
                        val typeName = obj.optString("type", DevotionalBlockType.GOD_SPOKE.name)
                        val type = try {
                            DevotionalBlockType.valueOf(typeName)
                        } catch (e: Exception) {
                            DevotionalBlockType.PERSONAL_NOTE
                        }
                        list.add(
                            DevotionalBlock(
                                id = obj.optString("id", UUID.randomUUID().toString()),
                                type = type,
                                customTitle = obj.optString("customTitle", ""),
                                text = obj.optString("text", "")
                            )
                        )
                    }
                    if (list.isNotEmpty()) return list
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            // If fallback text is available, attempt to populate default blocks gracefully
            if (fallbackText.isNotBlank()) {
                return parseFromPlainText(fallbackText)
            }

            return createDefaultBlocks()
        }

        fun parseFromPlainText(text: String): List<DevotionalBlock> {
            val defaultBlocks = createDefaultBlocks()
            if (text.isBlank()) return defaultBlocks

            // Check if text has sections like "Dios me habló", "Reflexión", "Compromiso", "Oración"
            val lines = text.lines()
            val godSpokeText = StringBuilder()
            val reflectionText = StringBuilder()
            val actionText = StringBuilder()
            val prayerText = StringBuilder()

            var currentTarget = 0 // 0=reflection, 1=godSpoke, 2=action, 3=prayer

            for (line in lines) {
                val lower = line.lowercase()
                when {
                    lower.contains("dios me habló") || lower.contains("mensaje clave") || lower.contains("rhema") -> {
                        currentTarget = 1
                        val content = line.substringAfter(":").trim()
                        if (content.isNotBlank()) godSpokeText.appendLine(content)
                    }
                    lower.contains("mi reflexión") || lower.contains("lo que sentí") || lower.contains("describe tu r07") -> {
                        currentTarget = 0
                        val content = line.substringAfter(":").trim()
                        if (content.isNotBlank()) reflectionText.appendLine(content)
                    }
                    lower.contains("mi compromiso") || lower.contains("aplicación práctica") || lower.contains("acción") -> {
                        currentTarget = 2
                        val content = line.substringAfter(":").trim()
                        if (content.isNotBlank()) actionText.appendLine(content)
                    }
                    lower.contains("oración") || lower.contains("mi clamor") -> {
                        currentTarget = 3
                        val content = line.substringAfter(":").trim()
                        if (content.isNotBlank()) prayerText.appendLine(content)
                    }
                    else -> {
                        when (currentTarget) {
                            1 -> godSpokeText.appendLine(line)
                            2 -> actionText.appendLine(line)
                            3 -> prayerText.appendLine(line)
                            else -> reflectionText.appendLine(line)
                        }
                    }
                }
            }

            val finalReflection = reflectionText.toString().trim()
            val finalGodSpoke = godSpokeText.toString().trim()
            val finalAction = actionText.toString().trim()
            val finalPrayer = prayerText.toString().trim()

            // If we found specific sections, assign them
            if (finalGodSpoke.isNotBlank() || finalAction.isNotBlank() || finalPrayer.isNotBlank()) {
                return listOf(
                    DevotionalBlock(type = DevotionalBlockType.GOD_SPOKE, text = finalGodSpoke),
                    DevotionalBlock(type = DevotionalBlockType.REFLECTION, text = finalReflection),
                    DevotionalBlock(type = DevotionalBlockType.ACTION_STEP, text = finalAction),
                    DevotionalBlock(type = DevotionalBlockType.PRAYER, text = finalPrayer)
                )
            }

            // Otherwise put all text in the main Reflection block
            return listOf(
                DevotionalBlock(type = DevotionalBlockType.GOD_SPOKE),
                DevotionalBlock(type = DevotionalBlockType.REFLECTION, text = text.trim()),
                DevotionalBlock(type = DevotionalBlockType.ACTION_STEP),
                DevotionalBlock(type = DevotionalBlockType.PRAYER)
            )
        }

        fun serializeBlocksToJson(blocks: List<DevotionalBlock>): String {
            val array = JSONArray()
            blocks.forEach { b ->
                val obj = JSONObject()
                obj.put("id", b.id)
                obj.put("type", b.type.name)
                obj.put("customTitle", b.customTitle)
                obj.put("text", b.text)
                array.put(obj)
            }
            return array.toString()
        }

        fun formatBlocksToPlainText(blocks: List<DevotionalBlock>): String {
            val sb = StringBuilder()
            val filledBlocks = blocks.filter { it.text.isNotBlank() }
            if (filledBlocks.isEmpty()) return ""

            filledBlocks.forEachIndexed { index, block ->
                sb.append("${block.type.iconEmoji} ${block.displayTitle}:\n")
                sb.append(block.text.trim())
                if (index < filledBlocks.size - 1) {
                    sb.append("\n\n")
                }
            }
            return sb.toString().trim()
        }
    }
}
