import { startCase } from 'lodash';

// Components
import {
  FloatingButton,
  H5,
  Paragraph,
  TableDownload,
  colors,
} from '@veupathdb/core-components';

// Hooks
import { useUITheme } from '@veupathdb/core-components/dist/components/theming';

// Definitions
import {
  EnhancedEntityData,
  EnhancedEntityDatum,
} from './hooks/useEnhancedEntityData';
import { useMemo, useState } from 'react';
import SubsettingDataGridModal from '../Subsetting/SubsettingDataGridModal';
import { AnalysisState } from '../../core';
import { useToggleStarredVariable } from '../../core/hooks/starredVariables';
import { EntityCounts } from '../../core/hooks/entityCounts';

type MySubsetProps = {
  entities: EnhancedEntityData;
  analysisState: AnalysisState;
  totalEntityCounts: EntityCounts | undefined;
  filteredEntityCounts: EntityCounts | undefined;
};

export default function MySubset({
  entities,
  analysisState,
  totalEntityCounts,
  filteredEntityCounts,
}: MySubsetProps) {
  const theme = useUITheme();

  const [mySubsetModalOpen, setMySubsetModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<
    EnhancedEntityDatum | undefined
  >(undefined);

  const starredVariables = analysisState.analysis?.descriptor.starredVariables;
  const toggleStarredVariable = useToggleStarredVariable(analysisState);

  const [totalEntityCount, filteredEntityCount] = useMemo(() => {
    if (currentEntity && totalEntityCounts && filteredEntityCounts) {
      return [
        totalEntityCounts[currentEntity.id],
        filteredEntityCounts[currentEntity.id],
      ];
    } else {
      return [undefined, undefined];
    }
  }, [currentEntity, totalEntityCounts, filteredEntityCounts]);

  return (
    <div key="My Subset" style={{ marginBottom: 35 }}>
      {currentEntity ? (
        <SubsettingDataGridModal
          displayModal={mySubsetModalOpen}
          toggleDisplay={() => {
            setMySubsetModalOpen(false);
            setCurrentEntity(undefined);
          }}
          analysisState={analysisState}
          entities={entities}
          currentEntityID={currentEntity.id}
          currentEntityRecordCounts={{
            total: totalEntityCount,
            filtered: filteredEntityCount,
          }}
          starredVariables={starredVariables}
          toggleStarredVariable={toggleStarredVariable}
        />
      ) : null}

      <H5 text="My Subset" additionalStyles={{ margin: 0 }} />
      <Paragraph
        color={colors.gray[600]}
        styleOverrides={{ margin: '0px 0px 10px 0px' }}
        textSize="small"
      >
        Configure and download one or more tabular views
      </Paragraph>
      {Object.entries(entities).map(([entityID, data], index) => (
        <FloatingButton
          key={index}
          text={`${data.filteredCount?.toLocaleString()} of ${data.totalCount?.toLocaleString()} ${startCase(
            data.displayNamePlural
          )}`}
          onPress={() => {
            setCurrentEntity(data);
            setMySubsetModalOpen(true);
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
