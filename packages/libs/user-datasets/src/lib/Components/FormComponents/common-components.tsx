import React from "react";

import { FloatingButton } from "@veupathdb/coreui";
import { Trash } from "@veupathdb/coreui/lib/components/icons";
import { FloatingButtonWDKStyle } from "@veupathdb/coreui/lib/components/buttons/FloatingButton";

export function TrashButton(props: { onRemove: (e: React.MouseEvent<HTMLButtonElement>) => void }): React.ReactElement {
  return (
    <FloatingButton
      text="Remove"
      onPress={props.onRemove}
      icon={Trash}
      styleOverrides={FloatingButtonWDKStyle}
    />
  );
}