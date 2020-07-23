import { mapValues, orderBy } from 'lodash';

import {
  Decoder,
  boolean,
  lazy,
  number,
  objectOf,
  optional,
  record,
  string
} from 'wdk-client/Utils/Json';

export interface TaxonEntry {
  abbrev: string;
  children: Record<string, TaxonEntry>;
  commonName: string;
  id: number;
  name: string;
  sortIndex: number;
  species: boolean;
  color?: string;
  groupColor?: string;
}

export type TaxonEntries = Record<string, TaxonEntry>;

export const taxonEntryDecoder: Decoder<TaxonEntry> = record({
  abbrev: string,
  children: lazy(() => objectOf(taxonEntryDecoder)),
  commonName: string,
  id: number,
  name: string,
  sortIndex: number,
  species: boolean,
  color: optional(string),
  groupColor: optional(string)
});

export const taxonEntriesDecoder: Decoder<TaxonEntries> = objectOf(taxonEntryDecoder);

export interface TaxonTree {
  abbrev: string;
  children: TaxonTree[];
};

export const ROOT_TAXON_ABBREV = 'ALL';

export const makeTaxonTree = function(taxonEntries: TaxonEntries): TaxonTree {
  const rootEntry = taxonEntries[ROOT_TAXON_ABBREV];

  if (rootEntry == null) {
    throw new Error(`Taxon entry "${ROOT_TAXON_ABBREV}" is missing.`);
  }

  return _traverseEntries(rootEntry);

  function _traverseEntries(entry: TaxonEntry): TaxonTree {
    const unorderedChildren = mapValues(
      entry.children,
      childEntry => _traverseEntries(childEntry)
    );

    const orderedChildren = orderBy(
      Object.values(unorderedChildren),
      [
        childEntry => taxonEntries[childEntry.abbrev].species,
        childEntry => taxonEntries[childEntry.abbrev].sortIndex
      ]
    );

    return {
      abbrev: entry.abbrev,
      children: orderedChildren
    };
  }
};

export interface TaxonUiMetadata {
  rootTaxons: Record<string, RootTaxonEntry>;
  species: Record<string, SpeciesEntry>;
  taxonOrder: string[];
}

export interface RootTaxonEntry extends TaxonEntry {
  groupColor: string;
}

export interface SpeciesEntry extends TaxonEntry {
  color: string;
  groupColor: string;
  path: string[];
}

export function makeTaxonUiMetadata(taxonEntries: TaxonEntries, taxonTree: TaxonTree): TaxonUiMetadata {
  const rootTaxons = {} as TaxonUiMetadata['rootTaxons'];
  const species = {} as TaxonUiMetadata['species'];
  const taxonOrder = [] as TaxonUiMetadata['taxonOrder'];

  _traverseTaxonTree(taxonTree, undefined, []);

  return {
    rootTaxons,
    species,
    taxonOrder
  };

  function _traverseTaxonTree(node: TaxonTree, groupColor: string | undefined, path: string[]) {
    const taxonAbbrev = node.abbrev;
    const newPath = taxonAbbrev === ROOT_TAXON_ABBREV ? path : [...path, taxonAbbrev];
    const taxonEntry = taxonEntries[taxonAbbrev];

    // A taxon is a root taxon iff its taxon entry has a group color
    if (taxonEntry.groupColor != null) {
      rootTaxons[taxonAbbrev] = {
        ...taxonEntry,
        groupColor: taxonEntry.groupColor
      };
    }

    if (taxonEntry.species) {
      if (taxonEntry.color == null) {
        throw new Error(`Taxon entry "${taxonAbbrev}" is missing a color.`);
      }

      if (groupColor == null) {
        throw new Error(`Taxon entry "${taxonAbbrev}" was not assigned a group color.`);
      }

      species[taxonAbbrev] = {
        ...taxonEntry,
        color: taxonEntry.color,
        groupColor,
        path: newPath
      };

      taxonOrder.push(taxonAbbrev);
    }

    node.children.forEach(childNode => {
      _traverseTaxonTree(childNode, groupColor ?? taxonEntry.groupColor, newPath);
    });
  }
}
