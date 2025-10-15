import React from "react";

import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from '@veupathdb/coreui/lib/components/buttons/FloatingButton';
import Trash from '@veupathdb/coreui/lib/components/icons/Trash';
import { TextBox, Checkbox } from "@veupathdb/wdk-client/lib/Components";

import * as utils from "./component-utils";
import { FieldLabel } from "./FieldLabel";
import { LinkedDataset } from "../../Service/Types";

export interface LinkedDatasetInputProps {
  index: number;

  link: LinkedDataset;

  onSetUrl: (value: string) => void;
  onSetSharesRecords: (value: boolean) => void;
  onRemoveLink: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function LinkedDatasetInput(props: LinkedDatasetInputProps): React.ReactElement {
  return (
    <div className={utils.cx('--NestedInputContainer')}>
      <div className={utils.cx('--NestedInputTitle')}>
        <FieldLabel required={false} style={{ fontSize: '1.2em' }}>
          Hyperlink {props.index + 1}
        </FieldLabel>
        <FloatingButton
          text="Remove"
          onPress={props.onRemoveLink}
          icon={Trash}
          styleOverrides={FloatingButtonWDKStyle}
        />
      </div>
      <div className={utils.cx('--NestedInputFields')}>
        <FieldLabel required>Target Dataset URL</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-hyperlink-url-${props.index}`}
          placeholder="URL"
          required
          value={props.link.datasetUri}
          onChange={props.onSetUrl}
        />
        <FieldLabel required={false}>Shares Records</FieldLabel>
        <Checkbox
          value={props.link.sharesRecords}
          onChange={props.onSetSharesRecords}
        />
      </div>
    </div>
  );
}
