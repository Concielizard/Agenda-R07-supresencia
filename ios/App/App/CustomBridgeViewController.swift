import UIKit
import Capacitor
import WebKit
import Photos

class CustomBridgeViewController: CAPBridgeViewController, WKScriptMessageHandler {

    override func viewDidLoad() {
        super.viewDidLoad()
        setupNativeGallery()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        setupNativeGallery()
    }

    private func setupNativeGallery() {
        guard let webView = bridge?.webView else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
                self?.setupNativeGallery()
            }
            return
        }

        let contentController = webView.configuration.userContentController
        contentController.removeScriptMessageHandler(forName: "nativeGallery")
        contentController.add(self, name: "nativeGallery")

        let jsBridge = """
        (function() {
            window.NativeGallery = {
                saveImageToGallery: function(dataUrl, fileName) {
                    try {
                        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeGallery) {
                            window.webkit.messageHandlers.nativeGallery.postMessage({
                                dataUrl: dataUrl,
                                fileName: fileName
                            });
                            return true;
                        }
                    } catch (e) {
                        console.error('[NativeGallery iOS] Error invocando puente nativo', e);
                    }
                    return false;
                }
            };
        })();
        """

        let script = WKUserScript(source: jsBridge, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        contentController.addUserScript(script)
        webView.evaluateJavaScript(jsBridge, completionHandler: nil)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "nativeGallery",
              let dict = message.body as? [String: Any],
              let dataUrl = dict["dataUrl"] as? String else {
            return
        }

        saveImageToPhotos(dataUrl: dataUrl)
    }

    private func saveImageToPhotos(dataUrl: String) {
        var base64String = dataUrl
        if let commaIndex = base64String.firstIndex(of: ",") {
            base64String = String(base64String[base64String.index(after: commaIndex)...])
        }

        guard let data = Data(base64Encoded: base64String, options: .ignoreUnknownCharacters),
              let image = UIImage(data: data) else {
            print("[NativeGallery iOS] No se pudo decodificar la imagen Base64")
            return
        }

        let saveBlock = { [weak self] in
            guard let self = self else { return }
            UIImageWriteToSavedPhotosAlbum(image, self, #selector(self.imageSaved(_:didFinishSavingWithError:contextInfo:)), nil)
        }

        if #available(iOS 14, *) {
            PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
                DispatchQueue.main.async {
                    switch status {
                    case .authorized, .limited:
                        saveBlock()
                    default:
                        self.showPermissionAlert()
                    }
                }
            }
        } else {
            PHPhotoLibrary.requestAuthorization { status in
                DispatchQueue.main.async {
                    if status == .authorized {
                        saveBlock()
                    } else {
                        self.showPermissionAlert()
                    }
                }
            }
        }
    }

    @objc private func imageSaved(_ image: UIImage, didFinishSavingWithError error: Error?, contextInfo: UnsafeRawPointer) {
        DispatchQueue.main.async {
            if let error = error {
                print("[NativeGallery iOS] Error guardando imagen en Fotos: \(error.localizedDescription)")
            } else {
                print("[NativeGallery iOS] ¡Plano guardado exitosamente en el Carrete de Fotos!")
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.success)
            }
        }
    }

    private func showPermissionAlert() {
        let alert = UIAlertController(
            title: "Permiso a Fotos requerido",
            message: "Agenda R07 necesita permiso para guardar el plano en tu carrete. Por favor habilítalo en Ajustes.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
