import { get } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { requestAddStepToBasket } from '@veupathdb/wdk-client/lib/Actions/BasketActions';
import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { useWdkServiceWithRefresh, useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { rootUrl, useUserDatasetsWorkspace } from '@veupathdb/web-common/lib/config';

import {
  isTranscripFilterEnabled,
  requestTranscriptFilterUpdate
} from '../../util/transcriptFilters';

import { ResultExportSelector } from './ResultExportSelector';

// --------------
// GeneRecordLink
// --------------

function GeneRecordLink(props) {
  const { recordId, geneRecordClass, children } = props;
  const geneId = recordId
    .filter(part => part.name !== 'source_id')
    .map(part => part.name === 'gene_source_id' ? { ...part, name: 'source_id' } : part);
  return <props.DefaultComponent
    recordClass={geneRecordClass}
    recordId={geneId}
  >{children}</props.DefaultComponent>
}

const mapStateToGeneRecordLinkProps = state => ({
  geneRecordClass: state.globalData.recordClasses
    .find(recordClass => recordClass.fullName === 'GeneRecordClasses.GeneRecordClass')
});

export const RecordLink = connect(mapStateToGeneRecordLinkProps)(GeneRecordLink);


// -----------
// ResultTable
// -----------

function TranscriptViewFilter({
  answer: { meta: { totalCount, displayTotalCount, viewTotalCount } },
  recordClass: { name, displayName, displayNamePlural, nativeDisplayName, nativeDisplayNamePlural },
  globalViewFilters,
  isEnabled,
  isLoading,
  requestTranscriptFilterUpdate
}) {
  if (totalCount === displayTotalCount) return null;

  const display = displayTotalCount === 1 ? displayName : displayNamePlural;
  const nativeDisplay = totalCount === 1 ? nativeDisplayName : nativeDisplayNamePlural;
  const hiddenCount = isEnabled ? `(hiding ${(totalCount - viewTotalCount).toLocaleString()})` : null;
  const toggleId = "TranscriptViewFilter--Toggle";
  return (
    <div className="TranscriptViewFilter">
      <div>
        <div className="TranscriptViewFilter--Label">{display}:</div> {displayTotalCount.toLocaleString()}
      </div>
      <div>
        <div className="TranscriptViewFilter--Label">{nativeDisplay}:</div> {totalCount.toLocaleString()} {hiddenCount}
      </div>
      <div>
        <input
          id={toggleId}
          type="checkbox"
          checked={isEnabled}
          disabled={isLoading}
          onChange={() => requestTranscriptFilterUpdate(globalViewFilters[name], !isEnabled)}
        />
        <label htmlFor={toggleId}>Show Only One {nativeDisplayName} Per Gene</label>
        {isLoading && <div style={{ color: 'gray', padding: '0 1em', fontWeight: 'normal' }}>...updating results</div>}
      </div>
    </div>
  )
}

const ConnectedTranscriptViewFilter = connect(
  (state, props) => ({
    isEnabled: isTranscripFilterEnabled(state, { viewId: props.viewId }),
    globalViewFilters: get(state, ['resultTableSummaryView', props.viewId, 'globalViewFilters'], {})
  }),
  (dispatch, props) => ({
    requestTranscriptFilterUpdate: (...args) => dispatch(requestTranscriptFilterUpdate(props.viewId, ...args))
  })
)(TranscriptViewFilter);

export function ResultTable(props) {
  const isGuest = useWdkService(
    async (service) => (await service.getCurrentUser()).isGuest,
    []
  );

  const exportStatus = isGuest === false
    ? { available: true }
    : {
        available: false,
        reason: 'You must be logged in to use this feature.'
      };

  const dispatch = useDispatch();

  const onSelectBasketExport = useMemo(() => {
    if (props.resultType.type !== 'step') {
      return undefined;
    }

    return () => {
      dispatch(requestAddStepToBasket(props.resultType.step.id));
    };
  }, [dispatch, props.resultType]);

  const geneListExportUrl = useMemo(() => {
    if (
      !useUserDatasetsWorkspace ||
      props.resultType.type !== 'step'
    ) {
      return undefined;
    }

    const step = props.resultType.step;

    const resultWorkspaceUrl =
     `${window.location.origin}${rootUrl}/workspace/strategies/${step.strategyId}/${step.id}`;

    const urlParams = new URLSearchParams({
      useFixedUploadMethod: 'true',
      datasetStepId: String(step.id),
      datasetSource: `Result "${props.resultType.step.customName}"`,
      datasetName: props.resultType.step.customName,
      datasetSummary: `Genes from result "${props.resultType.step.customName}"`,
      datasetDescription: `Uploaded from ${resultWorkspaceUrl}`
    });

    return `/workspace/datasets/new?${urlParams.toString()}`;
  }, [props.resultType]);

  const history = useHistory();

  const onSelectGeneListExport = useMemo(() => {
    if (geneListExportUrl == null) {
      return undefined;
    }

    return () => {
      history.push(geneListExportUrl);
    };
  }, [geneListExportUrl, history]);

  const exportOptions = useMemo(
    () => [
      ...(
        onSelectBasketExport
          ? [
              {
                label: (
                  <>
                    <IconAlt fa="shopping-basket fa-fw" />
                    {' '}
                    <span style={{ marginLeft: '0.5em' }}>
                      Basket
                    </span>
                  </>
                ),
                value: 'basket',
                onSelect: onSelectBasketExport,
              }
            ]
          : []
      ),
      ...(
        onSelectGeneListExport
          ? [
              {
                label: (
                  <>
                    <IconAlt fa="files-o fa-fw" />
                    {' '}
                    <span style={{ marginLeft: '0.5em' }}>
                      My Data Sets
                    </span>
                  </>
                ),
                value: 'my-data-sets',
                onSelect: onSelectGeneListExport,
              }
            ]
          : []
      )
    ],
    [onSelectBasketExport, onSelectGeneListExport]
  );
  
  const renderToolbarContent = useCallback(({
    addColumnsNode,
    downloadLinkNode,
  }) => (
      <>
        {downloadLinkNode}
        {addColumnsNode}
        <span
          title={
            exportStatus.available
              ? undefined
              : exportStatus.reason
          }
        >
          <ResultExportSelector
            isDisabled={!exportStatus.available}
            options={exportOptions}
          />
        </span>
      </>
    ),
    [exportOptions, exportStatus]
  );

  return <React.Fragment>
    <ConnectedTranscriptViewFilter {...props}/>
    <props.DefaultComponent
      {...props}
      renderToolbarContent={renderToolbarContent}
    />
  </React.Fragment>
}

export function ResultPanelHeader(props) {
  return (
    <OrthologCount {...props}/>
  );
}

const ORTHOLOG_COLUMN_FILTER_NAME = 'gene_orthomcl_name';
const ORTHOLOG_COLUMN_FILTER_TOOL = 'byValue';

function OrthologCount(props) {
  const { step, DefaultComponent } = props;
  const uniqueOrthologValues = useWdkServiceWithRefresh(
    async wdkService => {
      try {
        const result = await wdkService.getStepColumnReport(
          step.id,
          ORTHOLOG_COLUMN_FILTER_NAME,
          ORTHOLOG_COLUMN_FILTER_TOOL,
          { omitHistogram: true }
        );

        return { available: true, value: result.statistics.numDistinctValues };
      } catch (error) {
        wdkService.submitErrorIfUndelayedAndNot500(error);

        return { available: false };
      }
    },
    [step]
  );

  return uniqueOrthologValues == null ? null : (
    <React.Fragment>
      <DefaultComponent {...props}/>
      {
        uniqueOrthologValues.available &&
        <div style={{ order: 1, fontSize: '1.4em', marginLeft: '.5em' }}>
          ({uniqueOrthologValues.value.toLocaleString()} ortholog groups)
        </div>
      }
    </React.Fragment>
  );
}
