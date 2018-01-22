export const accessLevels = {
  public: {
    loginRequired: ['download', 'paginate']
  },
  protected: {
    loginRequired: ['paginate'],
    approvalRequired: ['download']
  },
  private: {
    approvalRequired: ['search','results','paginate','analysis','download']
  }
};

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
