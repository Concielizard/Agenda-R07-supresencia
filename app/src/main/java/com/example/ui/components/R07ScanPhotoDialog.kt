package com.example.ui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.WarningAmber
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.example.data.remote.ScannedR07Entry
import com.example.ui.ScanPhotoUiState
import com.example.ui.theme.R07Theme

@Composable
fun R07ScanPhotoDialog(
    scanState: ScanPhotoUiState,
    currentDayNumber: Int,
    onDismiss: () -> Unit,
    onAddPhoto: (Uri) -> Unit,
    onRemovePhoto: (Uri) -> Unit,
    onProcessMultiPhotos: (List<Uri>, Int) -> Unit,
    onApplyScannedEntry: (ScannedR07Entry, Int) -> Unit
) {
    val colors = R07Theme.colors

    var targetDay by remember(currentDayNumber) { mutableStateOf(currentDayNumber) }

    // Editable draft fields for scanned entry
    var draftGodSpoke by remember(scanState.scannedEntry) { mutableStateOf(scanState.scannedEntry?.godSpoke ?: "") }
    var draftReflection by remember(scanState.scannedEntry) { mutableStateOf(scanState.scannedEntry?.reflectionText ?: "") }
    var draftActionStep by remember(scanState.scannedEntry) { mutableStateOf(scanState.scannedEntry?.actionStep ?: "") }
    var draftPrayer by remember(scanState.scannedEntry) { mutableStateOf(scanState.scannedEntry?.prayerText ?: "") }
    var draftScripture by remember(scanState.scannedEntry) { mutableStateOf(scanState.scannedEntry?.scriptureRef ?: "") }
    var draftTime by remember(scanState.scannedEntry) { mutableStateOf(scanState.scannedEntry?.timeText ?: "") }

    val multiplePhotosLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris: List<Uri> ->
        uris.forEach { onAddPhoto(it) }
    }

    val singlePhotoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            onAddPhoto(uri)
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            decorFitsSystemWindows = false
        )
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 14.dp, vertical = 20.dp),
            contentAlignment = Alignment.Center
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 680.dp)
                    .clip(RoundedCornerShape(26.dp))
                    .border(1.5.dp, colors.borderStrong, RoundedCornerShape(26.dp))
                    .testTag("scan_photo_dialog"),
                color = colors.surface,
                shape = RoundedCornerShape(26.dp),
                shadowElevation = 10.dp
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // FIXED HEADER
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(colors.surface)
                            .padding(horizontal = 18.dp, vertical = 14.dp)
                    ) {
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
                                        .background(colors.primaryContainer),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CameraAlt,
                                        contentDescription = null,
                                        tint = colors.primary,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Column {
                                    Text(
                                        text = "ESCANEAR CUADERNO R07",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Black,
                                        color = colors.textPrimary,
                                        letterSpacing = 0.5.sp
                                    )
                                    Text(
                                        text = "Transcribe y estructura tus notas manuscritas",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = colors.primary,
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            IconButton(
                                onClick = onDismiss,
                                modifier = Modifier
                                    .size(30.dp)
                                    .testTag("close_scan_dialog_button")
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Cerrar",
                                    tint = colors.textPrimary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        // Target Day Selector Bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Guardar en el día:",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )

                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                (1..7).forEach { dayNum ->
                                    val isSelected = targetDay == dayNum
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = if (isSelected) colors.primary else colors.primaryContainer,
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .clickable { targetDay = dayNum }
                                    ) {
                                        Text(
                                            text = "D$dayNum",
                                            modifier = Modifier.padding(horizontal = 7.dp, vertical = 3.5.dp),
                                            style = MaterialTheme.typography.labelSmall,
                                            fontSize = 11.sp,
                                            fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Bold,
                                            color = if (isSelected) Color.White else colors.textPrimary
                                        )
                                    }
                                }
                            }
                        }
                    }

                    HorizontalDivider(color = colors.border.copy(alpha = 0.4f))

                    // SCROLLABLE FORM BODY
                    Column(
                        modifier = Modifier
                            .weight(1f, fill = false)
                            .verticalScroll(rememberScrollState())
                            .padding(18.dp)
                    ) {
                        // Section 1: Photos List / Thumbnails
                        if (scanState.selectedUris.isNotEmpty()) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.dp, colors.borderStrong, RoundedCornerShape(18.dp))
                                    .padding(12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "PÁGINAS SELECCIONADAS (${scanState.selectedUris.size})",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Black,
                                        color = colors.textPrimary
                                    )

                                    Text(
                                        text = "+ Agregar foto",
                                        style = MaterialTheme.typography.labelSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.primary,
                                        modifier = Modifier
                                            .clickable { singlePhotoLauncher.launch("image/*") }
                                            .padding(4.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .horizontalScroll(rememberScrollState()),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    scanState.selectedUris.forEachIndexed { index, uri ->
                                        Box(
                                            modifier = Modifier
                                                .size(86.dp)
                                                .clip(RoundedCornerShape(12.dp))
                                                .border(1.5.dp, colors.borderStrong, RoundedCornerShape(12.dp))
                                        ) {
                                            AsyncImage(
                                                model = uri,
                                                contentDescription = "Página ${index + 1}",
                                                modifier = Modifier.matchParentSize(),
                                                contentScale = ContentScale.Crop
                                            )

                                            // Badge page number
                                            Surface(
                                                color = Color.Black.copy(alpha = 0.65f),
                                                shape = RoundedCornerShape(bottomEnd = 6.dp),
                                                modifier = Modifier.align(Alignment.TopStart)
                                            ) {
                                                Text(
                                                    text = "P.${index + 1}",
                                                    color = Color.White,
                                                    fontSize = 9.5.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                                )
                                            }

                                            // Delete photo button
                                            Surface(
                                                color = Color.Red.copy(alpha = 0.85f),
                                                shape = CircleShape,
                                                modifier = Modifier
                                                    .align(Alignment.TopEnd)
                                                    .padding(3.dp)
                                                    .size(20.dp)
                                                    .clickable { onRemovePhoto(uri) }
                                            ) {
                                                Icon(
                                                    imageVector = Icons.Default.Close,
                                                    contentDescription = "Quitar foto",
                                                    tint = Color.White,
                                                    modifier = Modifier.padding(2.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            // Placeholder card to pick photos
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(140.dp)
                                    .clip(RoundedCornerShape(18.dp))
                                    .border(1.5.dp, colors.borderStrong, RoundedCornerShape(18.dp))
                                    .clickable { multiplePhotosLauncher.launch("image/*") }
                                    .testTag("upload_r07_image_tile"),
                                shape = RoundedCornerShape(18.dp),
                                color = colors.primaryContainer.copy(alpha = 0.5f)
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .clip(CircleShape)
                                            .background(colors.primary),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.PhotoLibrary,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(22.dp)
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Toca aquí para seleccionar fotos de tu cuaderno",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.textPrimary
                                    )
                                    Text(
                                        text = "Puedes seleccionar una o varias páginas escritas a mano",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = colors.textSecondary,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }

                        // Loading OCR animation
                        if (scanState.isScanning) {
                            Spacer(modifier = Modifier.height(14.dp))
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = colors.primaryContainer,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    CircularProgressIndicator(
                                        color = colors.primary,
                                        modifier = Modifier.size(24.dp),
                                        strokeWidth = 2.5.dp
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Column {
                                        Text(
                                            text = "Transcribiendo con Gemini 3.5 Flash...",
                                            style = MaterialTheme.typography.bodySmall,
                                            fontWeight = FontWeight.Bold,
                                            color = colors.textPrimary
                                        )
                                        Text(
                                            text = "Extrayendo caligrafía y bloques devocionales",
                                            style = MaterialTheme.typography.bodySmall,
                                            fontSize = 10.5.sp,
                                            color = colors.textSecondary
                                        )
                                    }
                                }
                            }
                        }

                        // Error message if any
                        if (scanState.errorMessage != null) {
                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFFFFEBEE),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.WarningAmber,
                                        contentDescription = null,
                                        tint = Color(0xFFC62828),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = scanState.errorMessage,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFFC62828)
                                    )
                                }
                            }
                        }

                        // SCANNED ENTRY RESULT & EDITABLE CONFIRMATION REVIEW
                        if (scanState.scannedEntry != null) {
                            val entry = scanState.scannedEntry
                            Spacer(modifier = Modifier.height(14.dp))

                            Surface(
                                shape = RoundedCornerShape(18.dp),
                                color = colors.primaryContainer.copy(alpha = 0.35f),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .border(1.5.dp, colors.borderStrong, RoundedCornerShape(18.dp))
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    // Legibility Header
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "✨ REVISIÓN Y EDICIÓN",
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = FontWeight.Black,
                                            color = colors.textPrimary
                                        )

                                        Surface(
                                            shape = RoundedCornerShape(10.dp),
                                            color = when {
                                                entry.legibilityScore >= 80 -> Color(0xFFE8F5E9)
                                                entry.legibilityScore >= 50 -> Color(0xFFFFF3E0)
                                                else -> Color(0xFFFFEBEE)
                                            }
                                        ) {
                                            Text(
                                                text = "Legibilidad: ${entry.legibilityScore}%",
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                                style = MaterialTheme.typography.labelSmall,
                                                fontWeight = FontWeight.Bold,
                                                color = when {
                                                    entry.legibilityScore >= 80 -> Color(0xFF2E7D32)
                                                    entry.legibilityScore >= 50 -> Color(0xFFE65100)
                                                    else -> Color(0xFFC62828)
                                                }
                                            )
                                        }
                                    }

                                    if (entry.legibilityNotes.isNotBlank()) {
                                        Text(
                                            text = "💡 ${entry.legibilityNotes}",
                                            style = MaterialTheme.typography.bodySmall,
                                            fontSize = 11.sp,
                                            color = colors.textSecondary,
                                            modifier = Modifier.padding(top = 4.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(10.dp))

                                    // Editable Fields Preview
                                    // 1. Cita & Hora
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        OutlinedTextField(
                                            value = draftScripture,
                                            onValueChange = { draftScripture = it },
                                            label = { Text("Lectura bíblica", fontSize = 11.sp) },
                                            modifier = Modifier.weight(1.2f),
                                            shape = RoundedCornerShape(12.dp),
                                            singleLine = true,
                                            colors = OutlinedTextFieldDefaults.colors(
                                                focusedContainerColor = colors.surface,
                                                unfocusedContainerColor = colors.surface,
                                                focusedTextColor = colors.textPrimary,
                                                unfocusedTextColor = colors.textPrimary,
                                                focusedBorderColor = colors.primary,
                                                unfocusedBorderColor = colors.border
                                            )
                                        )
                                        OutlinedTextField(
                                            value = draftTime,
                                            onValueChange = { draftTime = it },
                                            label = { Text("Hora", fontSize = 11.sp) },
                                            modifier = Modifier.weight(0.8f),
                                            shape = RoundedCornerShape(12.dp),
                                            singleLine = true,
                                            colors = OutlinedTextFieldDefaults.colors(
                                                focusedContainerColor = colors.surface,
                                                unfocusedContainerColor = colors.surface,
                                                focusedTextColor = colors.textPrimary,
                                                unfocusedTextColor = colors.textPrimary,
                                                focusedBorderColor = colors.primary,
                                                unfocusedBorderColor = colors.border
                                            )
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(8.dp))

                                    // 2. Dios me habló
                                    OutlinedTextField(
                                        value = draftGodSpoke,
                                        onValueChange = { draftGodSpoke = it },
                                        label = { Text("📖 Dios me habló (Rhema / Principio)", fontSize = 11.sp) },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(12.dp),
                                        minLines = 2,
                                        maxLines = 4,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedContainerColor = colors.surface,
                                            unfocusedContainerColor = colors.surface,
                                            focusedTextColor = colors.textPrimary,
                                            unfocusedTextColor = colors.textPrimary,
                                            focusedBorderColor = colors.primary,
                                            unfocusedBorderColor = colors.border
                                        )
                                    )

                                    Spacer(modifier = Modifier.height(8.dp))

                                    // 3. Reflexión
                                    OutlinedTextField(
                                        value = draftReflection,
                                        onValueChange = { draftReflection = it },
                                        label = { Text("💬 Reflexión y notas personales", fontSize = 11.sp) },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(12.dp),
                                        minLines = 2,
                                        maxLines = 4,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedContainerColor = colors.surface,
                                            unfocusedContainerColor = colors.surface,
                                            focusedTextColor = colors.textPrimary,
                                            unfocusedTextColor = colors.textPrimary,
                                            focusedBorderColor = colors.primary,
                                            unfocusedBorderColor = colors.border
                                        )
                                    )

                                    Spacer(modifier = Modifier.height(8.dp))

                                    // 4. Compromiso
                                    OutlinedTextField(
                                        value = draftActionStep,
                                        onValueChange = { draftActionStep = it },
                                        label = { Text("⚡ Compromiso / Acción práctica", fontSize = 11.sp) },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(12.dp),
                                        minLines = 2,
                                        maxLines = 3,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedContainerColor = colors.surface,
                                            unfocusedContainerColor = colors.surface,
                                            focusedTextColor = colors.textPrimary,
                                            unfocusedTextColor = colors.textPrimary,
                                            focusedBorderColor = colors.primary,
                                            unfocusedBorderColor = colors.border
                                        )
                                    )

                                    Spacer(modifier = Modifier.height(8.dp))

                                    // 5. Oración
                                    OutlinedTextField(
                                        value = draftPrayer,
                                        onValueChange = { draftPrayer = it },
                                        label = { Text("🙏 Oración escrita", fontSize = 11.sp) },
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(12.dp),
                                        minLines = 2,
                                        maxLines = 3,
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedContainerColor = colors.surface,
                                            unfocusedContainerColor = colors.surface,
                                            focusedTextColor = colors.textPrimary,
                                            unfocusedTextColor = colors.textPrimary,
                                            focusedBorderColor = colors.primary,
                                            unfocusedBorderColor = colors.border
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // FIXED BOTTOM ACTION BAR (Always visible and easily accessible!)
                    HorizontalDivider(color = colors.border.copy(alpha = 0.4f))

                    Surface(
                        color = colors.surface,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(horizontal = 18.dp, vertical = 12.dp)
                        ) {
                            if (scanState.scannedEntry != null) {
                                val entry = scanState.scannedEntry
                                Button(
                                    onClick = {
                                        val finalEntry = entry.copy(
                                            dayNumber = targetDay,
                                            scriptureRef = draftScripture,
                                            timeText = draftTime,
                                            godSpoke = draftGodSpoke,
                                            reflectionText = draftReflection,
                                            actionStep = draftActionStep,
                                            prayerText = draftPrayer,
                                            photoUris = scanState.selectedUris.map { it.toString() }
                                        )
                                        onApplyScannedEntry(finalEntry, targetDay)
                                    },
                                    shape = RoundedCornerShape(18.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(50.dp)
                                        .testTag("apply_scanned_entry_button")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Guardar y Confirmar en Día $targetDay ✨",
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 14.sp,
                                        color = Color.White
                                    )
                                }
                            } else if (scanState.selectedUris.isNotEmpty() && !scanState.isScanning) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    OutlinedButton(
                                        onClick = { multiplePhotosLauncher.launch("image/*") },
                                        shape = RoundedCornerShape(16.dp),
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(48.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.AddAPhoto,
                                            contentDescription = null,
                                            tint = colors.primary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "+ Fotos",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = colors.primary
                                        )
                                    }

                                    Button(
                                        onClick = {
                                            onProcessMultiPhotos(scanState.selectedUris, targetDay)
                                        },
                                        shape = RoundedCornerShape(16.dp),
                                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                                        modifier = Modifier
                                            .weight(1.5f)
                                            .height(48.dp)
                                            .testTag("start_ocr_button")
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.AutoAwesome,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "Transcribir con IA ✨",
                                            style = MaterialTheme.typography.labelMedium,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                    }
                                }
                            } else {
                                Button(
                                    onClick = { multiplePhotosLauncher.launch("image/*") },
                                    shape = RoundedCornerShape(16.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp)
                                        .testTag("pick_photos_button")
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.PhotoLibrary,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Seleccionar Fotos del Cuaderno 📸",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.5.sp,
                                        color = Color.White
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
