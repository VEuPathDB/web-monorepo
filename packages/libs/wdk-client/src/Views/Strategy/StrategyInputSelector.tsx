import React, { useState, useMemo } from 'react';

import { useWdkEffect } from 'wdk-client/Service/WdkService';
import { StrategySummary, StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { StepAnalysisEnrichmentResultTable as StrategyChoicesTable } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisEnrichmentResultTable';
import { Loading } from 'wdk-client/Components';

type Props = {
  onStrategySelected: (strategyId: number) => void,
  primaryInput: StrategyDetails,
  secondaryInputRecordClass: RecordClass,
  selectedStrategyId?: number
};

type StrategyChoicesRow = {
  description: string,
  name: string,
  strategyId: number
};

export const StrategyInputSelector = ({
  onStrategySelected,
  primaryInput,
  secondaryInputRecordClass,
  selectedStrategyId
}: Props) => {
  const [ strategies, setStrategies ] = useState<StrategySummary[] | undefined>(undefined);

  useWdkEffect(wdkService => {
    wdkService.getStrategies().then(setStrategies);
  }, []);

  const strategyChoices = useMemo(
    () => (
      strategies && 
      strategies
        .filter(
          ({ recordClassName, strategyId }) => (
            recordClassName === secondaryInputRecordClass.urlSegment &&
            strategyId !== primaryInput.strategyId
          )
        )
        .map(({ description, name, strategyId }) => ({ description, name, strategyId }))
    ),
    [ primaryInput, secondaryInputRecordClass, strategies ]
  );

  return (
    !strategies ||
    !strategyChoices ||
    selectedStrategyId !== undefined
  )
    ? <Loading />
    : (
      <StrategyChoicesTable
        emptyResultMessage={`No ${secondaryInputRecordClass.shortDisplayName} strategies found`}
        rows={strategyChoices}
        columns={[
          {
            key: 'name',
            name: 'Strategy',
            renderCell: (cellProps: { row: StrategyChoicesRow }) =>
              <a onClick={(e) => {
                e.preventDefault();
                onStrategySelected(cellProps.row.strategyId);
              }} href="#">
                  {cellProps.row.name} 
              </a>,
            sortable: true,
            sortType: 'text'
          },
          {
            key: 'description',
            name: 'Description',
            renderCell: (cellProps: { value: string }) =>
              <>
                {
                  cellProps.value
                    ? cellProps.value
                    : <em>Save to add a description</em>
                }
              </>,
            sortable: true,
            sortType: 'text'
          }
        ]}
      />
    );
};
