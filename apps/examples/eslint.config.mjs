// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import { sharedConfigs } from '@narduk/eslint-config';

export default withNuxt(
  ...sharedConfigs,
  // Examples app overrides — allow native layout elements for demo purposes
  {
    files: ['app/**/*.vue'],
    rules: {
      'atx/no-native-layout': 'off',
    },
  }
);
