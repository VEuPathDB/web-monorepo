import { FilledButton } from '@veupathdb/coreui';
import { capitalize } from 'lodash';
import { useState } from 'react';
import { JobStatusReponse } from '../../api/ComputeClient';
import { useComputeClient, useStudyMetadata } from '../../hooks/workspace';
import { Analysis, NewAnalysis } from '../../types/analysis';
import { Computation, ComputationAppOverview } from '../../types/visualization';

interface Props {
  analysis: Analysis | NewAnalysis;
  computation: Computation;
  computationAppOverview: ComputationAppOverview;
}

export function RunComputeButton(props: Props) {
  const { analysis, computation, computationAppOverview } = props;
  const computeClient = useComputeClient();
  const studyMetadata = useStudyMetadata();
  const [jobStatus, setJobStatus] = useState<JobStatusReponse['status']>();

  return computationAppOverview.computeName ? (
    <div
      style={{
        display: 'flex',
        gap: '1em',
        alignItems: 'center',
      }}
    >
      <FilledButton
        themeRole="primary"
        text="Run job"
        textTransform="none"
        size="small"
        onPress={async () => {
          const { status } = await computeClient.getJobStatus(
            computation.descriptor.type,
            {
              studyId: studyMetadata.id,
              derivedVariables: analysis.descriptor.derivedVariables,
              filters: analysis.descriptor.subset.descriptor,
              // config: computation.descriptor.configuration,
              config: fixConfig(computation.descriptor.configuration),
            }
          );
          setJobStatus(status);
        }}
      />
      <div
        style={{
          display: 'inline-flex',
          gap: '.5em',
          fontWeight: 'bold',
        }}
      >
        Status: <StatusIcon status={jobStatus} />
      </div>
    </div>
  ) : null;
}

const colorMap: Record<JobStatusReponse['status'], string> = {
  complete: 'green',
  expired: 'red',
  failed: 'red',
  'in-progress': 'orange',
  queued: 'orange',
};

interface StatusIconProps {
  status?: JobStatusReponse['status'];
}

export function StatusIcon({ status }: StatusIconProps) {
  const color = status ? colorMap[status] : '#808080cc';
  const label = status ? capitalize(status?.replaceAll('-', ' ')) : 'Unknown';
  return <Dot color={color} label={label} />;
}

function Dot(props: { color: string; label: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.5ex',
      }}
    >
      <div
        style={{
          height: '1em',
          width: '1em',
          borderRadius: '1em',
          backgroundColor: props.color,
          // boxShadow: '0 0 2px black',
        }}
      />
      {props.label}
    </div>
  );
}

function fixConfig(config: any) {
  const { name, ...rest } = config;
  return rest;
}
