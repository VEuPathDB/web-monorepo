import React, { ReactElement, ReactNode } from 'react';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { ValidationErrors } from '../../../../Service';
import { BadUpload } from '../../../../StoreModules';

export interface UploadErrorBannerProps {
  readonly errors: BadUpload | undefined;
}

export function UploadErrorBanner(props: UploadErrorBannerProps): ReactElement {
  if (!props.errors)
    return <></>;

  const message = (
    <div style={{ lineHeight: 1.5 }}>
      <span>Could not upload dataset</span>
      {makeMessage(props.errors)}
    </div>
  );

  return <Banner banner={{ type: 'error', message }} />;
}

function makeMessage(errors: BadUpload): ReactElement {
  if (errors.type === 400)
    return <span className="upload-error error-400">{errors.message}</span>;
  if (errors.type === 500)
    return <span className="upload-error error-500">{errors.message}</span>;

  if (errors.type !== 422)
    return <span className="upload-error">{String(errors)}</span>;

  return makeValidationErrorMessage(errors.errors);
}

function makeValidationErrorMessage(errors: ValidationErrors): ReactElement {
  const elements: ReactNode[] = [];

  let index = 0;
  const newSpan = (msg: ReactNode) => (
    <span className="upload-error error-422 general" key={++index}>
      {msg}
    </span>
  );

  if ('general' in errors) {
    for (const msg of errors.general) {
      elements.push(newSpan(msg));
    }
  }

  if ('byKey' in errors) {
    for (const jsonPath of Object.keys(errors.byKey)) {
      const link = document.getElementById(jsonPath) ? (
        <a href={`#${jsonPath}`}>{formatJPath(jsonPath)}</a>
      ) : (
        formatJPath(jsonPath)
      );

      for (const msg of errors.byKey[jsonPath]) {
        elements.push(
          newSpan(
            <>
              {link}: {msg}
            </>
          )
        );
      }
    }
  }

  return <>{elements}</>;
}

function formatJPath(path: string): string {
  const hits = path.match(/\.(\w+)(?:\[(\d+)])?$/);

  if (!hits) return path;

  if (typeof hits[2] === 'string')
    return `${hits[1]} item ${parseInt(hits[2]) + 1}`;

  return hits[1];
}
