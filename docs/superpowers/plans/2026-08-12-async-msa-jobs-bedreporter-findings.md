# bedReporter Configuration & Output Format Findings

## Confirmed `bedReporter` `reportConfig` Shape

```json
{
  "attachmentType": "plain",
  "deflineType": "full",
  "deflineFields": ["gene_id"],
  "sequenceFormat": "fixed_width",
  "basesPerLine": 60,
  "type": "genomic",
  "reverseAndComplement": false,
  "upstreamAnchor": "Start",
  "upstreamSign": "plus",
  "upstreamOffset": 0,
  "downstreamAnchor": "End",
  "downstreamSign": "plus",
  "downstreamOffset": 0,
  "dnaComponent": "exon",
  "transcriptComponent": "five_prime_utr",
  "splicedGenomic": "cds"
}
```

`upstreamOffset`/`downstreamOffset` map directly onto the old CGI form's `oneOffset`/
`twoOffset` upstream/downstream-nt inputs — this report accepts flanking-region offsets
natively, so `resolveTranscriptFeatures` (Task 6) does not need any client-side coordinate
math to support them.

## Confirmed Real Sample of `bedReporter`'s BED Output

For gene `PF3D7_1133400`:

```
Pf3D7_11_v3	1292965	1296696	PF3D7_1133400.1	0	+
```

Tab-separated, 6 columns: `chrom`, `chromStart` (0-based), `chromEnd`, `name` (the transcript
ID), `score`, `strand` (`+`/`-`, standard BED symbols) — a standard 6-column BED format. Task
6's `parseBedToFeatures` was already written against exactly this shape; this sample confirms
it rather than requiring any correction.
