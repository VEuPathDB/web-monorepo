import { useState } from 'react';

// Components
import { H5, FilledButton, FormField, Edit } from '@veupathdb/coreui';

// Definitions
import { gray } from '@veupathdb/coreui/dist/definitions/colors';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';

type NameAnalysisProps = {
  currentName: string;
  updateName: (name: string) => void;
};

/**
 * Displayed when the user has not yet provided a unique name for an analysis
 * and is attempted to share/publish it.
 * */
export default function NameAnalysis({
  currentName,
  updateName,
}: NameAnalysisProps) {
  const [localAnalysisName, setLocalAnalysisName] = useState<
    string | undefined
  >(undefined);

  const theme = useUITheme();

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
          In order to share or make this analysis public, please first give it a
          name.
        </p>
        <div style={{ display: 'flex', marginTop: 25, position: 'relative' }}>
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
          <div
            style={{
              position: 'relative',
              left: -25,
              top: 26,
              pointerEvents: 'none',
              cursor: 'pointer',
            }}
          >
            <Edit
              fontSize={20}
              fill={theme?.palette.primary.hue[theme.palette.primary.level]}
            />
          </div>
        </div>
      </div>

      <FilledButton
        text="Submit"
        themeRole="secondary"
        disabled={localAnalysisName === undefined || !localAnalysisName.length}
        onPress={() =>
          localAnalysisName &&
          localAnalysisName.length &&
          updateName(localAnalysisName)
        }
      />
    </div>
  );
}
