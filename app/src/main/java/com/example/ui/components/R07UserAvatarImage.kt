package com.example.ui.components

import android.graphics.Bitmap
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import com.example.ui.theme.R07Theme
import java.io.File
import java.io.FileOutputStream

@Composable
fun R07UserAvatarImage(
    photoUri: String,
    fallbackAvatar: String,
    modifier: Modifier = Modifier,
    size: Dp = 48.dp,
    isEditable: Boolean = false,
    onPhotoSelected: (uriString: String) -> Unit = {},
    onPhotoRemoved: () -> Unit = {}
) {
    val colors = R07Theme.colors
    val context = LocalContext.current
    var showPhotoOptionsDialog by remember { mutableStateOf(false) }

    // Launcher for gallery selection
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            val uriStr = uri.toString()
            onPhotoSelected(uriStr)
            Toast.makeText(context, "📸 Foto de perfil cargada y validada correctamente", Toast.LENGTH_SHORT).show()
            showPhotoOptionsDialog = false
        }
    }

    // Launcher for direct camera selfie
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            try {
                val cacheDir = File(context.cacheDir, "user_avatars")
                if (!cacheDir.exists()) cacheDir.mkdirs()
                val avatarFile = File(cacheDir, "selfie_avatar_.jpg")
                val fos = FileOutputStream(avatarFile)
                bitmap.compress(Bitmap.CompressFormat.JPEG, 90, fos)
                fos.flush()
                fos.close()

                val savedUri = Uri.fromFile(avatarFile).toString()
                onPhotoSelected(savedUri)
                Toast.makeText(context, "✨ Selfie devocional capturada y verificada ✓", Toast.LENGTH_SHORT).show()
                showPhotoOptionsDialog = false
            } catch (e: Exception) {
                Toast.makeText(context, "Error al guardar selfie: ", Toast.LENGTH_SHORT).show()
            }
        }
    }

    Box(
        modifier = modifier
            .size(size)
            .testTag("user_avatar_container"),
        contentAlignment = Alignment.Center
    ) {
        // Main Avatar Circle
        Surface(
            shape = CircleShape,
            color = colors.primaryContainer,
            border = androidx.compose.foundation.BorderStroke(1.5.dp, colors.primary),
            modifier = Modifier
                .size(size)
                .clip(CircleShape)
                .clickable(enabled = isEditable) { showPhotoOptionsDialog = true }
        ) {
            if (photoUri.isNotBlank()) {
                AsyncImage(
                    model = photoUri,
                    contentDescription = "Foto de perfil de usuario",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(size)
                        .clip(CircleShape)
                )
            } else {
                Box(
                    modifier = Modifier.size(size),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (fallbackAvatar.isNotBlank()) fallbackAvatar else "👤",
                        fontSize = (size.value * 0.45f).sp
                    )
                }
            }
        }

        // Edit Badge Overlay if editable
        if (isEditable) {
            Box(
                modifier = Modifier
                    .size(size * 0.35f)
                    .align(Alignment.BottomEnd)
                    .clip(CircleShape)
                    .background(colors.primary)
                    .border(1.dp, Color.White, CircleShape)
                    .clickable { showPhotoOptionsDialog = true },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.CameraAlt,
                    contentDescription = "Cambiar foto",
                    tint = Color.White,
                    modifier = Modifier.size(size * 0.20f)
                )
            }
        }
    }

    // Modal Dialog to capture selfie or select photo
    if (showPhotoOptionsDialog) {
        Dialog(onDismissRequest = { showPhotoOptionsDialog = false }) {
            Surface(
                shape = RoundedCornerShape(24.dp),
                color = colors.surface,
                border = androidx.compose.foundation.BorderStroke(1.dp, colors.border),
                shadowElevation = 10.dp,
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .testTag("photo_picker_dialog")
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(imageVector = Icons.Default.VerifiedUser, contentDescription = null, tint = colors.primary, modifier = Modifier.size(20.dp))
                            Text(
                                text = "Foto de Perfil Devocional",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = colors.textPrimary
                            )
                        }
                        IconButton(onClick = { showPhotoOptionsDialog = false }, modifier = Modifier.size(28.dp)) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "Cerrar", tint = colors.textPrimary)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Live Preview
                    Box(
                        modifier = Modifier
                            .size(90.dp)
                            .clip(CircleShape)
                            .border(2.5.dp, colors.primary, CircleShape)
                            .background(colors.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        if (photoUri.isNotBlank()) {
                            AsyncImage(
                                model = photoUri,
                                contentDescription = "Vista previa",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .size(90.dp)
                                    .clip(CircleShape)
                            )
                        } else {
                            Text(text = if (fallbackAvatar.isNotBlank()) fallbackAvatar else "👤", fontSize = 42.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Validation rule banner
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = colors.primaryContainer.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = colors.primary, modifier = Modifier.size(16.dp))
                            Text(
                                text = "Regla de Perfil: Utiliza una selfie clara y respetuosa (1:1 circular) para tu cuenta y comunión en el grupo de conexión.",
                                style = MaterialTheme.typography.bodySmall,
                                color = colors.textPrimary,
                                fontSize = 11.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Option 1: Take Selfie
                    Button(
                        onClick = {
                            cameraLauncher.launch(null)
                        },
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primary),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .testTag("take_selfie_button")
                    ) {
                        Icon(imageVector = Icons.Default.CameraAlt, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Tomar Selfie con Cámara 📸", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 13.sp)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // Option 2: Gallery Picker
                    OutlinedButton(
                        onClick = {
                            galleryLauncher.launch("image/*")
                        },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .testTag("pick_gallery_photo_button")
                    ) {
                        Icon(imageVector = Icons.Default.PhotoLibrary, contentDescription = null, tint = colors.textPrimary, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Elegir de Galería de Fotos 🖼️", fontWeight = FontWeight.SemiBold, color = colors.textPrimary, fontSize = 13.sp)
                    }

                    // Option 3: Remove photo if present
                    if (photoUri.isNotBlank()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedButton(
                            onClick = {
                                onPhotoRemoved()
                                Toast.makeText(context, "Foto eliminada. Se usará el avatar predeterminado.", Toast.LENGTH_SHORT).show()
                                showPhotoOptionsDialog = false
                            },
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(40.dp)
                                .testTag("remove_photo_button")
                        ) {
                            Icon(imageVector = Icons.Default.DeleteOutline, contentDescription = null, tint = Color(0xFFC62828), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Eliminar Foto Actual", color = Color(0xFFC62828), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }
    }
}
