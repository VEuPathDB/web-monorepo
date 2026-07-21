import React from 'react';
import { MesaButton, Pencil } from '@veupathdb/coreui';
import { useButtonTheme } from '../Utils/theming';

interface Props {
  buttonText: string;
  onPress: () => void;
}

export function ThemedUpdateButton({ buttonText, onPress }: Props) {
  const buttonTheme = useButtonTheme();
  return (
    <MesaButton
      text={buttonText}
      textTransform="none"
      onPress={onPress}
      themeRole={undefined}
      icon={Pencil}
      styleOverrides={buttonTheme}
    />
  );
}
