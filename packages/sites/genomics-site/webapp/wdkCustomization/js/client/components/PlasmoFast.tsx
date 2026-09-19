import React, { useCallback, useMemo, useRef, useState } from 'react';

import { analyze, callStrain } from '@veupathdb/plasmofast';
import {
  AnalysisResult,
  ProgressEvent,
  StrainCall,
} from '@veupathdb/plasmofast';

import FileInput from '@veupathdb/wdk-client/lib/Components/InputControls/FileInput';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { OutlinedButton } from '@veupathdb/coreui/lib/components/buttons';

import './PlasmoFast.scss';

const cx = makeClassNameHelper('api-PlasmoFast');

type Progress = {
  pct: number;
  reads: number;
};

const VALID_FILENAME_PATTERN = /\.(fastq|fq)(\.gz)?$/i;

/**
 * Renders a `StrainCall` verdict as a natural-language sentence for display.
 */
function describeStrainCall(call: StrainCall): React.ReactNode {
  switch (call.verdict) {
    case 'strain':
      return `Most likely strain: ${call.strain}`;
    case 'mixed':
      return 'This sample looks like a mix of more than one lab strain.';
    case 'notLabStrain':
      return (
        <>
          This sample does not look like a known <i>P. falciparum</i> lab
          strain.
        </>
      );
  }
}

export function PlasmoFast() {
  const [fileName, setFileName] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<Progress>();
  const [result, setResult] = useState<AnalysisResult>();
  const [error, setError] = useState<string>();
  const [elapsed, setElapsed] = useState<string>();
  // Bumping this remounts the FileInput, which is the only way to clear an
  // uncontrolled <input type="file"> (its value can't be driven from state).
  const [fileInputKey, setFileInputKey] = useState(0);

  const controllerRef = useRef<AbortController | null>(null);

  const strainCall = useMemo(
    () => (result ? callStrain(result) : null),
    [result]
  );

  const onCancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  // Clear the selected file and reset the run state so the user can start fresh.
  const clearFile = useCallback(() => {
    setFileName(undefined);
    setResult(undefined);
    setProgress(undefined);
    setError(undefined);
    setElapsed(undefined);
    setFileInputKey((k) => k + 1);
  }, []);

  const onFileSelected = useCallback(async (file: File | null) => {
    if (file == null) return;

    if (!VALID_FILENAME_PATTERN.test(file.name)) {
      setFileName(file.name);
      setError(
        'Please select a FASTQ file (.fastq, .fq, .fastq.gz, or .fq.gz).'
      );
      return;
    }

    // Reset state for a new run
    setFileName(file.name);
    setError(undefined);
    setResult(undefined);
    setProgress({ pct: 0, reads: 0 });
    setElapsed(undefined);
    setIsRunning(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    const startTime = Date.now();
    const timer = setInterval(() => {
      const secs = ((Date.now() - startTime) / 1000).toFixed(1);
      setElapsed(`Elapsed: ${secs}s`);
    }, 100);

    try {
      const finalResult = await analyze(file, {
        signal: controller.signal,
        onProgress: ({
          bytesRead,
          totalBytes,
          readsProcessed,
        }: ProgressEvent) => {
          const pct =
            totalBytes > 0 ? Math.round((bytesRead / totalBytes) * 100) : 0;
          setProgress({ pct, reads: readsProcessed });
        },
        onPartialResult: (partial) => {
          setResult(partial);
        },
      });

      clearInterval(timer);
      const totalSecs = ((Date.now() - startTime) / 1000).toFixed(1);
      setElapsed(`Completed in ${totalSecs}s`);
      setResult(finalResult);
      setProgress((prev) => ({ pct: 100, reads: prev?.reads ?? 0 }));
    } catch (err) {
      clearInterval(timer);
      setElapsed(undefined);
      if (controller.signal.aborted) {
        // Cancellation is not a real error.
        setError(undefined);
      } else {
        setError(String(err));
      }
    } finally {
      setIsRunning(false);
      controllerRef.current = null;
    }
  }, []);

  return (
    <div className={cx('')}>
      <h1>
        plasmoFAST &mdash; detect <i>P. falciparum</i> lab strains
      </h1>

      <p>
        Select a FASTQ file and plasmoFAST will detect which{' '}
        <i>Plasmodium falciparum</i> lab strain it most closely matches.
      </p>

      <div className={cx('--FormContainer')}>
        <label className={cx('--FileLabel')}>
          <span>FASTQ file</span>
          <FileInput
            key={fileInputKey}
            accept=".fastq,.fastq.gz,.fq,.fq.gz,.gz,application/gzip,application/x-gzip"
            onChange={onFileSelected}
            disabled={isRunning}
          />
        </label>
        {fileName && <span className={cx('--FileName')}>{fileName}</span>}
        {!isRunning && fileName && (
          <OutlinedButton text="Clear" size="small" onPress={clearFile} />
        )}

        {isRunning && (
          <div className={cx('--Controls')}>
            <OutlinedButton
              text="Stop"
              size="small"
              themeRole="error"
              onPress={onCancel}
            />
          </div>
        )}
      </div>

      {progress && (
        <div className={cx('--Progress')}>
          <progress max={100} value={progress.pct} />
          <span className={cx('--ProgressLabel')}>
            {progress.pct}% &middot; {progress.reads.toLocaleString()} reads
          </span>
          {elapsed && <span className={cx('--Elapsed')}>{elapsed}</span>}
        </div>
      )}

      {error && <div className={cx('--Error')}>{error}</div>}

      {strainCall && (
        <p
          className={cx(
            '--Call',
            strainCall.verdict !== 'strain' ? 'no-call' : undefined
          )}
        >
          {describeStrainCall(strainCall)}
          {isRunning && (
            <span className={cx('--Preliminary')}>
              {' '}
              (Preliminary &mdash; for the definitive result, wait for
              processing to finish.)
            </span>
          )}
        </p>
      )}

      {result && (
        <table className={cx('--Results')}>
          <thead>
            <tr>
              <th>Strain</th>
              <th>Specific</th>
              <th>Nonspecific</th>
              <th>Mixed</th>
              <th>Low coverage</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(result).map(([strain, counts]) => (
              <tr
                key={strain}
                className={
                  strainCall?.verdict === 'strain' &&
                  strain === strainCall.strain
                    ? cx('--TopRow')
                    : undefined
                }
              >
                <td>{strain}</td>
                <td>{counts.specific}</td>
                <td>{counts.nonspecific}</td>
                <td>{counts.mixed}</td>
                <td>{counts.lowCoverage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      <h2>Explanation</h2>

      <p>
        plasmoFAST detects <em>Plasmodium falciparum</em> lab strains directly
        from raw sequencing reads. Select a FASTQ file (or a gzip-compressed{' '}
        <code>.fastq.gz</code>) and it counts strain-diagnostic 25-mers right in
        your browser &mdash; <strong>your data is never uploaded</strong> to our
        servers. Larger files take longer to process; you can stop a run at any
        time.
      </p>

      <p>
        For each candidate strain, the table reports how many diagnostic k-mers
        were found that are <em>specific</em> to that strain,{' '}
        <em>nonspecific</em> (shared with others), <em>mixed</em>, or seen at{' '}
        <em>low coverage</em>. A strain is only called when every strain has
        enough covered positions to be confident; otherwise the sample is
        reported as a mix of strains or not a known lab strain.
      </p>

      <p>
        plasmoFAST was originally developed by Katie Ko (David Serre Lab,
        University of Maryland). Source code available at{' '}
        <a href="https://github.com/VEuPathDB/plasmoFAST">GitHub</a>.
      </p>
    </div>
  );
}
