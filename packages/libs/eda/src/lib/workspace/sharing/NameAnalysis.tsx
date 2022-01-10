import { useState } from 'react';

// Components
import { H5 } from '@veupathdb/core-components';
import { FilledButton } from '@veupathdb/core-components/dist/components/buttons';
import FormField from '@veupathdb/core-components/dist/components/forms/FormField';

// Definitions
import { gray } from '@veupathdb/core-components/dist/definitions/colors';

type NameAnalysisProps = {
  currentName: string;
  updateName: (name: string) => void;
};

export default function NameAnalysis({
  currentName,
  updateName,
}: NameAnalysisProps) {
  const [localAnalysisName, setLocalAnalysisName] = useState<
    string | undefined
  >(undefined);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingBottom: 25,
      }}
    >
      <div>
        <H5
          text="Name Your Analysis"
          additionalStyles={{ marginTop: 25, marginBottom: 0 }}
        />
        <p
          style={{
            fontSize: '.9rem',
            color: gray[600],
            marginTop: 0,
            maxWidth: 500,
          }}
        >
          To make this analysis public, please first give it a name.
        </p>
        <div style={{ display: 'flex', marginTop: 25 }}>
          <FormField
            label="Analysis Name"
            onValueChange={(value) => {
              setLocalAnalysisName(value);
            }}
            type="text"
            value={localAnalysisName ?? ''}
            themeRole="primary"
            width="200px"
            placeholder={currentName}
          />
        </div>
      </div>

      <FilledButton
        text="Submit"
        themeRole="secondary"
        onPress={() =>
          localAnalysisName &&
          localAnalysisName.length &&
          updateName(localAnalysisName)
        }
      />
    </div>
  );
}
