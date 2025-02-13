import { jsx as _jsx } from 'react/jsx-runtime';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { MesaButton, Share } from '@veupathdb/coreui';
export function ThemedGrantAccessButton({ buttonText, onPress }) {
  const theme = useUITheme();
  return _jsx(MesaButton, {
    text: buttonText,
    textTransform: 'none',
    onPress: onPress,
    themeRole: 'primary',
    icon: Share,
    styleOverrides: {
      default: {
        border: {
          color:
            theme === null || theme === void 0
              ? void 0
              : theme.palette.primary.hue[theme.palette.primary.level + 100],
          style: 'solid',
          width: 1,
        },
      },
      hover: {
        color:
          theme === null || theme === void 0
            ? void 0
            : theme.palette.primary.hue[theme.palette.primary.level + 100],
        dropShadow: {
          color:
            theme === null || theme === void 0
              ? void 0
              : theme.palette.primary.hue[theme.palette.primary.level + 300],
          blurRadius: '0px',
          offsetX: '0px',
          offsetY: '4px',
        },
      },
      pressed: {
        color:
          theme === null || theme === void 0
            ? void 0
            : theme.palette.primary.hue[theme.palette.primary.level + 200],
        dropShadow: {
          color:
            theme === null || theme === void 0
              ? void 0
              : theme.palette.primary.hue[theme.palette.primary.level + 400],
          blurRadius: '0px',
          offsetX: '0px',
          offsetY: '4px',
        },
      },
    },
  });
}
//# sourceMappingURL=ThemedGrantAccessButton.js.map
