import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'wdk-client/Components';

/**
 * Home page for clinepidb sites
 */
export default function Index({ displayName, webAppUrl }) {
  return (
    <div className="Welcome">

      <h1 className="WelcomeHeadline">
        <span className="SiteName"> {displayName} </span>
        is a data repository designed to facilitate the exploration and mining of epidemiological study datasets, advancing global public health.
      </h1>

      <h2 className="WelcomeSectionHeader">Search the Data</h2>
      <div className="SearchContainer">
        <a
          className="SearchAlt"
          title="Individuals for whom observations are available.  Depending on the nature of the study, this may include patients, caregivers, study subjects, etc"
          href={`${webAppUrl}/showQuestion.do?questionFullName=ParticipantQuestions.ParticipantsByRelativeVisits_maled`}
        >
          <i className="SearchIconAlt fa fa-male"></i>
          <div className="SearchIconCaptionAlt">Participants</div>
        </a>
        <a
          className="SearchAlt"
          title="Households / dwellings, associated with information on geographic location, physical characteristics, socioeconomic data, etc; note that individual households may include multiple participants"
          href=""
        >
          <i className="SearchIconAlt fa fa-home"></i>
          <div className="SearchIconCaptionAlt">Households</div>
        </a>
        <a
          className="SearchAlt"
          title="Depending on the nature of the study, events may include clinical visits, physical measurements, laboratory diagnostics, disease episodes (spanning multiple days), etc"
          href={`${webAppUrl}/showQuestion.do?questionFullName=ClinicalVisitQuestions.ClinicalVisitsByRelativeVisits_maled`}
        >
          <i className="SearchIconAlt fa fa-stethoscope"></i>
          <div className="SearchIconCaptionAlt">Events</div>
        </a>
        <a
          className="SearchAlt"
          title="Entomological collections (not available for all studies)"
          href=""
        >
          <i className="SearchIconAlt fa fa-bug"></i>
          <div className="SearchIconCaptionAlt">Vectors</div>
        </a>
      </div>

      <div className="ExploreContainer">
        <div className="ExploreSection">
          <h2 className="WelcomeSectionHeader">Explore Example Searches</h2>
          <div>
            <ul>
              <li>
                <a href={`${webAppUrl}/im.do?s=5b458c4e9fbf0b69`}>
                Events from children in India who had Diarrheal Episode and Crypto Positive within 14 days
                </a>
              </li>
              <li>
                <a href={`${webAppUrl}/im.do?s=24b1f88e741c809f`}>
                This strategy displays participants who did not have any Cryptosporidium positive tests and had a normal (-2&lt;x&lt;2 HAZ score at their 24 month visit.
                </a>
              </li>
              <li>
                <a href={`${webAppUrl}/im.do?s=adfbeddb525f8b12`}>
                Identifies children with at least three Camphlobacter+ diarrhea events (&gte; 3 days duration) who had &lt; 3 E.coli diarrhea events in first year followed by second year where at least 10 of their anthropometric visits they had a weigh for age Z-score &lt; -2.
                </a>
              </li>

            </ul>
            <p>
              <a href={`${webAppUrl}/showApplication.do?tab=public_strat`}><em>Explore more sample search strategies</em> &raquo;</a>
            </p>
          </div>
        </div>

        <div className="ExploreSection">
          <h2 className="WelcomeSectionHeader">Explore Example Analyses</h2>
          <div className="AnalysisToolsContainer">
            <div className="AnalysisTool">
              <a href={`${webAppUrl}/images/analysis_slide.svg`}>
                <img className="AnalysisToolImage" src={`${webAppUrl}/images/bar-graph.png`}/>
                <div>Enrichment</div>
              </a>
            </div>
            <div className="AnalysisTool">
              <a href={`${webAppUrl}/images/analysis_slide.svg`}>
                <img className="AnalysisToolImage" src={`${webAppUrl}/images/abundance.png`}/>
                <div>Abundance</div>
              </a>
            </div>
            <div className="AnalysisTool">
              <a href={`${webAppUrl}/images/analysis_slide.svg`}>
                <img className="AnalysisToolImage" src={`${webAppUrl}/images/scatter.png`}/>
                <div>Correlation</div>
              </a>
            </div>
            <div className="AnalysisTool">
              <a href={`${webAppUrl}/images/analysis_slide.svg`}>
                <img className="AnalysisToolImage" src={`${webAppUrl}/images/heatmap.png`}/>
                <div>Density</div>
              </a>
            </div>
          </div>
        </div>

      </div>

      <div className="WelcomeBoxContainer">

        <div className="WelcomeBox">
          <h2 className="WelcomeSectionHeader">About the Studies</h2>
          <div className="WelcomeSectionContent">
            <div>
              The studies housed in ClinEpiDB focus on longitudinal clinical
              epidemiological data collected from areas where Malaria,
              Enteric disase and other globally significant disease are endemic.
            </div>
            <Link className="WelcomeBoxLink" to="record/dataset/DS_61ac5d073c">
              Learn more about the studies
            </Link>
          </div>
        </div>

        <div className="WelcomeBox">
          <h2 className="WelcomeSectionHeader">Why Use this Site?</h2>
          <div className="WelcomeSectionContent">
            <ul>
              <li>
                Answer <a href="#">epidemiological</a>, <a href="#">immunological</a>, <a href="#">translational</a>, and <a href="#">data science</a> questions
              </li>
              <li>
                Issue <a href="#">sophisticated searches</a> to mine the <a href="#">study data</a>
              </li>
              <li>
                Use <a href="#">statistical analysis tools</a> to discover trends
              </li>
            </ul>
            <a className="WelcomeBoxLink" href="#">Find more help and tutorials</a>
          </div>
        </div>

        <div className="WelcomeBox">
          <h2 className="WelcomeSectionHeader">Recent News</h2>
          <div className="WelcomeSectionContent">
            <ul>
              <li>
                ClinEpiDB Release 2 includes studies from Research Group, including
                advanced tech ... <em><a href="#">read more</a></em>
              </li>
              <li>
                Registration for the 2019 ClinEpiDB workshop has begun ... <em><a href="#">read more</a></em>
              </li>
            </ul>
            <a className="WelcomeBoxLink" href="#">Go to the news archive</a>
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
