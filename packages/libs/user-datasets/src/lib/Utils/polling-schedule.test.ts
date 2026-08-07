import { DatasetStatusInfo } from '../Service';
import {
  getPollingDisposition,
  getPollingIntervalMs,
} from './polling-schedule';

const PROJECT = 'PlasmoDB';

function status(overrides: Partial<DatasetStatusInfo>): DatasetStatusInfo {
  return {
    upload: { status: 'success' },
    ...overrides,
  } as DatasetStatusInfo;
}

function install(installStatus: string, target = PROJECT) {
  return [
    {
      installTarget: target,
      meta: { status: 'complete' },
      data: { status: installStatus },
    },
  ] as DatasetStatusInfo['install'];
}

describe('getPollingDisposition', () => {
  it('continues while the upload is running', () => {
    expect(
      getPollingDisposition(status({ upload: { status: 'running' } }), PROJECT)
    ).toBe('continue');
  });

  it.each(['rejected', 'failed'] as const)(
    'stops on terminal upload status %s',
    (s) => {
      expect(
        getPollingDisposition(status({ upload: { status: s } }), PROJECT)
      ).toBe('stop');
    }
  );

  it.each(['queued', 'in-progress'] as const)(
    'continues on non-terminal import status %s',
    (s) => {
      expect(
        getPollingDisposition(status({ import: { status: s } }), PROJECT)
      ).toBe('continue');
    }
  );

  it.each(['invalid', 'failed'] as const)(
    'stops on terminal import status %s',
    (s) => {
      expect(
        getPollingDisposition(status({ import: { status: s } }), PROJECT)
      ).toBe('stop');
    }
  );

  it('continues when import is complete but no install entry exists yet', () => {
    expect(
      getPollingDisposition(
        status({ import: { status: 'complete' }, install: [] }),
        PROJECT
      )
    ).toBe('continue');
  });

  it('continues when the only install entry targets another project', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: install('complete', 'ToxoDB'),
        }),
        PROJECT
      )
    ).toBe('continue');
  });

  it('continues while the install is running', () => {
    expect(
      getPollingDisposition(
        status({ import: { status: 'complete' }, install: install('running') }),
        PROJECT
      )
    ).toBe('continue');
  });

  it('stops when the install completes for this project', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: install('complete'),
        }),
        PROJECT
      )
    ).toBe('stop');
  });

  it.each([
    'failed-validation',
    'failed-installation',
    'missing-dependency',
  ] as const)('stops on terminal install status %s', (s) => {
    expect(
      getPollingDisposition(
        status({ import: { status: 'complete' }, install: install(s) }),
        PROJECT
      )
    ).toBe('stop');
  });

  it('polls slowly on ready-for-reinstall rather than stopping', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: install('ready-for-reinstall'),
        }),
        PROJECT
      )
    ).toBe('continue-slow');
  });

  it('continues on an unrecognized install status rather than stopping', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: install('some-future-vdi-status'),
        }),
        PROJECT
      )
    ).toBe('continue');
  });

  it('continues when status is undefined', () => {
    expect(getPollingDisposition(undefined, PROJECT)).toBe('continue');
  });

  it('stops when meta failed even though data is complete', () => {
    expect(
      getPollingDisposition(
        status({
          import: { status: 'complete' },
          install: [
            {
              installTarget: PROJECT,
              meta: { status: 'failed-installation' },
              data: { status: 'complete' },
            },
          ] as DatasetStatusInfo['install'],
        }),
        PROJECT
      )
    ).toBe('stop');
  });
});

describe('getPollingIntervalMs', () => {
  it('uses 2s for the first five polls', () => {
    for (const n of [0, 1, 2, 3, 4]) {
      expect(getPollingIntervalMs(n, 'continue')).toBe(2000);
    }
  });

  it('uses 5s for the next six polls', () => {
    for (const n of [5, 6, 7, 8, 9, 10]) {
      expect(getPollingIntervalMs(n, 'continue')).toBe(5000);
    }
  });

  it('settles at 15s thereafter', () => {
    expect(getPollingIntervalMs(11, 'continue')).toBe(15000);
    expect(getPollingIntervalMs(500, 'continue')).toBe(15000);
  });

  it('uses 60s for ready-for-reinstall regardless of tier', () => {
    expect(getPollingIntervalMs(0, 'continue-slow')).toBe(60000);
    expect(getPollingIntervalMs(500, 'continue-slow')).toBe(60000);
  });
});
