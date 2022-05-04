import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { noop, zipWith } from 'lodash';

import { projectId } from '@veupathdb/web-common/lib/config';
import { TextArea, Loading, HelpIcon, Tabs, Link } from '@veupathdb/wdk-client/lib/Components';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { usePromise } from '@veupathdb/wdk-client/lib/Hooks/PromiseHook';

import FastaGeneReporterForm from '@veupathdb/web-common/lib/components/reporters/FastaGeneReporterForm';
import { fastaGenomicSequenceReporterFormFactory } from '@veupathdb/web-common/lib/components/reporters/FastaGenomicSequenceReporterForm';

import './Srt.scss';

const cx = makeClassNameHelper('vpdb-Srt');
const FastaGenomicSequenceReporterForm = fastaGenomicSequenceReporterFormFactory('default region');

interface BaseSrtFormConfig {
  recordClassUrlSegment: string;
  display: string;
  ReporterForm: React.ComponentType<any>;
  defaultReporterFormState: Record<string, string | number | boolean>;
  initialReporterFormState: Record<string, string | number | boolean>;
  idsInputHelp?: React.ReactElement;
  formActionUrl: string;
}

interface InitialSrtFormConfig extends BaseSrtFormConfig {
  makeDefaultIdsState: (paramDisplayMap: Record<string, string | undefined>) => string;
  makeInitialIdsState: (paramDisplayMap: Record<string, string | undefined>) => string;
}

interface SrtFormConfig extends BaseSrtFormConfig {
  initialIdsState: string;
  defaultIdsState: string;
  projectId: string;
  selectedSrtForm?: string;
}

const SRT_QUESTION = 'SRT';

const BULK_DOWNLOAD_URL = '/downloads';

const SUPPORTED_RECORD_CLASS_CONFIGS: InitialSrtFormConfig[] = [
  {
    recordClassUrlSegment: 'gene',
    display: 'Gene IDs',
    ReporterForm: FastaGeneReporterForm,
    defaultReporterFormState: FastaGeneReporterForm.getInitialState().formState,
    initialReporterFormState: FastaGeneReporterForm.getInitialState().formState,
    makeDefaultIdsState: paramDisplayMap => paramDisplayMap['genes_ids'] || '',
    makeInitialIdsState: paramDisplayMap => paramDisplayMap['genes_ids'] || '',
    formActionUrl: '/cgi-bin/geneSrt'
  },
  {
    recordClassUrlSegment: 'genomic-sequence',
    display: 'Genomic Sequence IDs',
    ReporterForm: FastaGenomicSequenceReporterForm,
    defaultReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 10000
    },
    initialReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 10000
    },
    makeDefaultIdsState: paramDisplayMap => {
      const sourceId = paramDisplayMap['contigs_ids'];

      return sourceId == null
        ? ''
        : [
            sourceId,
            `${sourceId}:14..700`,
            `${sourceId}:100..2000:r`
          ].join('\r\n');
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
    idsInputHelp: (
      <div>
        Valid formats of specified Genomic Sequence IDs are:
        <ul>
          <li>'ID' for full sequence</li>
          <li>'ID:start..end' for sequence from start to end</li>
          <li>'ID:start..end:r' for sequence from start to end, reverse-complemented</li>
        </ul>
      </div>
    ),
    formActionUrl: '/cgi-bin/contigSrt'
  },
  {
    recordClassUrlSegment: 'est',
    display: 'EST IDs',
    ReporterForm: FastaGenomicSequenceReporterForm,
    defaultReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 200
    },
    initialReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 200
    },
    makeDefaultIdsState: () => '',
    makeInitialIdsState: () => '',
    formActionUrl: '/cgi-bin/estSrt'
  },
  {
    recordClassUrlSegment: 'popsetSequence',
    display: 'Popset Isolate IDs',
    ReporterForm: FastaGenomicSequenceReporterForm,
    defaultReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 200
    },
    initialReporterFormState: {
      ...FastaGenomicSequenceReporterForm.getInitialState().formState,
      revComp: false,
      end: 200
    },
    makeDefaultIdsState: () => '',
    makeInitialIdsState: () => '',
    formActionUrl: '/cgi-bin/isolateSrt'
  }
];

export function Srt() {
  const compatibleSrtConfigs = useCompatibleSrtFormConfigs();
  const [selectedSrtForm, setSelectedSrtForm] = useState<string>('');

  useEffect(() => {
    if (!selectedSrtForm && compatibleSrtConfigs && compatibleSrtConfigs.length >= 1) {
      setSelectedSrtForm(compatibleSrtConfigs[0].recordClassUrlSegment);
    }
  }, [compatibleSrtConfigs]);

  return (
    <div className={cx()}>
      <h1>
        Retrieve Sequences
      </h1>
      {
        !compatibleSrtConfigs
          ? <Loading />
          : <React.Fragment>
              <p className={cx('--BulkDownloadLink')}>
                Use this tool to retrieve FASTA sequences based on identifiers you supply. <br />
                (If instead you would like to download sequences in bulk, please visit our
                {' '}
                { (projectId === 'EuPathDB') ? ' file download section in your component site of interest, eg: ' : '' }
                { (projectId === 'EuPathDB')
                  ? <a href="https://plasmodb.org/plasmo/app/downloads/" target="_blank"> PlasmoDB file download section</a>
                  : <Link to={BULK_DOWNLOAD_URL} target="_blank">file download section</Link>
                } 
                .)
              </p>
              <Tabs
                containerClassName={cx('--SrtForms')}
                activeTab={selectedSrtForm}
                onTabSelected={setSelectedSrtForm}
                tabs={compatibleSrtConfigs.map(
                  config => ({
                    key: config.recordClassUrlSegment,
                    display: config.display,
                    content:
                      <SrtForm
                        {...config}
                        selectedSrtForm={selectedSrtForm}
                      />
                  })
                )}
              />
            </React.Fragment>
      }
    </div>
  );
}

function SrtForm({
  display,
  initialReporterFormState,
  ReporterForm,
  initialIdsState,
  idsInputHelp,
  projectId,
  formActionUrl,
  selectedSrtForm,
  defaultIdsState,
  defaultReporterFormState
}: SrtFormConfig) {
  const [ idsState, setIdsState ] = useState(initialIdsState);
  const [ formState, updateFormState ] = useState(initialReporterFormState);
  const { paramValueStore } = useNonNullableContext(WdkDependenciesContext);

  useEffect(() => {
    paramValueStore?.updateParamValues(`srt/${selectedSrtForm}`,
      {
        initialIdsState: idsState,
        initialReporterFormState: JSON.stringify(formState),
      });
  }, [idsState, formState]);

  function onReset() {
    updateFormState(defaultReporterFormState);
    setIdsState(defaultIdsState);
  };

  return (
    <form action={formActionUrl} method="post" target="_blank">
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="downloadType" value={String(formState.attachmentType)} />
      <h3 className={cx('--IdsHeader')} >
        Enter a list of {display} (each ID on a separate line):
        {' '}
        {
          idsInputHelp != null &&
          <HelpIcon>
            {idsInputHelp}
          </HelpIcon>
        }
      </h3>
      <div className={cx('--IdsInput')} >
        <TextArea
          name="ids"
          value={idsState}
          onChange={setIdsState}
          rows={4}
          cols={60}
        />
      </div>
      <ReporterForm
        formState={formState}
        updateFormState={updateFormState}
        onSubmit={noop}
        onReset={onReset}
        includeSubmit
      />
    </form>
  );
}

function useCompatibleSrtFormConfigs() {
  const recordClasses = useSelector((state: RootState) => state.globalData.recordClasses);
  const { paramValueStore } = useNonNullableContext(WdkDependenciesContext);

  const serviceResult = useWdkService(wdkService => Promise.all([
    wdkService.getConfig(),
    wdkService.getQuestionAndParameters(SRT_QUESTION),
  ]), []);
  
  const [{ projectId }, srtQuestion] = serviceResult || [{}, undefined];
  
  const storedSrtData = usePromise(async () => {
    try {
      const storedFormDataState = await Promise.all(
        SUPPORTED_RECORD_CLASS_CONFIGS.map(
          async config => await paramValueStore.fetchParamValues(`srt/${config.recordClassUrlSegment}`)
        ));
      return zipWith(storedFormDataState, SUPPORTED_RECORD_CLASS_CONFIGS,
        function (storedConfigs, initialConfigs) {
          if (storedConfigs) {
            return {
              ...initialConfigs,
              makeInitialIdsState: () => storedConfigs.initialIdsState,
              initialReporterFormState: JSON.parse(storedConfigs.initialReporterFormState)
            } as InitialSrtFormConfig;
          } else {
            return initialConfigs;
          }
        });
    } catch (error) {
      console.error(error);
      return SUPPORTED_RECORD_CLASS_CONFIGS;
    }
  }, []);

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

  const compatibleSrtConfigs = useMemo(() => {
    if (
      recordClassUrlSegments != null &&
      projectId != null &&
      srtQuestionParamDisplayMap != null &&
      storedSrtData.value != null
    ) {
      return storedSrtData.value
          .filter((initialSrtConfig) => recordClassUrlSegments.has(initialSrtConfig.recordClassUrlSegment))
          .map((initialSrtConfig): SrtFormConfig => ({
            ...initialSrtConfig,
            defaultIdsState: initialSrtConfig.makeDefaultIdsState(srtQuestionParamDisplayMap),
            initialIdsState: initialSrtConfig.makeInitialIdsState(srtQuestionParamDisplayMap),
            projectId,
          }))
    } else {
      return false;
    }
  },
  [ recordClassUrlSegments, projectId, srtQuestionParamDisplayMap, storedSrtData.value ]
  );

  return compatibleSrtConfigs;
}