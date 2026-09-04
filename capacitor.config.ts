import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aistudio.agendar07.cwbiny',
  appName: 'Agenda R07',
  webDir: 'dist/r07-agenda/browser',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  android: {
    resizeOnFullScreen: false
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile'
  },
  plugins: {
    Keyboard: {
      resize: 'none'
    }
  }
};

export default config;
