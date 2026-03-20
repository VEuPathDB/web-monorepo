/**
 * VEuPathDB project identifiers
 * are we listing here project names or displayNames?
 * it seems displayNames since we have VEuPathDB and not EUPathDB
 */

export const GENOMICS_PROJECTS = [
  'VEuPathDB',
  'AmoebaDB',
  'CryptoDB',
  'FungiDB',
  'GiardiaDB',
  'HostDB',
  'MicrosporidiaDB',
  'PiroplasmaDB',
  'PlasmoDB',
  'ToxoDB',
  'TrichDB',
  'TriTrypDB',
  'VectorBase',
] as const;

export const OTHER_PROJECTS = [
  'OrthoMCL',
  'ClinEpiDB',
  'dataExplorer',
  'MicrobiomeDB',
] as const;

export const ALL_VEUPATHDB_PROJECTS = [
  ...GENOMICS_PROJECTS,
  ...OTHER_PROJECTS,
] as const;
