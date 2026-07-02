import React, { ReactElement, ReactNode } from 'react';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { ValidationErrors } from '../../../Service';
import { BadUpload } from '../../../StoreModules';

export interface UploadErrorBannerProps {
  readonly errors: BadUpload[] | undefined;
}

export function UploadErrorBanner(props: UploadErrorBannerProps): ReactElement {
  if (!props.errors) return <></>;

  const makeBanner = (error: BadUpload) => {
    const message = (
      <div style={{ lineHeight: 1.5 }}>
        <span>Could not upload dataset:&nbsp;</span>
        {makeMessage(error)}
      </div>
    );

    return <Banner banner={{ type: 'error', message }} />;
  };

  return <>{props.errors.map(makeBanner)}</>;
}

function makeMessage(errors: BadUpload): ReactElement {
  if (errors.type === 400)
    return <span className="upload-error error-400">{errors.message}</span>;
  if (errors.type === 500)
    return <span className="upload-error error-500">{errors.message}</span>;

  if (errors.type !== 422) {
    return <span className="upload-error">{String(errors)}</span>;
  }

  return makeValidationErrorMessage(errors.errors);
}

function makeValidationErrorMessage(errors: ValidationErrors): ReactElement {
  const elements: ReactNode[] = [];

  let index = 0;
  const newLI = (msg: ReactNode) => (
    <li className="upload-error error-422 general" key={++index}>
      {msg}
    </li>
  );

  if ('general' in errors) {
    for (const msg of errors.general) {
      elements.push(newLI(msg));
    }
  }

  if ('byKey' in errors) {
    for (const jsonPath of Object.keys(errors.byKey)) {
      // using `<a href` instead of `<Link` as Link does not properly handle
      // standard hash/anchor links.  For that the library
      // `react-router-hash-link` is needed, however in this situation, we are
      // not changing the view in any way, so a normal HTML anchor link works
      // fine.
      const element = document.getElementById(jsonPath);

      const link = element == null
        ? formatJPath(jsonPath)
        : (
          <button
            className="error-link"
            type="button"
            onClick={() => {
              element.scrollIntoView();
              element.focus();
            }}
          >
            {formatJPath(jsonPath)}
          </button>
        );

      for (const msg of errors.byKey[jsonPath]) {
        elements.push(newLI(<>{link}: {msg}</>));
      }
    }
  }

  return <ul className="error-list">{elements}</ul>;
}

function formatJPath(path: string): string {
  const label = document.querySelector(`label[for="${path}"]`);

  if (label != null) return label.textContent!;

  const hits = path.match(/\.(\w+)(?:\[(\d+)])?$/);

  if (!hits) return path;

  const name = hits[1][0].toUpperCase() + hits[1].substring(1);

  if (typeof hits[2] === 'string')
    return `${name} item ${parseInt(hits[2]) + 1}`;

  return name;
}
