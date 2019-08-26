import React, { useState, useMemo } from 'react';

import { Loading } from 'wdk-client/Components';
import { StepAnalysisEnrichmentResultTable as StrategyChoicesTable, ColumnSettings } from 'wdk-client/Core/MoveAfterRefactor/Components/StepAnalysis/StepAnalysisEnrichmentResultTable';

import { useWdkEffect } from 'wdk-client/Service/WdkService';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { RecordClass } from 'wdk-client/Utils/WdkModel';
import { StrategySummary, StrategyDetails } from 'wdk-client/Utils/WdkUser';
import { formatDateTimeString } from 'wdk-client/Views/Strategy/StrategyUtils';

import 'wdk-client/Views/Strategy/StrategyInputSelector.scss';

const cx = makeClassNameHelper('StrategyInputSelector');

type Props = {
  onStrategySelected: (strategyId: number) => void,
  primaryInput: StrategyDetails,
  secondaryInputRecordClass: RecordClass,
  selectedStrategyId?: number
};

type StrategyInputCellProps<T> = {
  value: T,
  row: StrategySummary
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
    () => strategies && strategies.filter(
      ({ recordClassName, strategyId }) => (
        recordClassName === secondaryInputRecordClass.urlSegment &&
        strategyId !== primaryInput.strategyId
      )
    ),
    [ strategies ]
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        name: 'Strategy',
        renderCell: (cellProps: StrategyInputCellProps<string>) =>
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
        key: 'nameOfFirstStep',
        name: 'Name of first Step',
        sortable: true,
        sortType: 'text'
      },
      {
        key: 'leafAndTransformStepCount',
        name: '# steps',
        sortable: true,
        sortType: 'number'
      },
      {
        key: 'description',
        name: 'Description',
        renderCell: (cellProps: StrategyInputCellProps<string>) =>
          <>
            {
              cellProps.value
                ? cellProps.value
                : <em>Save to add a description</em>
            }
          </>,
        sortable: true,
        sortType: 'text'
      },
      {
        key: 'estimatedSize',
        name: 'Size',
        className: cx('--TableCell', 'estimatedSize'),
        sortable: true,
        sortType: 'number'
      },
      {
        key: 'createdTime',
        name: 'Created',
        renderCell: ({ value }: StrategyInputCellProps<string>) =>
          <>
            {formatDateTimeString(value)}
          </>,
        sortable: true,
        sortType: 'text'
      },
      {
        key: 'lastModified',
        name: 'Modified',
        sortable: true,
        renderCell: ({ value }: StrategyInputCellProps<string>) =>
          <>
            {formatDateTimeString(value)}
          </>,
        sortType: 'text'
      },
      {
        key: 'releaseVersion',
        name: 'Version',
        sortable: true,
        sortType: 'number'
      }
    ] as ColumnSettings[],
    [ onStrategySelected ]
  )

  return (
    !strategyChoices ||
    selectedStrategyId !== undefined
  )
    ? <Loading />
    : (
      <StrategyChoicesTable<StrategySummary>
        emptyResultMessage={
          primaryInput.recordClassName === secondaryInputRecordClass.urlSegment
            ? `No other ${secondaryInputRecordClass.shortDisplayName} strategies found`
            : `No ${secondaryInputRecordClass.shortDisplayName} strategies found`
        }
        rows={strategyChoices}
        columns={columns}
        fixedTableHeader
      />
    );
};
