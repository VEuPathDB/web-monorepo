import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'wdk-client/Components';

/**
 * Home page for clinepidb sites
 */
export default function Index(props) {
  return (
    <div className="Welcome">

      <h1 className="WelcomeHeadline">
        <span className="SiteName"> {props.displayName} </span>
        focuses on longitudinal clinical epidemiological studies for
        Malaria, Enteric disease and other globally significant disease.
      </h1>

      <h2 className="WelcomeSectionHeader">Search the Data</h2>
      <div className="SearchContainer">
        <a className="SearchAlt" href="/a/showQuestion.do?questionFullName=ParticipantQuestions.ParticipantsByRelativeVisits">
          <i className="SearchIconAlt fa fa-male"></i>
          <div className="SearchIconCaptionAlt">Participants</div>
        </a>
        <a className="SearchAlt" href="/a/showQuestion.do?questionFullName=DwellingQuestions.DwellingsByCharacteristics
">
          <i className="SearchIconAlt fa fa-home"></i>
          <div className="SearchIconCaptionAlt">Households</div>
        </a>
        <a className="SearchAlt" href="/a/showQuestion.do?questionFullName=ClinicalVisitQuestions.ClinicalVisitsByRelativeVisits">
          <i className="SearchIconAlt fa fa-stethoscope"></i>
          <div className="SearchIconCaptionAlt">Visits</div>
        </a>
        <a className="SearchAlt" href="/a/images/vector_slide.svg">
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
                <a href="#">
                  Which children in the MAL-ED study had no diarrheal episodes over the first 24 months of life?
                </a>
              </li>
              <li>
                <a href="#">
                  What is the correlation between neutralizing antibody responses to rotavirus vs poliovirus vaccination?
                </a>
              </li>
              <li>
                <a href="#">
                  Find low HAZ children displaying a growth burst within the next 6 mo, for whom blood samples are available.
                </a>
              </li>

            </ul>
            <p>
              <a href="/a/showApplication.do?tab=public_strat"><em>Explore more sample search strategies</em> &raquo;</a>
            </p>
          </div>
        </div>

        <div className="ExploreSection">
          <h2 className="WelcomeSectionHeader">Explore Example Analyses</h2>
          <div className="AnalysisToolsContainer">
            <div className="AnalysisTool">
              <a href="/a/images/analysis_slide.svg">
                <img className="AnalysisToolImage" src="/a/images/bar-graph.png"/>
                <div>Enrichment</div>
              </a>
            </div>
            <div className="AnalysisTool">
              <a href="/a/images/analysis_slide.svg">
                <img className="AnalysisToolImage" src="/a/images/abundance.png"/>
                <div>Abundance</div>
              </a>
            </div>
            <div className="AnalysisTool">
              <a href="/a/images/analysis_slide.svg">
                <img className="AnalysisToolImage" src="/a/images/scatter.png"/>
                <div>Correlation</div>
              </a>
            </div>
            <div className="AnalysisTool">
              <a href="/a/images/analysis_slide.svg">
                <img className="AnalysisToolImage" src="/a/images/heatmap.png"/>
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
            <Link className="WelcomeBoxLink" to="record/dataset/DS_c75ea37cb3">
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
  displayName: PropTypes.string.isRequired
}
