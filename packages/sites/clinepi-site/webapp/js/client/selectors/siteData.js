import searches from 'Client/data/searches.json';
import visualizations from 'Client/data/visualizations.json';

export const getStudies = state =>
  state.studies ? state.studies.entities : [];

export const getStaticSiteData = state => ({
  studies: getStudies(state),
  searches,
  visualizations
});

export const getStudyByQuestionName = questionName => state =>
  getStudies(state).find(study =>
    Object.values(study.searches).includes(questionName)
  );
