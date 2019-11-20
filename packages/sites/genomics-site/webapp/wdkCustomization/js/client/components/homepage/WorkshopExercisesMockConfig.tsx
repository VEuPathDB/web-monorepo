import { CardMetadata } from './WorkshopExercises';

const MOCK_CARD_ORDER = [
  "Genome Browser",
  "RNA Sequencing Data Analysis",
  "Variant Calling",
  "Orthology and phylogenetics",
  "Motifs and Domains and colocation",
  "Functional Genomics"
];

const FILL_ME_IN = 'FILL ME IN';

const MOCK_CARD_ENTRIES = {
  "Genome Browser" : {
    "title": "Genome Browser",
    "description": FILL_ME_IN,
    "exercises": [
        {
          "title": "Genome browser basics",
          "url": "https://workshop.eupathdb.org/workshops/athens/2019/exercises/2_Browser_Exercises-I.pdf",
          "description": "pdf"
        }
    ]
  },
  "RNA Sequencing Data Analysis": {
    "title": "RNA Sequencing Data Analysis",
    "description": FILL_ME_IN,
    "exercises": [
        {
          "title": "Analyzing RNAseq data in VEuPathDB Galaxy (Part 1)",
          "url": "https://workshop.eupathdb.org/workshops/athens/2019/exercises/RNAseq_Mapping_Galaxy_1.pdf",
          "description": "pdf"
        },
        {
          "title": "Analyzing RNAseq data in VEuPathDB Galaxy (Part 2)",
          "url": "https://workshop.eupathdb.org/workshops/athens/2019/exercises/RNAseq_mapping_Galaxy2.pdf",
          "description": "pdf"
        }
    ]
  },
  "Variant Calling": {
    "title": "Variant Calling",
    "description": FILL_ME_IN,
    "exercises": [
        {
          "title": "Variant calling in VEuPathDB galaxy (Part 1)",
          "url": "https://workshop.eupathdb.org/workshops/athens/2019/exercises/Variant_Calling_Galaxy1.pdf",
          "description": "pdf"
        },
        {
          "title": "Variant calling in VEuPathDB galaxy (Part 2)",
          "url": "https://workshop.eupathdb.org/workshops/athens/2019/exercises/Variant_Calling_Galaxy2.pdf",
          "description": "pdf"
        }
    ]
  },
  "Orthology and phylogenetics": {
    "title": "Orthology and phylogenetics",
    "description": FILL_ME_IN,
    "exercises": [
        {
          "title": "Orthology and phylogenetic profile searches",
          "url": "https://workshop.eupathdb.org/workshops/athens/2019/exercises/Orthology_Phyletic_Patterns.pdf",
          "description": "pdf"
        }
    ]
  },
  "Motifs and Domains and colocation": {
    "title": "Motifs and Domains and colocation",
    "description": FILL_ME_IN,
    "exercises": [
        {
          "title": "Motifs, domains and colocation",
          "url": "https://workshop.eupathdb.org/workshops/athens/2019/exercises/Motif%20Searches_RegularExpressions.pdf",
          "description": "pdf"
        }
    ]
  },
  "Functional Genomics": {
    "title": "Functional Genomics",
    "description": FILL_ME_IN,
    "exercises": [
        {
          "title": "Functional genomics exercises",
          "url": "https://workshop.eupathdb.org/workshops/athens/2019/exercises/FunctionalGenomicsI.pdf",
          "description": "pdf"
        }
    ]
  }
};

export const MOCK_EXERCISE_METADATA: CardMetadata = {
  cardOrder: MOCK_CARD_ORDER,
  cardEntries: MOCK_CARD_ENTRIES
};
