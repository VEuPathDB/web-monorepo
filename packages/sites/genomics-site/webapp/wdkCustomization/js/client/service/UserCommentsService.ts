import {
  ServiceBase,
  CLIENT_WDK_VERSION_HEADER,
  StandardWdkPostResponse,
} from '@veupathdb/wdk-client/lib/Service/ServiceBase';
import {
  UserCommentPostRequest,
  UserCommentAttachedFileSpec,
  PubmedPreview,
  UserCommentGetResponse,
} from '../types/userCommentTypes';
import {
  AiGenePublicationRequest,
  AiGenePublicationJobStatus,
  AiGenePublicationSubmitOutcome,
  AiGenePublicationPublishOutcome,
  JobProgress,
  SiblingSummary,
} from '../types/aiGenePublicationTypes';

// TODO: this should be defined here or in wdk model or someplace, and imported in the store module
import { CategoryChoice } from '../storeModules/UserCommentFormStoreModule';

function toProgress(p: any): JobProgress {
  return {
    stage: p.stage,
    message: p.message,
    updatedAt: p.updated_at,
  };
}

function toSiblingSummary(s: any): SiblingSummary {
  return {
    reviewed: s.reviewed,
    edited: s.edited,
    latestAt: s.latest_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializeJobStatus(payload: any): AiGenePublicationJobStatus {
  switch (payload.type) {
    case 'running':
      return {
        type: 'running',
        jobId: payload.job_id,
        // The server returns a running job's stage/message/updated_at as flat
        // fields on the payload (e.g. `{ type: 'running', job_id, stage: 'queued' }`),
        // not nested under a `progress` object.
        progress: toProgress(payload),
      };
    case 'success':
      return {
        type: 'success',
        jobId: payload.job_id,
        aiOutput: {
          headline: payload.ai_output.headline,
          content: payload.ai_output.content,
        },
        siblingSummary: toSiblingSummary(payload.sibling_summary),
      };
    case 'mentioned-in-passing':
      return {
        type: 'mentioned-in-passing',
        jobId: payload.job_id,
        // Cache-hit responses currently omit synonyms_checked (the live path
        // includes it); default to [] so the field honours its non-optional type.
        synonymsChecked: payload.synonyms_checked ?? [],
        siblingSummary: toSiblingSummary(payload.sibling_summary),
      };
    case 'gene-not-mentioned':
      return {
        type: 'gene-not-mentioned',
        jobId: payload.job_id,
        synonymsChecked: payload.synonyms_checked ?? [],
        siblingSummary: toSiblingSummary(payload.sibling_summary),
      };
    case 'text-unavailable':
      return { type: 'text-unavailable', reason: payload.reason };
    case 'internal-error':
      return { type: 'internal-error', error: payload.error };
    case 'cancelled':
      return { type: 'cancelled' };
    default:
      throw new Error(
        `deserializeJobStatus: unrecognised job type '${payload.type}'`
      );
  }
}

export type UserCommentPostResponseData =
  | {
      type: 'success';
      id: number;
    }
  | {
      type: 'validation-error';
      errors: string[];
    }
  | {
      type: 'internal-error';
      error: string;
    };

export default (base: ServiceBase) => {
  function getUserComment(id: number) {
    return base._fetchJson<UserCommentGetResponse>(
      'get',
      `/user-comments/${id}`
    );
  }

  function getPubmedPreview(pubMedIds: number[]): Promise<PubmedPreview> {
    let ids = pubMedIds.join(',');
    return base._fetchJson<PubmedPreview>(
      'get',
      `/cgi-bin/pmid2json?pmids=${ids}`,
      undefined,
      true
    );
  }

  function getUserComments(
    targetType: string,
    targetId: string
  ): Promise<UserCommentGetResponse[]> {
    return base._fetchJson<UserCommentGetResponse[]>(
      'get',
      `/user-comments?target-type=${targetType}&target-id=${targetId}`
    );
  }

  function getUserCommentCategories(
    targetType: string
  ): Promise<CategoryChoice[]> {
    return base
      ._fetchJson<{ name: string; value: number }[]>(
        'get',
        `/user-comments/category-list?target-type=${targetType}`
      )
      .then((categories) =>
        categories.map(({ name, value }) => ({
          display: name,
          value: `${value}`,
        }))
      );
  }

  // TODO: could this use the fetchJson method?
  function postUserComment(
    userCommentPostRequest: UserCommentPostRequest
  ): Promise<UserCommentPostResponseData> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (base._version)
      headers.append(CLIENT_WDK_VERSION_HEADER, String(base._version));
    const data = JSON.stringify(userCommentPostRequest);
    const result = fetch(`${base.serviceUrl}/user-comments`, {
      headers,
      method: 'POST',
      body: data,
      credentials: 'include',
    }).then((response) =>
      response.text().then((text) => {
        if (response.ok) {
          return {
            type: 'success',
            id: +JSON.parse(text).id,
          };
        } else if (response.status === 400) {
          return {
            type: 'validation-error',
            errors: JSON.parse(text),
          };
        } else {
          return {
            type: 'internal-error',
            error: text,
          };
        }
      })
    ) as Promise<UserCommentPostResponseData>;

    return result;
  }

  function deleteUserComment(commentId: number): Promise<void> {
    return base._fetchJson<void>('delete', `/user-comments/${commentId}`);
  }

  // return the new attachment id
  function postUserCommentAttachedFile(
    commentId: number,
    { file, description }: UserCommentAttachedFileSpec
  ): Promise<StandardWdkPostResponse> {
    if (file === null) {
      return Promise.reject(
        `Tried to post an empty attachment to comment with id ${commentId}`
      );
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('file', file, file.name);

    return fetch(`${base.serviceUrl}/user-comments/${commentId}/attachments`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then((response) => response.json());
  }

  function deleteUserCommentAttachedFile(
    commentId: number,
    attachmentId: number
  ): Promise<void> {
    return base._fetchJson<void>(
      'delete',
      `/user-comments/${commentId}/attachments/${attachmentId}`
    );
  }

  // Headers for the raw-fetch AI endpoints. Mirrors postUserComment: the WDK
  // backend negotiates on the client version header, so every call must send it
  // (base._fetchJson adds it automatically, but these use raw fetch).
  function aiHeaders(withJsonBody: boolean): Headers {
    const headers = new Headers(
      withJsonBody ? { 'Content-Type': 'application/json' } : {}
    );
    if (base._version) {
      headers.append(CLIENT_WDK_VERSION_HEADER, String(base._version));
    }
    return headers;
  }

  function postAiGenePublication(
    request: AiGenePublicationRequest
  ): Promise<AiGenePublicationSubmitOutcome> {
    const body: Record<string, unknown> = {
      gene_id: request.geneId,
      document_type: request.source,
      options: {},
    };
    if (request.source === 'pubmed') {
      body.pubmed_id = request.pubmedId;
    } else {
      body.paper_text = request.paperText;
      body.pdf_content_sha256 = request.pdfContentSha256;
      if (request.externalUrl) body.external_url = request.externalUrl;
      if (request.externalTitle) body.external_title = request.externalTitle;
    }
    return fetch(`${base.serviceUrl}/user-comments/ai-gene-publication`, {
      method: 'POST',
      credentials: 'include',
      headers: aiHeaders(true),
      body: JSON.stringify(body),
    }).then(async (response) => {
      if (response.status === 503) {
        const retryAfter = response.headers.get('Retry-After');
        return {
          type: 'server-busy' as const,
          retryAfterSeconds: retryAfter ? Number(retryAfter) : undefined,
        };
      }
      if (response.status === 400) {
        return {
          type: 'validation-error' as const,
          errors: await response.json(),
        };
      }
      if (!response.ok) {
        // Surface a meaningful message rather than letting response.json()
        // reject on a non-JSON error body (e.g. a 500 HTML page).
        throw new Error(
          `AI gene-publication submit failed (${response.status})`
        );
      }
      const payload = await response.json();
      return deserializeJobStatus(payload);
    });
  }

  function getAiGenePublicationJobStatus(
    jobId: string
  ): Promise<AiGenePublicationJobStatus | { type: 'not-found' }> {
    return fetch(
      `${base.serviceUrl}/user-comments/ai-gene-publication/${jobId}`,
      { credentials: 'include', headers: aiHeaders(false) }
    ).then(async (r) => {
      if (r.status === 404) return { type: 'not-found' as const };
      if (!r.ok) {
        // A persistent server error (e.g. 401 session-expired, 500) must NOT be
        // treated as a transient poll hiccup — return a terminal status so the
        // poll loop exits instead of retrying "Reconnecting…" forever.
        return {
          type: 'internal-error' as const,
          error: `Could not retrieve job status (${r.status})`,
        };
      }
      return deserializeJobStatus(await r.json());
    });
  }

  function deleteAiGenePublicationJob(jobId: string): Promise<void> {
    return base._fetchJson<void>(
      'delete',
      `/user-comments/ai-gene-publication/${jobId}`
    );
  }

  function publishAiGenePublication(
    jobId: string,
    body: { headline: string; content: string }
  ): Promise<AiGenePublicationPublishOutcome> {
    return fetch(
      `${base.serviceUrl}/user-comments/ai-gene-publication/${jobId}/publish`,
      {
        method: 'POST',
        credentials: 'include',
        headers: aiHeaders(true),
        body: JSON.stringify(body),
      }
    ).then(async (response) => {
      if (response.status === 404) return { type: 'not-found' as const };
      if (response.status === 400) {
        return {
          type: 'validation-error' as const,
          errors: await response.json(),
        };
      }
      if (!response.ok) {
        throw new Error(`Publish failed (${response.status})`);
      }
      const payload = await response.json();
      return { type: 'published' as const, commentId: payload.comment_id };
    });
  }

  return {
    getUserComment,
    getPubmedPreview,
    getUserComments,
    getUserCommentCategories,
    postUserComment,
    deleteUserComment,
    postUserCommentAttachedFile,
    deleteUserCommentAttachedFile,
    postAiGenePublication,
    getAiGenePublicationJobStatus,
    deleteAiGenePublicationJob,
    publishAiGenePublication,
  };
};
