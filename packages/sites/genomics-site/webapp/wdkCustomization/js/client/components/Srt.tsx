import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { noop } from 'lodash';

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
import { ParamValueStore } from '@veupathdb/wdk-client/lib/Utils/ParamValueStore';

import './Srt.scss';
import { param } from 'jquery';

const cx = makeClassNameHelper('vpdb-Srt');
const FastaGenomicSequenceReporterForm = fastaGenomicSequenceReporterFormFactory('default region');

interface BaseSrtFormConfig {
  recordClassUrlSegment: string;
  display: string;
  ReporterForm: React.ComponentType<any>;
  initialReporterFormState: Record<string, string | number | boolean>;
  idsInputHelp?: React.ReactElement;
  formActionUrl: string;
}

interface InitialSrtFormConfig extends BaseSrtFormConfig {
  makeInitialIdsState: (paramDisplayMap: Record<string, string | undefined>) => string;
}

interface SrtFormConfig extends BaseSrtFormConfig {
  initialIdsState: string;
  projectId: string;
  paramValueStore?: ParamValueStore;
  selectedSrtForm?: string;
}

const SRT_QUESTION = 'SRT';

const BULK_DOWNLOAD_URL = '/downloads';

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
  const compatibleSrtConfigs = useCompatibleSrtFormConfigs();
  const [selectedSrtForm, setSelectedSrtForm] = useState<string>('');
  const { paramValueStore } = useNonNullableContext(WdkDependenciesContext);

  useEffect(() => {
    if (!selectedSrtForm && compatibleSrtConfigs && compatibleSrtConfigs.length >= 1) {
      setSelectedSrtForm(compatibleSrtConfigs[0].recordClassUrlSegment);
    }
  }, [compatibleSrtConfigs]);

  useEffect(() => {
    const fetchedIds: any = [];
    const fetchedFormData: any = [];
    SUPPORTED_RECORD_CLASS_CONFIGS.map(
      config => fetchedIds.push(paramValueStore.fetchParamValues(`srt/${config.recordClassUrlSegment}/ids`))
    );
    SUPPORTED_RECORD_CLASS_CONFIGS.map(
      config => fetchedFormData.push(paramValueStore.fetchParamValues(`srt/${config.recordClassUrlSegment}`))
    );
    console.log(fetchedIds)
    console.log(fetchedFormData)
  }, [])

  // console.log({compatibleSrtConfigs})
  // console.log({selectedSrtForm})
  // console.log({serviceResult})
  
  // // srtStore && serviceResult ? srtStore.setVersionAndUserId(serviceResult[1], serviceResult[2].id) : null
  // if (srtStore) {
  //   // const fetchedData = srtStore.fetchSrtValues(selectedSrtForm);
  //   // console.log(fetchedData);
  //   syncData()
  // }

  // async function syncData() {
  //   if (srtStore) {
  //     const fetchedData = await srtStore.fetchSrtValues(selectedSrtForm);
  //     if (typeof fetchedData === 'string') {
  //       const parsedData = JSON.parse(fetchedData);
  //       console.log(parsedData)
  //     }
  //   }
  // }

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
                    content: <SrtForm {...config} paramValueStore={paramValueStore} selectedSrtForm={selectedSrtForm}/>
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
  paramValueStore,
  selectedSrtForm
}: SrtFormConfig) {
  const [ idsState, setIdsState ] = useState(initialIdsState);
  const [ formState, updateFormState ] = useState(initialReporterFormState);

  useEffect(() => {
    paramValueStore?.updateParamValues(`srt/${selectedSrtForm}/ids`, { idsState })
    paramValueStore?.updateParamValues(`srt/${selectedSrtForm}`, { formState: JSON.stringify(formState) })
  }, [idsState, formState]);


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
        includeSubmit
      />
    </form>
  );
}

function useCompatibleSrtFormConfigs() {
  const recordClasses = useSelector((state: RootState) => state.globalData.recordClasses);

  const serviceResult = useWdkService(wdkService => Promise.all([
    wdkService.getConfig(),
    wdkService.getQuestionAndParameters(SRT_QUESTION),
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

  const compatibleSrtConfigs = useMemo(() =>
    recordClassUrlSegments != null &&
    projectId != null &&
    srtQuestionParamDisplayMap != null &&
    SUPPORTED_RECORD_CLASS_CONFIGS
      .filter(initialSrtConfig => recordClassUrlSegments.has(initialSrtConfig.recordClassUrlSegment))
      .map(initialSrtConfig => ({
        ...initialSrtConfig,
        initialIdsState: initialSrtConfig.makeInitialIdsState(srtQuestionParamDisplayMap),
        projectId,
      }) as SrtFormConfig),
    [ recordClassUrlSegments, projectId, srtQuestionParamDisplayMap ]
  );

  return compatibleSrtConfigs;
}