import React, { ReactElement, ReactNode } from 'react';
import Banner from '@veupathdb/coreui/lib/components/banners/Banner';
import { ValidationErrors } from '../../../Service';
import { BadUpload } from '../../../StoreModules';

export interface UploadErrorBannerProps {
  readonly errors: BadUpload[] | undefined;
}

export function UploadErrorBanner(props: UploadErrorBannerProps): ReactElement {
  if (!props.errors)
    return <></>;

  return <>{props.errors.map((it, index) => <BannerLine
    key={`upload-error-${index}-${it.type}`}
    error={it}
  />)}</>;
}

interface BannerProps { readonly error: BadUpload; }

function BannerLine({ error }: BannerProps): React.ReactElement {
  const message = React.useMemo(
    () => (
      <div style={{ lineHeight: 1.5 }}>
        <span>Could not upload dataset:&nbsp;</span>
        {makeMessage(error)}
      </div>
    ),
    [error],
  );

  return (
    <Banner banner={{ type: 'error', message }} />
  );
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

function makeValidationErrorMessage(errors: ValidationErrors): React.ReactElement {
  const elements: ReactNode[] = [];

  if ('general' in errors) {
    errors.general.forEach((msg, i) => {
      elements.push(<ErrorListItem key={`general-${i}`}>{msg}</ErrorListItem>);
    });
  }

  if ('byKey' in errors) {
    for (const jsonPath of Object.keys(errors.byKey)) {
      // using `<a href` instead of `<Link` as Link does not properly handle
      // standard hash/anchor links.  For that the library
      // `react-router-hash-link` is needed, however in this situation, we are
      // not changing the view in any way, so a normal HTML anchor link works
      // fine.
      const element = document.getElementById(jsonPath);

      const link =
        element == null ? (
          formatJPath(jsonPath)
        ) : (
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

      errors.byKey[jsonPath].forEach((msg, i) => elements.push(
        <ErrorListItem key={`${jsonPath}-${i}`}>{link}: {msg}</ErrorListItem>
      ));
    }
  }

  return <ul className="error-list">{elements}</ul>;
}

function ErrorListItem({ children }: { children: React.ReactNode }): React.ReactElement {
  return <li className="upload-error error-422 general">{children}</li>;
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
