import { mapValues, orderBy } from 'lodash';

import {
  Decoder,
  boolean,
  lazy,
  number,
  objectOf,
  optional,
  record,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { areTermsInString } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

export interface BaseTaxonEntry {
  abbrev: string;
  commonName: string;
  id: number;
  name: string;
  sortIndex: number;
  species: boolean;
  color?: string;
  groupColor?: string;
}

export interface TaxonEntry extends BaseTaxonEntry {
  children: Record<string, TaxonEntry>;
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
  groupColor: optional(string),
});

export const taxonEntriesDecoder: Decoder<TaxonEntries> =
  objectOf(taxonEntryDecoder);

export interface TaxonTree extends BaseTaxonEntry {
  children: TaxonTree[];
}

export const ROOT_TAXON_ABBREV = 'ALL';

export function makeTaxonTree(taxonEntries: TaxonEntries): TaxonTree {
  const rootEntry = taxonEntries[ROOT_TAXON_ABBREV];

  if (rootEntry == null) {
    throw new Error(`Taxon entry "${ROOT_TAXON_ABBREV}" is missing.`);
  }

  return _traverseEntries(rootEntry);

  function _traverseEntries(entry: TaxonEntry): TaxonTree {
    const unorderedChildren = mapValues(entry.children, (childEntry) =>
      _traverseEntries(childEntry)
    );

    const orderedChildren = orderBy(Object.values(unorderedChildren), [
      (childEntry) => taxonEntries[childEntry.abbrev].sortIndex,
    ]);

    return {
      ...entry,
      children: orderedChildren,
    };
  }
}

export function getTaxonNodeId(node: TaxonTree) {
  return node.abbrev;
}

export function taxonSearchPredicate(node: TaxonTree, searchTerms: string[]) {
  return areTermsInString(searchTerms, `${node.name} ${node.abbrev}`);
}

export function makeInitialExpandedNodes(
  taxonTree: TaxonTree,
  maxDepth: number = 1
) {
  const initialExpandedNodes = [] as string[];

  _traverse(taxonTree, 0);

  return initialExpandedNodes;

  function _traverse(node: TaxonTree, depth: number) {
    if (depth <= maxDepth) {
      initialExpandedNodes.push(getTaxonNodeId(node));

      node.children.forEach((child) => {
        _traverse(child, depth + 1);
      });
    }
  }
}

export interface TaxonUiMetadata {
  rootTaxons: Record<string, RootTaxonEntry>;
  species: Record<string, SpeciesEntry>;
  taxonOrder: string[];
  taxonTree: TaxonTree;
}

export interface RootTaxonEntry extends TaxonEntry {
  groupColor: string;
}

export interface SpeciesEntry extends TaxonEntry {
  color: string;
  groupColor: string;
  rootTaxon: string;
  path: string[];
}

export function makeTaxonUiMetadata(
  taxonEntries: TaxonEntries,
  taxonTree: TaxonTree
): TaxonUiMetadata {
  const rootTaxons = {} as TaxonUiMetadata['rootTaxons'];
  const species = {} as TaxonUiMetadata['species'];
  const taxonOrder = [] as TaxonUiMetadata['taxonOrder'];

  _traverseTaxonTree({
    node: taxonTree,
    groupColor: undefined,
    rootTaxon: undefined,
    path: [],
  });

  return {
    rootTaxons,
    species,
    taxonOrder,
    taxonTree,
  };

  function _traverseTaxonTree({
    node,
    groupColor,
    rootTaxon,
    path,
  }: {
    node: TaxonTree;
    groupColor: string | undefined;
    rootTaxon: string | undefined;
    path: string[];
  }) {
    const taxonAbbrev = node.abbrev;
    const newPath =
      taxonAbbrev === ROOT_TAXON_ABBREV ? path : [...path, taxonAbbrev];
    const taxonEntry = taxonEntries[taxonAbbrev];

    if (taxonEntry == null) {
      throw new Error(`The taxon entry for "${taxonAbbrev}" is missing.`);
    }

    // A taxon is a root taxon iff its taxon entry has a group color
    if (taxonEntry.groupColor != null) {
      rootTaxons[taxonAbbrev] = {
        ...taxonEntry,
        groupColor: taxonEntry.groupColor,
      };
    }

    if (taxonEntry.species) {
      if (taxonEntry.color == null) {
        throw new Error(
          `The taxon entry for "${taxonAbbrev}" is missing a color.`
        );
      }

      if (groupColor == null) {
        throw new Error(
          `The taxon entry for "${taxonAbbrev}" was not assigned a group color.`
        );
      }

      if (rootTaxon == null) {
        throw new Error(
          `The taxon entry for "${taxonAbbrev}" was not assigned a root taxon.`
        );
      }

      species[taxonAbbrev] = {
        ...taxonEntry,
        color: taxonEntry.color,
        groupColor,
        rootTaxon,
        path: newPath,
      };

      taxonOrder.push(taxonAbbrev);
    }

    node.children.forEach((childNode) => {
      _traverseTaxonTree({
        node: childNode,
        groupColor: groupColor ?? taxonEntry.groupColor,
        rootTaxon: rootTaxon ?? (taxonEntry.groupColor && taxonEntry.abbrev),
        path: newPath,
      });
    });
  }
}
