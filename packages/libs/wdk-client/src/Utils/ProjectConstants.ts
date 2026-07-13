export interface ProjectConstants {
  readonly projectId: string;
  readonly displayName: string;
  readonly siteUrl: string;
}

// WARNING!!! The site footer depends on the order of this array!
export const GENOMICS_PROJECTS: readonly ProjectConstants[] = [
  newProjectConstants('UniDB', 'VEuPathDB'),
  newProjectConstants('AmoebaDB'),
  newProjectConstants('CryptoDB'),
  newProjectConstants('FungiDB'),
  newProjectConstants('GiardiaDB'),
  newProjectConstants('HostDB'),
  newProjectConstants('MicrosporidiaDB'),
  newProjectConstants('PiroplasmaDB'),
  newProjectConstants('PlasmoDB'),
  newProjectConstants('ToxoDB'),
  newProjectConstants('TrichDB'),
  newProjectConstants('TriTrypDB'),
  newProjectConstants('VectorBase'),
] as const;

export const OTHER_PROJECTS = [
  newProjectConstants('OrthoMCL'),
  newProjectConstants('ClinEpiDB', 'dataExplorer'),
  newProjectConstants('MicrobiomeDB'),
] as const;

export const ALL_VEUPATHDB_PROJECTS = [
  ...GENOMICS_PROJECTS,
  ...OTHER_PROJECTS,
] as const;

/**
 * Tests if the given project id string exists as one of the genomics project
 * id values.
 */
export function isGenomicsProjectId(projectId: string): boolean {
  return GENOMICS_PROJECTS.some((it) => it.projectId === projectId);
}

export function projectIdToDisplayName(projectId: string): string | undefined {
  return ALL_VEUPATHDB_PROJECTS.find((it) => it.projectId === projectId)
    ?.displayName;
}

function newProjectConstants(
  projectId: string,
  projectName?: string
): ProjectConstants {
  const displayName = projectName ?? projectId;

  return {
    projectId,
    displayName,
    get siteUrl(): string {
      return `https://${displayName.toLowerCase()}.org`;
    },
  };
}
