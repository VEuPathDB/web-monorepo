import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { MesaButton, Share } from '@veupathdb/coreui';

export type ThemedButtonProps = {
  buttonText: string;
  onPress: () => null;
};

export function ThemedGrantAccessButton({
  buttonText,
  onPress,
}: ThemedButtonProps) {
  const theme = useUITheme();
  return (
    <MesaButton
      text={buttonText}
      textTransform="none"
      onPress={onPress}
      themeRole="primary"
      icon={Share}
      styleOverrides={{
        default: {
          border: {
            color:
              theme?.palette.primary.hue[theme.palette.primary.level + 100],
            style: 'solid',
            width: 1,
          },
        },
        hover: {
          color: theme?.palette.primary.hue[theme.palette.primary.level + 100],
          dropShadow: {
            color:
              theme?.palette.primary.hue[theme.palette.primary.level + 300],
            blurRadius: '0px',
            offsetX: '0px',
            offsetY: '4px',
          },
        },
        pressed: {
          color: theme?.palette.primary.hue[theme.palette.primary.level + 200],
          dropShadow: {
            color:
              theme?.palette.primary.hue[theme.palette.primary.level + 400],
            blurRadius: '0px',
            offsetX: '0px',
            offsetY: '4px',
          },
        },
      }}
    />
  );
}
