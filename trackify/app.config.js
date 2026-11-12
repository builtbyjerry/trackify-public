// app.config.js
module.exports = ({ config }) => {
  const isPreview = process.env.APP_ENV === 'preview'
  const isProduction = process.env.APP_ENV === 'production'

  return {
    ...config,
    name: isPreview ? 'Trackify (Preview)' : isProduction ? 'Trackify' : 'Trackify (Dev)',
    slug: 'trackify',
    android: {
      ...config.android,
      package: isPreview
        ? 'com.example.trackify.preview'
        : isProduction
          ? 'com.example.trackify'
          : 'com.example.trackify.dev',
      adaptiveIcon: {
        foregroundImage: './assets/trackify-preview.png',
        // backgroundColor: '#A1C2BD',
      },
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
      ],
    },
    // everything else stays the same
    scheme: 'trackify',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/trackify-preview.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/icons8-shop-50.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isPreview
        ? 'com.example.trackify.preview'
        : isProduction
          ? 'com.example.trackify'
          : 'com.example.trackify.dev',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: 'Allow $(PRODUCT_NAME) to access your camera',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-asset',
      'expo-font',
      ['expo-secure-store', { configureAndroidBackup: true }],
      [
        'expo-image-picker',
        {
          photosPermission: 'Allow $(PRODUCT_NAME) to access your photos.',
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera.',
        },
      ],
      [
        'react-native-vision-camera',
        { cameraPermission: '$(PRODUCT_NAME) needs access to your Camera' },
      ],
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'react-native',
          organization: 'trackify-x5',
        },
      ],
      '@sentry/react-native',
    ],
    extra: {
      router: {},
      eas: { projectId: '1df9900b-afe5-4357-bd62-9eb3b0935e6c' },
    },
    owner: 'jerrychan16',
    runtimeVersion: { policy: 'appVersion' },
    updates: { url: 'https://u.expo.dev/1df9900b-afe5-4357-bd62-9eb3b0935e6c' },
  }
}