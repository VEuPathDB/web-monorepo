import React from 'react';
import './About.scss';

export default function About() {
  return (
    <div id="about">
      <h1>About MicrobiomeDB</h1>

      <h2 id="what-is-it">What is it?</h2>
      <div>
        <p>
          High-throughput sequencing has revolutionized microbiology by allowing
          scientists to complement culture-based approaches with
          culture-independent profiling of complex microbial communities.
          Whether studying these communities in soil, on plants, or in animals,
          the collection of community composition data is often accompanied with
          rich metadata that describes the source from which the sample was
          derived, how samples were treated prior to collection, and how they
          were processed after collection. Increasingly, the goal of microbiome
          experiments is to understand how these various attributes represented
          by the metadata, influence the microbial community. MicrobiomeDB was
          developed as a discovery tool that empowers researchers to fully
          leverage their experimental metadata to construct queries that
          interrogate microbiome datasets.
        </p>
      </div>

      <h2 id="how-was-it-made">How was it made?</h2>
      <div>
        <div>
          <img
            width="60%"
            src="/a/images/MicrobiomeDB/dataLoading_schematic.png"
          />
        </div>
        <p>
          MicrobiomeDB uses an automated pipeline for loading raw fastq files
          from microbiome experiments carried out on the Illumina or 454
          'pyrosequencing' platforms. Raw sequences from each study are
          processed using <a href="https://benjjneb.github.io/dada2/">DADA2</a>{' '}
          and the{' '}
          <a href="http://greengenes.secondgenome.com/">
            Greengenes reference database
          </a>{' '}
          of 16S rDNA sequences
        </p>

        <p>
          In addition to loading taxonomic data, MicrobiomeDB loads all
          'metadata' terms used by the experimenter to describe each sample.
          These terms are mapped to the MIxS ontology and unmapped terms are
          manually curated and used to expand a custom, MIxS-compliant, ontology
          tree. This rich, structured sample description generates an{' '}
          <a href="http://isa-tools.org/">ISA.tab</a> file that is then loaded
          into microbiomeDB. When combined with the extensive web toolkit and
          infrastructure developed by <a href="http://eupathdb.org">EuPathDB</a>
          , the user is provided with an web interface to interrogate complex,
          even massive-scale, microbiome studies using metadata queries. The
          resulting queries are then visualized using a suite of{' '}
          <a href="http://shiny.rstudio.com/">Shiny apps</a> available directly
          in the browser.
        </p>

        <p>
          Although the datasets currently loaded in the site are from 16S rDNA
          marker gene sequencing, we are working on adding functionality for
          handling 'shotgun' metagenomic sequence data, potentially allowing
          interrogation of community composition at the species or strain level,
          looking at other organisms in complex communities (e.g. fungi and
          prokaryotes), as well as identification of samples based on the
          relative abundance of bacterial genes (e.g. antibiotic resistance,
          virulence factors, etc.). Taken together, we hope to develop a
          full-featured, open-source platform for a systems biology view of
          microbial communities.
        </p>
      </div>

      <h2 id="How-do-i-cite-microbiomedb">How do I cite microbiomeDB?</h2>
      <div>
        <p>
          Please cite{' '}
          <a href="https://doi.org/10.1093/nar/gkx1027">
            our recent publication in Nucleic Acids Research
          </a>
        </p>
      </div>

      <h2 id="Where-did-you-get-the-images-on-your-landing-page">
        Where did you get the images on your landing page?
      </h2>
      <div>
        <p>
          Our{' '}
          <a href="https://phil.cdc.gov/Details.aspx?pid=18128">banner image</a>{' '}
          shows methicillin-resistant, Staphylococcus aureus (MRSA) bacteria in
          the process of being ingested by a neutrophil, and our{' '}
          <a href="https://phil.cdc.gov/Details.aspx?pid=18170">icon</a> shows
          Klebsiella pneumoniae interacting with a human neutrophil. Both images
          are courtesy of the National Institute for Allergy and Infectious
          Disease and are free of any copyright restrictions
        </p>
      </div>

      <h2 id="how-do-i-use-microbiomeDB">How do I use microbiomeDB?</h2>
      <div>
        <p>
          The best way to learn about the site is by watching the tutorials on
          our <a href="https://vimeo.com/album/5598563">Vimeo page</a>.
        </p>
      </div>

      <h2 id="Can-i-use-microbiomeDB-to-analyze-my-own-unpublished-data">
        Can I use microbiomeDB to analyze my own unpublished data?
      </h2>
      <div>
        <p>
          Not yet. However, you can reach out to the microbiomeDB team at the
          'Contact Us' link on the homepage to inquire about getting your own
          published data loaded into the site. We are working on developing
          private workspaces that would allow users upload their own data,
          access our tools for filtering, analyzing and visualizing, all while
          keeping their data private. Look for this feature in future releases.
        </p>
      </div>

      <h2 id="Can-i-access-code-used-for-microbiomeDB">
        Can I access code used for microbiomeDB?
      </h2>
      <div>
        <p>
          Yes! Our code is maintained using Git, and we welcome input from the
          community. Checkout our scripts for each of the{' '}
          <a href="https://github.com/EuPathDB/MicrobiomeWebsite/tree/master/View/lib/R/shiny/apps">
            Shiny apps
          </a>
          . In addition, you can access the code we use for running DADA2 on our
          cluster on all samples prior to loading into the site, which consists
          of the following four scripts:
        </p>

        <p>
          <a href="https://github.com/EuPathDB/DJob/tree/master/DistribJobTasks/bin/demuxAndBuildErrorModels.R">
            demuxAndBuildErrorModels.R
          </a>
        </p>

        <p>
          <a href="https://github.com/EuPathDB/DJob/tree/master/DistribJobTasks/bin/merge.R">
            merge.R
          </a>
        </p>

        <p>
          <a href="https://github.com/EuPathDB/DJob/tree/master/DistribJobTasks/bin/runDada.R">
            runDada.R
          </a>
        </p>

        <p>
          <a href="https://github.com/EuPathDB/DJob/tree/master/DistribJobTasks/lib/perl/ASVTableTask.pm">
            ASVTableTask.pm
          </a>
        </p>
      </div>

      <h2 id="who-is-behind-this-project">Who is behind this project?</h2>
      <div>
        <div>
          Daniel Beiting<sup>5</sup> &mdash; Project PI
        </div>
        <div>
          David Roos<sup>4</sup> &mdash; Project co-PI
        </div>

        <div style={{ padding: '1em 0' }}>
          <div style={{ textDecoration: 'underline' }}>The EuPathDB Team</div>
          <div>
            John Brestelli <sup>3</sup>, Danielle Callan <sup>3</sup>, Brianna
            Lindsey <sup>3</sup>, Jie Zheng <sup>2,3</sup>, Shon Cade{' '}
            <sup>3</sup>, Steve Fischer <sup>4</sup>, Cristina Aurrecoechea{' '}
            <sup>1</sup>, Ryan Doherty <sup>3</sup>, Dave Falke <sup>1</sup>,
            Mark Heiges <sup>1</sup>, Christian J. Stoeckert Jr. <sup>3</sup>,
            Jessica Kissinger <sup>1</sup>, Brian Brunk <sup>4</sup>
          </div>
        </div>

        <div style={{ padding: '1em 0' }}>
          <div style={{ textDecoration: 'underline' }}>
            Collaborators outside the USA
          </div>
          <div>
            Gabriel Fernandes <sup>6</sup>
          </div>
          <div>
            Francislon Silva de Oliveira <sup>6</sup>
          </div>
        </div>

        <ol>
          <li>
            Center for Tropical &amp; Emerging Global Diseases, University of
            Georgia, Athens, GA 30602 USA
          </li>
          <li>
            Institute for Biomedical Informatics, University of Pennsylvania,
            Philadelphia, PA 19104 USA
          </li>
          <li>
            Department of Genetics, University of Pennsylvania School of
            Medicine, Philadelphia, PA 19104 USA
          </li>
          <li>
            Department of Biology, University of Pennsylvania, Philadelphia, PA
            19104 USA
          </li>
          <li>
            Department of Pathobiology, University of Pennsylvania,
            Philadelphia, PA 19104 USA
          </li>
          <li>
            Centro de Pesquisas Rene Rachou (Fiocruz Minas), Belo Horizonte,
            Brazil
          </li>
        </ol>
      </div>
    </div>
  );
}
