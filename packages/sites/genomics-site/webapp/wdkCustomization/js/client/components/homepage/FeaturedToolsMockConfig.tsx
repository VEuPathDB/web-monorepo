import { FeaturedToolMetadata } from "./FeaturedTools";

const MOCK_FEATURED_TOOL_ORDER = [ 
  "search-strategies",
  "tour", 
  "analyze",
  "population",
  "pathways",
  "phenotype",
  "genome-browser", 
  "transcriptomic-resources", 
  "tips" 
];

const MOCK_FEATURED_TOOL_ENTRIES = {
  "search-strategies": {
    listIconKey: "search",
    listTitle: "Search Strategies",
    descriptionTitle: "Search Strategies",
    descriptionBody: `
      <div style="display: flex; justify-content: center; align-items: center">  
        ...
      </div>
    `
  },
  "tour": {
    listIconKey: "motorcycle",
    listTitle: "Take a Tour",
    descriptionTitle: "Take a Tour of VEuPathDB",
    descriptionBody: `
      <div style="display: flex; justify-content: center; align-items: center">  
        <iframe width="560" height="315" src="https://www.youtube.com/embed/81nuXyNQP3k" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `
  },
  "analyze": {
    listIconKey: "bar-chart",
    listTitle: "Analyze My Data",
    descriptionTitle: "Analyze My Data",
    descriptionBody: `
      <div style="display: flex; justify-content: center; align-items: center">  
        ...
      </div>
    `
  },
  "population": {
    listIconKey: "globe",
    listTitle: "Population Biology",
    descriptionTitle: "Population Biology",
    descriptionBody: `
      <div style="display: flex; justify-content: center; align-items: center">  
        ...
      </div>
    `
  },  
  "pathways": {
    listIconKey: "share-alt",
    listTitle: "Signalling Pathways",
    descriptionTitle: "Signalling Pathways",
    descriptionBody: `
      <div style="display: flex; justify-content: center; align-items: center">  
        ...
      </div>
    `
  },  
  "phenotype": {
    listIconKey: "flask",
    listTitle: "Phenotype",
    descriptionTitle: "Phenotype",
    descriptionBody: `
      <div style="display: flex; justify-content: center; align-items: center">  
        ...
      </div>
    `
  },  
  "genome-browser": {
    listIconKey: "sliders",
    listTitle: "Genome Browser",
    descriptionTitle: "Genome Browser",
    descriptionBody: `
      <div style="display: flex; justify-content: center; align-items: center">  
        ...
      </div>
    `
  },
  "transcriptomic-resources": {
    listIconKey: "list-ul",
    listTitle: "Transcriptomic Resources",
    descriptionTitle: "Transcriptomic Resources",
    descriptionBody: `
      <p class="card-text">VEuPathDB supports research in transcriptomics. You can:</p>
      <ul class="card-text">
        <li>
          View a list of the <a href="#">32 RNA Seq and Transcriptomics datasets</a> in VEuPathDB.
        </li>
        <li>
          Search for genes by their  <a href="#">RNA-Seq</a>, <a href="#">Microarray</a>, and <a href="#">EST</a> expression profiles. Apply GO term enrichment or metabolic pathway analyses to your result. Or download expression profiles from multiple experiments for the genes in the result.
        </li>
        <li>
          Search for <a href="#">Genes with a Similar Expression Profile</a> to your gene of interest.
        </li>
        <li>
          View integrated transcriptomic data on individual gene pages (ex. <a href="#">PF3D7_1133400</a>). See changes in RNA expression across different lifecycle stages or culture conditions.
        </li>
        <li>
          Add graphical or numeric transcript expression columns to any gene result set.
        </li>
        <li>
          View transcriptomic data mapped to the genome as <a href="#">genome browser tracks</a>, including <a href="#">predicted intron junctions</a>.
        </li>
        <li>
          Analyze your own RNA-Seq data using the <a href="#">VEuPathDB Galaxy instance</a> and then bring your results back to VEuPathDB to use privately in your search strategies.
        </li>
        <li>
          Provide a gene set and <a href="#">find transcriptomic experiments</a> that show similar regulation patterns.
        </li>
      </ul>
    `
  },
  "tips": {
    listIconKey: "lightbulb-o",
    listTitle: "Featured Tip",
    descriptionTitle: "Featured Tip",
    descriptionBody: `
      <div>
        Place to share little tips or vignettes
      </div>
    `
  }
};

export const MOCK_FEATURED_TOOLS_METADATA: FeaturedToolMetadata = {
  toolListOrder: MOCK_FEATURED_TOOL_ORDER,
  toolEntries: MOCK_FEATURED_TOOL_ENTRIES
};
