import React from 'react';

export default function Index(props) {
  return (
    <div className="Welcome">

      <div className="WelcomeHeadline">
        The <span className="SiteName"> {props.displayName} </span>
        database focuses on the longitudinal clinical epidemiological studies for
        Malaria, Enteric disease and other globally significant disease.
      </div>

      <div className="WelcomeCenter">

        <h2 className="WelcomeSectionHeader">Welcome! Use this site to:</h2>
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

        <h2 className="WelcomeSectionHeader">Recent News</h2>
        <ul>
          <li>
            ClinEpiDB Release 2 includes studies from Research Group, including
            advanced tech... <em><a href="#">read more</a></em>
          </li>
          <li>
            Registration for the 2019 ClinEpiDB workshop has begun... <em><a href="#">read more</a></em>
          </li>
          <li>
            <em><a href="#">Go to the news archive</a> &raquo;</em>
          </li>
        </ul>

        <div className="Experiences">
          <img className="ImagePlaceholder" width="300" height="200"/>
          <div className="ExperienceTestimonial">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.

            &mdash;Bryan Greenhouse, UCSF
          </div>
          <a href="#">Read more scientific experiences</a>
        </div>
      </div>

      <div className="WelcomeBoxContainer">

        <div className="WelcomeBox">
          <h2 className="WelcomeSectionHeader">About the Studies</h2>
          <div className="WelcomeSectionContent">
            <div>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur.
            </div>
            <a className="WelcomeBoxLink" href="#">Learn more about the studies</a>
          </div>
        </div>

        <div className="WelcomeBox">
          <h2 className="WelcomeSectionHeader">Example Inquiries</h2>
          <div className="WelcomeSectionContent">
            <ul>
              <li>
                <a href="#">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </a>
              </li>
              <li>
                <a href="#">
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </a>
              </li>
              <li>
                <a href="#">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </a>
              </li>

            </ul>
            <a className="WelcomeBoxLink" href="#">Explore more example inquiries</a>
          </div>
        </div>

        <div className="WelcomeBox">
          <h2 className="WelcomeSectionHeader">Search for</h2>
          <div className="WelcomeSectionContent">
            <div className="SearchContainer">
              <div className="Search">
                <a href="#">
                  <i className="SearchIcon fa fa-male"></i>
                  <div className="SearchIconCaption">Participants</div>
                </a>
              </div>
              <div className="Search">
                <a href="#">
                  <i className="SearchIcon fa fa-home"></i>
                  <div className="SearchIconCaption">Dwelling</div>
                </a>
              </div>
              <div className="Search">
                <a href="#">
                  <i className="SearchIcon fa fa-stethoscope"></i>
                  <div className="SearchIconCaption">Visits</div>
                </a>
              </div>
              <div className="Search">
                <a href="#">
                  <i className="SearchIcon fa fa-bug"></i>
                  <div className="SearchIconCaption">Vectors</div>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
