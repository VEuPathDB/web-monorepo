export const accessLevels = {
  public: {
    loginRequired: ['download', 'paginate']
  },
  protected: {
    loginRequired: ['paginate'],
    approvalRequired: ['download']
  },
  private: {
    approvalRequired: ['search', 'results', 'paginate', 'analysis', 'download']
  }
};

export function getAccessDirectiveVerb (directive) {
  if (typeof directive !== 'string') return null;
  switch (directive) {
    case 'login':
      return 'login or create an account';
    case 'approval':
      return 'acquire research approval';
    default:
      return 'contact us';
  }
};

export function getActionVerb (action) {
  if (typeof action !== 'string') return null;
  switch (action) {
    case 'search':
      return 'search the data';
    case 'analysis':
      return 'create and view analyses';
    case 'paginate':
      return 'see more results';
    case 'download':
      return 'download data';
    default:
      return action;
  }
};

export function getHurdle ({ directive, action } = {}) {
  if (typeof directive !== 'string' || typeof action !== 'string') return 'Data restricted.';
  const doThis = getAccessDirectiveVerb(directive);
  const doThat = getActionVerb(action);
  return `Please ${doThis} in order to ${doThat}.`;
}

export function getStudyAccessLevel (study = {}) {
  const { id } = study;
  const hasValidAccessAttribute = Object.keys(accessLevels).includes(study.access);
  if (typeof id !== 'string')
    console.warn(`[getStudyAccessLevel] Invalid study id provided. Treating as 'public'. Received:`, { study });
  else if (!hasValidAccessAttribute)
    console.warn(`[getStudyAccessLevel] No or invalid [study.access] set in study @${id} (received "${study.access}"). Treating as 'public'.`);
  const { access } = hasValidAccessAttribute ? study : { access: 'public' };
  return access;
};

export function getDirective ({ study, action }) {
  const accessLevel = getStudyAccessLevel(study);
  if (!Object.keys(accessLevels).includes(accessLevel)) return;
  const { approvalRequired, loginRequired } = accessLevels[accessLevel];
  if (Array.isArray(loginRequired) && loginRequired.includes(action)) return 'login';
  if (Array.isArray(approvalRequired) && approvalRequired.includes(action)) return 'approval';
  return null;
};

export function getRestrictionMessage ({ action, study }) {
  const directive = getDirective({ study, action });
  return getHurdle({ directive, action });
};

export function isAllowedAccess ({ user, action, study }) {
  const accessLevel = getStudyAccessLevel(study);
  const restrictions = accessLevels[accessLevel];
  if ('loginRequired' in restrictions && restrictions.loginRequired.includes(action))
    return !user.isGuest;
  if ('approvalRequired' in restrictions && restrictions.approvalRequired.includes(action))
    return !user.isGuest
      && 'properties' in user
      && 'approvedStudies' in user.properties
      && user.properties.approvedStudies.includes(study.id);
  return true;
};
