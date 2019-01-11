import React from 'react';
import './About.scss';

export default function About() {
  return (
    <div id="about">
      <h1>About ClinEpiDB</h1>

      <h2 id="what-is-it">What is it?</h2>
        <div>
          <p>Population-based epidemiological studies provide new opportunities for innovation and collaboration among researchers addressing pressing global-health concerns, however open access to study data pose many challenges. ClinEpiDB, launched in February 2018, is an open-access online resource enabling investigators to maximize the utility and reach of their data and to make optimal use of data released by others.
          </p>
        </div>

      <h2 id="how-was-it-made">How was it made?</h2>
      <div>
        <div>
          <img src="/a/images/ClinEpiDB/ClinEpi_About_page_data_processing.png" />
        </div>
        <p>ClinEpiDB was developed using the existing infrastructure of <a target="_blank" href="https://eupathdb.org">EuPathDB</a>, a collection of databases covering 170+ eukaryotic pathogens, along with relevant free-living and non-pathogenic species and select pathogen hosts, which provides a sophisticated search strategy system enabling complex interrogations of underlying data. Currently, data integration for ClinEpiDB has occurred or is in process for NIH-supported International Centers for Excellence in Malaria Research (ICEMR), the Gates Foundation-supported Malnutrition and Enteric Diseases Network (MAL-ED), and the Global Enteric Multicenter Study (GEMS) projects. Greyed-out cards on the homepage indicate studies that have been loaded into a QA site, but are not yet publicly available. In the process of data integration, a unified semantic web framework has been used to describe data generated from these studies. Over 1500 different data variables about participants, their disease episodes, households, and other potential exposure factors were collected in these clinical epidemiology studies and mapped for web display.
        </p>
        <p>The data is loaded into a GUS4 schema. When combined with the unified semantic web framework and the extensive web toolkit and infrastructure developed by EuPathDB, the user is presented with a point-and-click web interface that provides insight into data distributions and exploratory associations with any observational covariates. Query results can be statistically analyzed and graphically visualized via interactive web applications built in <a target="_blank" href="https://shiny.rstudio.com">Shiny</a> that is launched directly in the ClinEpiDB browser.
        </p>
        <p>As we continue to load datasets, we are also working on expanding our functionality. By developing the ability to query across EuPathDB databases, we plan to allow users to identify samples of interest in ClinEpiDB and match them to molecular data loaded in other EuPathDB database resources such as <a target="_blank" href="http://microbiomedb.org">MicrobiomeDB</a> and <a target="_blank" href="http://plasmodb.org">PlasmoDB</a>, and vice versa.
        </p>
      </div>

      <h2 id="How-do-i-cite-site">How do I cite ClinEpiDB?</h2>
      <div>
        <p>You can reference ClinEpiDB as part of the EuPathDB project <a target="_blank" href="https://www.ncbi.nlm.nih.gov/pubmed/27903906">(Aurrecoechea et al. 2017)</a>.
        </p>
      </div>

      <h2 id="how-do-i-use-site">How do I use ClinEpiDB?</h2>
      <div>
        <p>See our written <a href="/a/showXmlDataContent.do?name=XmlQuestions.Tutorials">Tutorials and Resources</a> and <a target="_blank" href="https://www.youtube.com/playlist?list=PLWzQB3i5sYAIp4urzLGB8jxvVZr6jvkZh">Video Tutorials</a>.
        </p>
      </div>

      <h2 id="Can-i-use-site-to-analyze-my-own-unpublished-data">Can I use ClinEpiDB to analyze my own unpublished data?</h2>
      <div>
        <p>ClinEpiDB does not allow you to load and analyze your own data. However, you can reach out to the ClinEpiDB team at the 'Contact Us' link on the homepage to inquire about having your own data loaded into the site.
        </p>
      </div>

      <h2 id="Can-i-access-code-used-for-site">Can I access code used for ClinEpiDB?</h2>
      <div>
        <p>Yes! Our code is maintained using Subversion, and we welcome input from the community. Check out our <a target="_blank" href="https://cbilsvn.pmacs.upenn.edu/svn/apidb/ClinEpiWebsite/trunk/View/lib/R/shiny/apps/">scripts for each of the Shiny apps</a>.
        </p>
      </div>

      <h2 id="who-is-behind-this-project">Who is behind this project?</h2>
      <div>
        <div>David Roos<sup>1</sup> &mdash; Project PI</div>
        <div>Jessica Kissinger<sup>2</sup> &mdash; Project PI</div>
        <div>Christian J. Stoeckert<sup>3</sup> &mdash; Project PI</div>
        <div>Christiane Hertz-Fowler<sup>4</sup> &mdash; Project PI</div>

        <div style={{ padding: '1em 0' }}>
          <div style={{ textDecoration: 'underline' }}>The EuPathDB Team</div>
          <div>
            Cristina Aurrecoechea<sup>2</sup>,            
            John Brestelli<sup>3</sup>,
            Brian Brunk<sup>1</sup>,            
            Danielle Callan<sup>1</sup>,
            Dave Falke<sup>2</sup>,
            Steve Fischer<sup>4</sup>,
            Omar Harb<sup>1</sup>,
            Danica Helb<sup>1</sup>,
            Jay Humphrey<sup>2</sup>,
            John Judkins<sup>3</sup>,
            Brianna Lindsay<sup>1</sup>,
            Sheena Shah Tomko<sup>1</sup>,
            Jie Zheng<sup>3,5</sup>
          </div>
        </div>

        <ol>
          <li>Department of Biology, University of Pennsylvania, Philadelphia, PA 19104 USA</li>          
          <li>Center for Tropical &amp; Emerging Global Diseases, University of Georgia, Athens, GA 30602 USA</li>
          <li>Department of Genetics, University of Pennsylvania School of Medicine, Philadelphia, PA 19104 USA</li>
          <li>Institute of Integrative Biology, University of Liverpool, UK</li>
          <li>Institute for Biomedical Informatics, University of Pennsylvania, Philadelphia, PA 19104 USA</li>
        </ol>
      </div>

    </div>
  );
}




