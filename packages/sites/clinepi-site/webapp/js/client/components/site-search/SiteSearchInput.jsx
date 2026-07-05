import React from 'react';

export function SiteSearchInput(DefaultComponent) {
  return function ClinEpiSiteSearchInput(props) {
    const placeholderText =
      'Site search, e.g. infection or toxo* or "congenital toxoplasmosis"';

    return <DefaultComponent {...props} placeholderText={placeholderText} />;
  };
}
