import React, { useEffect, useState } from 'react';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import {
  createViewState,
  JBrowseLinearGenomeView,
} from '@jbrowse/react-linear-genome-view';

interface JBrowseConfig {
  assemblies: { name: string }[];
  tracks: any[];
}

interface Props {
  jbrowseUrl: string;
  height: number;
}

export default function JBrowse2LinearView({
  jbrowseUrl,
  height = 400,
}: Props) {
  //  const url = new URL(jbrowseUrl, 'https://example.com');
  //  const params = url.searchParams;
  const assemblyId = 'agamPEST'; // (params.get('data') ?? '').split('/').pop(); // TO DO: better fallback
  const location = 'AgamP4_2L'; // params.get('loc');
  //  const tracks = params.get('tracks'); // comma-delimited track ids

  const [config, setConfig] = useState<JBrowseConfig | undefined>();
  const [loading, setLoading] = useState(true);

  // Could use wdk usePromise? or react-query?
  useEffect(() => {
    // Fetch the config JSON
    fetch('/jbrowse2/config.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load JSON config:', error);
        setLoading(false); // Set to false to avoid infinite loading
      });
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!config) {
    return <div>Error loading configuration</div>; // Error handling fallback - TO DO add contact-us etc
  }

  const assembly = config.assemblies.find(({ name }) => name === assemblyId);

  if (!assembly) {
    return <div>Error finding assembly '{assemblyId}'</div>;
  }
  const { tracks } = config;

  const viewState = createViewState({
    assembly,
    tracks,
    location,
  });

  return <JBrowseLinearGenomeView viewState={viewState} />;
}
