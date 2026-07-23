import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dragonart.app',
  appName: 'WyrmPIXEL',
  webDir: 'dist',
  android: {
    backgroundColor: '#000000',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
};

export default config;
