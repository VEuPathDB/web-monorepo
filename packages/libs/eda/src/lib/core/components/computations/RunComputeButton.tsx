import React from 'react';
import { FilledButton } from '@veupathdb/coreui';
import { ComputationAppOverview } from '../../types/visualization';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { JobStatus } from './ComputeJobStatusHook';

interface Props {
  computationAppOverview: ComputationAppOverview;
  status?: JobStatus;
  createJob: () => void;
}

export function RunComputeButton(props: Props) {
  const { computationAppOverview, status, createJob } = props;

  return computationAppOverview.computeName ? (
    <div
      style={{
        display: 'flex',
        gap: '1em',
        alignItems: 'center',
        padding: '1em 0',
        marginLeft: '3em',
        marginBottom: '2em',
      }}
    >
      <FilledButton
        themeRole="primary"
        text={`Generate ${computationAppOverview.displayName} results`}
        textTransform="none"
        onPress={createJob}
        disabled={status !== 'no-such-job'}
      />
      <div
        style={{
          display: 'inline-flex',
          gap: '.5em',
          fontWeight: 'bold',
        }}
      >
        Status:{' '}
        {status ? <StatusIcon status={status} showLabel /> : 'Loading...'}
      </div>
    </div>
  ) : null;
}

const colorMap: Record<JobStatus, string> = {
  'no-such-job': 'gray',
  requesting: 'orange',
  queued: 'orange',
  'in-progress': 'orange',
  complete: 'green',
  expired: 'red',
  failed: 'red',
};

// Replace internal job status with user-friendly status messages
const jobStatusDisplay = {
  'no-such-job': 'Not started.',
  requesting: 'Requesting.',
  queued: 'Queued.',
  'in-progress':
    'In progress. You may return later to use results in the visualization.',
  complete: 'Complete. Results saved in the system.',
  expired: 'Results expired.',
  failed: 'Failed. Contact the VEuPathDB team for support.',
} as const;

interface StatusIconProps {
  status: JobStatus;
  showLabel?: boolean;
}

export function StatusIcon({ status, showLabel = false }: StatusIconProps) {
  const color = status ? colorMap[status] : '#808080cc';
  const label = status ? jobStatusDisplay[status] : 'Unknown';
  return <Dot color={color} label={label} showLabel={showLabel} />;
}

function Dot(props: { color: string; label: string; showLabel: boolean }) {
  return (
    <Tooltip css={{}} title={props.label}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '.5ex',
        }}
      >
        <div
          style={{
            height: '.75em',
            width: '.75em',
            borderRadius: '50%',
            backgroundColor: props.color,
            // boxShadow: '0 0 2px black',
          }}
        />
        {props.showLabel && props.label}
      </div>
    </Tooltip>
  );
}
