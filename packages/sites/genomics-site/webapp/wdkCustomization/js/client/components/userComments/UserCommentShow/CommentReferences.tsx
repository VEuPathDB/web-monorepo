import React from 'react';
import { Link } from '@veupathdb/wdk-client/lib/Components';
import { UserCommentGetResponse } from '../../../types/userCommentTypes';
import { PubmedIdEntry } from '../UserCommentForm/PubmedIdEntry';
import { UserCommentUploadedFiles } from './UserCommentUploadedFiles';
import { Row } from './CommentSectionRow';

interface Props {
  comment: UserCommentGetResponse;
  webAppUrl: string;
}

export function CommentReferences({ comment, webAppUrl }: Props): JSX.Element {
  return (
    <>
      {/* AI-assisted comments carry their source PMID in aiProvenance (rendered
          in AiProvenanceBanner via LazyPubmedPreview), NOT in pubMedRefs, so this
          row stays empty for them and the PMID isn't shown twice. If the backend
          ever populates pubMedRefs on AI comments too, dedupe here. */}
      {comment.pubMedRefs.length > 0 && (
        <Row label="PMID(s)">
          {comment.pubMedRefs.map((ref) => (
            <PubmedIdEntry key={ref.id} {...ref} />
          ))}
        </Row>
      )}
      {comment.digitalObjectIds.length > 0 && (
        <Row label="Digital Object Identifier (DOI) Name(s)">
          {comment.digitalObjectIds.map((doi) => (
            <a
              key={doi}
              href={`http://dx.doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {doi}{' '}
            </a>
          ))}
        </Row>
      )}
      {comment.genBankAccessions.length > 0 && (
        <Row label="GenBank Accessions">
          {comment.genBankAccessions.map((accession) => (
            <a
              key={accession}
              href={`http://www.ncbi.nlm.nih.gov/sites/entrez?db=nuccore&cmd=&term=${accession}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {accession}{' '}
            </a>
          ))}
        </Row>
      )}
      {comment.relatedStableIds.length > 0 && (
        <Row label="Other Related Genes">
          {comment.relatedStableIds.map((stableId) =>
            comment.target.type === 'gene' ? (
              <Link key={stableId} to={`/record/gene/${stableId}`}>
                {stableId}{' '}
              </Link>
            ) : comment.target.type === 'isolate' ? (
              <Link key={stableId} to={`/record/popsetSequence/${stableId}`}>
                {stableId}{' '}
              </Link>
            ) : null
          )}
        </Row>
      )}
      {comment.categories.length > 0 && (
        <Row label="Category">
          {comment.categories.map((category, i) => (
            <div key={category}>
              {i + 1}) {category}
            </div>
          ))}
        </Row>
      )}
      {comment.location && comment.location.ranges.length > 0 && (
        <Row label="Location">
          {comment.location.coordinateType}:{' '}
          {comment.location.ranges
            .map(({ start, end }) => `${start}-${end}`)
            .join(', ')}
          {comment.location.reverse && ' (reversed)'}
        </Row>
      )}
      {comment.attachments.length > 0 && (
        <Row label="Uploaded Files">
          <UserCommentUploadedFiles
            uploadedFiles={comment.attachments.map((attachment) => ({
              ...attachment,
              url: `${webAppUrl}/service/user-comments/${comment.id}/attachments/${attachment.id}`,
            }))}
          />
        </Row>
      )}
      {comment.externalDatabase && (
        <Row label="External Database">
          {comment.externalDatabase.name} {comment.externalDatabase.version}
        </Row>
      )}
      {comment.reviewStatus === 'accepted' && (
        <Row label="Status">
          <em>included in the Annotation Center's official annotation</em>
        </Row>
      )}
    </>
  );
}
