// Path-segment-mounted sibling service, same origin as the site itself
// (e.g. dev.orthomcl.org/sequence-retrieval/...) — no scheme/host needed,
// mirroring multi-blast's BlastServiceUrl convention.
export const SEQUENCE_RETRIEVAL_BASE_URL = '/sequence-retrieval';

// The sequence-retrieval service's reference-set key for OrthoMCL proteins.
export const PROTEIN_SEQUENCE_TYPE = 'orthomcl';
