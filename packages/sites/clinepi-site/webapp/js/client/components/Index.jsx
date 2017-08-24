import React from 'react';
import PropTypes from 'prop-types';
import { Link, IconAlt as Icon } from 'wdk-client/Components';

/**
 * Home page for clinepidb sites
 */
export default function Index({ displayName, webAppUrl }) {

  const Text = {
    headline: 'Facilitating the exploration and mining of epidemiological study datasets, to advance global public health.'
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
      url: webAppUrl + '/images/analysis_slide.svg',
      image: webAppUrl + '/images/growth-curves.png'
    }
  ];

  const ExampleSearches = [
    {
      text: 'Participants from Vellore who had a diarrheal event and tested Crypto positive within 14 days.',
      url: webAppUrl + '/im.do?s=990178beaf95723e'
    },
    {
      text: 'Participants with a Low HAZ at any point followed by a normal HAZ within 6 months.',
      url: webAppUrl + '/im.do?s=0284a711ff532118'
    },
    {
      text: 'Normal @1M, Stunted at 18M & positive for Campy at least once over that time.',
      url: webAppUrl + '/im.do?s=962acf9669b58cd6'
    },
    {
      text: 'This strategy displays participants who did not have any Cryptosporidium positive tests and had a normal (-2 to +2) Z-Score',
      url: webAppUrl + '/im.do?s=61fbead6228a3c00'
    }
  ];

  const activeStudy = AvailableStudies.find(s => s.active);

  return (
    <div className="Welcome">
      {/* <h1 className="WelcomeHeadline">{Text.headline}</h1> */}
      <img src={webAppUrl + '/images/blurb.png'} className="WelcomeHeadline" />

      <div className="Welcome-Row">

        {/* Left Side Column */}
        <div className="Welcome-Column Welcome-Sidebar">
          <div className="WelcomeContentSection">
            <h2 className="WelcomeSectionHeader">Available Studies</h2>
            <div className="StudiesNav">
              {StudyCategories.map(category => {
                return (
                  <div key={category.id}>
                    <h4><Icon fa="caret-down" /> {category.name}</h4>
                    <ul>
                      {AvailableStudies.filter(s => s.category === category.id).map((s, idx) => {
                        const className = s.active ? 'active' : '';
                        return (
                          <li key={idx} className={className}>{s.name}</li>
                        );
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
            {activeStudy && activeStudy.about && (
              <div className="StudiesInfo">
                <h3>About the <b>{activeStudy.name}</b> study:</h3>
                <p>
                  {activeStudy.about}
                  {activeStudy.url && <a href={activeStudy.url} className="LearnMoreLink">Learn More <Icon fa="chevron-right" /></a>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Column */}
        <div className="Welcome-Column Welcome-Column-Wide">

          {/* Searches */}
          <div className="WelcomeContentSection">
            <h2 className="WelcomeSectionHeader">Search the Data</h2>
            <div className="SearchContainer">
              {Searches.map(search => (
                <a className={'SearchAlt' + (search.url ? '' : ' disabled')} title={search.title} key={search.name} href={search.url ? search.url : '#'}>
                  <i className={'SearchIcon fa fa-' + search.icon} />
                  <div className="SearchIconCaptionAlt">{search.name}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="WelcomeContentSection">
            <h2 className="WelcomeSectionHeader">Explore Example Analyses</h2>
            <div className="AnalysisToolsContainer">
              {Analyses.map(({ name, url, image }) => {
                let Tag = url ? 'a' : 'span';
                return (
                  <div className="AnalysisTool" key={name}>
                    <Tag href={url} target="_blank">
                      {image && <img className="AnalysisToolImage" src={image} />}
                      {name && <div>{name}</div>}
                    </Tag>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="WelcomeContentSection">
            <h2 className="WelcomeSectionHeader">Explore Example Searches</h2>
            <div>
              <ul className="ExampleSearches">
                {ExampleSearches.map(({ text, url }) => (
                  <li key={text}>
                    <a href={url}>{text}</a>
                  </li>
                ))}
              </ul>
              <p>
                <a href={`${webAppUrl}/showApplication.do?tab=public_strat`}><em>Explore more sample search strategies</em> &raquo;</a>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

Index.propTypes = {
  displayName: PropTypes.string.isRequired,
  webAppUrl: PropTypes.string.isRequired
}
