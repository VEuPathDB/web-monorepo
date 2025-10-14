import React from "react";

import { FloatingButton } from "@veupathdb/coreui";
import { FloatingButtonWDKStyle } from '@veupathdb/coreui/lib/components/buttons/FloatingButton';
import Trash from '@veupathdb/coreui/lib/components/icons/Trash';
import { TextBox, RadioList } from '@veupathdb/wdk-client/lib/Components';

import * as utils from "./component-utils";
import { FieldLabel } from "./FieldLabel";

export interface HyperlinkInputProps {
  n: number;
  url: string;
  text: string;
  onAddUrl: (value: string) => void;
  onAddText: (value: string) => void;
  onAddDescription: (value: string) => void;
  onAddIsPublication: (value: boolean) => void;
  onRemoveHyperlink: (event: React.MouseEvent<HTMLButtonElement>) => void;
  description?: string;
  isPublication?: boolean;
}

export function HyperlinkInput(props: HyperlinkInputProps): React.ReactElement {
  const {
    n,
    url = '',
    text = '',
    description = '',
    isPublication = false,
    onAddUrl,
    onAddText,
    onAddDescription,
    onAddIsPublication,
    onRemoveHyperlink,
  } = props;

  return (
    <div className={utils.cx('--NestedInputContainer')}>
      <div className={utils.cx('--NestedInputTitle')}>
        <FieldLabel required={false} style={{ fontSize: '1.2em' }}>
          Hyperlink {n + 1}
        </FieldLabel>
        <FloatingButton
          text="Remove"
          onPress={onRemoveHyperlink}
          icon={Trash}
          styleOverrides={FloatingButtonWDKStyle}
        />
      </div>
      <div className={utils.cx('--NestedInputFields')}>
        <FieldLabel required>URL</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-hyperlink-url-${n}`}
          placeholder="URL"
          required
          value={url}
          onChange={onAddUrl}
        />
        <FieldLabel required>Text</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-hyperlink-text-${n}`}
          placeholder="Hyperlink text"
          value={text}
          onChange={onAddText}
        />
        <FieldLabel required={false}>Description</FieldLabel>
        <TextBox
          type="input"
          id={`data-set-hyperlink-description-${n}`}
          placeholder="Description"
          value={description}
          required={false}
          onChange={onAddDescription}
        />
        <FieldLabel required={false}>Is publication?</FieldLabel>
        <RadioList
          name={`isPublication-${n}`}
          className="horizontal"
          value={isPublication ? 'true' : 'false'}
          onChange={(value) => {
            onAddIsPublication(value === 'true');
          }}
          items={[
            { value: 'true', display: 'Yes' },
            { value: 'false', display: 'No' },
          ]}
        />
      </div>
    </div>
  );
}
