import type { CapacitorConfig } from '@capacitor/cli';

// The iOS app wraps the same web build (dist/). See "Run it on your iPhone" in the README.
const config: CapacitorConfig = {
  // Must be unique to you for Xcode's free signing. Change it if Xcode says it's taken.
  appId: 'com.forkbiscuit.updown',
  appName: 'UpDown',
  webDir: 'dist',
  backgroundColor: '#030303',
  ios: {
    // Content runs edge to edge; the CSS handles the notch and home indicator.
    contentInset: 'never',
    backgroundColor: '#030303',
    // Screens scroll themselves; the page as a whole shouldn't bounce.
    scrollEnabled: false,
  },
  plugins: {
    // Light status bar text on the dark app.
    StatusBar: { style: 'DARK' },
  },
};

export default config;
