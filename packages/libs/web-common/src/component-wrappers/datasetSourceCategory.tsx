import { useCallback, useState } from 'react';
import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';
import { projectId, webAppUrl } from '../config';

import './datasetSourceCategory.scss';

/**
 * Which source bucket a dataset is presented under. This is a *display*
 * category, not a record class: a curator-owned dataset is categorised as
 * 'veupathdb' but is still a `userdataset` record, and its links must
 * continue to point at /record/userdataset/.
 */
export type DatasetCategory = 'veupathdb' | 'publicUser' | 'privateUser';

/**
 * The normalised inputs the classifier needs. Callers adapt their own record
 * shape into this, because the two consuming pages store the discriminator
 * differently: InternalGeneDataset uses
 * `source: 'datasource' | 'userdataset'`, AllDatasetsAnswerController uses
 * `dataset_source: 'dataset' | 'userdataset'`.
 */
export interface DatasetSourceInfo {
  isUserDataset: boolean;
  isPublic: boolean;
  ownerIsVeupathdbCurator: boolean;
}

/**
 * WDK serialises yes/no attributes as strings. Always trim and lowercase what
 * the backend sends before comparing — never compare raw. The casing of
 * `owner_is_veupathdb_curator` is not guaranteed (it returns "yes" today and
 * may become "Yes"), so a case-sensitive check would be a latent silent
 * failure.
 *
 * Anything unrecognised, including undefined, is false. A missing or
 * unexpected value therefore leaves a dataset in its existing category rather
 * than promoting it into the VEuPathDB bucket.
 */
export function parseYesNo(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'yes' || normalized === 'true' || normalized === 'y';
}

/**
 * A *public* dataset owned by the VEuPathDB curator account is presented as a
 * VEuPathDB dataset. A private one stays private — the rule is a conjunction,
 * written out rather than reached by fallthrough, because "curator-owned but
 * unpublished" should not be labelled a VEuPathDB dataset.
 */
export function getDatasetCategory(info: DatasetSourceInfo): DatasetCategory {
  if (!info.isUserDataset) return 'veupathdb';
  if (info.ownerIsVeupathdbCurator && info.isPublic) return 'veupathdb';
  return info.isPublic ? 'publicUser' : 'privateUser';
}

/**
 * Sizing lives in datasetSourceCategory.scss (22px), which overrides these.
 * They are kept so the icons are still reasonable if the stylesheet is not
 * loaded, matching what the two call sites did before extraction.
 */
const ICON_STYLE = { width: '20px', height: '20px' } as const;

export function DatasetSourceIcon({ category }: { category: DatasetCategory }) {
  switch (category) {
    case 'veupathdb':
      return (
        <img
          src={`${webAppUrl}/images/${projectId}/favicon.ico`}
          alt="VEuPathDB dataset"
          title="VEuPathDB dataset"
          style={{ ...ICON_STYLE, objectFit: 'contain' }}
        />
      );
    case 'publicUser':
      return (
        <PublicIcon titleAccess="Public User Dataset" style={ICON_STYLE} />
      );
    case 'privateUser':
      return <LockIcon titleAccess="Private User Dataset" style={ICON_STYLE} />;
  }
}

/**
 * Adding a source category means adding one entry here — the checkboxes, the
 * visibility state and the icons all derive from it.
 */
const CATEGORY_CONFIG: { category: DatasetCategory; label: string }[] = [
  { category: 'veupathdb', label: 'VEuPathDB datasets' },
  { category: 'publicUser', label: 'Public User Datasets' },
  { category: 'privateUser', label: 'Private User Datasets' },
];

export type CategoryVisibility = Record<DatasetCategory, boolean>;

/**
 * Visibility state for the source checkboxes. All categories start visible.
 * Callers test a record with
 * `visibility[getDatasetCategory(info)]` — there is deliberately no separate
 * predicate helper, so there is only one way to ask the question.
 */
export function useDatasetSourceFilter(): {
  visibility: CategoryVisibility;
  setVisibility: (category: DatasetCategory, visible: boolean) => void;
} {
  const [visibility, setVisibilityState] = useState<CategoryVisibility>({
    veupathdb: true,
    publicUser: true,
    privateUser: true,
  });

  const setVisibility = useCallback(
    (category: DatasetCategory, visible: boolean) => {
      setVisibilityState((prev) => ({ ...prev, [category]: visible }));
    },
    []
  );

  return { visibility, setVisibility };
}

/**
 * The source-filter checkbox row. `className` is appended so each page can
 * keep its own margins, which differ.
 */
export function DatasetSourceFilters({
  visibility,
  setVisibility,
  className,
}: {
  visibility: CategoryVisibility;
  setVisibility: (category: DatasetCategory, visible: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={
        className ? `DatasetSourceFilters ${className}` : 'DatasetSourceFilters'
      }
    >
      {CATEGORY_CONFIG.map(({ category, label }) => (
        <label key={category}>
          <input
            type="checkbox"
            checked={visibility[category]}
            onChange={(e) => setVisibility(category, e.target.checked)}
          />
          <DatasetSourceIcon category={category} />
          {` ${label}`}
        </label>
      ))}
    </div>
  );
}
