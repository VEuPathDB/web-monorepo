export function shouldDisableStudy (projectId, study = {}) {
  const { projectAvailability, disabled } = study;
  if (disabled) return true;
  return typeof projectId === 'string' && Array.isArray(projectAvailability)
    ? !projectAvailability
        .map(project => project.toLowerCase())
        .includes(projectId.toLowerCase())
    : true;
}

export function isStudyObject (candidate) {
  return typeof candidate === 'object'
    && candidate.id
    && candidate.name;
}

export function disableUnavailableStudies (projectId, studyList) {
  if (!Array.isArray(studyList) || studyList.some(study => !isStudyObject(study)))
    throw new TypeError('disableUnavailableStudies requires :studyList be an array of studies.');
  return studyList.map(study => {
    const disabled = shouldDisableStudy(projectId, study);
    return { ...study, disabled };
  });
}
