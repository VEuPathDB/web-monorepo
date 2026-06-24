import { useEffect, useState } from 'react';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { GenomicsService } from '../../../wrapWdkService';
import { PubmedPreviewEntry } from '../../../types/userCommentTypes';
import { PubmedIdEntry } from '../UserCommentForm/PubmedIdEntry';
import { useIntersectionObserver } from './useIntersectionObserver';

interface Props {
  pubmedId: string;
}

/**
 * Renders an AI comment's bare `pubmedId` as a full PubMed citation, but only
 * fetches the preview metadata once the component scrolls into view — keeping
 * load off our `/cgi-bin/pmid2json` endpoint (and NCBI) for comments the user
 * never scrolls to. Falls back to a bare PubMed link until the preview resolves.
 */
export function LazyPubmedPreview({ pubmedId }: Props): JSX.Element {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  const service = wdkService as GenomicsService;
  const [ref, hasIntersected] = useIntersectionObserver<HTMLDivElement>();
  const [preview, setPreview] = useState<PubmedPreviewEntry | undefined>(
    undefined
  );

  useEffect(() => {
    if (!hasIntersected || preview != null) return;
    let cancelled = false;
    service
      .getPubmedPreview([Number(pubmedId)])
      .then((entries) => {
        if (!cancelled && entries.length > 0) setPreview(entries[0]);
      })
      .catch(() => {
        /* leave the bare-link fallback in place on failure */
      });
    return () => {
      cancelled = true;
    };
  }, [hasIntersected, preview, pubmedId, service]);

  return (
    <div ref={ref}>
      {preview ? (
        <PubmedIdEntry
          id={preview.id}
          title={preview.title}
          author={preview.author}
          journal={preview.journal}
          url={preview.url}
        />
      ) : (
        <div style={{ fontSize: '14px' }}>
          PubMed ID:{' '}
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${pubmedId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pubmedId}
          </a>
        </div>
      )}
    </div>
  );
}
