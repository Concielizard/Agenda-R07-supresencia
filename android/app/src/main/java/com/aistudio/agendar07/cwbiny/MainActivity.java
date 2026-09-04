package com.aistudio.agendar07.cwbiny;

import android.content.ContentValues;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    public class NativeGalleryBridge {
        private final Context context;

        public NativeGalleryBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public boolean saveImageToGallery(String base64Data, String filename) {
            try {
                if (base64Data == null || base64Data.isEmpty()) return false;
                String cleanBase64 = base64Data;
                if (cleanBase64.contains(",")) {
                    cleanBase64 = cleanBase64.substring(cleanBase64.indexOf(",") + 1);
                }
                byte[] decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT);
                Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
                if (bitmap == null) return false;

                String name = (filename != null && !filename.isEmpty()) ? filename : ("plano_r07_" + System.currentTimeMillis() + ".png");
                if (!name.endsWith(".png") && !name.endsWith(".jpg")) {
                    name += ".png";
                }

                boolean saved = false;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Images.Media.DISPLAY_NAME, name);
                    values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                    values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/AgendaR07");
                    values.put(MediaStore.Images.Media.IS_PENDING, 1);

                    Uri uri = context.getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (OutputStream out = context.getContentResolver().openOutputStream(uri)) {
                            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
                        }
                        values.clear();
                        values.put(MediaStore.Images.Media.IS_PENDING, 0);
                        context.getContentResolver().update(uri, values, null, null);
                        saved = true;
                    }
                } else {
                    File picturesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
                    File appDir = new File(picturesDir, "AgendaR07");
                    if (!appDir.exists()) {
                        appDir.mkdirs();
                    }
                    File imageFile = new File(appDir, name);
                    try (OutputStream out = new FileOutputStream(imageFile)) {
                        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
                    }
                    MediaScannerConnection.scanFile(context, new String[]{imageFile.getAbsolutePath()}, new String[]{"image/png"}, null);
                    saved = true;
                }

                if (saved) {
                    android.util.Log.d("NativeGallery", "saveImageToGallery finished successfully: " + name);
                    runOnUiThread(() -> Toast.makeText(context, "✓ ¡Plano guardado en tu Galería!", Toast.LENGTH_LONG).show());
                } else {
                    android.util.Log.w("NativeGallery", "saveImageToGallery failed to save image");
                }
                return saved;
            } catch (Exception e) {
                android.util.Log.e("NativeGallery", "Exception in saveImageToGallery", e);
                e.printStackTrace();
                return false;
            }
        }
    }

    private void registerNativeGalleryBridge() {
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().addJavascriptInterface(new NativeGalleryBridge(this), "NativeGallery");
                android.util.Log.d("NativeGallery", "NativeGallery JavascriptInterface registered successfully!");
            }
        } catch (Exception e) {
            android.util.Log.e("NativeGallery", "Error registering NativeGallery", e);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerNativeGalleryBridge();

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().evaluateJavascript(
                        "(function() { if (window.handleAndroidBack) { return window.handleAndroidBack(); } return false; })()",
                        value -> {
                            if ("false".equals(value) || value == null) {
                                setEnabled(false);
                                getOnBackPressedDispatcher().onBackPressed();
                                setEnabled(true);
                            }
                        }
                    );
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                    setEnabled(true);
                }
            }
        });
    }

    @Override
    public void onStart() {
        super.onStart();
        registerNativeGalleryBridge();
    }

    @Override
    public void onResume() {
        super.onResume();
        registerNativeGalleryBridge();
    }
}
