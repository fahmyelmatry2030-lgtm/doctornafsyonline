import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.doctornafsy.app',
  appName: 'دكتور نفسي',
  webDir: 'out',
  server: {
    url: 'https://doctornafsyonline.com',
    cleartext: true
  }
};

export default config;
