// Components
import {
  FloatingButton,
  H5,
  Paragraph,
  TableDownload,
  colors,
} from '@veupathdb/coreui';

// Hooks
import { useUITheme } from '@veupathdb/coreui/lib/components/theming';

// Definitions
import {
  EnhancedEntityData,
  EnhancedEntityDatum,
} from './hooks/useEnhancedEntityData';
import { useState } from 'react';
import SubsetDownloadModal from '../Subsetting/SubsetDownloadModal';
import { AnalysisState } from '../../core';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { useAttemptActionCallback } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { Action } from '@veupathdb/study-data-access/lib/data-restriction/DataRestrictionUiActions';

type MySubsetProps = {
  datasetId: string;
  entities: EnhancedEntityData;
  analysisState: AnalysisState;
};

export default function MySubset({
  datasetId,
  entities,
  analysisState,
}: MySubsetProps) {
  const theme = useUITheme();

  const [mySubsetModalOpen, setMySubsetModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] =
    useState<EnhancedEntityDatum | undefined>(undefined);

  const attemptAction = useAttemptActionCallback();

  const starredVariables = analysisState.analysis?.descriptor.starredVariables;
  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  return (
    <div key="My Subset" style={{ marginTop: 20, marginBottom: 35 }}>
      {currentEntity ? (
        <SubsetDownloadModal
          displayModal={mySubsetModalOpen}
          toggleDisplay={() => {
            setMySubsetModalOpen(false);
            setCurrentEntity(undefined);
          }}
          analysisState={analysisState}
          entities={entities}
          currentEntity={currentEntity}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
        />
      ) : null}

      <H5 text="My Subset" additionalStyles={{ margin: 0 }} />
      <Paragraph
        color={colors.gray[600]}
        styleOverrides={{ margin: '0 0 15px 0' }}
        textSize="medium"
      >
        Configure and download one or more tabular files of the filtered
        dataset.
      </Paragraph>
      {Object.values(entities).map((data, index) => (
        <FloatingButton
          key={index}
          text={`${data.filteredCount?.toLocaleString()} of ${data.totalCount?.toLocaleString()} ${
            data.displayNamePlural
          }`}
          onPress={() => {
            attemptAction(Action.download, {
              studyId: datasetId,
              onAllow: () => {
                setCurrentEntity(data);
                setMySubsetModalOpen(true);
              },
            });
          }}
          icon={TableDownload}
          textTransform="none"
          themeRole="primary"
          styleOverrides={{
            container: { marginBottom: 10 },
            default: {
              color: theme?.palette.primary.hue[100],
              textColor: theme?.palette.primary.hue[500],
            },
            hover: { color: theme?.palette.primary.hue[200] },
          }}
        />
      ))}
    </div>
  );
}
