/**
 * VEuPathDB project identifiers
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
  'MicrobiomeDB',
] as const;

export const ALL_VEUPATHDB_PROJECTS = [
  ...GENOMICS_PROJECTS,
  ...OTHER_PROJECTS,
] as const;
