import React from 'react';
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
import { MesaButton, Pencil } from '@veupathdb/coreui';
import { gray, mutedBlue } from '@veupathdb/coreui/lib/definitions/colors';

interface Props {
  buttonText: string;
  onPress: () => void;
}

export function ThemedUpdateButton({ buttonText, onPress }: Props) {
  useUITheme();
  return (
    <MesaButton
      text={buttonText}
      textTransform="none"
      onPress={onPress}
      themeRole={undefined}
      icon={Pencil}
      styleOverrides={{
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
          color: mutedBlue[500],
          textColor: 'white',
          dropShadow: {
            color: mutedBlue[700],
            blurRadius: '0px',
            offsetX: '0px',
            offsetY: '4px',
          },
        },
        pressed: {
          color: mutedBlue[600],
          textColor: 'white',
          dropShadow: {
            color: mutedBlue[700],
            blurRadius: '0px',
            offsetX: '0px',
            offsetY: '4px',
          },
        },
      }}
    />
  );
}
