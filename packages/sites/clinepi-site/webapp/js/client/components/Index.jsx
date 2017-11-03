import React from 'react';
import PropTypes from 'prop-types';
import { Link, IconAlt as Icon } from 'wdk-client/Components';
import DisclaimerModal from './DisclaimerModal';

/**
 * Home page for clinepidb sites
 */
export default function Index ({ displayName, webAppUrl, studies }) {

  /** Data & Whatnot ~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~ */

  const Text = {
    headline: 'Advancing global public health by facilitating the exploration and mining of epidemiological studies.'
  };

  const StudyCategories = [
    { id: 'malaria', name: 'Malaria' },
    { id: 'enteric', name: 'Enteric Disease' }
  ];

  const Searches = [
    {
      name: 'Households',
      icon: 'home',
      title: 'Households / dwellings, associated with information on geographic location, physical characteristics, socioeconomic data, etc; note that individual households may include multiple participants'
    },
    {
      name: 'Participants',
      icon: 'male',
      url: webAppUrl + '/showQuestion.do?questionFullName=ParticipantQuestions.ParticipantsByCaseControlVisits_gems',
      title: 'Individuals for whom observations are available.  Depending on the nature of the study, this may include patients, caregivers, study subjects, etc'
    },
    {
      name: 'Observations',
      icon: 'stethoscope',
      // url: webAppUrl + '/showQuestion.do?questionFullName=ClinicalVisitQuestions.ClinicalVisitsByRelativeVisits_maled',
      title: 'Depending on the nature of the study, observations may include clinical visits, physical measurements, laboratory diagnostics, disease episodes (spanning multiple days), etc'
    },
    {
      name: 'Vectors',
      icon: 'bug',
      title: 'Entomological collections (not available for all studies)'
    }
  ];

  const Analyses = [
    {
      name: 'Contingency Tables',
      url: webAppUrl + '/images/contingency-tutorial.jpg',
      image: webAppUrl + '/images/contingency-square.png',
      disabled: false,
      spawn: true
    },
    {
      name: 'Correlations',
      url: webAppUrl + '/images/analysis_slide.svg',
      image: webAppUrl + '/images/scatter.png',
      disabled: true,
      spawn: true
    },
    {
      name: 'Distributions',
      url: webAppUrl + '/images/distribution-tutorial.jpg',
      image: webAppUrl + '/images/distributions.png',
      spawn: true
    },
    {
      name: 'Growth Curves',
      url: 'http://gates.clinepidb.org/ce.gates/app/record/participant/HBGDP_1076/ClinEpiDB',
      image: webAppUrl + '/images/growth-curves.png'
    }
  ];

  const ExampleSearches = [
    {
      text: <span>Female Cases from Bangladesh who reported a duration of diarrheal illness greater than 3 days and their matched Controls.</span>,
      url: webAppUrl + '/im.do?s=01faf997d02db437'
    },
    {
      text: <span>Cases less than 24 months of age at enrollment who were only positive for <em>Giardia</em> & reported diarrhea duration greater than 3 days</span>,
      url: webAppUrl + '/im.do?s=e7098b187c6e603a'
    },
    {
      text: <span><em>Giardia</em> positive controls who had an HAZ greater than -2 at enrollment but below -2 at 60 day follow-up</span>,
      url: webAppUrl + '/im.do?s=8eb17c1ee72be765'
    }
  ];

  /** Renderers ~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~~=~=~ */

  const StudyListItem = ({ study }) => {
    const className = study.active ? 'active' : '';
    return (
      <li className={className}>{study.name}</li>
    );
  };

  const StudyCategoryList = ({ category }) => {
    const listItems = studies
      .filter(s => s.category === category.id)
      .map((study, idx) => <StudyListItem study={study} key={idx} />);

    return (
      <div>
        <h4><Icon fa="caret-down" /> {category.name}</h4>
        <ul>
          {listItems}
        </ul>
      </div>
    );
  };

  const SearchLink = ({ search }) => {
    let { url, title, icon, name } = search;
    let status = url ? '' : ' disabled';
    let uri = url ? url : '#';
    return (
      <stack className="xs-6 md-3 justify-center items-center" key={url}>
        <a title={title} href={uri} className={'SearchLink' + status} key={title}>
          {icon && <Icon fa={icon} className="SearchLink-Icon IconButton" />}
          {name && <label className="SearchLink-Caption">{name}</label>}
        </a>
      </stack>
    );
  };

  const AnalysisToolLink = ({ analysis = {} }) => {
    let { name, url, image, disabled, spawn } = analysis;
    let status = (url ? '' : ' dud') + (disabled ? ' disabled' : '');
    let target = (spawn ? '_blank' : '');
    let icon = !image ? null : (
      <span className="AnalysisLink-Icon IconButton">
        <img src={image} />
      </span>
    );
    return (
      <stack className="xs-6 md-3 justify-center items-center">
        <a title={name} href={url} className={'AnalysisLink' + status} target={target}>
          {icon}
          {name && <label className="AnalysisLink-Caption">{name}</label>}
        </a>
      </stack>
    )
    return (
      <div className="AnalysisTool">
        <Tag href={url} target="_blank">
          {image && <img className="AnalysisToolImage" src={image} />}
          {name && <div>{name}</div>}
        </Tag>
      </div>
    );
  }

  const ExampleSearch = ({ search = {} }) => {
    const { text, url } = search;
    return (
      <li>
        <a href={url}>{text}</a>
      </li>
    );
  };

  const StudyDetails = ({ study }) => (
    <div className="StudyDetails">
      {study.name && <h3>About the <b>{study.name}</b> study:</h3>}
      {study.about && (
        <p>
          {study.about}
          {study.route && <Link to={study.route} className="LearnMoreLink">Learn More <Icon fa="chevron-right" /></Link>}
        </p>
      )}
    </div>
  );

  const SearchesList = Searches.map(search => <SearchLink key={search.title} search={search} />);
  const StudiesNav = StudyCategories.map(category => <StudyCategoryList key={category.id} category={category} />);
  const ExampleSearchList = ExampleSearches.map(example => <ExampleSearch key={example.url} search={example} />);
  const ExampleAnalysesList = Analyses.map(analysis => <AnalysisToolLink key={analysis.name} analysis={analysis} />);

  const active = studies.find(s => s.active);
  const ActiveStudy = !active || !active.about ? null : <StudyDetails study={active} />;

  /** Page layout ~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~= */

  return (
    <grid className="HomePage">

      {/* TOP BLURB */}
      <box className="xs-12">
        <img
          src={webAppUrl + '/images/blurb.png'}
          className="_sm-hide WelcomeBanner"
          alt={Text.headline}
        />
        <img
          src={webAppUrl + '/images/blurb-mobile.png'}
          className="md_-hide WelcomeBanner"
          alt={Text.headline}
        />
      </box>

      <row className="xs-12">
        <box className="xs-12 md-4 xs-order-1 sm-order-1">
          <h2>
            <Icon fa="book" />
            Available Studies
          </h2>
          <div className="StudiesNav">
            {StudiesNav}
          </div>
          {ActiveStudy}
        </box>

        <stack className="xs-12 md-8 nowrap" id="RightColumn">
          <box className="xs-auto">
            <h2>
              <Icon fa="search" />
              Search The Data
            </h2>
            <row>{SearchesList}</row>
          </box>

          <box className="xs-auto">
            <h2>
              <Icon fa="line-chart" />
              Explore Example Analyses
            </h2>
            <row>{ExampleAnalysesList}</row>
          </box>

          <box className="xs-auto">
            <h2>
              <Icon fa="binoculars" />
              Explore Example Searches
            </h2>
            <ul className="ExampleSearches">
              {ExampleSearchList}
            </ul>
            <p>
              <a href={webAppUrl + '/showApplication.do?tab=public_strat'}>
                <em>Explore more sample search strategies</em> &raquo;
              </a>
            </p>

          </box>
        </stack>
      </row>

      <DisclaimerModal />
    </grid>
  );
}

Index.propTypes = {
  displayName: PropTypes.string.isRequired,
  webAppUrl: PropTypes.string.isRequired
}
