import React from 'react';
import PropTypes from 'prop-types';
import { Link, IconAlt as Icon } from 'wdk-client/Components';
import DisclaimerModal from './DisclaimerModal';

/**
 * Home page for clinepidb sites
 */
export default function Index({ displayName, webAppUrl }) {

  /** Data & Whatnot ~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~ */

  const Text = {
    headline: 'Advancing global public health by facilitating the exploration and mining of epidemiological studies.'
  };

  const StudyCategories = [
    { id: 'malaria', name: 'Malaria' },
    { id: 'enteric', name: 'Enteric Disease' }
  ];

  const AvailableStudies = [
    { category: 'malaria', name: 'Ugandan ICEMR (PRISM)' },
    { category: 'malaria', name: 'Amazonian ICEMR' },
    { category: 'malaria', name: 'Indian ICEMR' },
    { category: 'malaria', name: <b>...</b> },
    { category: 'enteric', name: 'GEMS' },
    {
      category: 'enteric',
      name: 'MAL-ED',
      url: webAppUrl + '/app/record/dataset/DS_61ac5d073c',
      active: true,
      about: (
        <span>
          The MAL-ED project is a multinational and multidisciplinary study designed to elucidate the relationship between enteric pathogens, malnutrition, gut physiology, physical growth, cognitive development and immune responses, in infants and children up to 2 yr of age, in resource-poor environments. <em>Clin Infect Dis</em> <b>59S4:</b>193-206 (2014) PMID 235305287.
        </span>
      )
    },
    { category: 'enteric', name: <b>...</b> }
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
      url: webAppUrl + '/showQuestion.do?questionFullName=ParticipantQuestions.ParticipantsByRelativeVisits_maled',
      title: 'Individuals for whom observations are available.  Depending on the nature of the study, this may include patients, caregivers, study subjects, etc'
    },
    {
      name: 'Observations',
      icon: 'stethoscope',
      url: webAppUrl + '/showQuestion.do?questionFullName=ClinicalVisitQuestions.ClinicalVisitsByRelativeVisits_maled',
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
      name: 'Histograms',
      url: webAppUrl + '/images/analysis_slide.svg',
      image: webAppUrl + '/images/bar-graph.png'
    },
    {
      name: 'Correlations',
      url: webAppUrl + '/images/analysis_slide.svg',
      image: webAppUrl + '/images/scatter.png'
    },
    {
      name: 'Distributions',
      url: webAppUrl + '/images/analysis_slide.svg',
      image: webAppUrl + '/images/distributions.png'
    },
    {
      name: 'Growth Curves',
      url: 'http://gates.clinepidb.org/ce.gates/app/record/participant/HBGDP_1076/ClinEpiDB',
      image: webAppUrl + '/images/growth-curves.png'
    }
  ];

  const ExampleSearches = [
    {
      text: <span>Diarrheal observations in children from Vellore, India; with <em>Cryptosporidium</em> detected within 14 days</span>,
      url: 'http://gates.clinepidb.org/ce.gates/im.do?s=990178beaf95723e'
    },
    {
      text: <span>Study children with a normal HAZ score (-2 to 2) at 24 months of age who never tested positive for <em>Cryptosporidium</em></span>,
      url: 'http://gates.clinepidb.org/ce.gates/im.do?s=61fbead6228a3c00'
    },
    {
      text: 'Study children with at least five diarrheal events in their first two years of life who had 10 or more stunted HAZ observations in their second year.',
      url: 'http://gates.clinepidb.org/ce.gates/im.do?s=4c3e50de511930d9'
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
    const listItems = AvailableStudies
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
    let { name, url, image } = analysis;
    let status = url ? '' : ' dud';
    let icon = !image ? null : (
      <span className="AnalysisLink-Icon IconButton">
        <img src={image} />
      </span>
    );
    return (
      <stack className="xs-6 md-3 justify-center items-center">
        <a title={name} href={url} className={'AnalysisLink' + status}>
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
          {study.url && <a href={study.url} className="LearnMoreLink">Learn More <Icon fa="chevron-right" /></a>}
        </p>
      )}
    </div>
  );

  const SearchesList = Searches.map(search => <SearchLink key={search.title} search={search} />);
  const StudiesNav = StudyCategories.map(category => <StudyCategoryList key={category.id} category={category} />);
  const ExampleSearchList = ExampleSearches.map(example => <ExampleSearch key={example.url} search={example} />);
  const ExampleAnalysesList = Analyses.map(analysis => <AnalysisToolLink key={analysis.name} analysis={analysis} />);

  const active = AvailableStudies.find(s => s.active);
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

        <stack className="xs-12 md-8 nowrap">
          <box className="xs-0">
            <h2>
              <Icon fa="search" />
              Search The Data
            </h2>
            <row>{SearchesList}</row>
          </box>

          <box className="xs-0">
            <h2>
              <Icon fa="line-chart" />
              Explore Example Analyses
            </h2>
            <row>{ExampleAnalysesList}</row>
          </box>

          <box className="xs-0">
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
