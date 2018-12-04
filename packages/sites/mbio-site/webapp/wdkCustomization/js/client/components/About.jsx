import React from 'react';
import './About.scss';

export default function About() {
  return (
    <div id="about">
      <h1>About MicrobiomeDB</h1>

      <h2 id="what-is-it">What is it?</h2>
      <div>
        <p>
          High-throughput sequencing has revolutionized microbiology by allowing scientists to complement culture-based approaches with culture-independent profiling of complex microbial communities.  Whether studying these communities in soil, on plants, or in animals, the collection of community composition data is often accompanied with rich metadata that describes the source from which the sample was derived, how samples were treated prior to collection, and how they were processed after collection.  Increasingly, the goal of microbiome experiments is to understand how these various attributes represented by the metadata, influence the microbial community.  MicrobiomeDB was developed as a discovery tool that empowers researchers to fully leverage their experimental metadata to construct queries that interrogate microbiome datasets.
        </p>
      </div>

      <h2 id="how-was-it-made">How was it made?</h2>
      <div>
        <div>
          <img width="60%" src="/a/images/MicrobiomeDB/dataLoading_schematic.png"/>
        </div>
        <p>MicrobiomeDB uses an automated pipeline for loading raw fastq files from microbiome experiments carried out on the Illumina or 454 'pyrosequencing' platforms.  Raw sequences from each study are processed using <a href="https://benjjneb.github.io/dada2/">DADA2</a> and the <a href="https://benjjneb.github.io/dada2/">Greengenes reference database</a> of 16S rDNA sequences</p>

        <p>Although taxa abundance tables and diversity metrics are useful, the real power of MicrobiomeDB comes from the fact that all the 'metadata' terms used by the experimenter to describe each sample are also extracted from the .biom file.  These terms are mapped to the MIxS ontology and unmapped terms are manually curated and used to expand a custom, MIxS-compliant, ontology tree.  This rich, structured sample description generates an <a href="http://isa-tools.org/">ISA.tab</a> file that is then loaded into microbiomeDB.  When combined with the extensive web toolkit and infrastructure developed by <a href="http://eupathdb.org">EuPathDB</a>, the user is provided with an web interface to interrogate complex, even massive-scale, microbiome studies using metadata queries.  The resulting queries are then visualized using <a href="http://shiny.rstudio.com/">Shiny app</a> plug-ins available directly in the browser.</p>

        <p>In its current state, MicrobiomeDB is a 'first-pass' example of microbiome data mining.  We envision significantly expanding our pipeline to include loading additional 16S rRNA databases, metadata that describe taxa (i.e. basic microbiological properties), as well as bacterial metabolic pathway databases (i.e. KEGG), and much more.  Although the experimental datasets currently loaded are from 16S rRNA marker gene sequencing, our pipeline would also accommodate similarly formatted, taxa abundance data from shotgun metagenomic studies, and future functionality could allow loading tables of bacterial gene expression data derived from these studies.  Taken together, we hope to develop a full-featured, open-source platform for a systems biology view of microbial communities.</p>
      </div>

      <h2 id="how-do-i-use-it">How do I use it?</h2>
      <div>
        <p>
          See the <a href="https://docs.google.com/document/u/1/d/1a_9lPf5lV0fTW1VcA48pGsnFAcwhMOWqCTQlyHEVoAQ/pub">Learn How</a> guide.
        </p>
      </div>

      <h2 id="who-is-behind-this">Who is behind this?</h2>
      <div>
        <div>Daniel Beiting<sup>5</sup> &mdash; Project PI</div>
        <div>David Roos<sup>4</sup> &mdash; Project co-PI</div>

        <div style={{ padding: '1em 0' }}>
          <div style={{ textDecoration: 'underline' }}>The EuPathDB Team</div>
          <div>
            John Brestelli <sup>3</sup>,
            Shon Cade <sup>3</sup>,
            Steve Fischer <sup>4</sup>,
            Cristina Aurrecoechea <sup>1</sup>,
            Ryan Doherty <sup>3</sup>,
            Dave Falke <sup>1</sup>,
            Mark Heiges <sup>1</sup>,
            Christian J. Stoeckert Jr. <sup>3</sup>,
            Jie Zheng <sup>2,3</sup>,
            Jessica Kissinger <sup>1</sup>,
            Brian Brunk <sup>4</sup>
          </div>
        </div>

        <div style={{ padding: "1em 0" }}>
          <div style={{ textDecoration: "underline" }}>Collaborators outside the USA</div>
          <div>Gabriel Fernandes <sup>6</sup></div>
          <div>Francislon Silva de Oliveira <sup>6</sup></div>
        </div>

        <ol>
          <li>Center for Tropical &amp; Emerging Global Diseases, University of Georgia, Athens, GA 30602 USA</li>
          <li>Institute for Biomedical Informatics, University of Pennsylvania, Philadelphia, PA 19104 USA</li>
          <li>Department of Genetics, University of Pennsylvania School of Medicine, Philadelphia, PA 19104 USA</li>
          <li>Department of Biology, University of Pennsylvania, Philadelphia, PA 19104 USA</li>
          <li>Department of Pathobiology, University of Pennsylvania, Philadelphia, PA 19104 USA</li>
          <li>Centro de Pesquisas Rene Rachou (Fiocruz Minas), Belo Horizonte, Brazil</li>
        </ol>
      </div>

    </div>
  );
}
