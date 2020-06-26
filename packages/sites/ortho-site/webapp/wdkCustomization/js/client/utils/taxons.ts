import { mapValues, orderBy } from 'lodash';

import * as Decode from 'wdk-client/Utils/Json';

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

export const taxonEntryDecoder: Decode.Decoder<TaxonEntry> = Decode.combine(
  Decode.field('abbrev', Decode.string),
  Decode.field('children', Decode.lazy(() => Decode.objectOf(taxonEntryDecoder))),
  Decode.field('commonName', Decode.string),
  Decode.field('id', Decode.number),
  Decode.field('name', Decode.string),
  Decode.field('sortIndex', Decode.number),
  Decode.field('species', Decode.boolean),
  Decode.field('color', Decode.optional(Decode.string)),
  Decode.field('groupColor', Decode.optional(Decode.string))
);

export const taxonEntriesDecoder: Decode.Decoder<TaxonEntries> = Decode.objectOf(taxonEntryDecoder);

export interface TaxonTree {
  abbrev: string;
  children: TaxonTree[];
};

export const ROOT_TAXON_ABBREV = 'ALL';

export const makeTaxonTree = function(taxonEntries: TaxonEntries): TaxonTree {
  const rootEntry = taxonEntries[ROOT_TAXON_ABBREV];

  if (rootEntry == null) {
    throw Error(`Taxon entry '${ROOT_TAXON_ABBREV}' is missing`);
  }

  return _traverseEntries(rootEntry);

  function _traverseEntries(entry: TaxonEntry): TaxonTree {
    const unorderedChildren = mapValues(
      entry.children,
      childEntry => _traverseEntries(childEntry)
    );

    const orderedChildren = orderBy(
      Object.values(unorderedChildren),
      childEntry => taxonEntries[childEntry.abbrev].sortIndex
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
        throw new Error(`Taxon entry '${taxonAbbrev}' is missing a color`);
      }

      if (groupColor == null) {
        throw new Error(`Taxon entry ${taxonAbbrev} was not assigned a group color.`);
      }

      species[taxonAbbrev] = {
        ...taxonEntry,
        color: taxonEntry.color,
        groupColor,
        path: newPath
      };
    }

    node.children.forEach(childNode => {
      _traverseTaxonTree(childNode, groupColor ?? taxonEntry.groupColor, newPath);
    });

    taxonOrder.push(taxonAbbrev);
  }
}
