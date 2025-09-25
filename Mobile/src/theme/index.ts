import { DefaultTheme } from 'react-native-paper';
import { lightTheme, darkTheme } from './colors';
import { typography } from './typography';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...lightTheme,
  },
  fonts: {
    ...DefaultTheme.fonts,
    ...typography,
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

export const createTheme = (isDark: boolean) => ({
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...(isDark ? darkTheme : lightTheme),
  },
  fonts: {
    ...DefaultTheme.fonts,
    ...typography,
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
});