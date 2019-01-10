import React from 'react';
import './About.scss';

export default function About() {
  return (
    <div id="about">
      <h1>About ClinEpiDB</h1>

      <h2 id="what-is-it">What is it?</h2>
        <div>
          <p>BLABLA
          </p>
        </div>

      <h2 id="how-was-it-made">How was it made?</h2>
      <div>
        <div>
          IMAGE
        </div>
        <p>BLABLA
        </p>
        <p>BLABLA
        </p>
        <p>BLABLA
        </p>
      </div>

      <h2 id="How-do-i-cite-site">How do I cite ClinEpiDB?</h2>
      <div>
        <p>BLABLA
        </p>
      </div>

      <h2 id="Where-did-you-get-the-images-on-your-landing-page">Where did you get the images on your landing page?</h2>
      <div>
        <p>BLABLA
        </p>
      </div>

      <h2 id="how-do-i-use-site">How do I use ClinEpiDB?</h2>
      <div>
        <p>BLABLA
        </p>
      </div>

      <h2 id="Can-i-use-site-to-analyze-my-own-unpublished-data">Can I use ClinEpiDB to analyze my own unpublished data?</h2>
      <div>
        <p>BLABLA
        </p>
      </div>

      <h2 id="Can-i-access-code-used-for-site">Can I access code used for ClinEpiDB?</h2>
      <div>
        <p>BLABLA
        </p>
          <p><a href="https://cbilsvn.pmacs.upenn.edu/svn/gus/DJob/trunk/DistribJobTasks/bin/demuxAndBuildErrorModels.R">demuxAndBuildErrorModels.R</a></p> 
      </div>

      <h2 id="who-is-behind-this-project">Who is behind this project?</h2>
      <div>
        <div>John Doe<sup>5</sup> &mdash; Project PI</div>

        <div style={{ padding: '1em 0' }}>
          <div style={{ textDecoration: 'underline' }}>The EuPathDB Team</div>
          <div>
            John Brestelli <sup>3</sup>,
            Danielle Callan <sup>3</sup>,
            Brianna Lindsey <sup>3</sup>,
            Jie Zheng <sup>2,3</sup>,
            Shon Cade <sup>3</sup>,
            Steve Fischer <sup>4</sup>,
            Cristina Aurrecoechea <sup>1</sup>,
            Ryan Doherty <sup>3</sup>,
            Dave Falke <sup>1</sup>,
            Mark Heiges <sup>1</sup>,
            Christian J. Stoeckert Jr. <sup>3</sup>,
            Jessica Kissinger <sup>1</sup>,
            Brian Brunk <sup>4</sup>
          </div>
        </div>

        <ol>
          <li>Center for Tropical &amp; Emerging Global Diseases, University of Georgia, Athens, GA 30602 USA</li>
          <li>Institute for Biomedical Informatics, University of Pennsylvania, Philadelphia, PA 19104 USA</li>
          <li>Department of Genetics, University of Pennsylvania School of Medicine, Philadelphia, PA 19104 USA</li>
          <li>Department of Biology, University of Pennsylvania, Philadelphia, PA 19104 USA</li>
          <li>Department of Pathobiology, University of Pennsylvania, Philadelphia, PA 19104 USA</li>

        </ol>
      </div>

    </div>
  );
}
