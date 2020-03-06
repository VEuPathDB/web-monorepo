import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import { noop } from 'lodash';

import { TextArea, Loading } from 'wdk-client/Components';
import DeferredDiv from 'wdk-client/Components/Display/DeferredDiv';
import { RootState } from 'wdk-client/Core/State/Types';
import { useWdkService } from 'wdk-client/Hooks/WdkServiceHook';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import FastaGeneReporterForm from 'ebrc-client/components/reporters/FastaGeneReporterForm';
import FastaGenomicSequenceReporterForm from 'ebrc-client/components/reporters/FastaGenomicSequenceReporterForm';

const cx = makeClassNameHelper('vpdb-Srt');

interface BaseSrtFormConfig {
  recordClassUrlSegment: string;
  display: string;
  ReporterForm: React.ComponentType<any>;
  initialReporterFormState: Record<string, string | number | boolean>;
  formActionUrl: string;
}

interface InitialSrtFormConfig extends BaseSrtFormConfig {
  makeInitialIdsState: (paramDisplayMap: Record<string, string | undefined>) => string;
}

interface SrtFormConfig extends BaseSrtFormConfig {
  initialIdsState: string;
  projectId: string;
}

const SRT_QUESTION = 'SRT';

const BULK_DOWNLOAD_URL = '/common/downloads';

const SUPPORTED_RECORD_CLASS_CONFIGS: InitialSrtFormConfig[] = [
  {
    recordClassUrlSegment: 'gene',
    display: 'Gene IDs',
    ReporterForm: FastaGeneReporterForm,
    initialReporterFormState: FastaGeneReporterForm.getInitialState().formState,
    makeInitialIdsState: paramDisplayMap => paramDisplayMap['genes_ids'] || '',
    formActionUrl: '/cgi-bin/geneSrt'
  },
  {
    recordClassUrlSegment: 'genomic-sequence',
    display: 'Genomic Sequence IDs',
    ReporterForm: FastaGenomicSequenceReporterForm,
    initialReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 10000
    },
    makeInitialIdsState: paramDisplayMap => {
      const sourceId = paramDisplayMap['contigs_ids'];

      return sourceId == null
        ? ''
        : [
            sourceId,
            `${sourceId}:14..700`,
            `${sourceId}:100..2000:r`
          ].join('\r\n');
    },
    formActionUrl: '/cgi-bin/contigSrt'
  },
  {
    recordClassUrlSegment: 'est',
    display: 'EST IDs',
    ReporterForm: FastaGenomicSequenceReporterForm,
    initialReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 200
    },
    makeInitialIdsState: () => '',
    formActionUrl: '/cgi-bin/estSrt'
  },
  {
    recordClassUrlSegment: 'popsetSequence',
    display: 'Popset Isolate IDs',
    ReporterForm: FastaGenomicSequenceReporterForm,
    initialReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 200
    },
    makeInitialIdsState: () => '',
    formActionUrl: '/cgi-bin/isolateSrt'
  }
];

export function Srt() {
  const { hash } = useLocation();
  const compatibleSrtConfigs = useCompatibleSrtFormConfigs();
  const [ selectedSrtConfig, setSelectedSrtConfig ] = useState(hash.slice(1) || undefined);

  return !compatibleSrtConfigs
    ? <Loading />
    : <div className={cx()}>
        <div className={cx('--Choices')}>
          <h2>
            Download Sequences by
          </h2>
          {
            compatibleSrtConfigs.map(
              config =>
                <a
                  key={config.recordClassUrlSegment}
                  href={`#${config.recordClassUrlSegment}`}
                  onClick={() => setSelectedSrtConfig(config.recordClassUrlSegment)}
                >
                  {config.display}
                </a>
            )
          }
        </div>
        <div className={cx('--BulkDownloadLink')}>
          If you would like to download data in bulk, please visit our <a href={BULK_DOWNLOAD_URL}>file download section</a>
        </div>
        <hr />
        <div className={cx('--Forms')}>
          {
            compatibleSrtConfigs.map(
              config =>
                <DeferredDiv
                  key={config.recordClassUrlSegment}
                  visible={config.recordClassUrlSegment === selectedSrtConfig}
                  className={cx('--SelectedForm')}
                >
                  <SrtForm {...config} />
                </DeferredDiv>
            )
          }
        </div>
      </div>;
}

function SrtForm({
  display,
  initialReporterFormState,
  ReporterForm,
  initialIdsState,
  projectId,
  formActionUrl
}: SrtFormConfig) {
  const [ idsState, setIdsState ] = useState(initialIdsState);
  const [ formState, updateFormState ] = useState(initialReporterFormState);

  return (
    <form action={formActionUrl} method="post" target="_blank">
      <h3 className={cx('--FormHeader')} >
        Retrieve Sequences by {display}
      </h3>

      <input type="hidden" name="project_id" value={projectId} />
      <div className={cx('--IdsInstructions')}>
        Enter a list of {display} (each ID on a separate line):
      </div>
      <TextArea
        name="ids"
        value={idsState}
        onChange={setIdsState}
        rows={4}
        cols={60}
      />
      <hr />
      <ReporterForm
        formState={formState}
        updateFormState={updateFormState}
        onSubmit={noop}
        includeSubmit
      />
    </form>
  );
}

function useCompatibleSrtFormConfigs() {
  const recordClasses = useSelector((state: RootState) => state.globalData.recordClasses);

  const serviceResult = useWdkService(wdkService => Promise.all([
    wdkService.getConfig(),
    wdkService.getQuestionAndParameters(SRT_QUESTION)
  ]), []);

  const [ { projectId }, srtQuestion ] = serviceResult || [ {}, undefined ];

  const srtQuestionParamDisplayMap = useMemo(
    () => srtQuestion?.parameters.reduce(
      (memo, parameter) => ({
        ...memo,
        [parameter.name]: parameter.initialDisplayValue
      }),
      {} as Record<string, string | undefined>
    ),
    [ srtQuestion ]
  );

  const recordClassUrlSegments = useMemo(
    () => recordClasses && new Set(recordClasses.map(({ urlSegment }) => urlSegment)),
    [ recordClasses ]
  );

  return (
    recordClassUrlSegments != null &&
    projectId != null &&
    srtQuestionParamDisplayMap != null &&
    SUPPORTED_RECORD_CLASS_CONFIGS
      .filter(initialSrtConfig => recordClassUrlSegments.has(initialSrtConfig.recordClassUrlSegment))
      .map(initialSrtConfig => ({
        ...initialSrtConfig,
        initialIdsState: initialSrtConfig.makeInitialIdsState(srtQuestionParamDisplayMap),
        projectId
      }) as SrtFormConfig)
  );
}
