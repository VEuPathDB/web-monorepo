// Detect whether a free-text input is a PubMed id or a DOI. The two formats are
// structurally disjoint, so detection is reliable without a manual override.
// Mirrors the server-side rules in ExternalRef.java (keep the two in sync).
//
// Documented cases (verified manually — genomics-site has no unit-test runner):
//   '12345678'                          -> { ref: '12345678', kind: 'pubmed' }
//   'PMID: 12345678'                    -> { ref: '12345678', kind: 'pubmed' }
//   '10.1234/abc.def'                   -> { ref: '10.1234/abc.def', kind: 'doi' }
//   'https://doi.org/10.1234/abc.def'   -> { ref: '10.1234/abc.def', kind: 'doi' }
//   'abc' / '' / '   '                  -> undefined
const PMID = /^\d{1,9}$/;
const DOI = /^10\.\d{4,9}\/\S+$/;
const PMID_PREFIX = /^PMID:\s*/i;
const DOI_URL_PREFIX = /^https?:\/\/(dx\.)?doi\.org\//i;

export function detectExternalRef(
  input: string
): { ref: string; kind: 'pubmed' | 'doi' } | undefined {
  const trimmed = (input ?? '').trim();
  if (trimmed === '') return undefined;

  const asPmid = trimmed.replace(PMID_PREFIX, '').trim();
  if (PMID.test(asPmid)) return { ref: asPmid, kind: 'pubmed' };

  const asDoi = trimmed.replace(DOI_URL_PREFIX, '').trim();
  if (DOI.test(asDoi)) return { ref: asDoi, kind: 'doi' };

  return undefined;
}
