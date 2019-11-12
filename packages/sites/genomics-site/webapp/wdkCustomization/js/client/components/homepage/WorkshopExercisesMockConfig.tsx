import { ExerciseMetadata } from "./WorkshopExercises";

const MOCK_EXERCISE_LIST_ORDER = [
  'galaxy-rna',
  'functional-genomics',
  'annotation',
  'galaxy-snp',
  'rna-sequence-data-analysis',
  'genome-browser'
];

const MOCK_EXERCISE_ENTRIES = {
  'galaxy-rna': {
    title: 'Galaxy RNA',
    description: `
      <p class="card-text">RNA sequence data analysis via Galaxy.
      </p><ul class="plain">
        <li>Part 1: Uploading data</li>
        <li>Part 2: Starting the workflow</li>
      </ul>
    `,
    url: '#'
  },
  'functional-genomics': {
    title: 'Functional Genomics',
    description: `
      <p class="card-text"></p>
      <ul class="plain">
        <li>Part 1: Transcriptomics, Proteomics, GO Enrichment, Metabolic Pathways</li>
        <li>Part 2: Host response data</li>
      </ul>    
    `,
    url: '#'
  },
  annotation: {
    title: 'Annotation',
    description: `
      <p class="card-text">Using Companion to annotate an assembled genome</p>    
    `,
    url: '#'
  },
  'galaxy-snp': {
    title: "Galaxy SNP",
    description: `
      <p class="card-text">Identifying SNPs using Galaxy</p>
    `,
    url: "#"
  },
  'rna-sequence-data-analysis': {
    title: 'RNA Sequence Data Analysis',
    description: `
      <ul class="plain">
        <li>Part 1a: Cufflinks and Exporting your data to EuPathDB</li>
        <li>Part 1b: Viewing and analyzing your results</li>
      </ul>
    `,
    url: '#'
  },
  'genome-browser': {
    title: 'Genome Browser',
    description: `
      <ul class="plain">
        <li>Part 1: Alignments and Comparative Genomics</li>
        <li>Part 2: Interpreting RNAseq data</li>
      </ul>    
    `,
    url: '#'
  }
};

export const MOCK_EXERCISE_METADATA: ExerciseMetadata = {
  exerciseListOrder: MOCK_EXERCISE_LIST_ORDER,
  exerciseEntries: MOCK_EXERCISE_ENTRIES
};
