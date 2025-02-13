import { jsx as _jsx } from 'react/jsx-runtime';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { MesaButton, Trash } from '@veupathdb/coreui';
import { gray, mutedRed } from '@veupathdb/coreui/lib/definitions/colors';
export function ThemedDeleteButton({ buttonText, onPress }) {
  const theme = useUITheme();
  return _jsx(MesaButton, {
    text: buttonText,
    textTransform: 'none',
    onPress: onPress,
    themeRole: undefined,
    icon: Trash,
    styleOverrides: {
      default: {
        color: gray[100],
        textColor: '#4D4D4D',
        dropShadow: {
          color: gray[200],
          blurRadius: '0px',
          offsetX: '0px',
          offsetY: '3px',
        },
        border: {
          color: gray[200],
          style: 'solid',
          width: 1,
        },
      },
      hover: {
        color: mutedRed[500],
        textColor: 'white',
        dropShadow: {
          color: mutedRed[700],
          blurRadius: '0px',
          offsetX: '0px',
          offsetY: '4px',
        },
      },
      pressed: {
        color: mutedRed[600],
        textColor: 'white',
        dropShadow: {
          color: mutedRed[700],
          blurRadius: '0px',
          offsetX: '0px',
          offsetY: '4px',
        },
      },
    },
  });
}
//# sourceMappingURL=ThemedDeleteButton.js.map
