# Design: User Datasets in the Internal Gene Dataset catalog

**Date:** 2026-08-06
**Branch:** fix-internal-srch-pg-bugs
**Status:** Implemented (integration shipped in `23d997ebc6`); contract section is live reference

## Context

Internal gene dataset catalog pages — `search/transcript/GenesByRNASeqEvidence` and its siblings — list one
row per dataset, with buttons linking to each search that dataset supports. Since `23d997ebc6` those pages also
list **user datasets** (VDI/EDA uploads) alongside curated ones.

This spec replaces a root-level `USERDATASET_INTEGRATION_PLAN.md` (2026-07-19, since deleted), which was
written before the integration shipped and whose "CONFIRMED" backend claims were either wrong at the time or
had drifted by August 2026. Trusting it cost a debugging session: an agent diagnosing missing rows pursued a
wrong theory for several rounds on the strength of its stale field names. **This document is authoritative for
the response contract** — verify against a live response (see the end of this file) rather than against any
older description.

The component is a single file:
`packages/sites/genomics-site/webapp/wdkCustomization/js/client/components/questions/InternalGeneDataset.tsx`

## How a row gets on the page

Worth understanding before changing anything here, because most failure modes are silent.

The page is not a normal question form. `pluginConfig.tsx` routes any question with both
`properties.datasetCategory` and `properties.datasetSubtype` to `InternalGeneDataset`. The component then:

1. Fires two answer requests in parallel, both parameterised by `dataset_category`:
   - `DatasourcesByCategory` → curated rows, searches listed in a `References` table
   - `UserDatasetsByCategory` → user dataset rows, searches listed in an `ExploreWebsiteSearches` table
2. Normalises both into one `InternalQuestionRecord[]` keyed by search name.
3. Walks the **category ontology** in `getDisplayCategoryMetadata`, matching each ontology node's `name`
   property against those search names. A node only counts if it has `targetType === 'search'`, a `scope`
   including `webservice`, and an ancestor whose `label` starts with `searchCategory`.
4. Builds `questionNamesByDatasetAndCategory` from the matches, then **drops any dataset with no entry**.

Step 4 is the critical one. A dataset whose search is absent from the ontology, or present but outside a
`searchCategory` branch, is filtered out with **no warning, no empty state, and no console output** — the
request succeeds and the row simply never appears. Both the curated path (`getDatasourceRecords`) and the user
dataset path (`getUserDatasetRecords`) share this behaviour.

This is the single most important thing to know when a row is missing: **check the ontology before suspecting
the client.** An August 2026 outage of user dataset rows on the RNASeq page had exactly this cause — the
search had been renamed backend-side and its new name was not placed under a `searchCategory` node.

## Backend contract: `ExploreWebsiteSearches`

Verified against a live PlasmoDB response, 2026-08-06.

### Request

```
POST /service/record-types/userdataset/searches/UserDatasetsByCategory/reports/standard
```

```typescript
const USERDATASET_REPORT_CONFIG = {
  attributes: [
    'name', // maps to displayName in the response
    'ref_organism_formatted', // HTML-formatted organism
    'dataset_id', // primary key, EDAUD_-prefixed
    'summary',
    'is_public', // STRING "Private" | "Public"
    'primary_contact_name',
    'owner_name',
    'ref_organism', // clean string, for preference filtering
  ],
  tables: ['ExploreWebsiteSearches'],
  pagination: { offset: 0, numRecords: -1 },
};
```

### Response

```json
{
  "records": [
    {
      "displayName": "synthetic rnaseq data",
      "recordClassName": "UserDatasetRecordClasses.UserDatasetRecordClass",
      "attributes": {
        "name": "synthetic rnaseq data",
        "ref_organism_formatted": "<i>Plasmodium falciparum</i> 3D7",
        "ref_organism": "Plasmodium falciparum 3D7",
        "dataset_id": "EDAUD_xoR5M00Ug90RN",
        "summary": "metadata processed by ai",
        "is_public": "Public",
        "primary_contact_name": "Steve D Fischer",
        "owner_name": "steve fischer"
      },
      "tables": {
        "ExploreWebsiteSearches": [
          {
            "question_name": "GeneQuestions.GenesByDESeqUserDataset",
            "dataset_id_param": "eda_dataset_id",
            "dataset_id": "EDAUD_xoR5M00Ug90RN",
            "description": "Identify Genes based on RNA-Seq raw counts",
            "search_link": {
              "displayText": "Identify Genes based on RNA-Seq raw counts",
              "url": "/a/app/search/transcript/GenesByDESeqUserDataset?param.eda_dataset_id=EDAUD_xoR5M00Ug90RN"
            },
            "record_class": "TranscriptRecordClasses.TranscriptRecordClass",
            "url": "/a/app/search/transcript/GenesByDESeqUserDataset?param.eda_dataset_id=EDAUD_xoR5M00Ug90RN",
            "order": "1"
          }
        ]
      },
      "tableErrors": []
    }
  ]
}
```

### Field rules

| Field           | Rule                                                                |
| --------------- | ------------------------------------------------------------------- |
| Table name      | `ExploreWebsiteSearches` — not `ExploreWdkSearches`                 |
| `question_name` | **Namespaced**, e.g. `GeneQuestions.GenesByDESeqUserDataset`        |
| `record_class`  | Named `record_class` — **not** `record_type`                        |
| `url`           | Always present, `rootUrl`-prefixed. `search_link.url` duplicates it |
| `dataset_id`    | Carries the `EDAUD_` prefix everywhere                              |
| `is_public`     | STRING `"Private"` / `"Public"` — convert with `=== 'Public'`       |

Three of these correct the superseded document, which claimed `question_name` had no namespace prefix, called
the field `record_type`, and did not mention `url` at all. If you find those claims repeated anywhere, they are
wrong.

### `question_name` is namespaced — and is not `queryName`

`getDisplayCategoryMetadata` matches against the namespaced ontology node `name`. A non-namespaced value would
match nothing, and every user dataset row would be dropped by the silent filter described above.

Separately: `question_name` (the search/question name, used in URLs and this table) is a **different field**
from a question's `queryName`, which is what `pluginConfig.tsx` tests when choosing a question form. Renaming
one does not imply the other changed. Conflating them produces convincing but false diagnoses — during the
August 2026 investigation this led to a reported bug in `pluginConfig.tsx:202` that did not exist.

### Search URLs: use the supplied `url`

Every entry carries a ready-made `url`. Clients must **not** rebuild links from `dataset_id_param` +
`dataset_id`. Doing so requires encoding per-parameter conventions the client has no business knowing — most
notably which parameters keep the `EDAUD_` prefix (`eda_dataset_id` keeps it; others historically stripped it).
That rule lived in the client, went stale, and is exactly the kind of duplication this contract exists to stop.

A search with no `url` is a service defect: there is nothing to link to. The client throws rather than
fabricating a plausible link — see the plan for how that surfaces.

`InternalGeneDataset.tsx` consumes only the **query string** from it, for two reasons:

- it links to the catalog page with a tab anchor (`?params#questionName`), not to the standalone search page
  the `url` points at; and
- `<Link>` is router-relative while the supplied url includes the `rootUrl` basename, so passing it whole would
  resolve to `/a/app/a/app/...` (history is created with `basename: rootUrl` — `wdk-client/src/Core/main.js:85`).

## Curated vs user dataset paths

| Aspect        | DataSources                                            | UserDatasets                                            |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------- |
| Backend table | `References`                                           | `ExploreWebsiteSearches`                                |
| Questions     | Dataset-specific, e.g. `GenesByRnaSeq_RSRC123_DiffExp` | Generic, e.g. `GenesByDESeqUserDataset`                 |
| Parameters    | None — baked into the question name                    | Dataset id passed as a parameter                        |
| Link shape    | `#GenesByRnaSeq_RSRC123_DiffExp`                       | `?param.eda_dataset_id=EDAUD_…#GenesByDESeqUserDataset` |
| Primary key   | `dataset_name` + `dataset_id`                          | `dataset_id` only, used for both                        |
| Record page   | `/record/dataset/{id}`                                 | `/record/userdataset/{id}` (prefix retained)            |

The two are processed by separate functions (`getDatasourceRecords`, `getUserDatasetRecords`) that both emit
the normalised `DatasourceRecord` shape and are merged client-side. Keeping them separate is deliberate: the
response shapes differ enough that a unified parser would be mostly branching.

**Record-class filtering must apply to both.** The curated path filters `References` rows on
`record_type === outputRecordClassName`. The user dataset path originally read `record_class` but never
compared it, so a user dataset search targeting a different record class would have been merged into the wrong
page. Corrected in the accompanying plan.

## Known weaknesses

Not addressed by the accompanying plan; recorded so they are not rediscovered from scratch.

1. **Silent row-dropping.** No diagnostic when a dataset matches no ontology category (see "How a row gets on
   the page"). The highest-value improvement available here — a single `console.warn` naming the unmatched
   search would have cut hours off the August 2026 investigation.
2. **Throws leave the page on a spinner.** Any throw inside the `useWdkService` callback leaves `serviceResult`
   undefined, so the guard renders `<Loading />` indefinitely — curated rows included. The throw itself is
   _not_ silent: `useWdkService` catches rejections (`Hooks/WdkServiceHook.ts:28-33`), reports via
   `submitErrorIfNot500`, and dispatches `notifyUnhandledError`, which shows an error modal
   (`Core/Root.tsx:167`). The defect is that dismissing the modal leaves a spinner rather than an error state.
3. **Unguarded lookups.** `getCategorySearchName` and `getSelectedDataSetRecord` double-index
   `questionNamesByDatasetAndCategory` without null guards. Currently masked by the upstream filters.
4. **`ExploreWebsiteSearches[0]`.** `getUserDatasetRecords` reads only the first entry, so a user dataset
   offering multiple searches would apply the first search's URL to every category button. No such dataset
   exists today.
5. **No tests.** `packages/sites/genomics-site` has no test files and no `test` script. The pure helpers here
   (`getUserDatasetInternalQuestions`, `getCategorySearchUrl`, `getDisplayCategoryMetadata`) would be
   straightforward to cover if exported.

## Verifying against a live service

```bash
curl -X POST 'https://plasmodb.org/plasmo/service/record-types/userdataset/searches/UserDatasetsByCategory/reports/standard' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "searchConfig": {
      "parameters": { "dataset_category": "RNASeq" }
    },
    "reportConfig": {
      "attributes": ["name", "ref_organism_formatted", "dataset_id", "summary", "is_public", "primary_contact_name", "owner_name", "ref_organism"],
      "tables": ["ExploreWebsiteSearches"],
      "pagination": { "offset": 0, "numRecords": 10 }
    }
  }'
```

If rows come back but none appear on the page, the problem is the ontology, not this response. Search the
`/service/ontologies/Categories` response for the `question_name` and confirm it sits under a `searchCategory*`
node with `targetType: search` and a `scope` including `webservice`.
